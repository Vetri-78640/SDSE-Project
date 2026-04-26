'use client'

import { useEffect, useRef, useState } from 'react'

const stats = [
  { end: 3500, suffix: '+', label: 'Individuals' },
  { end: 2500, suffix: '+', label: 'Students' },
  { end: 300, suffix: '+', label: 'Business Owners' },
  { end: 90, suffix: '+', label: 'Countries' },
  { end: 250000, suffix: '+', label: 'Webinar & YouTube' },
]

function useCountUp(end: number, active: boolean, duration = 1800) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!active) return
    let start = 0
    const step = end / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [active, end, duration])

  return count
}

function StatItem({ end, suffix, label }: { end: number; suffix: string; label: string }) {
  const [active, setActive] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const count = useCountUp(end, active)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true) },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const formatted = end >= 1000
    ? count.toLocaleString('en-IN')
    : count.toString()

  return (
    <div ref={ref} className="flex flex-col items-center text-center px-6">
      <p className="text-amber text-4xl font-bold font-serif">
        {formatted}{suffix}
      </p>
      <p className="text-cosmic text-sm tracking-wide mt-2">{label}</p>
    </div>
  )
}

export default function StatsSection() {
  return (
    <section className="bg-void py-20 px-8" aria-label="Stats">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-serif text-3xl text-amber text-center mb-12">
          So Far We&apos;ve Guided...
        </h2>
        <div className="flex flex-wrap justify-center divide-x divide-gold/20">
          {stats.map((s) => (
            <StatItem key={s.label} {...s} />
          ))}
        </div>
      </div>
    </section>
  )
}
