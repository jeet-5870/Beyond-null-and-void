// backend/utils/classification.js

export function getHPIClassification(hpi) {
  if (hpi <= 100) return 'Safe'; 
  if (hpi <= 200) return 'Polluted';
  return 'Highly Polluted';
}
