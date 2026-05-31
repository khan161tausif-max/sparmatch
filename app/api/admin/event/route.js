import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const ADMIN_EMAIL = 'khan161tausif@gmail.com'

async function verifyAdmin(req) {
  const auth = req.headers.get('authorization')
  if (!auth) return null
  const { data: { user } } = await supabase.auth.getUser(auth.replace('Bearer ', ''))
  return user?.email === ADMIN_EMAIL ? user : null
}

// POST — create or update an event for a match
export async function POST(req) {
  if (!await verifyAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { match_id, gym_name, gym_address, event_date, referee, judge1, judge2, notes } = await req.json()
  if (!match_id) return NextResponse.json({ error: 'match_id required' }, { status: 400 })

  const { data, error } = await supabase.from('events').upsert({
    match_id,
    gym_name,
    gym_address,
    event_date,
    referee,
    judge1,
    judge2,
    notes,
    status: 'confirmed'
  }, { onConflict: 'match_id' }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
