import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import AutoPlannerTab from '../../components/Planner/AutoPlannerTab';
import InteractiveChatTab from '../../components/Planner/InteractiveChatTab';
import DraftMenuPreview from '../../components/Planner/DraftMenuPreview';
import { getNextSundayLocalDate } from '../../utils/calendarUtils';
import {
  getPlannerChatSession,
  sendPlannerChatMessage,
  resetPlannerChatSession,
  generateAutoPlanDraft,
  saveDraftWeeklyPlan,
  getWeeklyPlan
} from '../../api/apiClient';

export default function Planner() {
  const { user } = useAuth();
  const { currentProfile } = useProfile();
  const userId = user?.id || user?._id;

  const [activeMode, setActiveMode] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [weekStartDate, setWeekStartDate] = useState(getNextSundayLocalDate());

  // Chat States
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  // Draft Plan States
  const [draftPlan, setDraftPlan] = useState(null);
  const [activeDayTab, setActiveDayTab] = useState('Sunday');
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Editing States
  const [editingMeal, setEditingMeal] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [hasExistingPlan, setHasExistingPlan] = useState(false);

  // Check if target week is already planned
  useEffect(() => {
    if (!userId || !weekStartDate) return;
    const checkPlanExists = async () => {
      try {
        await getWeeklyPlan(userId, weekStartDate);
        setHasExistingPlan(true);
      } catch (err) {
        setHasExistingPlan(false);
        console.error(err);

      }
    };
    checkPlanExists();
  }, [userId, weekStartDate]);

  // Load Active Session
  useEffect(() => {
    if (!userId) return;
    const loadSession = async () => {
      try {
        const session = await getPlannerChatSession(userId);
        if (session) {
          setChatMessages(session.messages || []);
          if (session.draft_plan) setDraftPlan(session.draft_plan);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadSession();
  }, [userId, activeMode]);

  // Actions
  const handleAutoGenerate = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await generateAutoPlanDraft(userId, weekStartDate);
      if (data?.days) {
        setDraftPlan(data);
        showSuccessToast("Draft menu generated successfully! Review below.");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to generate plan.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !userId) return;

    const userText = inputMessage;
    setInputMessage('');
    setChatMessages(prev => [...prev, { role: 'user', content: userText }]);
    setLoading(true);
    setError(null);

    try {
      const session = await sendPlannerChatMessage(userId, userText);
      if (session) {
        setChatMessages(session.messages || []);
        if (session.draft_plan) setDraftPlan(session.draft_plan);
      }
    } catch (err) {
      setError("Failed to get response from planner advisor." + err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = async () => {
    if (!userId || !window.confirm("Are you sure you want to clear this chat session?")) return;
    setLoading(true);
    try {
      await resetPlannerChatSession(userId);
      setChatMessages([]);
      setDraftPlan(null);
      showSuccessToast("Session reset successfully.");
    } catch (err) {
      setError("Failed to reset chat session." + err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToCalendar = async () => {
    if (!userId || !draftPlan) return;
    setLoading(true);
    setError(null);
    try {
      await saveDraftWeeklyPlan(userId, weekStartDate, draftPlan.days);
      showSuccessToast("Weekly plan saved to your Calendar! Go to Home to see it.");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save weekly menu to calendar.");
    } finally {
      setLoading(false);
    }
  };

  const startEditingMeal = (day, mealType, mealObj) => {
    setEditingMeal({ day, mealType });
    setEditForm({
      name: mealObj.name || '',
      description: mealObj.description || '',
      calories: mealObj.planned_macros?.calories || 0,
      protein: mealObj.planned_macros?.protein || 0,
      carbs: mealObj.planned_macros?.carbs || 0,
      fat: mealObj.planned_macros?.fat || 0
    });
  };

  const saveEditedMeal = () => {
    if (!editingMeal || !draftPlan) return;
    const { day, mealType } = editingMeal;
    const updatedPlan = { ...draftPlan };
    const targetMeal = updatedPlan.days[day].meals[mealType];

    targetMeal.name = editForm.name;
    targetMeal.description = editForm.description;
    targetMeal.planned_macros = {
      calories: Number(editForm.calories),
      protein: Number(editForm.protein),
      carbs: Number(editForm.carbs),
      fat: Number(editForm.fat)
    };

    setDraftPlan(updatedPlan);
    setEditingMeal(null);
  };

  const swapMealAlternative = async (day, mealType) => {
    setLoading(true);
    setError(null);
    try {
      const prompt = `Give me an alternative suggestion for ${mealType} on ${day}.`;
      const session = await sendPlannerChatMessage(userId, prompt);
      if (session) {
        setChatMessages(session.messages || []);
        if (session.draft_plan) setDraftPlan(session.draft_plan);
      }
    } catch (err) {
      setError("Failed to swap meal." + err);
    } finally {
      setLoading(false);
    }
  };

  const showSuccessToast = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="profile-container">
      {success && <div className="toast" role="alert"><span>✔️ {success}</span></div>}

      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      <header className="profile-header">
        <h1 className="profile-title">Weekly Menu Planner</h1>

        <div className="tab-buttons-container">
          <button
            onClick={() => setActiveMode('auto')}
            className={`btn ${activeMode === 'auto' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Auto Planner
          </button>
          <button
            onClick={() => setActiveMode('chat')}
            className={`btn ${activeMode === 'chat' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Interactive Chat
          </button>
        </div>
      </header>

      <div className="profile-content-area">
        <div>
          {activeMode === 'auto' ? (
            <AutoPlannerTab
              weekStartDate={weekStartDate}
              setWeekStartDate={setWeekStartDate}
              currentProfile={currentProfile}
              loading={loading}
              onGenerate={handleAutoGenerate}
              hasExistingPlan={hasExistingPlan}
            />
          ) : (
            <InteractiveChatTab
              chatMessages={chatMessages}
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              loading={loading}
              onSendMessage={handleSendMessage}
              onResetChat={handleResetChat}
              hasExistingPlan={hasExistingPlan}
            />
          )}
        </div>

        <DraftMenuPreview
          draftPlan={draftPlan}
          activeDayTab={activeDayTab}
          setActiveDayTab={setActiveDayTab}
          daysOfWeek={daysOfWeek}
          editingMeal={editingMeal}
          editForm={editForm}
          setEditForm={setEditForm}
          startEditingMeal={startEditingMeal}
          setEditingMeal={setEditingMeal}
          saveEditedMeal={saveEditedMeal}
          swapMealAlternative={swapMealAlternative}
          handleSaveToCalendar={handleSaveToCalendar}
          loading={loading}
        />
      </div>
    </div>
  );
}
