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
 * Wi = 1 / Si (Inverse weighting for HPI calculation)
 */
function calculateHPI(concentrations, standards) {
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
    // Inverse weighting specifically for HPI formulation
    const Wi = 1 / Si;

    numerator += Qi * Wi;
    denominator += Wi;
  }

  if (denominator === 0) {
    return 0;
  }

  return +(numerator / denominator).toFixed(3);
}


// Private reusable mathematical helper
const calculateGeometricMean = (arr) => {
  if (!arr || arr.length === 0) return 0;
  const product = arr.reduce((acc, val) => acc * val, 1);
  return +(Math.pow(product, 1 / arr.length).toFixed(3));
};

function calculatePLI(concentrations, standards) {
  const cfArray = concentrations.map((c, i) => calculateCF(c, standards[i]));
  return calculateGeometricMean(cfArray);
}

function calculateMPI(concentrations) {
  return calculateGeometricMean(concentrations);
}


export {
  calculateCF,
  calculatePLI,
  calculateHPI,
  calculateMPI,
  calculateHEI
};
