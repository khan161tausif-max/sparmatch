import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const ADMIN_EMAIL = 'khan161tausif@gmail.com'
const FROM = 'Sparrd <noreply@sparrd.in>'

async function verifyAdmin(req) {
  const auth = req.headers.get('authorization')
  if (!auth) return null
  const { data: { user } } = await supabase.auth.getUser(auth.replace('Bearer ', ''))
  return user?.email === ADMIN_EMAIL ? user : null
}

export async function POST(req) {
  if (!await verifyAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { type, matchId, eventId } = await req.json()

  try {
    if (type === 'event_confirmed' && matchId) {
      const { data: match } = await supabase.from('matches').select(`
        id,
        user1:profiles!matches_user1_id_fkey(name),
        user2:profiles!matches_user2_id_fkey(name)
      `).eq('id', matchId).single()

      const { data: event } = await supabase.from('events').select('*').eq('match_id', matchId).single()
      if (!match || !event) return NextResponse.json({ error: 'Not found' }, { status: 404 })

      const { data: users } = await supabase.auth.admin.listUsers()
      const user1Auth = users?.users?.find(u => u.user_metadata?.name === match.user1?.name)
      const user2Auth = users?.users?.find(u => u.user_metadata?.name === match.user2?.name)

      const { data: user1Profile } = await supabase.from('profiles').select('id').eq('name', match.user1?.name).single()
      const { data: user2Profile } = await supabase.from('profiles').select('id').eq('name', match.user2?.name).single()

      const eventDate = event.event_date
        ? new Date(event.event_date).toLocaleString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'TBD'

      const emailHtml = (fighterName, opponentName) => `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 32px; border-radius: 16px;">
          <div style="font-size: 24px; font-weight: 800; margin-bottom: 24px;">Spar<span style="color: #D85A30">rd</span></div>
          <h1 style="font-size: 22px; font-weight: 800; margin-bottom: 8px;">Your event is confirmed! 🥊</h1>
          <p style="color: #888; margin-bottom: 28px;">Hi ${fighterName}, your sparring bout with ${opponentName} is all set.</p>
          <div style="background: #141414; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <div style="margin-bottom: 14px;"><span style="color: #555; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Venue</span><br/><strong>${event.gym_name || '—'}</strong></div>
            <div style="margin-bottom: 14px;"><span style="color: #555; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Address</span><br/>${event.gym_address || '—'}</div>
            <div style="margin-bottom: 14px;"><span style="color: #555; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Date & Time</span><br/><strong>${eventDate}</strong></div>
            <div style="margin-bottom: 14px;"><span style="color: #555; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Referee</span><br/>${event.referee || '—'}</div>
            <div><span style="color: #555; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Judges</span><br/>${[event.judge1, event.judge2].filter(Boolean).join(', ') || '—'}</div>
          </div>
          ${event.notes ? `<p style="color: #888; font-size: 14px; margin-bottom: 24px;">${event.notes}</p>` : ''}
          <a href="https://sparrd.vercel.app/chat/${matchId}" style="display: inline-block; background: #D85A30; color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px;">Open Chat & Confirm →</a>
          <p style="color: #444; font-size: 12px; margin-top: 32px;">Sparrd · Pune Beta</p>
        </div>
      `

      const sends = []
      if (user1Auth?.email) sends.push(resend.emails.send({ from: FROM, to: user1Auth.email, subject: `Your Sparrd event is confirmed — ${eventDate}`, html: emailHtml(match.user1?.name, match.user2?.name) }))
      if (user2Auth?.email) sends.push(resend.emails.send({ from: FROM, to: user2Auth.email, subject: `Your Sparrd event is confirmed — ${eventDate}`, html: emailHtml(match.user2?.name, match.user1?.name) }))

      await Promise.allSettled(sends)
      return NextResponse.json({ ok: true, sent: sends.length })
    }

    return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
