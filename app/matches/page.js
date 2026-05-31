'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import BottomNav from '../../components/BottomNav'

export default function Messages() {
  const router = useRouter()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('matches')
        .select(`
          id, created_at,
          user1:profiles!matches_user1_id_fkey(id, name, sport, level, city, avatar_url),
          user2:profiles!matches_user2_id_fkey(id, name, sport, level, city, avatar_url)
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      const formatted = (data || []).map(m => ({
        id: m.id,
        created_at: m.created_at,
        partner: m.user1?.id === user.id ? m.user2 : m.user1
      }))

      setMatches(formatted)
      setLoading(false)
    }
    init()
  }, [])

  const sportColor = { MMA: '#D85A30', Boxing: '#3B8BD4', 'Muay Thai': '#639922', BJJ: '#7F77DD', Wrestling: '#BA7517' }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'sans-serif', color: 'white', paddingBottom: '60px' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #111' }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800' }}>Messages</h1>
      </div>

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 20px' }}>
        {loading && <p style={{ color: '#888', textAlign: 'center', marginTop: '60px' }}>Loading...</p>}

        {!loading && matches.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '80px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🥊</div>
            <p style={{ fontSize: '18px', fontWeight: '600', color: '#ccc', marginBottom: '8px' }}>No matches yet</p>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '28px' }}>
              Swipe right on fighters you want to spar with
            </p>
            <button onClick={() => router.push('/swipe')} style={{
              background: '#D85A30', color: 'white', border: 'none',
              padding: '14px 28px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '15px'
            }}>
              Start Swiping
            </button>
          </div>
        )}

        {matches.map(m => (
          <div key={m.id} onClick={() => router.push(`/chat/${m.id}`)} style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '14px 0', borderBottom: '1px solid #161616', cursor: 'pointer'
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%', flexShrink: 0,
              background: '#2a2a2a', overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', fontWeight: '700', color: '#D85A30'
            }}>
              {m.partner?.avatar_url
                ? <img src={m.partner.avatar_url} alt={m.partner.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : m.partner?.name?.[0]?.toUpperCase()
              }
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '3px' }}>{m.partner?.name}</div>
              <div style={{ fontSize: '13px', color: '#555', display: 'flex', gap: '8px' }}>
                <span style={{ color: sportColor[m.partner?.sport] || '#666' }}>{m.partner?.sport}</span>
                {m.partner?.city && <span>📍 {m.partner.city}</span>}
              </div>
            </div>

            <span style={{ color: '#444', fontSize: '20px', flexShrink: 0 }}>›</span>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}
