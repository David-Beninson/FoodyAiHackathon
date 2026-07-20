import { useState } from 'react';
import CustomMealModal from './CustomMealModal';
import MealDetailsModal from './MealDetailsModal';

export default function DayView({
  mealSections,
  isFutureDay,
  dayPlan,
  onUpdateStatus,
  onRegenerateMeal
}) {
  const [openDropdown, setOpenDropdown] = useState(null);

  const [activeModalSection, setActiveModalSection] = useState(null);

  // New state: stores the meal data to show in the details modal
  const [activeDetailsMeal, setActiveDetailsMeal] = useState(null);

  const handleStatusToggle = (section, status) => {
    const mealKey = section.toLowerCase();
    const currentMeal = dayPlan?.meals?.[mealKey];
    const targetStatus = currentMeal?.status === status ? 'planned' : status;
    onUpdateStatus(section, targetStatus, null);
    setOpenDropdown(null);
  };

  const toggleDropdown = (dropdownId) => {
    setOpenDropdown(prev => prev === dropdownId ? null : dropdownId);
  };

  const handleSaveCustomMeal = (promptText) => {
    onRegenerateMeal(activeModalSection, promptText);
  };

  const getAdjustmentPrompt = (section) => {
    if (isFutureDay || !dayPlan) return null;

    const meals = dayPlan.meals;
    const breakfastSkipped = meals?.breakfast?.status === 'skipped';
    const lunchSkipped = meals?.lunch?.status === 'skipped';
    const dinnerSkipped = meals?.dinner?.status === 'skipped';

    if (section === 'Dinner' && dinnerSkipped) {
      return "✕ Dinner skipped. Progress won't carry over to tomorrow.";
    }

    if (meals?.[section.toLowerCase()]?.status === 'skipped' || meals?.[section.toLowerCase()]?.status === 'eaten') {
      return null;
    }

    if (section === 'Lunch' && breakfastSkipped) {
      return "Regenerating a new meal with AI to reach your goal.";
    }

    if (section === 'Dinner') {
      if ((breakfastSkipped && lunchSkipped) || lunchSkipped || breakfastSkipped) {
        return "Regenerating a new meal with AI to reach your goal.";
      }
    }

    return null;
  };

  return (
    <div className="apple-day-view">
      <div className="day-sections">
        {mealSections.map((section, idx) => {
          const mealKey = section.toLowerCase();
          const meal = dayPlan?.meals?.[mealKey];

          const isSkipped = meal?.status === 'skipped';
          const isEaten = meal?.status === 'eaten';
          const isReplaced = meal?.status === 'replaced';
          const promptMessage = getAdjustmentPrompt(section);

          return (
            <div key={idx} className="day-meal-row">
              <div className="time-label">
                <span className="time-label-text">{section}</span>

                {/* הבועה הצפה מחוץ לטבלה עם החץ */}
                {promptMessage && (
                  <div className="ai-tooltip-container">
                    <div className={`ai-tooltip-bubble ${promptMessage.startsWith('✕') ? 'notice-only' : ''}`}>
                      {promptMessage}
                    </div>
                  </div>
                )}
              </div>

              <div className="meal-cell flex-1">
                {meal ? (
                  <div className={`meal-content-container ${isSkipped ? 'skipped-meal' : ''}`}>
                    <h3
                      className="meal-title"
                      style={{ fontSize: '15px', fontWeight: '600', margin: '0', textAlign: 'left', cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => setActiveDetailsMeal({
                        title: isReplaced && meal.replaced_with_meal_name ? `AI Custom: ${meal.replaced_with_meal_name}` : meal.name,
                        description: currentCustomMeal ? `Custom meal added: ${currentCustomMeal.name}` : meal.description,
                        calories: currentCustomMeal ? currentCustomMeal.calories : meal.planned_macros?.calories,
                        protein: currentCustomMeal ? currentCustomMeal.protein : meal.planned_macros?.protein,
                        carbs: currentCustomMeal ? currentCustomMeal.carbs : meal.planned_macros?.carbs,
                        fats: currentCustomMeal ? currentCustomMeal.fats : meal.planned_macros?.fat
                      })}
                    >
                      {isReplaced && meal.replaced_with_meal_name
                        ? `Custom: ${meal.replaced_with_meal_name}`
                        : meal.name}
                    </h3>
                    <p className="meal-description" style={{ fontSize: '13px', color: 'var(--text)', margin: '0 0 8px 0', textAlign: 'left' }}>
                      {meal.description}
                    </p>
                    <div className="meal-macros-badges" style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                      <span className="macro-badge calories">🔥 {meal.planned_macros?.calories} kcal</span>
                      <span className="macro-badge protein">🥩 {meal.planned_macros?.protein}g Pro</span>
                      <span className="macro-badge carbs">🍞 {meal.planned_macros?.carbs}g Carb</span>
                      <span className="macro-badge fat">🥑 {meal.planned_macros?.fat}g Fat</span>
                    </div>
                  </div>
                ) : (
                  <div className="meal-content-placeholder">
                    <span className="empty-meal-text">No meal data yet</span>
                  </div>
                )}

                <div className="meal-actions">
                  {!isFutureDay && (
                    <div className="dropdown-wrapper">
                      <button
                        type="button"
                        className={`action-btn dropdown-toggle ${isEaten ? 'active-eaten' : isSkipped ? 'active-skipped' : isReplaced ? 'active-replaced' : ''}`}
                        onClick={() => toggleDropdown(`${section}-planned`)}
                      >
                        {isEaten ? '✓ Eaten' : isSkipped ? '✕ Skipped' : isReplaced ? '✨ Custom' : 'Planned ▾'}
                      </button>

                      {openDropdown === `${section}-planned` && (
                        <div className="dropdown-menu">
                          <button
                            type="button"
                            className="dropdown-item"
                            onClick={() => handleStatusToggle(section, 'eaten')}
                          >
                            ✓ Eaten
                          </button>
                          <button
                            type="button"
                            className="dropdown-item"
                            onClick={() => handleStatusToggle(section, 'skipped')}
                          >
                            ✕ Skipped
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="dropdown-wrapper">
                    <button
                      type="button"
                      className="action-btn dropdown-toggle"
                      onClick={() => toggleDropdown(`${section}-replace`)}
                    >
                      Replace Meal ▾
                    </button>

                    {openDropdown === `${section}-replace` && (
                      <div className="dropdown-menu">
                        <button
                          type="button"
                          className="dropdown-item"
                          onClick={() => {
                            setActiveModalSection(section);
                            setOpenDropdown(null);
                          }}
                        >
                          ✨ Custom
                        </button>
                        <button
                          type="button"
                          className="dropdown-item"
                          onClick={() => {
                            onRegenerateMeal(section, null);
                            setOpenDropdown(null);
                          }}
                        >
                          🔄 Regenerate
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <CustomMealModal
        isOpen={Boolean(activeModalSection)}
        mealSection={activeModalSection}
        onClose={() => setActiveModalSection(null)}
        onSave={handleSaveCustomMeal}
      />

      <MealDetailsModal
        isOpen={Boolean(activeDetailsMeal)}
        meal={activeDetailsMeal}
        onClose={() => setActiveDetailsMeal(null)}
      />
    </div>
  );
}