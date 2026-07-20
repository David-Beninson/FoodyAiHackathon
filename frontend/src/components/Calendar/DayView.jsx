import { useState } from 'react';
import CustomMealModal from './CustomMealModal';

export default function DayView({
  mealSections,
  isFutureDay,
  dayPlan,
  onUpdateStatus
}) {
  const [customMeals, setCustomMeals] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);
  
  // Open modal state: stores the current meal section (Breakfast/Lunch/Dinner)
  const [activeModalSection, setActiveModalSection] = useState(null);

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

  const handleSaveCustomMeal = (mealData) => {
    setCustomMeals(prev => ({
      ...prev,
      [activeModalSection]: mealData
    }));
    onUpdateStatus(activeModalSection, 'replaced', mealData.name);
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
      return "✨ Regenerating a new meal with AI to reach your goal.";
    }

    if (section === 'Dinner') {
      if ((breakfastSkipped && lunchSkipped) || lunchSkipped || breakfastSkipped) {
        return "✨ Regenerating a new meal with AI to reach your goal.";
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
          const currentCustomMeal = customMeals[section];
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
                    <p className="meal-description">
                      {currentCustomMeal ? `Custom meal added: ${currentCustomMeal.name}` : meal.description}
                    </p>
                    <div className="meal-macros-badges">
                      <span className="macro-badge calories">🔥 {currentCustomMeal ? currentCustomMeal.calories : meal.planned_macros?.calories} kcal</span>
                      <span className="macro-badge protein">🥩 {currentCustomMeal ? currentCustomMeal.protein : meal.planned_macros?.protein}g Pro</span>
                      <span className="macro-badge carbs">🍞 {currentCustomMeal ? currentCustomMeal.carbs : meal.planned_macros?.carbs}g Carb</span>
                      <span className="macro-badge fat">🥑 {currentCustomMeal ? currentCustomMeal.fats : meal.planned_macros?.fat}g Fat</span>
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
                        className={`action-btn dropdown-toggle ${isEaten ? 'active-eaten' : isSkipped ? 'active-skipped' : isReplaced ? 'active-replaced' : ''}`}
                        onClick={() => toggleDropdown(`${section}-planned`)}
                      >
                        {isEaten ? '✓ Eaten' : isSkipped ? '✕ Skipped' : isReplaced ? '✏️ Replaced' : 'Planned ▾'}
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
                  
                  {/* Dropdown 2: Replace Meal (Custom / AI) */}
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
                          className="dropdown-item primary-text"
                          onClick={() => {
                            setActiveModalSection(section);
                            setOpenDropdown(null);
                          }}
                        >
                          <span className="icon">+</span> Custom
                        </button>
                        <button 
                          type="button" 
                          className="dropdown-item accent-text"
                          onClick={() => setOpenDropdown(null)}
                        >
                          <span className="icon">✨</span> AI Regenerate
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
    </div>
  );
}