'use client'

import { useEffect, useState } from 'react'

function generateStars(count: number, color: string): string {
  const s: string[] = []
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 4000) - 2000
    const y = Math.floor(Math.random() * 4000) - 2000
    s.push(`${x}px ${y}px ${color}`)
  }
  return s.join(', ')
}

export function StarsBackground() {
  const [s1, setS1] = useState('')
  const [s2, setS2] = useState('')
  const [s3, setS3] = useState('')

  useEffect(() => {
    setS1(generateStars(800, 'rgba(171,156,125,0.55)'))
    setS2(generateStars(300, 'rgba(171,156,125,0.7)'))
    setS3(generateStars(150, 'rgba(245,240,232,0.55)'))
  }, [])

  const dot = (size: number, shadow: string, duration: string) => (
    <div style={{ animation: `stars-scroll-${size} ${duration} linear infinite` }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: size, height: size, borderRadius: '50%', background: 'transparent', boxShadow: shadow }} />
      <div style={{ position: 'absolute', top: 2000, left: 0, width: size, height: size, borderRadius: '50%', background: 'transparent', boxShadow: shadow }} />
    </div>
  )

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {s1 && dot(1, s1, '60s')}
      {s2 && dot(2, s2, '110s')}
      {s3 && dot(3, s3, '160s')}
    </div>
  )
}
