import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const ADMIN_EMAIL = 'khan161tausif@gmail.com'

export async function GET(req) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const table = new URL(req.url).searchParams.get('table')

  try {
    switch (table) {
      case 'stats': {
        const [p, m, w, g, o] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('matches').select('*', { count: 'exact', head: true }),
          supabase.from('waitlist').select('*', { count: 'exact', head: true }),
          supabase.from('gym_partners').select('*', { count: 'exact', head: true }),
          supabase.from('officials').select('*', { count: 'exact', head: true }),
        ])
        return NextResponse.json({ fighters: p.count, matches: m.count, waitlist: w.count, gyms: g.count, officials: o.count })
      }
      case 'fighters': {
        const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
        return NextResponse.json(data || [])
      }
      case 'matches': {
        const { data } = await supabase.from('matches').select(`
          id, created_at,
          user1:profiles!matches_user1_id_fkey(name, sport, level),
          user2:profiles!matches_user2_id_fkey(name, sport, level)
        `).order('created_at', { ascending: false })
        return NextResponse.json(data || [])
      }
      case 'waitlist': {
        const { data } = await supabase.from('waitlist').select('*').order('created_at', { ascending: false })
        return NextResponse.json(data || [])
      }
      case 'gyms': {
        const { data } = await supabase.from('gym_partners').select('*').order('created_at', { ascending: false })
        return NextResponse.json(data || [])
      }
      case 'officials': {
        const { data } = await supabase.from('officials').select('*').order('created_at', { ascending: false })
        return NextResponse.json(data || [])
      }
      default:
        return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
