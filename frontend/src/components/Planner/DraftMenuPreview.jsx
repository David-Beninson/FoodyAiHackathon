import MealCard from './MealCard';

export default function DraftMenuPreview({
  draftPlan,
  activeDayTab,
  setActiveDayTab,
  daysOfWeek,
  editingMeal,
  editForm,
  setEditForm,
  startEditingMeal,
  setEditingMeal,
  saveEditedMeal,
  swapMealAlternative,
  handleSaveToCalendar,
  loading
}) {
  if (!draftPlan || !draftPlan.days) {
    return (
      <div className="card empty-draft-card">
        <div className="empty-draft-content">
          <h3>No Draft Weekly Menu Active</h3>
          <p>
            Generate a menu using the Profile Auto-Generator or discuss your options with the AI Advisor on the left to see the drafted recipes here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card draft-preview-card">
      <div className="card-title draft-preview-header">
        <span>Draft Weekly Menu Preview</span>
        <button
          className="btn btn-primary btn-save"
          onClick={handleSaveToCalendar}
          disabled={loading}
        >
          Save to Calendar
        </button>
      </div>

      <div className="day-selector-container">
        {daysOfWeek.map(day => (
          <button
            key={day}
            onClick={() => setActiveDayTab(day)}
            className={`btn day-tab-btn ${activeDayTab === day ? 'active' : ''}`}
          >
            {day.substring(0, 3)}
          </button>
        ))}
      </div>

      <div className="day-meals-list">
        {["breakfast", "lunch", "dinner"].map(mealType => {
          const meal = draftPlan.days[activeDayTab]?.meals[mealType];
          if (!meal) return null;

          const isEditingThis = editingMeal && editingMeal.day === activeDayTab && editingMeal.mealType === mealType;

          return (
            <MealCard
              key={mealType}
              mealType={mealType}
              meal={meal}
              isEditing={isEditingThis}
              editForm={editForm}
              setEditForm={setEditForm}
              onStartEdit={() => startEditingMeal(activeDayTab, mealType, meal)}
              onCancelEdit={() => setEditingMeal(null)}
              onConfirmEdit={saveEditedMeal}
              onSwap={() => swapMealAlternative(activeDayTab, mealType)}
            />
          );
        })}
      </div>
    </div>
  );
}
