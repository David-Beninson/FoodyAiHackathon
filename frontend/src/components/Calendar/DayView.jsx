import { useState } from 'react';

export default function DayView({ mealSections, isFutureDay }) {
  const [mealStatuses, setMealStatuses] = useState({});
  // סטייט לניהול התפריט הפתוח (כדי שרק אחד יהיה פתוח בכל פעם)
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleStatusToggle = (section, status) => {
    setMealStatuses(prev => ({
      ...prev,
      [section]: prev[section] === status ? null : status
    }));
    setOpenDropdown(null); // סוגר את התפריט אחרי לחיצה
  };

  const toggleDropdown = (dropdownId) => {
    setOpenDropdown(prev => prev === dropdownId ? null : dropdownId);
  };

  const getAdjustmentPrompt = (section) => {
    if (isFutureDay) return null;

    const breakfastSkipped = mealStatuses['Breakfast'] === 'skipped';
    const lunchSkipped = mealStatuses['Lunch'] === 'skipped';
    const dinnerSkipped = mealStatuses['Dinner'] === 'skipped';

    if (section === 'Dinner' && dinnerSkipped) {
      return "✕ Dinner skipped. Progress won't carry over to tomorrow.";
    }

    if (mealStatuses[section] === 'skipped' || mealStatuses[section] === 'eaten') {
      return null;
    }

    if (section === 'Lunch' && breakfastSkipped) {
      return "✨ Regenerating a new meal with AI to reach your goal.";
    }

    if (section === 'Dinner') {
      if (breakfastSkipped && lunchSkipped) {
        return "✨ Regenerating a new meal with AI to reach your goal.";
      }
      if (lunchSkipped) {
        return "✨ Regenerating a new meal with AI to reach your goal.";
      }
      if (breakfastSkipped) {
        return "✨ Regenerating a new meal with AI to reach your goal.";
      }
    }

    return null;
  };

  return (
    <div className="apple-day-view">
      <div className="day-sections">
        {mealSections.map((section, idx) => {
          const isSkipped = mealStatuses[section] === 'skipped';
          const isEaten = mealStatuses[section] === 'eaten';
          const promptMessage = getAdjustmentPrompt(section);

          return (
            <div key={idx} className="day-meal-row">
              {/* העמודה השמאלית */}
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
              
              {/* העמודה הימנית */}
              <div className="meal-cell flex-1">
                <div className="meal-content-placeholder">
                  <span className="empty-meal-text">No meal data yet</span>
                </div>
                
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
                          onClick={() => setOpenDropdown(null)}
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
    </div>
  );
}