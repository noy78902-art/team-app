import { useState, useRef, useEffect } from 'react'
import { MEMBER_COLORS } from './dataHooks'

export default function ChatPanel({ messages, members, sendMessage, currentUser }) {
  const [text, setText] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const memberById = (id) => members.find(m => m.id === id) || { name: id, initials: '?', color: 'purple' }

  const handleSend = async () => {
    const t = text.trim()
    if (!t) return
    setText('')
    await sendMessage(currentUser.id, t)
  }

  const formatTime = (ts) => {
    const d = new Date(ts)
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="content" ref={scrollRef} style={{ flex: 1 }}>
        {messages.length === 0 && (
          <div className="empty-state">
            <i className="ti ti-message-circle" style={{ fontSize: 28, marginBottom: 8, display: 'block' }} aria-hidden="true"></i>
            ยังไม่มีข้อความ เริ่มคุยกับทีมได้เลย
          </div>
        )}
        {messages.map(m => {
          const mem = memberById(m.who)
          const colors = MEMBER_COLORS[mem.color] || MEMBER_COLORS.purple
          const isMe = m.who === currentUser.id
          return (
            <div className={`msg-row ${isMe ? 'me' : ''}`} key={m.id}>
              <div className="avatar" style={{ background: colors.bg, color: colors.text }}>{mem.initials}</div>
              <div style={{ textAlign: isMe ? 'right' : 'left' }}>
                <div className="msg-meta">{mem.name} · {formatTime(m.created_at)}</div>
                <div className={`bubble ${isMe ? 'me' : ''}`}>
                  <div className="msg-text">{m.text}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="chat-input-area">
        <input
          className="input"
          type="text"
          placeholder="พิมพ์ข้อความ..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
        />
        <button className="btn" onClick={handleSend} aria-label="ส่งข้อความ">
          <i className="ti ti-send" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  )
}
