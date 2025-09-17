// utils/classification.js

export function getHPIClassification(hpi) {
  if (hpi <= 100) return 'Low pollution';
  if (hpi <= 200) return 'Medium pollution';
  return 'High pollution';
}

export function getHEIClassification(hei) {
  if (hei < 10) return 'Low pollution';
  if (hei >= 10 && hei < 20) return 'Medium pollution';
  return 'High pollution';
}