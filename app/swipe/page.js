'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import BottomNav from '../../components/BottomNav'
import { usePushNotifications } from '../../hooks/usePushNotifications'

const SPORTS = ['MMA', 'Boxing', 'Muay Thai', 'BJJ', 'Wrestling']
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Pro']

const defaultFilters = { sport: '', level: '', maxWeightDiff: 20 }

export default function Swipe() {
  const [user, setUser] = useState(null)
  const [myProfile, setMyProfile] = useState(null)
  const [allFighters, setAllFighters] = useState([])
  const [fighters, setFighters] = useState([])
  const [current, setCurrent] = useState(0)
  const [swiping, setSwiping] = useState(null)
  const [match, setMatch] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [showNotifs, setShowNotifs] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState(defaultFilters)
  const [activeFilters, setActiveFilters] = useState(defaultFilters)
  const [toast, setToast] = useState(null)
  const router = useRouter()

  const unread = notifications.filter(n => !n.read).length
  usePushNotifications(user?.id)

  useEffect(() => {
    let channel = null

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const [{ data: me }, { data: swipedRows }, { data: notifData }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('swipes').select('swiped_id').eq('swiper_id', user.id),
        supabase.from('notifications').select('*').eq('user_id', user.id)
          .order('created_at', { ascending: false }).limit(50)
      ])

      setMyProfile(me)
      setNotifications(notifData || [])

      const swipedIds = (swipedRows || []).map(r => r.swiped_id)
      let query = supabase.from('profiles').select('*').neq('id', user.id)
      if (swipedIds.length > 0) {
        query = query.not('id', 'in', `(${swipedIds.join(',')})`)
      }
      const { data: profiles } = await query
      const list = profiles || []
      setAllFighters(list)
      setFighters(list)

      channel = supabase
        .channel(`notifs-${user.id}`)
        .on('postgres_changes', {
          event: 'INSERT', schema: 'public', table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, payload => {
          setNotifications(prev => [payload.new, ...prev])
          setToast(payload.new)
          setTimeout(() => setToast(null), 4500)
        })
        .subscribe()
    }

    init()
    return () => { if (channel) supabase.removeChannel(channel) }
  }, [router])

  const applyFilters = (f) => {
    setActiveFilters(f)
    setShowFilters(false)
    setCurrent(0)
    let list = [...allFighters]
    if (f.sport) list = list.filter(p => p.sport === f.sport)
    if (f.level) list = list.filter(p => p.level === f.level)
    if (f.maxWeightDiff < 20 && myProfile?.weight_kg) {
      list = list.filter(p => !p.weight_kg || Math.abs(p.weight_kg - myProfile.weight_kg) <= f.maxWeightDiff)
    }
    setFighters(list)
  }

  const clearFilters = () => {
    const reset = defaultFilters
    setFilters(reset)
    applyFilters(reset)
  }

  const activeCount = [activeFilters.sport, activeFilters.level, activeFilters.maxWeightDiff < 20].filter(Boolean).length

  const openNotifs = async () => {
    setShowNotifs(true)
    if (user && unread > 0) {
      await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }
  }

  const swipe = async (direction) => {
    if (!fighters[current]) return
    setSwiping(direction)
    const swiped = fighters[current]

    await supabase.from('swipes').insert({ swiper_id: user.id, swiped_id: swiped.id, direction })

    if (direction === 'right') {
      const { data: theirSwipe } = await supabase
        .from('swipes').select('*')
        .eq('swiper_id', swiped.id).eq('swiped_id', user.id).eq('direction', 'right')

      if (theirSwipe && theirSwipe.length > 0) {
        const { data: existing } = await supabase.from('matches').select('id')
          .or(`and(user1_id.eq.${user.id},user2_id.eq.${swiped.id}),and(user1_id.eq.${swiped.id},user2_id.eq.${user.id})`)
          .maybeSingle()

        let matchId = existing?.id
        if (!existing) {
          const { data: newMatch } = await supabase.from('matches')
            .insert({ user1_id: user.id, user2_id: swiped.id }).select().single()
          matchId = newMatch?.id
        }

        setTimeout(() => { setSwiping(null); setMatch({ fighter: swiped, matchId }) }, 300)
        return
      }
    }

    setTimeout(() => { setSwiping(null); setCurrent(prev => prev + 1) }, 300)
  }

  const fighter = fighters[current]

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'sans-serif', paddingBottom: '60px' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 300, background: '#1a1a1a', border: '1px solid #D85A30',
          borderRadius: '14px', padding: '14px 18px', maxWidth: '340px', width: 'calc(100% - 40px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.7)', display: 'flex', gap: '12px', alignItems: 'flex-start',
          animation: 'slideDown 0.3s ease'
        }}>
          <span style={{ fontSize: '20px', flexShrink: 0 }}>🥊</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '3px' }}>{toast.title}</div>
            <div style={{ color: '#888', fontSize: '13px', lineHeight: '1.4' }}>{toast.body}</div>
          </div>
          <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '16px', padding: 0 }}>✕</button>
        </div>
      )}

      {/* Match overlay */}
      {match && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.96)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ fontSize: '52px', marginBottom: '12px' }}>🥊</div>
          <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', textAlign: 'center' }}>It's a Match!</h2>
          <p style={{ color: '#888', marginBottom: '40px', textAlign: 'center', fontSize: '15px' }}>You and {match.fighter.name} both want to spar</p>
          <div style={{ display: 'flex', gap: '32px', marginBottom: '48px' }}>
            {[myProfile, match.fighter].map((p, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: '#1a1a1a', border: '3px solid #D85A30', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: '700', color: '#D85A30' }}>
                  {p?.avatar_url ? <img src={p.avatar_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : p?.name?.[0]?.toUpperCase()}
                </div>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>{p?.name}</span>
              </div>
            ))}
          </div>
          <button onClick={() => match.matchId && router.push(`/chat/${match.matchId}`)} style={{ width: '100%', maxWidth: '320px', padding: '16px', borderRadius: '12px', background: '#D85A30', color: 'white', fontWeight: '700', fontSize: '16px', border: 'none', cursor: 'pointer', marginBottom: '12px' }}>Send a Message</button>
          <button onClick={() => { setMatch(null); setCurrent(prev => prev + 1) }} style={{ width: '100%', maxWidth: '320px', padding: '16px', borderRadius: '12px', background: 'none', color: '#888', fontWeight: '600', fontSize: '15px', border: '1px solid #333', cursor: 'pointer' }}>Keep Swiping</button>
        </div>
      )}

      {/* Notification panel */}
      {showNotifs && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 150, background: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }} onClick={() => setShowNotifs(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#111', borderRadius: '20px 20px 0 0', maxHeight: '72vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e1e1e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Notifications</h2>
              <button onClick={() => setShowNotifs(false)} style={{ background: '#1e1e1e', border: 'none', color: '#888', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '48px 20px', textAlign: 'center', color: '#555' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔔</div>
                  <p style={{ margin: 0, fontWeight: '600' }}>No notifications yet</p>
                  <p style={{ margin: '8px 0 0', fontSize: '13px' }}>We'll ping you when new fighters join</p>
                </div>
              ) : notifications.map(n => (
                <div key={n.id} style={{ padding: '16px 20px', borderBottom: '1px solid #161616', background: n.read ? 'transparent' : '#110d00', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '20px', flexShrink: 0 }}>🥊</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: n.read ? '500' : '700', fontSize: '14px', marginBottom: '3px', color: n.read ? '#bbb' : '#fff' }}>{n.title}</div>
                    <div style={{ color: '#666', fontSize: '13px', lineHeight: '1.4' }}>{n.body}</div>
                    <div style={{ color: '#3a3a3a', fontSize: '11px', marginTop: '6px' }}>
                      {new Date(n.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {!n.read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D85A30', flexShrink: 0, marginTop: '5px' }} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter panel */}
      {showFilters && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 150, background: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }} onClick={() => setShowFilters(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#111', borderRadius: '20px 20px 0 0', padding: '24px 20px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Filter Fighters</h2>
              <button onClick={() => setShowFilters(false)} style={{ background: '#1e1e1e', border: 'none', color: '#888', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            {/* Sport */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', color: '#555', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px' }}>Sport</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['Any', ...SPORTS].map(s => (
                  <button key={s} onClick={() => setFilters(f => ({ ...f, sport: s === 'Any' ? '' : s }))} style={{
                    padding: '8px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', border: 'none',
                    background: filters.sport === (s === 'Any' ? '' : s) ? '#D85A30' : '#1e1e1e',
                    color: filters.sport === (s === 'Any' ? '' : s) ? 'white' : '#888'
                  }}>{s}</button>
                ))}
              </div>
            </div>

            {/* Level */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', color: '#555', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px' }}>Experience level</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['Any', ...LEVELS].map(l => (
                  <button key={l} onClick={() => setFilters(f => ({ ...f, level: l === 'Any' ? '' : l }))} style={{
                    padding: '8px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', border: 'none',
                    background: filters.level === (l === 'Any' ? '' : l) ? '#D85A30' : '#1e1e1e',
                    color: filters.level === (l === 'Any' ? '' : l) ? 'white' : '#888'
                  }}>{l}</button>
                ))}
              </div>
            </div>

            {/* Weight range */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: '#555', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Weight difference</div>
                <div style={{ fontSize: '13px', color: filters.maxWeightDiff >= 20 ? '#555' : '#D85A30', fontWeight: '600' }}>
                  {filters.maxWeightDiff >= 20 ? 'Any' : `± ${filters.maxWeightDiff} kg`}
                </div>
              </div>
              <input type="range" min="3" max="20" step="1" value={filters.maxWeightDiff}
                onChange={e => setFilters(f => ({ ...f, maxWeightDiff: parseInt(e.target.value) }))}
                style={{ width: '100%', accentColor: '#D85A30' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#444', marginTop: '4px' }}>
                <span>Tight (±3 kg)</span>
                <span>Any weight</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={clearFilters} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#1a1a1a', color: '#888', border: '1px solid #2a2a2a', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                Clear all
              </button>
              <button onClick={() => applyFilters(filters)} style={{ flex: 2, padding: '14px', borderRadius: '12px', background: '#D85A30', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '15px' }}>
                Show {(() => {
                  let count = allFighters.length
                  if (filters.sport) count = allFighters.filter(p => p.sport === filters.sport).length
                  if (filters.level) count = allFighters.filter(p => (!filters.sport || p.sport === filters.sport) && p.level === filters.level).length
                  return count
                })()} fighters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #111' }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#D85A30', letterSpacing: '-0.5px' }}>Sparrd</h1>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Filter button */}
          <button onClick={() => setShowFilters(true)} style={{
            position: 'relative', background: activeCount > 0 ? '#1a0f00' : 'none',
            border: `1px solid ${activeCount > 0 ? '#D85A30' : '#2a2a2a'}`,
            borderRadius: '8px', cursor: 'pointer', padding: '6px 10px',
            display: 'flex', alignItems: 'center', gap: '6px', color: activeCount > 0 ? '#D85A30' : '#666',
            fontSize: '13px', fontWeight: '600'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
            {activeCount > 0 ? `${activeCount} filter${activeCount > 1 ? 's' : ''}` : 'Filter'}
          </button>
          {/* Bell */}
          <button onClick={openNotifs} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={unread > 0 ? '#D85A30' : '#555'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unread > 0 && (
              <div style={{ position: 'absolute', top: '2px', right: '2px', background: '#D85A30', color: 'white', borderRadius: '10px', fontSize: '10px', fontWeight: '700', minWidth: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>
                {unread > 9 ? '9+' : unread}
              </div>
            )}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '420px', margin: '0 auto', padding: '16px 20px' }}>
        {!fighter ? (
          <div style={{ paddingTop: '16px' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ fontSize: '60px', marginBottom: '16px' }}>🥊</div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '10px' }}>
                {activeCount > 0 ? 'No matches for these filters' : 'Fighters Coming Soon!'}
              </h2>
              <p style={{ color: '#666', lineHeight: '1.65', fontSize: '15px', maxWidth: '300px', margin: '0 auto' }}>
                {activeCount > 0
                  ? 'Try adjusting your filters or clear them to see all fighters.'
                  : "You're one of the first to join Sparrd in Pune. We're building out the fighter network right now — thanks for being part of the beta."}
              </p>
            </div>

            {activeCount > 0 ? (
              <button onClick={clearFilters} style={{ width: '100%', padding: '16px', borderRadius: '12px', background: '#D85A30', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '15px' }}>
                Clear Filters
              </button>
            ) : (
              <>
                <div style={{ background: '#141414', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px' }}>
                  {[
                    { icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>), bg: '#0d1f0d', title: "You'll be notified", body: "We'll send you a ping the moment new sparring partners register in your area" },
                    { icon: '🏟️', bg: '#0d0d1f', title: 'Organised bouts, not random fights', body: 'Every spar is a proper event with professional referees and judges at a partnered gym in Pune' },
                    { icon: '📍', bg: '#1f0d0d', title: 'Pune beta — more cities soon', body: "We're starting here and expanding to Mumbai, Bangalore and beyond" }
                  ].map(({ icon, bg, title, body }, i, arr) => (
                    <div key={title} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '18px 20px', borderBottom: i < arr.length - 1 ? '1px solid #1e1e1e' : 'none' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: typeof icon === 'string' ? '18px' : undefined }}>{icon}</div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>{title}</div>
                        <div style={{ color: '#666', fontSize: '13px', lineHeight: '1.5' }}>{body}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#0d1a0d', border: '1px solid #1a3a1a', borderRadius: '14px', padding: '14px 18px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                  <p style={{ margin: 0, color: '#4caf50', fontSize: '13px', fontWeight: '600', lineHeight: '1.4' }}>
                    Notifications are on — tap the bell above to check for updates.
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Fighter count */}
            <div style={{ fontSize: '12px', color: '#555', marginBottom: '12px', textAlign: 'center' }}>
              {current + 1} of {fighters.length} fighter{fighters.length !== 1 ? 's' : ''}
              {activeCount > 0 && <span style={{ color: '#D85A30' }}> (filtered)</span>}
            </div>

            {/* Fighter card */}
            <div style={{
              background: '#1a1a1a', borderRadius: '20px', overflow: 'hidden',
              transform: swiping === 'left' ? 'translateX(-80px) rotate(-8deg)' : swiping === 'right' ? 'translateX(80px) rotate(8deg)' : 'none',
              transition: 'transform 0.25s ease', boxShadow: '0 8px 40px rgba(0,0,0,0.6)'
            }}>
              <div style={{ height: '280px', position: 'relative', overflow: 'hidden', background: '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {fighter.avatar_url
                  ? <img src={fighter.avatar_url} alt={fighter.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: '80px', color: '#3a3a3a' }}>{fighter.name?.[0]?.toUpperCase()}</span>
                }
                <div style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(216,90,48,0.92)', color: 'white', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                  {fighter.sport}
                </div>
              </div>

              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>{fighter.name}{fighter.age ? `, ${fighter.age}` : ''}</h2>
                    {fighter.city && <p style={{ margin: '4px 0 0', color: '#888', fontSize: '14px' }}>📍 {fighter.city}</p>}
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '13px' }}>
                    {fighter.level && <div style={{ color: '#D85A30', fontWeight: '700' }}>{fighter.level}</div>}
                    {fighter.fights != null && <div style={{ color: '#666' }}>{fighter.fights} fights</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: fighter.bio ? '12px' : 0 }}>
                  {fighter.weight_kg && <span style={tag}>{fighter.weight_kg} kg</span>}
                  {fighter.gym_name && <span style={tag}>{fighter.gym_name}</span>}
                </div>
                {fighter.bio && <p style={{ margin: 0, color: '#bbb', fontSize: '14px', lineHeight: '1.5' }}>{fighter.bio}</p>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
              <button onClick={() => swipe('left')} style={{ flex: 1, padding: '18px', background: '#1a1a1a', color: '#fff', border: '2px solid #333', borderRadius: '16px', fontSize: '16px', cursor: 'pointer', fontWeight: '700' }}>✕ Pass</button>
              <button onClick={() => swipe('right')} style={{ flex: 1, padding: '18px', background: '#D85A30', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '16px', cursor: 'pointer', fontWeight: '700' }}>🥊 Spar</button>
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

const tag = {
  background: '#2a2a2a', color: '#bbb', borderRadius: '8px',
  padding: '4px 10px', fontSize: '12px', fontWeight: '500'
}
