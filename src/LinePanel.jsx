import { useState, useMemo } from 'react'
import { todayStr } from './dataHooks'

export default function LinePanel({ tasks, leaves, routines, members }) {
  const [copiedKey, setCopiedKey] = useState(null)

  const memberById = (id) => members.find(m => m.id === id) || { name: id }

  const today = new Date()
  const todayString = todayStr()
  const weekday = today.getDay()
  const dateLabel = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`

  const overdueTasks = useMemo(() => tasks.filter(t => t.status !== 'done' && t.hot), [tasks])
  const doingTasks = useMemo(() => tasks.filter(t => t.status === 'doing'), [tasks])
  const todayLeaves = useMemo(() => leaves.filter(l => l.start_date <= todayString && l.end_date >= todayString), [leaves, todayString])
  const todayRoutines = useMemo(() => routines.filter(r => r.days.includes(weekday) && weekday !== 0 && weekday !== 6), [routines, weekday])

  const urgentText = useMemo(() => {
    if (overdueTasks.length === 0) return 'ไม่มีงานด่วนในขณะนี้'
    let txt = `🚨 แจ้งเตือน — งานด่วนทีม\n━━━━━━━━━━━━━━━━\n`
    overdueTasks.forEach(t => {
      txt += `⚠️ ${t.title}\n   ผู้รับผิดชอบ: ${memberById(t.who).name}\n   ครบกำหนด: ${t.due_date || '-'}\n`
    })
    txt += `━━━━━━━━━━━━━━━━\nโปรดดูในแอปเพื่ออัปเดตสถานะ`
    return txt
  }, [overdueTasks, members])

  const morningText = useMemo(() => {
    let txt = `☀️ สรุปเช้า — ${dateLabel}\n━━━━━━━━━━━━━━━━\n`
    if (todayLeaves.length) {
      txt += `🏖️ ลางาน:\n`
      todayLeaves.forEach(l => { txt += `   • ${memberById(l.who).name} (${l.leave_type})\n` })
    } else {
      txt += `✅ ทุกคนมาครบวันนี้\n`
    }
    if (todayRoutines.length) {
      txt += `\n📋 Routine วันนี้:\n`
      todayRoutines.forEach(r => { txt += `   • ${r.time} — ${r.title}\n` })
    }
    txt += `━━━━━━━━━━━━━━━━\nขอให้ทุกคนมีวันที่ดีนะคะ`
    return txt
  }, [todayLeaves, todayRoutines, members, dateLabel])

  const eveningText = useMemo(() => {
    let txt = `🌙 สรุปเย็น — ${dateLabel}\n━━━━━━━━━━━━━━━━\n`
    if (doingTasks.length) {
      txt += `📌 งานที่กำลังทำ:\n`
      doingTasks.forEach(t => { txt += `   • ${t.title} (${t.pct}%) — ${memberById(t.who).name}\n` })
    }
    if (overdueTasks.length) {
      txt += `\n⚠️ งานด่วนที่ยังค้าง:\n`
      overdueTasks.forEach(t => { txt += `   • ${t.title} — ${memberById(t.who).name}\n` })
    }
    if (!doingTasks.length && !overdueTasks.length) {
      txt += `ไม่มีงานที่กำลังดำเนินการ\n`
    }
    txt += `━━━━━━━━━━━━━━━━\nอัปเดตสถานะได้ในแอปนะคะ`
    return txt
  }, [doingTasks, overdueTasks, members, dateLabel])

  const copy = async (key, text) => {
    if (text === 'ไม่มีงานด่วนในขณะนี้') return
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // fallback handled by selection below
    }
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2500)
  }

  const cards = [
    { key: 'urgent', icon: 'ti-alert-circle', iconColor: '#E24B4A', title: 'แจ้งด่วน — งานเกินกำหนด', text: urgentText },
    { key: 'morning', icon: 'ti-sun', iconColor: '#BA7517', title: 'สรุปเช้า — routine + ใครลาวันนี้', text: morningText },
    { key: 'evening', icon: 'ti-moon', iconColor: 'var(--accent)', title: 'สรุปเย็น — งานที่ทำวันนี้', text: eveningText },
  ]

  return (
    <div className="content">
      <div className="notice">
        <i className="ti ti-info-circle" style={{ fontSize: 14, verticalAlign: '-2px', marginRight: 4 }} aria-hidden="true"></i>
        กดปุ่มเพื่อสร้างข้อความ แล้ว copy ไป paste ใน Line group ของทีม
      </div>
      {cards.map(c => (
        <div className="card" key={c.key}>
          <div className="card-row" style={{ marginBottom: 10 }}>
            <i className={`ti ${c.icon}`} style={{ fontSize: 18, color: c.iconColor }} aria-hidden="true"></i>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{c.title}</span>
          </div>
          <div className="line-preview">{c.text}</div>
          <button
            className={`btn btn-line ${copiedKey === c.key ? 'copied' : ''}`}
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => copy(c.key, c.text)}
          >
            <i className={`ti ${copiedKey === c.key ? 'ti-check' : 'ti-copy'}`} aria-hidden="true"></i>
            {copiedKey === c.key ? 'copy แล้ว — ไป paste ใน Line ได้เลย' : 'สร้างและ copy ข้อความ'}
          </button>
        </div>
      ))}
    </div>
  )
}
