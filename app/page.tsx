import Link from 'next/link'

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      color: 'white',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '8px' }}>
        Spar<span style={{ color: '#D85A30' }}>Match</span>
      </h1>
      <p style={{ color: '#888', fontSize: '18px', marginBottom: '48px' }}>
        Find your perfect sparring partner
      </p>

      <div style={{ display: 'flex', gap: '16px', flexDirection: 'column', width: '100%', maxWidth: '320px' }}>
        <Link href="/signup" style={{
          background: '#D85A30',
          color: 'white',
          padding: '16px',
          borderRadius: '12px',
          textDecoration: 'none',
          fontWeight: '600',
          fontSize: '16px'
        }}>
          Create Account
        </Link>
        <Link href="/login" style={{
          background: '#1a1a1a',
          color: 'white',
          padding: '16px',
          borderRadius: '12px',
          textDecoration: 'none',
          fontWeight: '600',
          fontSize: '16px',
          border: '1px solid #333'
        }}>
          Log In
        </Link>
      </div>
    </div>
  )
}