import { useState } from 'react';
import CustomMealModal from './CustomMealModal';
import MealDetailsModal from './MealDetailsModal';

export default function DayView({
  mealSections,
  isFutureDay,
  dayPlan,
  onUpdateStatus,
  onUpdateFavorite,
  onRegenerateMeal
}) {
  const [openDropdown, setOpenDropdown] = useState(null);
   
  const [activeModalSection, setActiveModalSection] = useState(null);

  // New state: stores the active section name (Breakfast/Lunch/Dinner) to show details dynamically
  const [activeDetailsSection, setActiveDetailsSection] = useState(null);

  const activeMeal = activeDetailsSection ? dayPlan?.meals?.[activeDetailsSection.toLowerCase()] : null;
  const isReplacedActive = activeMeal?.status === 'replaced';
  const activeDetailsMeal = activeMeal ? {
    section: activeDetailsSection,
    isFavorite: activeMeal.is_favorite || false, 
    title: isReplacedActive && activeMeal.replaced_with_meal_name ? `AI Custom: ${activeMeal.replaced_with_meal_name}` : activeMeal.name,
    description: activeMeal.description,
    calories: activeMeal.planned_macros?.calories,
    protein: activeMeal.planned_macros?.protein,
    carbs: activeMeal.planned_macros?.carbs,
    fats: activeMeal.planned_macros?.fat
  } : null;

  const handleStatusToggle = (section, status) => {
    const mealKey = section.toLowerCase();
    const currentMeal = dayPlan?.meals?.[mealKey];
    const targetStatus = currentMeal?.status === status ? 'planned' : status;
    onUpdateStatus(section, targetStatus, null);
    setOpenDropdown(null);
  };

  const handleFavoriteToggle = (section) => {
    const mealKey = section.toLowerCase();
    const currentMeal = dayPlan?.meals?.[mealKey];
    const targetFavorite = !(currentMeal?.is_favorite === true);
    onUpdateFavorite(section, targetFavorite);
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
                      onClick={() => setActiveDetailsSection(section)}
                    >
                      {isReplaced && meal.replaced_with_meal_name
                        ? `Custom: ${meal.replaced_with_meal_name}`
                        : meal.name}
                    </h3>
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
        isOpen={Boolean(activeDetailsSection)}
        meal={activeDetailsMeal}
        onClose={() => setActiveDetailsSection(null)}
        onToggleFavorite={() => {
          handleFavoriteToggle(activeDetailsSection);
        }}

        onRegenerate={(prompt) => {
          if (activeDetailsSection) {
            return onRegenerateMeal(activeDetailsSection, prompt);
          }
        }}
      />
    </div>
  );
}