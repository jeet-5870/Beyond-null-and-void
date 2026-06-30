import fs from 'fs';
import csv from 'csv-parser';
import prisma from '../db/prismaClient.js';
import { calculateHPI, calculateHEI, calculatePLI, calculateMPI, calculateCF } from '../utils/formulaEngine.js';
import { getHPIClassification } from '../utils/classification.js';
import { kmeans } from 'ml-kmeans';
import { logger } from '../config/logger.js';

const METAL_HEADER_MAP = {
  Lead_Concentration: 'Pb',
  Mercury_Concentration: 'Hg',
  Arsenic_Concentration: 'As',
};

function getMeanAndStdDev(values) {
  if (!values || values.length === 0) return { mean: 0, stdDev: 0 };
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
  return { mean, stdDev: Math.sqrt(variance) };
}

export const processUploadData = async (filePath, historicalDate, userId) => {
  const rowsByLocation = {};
  const generatedAlerts = [];
  let insertedSamples = 0;

  // 1. Read and parse the CSV asynchronously
  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (!row.location || !row.lat || !row.lng) return;
        const key = `${row.location}_${row.lat}_${row.lng}`;
        if (!rowsByLocation[key]) rowsByLocation[key] = [];

        Object.entries(METAL_HEADER_MAP).forEach(([header, metalName]) => {
          if (row[header] !== undefined) {
            rowsByLocation[key].push({
              location: row.location,
              lat: parseFloat(row.lat),
              lng: parseFloat(row.lng),
              district: row.district || row.location,
              state: row.state || 'N/A',
              metal_name: metalName,
              concentration: parseFloat(row[header]),
            });
          }
        });
      })
      .on('end', resolve)
      .on('error', reject);
  });

  // 2. Fetch limits and standard maps
  const standardsList = await prisma.metalStandard.findMany();
  const metalStandards = {};
  standardsList.forEach(s => {
    metalStandards[s.metal_name] = { mac: s.mac_ppm, standard: s.standard_ppm };
  });

  if (Object.keys(metalStandards).length === 0) {
    throw new Error('No baseline metal standards populated in the database.');
  }

  const sampleDate = historicalDate ? new Date(historicalDate) : new Date();
  const currentMonth = sampleDate.getMonth() + 1;

  // 3. Process records via isolation transactions
  for (const metals of Object.values(rowsByLocation)) {
    const { location, lat, lng, district, state } = metals[0];

    const result = await prisma.$transaction(async (tx) => {
      // Find or create location record
      let locRecord = await tx.location.findUnique({ where: { name: location } });
      if (!locRecord) {
        locRecord = await tx.location.create({
          data: { name: location, latitude: lat, longitude: lng, district, state }
        });
      }

      // Append sample tracking node
      const sampleRecord = await tx.sample.create({
        data: {
          location_id: locRecord.location_id,
          user_id: userId ? parseInt(userId) : null,
          sample_date: sampleDate,
          source_type: 'Groundwater',
          notes: 'Asynchronous background CSV ingestion'
        }
      });

      const concentrations = [];
      const hpiStandards = [];
      const heiStandards = [];
      const cfArray = [];

      for (const m of metals) {
        const std = metalStandards[m.metal_name];
        if (!std) throw new Error(`Standard threshold mapping missing for: ${m.metal_name}`);

        concentrations.push(m.concentration);
        hpiStandards.push(std.standard);
        heiStandards.push(std.mac);
        cfArray.push(calculateCF(m.concentration, std.mac));

        await tx.metalConcentration.create({
          data: {
            sample_id: sampleRecord.sample_id,
            metal_name: m.metal_name,
            concentration_ppm: m.concentration
          }
        });
      }

      // Calculate indices using mathematical formula engine
      const hpi = calculateHPI(concentrations, hpiStandards);
      const hei = calculateHEI(concentrations, heiStandards);
      const pli = calculatePLI(concentrations, heiStandards);
      const mpi = calculateMPI(concentrations);

      // Evaluate historical seasonal anomalies via Z-Score calculation
      let isAnomaly = hpi > 200; 

      const historicalConcs = await tx.metalConcentration.findMany({
        where: {
          sample: {
            location_id: locRecord.location_id,
            sample_date: {
              gte: new Date(new Date().setFullYear(new Date().getFullYear() - 5)) 
            }
          }
        },
        include: { sample: true }
      });

      const seasonalHistory = { Pb: [], Hg: [], As: [] };
      historicalConcs.forEach(hc => {
        if (new Date(hc.sample.sample_date).getMonth() + 1 === currentMonth && seasonalHistory[hc.metal_name]) {
          seasonalHistory[hc.metal_name].push(hc.concentration_ppm);
        }
      });

      metals.forEach(m => {
        const history = seasonalHistory[m.metal_name] || [];
        if (history.length >= 3) {
          const { mean, stdDev } = getMeanAndStdDev(history);
          if (stdDev > 0 && Math.abs((m.concentration - mean) / stdDev) > 2.5) {
            isAnomaly = true;
          }
        }
      });

      // Handle spatial classification clustering dynamically via ml-kmeans
      let clusterId = 1;
      const staticHistory = await tx.pollutionIndex.findMany({
        take: 50,
        orderBy: { computed_on: 'desc' }
      });

      if (staticHistory.length >= 5) {
        const dataMatrix = staticHistory.map(sh => [sh.hpi, sh.hei, sh.pli]);
        dataMatrix.push([hpi, hei, pli]);
        try {
          const clusterResult = kmeans(dataMatrix, Math.min(3, dataMatrix.length), { initialization: 'kmeans++' });
          clusterId = clusterResult.clusters[dataMatrix.length - 1] + 1;
        } catch (err) {
          clusterId = Math.floor(Math.random() * 3) + 1;
        }
      }

      await tx.pollutionIndex.create({
        data: {
          sample_id: sampleRecord.sample_id,
          hpi,
          hei,
          pli,
          mpi,
          cf: cfArray,
          is_anomaly: isAnomaly,
          cluster_id: clusterId
        }
      });

      return { location, hpi, isAnomaly, classification: getHPIClassification(hpi) };
    });

    insertedSamples++;

    if (result.isAnomaly) {
      generatedAlerts.push({
        location: result.location,
        hpi: result.hpi,
        message: `CRITICAL anomaly detected at ${result.location}. HPI score calculated: ${result.hpi.toFixed(2)}. Out of safety margins.`,
        timestamp: new Date().toISOString()
      });
    }
  }

  // File cleanup safely after parsing is complete
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  return { insertedSamples, alerts: generatedAlerts };
};
