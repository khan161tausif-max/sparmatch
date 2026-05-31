import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  if (req.headers.get('x-admin-password') !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { match_id, gym_name, gym_address, event_date, referee, judge1, judge2, notes } = await req.json()
  if (!match_id) return NextResponse.json({ error: 'match_id required' }, { status: 400 })

  const { data, error } = await supabase.from('events').upsert({
    match_id, gym_name, gym_address, event_date, referee, judge1, judge2, notes, status: 'confirmed'
  }, { onConflict: 'match_id' }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
