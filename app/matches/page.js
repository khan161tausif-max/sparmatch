'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Matches() {
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
          user1:profiles!matches_user1_id_fkey(id, name, sport, level, city),
          user2:profiles!matches_user2_id_fkey(id, name, sport, level, city)
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)

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
    <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'sans-serif', color: 'white', padding: '20px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700' }}>Your Matches</h1>
          <button onClick={() => router.push('/swipe')} style={{ background: '#1a1a1a', border: '1px solid #333', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
            Keep Swiping
          </button>
        </div>

        {loading && <p style={{ color: '#888' }}>Loading...</p>}

        {!loading && matches.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '80px' }}>
            <p style={{ fontSize: '48px' }}>🥊</p>
            <p style={{ color: '#888', marginTop: '16px' }}>No matches yet. Keep swiping!</p>
          </div>
        )}

        {matches.map(m => (
          <div key={m.id} style={{
            background: '#1a1a1a', border: '1px solid #333', borderRadius: '16px',
            padding: '20px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>{m.partner?.name}</h3>
              <div style={{ display: 'flex', gap: '10px', fontSize: '13px', color: '#888' }}>
                <span style={{ color: sportColor[m.partner?.sport] || '#888' }}>{m.partner?.sport}</span>
                <span>{m.partner?.level}</span>
                <span>📍 {m.partner?.city}</span>
              </div>
            </div>
            <button onClick={() => router.push(`/chat/${m.id}`)} style={{
              background: '#D85A30', color: 'white', border: 'none',
              padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600'
            }}>
              Message
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}