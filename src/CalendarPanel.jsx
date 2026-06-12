import { useState, useEffect } from 'react'
import { MEMBER_COLORS, dateRange, todayStr } from './dataHooks'

const TH_MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
const TH_DAYS = ['อา','จ','อ','พ','พฤ','ศ','ส']

export default function CalendarPanel({ leaves, routines, members, notes, saveNote }) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState(null)
  const [noteText, setNoteText] = useState('')
  const [saved, setSaved] = useState(false)

  const memberById = (id) => members.find(m => m.id === id) || { name: id, initials: '?', color: 'purple' }

  const changeMonth = (delta) => {
    let m = viewMonth + delta
    let y = viewYear
    if (m > 11) { m = 0; y++ }
    if (m < 0) { m = 11; y-- }
    setViewMonth(m)
    setViewYear(y)
    setSelectedDay(null)
  }

  // Build leave date map
  const leaveDates = {}
  leaves.forEach(l => {
    dateRange(l.start_date, l.end_date).forEach(d => {
      if (!leaveDates[d]) leaveDates[d] = []
      leaveDates[d].push(l)
    })
  })

  const routineDays = new Set()
  routines.forEach(r => r.days.forEach(d => routineDays.add(d)))

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const todayString = todayStr()

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const detailLeaves = selectedDay ? (leaveDates[selectedDay.dateStr] || []) : []
  const detailRoutines = selectedDay ? routines.filter(r => r.days.includes(selectedDay.weekday)) : []

  useEffect(() => {
    if (selectedDay) {
      const existing = notes[selectedDay.dateStr]
      setNoteText(existing ? existing.text : '')
      setSaved(false)
    }
  }, [selectedDay, notes])

  const handleSaveNote = async () => {
    if (!selectedDay) return
    await saveNote(selectedDay.dateStr, noteText)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="content">
      <div className="cal-header">
        <span className="cal-month-label">{TH_MONTHS[viewMonth]} {viewYear}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="cal-nav-btn" onClick={() => changeMonth(-1)} aria-label="เดือนก่อนหน้า"><i className="ti ti-chevron-left"></i></button>
          <button className="cal-nav-btn" onClick={() => changeMonth(1)} aria-label="เดือนถัดไป"><i className="ti ti-chevron-right"></i></button>
        </div>
      </div>
      <div className="cal-legend">
        <span><span className="cal-legend-dot" style={{ background: '#1D9E75' }}></span>มี routine</span>
        <span><span className="cal-legend-dot" style={{ background: '#BA7517' }}></span>มีคนลา</span>
        <span><span className="cal-legend-dot" style={{ background: 'var(--accent)' }}></span>มีบันทึก</span>
        <span><span className="cal-legend-dot" style={{ background: 'var(--accent)', border: '1px solid var(--accent)' }}></span>วันนี้</span>
      </div>
      <div className="cal-grid">
        {TH_DAYS.map(d => <div className="cal-head" key={d}>{d}</div>)}
        {cells.map((d, i) => {
          if (d === null) return <div key={'e' + i}></div>
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
          const isToday = dateStr === todayString
          const weekday = new Date(viewYear, viewMonth, d).getDay()
          const hasLeave = !!leaveDates[dateStr]
          const hasRoutine = routineDays.has(weekday) && weekday !== 0 && weekday !== 6
          const hasNote = !!(notes[dateStr] && notes[dateStr].text)
          let cls = 'cal-day'
          if (isToday) cls += ' today'
          else if (hasLeave) cls += ' has-leave'
          else if (hasRoutine) cls += ' has-routine'
          return (
            <div
              key={d}
              className={cls}
              onClick={() => setSelectedDay({ d, dateStr, weekday })}
            >
              {d}
              <div style={{ display: 'flex', gap: 2, justifyContent: 'center', marginTop: 2, minHeight: 4 }}>
                {hasLeave && !isToday && <div className="cal-dot" style={{ background: '#BA7517', margin: 0 }}></div>}
                {hasRoutine && !isToday && <div className="cal-dot" style={{ background: '#1D9E75', margin: 0 }}></div>}
                {hasNote && <div className="cal-dot" style={{ background: 'var(--accent)', margin: 0 }}></div>}
              </div>
            </div>
          )
        })}
      </div>

      {selectedDay && (
        <div className="cal-detail">
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 10 }}>
            {selectedDay.d} {TH_MONTHS[viewMonth]} {viewYear}
          </div>
          {detailLeaves.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div className="sec-label" style={{ paddingTop: 0 }}>ลางาน</div>
              {detailLeaves.map(l => {
                const m = memberById(l.who)
                const colors = MEMBER_COLORS[m.color] || MEMBER_COLORS.purple
                return (
                  <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', padding: '3px 0' }}>
                    <div className="avatar sm" style={{ background: colors.bg, color: colors.text }}>{m.initials}</div>
                    {m.name} — {l.leave_type}
                  </div>
                )
              })}
            </div>
          )}
          {detailRoutines.length > 0 && selectedDay.weekday !== 0 && selectedDay.weekday !== 6 && (
            <div style={{ marginBottom: 10 }}>
              <div className="sec-label" style={{ paddingTop: 0 }}>Routine</div>
              {detailRoutines.map(r => (
                <div key={r.id} style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '3px 0' }}>
                  {r.time} — {r.title}
                </div>
              ))}
            </div>
          )}
          <div>
            <div className="sec-label" style={{ paddingTop: 0 }}>บันทึกของวันนี้</div>
            <textarea
              className="input"
              placeholder="เขียนบันทึก เช่น สรุปงาน นัดประชุม ข้อความเตือนตัวเอง..."
              style={{ minHeight: 90, resize: 'vertical' }}
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
            />
            <button className="btn" style={{ marginTop: 8, width: '100%', justifyContent: 'center' }} onClick={handleSaveNote}>
              <i className={`ti ${saved ? 'ti-check' : 'ti-device-floppy'}`} aria-hidden="true"></i>
              {saved ? 'บันทึกแล้ว' : 'บันทึก'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
