'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Signup() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const fileInputRef = useRef(null)

  // If user lands here already authenticated (e.g. clicked email confirm link)
  // but has no profile yet, skip straight to step 2
  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle()
      if (profile) { router.push('/swipe'); return }
      setStep(2)
    }
    check()
  }, [])

  const [form, setForm] = useState({
    email: '', password: '', name: '', age: '', sport: '',
    weight_kg: '', level: '', gym_name: '', city: '', bio: '', fights: 0
  })

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))
  const isMinor = form.age !== '' && parseInt(form.age) < 18

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

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleProfile = async () => {
    setLoading(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Session expired — please go back and sign in again.')
        setLoading(false)
        return
      }

      let avatar_url = null

      // Upload avatar if provided
      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop()
        const path = `${user.id}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, avatarFile, { upsert: true })
        if (uploadError) {
          setError('Image upload failed: ' + uploadError.message)
          setLoading(false)
          return
        }
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
        avatar_url = urlData.publicUrl
      }

      const { error: insertError } = await supabase.from('profiles').insert({
        id: user.id,
        name: form.name,
        age: parseInt(form.age),
        sport: form.sport,
        weight_kg: parseInt(form.weight_kg),
        level: form.level,
        gym_name: form.gym_name || null,
        city: form.city,
        bio: form.bio,
        fights: form.fights,
        avatar_url
      })

      if (insertError) { setError(insertError.message); setLoading(false); return }
      router.push('/swipe')
    } catch (e) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '14px', borderRadius: '10px',
    border: '1px solid #333', background: '#1a1a1a', color: 'white',
    fontSize: '16px', marginBottom: '12px', boxSizing: 'border-box'
  }

  const btnStyle = {
    width: '100%', padding: '16px', borderRadius: '12px',
    background: '#D85A30', color: 'white', fontWeight: '700',
    fontSize: '16px', border: 'none', cursor: 'pointer', marginTop: '8px'
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0a', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '20px', fontFamily: 'sans-serif', color: 'white'
    }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
          {step === 1 ? 'Create Account' : 'Your Fighter Profile'}
        </h2>
        <p style={{ color: '#888', marginBottom: '32px' }}>
          {step === 1 ? 'Step 1 of 2 — Account details' : 'Step 2 of 2 — Tell us about yourself'}
        </p>

        {error && <p style={{ color: '#ff4444', marginBottom: '16px', fontSize: '14px' }}>{error}</p>}

        {/* ── Step 1 ── */}
        {step === 1 && <>
          <input style={inputStyle} placeholder="Email" type="email"
            value={form.email} onChange={e => update('email', e.target.value)} />

          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <input
              style={{ ...inputStyle, marginBottom: 0, paddingRight: '48px' }}
              placeholder="Password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={e => update('password', e.target.value)}
            />
            <button type="button" onClick={() => setShowPassword(p => !p)} style={{
              position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
              color: showPassword ? '#D85A30' : '#555', display: 'flex', alignItems: 'center'
            }} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>

          <button style={btnStyle} onClick={handleAuth} disabled={loading}>
            {loading ? 'Creating...' : 'Continue'}
          </button>
        </>}

        {/* ── Step 2 ── */}
        {step === 2 && <>

          {/* Avatar upload */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '96px', height: '96px', borderRadius: '50%',
                background: '#1a1a1a', border: `2px dashed ${avatarPreview ? '#D85A30' : '#444'}`,
                cursor: 'pointer', overflow: 'hidden', display: 'flex',
                alignItems: 'center', justifyContent: 'center', marginBottom: '8px',
                transition: 'border-color 0.2s'
              }}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
                  <div style={{ fontSize: '24px', marginBottom: '2px' }}>📷</div>
                  <div style={{ fontSize: '10px', color: '#555' }}>Add photo</div>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
            <span style={{ fontSize: '12px', color: '#555' }}>
              {avatarPreview ? (
                <span style={{ color: '#D85A30', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>Change photo</span>
              ) : 'optional — tap to upload'}
            </span>
          </div>

          <input style={inputStyle} placeholder="Full name" value={form.name}
            onChange={e => update('name', e.target.value)} />

          <input style={inputStyle} placeholder="Age" type="number" value={form.age}
            onChange={e => update('age', e.target.value)} />

          {/* Under-18 guardian warning */}
          {isMinor && (
            <div style={{
              background: '#1a1000', border: '1px solid #7a5000', borderRadius: '10px',
              padding: '12px 14px', marginBottom: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start'
            }}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>⚠️</span>
              <p style={{ margin: 0, fontSize: '13px', color: '#f5c542', lineHeight: 1.5 }}>
                You're under 18. A parent or guardian must be present with you at every match. By continuing you confirm they are aware and will attend.
              </p>
            </div>
          )}

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

          {/* Experience level + fight counter */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <select style={{ ...inputStyle, marginBottom: 0, flex: 1 }} value={form.level} onChange={e => update('level', e.target.value)}>
              <option value="">Experience level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Pro">Pro</option>
            </select>

            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: '#666', fontWeight: 500, whiteSpace: 'nowrap' }}>Fights</span>
              <div style={{ display: 'flex', alignItems: 'center', background: '#1a1a1a', border: '1px solid #333', borderRadius: '10px', overflow: 'hidden', height: '50px' }}>
                <button type="button" onClick={() => update('fights', Math.max(0, form.fights - 1))}
                  style={{ width: '38px', height: '100%', background: 'none', border: 'none', color: '#888', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #333' }}>
                  −
                </button>
                <span style={{ width: '36px', textAlign: 'center', fontSize: '16px', fontWeight: 700 }}>
                  {form.fights}
                </span>
                <button type="button" onClick={() => update('fights', form.fights + 1)}
                  style={{ width: '38px', height: '100%', background: 'none', border: 'none', color: '#D85A30', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid #333' }}>
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Gym name — optional */}
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <input style={{ ...inputStyle, marginBottom: 0, paddingRight: '80px' }}
              placeholder="Gym name" value={form.gym_name}
              onChange={e => update('gym_name', e.target.value)} />
            <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: '#555', pointerEvents: 'none' }}>
              optional
            </span>
          </div>

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
