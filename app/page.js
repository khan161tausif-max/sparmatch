'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

const features = [
  { icon: '🏟️', title: 'We Book the Venue', desc: 'No scrambling for a gym. We arrange a professional venue in Pune — show up and fight.' },
  { icon: '👨‍⚖️', title: 'Professional Referees', desc: 'Every session has a trained referee and certified judges. Structured, safe, and legit.' },
  { icon: '⚖️', title: 'Matched by Weight & Level', desc: 'We only pair fighters of similar weight class and experience. No mismatches, no surprises.' },
  { icon: '🥊', title: 'MMA, Boxing, Muay Thai & More', desc: 'Built for all combat sports. Your match is always within your discipline.' }
]

const howItWorks = [
  { step: '01', title: 'Create your fighter profile', desc: 'Add your sport, weight class, experience level, and gym. Takes two minutes.' },
  { step: '02', title: 'Swipe & match', desc: 'Browse fighters near you in Pune. When both of you swipe right — it\'s a match.' },
  { step: '03', title: 'We arrange the event', desc: 'Sparrd books a partner gym, assigns a professional referee and two judges, and sends you both the details.' },
  { step: '04', title: 'Show up and spar', desc: 'Everything is set. You just turn up, glove up, and compete in a proper structured session.' },
]

const demoFighters = [
  { name: 'Arjun Mehta', age: 26, sport: 'MMA', weight_kg: 82, city: 'Pune', level: 'Advanced', gym: 'Knockout MMA, Kothrud', bio: 'Training for 5 years. Looking for 2–3 sparring sessions per month at organised events.', matchOnRight: false, img: 'https://images.pexels.com/photos/17400108/pexels-photo-17400108.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop' },
  { name: 'Sneha Patil', age: 23, sport: 'Muay Thai', weight_kg: 55, city: 'Pune', level: 'Intermediate', gym: 'Deccan Fight Club', bio: '3 amateur bouts. Want structured sessions with a ref — no backyard sparring.', matchOnRight: false, img: 'https://images.pexels.com/photos/7261727/pexels-photo-7261727.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop' },
  { name: 'Rahul Desai', age: 29, sport: 'Boxing', weight_kg: 67, city: 'Pune', level: 'Pro', gym: 'Champions Boxing Academy, Hadapsar', bio: 'State-level competitor. Want proper judged sessions to track improvement.', matchOnRight: true, img: 'https://images.pexels.com/photos/4754123/pexels-photo-4754123.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop' },
  { name: 'Vikram Joshi', age: 24, sport: 'BJJ', weight_kg: 75, city: 'Pune', level: 'Intermediate', gym: 'Ground Zero BJJ, Baner', bio: 'Purple belt. Prefer no-gi. Available weekends and Monday evenings.', matchOnRight: false, img: 'https://images.pexels.com/photos/2691307/pexels-photo-2691307.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop' }
]

const sportColor = { MMA: '#D85A30', Boxing: '#3B8BD4', 'Muay Thai': '#639922', BJJ: '#7F77DD', Wrestling: '#BA7517' }

const officialRoles = [
  { id: 'Referee', icon: '🥊', title: 'Referee', desc: 'Oversees the bout, ensures safety' },
  { id: 'Judge', icon: '📋', title: 'Judge', desc: 'Scores rounds, provides decisions' },
  { id: 'Bell Man', icon: '🔔', title: 'Bell Man', desc: 'Manages round timing and bell' },
  { id: 'Announcer', icon: '🎤', title: 'Announcer', desc: 'Introduces fighters, announces results' },
]

const gymBenefits = [
  { icon: '💰', title: 'Revenue per event', desc: 'Earn from every sparring session hosted at your facility' },
  { icon: '🥊', title: 'Fighter footfall', desc: 'Bring serious competitors through your door regularly' },
  { icon: '📣', title: 'Brand exposure', desc: 'Listed on Sparrd as an official partner venue in Pune' },
  { icon: '🎯', title: 'Zero logistics', desc: 'We handle matchmaking, officials, and all communications' },
]

