import React from 'react'

const colors = ['#2E7D32', '#C9A84C', '#C62828', '#1565C0', '#6A1B9A', '#E65100', '#00838F', '#AD1457']

function createParticle(x, y) {
  const color = colors[Math.floor(Math.random() * colors.length)]
  const angle = Math.random() * Math.PI * 2
  const velocity = 3 + Math.random() * 5
  return {
    x, y, color,
    vx: Math.cos(angle) * velocity,
    vy: Math.sin(angle) * velocity - 3,
    size: 4 + Math.random() * 6,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 15,
    opacity: 1,
    shape: Math.random() > 0.5 ? 'rect' : 'circle',
  }
}

export default function Confetti({ trigger }) {
  const [particles, setParticles] = React.useState([])
  const [active, setActive] = React.useState(false)
  const animRef = React.useRef(null)

  React.useEffect(() => {
    if (!trigger) return

    // Crear partículas
    const cx = window.innerWidth / 2
    const cy = window.innerHeight / 3
    const newParticles = Array.from({ length: 60 }, () => createParticle(cx, cy))
    setParticles(newParticles)
    setActive(true)

    let frame = 0
    const maxFrames = 90

    const animate = () => {
      frame++
      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy + 0.15 * frame, // gravedad
        vy: p.vy + 0.08,
        rotation: p.rotation + p.rotationSpeed,
        opacity: Math.max(0, 1 - frame / maxFrames),
        size: p.size * (1 - frame / maxFrames * 0.3),
      })))

      if (frame < maxFrames) {
        animRef.current = requestAnimationFrame(animate)
      } else {
        setActive(false)
        setParticles([])
      }
    }

    animRef.current = requestAnimationFrame(animate)

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [trigger])

  if (!active || particles.length === 0) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 10000,
    }}>
      {particles.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: p.x,
          top: p.y,
          width: p.size,
          height: p.size,
          background: p.color,
          borderRadius: p.shape === 'circle' ? '50%' : 2,
          transform: `rotate(${p.rotation}deg)`,
          opacity: p.opacity,
        }} />
      ))}
    </div>
  )
}