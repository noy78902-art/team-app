import { useState } from 'react'

const DAY_NAMES = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

export default function RoutinesPanel({ routines, addRoutine, deleteRoutine }) {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', time: '09:00', days: [1, 2, 3, 4, 5], note: '' })

  const toggleDay = (d) => {
    setForm(f => ({
      ...f,
      days: f.days.includes(d) ? f.days.filter(x => x !== d) : [...f.days, d].sort()
    }))
  }

  const handleAdd = async () => {
    if (!form.title.trim() || form.days.length === 0) return
    await addRoutine({
      title: form.title.trim(),
      time: form.time,
      days: form.days,
      note: form.note.trim() || null,
    })
    setForm({ title: '', time: '09:00', days: [1, 2, 3, 4, 5], note: '' })
    setShowModal(false)
  }

  return (
    <div className="content">
      <div className="notice">
        <i className="ti ti-info-circle" style={{ fontSize: 14, verticalAlign: '-2px', marginRight: 4 }} aria-hidden="true"></i>
        Routine คือกิจกรรมที่ทีมทำซ้ำทุกวัน เช่น standup ประชุม ส่งรายงาน
      </div>

      {routines.length === 0 && (
        <div className="empty-state">
          <i className="ti ti-clock" style={{ fontSize: 28, marginBottom: 8, display: 'block' }} aria-hidden="true"></i>
          ยังไม่มี routine
        </div>
      )}

      {routines.map(r => (
        <div className="card" key={r.id}>
          <div className="card-row">
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 3 }}>
                <i className="ti ti-clock" style={{ fontSize: 12, verticalAlign: '-1px', marginRight: 4 }} aria-hidden="true"></i>
                {r.time} · {r.days.map(d => DAY_NAMES[d]).join(' ')}
              </div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{r.title}</div>
              {r.note && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>{r.note}</div>}
            </div>
            <button
              onClick={() => deleteRoutine(r.id)}
              aria-label="ลบ routine"
              style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', fontSize: 16 }}
            >
              <i className="ti ti-trash" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      ))}

      <button className="add-btn" onClick={() => setShowModal(true)}>
        <i className="ti ti-plus" aria-hidden="true"></i> เพิ่ม routine ใหม่
      </button>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              เพิ่ม routine
              <button className="modal-close" onClick={() => setShowModal(false)} aria-label="ปิด"><i className="ti ti-x"></i></button>
            </div>
            <div className="form-row">
              <label>ชื่อ</label>
              <input className="input" placeholder="เช่น standup ประจำวัน" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-row">
              <label>เวลา</label>
              <input className="input" type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
            </div>
            <div className="form-row">
              <label>วัน (เลือกหลายตัว)</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                {DAY_NAMES.map((d, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleDay(i)}
                    style={{
                      fontSize: 12,
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-md)',
                      border: '0.5px solid var(--border-strong)',
                      background: form.days.includes(i) ? 'var(--accent-light)' : 'var(--surface)',
                      color: form.days.includes(i) ? 'var(--accent-dark)' : 'var(--text-secondary)',
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-row">
              <label>หมายเหตุ</label>
              <textarea className="input" placeholder="รายละเอียดเพิ่มเติม..." style={{ minHeight: 60, resize: 'vertical' }} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
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
