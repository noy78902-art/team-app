import { useState } from 'react'
import { MEMBER_COLORS, dateRange } from './dataHooks'

export default function LeavesPanel({ leaves, members, addLeave, deleteLeave }) {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    who: members[0]?.id || '',
    leave_type: 'ลากิจ',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date().toISOString().slice(0, 10),
    note: '',
  })

  const memberById = (id) => members.find(m => m.id === id) || { name: id, initials: '?', color: 'purple' }

  const handleAdd = async () => {
    if (!form.who || !form.start_date || !form.end_date) return
    if (new Date(form.end_date) < new Date(form.start_date)) return
    await addLeave({
      who: form.who,
      leave_type: form.leave_type,
      start_date: form.start_date,
      end_date: form.end_date,
      note: form.note.trim() || null,
    })
    setForm({ ...form, note: '' })
    setShowModal(false)
  }

  return (
    <div className="content">
      <div className="notice">
        <i className="ti ti-info-circle" style={{ fontSize: 14, verticalAlign: '-2px', marginRight: 4 }} aria-hidden="true"></i>
        บันทึกการลาจะแสดงในปฏิทินและแถบสมาชิกด้านซ้าย
      </div>

      {leaves.length === 0 && (
        <div className="empty-state">
          <i className="ti ti-beach" style={{ fontSize: 28, marginBottom: 8, display: 'block' }} aria-hidden="true"></i>
          ยังไม่มีการลา
        </div>
      )}

      {leaves.map(l => {
        const m = memberById(l.who)
        const colors = MEMBER_COLORS[m.color] || MEMBER_COLORS.purple
        const dates = dateRange(l.start_date, l.end_date)
        const rangeLabel = dates.length === 1 ? dates[0] : `${l.start_date} ถึง ${l.end_date}`
        return (
          <div className="card" key={l.id}>
            <div className="card-row">
              <div className="avatar" style={{ background: colors.bg, color: colors.text }}>{m.initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{m.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{l.leave_type} · {rangeLabel}</div>
                {l.note && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{l.note}</div>}
              </div>
              <button
                onClick={() => deleteLeave(l.id)}
                aria-label="ลบการลา"
                style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', fontSize: 16 }}
              >
                <i className="ti ti-trash" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        )
      })}

      <button className="add-btn" onClick={() => setShowModal(true)}>
        <i className="ti ti-plus" aria-hidden="true"></i> แจ้งลางาน
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              แจ้งลางาน
              <button className="modal-close" onClick={() => setShowModal(false)} aria-label="ปิด"><i className="ti ti-x"></i></button>
            </div>
            <div className="form-row">
              <label>สมาชิก</label>
              <select className="input" value={form.who} onChange={e => setForm({ ...form, who: e.target.value })}>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label>ประเภท</label>
              <select className="input" value={form.leave_type} onChange={e => setForm({ ...form, leave_type: e.target.value })}>
                <option>ลากิจ</option>
                <option>ลาป่วย</option>
                <option>ลาพักร้อน</option>
                <option>ลาโดยไม่รับค่าจ้าง</option>
              </select>
            </div>
            <div className="form-row">
              <label>วันที่เริ่ม</label>
              <input className="input" type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div className="form-row">
              <label>วันที่สิ้นสุด</label>
              <input className="input" type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
            </div>
            <div className="form-row">
              <label>หมายเหตุ</label>
              <input className="input" placeholder="ไม่บังคับ" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
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
