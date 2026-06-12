import { useState } from 'react'
import { todayStr } from './dataHooks'

const STARTER_PROMPTS = [
  'สรุปงานทีมวันนี้',
  'ใครลาวันนี้บ้าง',
  'routine วันนี้มีอะไรบ้าง',
  'แนะนำการจัดลำดับงาน',
]

export default function AIPanel({ tasks, members, routines, leaves }) {
  const [history, setHistory] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState(localStorage.getItem('anthropic_api_key') || '')
  const [showKeyInput, setShowKeyInput] = useState(!localStorage.getItem('anthropic_api_key'))

  const memberById = (id) => members.find(m => m.id === id) || { name: id }

  const buildContext = () => {
    const todayString = todayStr()
    const weekday = new Date().getDay()
    const todayLeaves = leaves.filter(l => l.start_date <= todayString && l.end_date >= todayString)
      .map(l => `${memberById(l.who).name}(${l.leave_type})`).join(', ') || 'ไม่มี'
    const taskSummary = tasks.map(t => `${t.title}[${t.status},${t.pct}%,${memberById(t.who).name}${t.due_date ? ',ครบ ' + t.due_date : ''}]`).join(' | ') || 'ไม่มีงาน'
    const routineSummary = routines.filter(r => r.days.includes(weekday)).map(r => `${r.title}@${r.time}`).join(' | ') || 'ไม่มี'
    const teamNames = members.map(m => m.name).join(', ')
    return `คุณเป็น AI ผู้ช่วยทีม สมาชิก: ${teamNames}\nวันนี้: ${todayString}\nลาวันนี้: ${todayLeaves}\nงานทั้งหมด: ${taskSummary}\nRoutine วันนี้: ${routineSummary}\nตอบภาษาไทย กระชับ เป็นประโยชน์`
  }

  const saveKey = () => {
    localStorage.setItem('anthropic_api_key', apiKey.trim())
    setShowKeyInput(false)
  }

  const ask = async (question) => {
    const q = question.trim()
    if (!q) return
    if (!apiKey) {
      setShowKeyInput(true)
      return
    }
    setInput('')
    const newHistory = [...history, { role: 'user', content: q }]
    setHistory(newHistory)
    setLoading(true)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: buildContext(),
          messages: newHistory,
        }),
      })
      const data = await res.json()
      const text = data.content && data.content[0] ? data.content[0].text : 'ขอโทษ ไม่สามารถตอบได้'
      setHistory([...newHistory, { role: 'assistant', content: text }])
    } catch (e) {
      setHistory([...newHistory, { role: 'assistant', content: 'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง' }])
    }
    setLoading(false)
  }

  return (
    <div className="ai-panel">
      <div className="ai-header">
        <i className="ti ti-sparkles" style={{ fontSize: 17, color: 'var(--accent)' }} aria-hidden="true"></i>
        <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>AI ผู้ช่วย</span>
        <span className="ai-badge">Claude</span>
      </div>
      <div className="ai-body">
        {showKeyInput && (
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.6 }}>
              ใส่ Anthropic API key เพื่อเปิดใช้ AI ผู้ช่วย (เก็บไว้ในเบราว์เซอร์ของคุณเท่านั้น)
            </div>
            <input
              className="input"
              type="password"
              placeholder="sk-ant-..."
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              style={{ marginBottom: 8 }}
            />
            <button className="btn" style={{ width: '100%', justifyContent: 'center' }} onClick={saveKey}>บันทึก key</button>
          </div>
        )}
        {history.length === 0 && !showKeyInput && (
          <div className="ai-msg">
            <div className="ai-label"><i className="ti ti-sparkles" style={{ fontSize: 11, color: 'var(--accent)' }} aria-hidden="true"></i> AI</div>
            <div className="ai-bubble">สวัสดีทีม! ถามได้เลยค่ะ</div>
          </div>
        )}
        {history.map((h, i) => (
          <div className="ai-msg" key={i}>
            <div className="ai-label">{h.role === 'user' ? 'คุณ' : <><i className="ti ti-sparkles" style={{ fontSize: 11, color: 'var(--accent)' }} aria-hidden="true"></i> AI</>}</div>
            <div className={`ai-bubble ${h.role === 'user' ? 'user' : ''}`}>{h.content}</div>
          </div>
        ))}
        {loading && (
          <div className="ai-msg">
            <div className="ai-label"><i className="ti ti-sparkles" style={{ fontSize: 11, color: 'var(--accent)' }} aria-hidden="true"></i> AI</div>
            <div className="ai-bubble">...</div>
          </div>
        )}
        {history.length === 0 && !showKeyInput && STARTER_PROMPTS.map(p => (
          <button className="ai-chip" key={p} onClick={() => ask(p)}>{p}</button>
        ))}
      </div>
      <div className="ai-input-area">
        <input
          className="input"
          type="text"
          placeholder="ถาม AI..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') ask(input) }}
        />
        <button className="btn" onClick={() => ask(input)} aria-label="ส่ง"><i className="ti ti-send" aria-hidden="true"></i></button>
      </div>
    </div>
  )
}
