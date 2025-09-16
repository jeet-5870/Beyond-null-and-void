function SafetyBadge({ data }) {
  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      {data.map((item) => (
        <div key={item.location} style={{
          padding: '10px',
          borderRadius: '8px',
          backgroundColor:
            item.classification === 'Safe' ? '#a8e6cf' :
            item.classification === 'Moderate' ? '#ffd3b6' : '#ff8b94',
        }}>
          <strong>{item.location}</strong><br />
          {item.classification}
        </div>
      ))}
    </div>
  );
}
export default SafetyBadge;
