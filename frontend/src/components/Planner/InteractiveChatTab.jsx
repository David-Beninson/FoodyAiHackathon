import { useRef, useEffect } from 'react';
import LoadingSpinner from '../Common/LoadingSpinner';

export default function InteractiveChatTab({
  chatMessages,
  inputMessage,
  setInputMessage,
  loading,
  onSendMessage,
  onResetChat,
  hasExistingPlan
}) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  return (
    <div className="card chat-card">
      <div className="card-title chat-header">
        <span>Chat with FoodyAI Planner</span>
        <button
          onClick={onResetChat}
          className="btn btn-danger"
          disabled={hasExistingPlan}
        >
          Reset Session
        </button>
      </div>

      {hasExistingPlan && (
        <div className="error-banner">
          ⚠️ This week is already planned in your calendar. Cannot run planner chat for this week.
        </div>
      )}

      <div className="chat-messages-container">
        {chatMessages.length === 0 ? (
          <div className="chat-empty-state">
            Hi! I'm your interactive weekly menu designer. Tell me what ingredients you have at home or what you feel like eating, and we'll build your plan together!
          </div>
        ) : (
          chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`chat-bubble-wrapper ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
            >
              <strong>{msg.role === 'user' ? 'You' : 'FoodyAI'}:</strong>
              <p>{msg.content}</p>
            </div>
          ))
        )}
        {loading && <LoadingSpinner message="Thinking..." />}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={onSendMessage} className="chat-input-form">
        <input
          type="text"
          placeholder={hasExistingPlan ? "Week is already planned." : "Type e.g., 'Make it high-protein'..."}
          className="form-control"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={loading || hasExistingPlan}
        />
        <button type="submit" className="btn btn-primary" disabled={loading || !inputMessage.trim() || hasExistingPlan}>
          Send
        </button>
      </form>
    </div>
  );
}
