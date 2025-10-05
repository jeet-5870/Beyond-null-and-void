// utils/classification.js

export function getHPIClassification(hpi) {
  if (hpi <= 100) return 'Non pollution';
  if (hpi <= 200) return 'Low pollution';
  return 'High pollution';
}

export function getHEIClassification(hei) {
  if (hei >= 20) return 'Highly Polluted';
  if (hei >= 10) return 'Polluted';
  return 'Safe';
}