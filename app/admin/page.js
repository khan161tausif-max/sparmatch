'use client'
import { useState } from 'react'

const TABS = [
  { id: 'fighters', label: '🥊 Fighters' },
  { id: 'matches', label: '⚡ Matches' },
  { id: 'waitlist', label: '📋 Waitlist' },
  { id: 'gyms', label: '🏟️ Gym Partners' },
  { id: 'officials', label: '👨‍⚖️ Officials' },
]

const sportColor = { MMA: '#D85A30', Boxing: '#3B8BD4', 'Muay Thai': '#639922', BJJ: '#7F77DD', Wrestling: '#BA7517' }
const emptyEvent = { gym_name: '', gym_address: '', event_date: '', referee: '', judge1: '', judge2: '', notes: '' }

export default function Admin() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [adminPw, setAdminPw] = useState('')

  const [stats, setStats] = useState(null)
  const [activeTab, setActiveTab] = useState('fighters')
  const [data, setData] = useState([])
  const [tabLoading, setTabLoading] = useState(false)
  const [eventModal, setEventModal] = useState(null)
  const [eventForm, setEventForm] = useState(emptyEvent)
  const [eventSaving, setEventSaving] = useState(false)
  const [eventMsg, setEventMsg] = useState('')

  const headers = (pw) => ({ 'Content-Type': 'application/json', 'x-admin-password': pw })

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    try {
      const res = await fetch('/api/admin?table=stats', { headers: { 'x-admin-password': password } })
      if (res.status === 403) { setLoginError('Wrong password.'); return }
      if (!res.ok) { setLoginError('Server error. Try again.'); return }
      const statsData = await res.json()
      setStats(statsData)
      setAdminPw(password)
      setAuthed(true)
      loadTab('fighters', password)
    } catch (err) {
      setLoginError(`Cannot reach server: ${err.message}`)
    }
  }

  const loadTab = async (tab, pw) => {
    const usePw = pw || adminPw
    setActiveTab(tab)
    setTabLoading(true)
    const res = await fetch(`/api/admin?table=${tab}`, { headers: { 'x-admin-password': usePw } })
    setData(await res.json())
    setTabLoading(false)
  }

  const saveEvent = async () => {
    setEventSaving(true)
    setEventMsg('')
    const res = await fetch('/api/admin/event', {
      method: 'POST',
      headers: headers(adminPw),
      body: JSON.stringify({ match_id: eventModal.id, ...eventForm })
    })
    setEventMsg(res.ok ? '✓ Event saved! Fighters can now see it in their chat.' : 'Something went wrong.')
    setEventSaving(false)
  }

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

  if (!authed) return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '340px' }}>
        <div style={{ fontSize: '22px', fontWeight: '800', marginBottom: '4px', color: '#fff' }}>
          Spar<span style={{ color: '#D85A30' }}>rd</span> <span style={{ fontSize: '14px', color: '#555', fontWeight: '600' }}>Admin</span>
        </div>
        <p style={{ color: '#555', fontSize: '14px', marginBottom: '28px' }}>Enter your admin password</p>
        {loginError && <p style={{ color: '#ff4444', fontSize: '13px', marginBottom: '16px' }}>{loginError}</p>}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input type="password" placeholder="Admin password" required value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ padding: '14px', borderRadius: '10px', border: '1px solid #2a2a2a', background: '#1a1a1a', color: '#fff', fontSize: '15px' }} />
          <button type="submit" style={{ padding: '14px', borderRadius: '10px', background: '#D85A30', color: '#fff', fontWeight: '700', fontSize: '15px', border: 'none', cursor: 'pointer' }}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'sans-serif' }}>

      {/* Event modal */}
      {eventModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setEventModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#111', border: '1px solid #222', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <div style={{ fontWeight: '800', fontSize: '18px' }}>Assign Event</div>
                <div style={{ color: '#666', fontSize: '13px', marginTop: '4px' }}>{eventModal.user1?.name} vs {eventModal.user2?.name}</div>
              </div>
              <button onClick={() => setEventModal(null)} style={{ background: '#1e1e1e', border: 'none', color: '#888', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Gym Name', field: 'gym_name', placeholder: 'e.g. Knockout MMA, Kothrud' },
                { label: 'Address', field: 'gym_address', placeholder: 'Full address' },
                { label: 'Date & Time', field: 'event_date', type: 'datetime-local' },
                { label: 'Referee', field: 'referee', placeholder: 'Name' },
                { label: 'Judge 1', field: 'judge1', placeholder: 'Name' },
                { label: 'Judge 2', field: 'judge2', placeholder: 'Name' },
              ].map(({ label, field, placeholder, type }) => (
                <div key={field}>
                  <div style={{ fontSize: '11px', color: '#555', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{label}</div>
                  <input type={type || 'text'} placeholder={placeholder} value={eventForm[field]}
                    onChange={e => setEventForm(f => ({ ...f, [field]: e.target.value }))}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #2a2a2a', background: '#1a1a1a', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div>
                <div style={{ fontSize: '11px', color: '#555', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Notes</div>
                <textarea placeholder="Additional info for fighters..." value={eventForm.notes}
                  onChange={e => setEventForm(f => ({ ...f, notes: e.target.value }))}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #2a2a2a', background: '#1a1a1a', color: '#fff', fontSize: '14px', boxSizing: 'border-box', height: '72px', resize: 'none' }} />
              </div>
              {eventMsg && <div style={{ color: eventMsg.startsWith('✓') ? '#4caf50' : '#ff4444', fontSize: '13px' }}>{eventMsg}</div>}
              <button onClick={saveEvent} disabled={eventSaving} style={{ padding: '14px', borderRadius: '12px', background: '#D85A30', color: 'white', fontWeight: '700', fontSize: '15px', border: 'none', cursor: 'pointer', marginTop: '4px' }}>
                {eventSaving ? 'Saving...' : 'Save Event →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: '16px 28px', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0d0d0d' }}>
        <div>
          <span style={{ fontSize: '20px', fontWeight: '800' }}>Spar<span style={{ color: '#D85A30' }}>rd</span></span>
          <span style={{ marginLeft: '10px', fontSize: '12px', color: '#555', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Admin</span>
        </div>
        <button onClick={() => { setAuthed(false); setAdminPw(''); setPassword('') }} style={{ background: 'none', border: '1px solid #333', color: '#888', padding: '7px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Sign out</button>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '36px' }}>
            {[
              { label: 'Fighters', value: stats.fighters, icon: '🥊', color: '#D85A30' },
              { label: 'Matches', value: stats.matches, icon: '⚡', color: '#f59e0b' },
              { label: 'Waitlist', value: stats.waitlist, icon: '📋', color: '#3B8BD4' },
              { label: 'Gym Partners', value: stats.gyms, icon: '🏟️', color: '#639922' },
              { label: 'Officials', value: stats.officials, icon: '👨‍⚖️', color: '#7F77DD' },
            ].map(s => (
              <div key={s.label} style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '20px' }}>
                <div style={{ fontSize: '22px', marginBottom: '8px' }}>{s.icon}</div>
                <div style={{ fontSize: '32px', fontWeight: '800', color: s.color, lineHeight: 1 }}>{s.value ?? 0}</div>
                <div style={{ fontSize: '12px', color: '#555', fontWeight: '600', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid #1a1a1a' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => loadTab(t.id)} style={{
              padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: '600', color: activeTab === t.id ? '#D85A30' : '#555',
              borderBottom: activeTab === t.id ? '2px solid #D85A30' : '2px solid transparent', marginBottom: '-1px'
            }}>{t.label}</button>
          ))}
        </div>

        {/* Table */}
        {tabLoading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#555' }}>Loading...</div>
        ) : !Array.isArray(data) || data.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#444', fontSize: '15px' }}>No records yet</div>
        ) : (
          <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                    {activeTab === 'fighters' && ['Name', 'Sport', 'Level', 'Weight', 'City', 'Gym', 'Fights', 'Joined'].map(h => <Th key={h}>{h}</Th>)}
                    {activeTab === 'matches' && ['Fighter 1', 'Fighter 2', 'Date', ''].map(h => <Th key={h}>{h}</Th>)}
                    {activeTab === 'waitlist' && ['Email', 'Joined'].map(h => <Th key={h}>{h}</Th>)}
                    {activeTab === 'gyms' && ['Gym', 'Contact', 'Email', 'Phone', 'City', 'Capacity', 'Date'].map(h => <Th key={h}>{h}</Th>)}
                    {activeTab === 'officials' && ['Name', 'Email', 'Roles', 'City', 'Experience', 'Date'].map(h => <Th key={h}>{h}</Th>)}
                  </tr>
                </thead>
                <tbody>
                  {activeTab === 'fighters' && data.map((r, i) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #141414', background: i % 2 ? '#080808' : 'transparent' }}>
                      <Td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#2a2a2a', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#D85A30' }}>
                            {r.avatar_url ? <img src={r.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : r.name?.[0]?.toUpperCase()}
                          </div>
                          <span style={{ fontWeight: '600' }}>{r.name}</span>
                        </div>
                      </Td>
                      <Td><span style={{ color: sportColor[r.sport] || '#888', fontWeight: '600' }}>{r.sport || '—'}</span></Td>
                      <Td>{r.level || '—'}</Td>
                      <Td>{r.weight_kg ? `${r.weight_kg} kg` : '—'}</Td>
                      <Td>{r.city || '—'}</Td>
                      <Td dim>{r.gym_name || '—'}</Td>
                      <Td>{r.fights ?? 0}</Td>
                      <Td dim>{fmt(r.created_at)}</Td>
                    </tr>
                  ))}
                  {activeTab === 'matches' && data.map((r, i) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #141414', background: i % 2 ? '#080808' : 'transparent' }}>
                      <Td><strong>{r.user1?.name}</strong> <span style={{ color: sportColor[r.user1?.sport] || '#666', fontSize: '11px' }}>{r.user1?.sport}</span></Td>
                      <Td><strong>{r.user2?.name}</strong> <span style={{ color: sportColor[r.user2?.sport] || '#666', fontSize: '11px' }}>{r.user2?.sport}</span></Td>
                      <Td dim>{fmt(r.created_at)}</Td>
                      <td style={{ padding: '8px 16px' }}>
                        <button onClick={() => { setEventForm(emptyEvent); setEventMsg(''); setEventModal(r) }} style={{ background: '#D85A30', border: 'none', color: 'white', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                          Assign Event
                        </button>
                      </td>
                    </tr>
                  ))}
                  {activeTab === 'waitlist' && data.map((r, i) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #141414', background: i % 2 ? '#080808' : 'transparent' }}>
                      <Td>{r.email}</Td>
                      <Td dim>{fmt(r.created_at)}</Td>
                    </tr>
                  ))}
                  {activeTab === 'gyms' && data.map((r, i) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #141414', background: i % 2 ? '#080808' : 'transparent' }}>
                      <Td><strong>{r.gym_name}</strong></Td>
                      <Td>{r.contact_name || '—'}</Td>
                      <Td dim>{r.email}</Td>
                      <Td dim>{r.phone || '—'}</Td>
                      <Td>{r.city || '—'}</Td>
                      <Td>{r.capacity ? `${r.capacity} pax` : '—'}</Td>
                      <Td dim>{fmt(r.created_at)}</Td>
                    </tr>
                  ))}
                  {activeTab === 'officials' && data.map((r, i) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #141414', background: i % 2 ? '#080808' : 'transparent' }}>
                      <Td><strong>{r.name}</strong></Td>
                      <Td dim>{r.email}</Td>
                      <Td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {(r.roles || []).map(role => (
                            <span key={role} style={{ background: '#1a0f00', border: '1px solid #D85A30', borderRadius: '10px', padding: '2px 8px', fontSize: '11px', color: '#D85A30', fontWeight: '600' }}>{role}</span>
                          ))}
                        </div>
                      </Td>
                      <Td>{r.city || '—'}</Td>
                      <Td>{r.experience_years ? `${r.experience_years} yrs` : '—'}</Td>
                      <Td dim>{fmt(r.created_at)}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid #1a1a1a', color: '#444', fontSize: '12px' }}>
              {data.length} record{data.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Th({ children }) {
  return <th style={{ padding: '12px 16px', textAlign: 'left', color: '#555', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{children}</th>
}
function Td({ children, dim, style = {} }) {
  return <td style={{ padding: '12px 16px', color: dim ? '#666' : '#ccc', whiteSpace: 'nowrap', ...style }}>{children}</td>
}
