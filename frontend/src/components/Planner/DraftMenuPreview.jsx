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
  return (
    <div className="draft-preview-card">
      <div className="draft-preview-header">
        <span className="draft-preview-title">Weekly Draft</span>
        {draftPlan?.days && (
          <button
            className="btn-save-calendar"
            onClick={handleSaveToCalendar}
            disabled={loading}
          >
            Save to Calendar
          </button>
        )}
      </div>

      {!draftPlan || !draftPlan.days ? (
        <div className="draft-preview-empty">
          <p>
            Generate or chat your way to a plan — it will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="day-selector-container">
            {daysOfWeek.map(day => (
              <button
                key={day}
                onClick={() => setActiveDayTab(day)}
                className={`day-tab-btn ${activeDayTab === day ? 'active' : ''}`}
              >
                {day.substring(0, 3)}
              </button>
            ))}
          </div>

          <div className="day-meals-list">
            {['breakfast', 'lunch', 'dinner'].map(mealType => {
              const meal = draftPlan.days[activeDayTab]?.meals[mealType];
              if (!meal) return null;

              const isEditingThis =
                editingMeal &&
                editingMeal.day === activeDayTab &&
                editingMeal.mealType === mealType;

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
        </>
      )}
    </div>
  );
}
