'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import BottomNav from '../../components/BottomNav'

export default function Profile() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
      setForm({
        name: data?.name || '',
        age: data?.age?.toString() || '',
        sport: data?.sport || '',
        weight_kg: data?.weight_kg?.toString() || '',
        level: data?.level || '',
        gym_name: data?.gym_name || '',
        city: data?.city || '',
        bio: data?.bio || '',
        fights: data?.fights ?? 0
      })
      setLoading(false)
    }
    init()
  }, [])

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const cancelEdit = () => {
    setEditing(false)
    setAvatarFile(null)
    setAvatarPreview(null)
    setError('')
    setForm({
      name: profile?.name || '',
      age: profile?.age?.toString() || '',
      sport: profile?.sport || '',
      weight_kg: profile?.weight_kg?.toString() || '',
      level: profile?.level || '',
      gym_name: profile?.gym_name || '',
      city: profile?.city || '',
      bio: profile?.bio || '',
      fights: profile?.fights ?? 0
    })
  }

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      let avatar_url = profile.avatar_url

      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop()
        const path = `${user.id}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('avatars').upload(path, avatarFile, { upsert: true })
        if (uploadError) { setError('Image upload failed: ' + uploadError.message); setSaving(false); return }
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
        avatar_url = urlData.publicUrl
      }

      const { error: updateError } = await supabase.from('profiles').update({
        name: form.name,
        age: parseInt(form.age) || null,
        sport: form.sport,
        weight_kg: parseInt(form.weight_kg) || null,
        level: form.level,
        gym_name: form.gym_name || null,
        city: form.city,
        bio: form.bio,
        fights: form.fights,
        avatar_url
      }).eq('id', user.id)

      if (updateError) { setError(updateError.message); setSaving(false); return }

      const { data: updated } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(updated)
      setAvatarFile(null)
      setAvatarPreview(null)
      setEditing(false)
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setSaving(false)
  }

  const inputStyle = {
    width: '100%', padding: '14px', borderRadius: '10px',
    border: '1px solid #333', background: '#1a1a1a', color: 'white',
    fontSize: '16px', marginBottom: '12px', boxSizing: 'border-box'
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontFamily: 'sans-serif' }}>
        <BottomNav />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'sans-serif', color: 'white', paddingBottom: '80px' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #111', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800' }}>Profile</h1>
        {!editing && (
          <button onClick={() => setEditing(true)} style={{
            background: 'none', border: '1px solid #D85A30', color: '#D85A30',
            padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px'
          }}>
            Edit
          </button>
        )}
      </div>

      <div style={{ maxWidth: '420px', margin: '0 auto', padding: '24px 20px' }}>
        {!editing ? (
          <>
            {/* Avatar + name */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px' }}>
              <div style={{
                width: '108px', height: '108px', borderRadius: '50%', overflow: 'hidden',
                background: '#2a2a2a', border: '3px solid #D85A30', marginBottom: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '40px', fontWeight: '700', color: '#D85A30'
              }}>
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : profile?.name?.[0]?.toUpperCase()
                }
              </div>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>{profile?.name}</h2>
              {profile?.age && <p style={{ margin: '4px 0 0', color: '#666', fontSize: '14px' }}>{profile.age} years old</p>}
            </div>

            {/* Stats grid */}
            <div style={{ background: '#141414', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {[
                  { label: 'Sport', value: profile?.sport },
                  { label: 'Level', value: profile?.level },
                  { label: 'Weight', value: profile?.weight_kg ? `${profile.weight_kg} kg` : null },
                  { label: 'Fights', value: String(profile?.fights ?? 0) },
                  { label: 'City', value: profile?.city },
                  { label: 'Gym', value: profile?.gym_name || null },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontSize: '10px', color: '#555', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>{label}</div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: value ? '#fff' : '#333' }}>{value || '—'}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bio */}
            {profile?.bio ? (
              <div style={{ background: '#141414', borderRadius: '16px', padding: '20px' }}>
                <div style={{ fontSize: '10px', color: '#555', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' }}>About</div>
                <p style={{ margin: 0, color: '#bbb', lineHeight: '1.65', fontSize: '15px' }}>{profile.bio}</p>
              </div>
            ) : (
              <div style={{ background: '#141414', borderRadius: '16px', padding: '20px', textAlign: 'center', color: '#444', fontSize: '14px' }}>
                No bio yet — tap Edit to add one
              </div>
            )}
          </>
        ) : (
          <>
            {error && <p style={{ color: '#ff4444', marginBottom: '16px', fontSize: '14px' }}>{error}</p>}

            {/* Avatar upload */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
              <div onClick={() => fileInputRef.current?.click()} style={{
                width: '96px', height: '96px', borderRadius: '50%',
                background: '#1a1a1a', border: `2px dashed ${avatarPreview || profile?.avatar_url ? '#D85A30' : '#444'}`,
                cursor: 'pointer', overflow: 'hidden', display: 'flex',
                alignItems: 'center', justifyContent: 'center', marginBottom: '8px'
              }}>
                {avatarPreview || profile?.avatar_url ? (
                  <img src={avatarPreview || profile.avatar_url} alt="Avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px' }}>📷</div>
                    <div style={{ fontSize: '10px', color: '#555' }}>Add photo</div>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
              <span style={{ fontSize: '12px', color: '#D85A30', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
                {profile?.avatar_url ? 'Change photo' : 'Add photo'}
              </span>
            </div>

            <input style={inputStyle} placeholder="Full name" value={form.name} onChange={e => update('name', e.target.value)} />
            <input style={inputStyle} placeholder="Age" type="number" value={form.age} onChange={e => update('age', e.target.value)} />

            <select style={inputStyle} value={form.sport} onChange={e => update('sport', e.target.value)}>
              <option value="">Select sport</option>
              <option value="MMA">MMA</option>
              <option value="Boxing">Boxing</option>
              <option value="Muay Thai">Muay Thai</option>
              <option value="BJJ">BJJ</option>
              <option value="Wrestling">Wrestling</option>
            </select>

            <input style={inputStyle} placeholder="Weight (kg)" type="number" value={form.weight_kg} onChange={e => update('weight_kg', e.target.value)} />

            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <select style={{ ...inputStyle, marginBottom: 0, flex: 1 }} value={form.level} onChange={e => update('level', e.target.value)}>
                <option value="">Experience level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Pro">Pro</option>
              </select>
              <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '11px', color: '#666', fontWeight: 500 }}>Fights</span>
                <div style={{ display: 'flex', alignItems: 'center', background: '#1a1a1a', border: '1px solid #333', borderRadius: '10px', overflow: 'hidden', height: '50px' }}>
                  <button type="button" onClick={() => update('fights', Math.max(0, form.fights - 1))}
                    style={{ width: '38px', height: '100%', background: 'none', border: 'none', color: '#888', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #333' }}>
                    −
                  </button>
                  <span style={{ width: '36px', textAlign: 'center', fontSize: '16px', fontWeight: 700 }}>{form.fights}</span>
                  <button type="button" onClick={() => update('fights', form.fights + 1)}
                    style={{ width: '38px', height: '100%', background: 'none', border: 'none', color: '#D85A30', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1px solid #333' }}>
                    +
                  </button>
                </div>
              </div>
            </div>

            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <input style={{ ...inputStyle, marginBottom: 0, paddingRight: '80px' }}
                placeholder="Gym name" value={form.gym_name} onChange={e => update('gym_name', e.target.value)} />
              <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', color: '#555', pointerEvents: 'none' }}>optional</span>
            </div>

            <input style={inputStyle} placeholder="City" value={form.city} onChange={e => update('city', e.target.value)} />

            <textarea style={{ ...inputStyle, height: '80px', resize: 'none' }}
              placeholder="Short bio (optional)" value={form.bio} onChange={e => update('bio', e.target.value)} />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={cancelEdit} style={{
                flex: 1, padding: '16px', borderRadius: '12px', background: '#1a1a1a',
                color: '#888', fontWeight: '600', fontSize: '15px', border: '1px solid #333', cursor: 'pointer'
              }}>
                Cancel
              </button>
              <button onClick={save} disabled={saving} style={{
                flex: 2, padding: '16px', borderRadius: '12px', background: '#D85A30',
                color: 'white', fontWeight: '700', fontSize: '16px', border: 'none', cursor: 'pointer'
              }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
