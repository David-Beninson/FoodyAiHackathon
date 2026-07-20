export default function MealDetailsModal({ isOpen, meal, onClose }) {
  if (!isOpen || !meal) return null;

  // Inline styling strictly for rapid integration in the hackathon layout
  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const modalContentStyle = {
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '400px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    position: 'relative',
    color: '#000'
  };

  const closeBtnStyle = {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#999'
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <button style={closeBtnStyle} onClick={onClose}>✕</button>
        
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', textAlign: 'left' }}>
          {meal.title}
        </h2>
        
        <p style={{ fontSize: '14px', color: '#555', marginBottom: '20px', textAlign: 'left', lineHeight: '1.4' }}>
          {meal.description}
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#f9f9f9', padding: '12px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'between', fontSize: '14px' }}>
            <span>🔥 Calories:</span>
            <span style={{ fontWeight: '600', marginLeft: 'auto' }}>{meal.calories} kcal</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'between', fontSize: '14px' }}>
            <span>🥩 Protein:</span>
            <span style={{ fontWeight: '600', marginLeft: 'auto' }}>{meal.protein}g</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'between', fontSize: '14px' }}>
            <span>🍞 Carbs:</span>
            <span style={{ fontWeight: '600', marginLeft: 'auto' }}>{meal.carbs}g</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'between', fontSize: '14px' }}>
            <span>🥑 Fat:</span>
            <span style={{ fontWeight: '600', marginLeft: 'auto' }}>{meal.fats}g</span>
          </div>
        </div>
      </div>
    </div>
  );
}