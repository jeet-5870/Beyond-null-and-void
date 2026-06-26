import { calculateCF, calculatePLI, calculateHPI, calculateMPI, calculateHEI } from '../utils/formulaEngine.js';

export function computeIndices(req, res) {
  const { concentrations, standards } = req.body;

  if (!Array.isArray(concentrations) || !Array.isArray(standards) || concentrations.length !== standards.length) {
    return res.status(400).json({ error: "Concentrations and standards must be arrays of matching lengths." });
  }

  const cfArray = concentrations.map((c, i) => calculateCF(c, standards[i]));
  const pli = calculatePLI(concentrations, standards);
  const hpi = calculateHPI(concentrations, standards);
  const hei = calculateHEI(concentrations, standards);
  const mpi = calculateMPI(concentrations);

  res.json({ CF: cfArray, PLI: pli, HPI: hpi, MPI: mpi, HEI: hei });
}
