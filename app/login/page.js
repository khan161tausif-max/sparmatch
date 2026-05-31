'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '' })

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password
    })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/swipe')
  }

  const inputStyle = {
    width: '100%', padding: '14px', borderRadius: '10px',
    border: '1px solid #333', background: '#1a1a1a', color: 'white',
    fontSize: '16px', marginBottom: '12px', boxSizing: 'border-box'
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0a', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '20px', fontFamily: 'sans-serif', color: 'white'
    }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Welcome back</h2>
        <p style={{ color: '#888', marginBottom: '32px' }}>Log in to find your sparring partner</p>

        {error && <p style={{ color: '#ff4444', marginBottom: '16px' }}>{error}</p>}

        <input style={inputStyle} placeholder="Email" type="email"
          value={form.email} onChange={e => update('email', e.target.value)} />
        <input style={inputStyle} placeholder="Password" type="password"
          value={form.password} onChange={e => update('password', e.target.value)} />

        <button onClick={handleLogin} disabled={loading} style={{
          width: '100%', padding: '16px', borderRadius: '12px', background: '#D85A30',
          color: 'white', fontWeight: '700', fontSize: '16px', border: 'none', cursor: 'pointer'
        }}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#888' }}>
          No account? <Link href="/signup" style={{ color: '#D85A30' }}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}