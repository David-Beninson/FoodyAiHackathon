import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getPantry, updatePantry } from '../../api/apiClient';
import './Pantry.css';

const POPULAR_INGREDIENTS = [
  "Chicken Breast", "Beef", "Salmon", "Tuna", "Eggs", "Milk", 
  "Greek Yogurt", "Cheese", "Rice", "Quinoa", "Oats", "Potatoes", 
  "Sweet Potatoes", "Spinach", "Broccoli", "Tomatoes", "Cucumbers", 
  "Onions", "Garlic", "Avocado", "Apples", "Bananas", "Olive Oil", 
  "Peanut Butter"
];

export default function Pantry() {
  const { user } = useAuth();
  const userId = user?.id || user?._id;

  const [pantryItems, setPantryItems] = useState([]);
  const [customItem, setCustomItem] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Load pantry items
  useEffect(() => {
    if (!userId) return;
    const fetchPantryData = async () => {
      setLoading(true);
      try {
        const data = await getPantry(userId);
        setPantryItems(data || []);
      } catch (err) {
        console.error("Failed to load pantry:", err);
        showMessage("Failed to load pantry items.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchPantryData();
  }, [userId]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleTogglePopular = (item) => {
    const exists = pantryItems.some(i => i.toLowerCase() === item.toLowerCase());
    if (exists) {
      setPantryItems(prev => prev.filter(i => i.toLowerCase() !== item.toLowerCase()));
    } else {
      setPantryItems(prev => [...prev, item]);
    }
  };

  const handleAddCustom = (e) => {
    if (e) e.preventDefault();
    const cleanItem = customItem.trim();
    if (!cleanItem) return;

    const exists = pantryItems.some(i => i.toLowerCase() === cleanItem.toLowerCase());
    if (exists) {
      showMessage(`"${cleanItem}" is already in your pantry!`, "warning");
      setCustomItem('');
      return;
    }

    setPantryItems(prev => [...prev, cleanItem]);
    setCustomItem('');
  };

  const handleRemoveItem = (indexToRemove) => {
    setPantryItems(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await updatePantry(userId, pantryItems);
      showMessage("Pantry inventory saved successfully!", "success");
    } catch (err) {
      console.error("Failed to save pantry:", err);
      showMessage("Failed to save pantry inventory.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear your entire pantry?")) {
      setPantryItems([]);
    }
  };

  return (
    <div className="pantry-page-container">
      <div className="pantry-header-section">
        <h1>My Pantry & Fridge</h1>
        <p>Keep track of ingredients you have at home. FoodyAI will prioritize these when generating your weekly meal plans.</p>
      </div>

      {message.text && (
        <div className={`pantry-toast ${message.type}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="pantry-loading-container">
          <div className="pantry-spinner"></div>
          <p>Loading your pantry...</p>
        </div>
      ) : (
        <div className="pantry-grid-layout">
          {/* Left panel: Quick Select & Custom Add */}
          <div className="pantry-panel pantry-input-panel">
            <div className="pantry-panel-section">
              <h2>Quick Add Ingredients</h2>
              <p className="section-subtitle">Click to add or remove commonly used items:</p>
              <div className="popular-chips-grid">
                {POPULAR_INGREDIENTS.map((item) => {
                  const isSelected = pantryItems.some(i => i.toLowerCase() === item.toLowerCase());
                  return (
                    <button
                      key={item}
                      type="button"
                      className={`popular-chip-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleTogglePopular(item)}
                    >
                      {item}
                      <span className="chip-icon">{isSelected ? '✓' : '+'}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pantry-panel-section custom-add-section">
              <h2>Add Custom Ingredient</h2>
              <form onSubmit={handleAddCustom} className="custom-add-form">
                <input
                  type="text"
                  placeholder="e.g. almond milk, basmati rice..."
                  value={customItem}
                  onChange={(e) => setCustomItem(e.target.value)}
                  className="custom-add-input"
                />
                <button type="submit" className="custom-add-submit-btn">
                  Add Item
                </button>
              </form>
            </div>
          </div>

          {/* Right panel: Current Inventory list */}
          <div className="pantry-panel pantry-inventory-panel">
            <div className="inventory-header">
              <h2>Current Inventory ({pantryItems.length} items)</h2>
              {pantryItems.length > 0 && (
                <button 
                  type="button" 
                  className="clear-all-btn" 
                  onClick={handleClearAll}
                >
                  Clear All
                </button>
              )}
            </div>

            {pantryItems.length === 0 ? (
              <div className="empty-pantry-state">
                <div className="empty-pantry-icon">🍳</div>
                <h3>Your pantry is empty</h3>
                <p>Add ingredients using the quick add chips or by typing custom items. Saving your inventory allows the AI planner to suggest recipes you can cook right away!</p>
              </div>
            ) : (
              <div className="inventory-items-list">
                {pantryItems.map((item, index) => (
                  <div key={`${item}-${index}`} className="inventory-item-card">
                    <span className="item-name">{item}</span>
                    <button
                      type="button"
                      className="item-delete-btn"
                      onClick={() => handleRemoveItem(index)}
                      title="Remove item"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pantry-actions-footer">
              <button
                type="button"
                className="save-pantry-btn"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving Changes..." : "Save Pantry Inventory"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
