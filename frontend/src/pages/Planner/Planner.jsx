import { useState, useEffect } from 'react';
import './Planner.css';
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
  const [confirmReset, setConfirmReset] = useState(false);

  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  const [draftPlan, setDraftPlan] = useState(null);
  const [activeDayTab, setActiveDayTab] = useState('Sunday');
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const [editingMeal, setEditingMeal] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [hasExistingPlan, setHasExistingPlan] = useState(false);

  useEffect(() => {
    if (!userId || !weekStartDate) return;
    const checkPlanExists = async () => {
      try {
        await getWeeklyPlan(userId, weekStartDate);
        setHasExistingPlan(true);
      } catch {
        setHasExistingPlan(false);
      }
    };
    checkPlanExists();
  }, [userId, weekStartDate]);

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

  const handleAutoGenerate = async () => {
    if (!userId) return;
    setLoading(true); setError(null);
    try {
      const data = await generateAutoPlanDraft(userId, weekStartDate);
      if (data?.days) {
        setDraftPlan(data);
        showSuccessToast('Draft menu generated! Review on the right.');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate plan.');
    } finally { setLoading(false); }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !userId) return;
    const userText = inputMessage;
    setInputMessage('');
    setChatMessages(prev => [...prev, { role: 'user', content: userText }]);
    setLoading(true); setError(null);
    try {
      const session = await sendPlannerChatMessage(userId, userText);
      if (session) {
        setChatMessages(session.messages || []);
        if (session.draft_plan) setDraftPlan(session.draft_plan);
      }
    } catch (err) {
      setError('Failed to get response. ' + err);
    } finally { setLoading(false); }
  };

  const handleResetChat = async () => {
    if (!confirmReset) {
      // First click: show inline confirmation
      setConfirmReset(true);
      // Auto-cancel after 4s if user doesn't confirm
      setTimeout(() => setConfirmReset(false), 4000);
      return;
    }
    // Second click: confirmed — clear UI immediately, then sync to server
    setConfirmReset(false);
    setChatMessages([]);
    setDraftPlan(null);
    setError(null);
    if (!userId) return;
    try {
      await resetPlannerChatSession(userId);
      showSuccessToast('Session reset.');
    } catch (err) {
      // UI already cleared — just log, not worth blocking the user
      console.warn('Server reset failed (session may have already expired):', err);
    }
  };

  const handleSaveToCalendar = async () => {
    if (!userId || !draftPlan) return;
    setLoading(true); setError(null);
    try {
      await saveDraftWeeklyPlan(userId, weekStartDate, draftPlan.days);
      showSuccessToast('Weekly plan saved to Calendar!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save weekly menu.');
    } finally { setLoading(false); }
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
    setLoading(true); setError(null);
    try {
      const prompt = `Give me an alternative suggestion for ${mealType} on ${day}.`;
      const session = await sendPlannerChatMessage(userId, prompt);
      if (session) {
        setChatMessages(session.messages || []);
        if (session.draft_plan) setDraftPlan(session.draft_plan);
      }
    } catch (err) {
      setError('Failed to swap meal. ' + err);
    } finally { setLoading(false); }
  };

  const handleGenerateFromChat = async () => {
    if (!userId) return;
    setLoading(true); setError(null);
    const triggerMsg = 'Based on our conversation so far, please generate my complete weekly menu now.';
    setChatMessages(prev => [...prev, { role: 'user', content: triggerMsg }]);
    try {
      const session = await sendPlannerChatMessage(userId, triggerMsg);
      if (session) {
        setChatMessages(session.messages || []);
        if (session.draft_plan) {
          setDraftPlan(session.draft_plan);
          showSuccessToast('Weekly menu generated from your chat!');
        }
      }
    } catch (err) {
      setError('Failed to generate from chat. ' + err);
    } finally { setLoading(false); }
  };

  const showSuccessToast = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3500);
  };

  return (
    <div className="planner-page">
      {success && <div className="planner-toast">{success}</div>}

      <header className="planner-header">
        <h1 className="planner-title">Weekly Menu <span>Planner</span></h1>

        <div className="planner-mode-tabs">
          <button
            onClick={() => setActiveMode('auto')}
            className={`planner-tab-btn ${activeMode === 'auto' ? 'active' : ''}`}
          >
            Auto Planner
          </button>
          <button
            onClick={() => setActiveMode('chat')}
            className={`planner-tab-btn ${activeMode === 'chat' ? 'active' : ''}`}
          >
            Interactive Chat
          </button>
        </div>
      </header>

      {error && (
        <div style={{ padding: '0 48px', marginTop: '16px' }}>
          <div className="planner-error-banner">⚠ {error}</div>
        </div>
      )}

      <div className="planner-body">
        <div className="planner-left-panel">
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
              onGenerateFromChat={handleGenerateFromChat}
              confirmReset={confirmReset}
              hasExistingPlan={hasExistingPlan}
            />
          )}
        </div>

        <div className="planner-right-panel">
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
    </div>
  );
}
