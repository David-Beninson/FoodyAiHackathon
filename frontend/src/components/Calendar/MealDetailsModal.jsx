import { useState } from 'react';
import LoadingSpinner from '../Common/LoadingSpinner';

export default function MealDetailsModal({ isOpen, meal, onClose, onToggleFavorite, onRegenerate }) {
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);



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

  const buttonStyle = {
    padding: '10px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    flex: 1
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    setIsSubmitting(true);
    try {
      await onRegenerate(promptText.trim());
      setPromptText('');
      setIsEditingCustom(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = () => {
    if (!isSubmitting) onClose();
  };

  return (
    <div style={modalOverlayStyle} onClick={handleOverlayClick}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <button style={closeBtnStyle} onClick={onClose} disabled={isSubmitting}>✕</button>
        
        {isSubmitting ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
            <LoadingSpinner message="Generating new meal..." />
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', textAlign: 'left' }}>
              {meal.title}
            </h2>
            
            <p style={{ fontSize: '14px', color: '#555', marginBottom: '20px', textAlign: 'left', lineHeight: '1.4' }}>
              {meal.description}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#f9f9f9', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
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

            {onRegenerate && (
              <div style={{ borderTop: '1px solid #eee', paddingTop: '16px' }}>
                {!isEditingCustom ? (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => setIsEditingCustom(true)}
                      style={{ ...buttonStyle, backgroundColor: '#f2f2f7', color: '#007aff' }}
                    >
                      ✨ Custom (AI)
                    </button>
                    <button 
                      onClick={async () => {
                        setIsSubmitting(true);
                        try {
                          await onRegenerate(null);
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setIsSubmitting(false);
                        }
                      }}
                      style={{ ...buttonStyle, backgroundColor: '#007aff', color: '#fff' }}
                    >
                      🔄 Regenerate
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCustomSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <textarea 
                      className="form-control"
                      rows="3"
                      placeholder="e.g. Greek salad with tuna instead of rice..."
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      required
                      style={{ 
                        resize: 'none', 
                        fontFamily: 'inherit',
                        width: '100%',
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        boxSizing: 'border-box'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        type="button" 
                        onClick={() => setIsEditingCustom(false)}
                        style={{ ...buttonStyle, backgroundColor: '#f2f2f7', color: '#555' }}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        style={{ ...buttonStyle, backgroundColor: '#007aff', color: '#fff' }}
                      >
                        ✨ Send to AI
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </>
        )}
      </div>
      <button onClick={()=>onToggleFavorite()}> test </button>
    </div>
  );
}