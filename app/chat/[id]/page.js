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
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    let channel = null

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data: match } = await supabase
        .from('matches')
        .select(`
          id,
          user1:profiles!matches_user1_id_fkey(id, name, sport),
          user2:profiles!matches_user2_id_fkey(id, name, sport)
        `)
        .eq('id', id)
        .single()

      if (match) {
        setPartner(match.user1?.id === user.id ? match.user2 : match.user1)
      }

      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', id)
        .order('created_at', { ascending: true })

      setMessages(msgs || [])
      setLoading(false)

      channel = supabase
        .channel(`messages-${id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${id}`
        }, payload => {
          setMessages(prev => [...prev, payload.new])
        })
        .subscribe()
    }

    init()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim()) return
    const content = newMessage.trim()
    setNewMessage('')
    await supabase.from('messages').insert({
      match_id: id,
      sender_id: user.id,
      content
    })
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') sendMessage()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'sans-serif', color: 'white', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => router.push('/matches')} style={{ background: 'none', border: 'none', color: '#888', fontSize: '20px', cursor: 'pointer' }}>←</button>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700' }}>{partner?.name}</h2>
          <p style={{ fontSize: '13px', color: '#888' }}>{partner?.sport}</p>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading && <p style={{ color: '#888', textAlign: 'center' }}>Loading messages...</p>}
        
        {!loading && messages.length === 0 && (
          <p style={{ color: '#888', textAlign: 'center', marginTop: '40px' }}>
            You matched! Say hi and set up a sparring session 🥊
          </p>
        )}

        {messages.map(m => (
          <div key={m.id} style={{
            display: 'flex',
            justifyContent: m.sender_id === user?.id ? 'flex-end' : 'flex-start'
          }}>
            <div style={{
              maxWidth: '70%', padding: '12px 16px', borderRadius: '16px',
              background: m.sender_id === user?.id ? '#D85A30' : '#1a1a1a',
              border: m.sender_id === user?.id ? 'none' : '1px solid #333',
              fontSize: '15px', lineHeight: '1.4'
            }}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: '16px 20px', borderTop: '1px solid #222', display: 'flex', gap: '12px' }}>
        <input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a message..."
          style={{
            flex: 1, padding: '14px', borderRadius: '12px',
            border: '1px solid #333', background: '#1a1a1a',
            color: 'white', fontSize: '15px'
          }}
        />
        <button onClick={sendMessage} style={{
          background: '#D85A30', color: 'white', border: 'none',
          padding: '14px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700'
        }}>
          Send
        </button>
      </div>
    </div>
  )
}