import { useEffect, useRef, useState, useCallback } from 'react'
import { X, Send, Loader2, MessageSquare } from 'lucide-react'
import { askAssistant } from '@/lib/aiService'

/**
 * AiAssistantPanel
 *
 * Right-side slide-over panel for the WorkLedger AI Assistant.
 *
 * Design.md compliance:
 *   - ~400px wide on desktop, full-screen on mobile (md breakpoint)
 *   - Rectangular, bordered message containers (not pill bubbles)
 *   - User messages: #1F3D3A (--primary) background, #FAFAF8 text
 *   - Assistant messages: #FFFFFF (--card) background, 1px solid #E3E1DC border
 *   - Suggested-question chips: outline button style matching the rest of the app
 *   - 4–6px radius, flat surfaces, no gradient, no glow, no sparkle icons
 *   - 150ms ease transitions (Design.md §9)
 *
 * Accessibility:
 *   - role="dialog" + aria-modal="true" + aria-label
 *   - Focus trap: first interactive element receives focus on open; Tab cycles
 *     inside the panel; Escape closes.
 *   - Close button has aria-label="Close AI Assistant".
 *   - Message list has role="log" + aria-live="polite".
 *   - Input has an associated label (visually hidden).
 *
 * State management:
 *   - Messages are kept in component memory only — they reset on unmount/refresh.
 *   - No persistent storage, no chat database table.
 *
 * @param {{ isOpen: boolean, onClose: () => void }} props
 */

const SUGGESTED_QUESTIONS = [
  'What is my total unpaid invoice amount?',
  'Which tasks are due soon?',
  'Which projects are currently active?',
  'Am I overloaded?',
]

/** A single chat message record: { id, role: 'user'|'assistant'|'error', text } */
let _msgId = 0
function makeMessage(role, text) {
  return { id: ++_msgId, role, text }
}

