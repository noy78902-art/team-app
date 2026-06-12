import { useState, useEffect } from 'react'
import './App.css'
import { useMembers, useMessages, useTasks, useRoutines, useLeaves, useDayNotes, MEMBER_COLORS, todayStr } from './dataHooks'
import ChatPanel from './ChatPanel'
import TasksPanel from './TasksPanel'
import CalendarPanel from './CalendarPanel'
import RoutinesPanel from './RoutinesPanel'
import LeavesPanel from './LeavesPanel'
import LinePanel from './LinePanel'

const TABS = [
  { id: 'chat', label: 'แชท', icon: 'ti-message-circle' },
  { id: 'tasks', label: 'งาน', icon: 'ti-checklist' },
  { id: 'cal', label: 'ปฏิทิน', icon: 'ti-calendar' },
  { id: 'routine', label: 'Routine', icon: 'ti-clock' },
  { id: 'leave', label: 'ลางาน', icon: 'ti-beach' },
  { id: 'line', label: 'แจ้ง Line', icon: 'ti-brand-line' },
]

function App() {
  const { members, loading: loadingMembers } = useMembers()
  const { messages, sendMessage } = useMessages()
  const { tasks, addTask, updateTask, deleteTask } = useTasks()
  const { routines, addRoutine, deleteRoutine } = useRoutines()
  const { leaves, addLeave, deleteLeave } = useLeaves()
  const { notes, saveNote } = useDayNotes()

  const [activeTab, setActiveTab] = useState('chat')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(() => localStorage.getItem('current_user_id'))
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')

  if (loadingMembers) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-secondary)' }}>
        กำลังโหลด...
      </div>
    )
  }

  const validUser = currentUserId && members.find(m => m.id === currentUserId)

  if (!validUser) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: 16 }}>
        <div className="modal" style={{ maxWidth: 320 }}>
          <div className="modal-title">คุณคือใคร?</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
            เลือกชื่อของคุณเพื่อเริ่มใช้งาน
          </div>
          {members.map(m => {
            const colors = MEMBER_COLORS[m.color] || MEMBER_COLORS.purple
            return (
              <button
                key={m.id}
                onClick={() => { localStorage.setItem('current_user_id', m.id); setCurrentUserId(m.id) }}
                className="card"
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', border: '0.5px solid var(--border)' }}
              >
                <div className="avatar" style={{ background: colors.bg, color: colors.text }}>{m.initials}</div>
                <span style={{ fontSize: 14 }}>{m.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const currentUser = members.find(m => m.id === currentUserId)
  const todayString = todayStr()

  const isOnLeave = (memberId) => leaves.some(l => l.who === memberId && l.start_date <= todayString && l.end_date >= todayString)

  const switchTab = (tab) => {
    setActiveTab(tab)
    setMobileMenuOpen(false)
  }

  const renderPanel = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatPanel messages={messages} members={members} sendMessage={sendMessage} currentUser={currentUser} />
      case 'tasks':
        return <TasksPanel tasks={tasks} members={members} addTask={addTask} updateTask={updateTask} deleteTask={deleteTask} />
      case 'cal':
        return <CalendarPanel leaves={leaves} routines={routines} members={members} notes={notes} saveNote={saveNote} />
      case 'routine':
        return <RoutinesPanel routines={routines} addRoutine={addRoutine} deleteRoutine={deleteRoutine} />
      case 'leave':
        return <LeavesPanel leaves={leaves} members={members} addLeave={addLeave} deleteLeave={deleteLeave} />
      case 'line':
        return <LinePanel tasks={tasks} leaves={leaves} routines={routines} members={members} />
      default:
        return null
    }
  }

  return (
    <div className="app">
      <div className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div className="team-name">ทีม Creative</div>
            <div className="team-sub">{members.length} สมาชิก</div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="mobile-menu-btn"
            style={{ display: mobileMenuOpen ? 'flex' : 'none' }}
            aria-label="ปิดเมนู"
          >
            <i className="ti ti-x"></i>
          </button>
        </div>
        <div className="sec-label" style={{ paddingTop: 4 }}>เมนู</div>
        {TABS.map(t => (
          <div
            key={t.id}
            className={`nav-item ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => switchTab(t.id)}
          >
            <i className={`ti ${t.icon}`} aria-hidden="true"></i>
            {t.label}
          </div>
        ))}
        <div className="members-section">
          <div className="sec-label" style={{ paddingTop: 0 }}>ทีม</div>
          {members.map(m => {
            const colors = MEMBER_COLORS[m.color] || MEMBER_COLORS.purple
            const onLeave = isOnLeave(m.id)
            return (
              <div className="member-row" key={m.id}>
                <div className="avatar" style={{ background: colors.bg, color: colors.text }}>{m.initials}</div>
                <span className="member-name">{m.name}</span>
                {onLeave ? <span className="leave-pill">ลา</span> : <span className="dot-online"></span>}
              </div>
            )
          })}
          <button
            onClick={() => { localStorage.removeItem('current_user_id'); setCurrentUserId(null) }}
            style={{ marginTop: 8, fontSize: 12, color: 'var(--text-tertiary)', background: 'none', border: 'none', padding: '6px 8px', textAlign: 'left', width: '100%' }}
          >
            <i className="ti ti-logout" style={{ marginRight: 6 }} aria-hidden="true"></i> เปลี่ยนผู้ใช้
          </button>
        </div>
      </div>

      <div className="main">
        <div className="topbar">
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)} aria-label="เปิดเมนู">
            <i className="ti ti-menu-2"></i>
          </button>
          <span className="topbar-title">{TABS.find(t => t.id === activeTab)?.label}</span>
          <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="สลับธีม">
            <i className={`ti ${theme === 'light' ? 'ti-moon' : 'ti-sun'}`} aria-hidden="true"></i>
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {renderPanel()}
        </div>
      </div>
    </div>
  )
}

export default App
