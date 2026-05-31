'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter, useParams } from 'next/navigation'

export default function Chat() {
  const router = useRouter()
  const { id } = useParams()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [user, setUser] = useState(null)
  const [partner, setPartner] = useState(null)
  const [match, setMatch] = useState(null)
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    let msgChannel = null
    let eventChannel = null

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data: matchData } = await supabase
        .from('matches')
        .select(`
          id, user1_id, user2_id,
          user1:profiles!matches_user1_id_fkey(id, name, sport, avatar_url),
          user2:profiles!matches_user2_id_fkey(id, name, sport, avatar_url)
        `)
        .eq('id', id)
        .single()

      if (matchData) {
        setMatch(matchData)
        setPartner(matchData.user1?.id === user.id ? matchData.user2 : matchData.user1)
      }

      const [{ data: msgs }, { data: eventData }] = await Promise.all([
        supabase.from('messages').select('*').eq('match_id', id).order('created_at', { ascending: true }),
        supabase.from('events').select('*').eq('match_id', id).maybeSingle()
      ])

      setMessages(msgs || [])
      setEvent(eventData)
      setLoading(false)

      msgChannel = supabase
        .channel(`messages-${id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${id}` },
          payload => setMessages(prev => [...prev, payload.new]))
        .subscribe()

      eventChannel = supabase
        .channel(`event-${id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'events', filter: `match_id=eq.${id}` },
          payload => setEvent(payload.new))
        .subscribe()
    }

    init()
    return () => {
      if (msgChannel) supabase.removeChannel(msgChannel)
      if (eventChannel) supabase.removeChannel(eventChannel)
    }
  }, [id])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim()) return
    const content = newMessage.trim()
    setNewMessage('')
    await supabase.from('messages').insert({ match_id: id, sender_id: user.id, content })
  }

  const confirmAttendance = async () => {
    if (!event || !match || !user) return
    setConfirming(true)
    const isUser1 = match.user1_id === user.id
    await supabase.from('events').update(
      isUser1 ? { fighter1_confirmed: true } : { fighter2_confirmed: true }
    ).eq('match_id', id)
    setConfirming(false)
  }

  const myConfirmed = event && match && (match.user1_id === user?.id ? event.fighter1_confirmed : event.fighter2_confirmed)
  const bothConfirmed = event?.fighter1_confirmed && event?.fighter2_confirmed

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'sans-serif', color: 'white', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', gap: '12px', background: '#0d0d0d' }}>
        <button onClick={() => router.push('/matches')} style={{ background: 'none', border: 'none', color: '#666', fontSize: '22px', cursor: 'pointer', padding: '0 4px' }}>←</button>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#2a2a2a', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#D85A30' }}>
          {partner?.avatar_url ? <img src={partner.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : partner?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: '700', fontSize: '16px' }}>{partner?.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{partner?.sport}</div>
        </div>
      </div>

      {/* Event card */}
      {event && (
        <div style={{ margin: '16px 16px 0', background: bothConfirmed ? '#0d1f0d' : '#0f0d00', border: `1px solid ${bothConfirmed ? '#2a4a2a' : '#4a3a00'}`, borderRadius: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', color: bothConfirmed ? '#4caf50' : '#f59e0b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
                {bothConfirmed ? '✓ Event Confirmed' : '⏳ Event Scheduled — Awaiting Confirmation'}
              </div>
              <div style={{ fontSize: '18px', fontWeight: '800' }}>{event.gym_name}</div>
            </div>
            <div style={{ fontSize: '24px' }}>🏟️</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            {[
              { label: 'Date & Time', value: event.event_date ? new Date(event.event_date).toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—' },
              { label: 'Address', value: event.gym_address || '—' },
              { label: 'Referee', value: event.referee || '—' },
              { label: 'Judges', value: [event.judge1, event.judge2].filter(Boolean).join(', ') || '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: '10px', color: '#555', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>{label}</div>
                <div style={{ fontSize: '13px', color: '#ccc', fontWeight: '500' }}>{value}</div>
              </div>
            ))}
          </div>

          {event.notes && (
            <div style={{ fontSize: '13px', color: '#777', borderTop: '1px solid #222', paddingTop: '10px', marginBottom: '12px', lineHeight: '1.5' }}>
              {event.notes}
            </div>
          )}

          {/* Confirmation status */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: myConfirmed ? 0 : '12px' }}>
            {[
              { label: match?.user1?.name, confirmed: event.fighter1_confirmed },
              { label: match?.user2?.name, confirmed: event.fighter2_confirmed },
            ].map(({ label, confirmed }) => (
              <div key={label} style={{ flex: 1, padding: '8px', borderRadius: '8px', background: confirmed ? '#0d1f0d' : '#1a1a1a', border: `1px solid ${confirmed ? '#2a4a2a' : '#2a2a2a'}`, textAlign: 'center', fontSize: '12px' }}>
                <div style={{ color: confirmed ? '#4caf50' : '#555', fontWeight: '700' }}>{confirmed ? '✓ Confirmed' : 'Pending'}</div>
                <div style={{ color: '#666', marginTop: '2px', fontSize: '11px' }}>{label}</div>
              </div>
            ))}
          </div>

          {!myConfirmed && (
            <button onClick={confirmAttendance} disabled={confirming} style={{
              width: '100%', padding: '12px', borderRadius: '10px', background: '#D85A30',
              color: 'white', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer'
            }}>
              {confirming ? 'Confirming...' : 'Confirm My Attendance'}
            </button>
          )}
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading && <p style={{ color: '#555', textAlign: 'center', marginTop: '40px' }}>Loading...</p>}

        {!loading && messages.length === 0 && (
          <p style={{ color: '#555', textAlign: 'center', marginTop: '40px', fontSize: '14px', lineHeight: '1.6' }}>
            You matched! Say hi and set up your sparring session 🥊
          </p>
        )}

        {messages.map(m => (
          <div key={m.id} style={{ display: 'flex', justifyContent: m.sender_id === user?.id ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '72%', padding: '10px 14px', borderRadius: '16px',
              background: m.sender_id === user?.id ? '#D85A30' : '#1a1a1a',
              border: m.sender_id === user?.id ? 'none' : '1px solid #2a2a2a',
              fontSize: '14px', lineHeight: '1.5', color: 'white'
            }}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #1a1a1a', display: 'flex', gap: '10px', background: '#0d0d0d' }}>
        <input
          value={newMessage} onChange={e => setNewMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #2a2a2a', background: '#1a1a1a', color: 'white', fontSize: '14px' }}
        />
        <button onClick={sendMessage} style={{ background: '#D85A30', color: 'white', border: 'none', padding: '12px 18px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
          Send
        </button>
      </div>
    </div>
  )
}
