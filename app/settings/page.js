'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import BottomNav from '../../components/BottomNav'

export default function Settings() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data } = await supabase.from('profiles').select('name, avatar_url').eq('id', user.id).single()
      setProfile(data)
    }
    init()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const deleteAccount = async () => {
    setDeleting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').delete().eq('id', user.id)
    }
    await supabase.auth.signOut()
    router.push('/')
  }

  const menuItems = [
    { label: 'Edit Profile', action: () => router.push('/profile') },
    { label: 'Privacy Policy', action: () => {} },
    { label: 'Help & Support', action: () => {} },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'sans-serif', color: 'white', paddingBottom: '80px' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #111' }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800' }}>Settings</h1>
      </div>

      <div style={{ maxWidth: '420px', margin: '0 auto', padding: '24px 20px' }}>

        {/* Profile card */}
        {profile && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            background: '#141414', borderRadius: '16px', padding: '16px', marginBottom: '24px'
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%', overflow: 'hidden',
              background: '#2a2a2a', border: '2px solid #D85A30', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', fontWeight: '700', color: '#D85A30'
            }}>
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : profile.name?.[0]?.toUpperCase()
              }
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '16px' }}>{profile.name}</div>
              <div style={{ fontSize: '13px', color: '#555', marginTop: '2px' }}>{user?.email}</div>
            </div>
          </div>
        )}

        {/* Menu */}
        <div style={{ background: '#141414', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px' }}>
          {menuItems.map(({ label, action }, i) => (
            <button key={label} onClick={action} style={{
              width: '100%', padding: '16px 20px', background: 'none', border: 'none',
              color: 'white', textAlign: 'left', fontSize: '15px', cursor: 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: i < menuItems.length - 1 ? '1px solid #1e1e1e' : 'none'
            }}>
              {label}
              <span style={{ color: '#444' }}>›</span>
            </button>
          ))}
        </div>

        {/* App info */}
        <div style={{ background: '#141414', borderRadius: '16px', padding: '16px 20px', marginBottom: '28px' }}>
          <div style={{ fontSize: '11px', color: '#444', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>Version</div>
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#888' }}>Sparrd Beta — Pune</div>
        </div>

        {/* Sign out */}
        <button onClick={signOut} style={{
          width: '100%', padding: '16px', borderRadius: '12px',
          background: '#D85A30', color: 'white', fontWeight: '700',
          fontSize: '16px', border: 'none', cursor: 'pointer', marginBottom: '12px'
        }}>
          Sign Out
        </button>

        {/* Delete account */}
        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)} style={{
            width: '100%', padding: '14px', borderRadius: '12px',
            background: 'none', color: '#666', fontWeight: '600',
            fontSize: '14px', border: '1px solid #2a2a2a', cursor: 'pointer'
          }}>
            Delete Account
          </button>
        ) : (
          <div style={{ background: '#160a0a', border: '1px solid #3a1515', borderRadius: '14px', padding: '20px' }}>
            <p style={{ color: '#ff5555', fontWeight: '700', marginBottom: '8px', fontSize: '15px' }}>Delete your account?</p>
            <p style={{ color: '#777', fontSize: '13px', marginBottom: '20px', lineHeight: '1.5' }}>
              Your profile and matches will be permanently removed. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{
                flex: 1, padding: '13px', borderRadius: '10px', background: '#1a1a1a',
                color: '#888', border: '1px solid #333', cursor: 'pointer', fontWeight: '600'
              }}>
                Cancel
              </button>
              <button onClick={deleteAccount} disabled={deleting} style={{
                flex: 1, padding: '13px', borderRadius: '10px', background: '#cc2222',
                color: 'white', border: 'none', cursor: 'pointer', fontWeight: '700'
              }}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
