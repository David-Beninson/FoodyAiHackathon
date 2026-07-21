import { useRef, useEffect, useState } from 'react';

export default function InteractiveChatTab({
  chatMessages,
  inputMessage,
  setInputMessage,
  loading,
  onSendMessage,
  onResetChat,
  onGenerateFromChat,
  confirmReset,
  hasExistingPlan
}) {
  const messagesEndRef = useRef(null);
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const hasMessages = chatMessages.length > 0;
  const hasDraftReady = chatMessages.some(m =>
    m.role === 'assistant' && (
      m.content?.toLowerCase().includes('generated') ||
      m.content?.toLowerCase().includes('menu') ||
      m.content?.toLowerCase().includes('plan')
    )
  );

  return (
    <div className="chat-card">
      {/* Header */}
      <div className="chat-header">
        <span className="chat-header-title">FoodyAI Chat Planner</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {hasMessages && (
            <button
              onClick={() => setShowHistory(h => !h)}
              className="btn-history"
              title="View conversation history"
            >
              {showHistory ? 'Hide History' : `History (${chatMessages.length})`}
            </button>
          )}
          <button
            onClick={onResetChat}
            className="btn-reset"
            disabled={hasExistingPlan || !hasMessages}
            style={confirmReset ? {
              background: 'rgba(239,68,68,0.2)',
              borderColor: 'rgba(239,68,68,0.6)',
              color: '#f87171'
            } : {}}
            title={confirmReset ? 'Click again to confirm' : 'Reset session'}
          >
            {confirmReset ? '⚠ Confirm?' : 'Reset'}
          </button>
        </div>
      </div>

      {hasExistingPlan && (
        <div className="planner-warning-banner" style={{
          margin: 0, borderRadius: 0,
          borderLeft: 'none', borderRight: 'none', borderTop: 'none'
        }}>
          ⚠ This week already has a plan saved.
        </div>
      )}

      {/* History Panel */}
      {showHistory && hasMessages && (
        <div className="chat-history-panel">
          <div className="chat-history-title">Conversation History</div>
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`chat-history-item ${msg.role} ${expandedIdx === idx ? 'expanded' : ''}`}
              onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
            >
              <div className="chat-history-row">
                <span className={`chat-history-badge ${msg.role}`}>
                  {msg.role === 'user' ? 'You' : 'AI'}
                </span>
                <span className="chat-history-preview">
                  {msg.content?.slice(0, 60)}{msg.content?.length > 60 ? '…' : ''}
                </span>
                <span className="chat-history-arrow">{expandedIdx === idx ? '▲' : '▼'}</span>
              </div>
              {expandedIdx === idx && (
                <div className="chat-history-full">{msg.content}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Live Chat Messages */}
      <div className="chat-messages-container">
        {chatMessages.length === 0 ? (
          <div className="chat-empty-state">
            <p>
              Tell me what ingredients you have at home,<br />
              your preferences, or just say <em>"generate my menu"</em> — I'll handle the rest!
            </p>
          </div>
        ) : (
          chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`chat-bubble-wrapper ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
            >
              <span className="chat-role-label">
                {msg.role === 'user' ? 'You' : 'FoodyAI'}
              </span>
              <div className="chat-bubble">{msg.content}</div>
            </div>
          ))
        )}
        {loading && (
          <div className="chat-bubble-wrapper assistant-message">
            <span className="chat-role-label">FoodyAI</span>
            <div className="chat-bubble chat-typing">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Generate CTA — shows when there are messages but no draft yet */}
      {hasMessages && !hasExistingPlan && (
        <div className="chat-generate-bar">
          <span className="chat-generate-hint">
            {hasDraftReady
              ? 'Menu generated! See it on the right →'
              : 'Ready to build your menu?'}
          </span>
          {!hasDraftReady && (
            <button
              className="btn-generate-from-chat"
              onClick={onGenerateFromChat}
              disabled={loading || hasExistingPlan}
            >
              ✦ Generate My Menu
            </button>
          )}
        </div>
      )}

      {/* Input */}
      <form onSubmit={onSendMessage} className="chat-input-form">
        <input
          type="text"
          placeholder={hasExistingPlan
            ? 'Week already planned.'
            : 'e.g. "I have chicken, rice, and eggs…"'}
          className="form-control"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={loading || hasExistingPlan}
        />
        <button
          type="submit"
          className="chat-send-btn"
          disabled={loading || !inputMessage.trim() || hasExistingPlan}
        >
          Send
        </button>
      </form>
    </div>
  );
}
