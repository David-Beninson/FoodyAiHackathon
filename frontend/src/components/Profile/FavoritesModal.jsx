import { useState, useEffect } from 'react';
import { getFavoriteMeals } from '../../api/apiClient';
import LoadingSpinner from '../Common/LoadingSpinner';

export default function FavoritesModal({ isOpen, onClose, userId }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
          setError(err.response?.data?.detail || "Failed to load favorite meals.");
        } finally {
          setLoading(false);
        }
      };
      fetchFavorites();
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  return (
    <div className="family-modal-overlay" onClick={onClose}>
      <div className="family-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%' }}>
        <div className="modal-header">
          <h3 className="modal-title">❤️ My Favorite Meals</h3>
          <button
            type="button"
            className="tag-remove"
            onClick={onClose}
            style={{ fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}
          >
            &times;
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '450px', overflowY: 'auto', paddingRight: '4px' }}>
          {loading ? (
            <LoadingSpinner message="Loading favorites..." />
          ) : error ? (
            <div style={{ color: 'var(--accent)', textAlign: 'center', padding: '20px' }}>
              {error}
            </div>
          ) : favorites.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>⭐</div>
              <p style={{ margin: 0, fontWeight: '500' }}>No favorites saved yet!</p>
              <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                Go to the Weekly Calendar and click the ❤️ icon on any meal card to add it here.
              </p>
            </div>
          ) : (
            favorites.map((meal, index) => (
              <div 
                key={index} 
                style={{ 
                  background: 'rgba(255, 255, 255, 0.03)', 
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--text-h)' }}>
                    {meal.name}
                  </h4>
                  <span style={{ fontSize: '11px', color: '#818cf8', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: '12px', textTransform: 'capitalize' }}>
                    {meal.meal_type}
                  </span>
                </div>

                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: '1.4' }}>
                  {meal.description}
                </p>

                {meal.planned_macros && (
                  <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#64748b', borderTop: '1px dashed rgba(255, 255, 255, 0.06)', paddingTop: '8px', marginTop: '4px' }}>
                    <span>🔥 {meal.planned_macros.calories} kcal</span>
                    <span>🥩 P: {meal.planned_macros.protein}g</span>
                    <span>🍞 C: {meal.planned_macros.carbs}g</span>
                    <span>🥑 F: {meal.planned_macros.fat}g</span>
                  </div>
                )}

                <div style={{ fontSize: '10px', color: '#64748b', textAlign: 'right' }}>
                  Added from {meal.day}'s menu ({meal.week_start_date})
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
