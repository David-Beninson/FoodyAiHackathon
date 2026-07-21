import { useState, useEffect } from 'react';
import LoadingSpinner from '../Common/LoadingSpinner';

function HeartIcon({ filled }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={filled ? 'var(--accent)' : 'none'}
      stroke="var(--accent)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

const MACROS = [
  { label: 'Calories', key: 'calories', unit: 'kcal' },
  { label: 'Protein',  key: 'protein',  unit: 'g' },
  { label: 'Carbs',    key: 'carbs',    unit: 'g' },
  { label: 'Fat',      key: 'fats',     unit: 'g' },
];

export default function MealDetailsModal({ isOpen, meal, onClose, onToggleFavorite, onRegenerate }) {
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
      setIsEditingCustom(false);
      setPromptText('');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  if (!isOpen || !meal) return null;

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    setIsSubmitting(true);
    try {
      await onRegenerate(promptText.trim());
      setPromptText('');
      setIsEditingCustom(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = () => {
    if (!isSubmitting) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div
        className="modal-container modal-md"
        onClick={(e) => e.stopPropagation()}
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
            <h3
              className="modal-title"
              style={{
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: '17px',
                fontWeight: '600',
                letterSpacing: '-0.01em',
              }}
            >
              {meal.title}
            </h3>
            {onToggleFavorite && (
              <button
                onClick={onToggleFavorite}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.2s ease, opacity 0.2s ease',
                  opacity: meal.isFavorite ? 1 : 0.55,
                  flexShrink: 0,
                }}
                title={meal.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.18)';
                  e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.opacity = meal.isFavorite ? '1' : '0.55';
                }}
              >
                <HeartIcon filled={meal.isFavorite} />
              </button>
            )}
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            disabled={isSubmitting}
            style={{ flexShrink: 0 }}
          >
            &#x2715;
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {isSubmitting ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '200px',
              }}
            >
              <LoadingSpinner message="Generating new meal..." />
            </div>
          ) : (
            <>
              {meal.description && (
                <p
                  style={{
                    fontSize: '13.5px',
                    color: 'var(--text)',
                    marginBottom: '20px',
                    textAlign: 'left',
                    lineHeight: '1.6',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                >
                  {meal.description}
                </p>
              )}

              {/* Macros table */}
              <div
                style={{
                  background: 'var(--code-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  overflow: 'hidden',
                  marginBottom: '20px',
                }}
              >
                {MACROS.map(({ label, key, unit }, i) => (
                  <div
                    key={key}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '11px 16px',
                      borderBottom: i < MACROS.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '13px',
                        color: 'var(--text)',
                        letterSpacing: '0.01em',
                      }}
                    >
                      {label}
                    </span>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: 'var(--text-h)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {meal[key] != null ? `${meal[key]} ${unit}` : '—'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              {onRegenerate && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  {!isEditingCustom ? (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => setIsEditingCustom(true)}
                        className="btn btn-secondary"
                        style={{ flex: 1 }}
                      >
                        Custom (AI)
                      </button>
                      <button
                        onClick={async () => {
                          setIsSubmitting(true);
                          try {
                            await onRegenerate(null);
                          } catch (err) {
                            console.error(err);
                          } finally {
                            setIsSubmitting(false);
                          }
                        }}
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                      >
                        Regenerate
                      </button>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleCustomSubmit}
                      style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
                    >
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="e.g. Greek salad with tuna instead of rice..."
                        value={promptText}
                        onChange={(e) => setPromptText(e.target.value)}
                        required
                        style={{
                          resize: 'none',
                          fontFamily: 'inherit',
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          boxSizing: 'border-box',
                          fontSize: '13.5px',
                        }}
                      />
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          type="button"
                          onClick={() => setIsEditingCustom(false)}
                          className="btn btn-secondary"
                          style={{ flex: 1 }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          style={{ flex: 1 }}
                        >
                          Send to AI
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}