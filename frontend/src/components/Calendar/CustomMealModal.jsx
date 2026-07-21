import { useState, useEffect } from 'react';

export default function CustomMealModal({ isOpen, onClose, onSave, mealSection, defaultPrompt }) {
  const [promptText, setPromptText] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      setPromptText(defaultPrompt || '');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen, defaultPrompt]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!promptText.trim()) return;

    onSave(promptText.trim());
    setPromptText('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Replace {mealSection} with AI</h3>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            &#x2715;
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
          <div className="modal-body">
            <p style={{ fontSize: '13px', color: 'var(--text)', margin: '0 0 16px 0', textAlign: 'left', lineHeight: '1.4' }}>
              What would you like to eat instead? The AI will calculate exact portions to match your calorie goal for this meal.
            </p>
            <div className="form-group">
              <textarea 
                className="form-control" 
                rows="4"
                placeholder="e.g. Greek salad with tuna instead of rice..." 
                value={promptText} 
                onChange={(e) => setPromptText(e.target.value)}
                required 
                style={{ resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Send to AI
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}