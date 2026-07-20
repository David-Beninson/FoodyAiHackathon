import { useState } from 'react';

export default function CustomMealModal({ isOpen, onClose, onSave, mealSection }) {
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name: mealName || `Custom ${mealSection}`,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fats: Number(fats) || 0,
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3 className="modal-title">Add Custom Meal ({mealSection})</h3>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Meal Name</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. My Custom Salad" 
              value={mealName} 
              onChange={(e) => setMealName(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Calories (kcal)</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="0" 
                value={calories} 
                onChange={(e) => setCalories(e.target.value)}
                required 
              />
            </div>
            <div className="form-group">
              <label>Protein (g)</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="0" 
                value={protein} 
                onChange={(e) => setProtein(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Carbs (g)</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="0" 
                value={carbs} 
                onChange={(e) => setCarbs(e.target.value)}
                required 
              />
            </div>
            <div className="form-group">
              <label>Fats (g)</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="0" 
                value={fats} 
                onChange={(e) => setFats(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="modal-actions-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Custom Meal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}