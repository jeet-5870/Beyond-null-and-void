/**
 * Contamination Factor (CF) = Measured / Standard
 */
function calculateCF(concentration, standard) {
  if (standard === 0) {
    return 0;
  }
  return +(concentration / standard).toFixed(3);
}

/**
 * Pollution Load Index (PLI) = (CF1 * CF2 * ... * CFn)^(1/n)
 */
function calculatePLI(cfArray) {
  if (cfArray.length === 0) return 0;
  const product = cfArray.reduce((acc, val) => acc * val, 1);
  return +(Math.pow(product, 1 / cfArray.length).toFixed(3));
}

/**
 * Heavy Metal Evaluation Index (HEI)
 * HEI = Σ(Hci / Maci)
 */
function calculateHEI(concentrations, standards) {
  let hei = 0;

  if (concentrations.length !== standards.length) {
    throw new Error("Concentrations and standards arrays must have the same length.");
  }

  for (let i = 0; i < concentrations.length; i++) {
    const Hci = concentrations[i];
    const Maci = standards[i];

    if (Maci === 0) {
      console.warn(`Warning: Standard for metal at index ${i} is 0. Skipping this metal.`);
      continue;
    }

    hei += Hci / Maci;
  }

  return +hei.toFixed(3);
}

/**
 * Heavy Metal Pollution Index (HMPI)
 * HMPI = Σ(Wi * Qi) / ΣWi
 */
function calculateHMPI(concentrations, standards) {
  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < concentrations.length; i++) {
    const Mi = concentrations[i];
    const Si = standards[i];

    if (Si === 0) {
      console.warn(`Warning: Standard for metal at index ${i} is 0. Skipping this metal.`);
      continue;
    }

    const Qi = (Mi / Si) * 100;
    const Wi = 1 / Si;

    numerator += Qi * Wi;
    denominator += Wi;
  }

  if (denominator === 0) {
    return 0;
  }

  return +(numerator / denominator).toFixed(3);
}

/**
 * Metal Pollution Index (MPI) = (M1 * M2 * ... * Mn)^(1/n)
 */
function calculateMPI(concentrations) {
    if (concentrations.length === 0) return 0;
  const product = concentrations.reduce((acc, val) => acc * val, 1);
  return +(Math.pow(product, 1 / concentrations.length).toFixed(3));
}

export {
  calculateCF,
  calculatePLI,
  calculateHMPI,
  calculateMPI,
  calculateHEI
};