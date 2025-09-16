// utils/formulaEngine.js

/**
 * Contamination Factor (CF) = Measured / Standard
 */
function calculateCF(concentration, standard) {
  return +(concentration / standard).toFixed(3);
}

/**
 * Pollution Load Index (PLI) = (CF1 * CF2 * ... * CFn)^(1/n)
 */
function calculatePLI(cfArray) {
  const product = cfArray.reduce((acc, val) => acc * val, 1);
  return +(Math.pow(product, 1 / cfArray.length).toFixed(3));
}

/**
 * Heavy Metal Pollution Index (HPI)
 * HPI = Σ(Qi * Wi) / ΣWi
 * Qi = (Mi / Si) * 100
 * Wi = 1 / Si
 */
function calculateHPI(concentrations, standards) {
  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < concentrations.length; i++) {
    const Mi = concentrations[i];
    const Si = standards[i];
    const Qi = (Mi / Si) * 100;
    const Wi = 1 / Si;

    numerator += Qi * Wi;
    denominator += Wi;
  }

  return +(numerator / denominator).toFixed(3);
}

/**
 * Metal Pollution Index (MPI) = (M1 * M2 * ... * Mn)^(1/n)
 */
function calculateMPI(concentrations) {
  const product = concentrations.reduce((acc, val) => acc * val, 1);
  return +(Math.pow(product, 1 / concentrations.length).toFixed(3));
}

export {
  calculateCF,
  calculatePLI,
  calculateHPI,
  calculateMPI,
};
