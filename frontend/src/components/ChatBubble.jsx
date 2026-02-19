import React from 'react';

/**
 * ChatBubble — renders a single chat message.
 * Props:
 *   message: { role: 'user' | 'assistant', content: string }
 */
export default function ChatBubble({ message }) {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <div style={s.wrapper(isUser)}>
      {/* Role label */}
      <div style={s.label(isUser)}>
        {isUser ? '▸ You' : '⬡ NeuralChat'}
      </div>

      {/* Bubble */}
      <div style={s.bubble(isUser, isError)}>
        {/* Left accent line for AI messages */}
        {!isUser && <div style={s.accentBar(isError)} />}

        {/* Content */}
        <div style={s.content}>
          {message.content}
        </div>

        {/* Sources badge for AI messages that have docs */}
        {!isUser && message.sourcesCount > 0 && (
          <div style={s.sourcesBadge}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {message.sourcesCount} source{message.sourcesCount !== 1 ? 's' : ''} retrieved
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  wrapper: (isUser) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: isUser ? 'flex-end' : 'flex-start',
    gap: '5px',
    animation: 'fadeUp 0.28s ease forwards',
    maxWidth: '100%',
  }),

  label: (isUser) => ({
    fontSize: '10px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    paddingLeft: isUser ? 0 : '6px',
    paddingRight: isUser ? '6px' : 0,
  }),

  bubble: (isUser, isError) => ({
    position: 'relative',
    maxWidth: '78%',
    padding: '14px 18px',
    borderRadius: isUser
      ? '18px 18px 4px 18px'
      : '18px 18px 18px 4px',
    background: isError
      ? 'rgba(239, 68, 68, 0.08)'
      : isUser
        ? 'linear-gradient(135deg, var(--accent-violet) 0%, #3730a3 100%)'
        : 'var(--bg-card)',
    border: isError
      ? '1px solid rgba(239, 68, 68, 0.3)'
      : isUser
        ? 'none'
        : '1px solid var(--border)',
    color: isError
      ? '#f87171'
      : isUser
        ? '#ffffff'
        : 'var(--text-primary)',
    boxShadow: isUser
      ? 'var(--shadow-violet)'
      : '0 2px 12px rgba(0,0,0,0.25)',
  }),

  accentBar: (isError) => ({
    position: 'absolute',
    left: 0,
    top: '18%',
    bottom: '18%',
    width: '2px',
    borderRadius: '0 1px 1px 0',
    background: isError
      ? '#f87171'
      : 'linear-gradient(to bottom, var(--accent-cyan), transparent)',
  }),

  content: {
    fontSize: '14px',
    lineHeight: '1.7',
    fontFamily: 'var(--font-mono)',
    fontWeight: '300',
    letterSpacing: '0.01em',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },

  sourcesBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    marginTop: '10px',
    padding: '4px 10px',
    borderRadius: '20px',
    background: 'var(--accent-cyan-dim)',
    border: '1px solid rgba(0,229,255,0.2)',
    color: 'var(--accent-cyan)',
    fontSize: '10px',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.05em',
  },
};
