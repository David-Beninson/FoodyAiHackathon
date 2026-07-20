import { useState } from 'react';

export default function CustomMealModal({ isOpen, onClose, onSave, mealSection }) {
  const [promptText, setPromptText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!promptText.trim()) return;

    setIsLoading(true);
    // מדמים קריאה ל-AI (או מעבירים את הטקסט החופשי לשמירה)
    setTimeout(() => {
      onSave({
        prompt: promptText.trim(),
        name: `Custom ${mealSection} (AI Adjusted)`,
      });
      setIsLoading(false);
      setPromptText('');
      onClose();
    }, 600);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3 className="modal-title">Replace {mealSection} with AI</h3>
        <p style={{ fontSize: '13px', color: 'var(--text)', margin: '0 0 8px 0', textAlign: 'left' }}>
          What would you like to eat instead? The AI will calculate exact portions to match your calorie goal for this meal.
        </p>
        
        <form onSubmit={handleSubmit} className="modal-form">
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

          <div className="modal-actions-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Generating with AI...' : '✨ Send to AI'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}