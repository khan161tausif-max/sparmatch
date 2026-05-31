'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Signup() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    age: '',
    sport: '',
    weight_kg: '',
    level: '',
    gym_name: '',
    city: '',
    bio: ''
  })

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleAuth = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password
    })
    if (error) { setError(error.message); setLoading(false); return }
    setStep(2)
    setLoading(false)
  }

  const handleProfile = async () => {
    setLoading(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('profiles').insert({
      id: user.id,
      name: form.name,
      age: parseInt(form.age),
      sport: form.sport,
      weight_kg: parseInt(form.weight_kg),
      level: form.level,
      gym_name: form.gym_name,
      city: form.city,
      bio: form.bio
    })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/swipe')
  }

  const inputStyle = {
    width: '100%',
    padding: '14px',
    borderRadius: '10px',
    border: '1px solid #333',
    background: '#1a1a1a',
    color: 'white',
    fontSize: '16px',
    marginBottom: '12px',
    boxSizing: 'border-box'
  }

  const btnStyle = {
    width: '100%',
    padding: '16px',
    borderRadius: '12px',
    background: '#D85A30',
    color: 'white',
    fontWeight: '700',
    fontSize: '16px',
    border: 'none',
    cursor: 'pointer',
    marginTop: '8px'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'sans-serif',
      color: 'white'
    }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
          {step === 1 ? 'Create Account' : 'Your Fighter Profile'}
        </h2>
        <p style={{ color: '#888', marginBottom: '32px' }}>
          {step === 1 ? 'Step 1 of 2 — Account details' : 'Step 2 of 2 — Tell us about yourself'}
        </p>

        {error && <p style={{ color: '#ff4444', marginBottom: '16px' }}>{error}</p>}

        {step === 1 && <>
          <input style={inputStyle} placeholder="Email" type="email"
            value={form.email} onChange={e => update('email', e.target.value)} />
          <input style={inputStyle} placeholder="Password" type="password"
            value={form.password} onChange={e => update('password', e.target.value)} />
          <button style={btnStyle} onClick={handleAuth} disabled={loading}>
            {loading ? 'Creating...' : 'Continue'}
          </button>
        </>}

        {step === 2 && <>
          <input style={inputStyle} placeholder="Full name" value={form.name}
            onChange={e => update('name', e.target.value)} />
          <input style={inputStyle} placeholder="Age" type="number" value={form.age}
            onChange={e => update('age', e.target.value)} />
          <select style={inputStyle} value={form.sport} onChange={e => update('sport', e.target.value)}>
            <option value="">Select sport</option>
            <option value="MMA">MMA</option>
            <option value="Boxing">Boxing</option>
            <option value="Muay Thai">Muay Thai</option>
            <option value="BJJ">BJJ</option>
            <option value="Wrestling">Wrestling</option>
          </select>
          <input style={inputStyle} placeholder="Weight (kg)" type="number" value={form.weight_kg}
            onChange={e => update('weight_kg', e.target.value)} />
          <select style={inputStyle} value={form.level} onChange={e => update('level', e.target.value)}>
            <option value="">Experience level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Pro">Pro</option>
          </select>
          <input style={inputStyle} placeholder="Gym name" value={form.gym_name}
            onChange={e => update('gym_name', e.target.value)} />
          <input style={inputStyle} placeholder="City" value={form.city}
            onChange={e => update('city', e.target.value)} />
          <textarea style={{ ...inputStyle, height: '80px', resize: 'none' }}
            placeholder="Short bio (optional)" value={form.bio}
            onChange={e => update('bio', e.target.value)} />
          <button style={btnStyle} onClick={handleProfile} disabled={loading}>
            {loading ? 'Saving...' : 'Create Profile'}
          </button>
        </>}
      </div>
    </div>
  )
}