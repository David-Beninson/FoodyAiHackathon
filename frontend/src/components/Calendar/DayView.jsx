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
  const [skippedChipAlert, setSkippedChipAlert] = useState(null);

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

  const getSkippedAlert = (section) => {
    if (isFutureDay || !dayPlan) return null;

    const meals = dayPlan.meals;
    const currentStatus = meals?.[section.toLowerCase()]?.status;

    // Don't show on the skipped/eaten meal itself
    if (currentStatus === 'skipped' || currentStatus === 'eaten') return null;

    const skippedMeals = [];
    if (section === 'Lunch' && meals?.breakfast?.status === 'skipped') {
      skippedMeals.push({ name: 'Breakfast', meal: meals.breakfast });
    }
    if (section === 'Dinner') {
      if (meals?.breakfast?.status === 'skipped') skippedMeals.push({ name: 'Breakfast', meal: meals.breakfast });
      if (meals?.lunch?.status === 'skipped') skippedMeals.push({ name: 'Lunch', meal: meals.lunch });
    }

    if (skippedMeals.length === 0) return null;

    const totalSkippedCals = skippedMeals.reduce((sum, s) => sum + (s.meal?.planned_macros?.calories || 0), 0);
    const skippedNames = skippedMeals.map(s => s.name).join(' & ');

    return {
      skippedNames,
      totalSkippedCals,
      count: skippedMeals.length,
    };
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
          const skippedAlert = getSkippedAlert(section);

          return (
            <div key={idx} className="day-meal-row">
              <div className="time-label">
                <span className="time-label-text">{section}</span>
                {skippedAlert && (
                  <button
                    className="skipped-chip"
                    onClick={() => {
                      setSkippedChipAlert(skippedAlert);
                      setActiveModalSection(section);
                    }}
                    title={`Make up ~${skippedAlert.totalSkippedCals} kcal from skipped ${skippedAlert.skippedNames}`}
                  >
                    +{Math.round(skippedAlert.totalSkippedCals)} kcal
                  </button>
                )}
              </div>

              <div className="meal-cell flex-1" style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch', padding: '0', gap: '0' }}>
                {/* Meal name — centered */}
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '18px 24px',
                  }}
                >
                  {meal ? (
                    <div className={`meal-content-container ${isSkipped ? 'skipped-meal' : ''}`} style={{ textAlign: 'center' }}>
                      <h3
                        className="meal-title"
                        style={{
                          fontSize: '20px',
                          fontWeight: '600',
                          margin: '0',
                          textAlign: 'center',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          textUnderlineOffset: '3px',
                        }}
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
                </div>

                {/* Status button — vertically centered on the right */}
                {!isFutureDay && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '18px 24px',
                      borderLeft: '1px solid var(--border)',
                      flexShrink: 0,
                    }}
                  >
                    <div className="dropdown-wrapper">
                      <button
                        type="button"
                        className={`action-btn dropdown-toggle ${isEaten ? 'active-eaten' : isSkipped ? 'active-skipped' : isReplaced ? 'active-replaced' : ''}`}
                        onClick={() => toggleDropdown(`${section}-planned`)}
                      >
                        {isEaten ? 'Eaten' : isSkipped ? 'Skipped' : isReplaced ? 'Custom' : 'Planned'}
                      </button>

                      {openDropdown === `${section}-planned` && (
                        <div className="dropdown-menu">
                          <button
                            type="button"
                            className="dropdown-item"
                            onClick={() => handleStatusToggle(section, 'eaten')}
                          >
                            Eaten
                          </button>
                          <button
                            type="button"
                            className="dropdown-item"
                            onClick={() => handleStatusToggle(section, 'skipped')}
                          >
                            Skipped
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <CustomMealModal
        isOpen={Boolean(activeModalSection)}
        mealSection={activeModalSection}
        onClose={() => { setActiveModalSection(null); setSkippedChipAlert(null); }}
        onSave={handleSaveCustomMeal}
        defaultPrompt={
          skippedChipAlert
            ? `I skipped ${skippedChipAlert.skippedNames} today (~${Math.round(skippedChipAlert.totalSkippedCals)} kcal missed). Please suggest a ${activeModalSection} meal that makes up those extra calories while still being healthy.`
            : ''
        }
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