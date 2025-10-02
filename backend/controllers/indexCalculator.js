import { calculateCF, calculatePLI, calculateHPI, calculateMPI } from '../utils/formulaEngine.js';

export function computeIndices(req, res) {
  const { concentrations, standards } = req.body;

  const cfArray = concentrations.map((c, i) => calculateCF(c, standards[i]));
  const pli = calculatePLI(cfArray);
  const hpi = calculateHPI(concentrations, standards);
  const mpi = calculateMPI(concentrations);

  res.json({ CF: cfArray, PLI: pli, HPI: hpi, MPI: mpi });
}