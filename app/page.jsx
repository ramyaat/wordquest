'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const AVATARS = [
  // Percy Jackson
  { e: '🔱', label: 'Percy' },
  { e: '⚡', label: 'Thalia' },
  { e: '🌊', label: 'Tyson' },
  { e: '🏹', label: 'Artemis' },
  { e: '🦉', label: 'Annabeth' },
  { e: '☀️', label: 'Apollo' },
  { e: '🌙', label: 'Selene' },
  { e: '🌑', label: 'Nico' },
  { e: '🍷', label: 'Dionysus' },
  { e: '🔨', label: 'Hephaestus' },
  { e: '🌿', label: 'Grover' },
  { e: '🏺', label: 'Medusa' },
  { e: '🗡️', label: 'Luke' },
  { e: '🛡️', label: 'Clarisse' },
  { e: '🔥', label: 'Ares' },
  // Animals
  { e: '🦁', label: 'Lion' },
  { e: '🐯', label: 'Tiger' },
  { e: '🦊', label: 'Fox' },
  { e: '🐺', label: 'Wolf' },
  { e: '🦅', label: 'Eagle' },
  { e: '🐉', label: 'Dragon' },
  { e: '🦈', label: 'Shark' },
  { e: '🐬', label: 'Dolphin' },
  { e: '🦋', label: 'Butterfly' },
  { e: '🦄', label: 'Unicorn' },
  // Symbols
  { e: '🎓', label: 'Scholar' },
  { e: '🌟', label: 'Star' },
  { e: '🎯', label: 'Bullseye' },
  { e: '🏆', label: 'Champ' },
  { e: '🚀', label: 'Rocket' },
  { e: '🧠', label: 'Genius' },
  { e: '👑', label: 'King' },
  { e: '💎', label: 'Diamond' },
  { e: '🔮', label: 'Oracle' },
  { e: '🎭', label: 'Actor' },
]

