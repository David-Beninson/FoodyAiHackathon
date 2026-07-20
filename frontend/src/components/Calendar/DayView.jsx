import { useState } from 'react';

export default function DayView({
  mealSections,
  isFutureDay,
  dayPlan,
  onUpdateStatus
}) {
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleStatusToggle = (section, status) => {
    const mealKey = section.toLowerCase();
    const currentMeal = dayPlan?.meals?.[mealKey];
    const targetStatus = currentMeal?.status === status ? 'planned' : status;
    onUpdateStatus(section, targetStatus, null);
    setOpenDropdown(null);
  };

  const handleCustomReplace = (section) => {
    setOpenDropdown(null);
    const customName = prompt(`What did you eat for ${section} instead?`);
    if (customName && customName.trim()) {
      onUpdateStatus(section, 'replaced', customName.trim());
    }
  };

  const toggleDropdown = (dropdownId) => {
    setOpenDropdown(prev => prev === dropdownId ? null : dropdownId);
  };

  const getAdjustmentPrompt = (section) => {
    if (isFutureDay || !dayPlan) return null;

    const meals = dayPlan.meals;
    const dinnerSkipped = meals?.dinner?.status === 'skipped';

    if (section === 'Dinner' && dinnerSkipped) {
      return "✕ Dinner skipped. Progress won't carry over to tomorrow.";
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

                {promptMessage && (
                  <div className="adjustment-prompt-container">
                    <button
                      type="button"
                      className={`adjust-plan-btn ${promptMessage.startsWith('✕') ? 'notice-only' : ''}`}
                      disabled={promptMessage.startsWith('✕')}
                    >
                      {promptMessage}
                    </button>
                  </div>
                )}
              </div>

              <div className="meal-cell flex-1">
                {meal ? (
                  <div className={`meal-content-container ${isSkipped ? 'skipped-meal' : ''}`}>
                    <h3 className="meal-title">
                      {isReplaced && meal.replaced_with_meal_name
                        ? meal.replaced_with_meal_name
                        : meal.name}
                    </h3>
                    <p className="meal-description">{meal.description}</p>
                    <div className="meal-macros-badges">
                      <span className="macro-badge calories">{meal.planned_macros?.calories} kcal</span>
                      <span className="macro-badge protein">{meal.planned_macros?.protein}g Pro</span>
                      <span className="macro-badge carbs">{meal.planned_macros?.carbs}g Carb</span>
                      <span className="macro-badge fat">{meal.planned_macros?.fat}g Fat</span>
                    </div>
                  </div>
                ) : (
                  <div className="meal-content-placeholder">
                    <span className="empty-meal-text">No meal data yet</span>
                  </div>
                )}

                <div className="meal-actions">

                  {/* Dropdown 1: Planned / Eaten / Skipped */}
                  {!isFutureDay && (
                    <div className="dropdown-wrapper">
                      <button
                        type="button"
                        className={`action-btn dropdown-toggle ${isEaten ? 'active-eaten' : isSkipped ? 'active-skipped' : ''}`}
                        onClick={() => toggleDropdown(`${section}-planned`)}
                      >
                        {isEaten ? '✓ Eaten' : isSkipped ? '✕ Skipped' : 'Planned ▾'}
                      </button>

                      {openDropdown === `${section}-planned` && (
                        <div className="dropdown-menu">
                          <button
                            type="button"
                            className="dropdown-item success-text"
                            onClick={() => handleStatusToggle(section, 'eaten')}
                          >
                            <span className="icon">✓</span> Eaten
                          </button>
                          <button
                            type="button"
                            className="dropdown-item danger-text"
                            onClick={() => handleStatusToggle(section, 'skipped')}
                          >
                            <span className="icon">✕</span> Skipped
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Replace Meal Button */}
                  <button
                    type="button"
                    className="action-btn"
                    onClick={() => handleCustomReplace(section)}
                  >
                    Replace Meal
                  </button>

                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}