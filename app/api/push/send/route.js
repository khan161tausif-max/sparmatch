import { NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

webpush.setVapidDetails(
  'mailto:support@sparrd.in',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

export async function POST(req) {
  try {
    const { title, body, url = '/swipe', excludeUserId } = await req.json()

    let query = supabase.from('push_subscriptions').select('*')
    if (excludeUserId) query = query.neq('user_id', excludeUserId)
    const { data: subs } = await query

    const results = await Promise.allSettled(
      (subs || []).map(async sub => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            JSON.stringify({ title, body, url })
          )
        } catch (err) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
          }
          throw err
        }
      })
    )

    const sent = results.filter(r => r.status === 'fulfilled').length
    return NextResponse.json({ sent, total: subs?.length ?? 0 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