export default function AiAssistantPanel({ isOpen, onClose }) {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const panelRef = useRef(null)
  const inputRef = useRef(null)
  const closeButtonRef = useRef(null)
  const messagesEndRef = useRef(null)

  // ── Focus management ────────────────────────────────────────────────────────
  // Move focus into the panel when it opens.
  useEffect(() => {
    if (isOpen) {
      // Small delay to let CSS transition start before stealing focus
      const t = setTimeout(() => {
        closeButtonRef.current?.focus()
      }, 60)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  // Trap focus inside the panel while it is open.
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      const panel = panelRef.current
      if (!panel) return

      const focusable = panel.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Scroll to the latest message whenever messages change.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // ── Submit logic ─────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (question) => {
      const q = (question ?? inputValue).trim()
      if (!q || isLoading) return

      setInputValue('')
      setMessages((prev) => [...prev, makeMessage('user', q)])
      setIsLoading(true)

      const result = await askAssistant(q)

      setIsLoading(false)
      if (result.error) {
        setMessages((prev) => [...prev, makeMessage('error', result.error)])
      } else {
        setMessages((prev) => [...prev, makeMessage('assistant', result.answer)])
      }

      // Return focus to the input after the response arrives.
      requestAnimationFrame(() => inputRef.current?.focus())
    },
    [inputValue, isLoading],
  )

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  // Render the overlay + panel into a portal so it sits above all page content.
  // Using a plain conditional render rather than a Portal so we stay inside
  // the existing React tree and avoid adding ReactDOM.createPortal here.
  if (!isOpen) return null

  const isEmpty = messages.length === 0

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(20, 22, 26, 0.4)' }}
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="AI Assistant"
        className="fixed inset-y-0 right-0 z-50 flex flex-col w-full md:w-[400px]"
        style={{
          backgroundColor: '#FFFFFF',
          borderLeft: '1px solid #E3E1DC',
        }}
      >
        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-5 h-14 flex-shrink-0"
          style={{ borderBottom: '1px solid #E3E1DC' }}
        >
          <div className="flex items-center gap-2.5">
            <MessageSquare
              size={15}
              style={{ color: '#1F3D3A' }}
              aria-hidden="true"
            />
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: '#1F3D3A', fontFamily: 'var(--font-heading)', letterSpacing: '0.1em' }}
            >
              AI Assistant
            </span>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close AI Assistant"
            className="p-1.5 -mr-1 rounded"
            style={{ color: '#6B7078' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#14161A' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#6B7078' }}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* ── Message list ──────────────────────────────────────────────────── */}
        <div
          role="log"
          aria-live="polite"
          aria-label="Conversation"
          className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 min-h-0"
        >
          {/* Empty state — suggested questions */}
          {isEmpty && (
            <div className="flex flex-col gap-4 mt-2">
              <p className="text-xs" style={{ color: '#6B7078' }}>
                Ask a question about your clients, projects, tasks, or invoices.
              </p>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#6B7078' }}>
                  Suggested
                </span>
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSubmit(q)}
                    disabled={isLoading}
                    className="text-left text-xs px-3 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      border: '1px solid #E3E1DC',
                      color: '#14161A',
                      backgroundColor: 'transparent',
                    }}
                    onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = '#F0EFEC' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat messages */}
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div
              className="flex items-center gap-2 px-3 py-2.5 text-xs rounded self-start"
              style={{
                border: '1px solid #E3E1DC',
                color: '#6B7078',
                backgroundColor: '#FFFFFF',
                borderRadius: '4px',
              }}
              aria-label="AI is thinking"
            >
              <Loader2 size={13} className="animate-spin" aria-hidden="true" />
              <span>Thinking…</span>
            </div>
          )}

          <div ref={messagesEndRef} aria-hidden="true" />
        </div>

        {/* ── Input area ────────────────────────────────────────────────────── */}
        <div
          className="flex-shrink-0 px-5 py-4"
          style={{ borderTop: '1px solid #E3E1DC' }}
        >
          {/* Visually hidden label for accessibility */}
          <label htmlFor="ai-question-input" className="sr-only">
            Ask a question
          </label>
          <div className="flex gap-2 items-end">
            <textarea
              id="ai-question-input"
              ref={inputRef}
              rows={2}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Ask about your projects, tasks, invoices…"
              className="flex-1 resize-none text-sm px-3 py-2 rounded outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                border: '1px solid #E3E1DC',
                backgroundColor: '#FAFAF8',
                color: '#14161A',
                fontFamily: 'var(--font-sans)',
                borderRadius: '4px',
                lineHeight: '1.5',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#1F3D3A' }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#E3E1DC' }}
            />
            <button
              onClick={() => handleSubmit()}
              disabled={isLoading || !inputValue.trim()}
              aria-label="Send question"
              className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: '#1F3D3A',
                color: '#FAFAF8',
                borderRadius: '4px',
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#2d5955'
              }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#1F3D3A' }}
            >
              <Send size={14} aria-hidden="true" />
            </button>
          </div>
          <p className="text-[10px] mt-2" style={{ color: '#6B7078' }}>
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </>
  )
}

// ── ChatMessage ───────────────────────────────────────────────────────────────

/**
 * Renders a single message bubble.
 * User messages: primary background (#1F3D3A) + light text.
 * Assistant messages: card (#FFFFFF) + border.
 * Error messages: destructive red border + muted text.
 */
function ChatMessage({ message }) {
  const isUser = message.role === 'user'
  const isError = message.role === 'error'

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className="text-xs leading-relaxed px-3 py-2.5 max-w-[88%] whitespace-pre-wrap"
        style={{
          borderRadius: '4px',
          ...(isUser
            ? {
                backgroundColor: '#1F3D3A',
                color: '#FAFAF8',
              }
            : isError
              ? {
                  border: '1px solid #C23B22',
                  color: '#C23B22',
                  backgroundColor: '#FFFFFF',
                }
              : {
                  border: '1px solid #E3E1DC',
                  color: '#14161A',
                  backgroundColor: '#FFFFFF',
                }),
        }}
        // Role for screen readers
        role={isError ? 'alert' : undefined}
      >
        {message.text}
      </div>
    </div>
  )
}
