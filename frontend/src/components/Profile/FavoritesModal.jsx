import { useState, useEffect } from 'react';
import { getFavoriteMeals, unfavoriteMeal } from '../../api/apiClient';
import LoadingSpinner from '../Common/LoadingSpinner';
import './FavoritesModal.css';

export default function FavoritesModal({ isOpen, onClose, userId }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null); // tracks which card is being removed

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && userId) {
      const fetchFavorites = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await getFavoriteMeals(userId);
          setFavorites(data);
        } catch (err) {
          console.error(err);
          setError(err.response?.data?.detail || 'Failed to load favorite meals.');
        } finally {
          setLoading(false);
        }
      };
      fetchFavorites();
    }
  }, [isOpen, userId]);

  const handleUnfavorite = async (meal, index) => {
    if (!meal.plan_id) return;
    setRemovingId(index);
    try {
      await unfavoriteMeal(meal.plan_id, meal.day, meal.meal_type);
      setFavorites((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      console.error('Failed to unfavorite meal:', err);
    } finally {
      setRemovingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container modal-md fav-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="fav-header-content">
            <span className="fav-header-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </span>
            <h3 className="modal-title">My Favorite Meals</h3>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body fav-body">
          {loading ? (
            <LoadingSpinner message="Loading favorites..." />
          ) : error ? (
            <div className="fav-state fav-error">{error}</div>
          ) : favorites.length === 0 ? (
            <div className="fav-state fav-empty">
              <div className="fav-empty-icon" aria-hidden="true">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <p className="fav-empty-title">No favorites yet</p>
              <p className="fav-empty-sub">
                Go to the Weekly Calendar and save a meal to see it here.
              </p>
            </div>
          ) : (
            <ul className="fav-list">
              {favorites.map((meal, index) => {
                const isRemoving = removingId === index;
                return (
                  <li key={index} className={`fav-card${isRemoving ? ' fav-card--removing' : ''}`}>
                    {/* Card top row */}
                    <div className="fav-card-header">
                      <h4 className="fav-card-name">{meal.name}</h4>
                      <div className="fav-card-actions">
                        {meal.meal_type && (
                          <span className="fav-badge">{meal.meal_type}</span>
                        )}
                        {meal.plan_id && (
                          <button
                            className="fav-unlike-btn"
                            title="Remove from favorites"
                            aria-label={`Remove ${meal.name} from favorites`}
                            disabled={isRemoving}
                            onClick={() => handleUnfavorite(meal, index)}
                          >
                            {isRemoving ? (
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="fav-spin">
                                <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="8" />
                              </svg>
                            ) : (
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {meal.description && (
                      <p className="fav-card-desc">{meal.description}</p>
                    )}

                    {/* Macros */}
                    {meal.planned_macros && (
                      <div className="fav-macros">
                        <span className="fav-macro-item">
                          <span className="fav-macro-label">Cal</span>
                          <span className="fav-macro-value">{meal.planned_macros.calories}</span>
                        </span>
                        <span className="fav-macro-sep" aria-hidden="true" />
                        <span className="fav-macro-item">
                          <span className="fav-macro-label">Protein</span>
                          <span className="fav-macro-value">{meal.planned_macros.protein}g</span>
                        </span>
                        <span className="fav-macro-sep" aria-hidden="true" />
                        <span className="fav-macro-item">
                          <span className="fav-macro-label">Carbs</span>
                          <span className="fav-macro-value">{meal.planned_macros.carbs}g</span>
                        </span>
                        <span className="fav-macro-sep" aria-hidden="true" />
                        <span className="fav-macro-item">
                          <span className="fav-macro-label">Fat</span>
                          <span className="fav-macro-value">{meal.planned_macros.fat}g</span>
                        </span>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="fav-card-footer">
                      <span>{meal.day}</span>
                      {meal.week_start_date && (
                        <>
                          <span className="fav-dot" aria-hidden="true" />
                          <span>{meal.week_start_date}</span>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