function SwipeDemo() {
  const [index, setIndex] = useState(0)
  const [swiping, setSwiping] = useState(null)
  const [matched, setMatched] = useState(false)

  const fighter = demoFighters[index]
  const nextFighter = demoFighters[index + 1]

  const swipe = (dir) => {
    if (swiping || matched) return
    setSwiping(dir)
    setTimeout(() => {
      if (dir === 'right' && fighter.matchOnRight) {
        setMatched(true)
        setSwiping(null)
        setTimeout(() => {
          setMatched(false)
          setIndex(prev => (prev + 1) % demoFighters.length)
        }, 2200)
      } else {
        setSwiping(null)
        setIndex(prev => (prev + 1) % demoFighters.length)
      }
    }, 320)
  }

  const cardTransform =
    swiping === 'left' ? 'translateX(-120%) rotate(-18deg)' :
    swiping === 'right' ? 'translateX(120%) rotate(18deg)' :
    'translateX(0) rotate(0deg)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
      <div style={{
        width: '300px', height: '520px', background: '#111', borderRadius: '36px',
        border: '2px solid #2a2a2a', boxShadow: '0 32px 80px rgba(0,0,0,0.7), inset 0 0 0 1px #333',
        overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ padding: '14px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Spar<span style={{ color: '#D85A30' }}>rd</span>
          </span>
          <span style={{ fontSize: '11px', color: '#555' }}>●●●</span>
        </div>

        <div style={{ flex: 1, position: 'relative', padding: '8px 12px 0', overflow: 'hidden' }}>
          {nextFighter && !matched && (
            <div style={{
              position: 'absolute', inset: '8px 16px 0', background: '#1e1e1e',
              borderRadius: '18px', transform: 'scale(0.94) translateY(8px)',
              transformOrigin: 'bottom center', border: '1px solid #2a2a2a'
            }} />
          )}

          {matched && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 10, borderRadius: '12px', overflow: 'hidden' }}>
              <img src={fighter.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, rgba(216,90,48,0.88) 0%, rgba(100,10,0,0.92) 100%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
              }}>
                <div style={{ fontSize: '52px', marginBottom: '10px' }}>🥊</div>
                <div style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '-0.5px' }}>It's a Match!</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginTop: '8px' }}>You & {fighter.name}</div>
                <div style={{ marginTop: '20px', background: 'rgba(255,255,255,0.15)', borderRadius: '20px', padding: '8px 20px', fontSize: '12px', fontWeight: 600 }}>Send a message →</div>
              </div>
            </div>
          )}

          {!matched && (
            <div style={{
              position: 'relative', background: '#1a1a1a', borderRadius: '18px', border: '1px solid #2a2a2a',
              transform: cardTransform, transition: swiping ? 'transform 0.32s cubic-bezier(0.25,0.46,0.45,0.94)' : 'none',
              height: '100%', boxSizing: 'border-box', overflow: 'hidden', display: 'flex', flexDirection: 'column'
            }}>
              <div style={{ position: 'relative', flexShrink: 0, height: '210px', overflow: 'hidden' }}>
                <img src={fighter.img} alt={fighter.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(26,26,26,0.95) 100%)' }} />
                <div style={{ position: 'absolute', bottom: 10, left: 14 }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1 }}>{fighter.name}, {fighter.age}</div>
                  <div style={{ fontSize: '12px', color: sportColor[fighter.sport] || '#888', fontWeight: 700, marginTop: '3px' }}>{fighter.sport}</div>
                </div>
                {swiping === 'left' && (
                  <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', border: '2px solid #ef4444', borderRadius: '8px', padding: '4px 10px', color: '#ef4444', fontWeight: 800, fontSize: '13px', transform: 'rotate(8deg)' }}>PASS</div>
                )}
                {swiping === 'right' && (
                  <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.6)', border: '2px solid #4ade80', borderRadius: '8px', padding: '4px 10px', color: '#4ade80', fontWeight: 800, fontSize: '13px', transform: 'rotate(-8deg)' }}>SPAR</div>
                )}
              </div>
              <div style={{ padding: '12px 14px', flex: 1, overflow: 'hidden' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
                  {[`${fighter.weight_kg}kg`, fighter.city, fighter.level, fighter.gym].map(t => (
                    <span key={t} style={{ background: '#252525', color: '#aaa', borderRadius: '6px', padding: '3px 8px', fontSize: '10px' }}>{t}</span>
                  ))}
                </div>
                <p style={{ color: '#888', fontSize: '11px', lineHeight: 1.5, margin: 0 }}>{fighter.bio}</p>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', padding: '12px 16px 16px', flexShrink: 0 }}>
          <button onClick={() => swipe('left')} style={{ flex: 1, padding: '12px', background: '#1a1a1a', color: '#fff', border: '1.5px solid #333', borderRadius: '12px', fontSize: '15px', cursor: 'pointer', fontWeight: 700 }}>👎 Pass</button>
          <button onClick={() => swipe('right')} style={{ flex: 1, padding: '12px', background: '#D85A30', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', cursor: 'pointer', fontWeight: 700 }}>🥊 Spar</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '6px' }}>
        {demoFighters.map((_, i) => (
          <div key={i} style={{ width: i === index % demoFighters.length ? '20px' : '6px', height: '6px', borderRadius: '3px', background: i === index % demoFighters.length ? '#D85A30' : '#333', transition: 'all 0.3s ease' }} />
        ))}
      </div>
      <p style={{ color: '#555', fontSize: '13px', margin: 0 }}>Hit <span style={{ color: '#D85A30' }}>Spar</span> on Rahul for a surprise</p>
    </div>
  )
}

export default function Home() {
  const router = useRouter()

  // Fighter waitlist
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Gym partner form
  const [gymForm, setGymForm] = useState({ gym_name: '', contact_name: '', email: '', phone: '', city: 'Pune', capacity: '', message: '' })
  const [gymStatus, setGymStatus] = useState(null)
  const [gymSubmitting, setGymSubmitting] = useState(false)

  // Officials form
  const [officialForm, setOfficialForm] = useState({ name: '', email: '', phone: '', city: 'Pune', experience_years: '', certifications: '', roles: [] })
  const [officialStatus, setOfficialStatus] = useState(null)
  const [officialSubmitting, setOfficialSubmitting] = useState(false)

  const updateGym = (f, v) => setGymForm(p => ({ ...p, [f]: v }))
  const updateOfficial = (f, v) => setOfficialForm(p => ({ ...p, [f]: v }))
  const toggleRole = (role) => setOfficialForm(p => ({
    ...p,
    roles: p.roles.includes(role) ? p.roles.filter(r => r !== role) : [...p.roles, role]
  }))

  const handleWaitlist = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitting(true)
    setStatus(null)
    const { error } = await supabase.from('waitlist').insert({ email: email.trim() })
    if (error) {
      setStatus({ type: error.code === '23505' ? 'info' : 'error', msg: error.code === '23505' ? "You're already on the list!" : 'Something went wrong. Try again.' })
    } else {
      setStatus({ type: 'success', msg: "You're in! We'll reach out when Sparrd launches." })
      setEmail('')
    }
    setSubmitting(false)
  }

  const handleGymPartner = async (e) => {
    e.preventDefault()
    setGymSubmitting(true)
    setGymStatus(null)
    const { error } = await supabase.from('gym_partners').insert({
      gym_name: gymForm.gym_name.trim(),
      contact_name: gymForm.contact_name.trim() || null,
      email: gymForm.email.trim(),
      phone: gymForm.phone.trim() || null,
      city: gymForm.city.trim() || null,
      capacity: gymForm.capacity ? parseInt(gymForm.capacity) : null,
      message: gymForm.message.trim() || null
    })
    if (error) {
      setGymStatus({ type: error.code === '23505' ? 'info' : 'error', msg: error.code === '23505' ? "We already have your gym's details — we'll be in touch soon!" : 'Something went wrong. Please try again.' })
    } else {
      setGymStatus({ type: 'success', msg: "Thanks! We'll reach out about hosting your first event." })
      setGymForm({ gym_name: '', contact_name: '', email: '', phone: '', city: 'Pune', capacity: '', message: '' })
    }
    setGymSubmitting(false)
  }

  const handleOfficial = async (e) => {
    e.preventDefault()
    if (officialForm.roles.length === 0) {
      setOfficialStatus({ type: 'error', msg: 'Please select at least one role above.' })
      return
    }
    setOfficialSubmitting(true)
    setOfficialStatus(null)
    const { error } = await supabase.from('officials').insert({
      name: officialForm.name.trim(),
      email: officialForm.email.trim(),
      phone: officialForm.phone.trim() || null,
      city: officialForm.city.trim() || null,
      experience_years: officialForm.experience_years ? parseInt(officialForm.experience_years) : null,
      certifications: officialForm.certifications.trim() || null,
      roles: officialForm.roles
    })
    if (error) {
      setOfficialStatus({ type: error.code === '23505' ? 'info' : 'error', msg: error.code === '23505' ? "You're already registered! We'll be in touch." : 'Something went wrong. Please try again.' })
    } else {
      setOfficialStatus({ type: 'success', msg: "Registered! We'll contact you before our next event in Pune." })
      setOfficialForm({ name: '', email: '', phone: '', city: 'Pune', experience_years: '', certifications: '', roles: [] })
    }
    setOfficialSubmitting(false)
  }

  const inp = {
    width: '100%', padding: '13px 16px', borderRadius: '10px', border: '1px solid #2a2a2a',
    background: '#1a1a1a', color: '#fff', fontSize: '14px', boxSizing: 'border-box'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'sans-serif', overflowX: 'hidden' }}>

      {/* Nav */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 32px', borderBottom: '1px solid #1a1a1a',
        position: 'sticky', top: 0, background: '#0a0a0a', zIndex: 10, flexWrap: 'wrap', gap: '12px'
      }}>
        <span style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px' }}>
          Spar<span style={{ color: '#D85A30' }}>rd</span>
        </span>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          <a href="#gyms" style={{ color: '#888', fontSize: '14px', textDecoration: 'none', fontWeight: 500, whiteSpace: 'nowrap' }}>For Gyms</a>
          <a href="#officials" style={{ color: '#888', fontSize: '14px', textDecoration: 'none', fontWeight: 500, whiteSpace: 'nowrap' }}>Officials</a>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => router.push('/login')} style={{ background: 'none', border: '1px solid #333', color: '#fff', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>Log in</button>
            <button onClick={() => router.push('/signup')} style={{ background: '#D85A30', border: 'none', color: '#fff', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>Sign up</button>
          </div>
        </div>
      </nav>

      {/* Hero + Demo */}
      <section style={{ padding: '64px 48px', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '64px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ flex: '1', minWidth: '300px', maxWidth: '520px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '28px' }}>
              <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '100px', padding: '6px 16px', fontSize: '13px', color: '#D85A30', fontWeight: 600, letterSpacing: '0.5px' }}>📍 PUNE BETA</div>
              <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '100px', padding: '6px 16px', fontSize: '13px', color: '#888', fontWeight: 500 }}>Limited spots</div>
            </div>
            <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-2px', margin: '0 0 20px' }}>
              Your Next<br />Sparring Bout —<br /><span style={{ color: '#D85A30' }}>Organised for You</span>
            </h1>
            <p style={{ fontSize: '17px', color: '#888', lineHeight: 1.7, margin: '0 0 12px' }}>
              Match with fighters your size in Pune. We book the gym, assign a professional referee and judges, and run it like a proper event.
            </p>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.7, margin: '0 0 36px' }}>
              No random meetups. No unsafe arrangements. Just show up and compete.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '36px' }}>
              <button onClick={() => router.push('/signup')} style={{ background: '#D85A30', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: '10px', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>Get Started Free</button>
              <button onClick={() => router.push('/login')} style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #333', padding: '14px 32px', borderRadius: '10px', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>Log in</button>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['MMA', 'Boxing', 'Muay Thai', 'BJJ', 'Wrestling'].map(sport => (
                <span key={sport} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '100px', padding: '5px 12px', fontSize: '12px', color: '#666', fontWeight: 500 }}>{sport}</span>
              ))}
            </div>
          </div>
          <div style={{ flexShrink: 0 }}>
            <div style={{ marginBottom: '12px', textAlign: 'center' }}>
              <span style={{ fontSize: '12px', color: '#555', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Try it — hit Spar on Rahul 👀</span>
            </div>
            <SwipeDemo />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '80px 24px', background: '#0a0a0a', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
            How <span style={{ color: '#D85A30' }}>Sparrd</span> works
          </h2>
          <p style={{ textAlign: 'center', color: '#666', fontSize: '16px', marginBottom: '56px' }}>We handle everything between the match and the bell.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0' }}>
            {howItWorks.map(s => (
              <div key={s.step} style={{ padding: '0 24px 0 0' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#D85A30', letterSpacing: '1px', marginBottom: '12px' }}>{s.step}</div>
                <div style={{ width: '32px', height: '2px', background: '#D85A30', marginBottom: '16px', borderRadius: '2px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', lineHeight: 1.3 }}>{s.title}</h3>
                <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '56px', background: '#111', border: '1px solid #1e1e1e', borderRadius: '16px', padding: '24px 32px', display: 'flex', flexWrap: 'wrap', gap: '32px', justifyContent: 'center', alignItems: 'center' }}>
            {[
              { icon: '👨‍⚖️', label: 'Professional referee at every session' },
              { icon: '📋', label: 'Certified judges & scorecards' },
              { icon: '🏟️', label: 'Partner gyms across Pune' },
              { icon: '🛡️', label: 'Weight & level matched only' },
            ].map(t => (
              <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>{t.icon}</span>
                <span style={{ fontSize: '13px', color: '#888', fontWeight: 500 }}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 24px', background: '#0d0d0d', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, marginBottom: '56px', letterSpacing: '-1px' }}>
            Not a meetup app. A <span style={{ color: '#D85A30' }}>fight organiser</span>.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            {features.map(f => (
              <div key={f.title} style={{ background: '#141414', border: '1px solid #222', borderRadius: '16px', padding: '28px 24px' }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>{f.title}</h3>
                <p style={{ fontSize: '14px', color: '#777', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gym Partners ── */}
      <section id="gyms" style={{ padding: '96px 24px', background: '#080808', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ display: 'inline-block', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '100px', padding: '6px 16px', fontSize: '13px', color: '#D85A30', fontWeight: 600, marginBottom: '20px' }}>
              🏟️ FOR GYM OWNERS
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '12px' }}>
              Host a <span style={{ color: '#D85A30' }}>Sparrd Event</span> at Your Gym
            </h2>
            <p style={{ color: '#666', fontSize: '16px', maxWidth: '500px', margin: '0 auto', lineHeight: 1.7 }}>
              Partner with us to bring organised, professional sparring events to your space. We bring the fighters — you provide the arena.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'center' }}>

            {/* Benefits */}
            <div style={{ flex: '1', minWidth: '280px', maxWidth: '400px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '28px', color: '#ccc' }}>What you get</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {gymBenefits.map(b => (
                  <div key={b.title} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px', background: '#141414',
                      border: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '20px', flexShrink: 0
                    }}>
                      {b.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>{b.title}</div>
                      <div style={{ color: '#666', fontSize: '13px', lineHeight: 1.5 }}>{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gym registration form */}
            <div style={{
              flex: '1', minWidth: '300px', maxWidth: '460px',
              background: '#111', border: '1px solid #1e1e1e', borderRadius: '20px', padding: '32px'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>Register your gym</h3>
              <p style={{ color: '#666', fontSize: '13px', marginBottom: '24px' }}>We'll reach out to discuss hosting your first event.</p>

              {gymStatus && (
                <div style={{
                  background: gymStatus.type === 'success' ? '#0d1f0d' : gymStatus.type === 'info' ? '#1a1000' : '#1f0d0d',
                  border: `1px solid ${gymStatus.type === 'success' ? '#1a4a1a' : gymStatus.type === 'info' ? '#4a3000' : '#4a1a1a'}`,
                  borderRadius: '10px', padding: '12px 16px', marginBottom: '20px',
                  color: gymStatus.type === 'success' ? '#4ade80' : gymStatus.type === 'info' ? '#D85A30' : '#f87171',
                  fontSize: '14px'
                }}>
                  {gymStatus.msg}
                </div>
              )}

              <form onSubmit={handleGymPartner} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input style={inp} placeholder="Gym name *" required value={gymForm.gym_name} onChange={e => updateGym('gym_name', e.target.value)} />
                <input style={inp} placeholder="Your name (contact person) *" required value={gymForm.contact_name} onChange={e => updateGym('contact_name', e.target.value)} />
                <input style={inp} type="email" placeholder="Email *" required value={gymForm.email} onChange={e => updateGym('email', e.target.value)} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <input style={inp} type="tel" placeholder="Phone" value={gymForm.phone} onChange={e => updateGym('phone', e.target.value)} />
                  <input style={inp} placeholder="City" value={gymForm.city} onChange={e => updateGym('city', e.target.value)} />
                </div>
                <input style={inp} type="number" placeholder="Gym capacity (approx. people)" value={gymForm.capacity} onChange={e => updateGym('capacity', e.target.value)} />
                <textarea style={{ ...inp, height: '80px', resize: 'none' }} placeholder="Tell us about your gym — size, ring/cage, facilities (optional)" value={gymForm.message} onChange={e => updateGym('message', e.target.value)} />
                <button type="submit" disabled={gymSubmitting} style={{
                  padding: '15px', borderRadius: '12px', background: '#D85A30', color: 'white',
                  fontWeight: '700', fontSize: '15px', border: 'none', cursor: gymSubmitting ? 'not-allowed' : 'pointer',
                  opacity: gymSubmitting ? 0.7 : 1, marginTop: '4px'
                }}>
                  {gymSubmitting ? 'Submitting...' : 'Become a Partner Gym →'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── Officials ── */}
      <section id="officials" style={{ padding: '96px 24px', background: '#0a0a0a', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ display: 'inline-block', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '100px', padding: '6px 16px', fontSize: '13px', color: '#aaa', fontWeight: 600, marginBottom: '20px' }}>
              👨‍⚖️ FOR OFFICIALS
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '12px' }}>
              Join as a Match <span style={{ color: '#D85A30' }}>Official</span>
            </h2>
            <p style={{ color: '#666', fontSize: '16px', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
              We're building a network of professional referees, judges, bell men and announcers for organised sparring events across Pune.
            </p>
          </div>

          {/* Role selector */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '36px' }}>
            {officialRoles.map(role => {
              const selected = officialForm.roles.includes(role.id)
              return (
                <button key={role.id} type="button" onClick={() => toggleRole(role.id)} style={{
                  padding: '20px 16px', borderRadius: '14px', cursor: 'pointer', textAlign: 'center',
                  background: selected ? '#1a0f00' : '#141414',
                  border: `2px solid ${selected ? '#D85A30' : '#222'}`,
                  color: selected ? '#fff' : '#888',
                  transition: 'all 0.15s ease'
                }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>{role.icon}</div>
                  <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px', color: selected ? '#fff' : '#ccc' }}>{role.title}</div>
                  <div style={{ fontSize: '11px', color: selected ? '#D85A30' : '#555', lineHeight: 1.4 }}>{role.desc}</div>
                </button>
              )
            })}
          </div>

          {/* Officials form */}
          <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '20px', padding: '32px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '4px' }}>Your details</h3>
            <p style={{ color: '#666', fontSize: '13px', marginBottom: '24px' }}>
              Select your role(s) above, then fill in your details below.
            </p>

            {officialStatus && (
              <div style={{
                background: officialStatus.type === 'success' ? '#0d1f0d' : officialStatus.type === 'info' ? '#1a1000' : '#1f0d0d',
                border: `1px solid ${officialStatus.type === 'success' ? '#1a4a1a' : officialStatus.type === 'info' ? '#4a3000' : '#4a1a1a'}`,
                borderRadius: '10px', padding: '12px 16px', marginBottom: '20px',
                color: officialStatus.type === 'success' ? '#4ade80' : officialStatus.type === 'info' ? '#D85A30' : '#f87171',
                fontSize: '14px'
              }}>
                {officialStatus.msg}
              </div>
            )}

            <form onSubmit={handleOfficial} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input style={inp} placeholder="Full name *" required value={officialForm.name} onChange={e => updateOfficial('name', e.target.value)} />
                <input style={inp} type="email" placeholder="Email *" required value={officialForm.email} onChange={e => updateOfficial('email', e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input style={inp} type="tel" placeholder="Phone" value={officialForm.phone} onChange={e => updateOfficial('phone', e.target.value)} />
                <input style={inp} placeholder="City" value={officialForm.city} onChange={e => updateOfficial('city', e.target.value)} />
              </div>
              <input style={inp} type="number" placeholder="Years of experience" value={officialForm.experience_years} onChange={e => updateOfficial('experience_years', e.target.value)} />
              <textarea style={{ ...inp, height: '72px', resize: 'none' }} placeholder="Licenses or certifications (optional — e.g. BFI referee licence, MMAIF certified)" value={officialForm.certifications} onChange={e => updateOfficial('certifications', e.target.value)} />

              {officialForm.roles.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {officialForm.roles.map(r => (
                    <span key={r} style={{ background: '#1a0f00', border: '1px solid #D85A30', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', color: '#D85A30', fontWeight: '600' }}>
                      {r}
                    </span>
                  ))}
                </div>
              )}

              <button type="submit" disabled={officialSubmitting} style={{
                padding: '15px', borderRadius: '12px', background: officialForm.roles.length > 0 ? '#D85A30' : '#1e1e1e',
                color: officialForm.roles.length > 0 ? 'white' : '#555',
                fontWeight: '700', fontSize: '15px', border: 'none',
                cursor: officialSubmitting ? 'not-allowed' : 'pointer',
                opacity: officialSubmitting ? 0.7 : 1, marginTop: '4px',
                transition: 'all 0.2s ease'
              }}>
                {officialSubmitting ? 'Registering...' : officialForm.roles.length > 0 ? `Register as ${officialForm.roles.join(' & ')} →` : 'Select a role above to register'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Fighter waitlist */}
      <section style={{ padding: '96px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '100px', padding: '6px 16px', fontSize: '13px', color: '#D85A30', fontWeight: 600, marginBottom: '20px' }}>
          📍 Pune Beta — limited spots
        </div>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, marginBottom: '12px', letterSpacing: '-1px' }}>
          Join the Pune waitlist
        </h2>
        <p style={{ color: '#666', fontSize: '16px', marginBottom: '36px', maxWidth: '420px' }}>
          We're launching in Pune first. Drop your email and we'll reach out with your invite, partner gym details, and first event date.
        </p>
        <form onSubmit={handleWaitlist} style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '440px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required
            style={{ flex: 1, minWidth: '220px', padding: '14px 18px', borderRadius: '10px', border: '1px solid #333', background: '#1a1a1a', color: '#fff', fontSize: '15px' }} />
          <button type="submit" disabled={submitting} style={{ background: '#D85A30', color: '#fff', border: 'none', padding: '14px 24px', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
            {submitting ? 'Joining...' : 'Join Waitlist'}
          </button>
        </form>
        {status && (
          <p style={{ marginTop: '16px', fontSize: '14px', color: status.type === 'success' ? '#4ade80' : status.type === 'info' ? '#D85A30' : '#f87171' }}>
            {status.msg}
          </p>
        )}
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1a1a1a', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontWeight: 800, fontSize: '16px' }}>Spar<span style={{ color: '#D85A30' }}>rd</span></span>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <a href="#gyms" style={{ color: '#555', fontSize: '13px', textDecoration: 'none' }}>For Gyms</a>
          <a href="#officials" style={{ color: '#555', fontSize: '13px', textDecoration: 'none' }}>Officials</a>
          <span style={{ color: '#333', fontSize: '13px' }}>© {new Date().getFullYear()} Sparrd. Built for fighters.</span>
        </div>
      </footer>
    </div>
  )
}
