import React, { useState, useRef, useEffect } from 'react'
import { api } from '../context/AuthContext.jsx'

const SUGGESTIONS = [
  '¿Cómo funcionan los puntos?',
  '¿Qué es la corrección diaria?',
  '¿Cómo hago un pick?',
  '¿Qué pasa si hay retiro?',
]

function formatText(text) {
  // Bold **text**
  let t = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  // Line breaks
  t = t.replace(/\n/g, '<br/>')
  return t
}

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '¡Buenas! 🎾 Soy el asistente de Wimbledon 2026. Preguntame sobre reglas, puntos, picks o lo que necesites.' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return

    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setInput('')
    setLoading(true)

    try {
      const { data } = await api.post('/assistant/chat', { message: msg })
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Disculpá, tuve un problema. Intentá de nuevo.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: 'calc(100vh - 112px)',
      maxWidth: 430, margin: '0 auto', width: '100%',
    }}>
      {/* Messages area */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px 16px 8px',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '82%', padding: '10px 14px', borderRadius: 16,
              background: m.role === 'user'
                ? 'var(--green)'
                : 'var(--card-bg)',
              color: m.role === 'user'
                ? '#fff'
                : 'var(--text)',
              fontSize: 14, lineHeight: 1.55,
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              borderBottomRightRadius: m.role === 'user' ? 4 : 16,
              borderBottomLeftRadius: m.role === 'assistant' ? 4 : 16,
              wordBreak: 'break-word',
            }}
              dangerouslySetInnerHTML={{ __html: formatText(m.text) }}
            />
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '12px 18px', borderRadius: 16, borderBottomLeftRadius: 4,
              background: 'var(--card-bg)', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            }}>
              <div style={{ display: 'flex', gap: 4 }}>
                <span className="dot-pulse" />
                <span className="dot-pulse" style={{ animationDelay: '.15s' }} />
                <span className="dot-pulse" style={{ animationDelay: '.3s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Suggestions (only if few messages) */}
      {messages.length <= 1 && (
        <div style={{
          display: 'flex', gap: 8, padding: '0 16px 10px', flexWrap: 'wrap',
        }}>
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => send(s)} style={{
              padding: '8px 14px', borderRadius: 20, border: '1px solid var(--border)',
              background: 'var(--card-bg)', color: 'var(--text-mid)',
              fontSize: 12, fontWeight: 500, cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div style={{
        padding: '10px 16px 12px', borderTop: '1px solid var(--border)',
        display: 'flex', gap: 10, alignItems: 'flex-end',
        background: 'var(--card-bg)',
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Preguntame sobre el torneo..."
          rows={1}
          style={{
            flex: 1, resize: 'none', border: '1px solid var(--border)',
            borderRadius: 12, padding: '10px 14px', fontSize: 14,
            background: 'var(--input-bg)', color: 'var(--text)',
            outline: 'none', maxHeight: 80, lineHeight: 1.4,
            fontFamily: 'inherit',
          }}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          style={{
            width: 40, height: 40, borderRadius: 12, border: 'none',
            background: input.trim() ? 'var(--green)' : 'var(--border)',
            color: input.trim() ? '#fff' : 'var(--text-muted)',
            cursor: input.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'background .15s',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  )
}