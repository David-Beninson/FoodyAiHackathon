export default function MealCard({
  mealType,
  meal,
  isEditing,
  editForm,
  setEditForm,
  onStartEdit,
  onCancelEdit,
  onConfirmEdit,
  onSwap
}) {
  return (
    <div className="meal-card-item">
      <div className="meal-card-header">
        <span className="meal-type-label">
          {mealType}
        </span>

        {!isEditing && (
          <div className="meal-actions">
            <button
              onClick={onStartEdit}
              className="btn btn-small"
            >
              Edit
            </button>
            <button
              onClick={onSwap}
              className="btn btn-small"
            >
              Swap
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="meal-editor-form">
          <div className="form-group">
            <label>Meal Name</label>
            <input
              type="text"
              className="form-control"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Instructions/Description</label>
            <textarea
              className="form-control"
              rows={2}
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            />
          </div>
          <div className="macros-grid">
            <div className="form-group">
              <label>Calories</label>
              <input
                type="number"
                className="form-control"
                value={editForm.calories}
                onChange={(e) => setEditForm({ ...editForm, calories: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Protein (g)</label>
              <input
                type="number"
                className="form-control"
                value={editForm.protein}
                onChange={(e) => setEditForm({ ...editForm, protein: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Carbs (g)</label>
              <input
                type="number"
                className="form-control"
                value={editForm.carbs}
                onChange={(e) => setEditForm({ ...editForm, carbs: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Fats (g)</label>
              <input
                type="number"
                className="form-control"
                value={editForm.fat}
                onChange={(e) => setEditForm({ ...editForm, fat: e.target.value })}
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={onCancelEdit}>Cancel</button>
            <button className="btn btn-primary" onClick={onConfirmEdit}>Confirm</button>
          </div>
        </div>
      ) : (
        <>
          <h3 className="meal-title">
            {meal.name}
          </h3>
          <p className="meal-description">
            {meal.description}
          </p>
          {meal.ai_explanation && (
            <p className="meal-explanation">
              💡 {meal.ai_explanation}
            </p>
          )}
          <div className="meal-macros-summary">
            <span><strong>Cals:</strong> {meal.planned_macros?.calories} kcal</span>
            <span><strong>P:</strong> {meal.planned_macros?.protein}g</span>
            <span><strong>C:</strong> {meal.planned_macros?.carbs}g</span>
            <span><strong>F:</strong> {meal.planned_macros?.fat}g</span>
          </div>
        </>
      )}
    </div>
  );
}