// 4-box PIN input
function PINInput({ value, onChange, disabled, autoFocus }) {
  const boxes = useRef([])
  const chars = value.padEnd(4, ' ').slice(0, 4).split('')

  function handleKey(i, e) {
    if (e.key === 'Backspace') {
      onChange(value.slice(0, i) + value.slice(i + 1))
      if (i > 0) setTimeout(() => boxes.current[i - 1]?.focus(), 0)
      return
    }
    if (!/^\d$/.test(e.key)) return
    const next = (value.slice(0, i) + e.key + value.slice(i + 1)).slice(0, 4)
    onChange(next)
    if (i < 3) setTimeout(() => boxes.current[i + 1]?.focus(), 0)
  }

  function handlePaste(e) {
    const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    if (p) { onChange(p); setTimeout(() => boxes.current[Math.min(p.length, 3)]?.focus(), 0) }
    e.preventDefault()
  }

  useEffect(() => {
    if (autoFocus) setTimeout(() => boxes.current[0]?.focus(), 50)
  }, [autoFocus])

  return (
    <div style={{ display:'flex', gap:'10px', justifyContent:'center', margin:'18px 0' }}>
      {chars.map((ch, i) => (
        <input key={i} ref={el => boxes.current[i] = el}
          type="password" inputMode="numeric" maxLength={1}
          value={ch.trim()} disabled={disabled}
          onChange={() => {}} onKeyDown={e => handleKey(i, e)} onPaste={handlePaste}
          onFocus={() => boxes.current[i]?.select()}
          style={{ width:'52px', height:'60px', textAlign:'center', fontSize:'1.6rem', fontWeight:800,
            border:'2px solid', borderRadius:'14px', outline:'none', fontFamily:'inherit',
            borderColor: ch.trim() ? 'var(--blue)' : '#ddd',
            background: ch.trim() ? '#e8f4ff' : '#fff',
            opacity: disabled ? 0.6 : 1 }} />
      ))}
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  // screens: 'profiles' | 'login-pin' | 'signup'
  const [screen, setScreen]     = useState('profiles')

  // Login state
  const [loginTarget, setLoginTarget] = useState(null)
  const [loginPIN, setLoginPIN]       = useState('')
  const [loginError, setLoginError]   = useState('')
  const [loginBusy, setLoginBusy]     = useState(false)

  // Signup state
  const [newName, setNewName]     = useState('')
  const [newAvatar, setNewAvatar] = useState('🔱')
  const [newPIN, setNewPIN]       = useState('')
  const [confirmPIN, setConfirmPIN] = useState('')
  const [signupError, setSignupError] = useState('')
  const [saving, setSaving]       = useState(false)

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(d => {
      setUsers(d.users || [])
      setLoading(false)
    })
  }, [])

  function openLogin(u) {
    setLoginTarget(u)
    setLoginPIN('')
    setLoginError('')
    setScreen('login-pin')
  }

  async function handleVerifyPIN() {
    if (loginPIN.length !== 4) return
    setLoginBusy(true)
    setLoginError('')
    const res = await fetch('/api/auth/verify-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: loginTarget.username, pin: loginPIN }),
    })
    const data = await res.json()
    if (!res.ok) {
      setLoginError(data.error || 'Wrong PIN')
      setLoginPIN('')
      setLoginBusy(false)
      return
    }
    sessionStorage.setItem('wq_user', loginTarget.username)
    router.push('/game')
  }

  async function handleCreate(e) {
    e.preventDefault()
    setSignupError('')
    if (newName.trim().length < 2) { setSignupError('Name must be at least 2 characters'); return }
    if (newPIN.length !== 4)        { setSignupError('PIN must be 4 digits'); return }
    if (newPIN !== confirmPIN)      { setSignupError('PINs do not match'); return }
    setSaving(true)
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: newName.trim(), avatar: newAvatar, pin: newPIN }),
    })
    const data = await res.json()
    if (!res.ok) { setSignupError(data.error || 'Could not create profile'); setSaving(false); return }
    sessionStorage.setItem('wq_user', data.profile.username)
    router.push('/game')
  }

  const outerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg,#1f4068 0%,#2e6aad 50%,#1CB0F6 100%)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '24px',
  }

  const PageHeader = () => (
    <div style={{ textAlign:'center', marginBottom:'32px', color:'#fff' }}>
      <div style={{ fontSize:'3.5rem', marginBottom:'8px' }}>🎯</div>
      <h1 style={{ fontSize:'2.2rem', fontWeight:800, marginBottom:'6px' }}>Word Quest</h1>
      <p style={{ opacity:.8, fontSize:'1rem' }}>Battle of Words · Grade 7 · 200 Words · 20 Days</p>
    </div>
  )

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'var(--bg)' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'3rem', marginBottom:'12px' }}>🎯</div>
        <div style={{ fontWeight:700, color:'var(--navy)', fontSize:'1.1rem' }}>Loading Word Quest…</div>
      </div>
    </div>
  )

  // ── PIN login screen ──────────────────────────────────────────────────────
  if (screen === 'login-pin') return (
    <div style={outerStyle}>
      <div style={{ maxWidth:'380px', width:'100%' }}>
        <PageHeader />
        <div className="card" style={{ textAlign:'center' }}>
          <div style={{ fontSize:'3rem', marginBottom:'6px' }}>{loginTarget?.avatar}</div>
          <div style={{ fontWeight:800, fontSize:'1.2rem', color:'var(--navy)', marginBottom:'4px' }}>
            Hi, {loginTarget?.username}!
          </div>
          <p style={{ color:'#666', fontSize:'.9rem', marginBottom:'0' }}>Enter your 4-digit PIN</p>

          <PINInput value={loginPIN} onChange={setLoginPIN} disabled={loginBusy} autoFocus />

          {loginError && (
            <p style={{ color:'var(--red)', fontSize:'.88rem', marginBottom:'12px' }}>{loginError}</p>
          )}

          <button className="btn btn-green btn-full" onClick={handleVerifyPIN}
            disabled={loginPIN.length !== 4 || loginBusy} style={{ marginBottom:'10px' }}>
            {loginBusy ? 'Checking…' : '▶ Enter Game'}
          </button>
          <button className="btn btn-ghost btn-full" onClick={() => setScreen('profiles')}>
            ← Back
          </button>
        </div>
      </div>
    </div>
  )

  // ── Signup screen ─────────────────────────────────────────────────────────
  if (screen === 'signup') return (
    <div style={outerStyle}>
      <div style={{ maxWidth:'480px', width:'100%' }}>
        <PageHeader />
        <div className="card">
          <h3 style={{ fontWeight:800, color:'var(--navy)', marginBottom:'16px' }}>✨ Create Your Profile</h3>
          <form onSubmit={handleCreate}>
            {/* Name */}
            <div style={{ marginBottom:'14px' }}>
              <label style={{ fontWeight:600, fontSize:'.9rem', color:'#555', display:'block', marginBottom:'6px' }}>Your Name</label>
              <input value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="Enter your name…" maxLength={30} autoFocus
                style={{ width:'100%', padding:'12px 16px', border:'2px solid #ddd', borderRadius:'12px',
                  fontSize:'1rem', outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}
                onFocus={e => e.target.style.borderColor='var(--blue)'}
                onBlur={e => e.target.style.borderColor='#ddd'} />
            </div>

            {/* Avatar */}
            <div style={{ marginBottom:'16px' }}>
              <label style={{ fontWeight:600, fontSize:'.9rem', color:'#555', display:'block', marginBottom:'8px' }}>Pick Your Avatar</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                {AVATARS.map(a => (
                  <button key={a.e} type="button" onClick={() => setNewAvatar(a.e)} title={a.label}
                    style={{ fontSize:'1.8rem', width:'48px', height:'48px', borderRadius:'12px', border:'2px solid',
                      borderColor: a.e === newAvatar ? 'var(--blue)' : '#ddd',
                      background: a.e === newAvatar ? '#e8f4ff' : '#fff', cursor:'pointer', transition:'all .15s' }}>
                    {a.e}
                  </button>
                ))}
              </div>
            </div>

            {/* PIN */}
            <div style={{ marginBottom:'8px' }}>
              <label style={{ fontWeight:600, fontSize:'.9rem', color:'#555', display:'block', marginBottom:'4px' }}>
                Choose a 4-digit PIN
              </label>
              <p style={{ fontSize:'.8rem', color:'#999', marginBottom:'0' }}>You&apos;ll use this every time you log in</p>
              <PINInput value={newPIN} onChange={setNewPIN} disabled={saving} />
            </div>

            <div style={{ marginBottom:'16px' }}>
              <label style={{ fontWeight:600, fontSize:'.9rem', color:'#555', display:'block', marginBottom:'4px' }}>
                Confirm PIN
              </label>
              <PINInput value={confirmPIN} onChange={setConfirmPIN} disabled={saving} />
            </div>

            {signupError && <p style={{ color:'var(--red)', fontSize:'.88rem', marginBottom:'10px' }}>{signupError}</p>}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              <button type="button" className="btn btn-ghost"
                onClick={() => { setScreen('profiles'); setSignupError('') }}>Cancel</button>
              <button type="submit" className="btn btn-green" disabled={saving}>
                {saving ? 'Creating…' : '🚀 Start Playing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )

  // ── Profile list ──────────────────────────────────────────────────────────
  return (
    <div style={outerStyle}>
      <div style={{ maxWidth:'640px', width:'100%' }}>
        <PageHeader />

        <div className="card" style={{ marginBottom:'16px' }}>
          <h2 style={{ fontSize:'1.2rem', fontWeight:800, color:'var(--navy)', marginBottom:'16px', textAlign:'center' }}>
            👤 Who&apos;s playing?
          </h2>
          {users.length === 0
            ? <p style={{ textAlign:'center', color:'#777', padding:'16px' }}>No profiles yet. Create one below!</p>
            : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:'12px' }}>
                {users.map(u => (
                  <div key={u.username} className="profile-card" onClick={() => openLogin(u)}>
                    <div style={{ fontSize:'2.8rem', marginBottom:'8px' }}>{u.avatar}</div>
                    <div style={{ fontWeight:700, fontSize:'.95rem', color:'var(--navy)' }}>{u.username}</div>
                    <div style={{ fontSize:'.72rem', color:'#aaa', marginTop:'4px' }}>🔒 PIN required</div>
                  </div>
                ))}
              </div>
          }
        </div>

        <button className="btn btn-green btn-full" style={{ fontSize:'1rem', padding:'16px' }}
          onClick={() => { setScreen('signup'); setSignupError('') }}>
          + Add New Player
        </button>
      </div>
    </div>
  )
}
