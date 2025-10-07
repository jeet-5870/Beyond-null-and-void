// backend/utils/classification.js

export function getHPIClassification(hpi) {
  // 🔑 FIX: Changed classification strings to match frontend badge component logic
  if (hpi <= 100) return 'Safe'; // Changed 'Non pollution' to 'Safe'
  if (hpi <= 200) return 'Polluted'; // Changed 'Low pollution' to 'Polluted'
  return 'Highly Polluted'; // Changed 'High pollution' to 'Highly Polluted'
}
// 🔑 REMOVED: getHEIClassification as classification is HPI-only