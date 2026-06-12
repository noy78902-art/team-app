import { useState } from 'react'
import { MEMBER_COLORS } from './dataHooks'

const STATUS_LABEL = { todo: 'รอทำ', doing: 'กำลังทำ', done: 'เสร็จ' }

export default function TasksPanel({ tasks, members, addTask, updateTask, deleteTask }) {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', who: members[0]?.id || '', due_date: '', hot: false })

  const memberById = (id) => members.find(m => m.id === id) || { name: id, initials: '?', color: 'purple' }

  const groups = {
    doing: tasks.filter(t => t.status === 'doing'),
    todo: tasks.filter(t => t.status === 'todo'),
    done: tasks.filter(t => t.status === 'done'),
  }

  const handleAdd = async () => {
    if (!form.title.trim()) return
    await addTask({
      title: form.title.trim(),
      status: 'todo',
      pct: 0,
      who: form.who,
      due_date: form.due_date || null,
      hot: form.hot,
    })
    setForm({ title: '', who: members[0]?.id || '', due_date: '', hot: false })
    setShowModal(false)
  }

  const cycleStatus = (task) => {
    const order = ['todo', 'doing', 'done']
    const idx = order.indexOf(task.status)
    const next = order[(idx + 1) % order.length]
    const pct = next === 'done' ? 100 : next === 'todo' ? 0 : (task.pct || 0)
    updateTask(task.id, { status: next, pct })
  }

  const formatDate = (d) => {
    if (!d) return ''
    const date = new Date(d)
    const months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']
    return `${date.getDate()} ${months[date.getMonth()]}`
  }

  const renderTask = (t) => {
    const m = memberById(t.who)
    const colors = MEMBER_COLORS[m.color] || MEMBER_COLORS.purple
    return (
      <div className="card" key={t.id}>
        <div className="card-row">
          <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{t.title}</span>
          <button
            className="tag"
            style={{
              border: 'none',
              cursor: 'pointer',
              background: t.status === 'doing' ? '#B5D4F4' : t.status === 'done' ? '#9FE1CB' : '#FAC775',
              color: t.status === 'doing' ? '#0C447C' : t.status === 'done' ? '#085041' : '#633806',
            }}
            onClick={() => cycleStatus(t)}
            title="คลิกเพื่อเปลี่ยนสถานะ"
          >
            {STATUS_LABEL[t.status]}
          </button>
          {t.hot && <span className="tag tag-hot">ด่วน</span>}
          <button
            onClick={() => deleteTask(t.id)}
            aria-label="ลบงาน"
            style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', fontSize: 16 }}
          >
            <i className="ti ti-trash" aria-hidden="true"></i>
          </button>
        </div>
        {t.status !== 'todo' && (
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${t.pct || 0}%` }}></div></div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div className="avatar sm" style={{ background: colors.bg, color: colors.text }}>{m.initials}</div>
            {m.name}
          </div>
          {t.due_date && <span>· ครบ {formatDate(t.due_date)}</span>}
        </div>
      </div>
    )
  }

  return (
    <div className="content">
      {groups.doing.length > 0 && <>
        <div className="sec-label" style={{ paddingTop: 0 }}>กำลังทำ</div>
        {groups.doing.map(renderTask)}
      </>}
      {groups.todo.length > 0 && <>
        <div className="sec-label">รอทำ</div>
        {groups.todo.map(renderTask)}
      </>}
      {groups.done.length > 0 && <>
        <div className="sec-label">เสร็จแล้ว</div>
        {groups.done.map(renderTask)}
      </>}
      {tasks.length === 0 && (
        <div className="empty-state">
          <i className="ti ti-checklist" style={{ fontSize: 28, marginBottom: 8, display: 'block' }} aria-hidden="true"></i>
          ยังไม่มีงาน เริ่มเพิ่มงานแรกได้เลย
        </div>
      )}
      <button className="add-btn" onClick={() => setShowModal(true)}>
        <i className="ti ti-plus" aria-hidden="true"></i> เพิ่มงานใหม่
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              เพิ่มงานใหม่
              <button className="modal-close" onClick={() => setShowModal(false)} aria-label="ปิด"><i className="ti ti-x"></i></button>
            </div>
            <div className="form-row">
              <label>ชื่องาน</label>
              <input className="input" placeholder="เช่น สร้างโพสต์ Instagram" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-row">
              <label>มอบหมายให้</label>
              <select className="input" value={form.who} onChange={e => setForm({ ...form, who: e.target.value })}>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label>ครบกำหนด</label>
              <input className="input" type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
            </div>
            <div className="form-row">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.hot} onChange={e => setForm({ ...form, hot: e.target.checked })} style={{ width: 'auto' }} />
                ทำเครื่องหมายว่าด่วน
              </label>
            </div>
            <button className="btn" style={{ width: '100%', justifyContent: 'center' }} onClick={handleAdd}>
              <i className="ti ti-check" aria-hidden="true"></i> บันทึก
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
