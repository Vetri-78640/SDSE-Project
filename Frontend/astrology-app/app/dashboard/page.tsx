'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api, clearSession, getUser } from '@/lib/api'

interface Profile {
  _id: string
  personalInfo: {
    name: string
    gender: string
    dateOfBirth: string
    timeOfBirth: string
    placeOfBirth: { city: string; country: string }
  }
}

interface Chart {
  _id: string
  chartName: string
  generatedAt: string
  chartData: Record<string, unknown>
}

export default function DashboardPage() {
  const router = useRouter()
  const user = getUser()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [charts, setCharts] = useState<Chart[]>([])
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadingCharts, setLoadingCharts] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin')
      return
    }

    api.profile.get().then((res) => {
      if (res.success && res.data) setProfile(res.data as unknown as Profile)
      setLoadingProfile(false)
    })

    api.chart.list().then((res) => {
      if (res.success && res.data) setCharts((res.data as unknown as { count: number; data: Chart[] }).data ?? [])
      setLoadingCharts(false)
    })
  }, [])

  const handleSignout = () => {
    clearSession()
    router.push('/')
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-void text-starlight">
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-surface border-b border-gold/20">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-amber">★</span>
          <span className="text-amber font-serif">Deepa&apos;s Vision</span>
        </Link>
        <div className="flex items-center gap-6">
          <span className="text-cosmic text-sm">{user.name}</span>
          <button
            onClick={handleSignout}
            className="text-xs tracking-widest text-cosmic hover:text-gold transition-colors"
          >
            SIGN OUT
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-12 flex flex-col gap-10">
        {/* Welcome */}
        <div>
          <p className="text-xs tracking-[3px] uppercase text-amber mb-1">Dashboard</p>
          <h1 className="font-serif text-3xl text-amber">
            नमस्ते, {user.name.split(' ')[0]}
          </h1>
        </div>

        {/* Profile card */}
        <section className="bg-surface border border-gold/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg text-amber">Your Profile</h2>
            {!loadingProfile && !profile && (
              <Link href="/profile/create" className="text-xs tracking-widest px-4 py-2 bg-saffron text-white hover:bg-saffron/80 transition-colors">
                + CREATE PROFILE
              </Link>
            )}
            {!loadingProfile && profile && (
              <Link href="/profile/edit" className="text-xs tracking-widest px-4 py-2 border border-gold/30 text-cosmic hover:border-gold/60 hover:text-gold transition-colors">
                EDIT
              </Link>
            )}
          </div>

          {loadingProfile ? (
            <p className="text-cosmic text-sm">Loading...</p>
          ) : profile ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                ['Name', profile.personalInfo.name],
                ['Gender', profile.personalInfo.gender],
                ['Date of Birth', new Date(profile.personalInfo.dateOfBirth).toLocaleDateString('en-IN')],
                ['Time of Birth', profile.personalInfo.timeOfBirth],
                ['City', profile.personalInfo.placeOfBirth.city],
                ['Country', profile.personalInfo.placeOfBirth.country],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-cosmic text-xs tracking-wide">{label}</p>
                  <p className="text-starlight text-sm font-medium capitalize">{value}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-cosmic text-sm">
              No profile yet. Create one to generate your Kundali.
            </p>
          )}
        </section>

        {/* Birth Chart CTA */}
        {profile && (
          <section className="bg-crimson border border-gold/30 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs tracking-[3px] uppercase text-amber mb-1">ज्योतिष</p>
              <h2 className="font-serif text-xl text-starlight">Generate Your Kundali</h2>
              <p className="text-starlight/60 text-sm mt-1">
                Your birth chart awaits — ancient wisdom decoded.
              </p>
            </div>
            <Link
              href="/birth-chart"
              className="inline-flex items-center px-6 py-3 bg-amber text-void text-sm font-semibold tracking-wide hover:bg-gold transition-colors whitespace-nowrap"
            >
              🪐 View Birth Chart
            </Link>
          </section>
        )}

        {/* Recent Charts */}
        <section>
          <h2 className="font-serif text-lg text-amber mb-4">Your Charts</h2>
          {loadingCharts ? (
            <p className="text-cosmic text-sm">Loading...</p>
          ) : charts.length === 0 ? (
            <p className="text-cosmic text-sm">
              No charts generated yet.{' '}
              {profile ? (
                <Link href="/birth-chart" className="text-amber hover:text-gold">
                  Generate your first Kundali →
                </Link>
              ) : (
                'Create a profile first.'
              )}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {charts.map((c) => (
                <div
                  key={c._id}
                  className="flex items-center justify-between bg-surface border border-gold/20 px-5 py-4 hover:border-gold/40 transition-colors"
                >
                  <div>
                    <p className="text-starlight text-sm font-medium">{c.chartName}</p>
                    <p className="text-cosmic text-xs">
                      {new Date(c.generatedAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <Link
                    href={`/birth-chart?id=${c._id}`}
                    className="text-amber text-xs tracking-wide hover:text-gold transition-colors"
                  >
                    View →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
