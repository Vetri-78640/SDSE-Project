'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { api, getUser } from '@/lib/api'
import KundaliGrid from '@/components/chart/KundaliGrid'

// ── Types ─────────────────────────────────────────────────────────────────

interface Nakshatra { id?: number; name: string; pada?: number; lord?: string }

interface Planet {
  name: string; sign?: string; house?: number; degree_in_sign?: number
  absolute_degree?: number; nakshatra?: string | Nakshatra
  pada?: number; is_retrograde?: boolean; nakshatra_lord?: string
}

interface HouseData { house: number; sign: string; degree_cusp?: number }

interface DashaEntry {
  level: string; lord: string; start: string; end: string; duration_years: number
}

interface SadeSati { active: boolean; phase?: string; description?: string }

interface Ascendant {
  degree?: number; sign?: string
  nakshatra?: Nakshatra | string
}

interface ChartData {
  ayanamsha?: string
  timezone_used?: string
  house_system?: string
  ascendant?: Ascendant
  planets?: Planet[]
  houses?: HouseData[]
  vimshottari_dasha?: DashaEntry[]
  sade_sati?: SadeSati
  [key: string]: unknown
}

interface Chart { _id: string; chartName: string; generatedAt: string; chartData: ChartData }

// ── Helpers ────────────────────────────────────────────────────────────────

function nakshatraLabel(n: string | Nakshatra | undefined): string {
  if (!n) return '—'
  if (typeof n === 'string') return n
  return `${n.name}${n.pada ? ` (Pada ${n.pada})` : ''}`
}

function formatDeg(d?: number) { return d != null ? d.toFixed(2) + '°' : '—' }

function currentDasha(list: DashaEntry[] | undefined): DashaEntry | null {
  if (!list) return null
  const today = new Date()
  return list.find(d => new Date(d.start) <= today && new Date(d.end) >= today) ?? null
}

// ── Main page ──────────────────────────────────────────────────────────────

function BirthChartContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const focusId = searchParams.get('id')
  const user = getUser()

  const [charts, setCharts] = useState<Chart[]>([])
  const [selected, setSelected] = useState<Chart | null>(null)
  const [hasProfile, setHasProfile] = useState<boolean | null>(null)
  const [generating, setGenerating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmRegen, setConfirmRegen] = useState(false)
  const [showFriendModal, setShowFriendModal] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const [profileRes, chartRes] = await Promise.all([api.profile.get(), api.chart.list()])
    setHasProfile(profileRes.success && !!profileRes.data)
    if (chartRes.success && chartRes.data) {
      const raw = chartRes.data as unknown
      const list: Chart[] = Array.isArray(raw) ? raw : ((raw as { data?: Chart[] }).data ?? [])
      setCharts(list)
      const focus = focusId ? list.find(c => c._id === focusId) : null
      setSelected(focus ?? list[0] ?? null)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!user) { router.push('/auth/signin'); return }
    load()
  }, [])

  const handleGenerate = async () => {
    if (charts.length > 0 && !confirmRegen) { setConfirmRegen(true); return }
    setConfirmRegen(false); setError(''); setGenerating(true)
    try {
      const res = await api.chart.generate()
      if (!res.success) { setError(res.message ?? 'Generation failed'); return }
      await load()
    } catch { setError('Could not connect to server') }
    finally { setGenerating(false) }
  }

  const handleDelete = async (chartId: string) => {
    setDeletingId(chartId)
    try {
      await api.chart.delete(chartId)
      const updated = charts.filter(c => c._id !== chartId)
      setCharts(updated)
      if (selected?._id === chartId) setSelected(updated[0] ?? null)
    } finally { setDeletingId(null) }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-void text-starlight">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-surface border-b border-gold/20">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-amber">★</span>
          <span className="text-amber font-serif">Deepa&apos;s Vision</span>
        </Link>
        <Link href="/dashboard" className="text-xs tracking-widest text-cosmic hover:text-gold transition-colors">
          ← DASHBOARD
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <p className="text-xs tracking-[3px] uppercase text-amber mb-1">Vedic Astrology</p>
            <h1 className="font-serif text-4xl text-starlight">Your Birth Chart</h1>
          </div>

          {hasProfile === false ? (
            <Link href="/profile/create" className="inline-flex px-5 py-3 bg-saffron text-white text-sm tracking-wide hover:bg-saffron/80 transition-colors">
              Create Profile First
            </Link>
          ) : confirmRegen ? (
            <div className="flex items-center gap-3 bg-raised border border-amber/40 px-4 py-3">
              <p className="text-amber text-sm">Generate another chart?</p>
              <button onClick={handleGenerate} disabled={generating} className="text-xs px-3 py-1.5 bg-saffron text-white hover:bg-saffron/80 transition-colors disabled:opacity-50">
                {generating ? 'Generating...' : 'Yes'}
              </button>
              <button onClick={() => setConfirmRegen(false)} className="text-xs px-3 py-1.5 border border-gold/30 text-cosmic hover:border-gold/60 transition-colors">
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={handleGenerate} disabled={generating}
                className="inline-flex items-center gap-2 px-5 py-3 bg-crimson border border-gold/30 text-starlight text-sm tracking-wide hover:bg-crimson/80 transition-colors disabled:opacity-50">
                {generating ? 'Generating...' : 'Generate New Chart'}
              </button>
              <button onClick={() => setShowFriendModal(true)}
                className="inline-flex items-center gap-2 px-5 py-3 border border-gold/40 text-amber text-sm tracking-wide hover:border-gold hover:bg-gold/10 transition-colors">
                👥 Generate for Friend
              </button>
            </div>
          )}
        </div>

        {/* Friend modal */}
        {showFriendModal && (
          <FriendModal
            onClose={() => setShowFriendModal(false)}
            onSuccess={async () => { setShowFriendModal(false); await load() }}
          />
        )}

        {error && <p className="text-red-400 text-sm border border-red-400/30 bg-red-400/10 px-4 py-3 mb-6">{error}</p>}

        {loading ? (
          <p className="text-cosmic">Loading...</p>
        ) : hasProfile === false ? (
          <div className="bg-surface border border-gold/20 p-8 text-center">
            <p className="text-amber font-serif text-xl mb-4">Profile Required</p>
            <Link href="/profile/create" className="inline-flex px-6 py-3 bg-saffron text-white text-sm hover:bg-saffron/80 transition-colors">
              Create Profile →
            </Link>
          </div>
        ) : charts.length === 0 ? (
          <div className="bg-surface border border-gold/20 p-8 text-center">
            <p className="text-amber font-serif text-xl mb-2">No Charts Yet</p>
            <p className="text-cosmic text-sm">Click &ldquo;Generate New Chart&rdquo; to create your Kundali.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Saved charts selector */}
            {charts.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {charts.map(c => (
                  <div key={c._id} className={`flex items-center border transition-colors ${selected?._id === c._id ? 'border-gold/60 bg-raised' : 'border-gold/20 bg-surface hover:border-gold/40'}`}>
                    <button onClick={() => setSelected(c)} className="px-4 py-2 text-left">
                      <p className={`text-xs font-medium ${selected?._id === c._id ? 'text-starlight' : 'text-cosmic'}`}>{c.chartName}</p>
                      <p className="text-xs opacity-50">{new Date(c.generatedAt).toLocaleDateString('en-IN')}</p>
                    </button>
                    <button onClick={() => handleDelete(c._id)} disabled={deletingId === c._id}
                      className="px-2 py-2 text-cosmic hover:text-red-400 transition-colors disabled:opacity-30 text-xs">
                      {deletingId === c._id ? '...' : '✕'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Single chart display */}
            {selected && <ChartDisplay data={selected.chartData} onDelete={() => handleDelete(selected._id)} />}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Friend Modal ───────────────────────────────────────────────────────────

function FriendModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: '', gender: 'male', dateOfBirth: '', timeOfBirth: '', city: '', state: '', country: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.chart.generateForFriend(form)
      if (!res.success) { setError(res.message ?? 'Failed to generate chart'); return }
      onSuccess()
    } catch { setError('Could not connect to server') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(7,4,16,0.85)' }}>
      <div className="bg-surface border border-gold/30 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gold/20">
          <div>
            <p className="text-xs tracking-[3px] uppercase text-amber">मित्र की कुंडली</p>
            <h2 className="font-serif text-xl text-starlight mt-0.5">Generate for Friend</h2>
          </div>
          <button onClick={onClose} className="text-cosmic hover:text-gold text-xl transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-1">
            <label className="text-cosmic text-xs tracking-wide">Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} required placeholder="Friend's name"
              className="bg-raised border border-gold/20 text-starlight px-4 py-3 text-sm focus:outline-none focus:border-gold/60 placeholder:text-cosmic/50" />
          </div>

          {/* Gender */}
          <div className="flex flex-col gap-1">
            <label className="text-cosmic text-xs tracking-wide">Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange}
              className="bg-raised border border-gold/20 text-starlight px-4 py-3 text-sm focus:outline-none focus:border-gold/60">
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* DOB + Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-cosmic text-xs tracking-wide">Date of Birth</label>
              <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} required
                className="bg-raised border border-gold/20 text-starlight px-4 py-3 text-sm focus:outline-none focus:border-gold/60" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-cosmic text-xs tracking-wide">Time of Birth (24h)</label>
              <input name="timeOfBirth" type="time" value={form.timeOfBirth} onChange={handleChange} required
                className="bg-raised border border-gold/20 text-starlight px-4 py-3 text-sm focus:outline-none focus:border-gold/60" />
            </div>
          </div>

          {/* City */}
          <div className="flex flex-col gap-1">
            <label className="text-cosmic text-xs tracking-wide">City of Birth</label>
            <input name="city" value={form.city} onChange={handleChange} required placeholder="e.g. Mumbai"
              className="bg-raised border border-gold/20 text-starlight px-4 py-3 text-sm focus:outline-none focus:border-gold/60 placeholder:text-cosmic/50" />
          </div>

          {/* State + Country */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-cosmic text-xs tracking-wide">State (optional)</label>
              <input name="state" value={form.state} onChange={handleChange} placeholder="e.g. Maharashtra"
                className="bg-raised border border-gold/20 text-starlight px-4 py-3 text-sm focus:outline-none focus:border-gold/60 placeholder:text-cosmic/50" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-cosmic text-xs tracking-wide">Country</label>
              <input name="country" value={form.country} onChange={handleChange} required placeholder="e.g. India"
                className="bg-raised border border-gold/20 text-starlight px-4 py-3 text-sm focus:outline-none focus:border-gold/60 placeholder:text-cosmic/50" />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm border border-red-400/30 bg-red-400/10 px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading}
              className="flex-1 bg-saffron text-white py-3 text-sm tracking-widest hover:bg-saffron/80 transition-colors disabled:opacity-50">
              {loading ? 'Generating Kundali...' : '🪐 GENERATE KUNDALI'}
            </button>
            <button type="button" onClick={onClose}
              className="px-5 py-3 border border-gold/30 text-cosmic text-sm hover:border-gold/60 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Chart sections ─────────────────────────────────────────────────────────

function ChartDisplay({ data, onDelete }: { data: ChartData; onDelete?: () => void }) {
  const { ascendant, planets, houses, vimshottari_dasha, sade_sati, ayanamsha, house_system } = data
  const nakshatraObj = ascendant?.nakshatra && typeof ascendant.nakshatra === 'object' ? ascendant.nakshatra as Nakshatra : null
  const current = currentDasha(vimshottari_dasha)

  return (
    <div className="flex flex-col gap-6">

      {/* ── 1. Kundali Grid ── */}
      {planets && planets.length > 0 && ascendant?.sign && houses && houses.length > 0 && (
        <Section title="Kundali (Birth Chart)">
          <div className="flex justify-center">
            <KundaliGrid
              planets={planets as { name: string; sign?: string; house: number; degree_in_sign?: number; is_retrograde?: boolean }[]}
              houses={houses as { house: number; sign: string }[]}
              ascendantSign={ascendant.sign}
              className="w-full max-w-[480px]"
            />
          </div>
        </Section>
      )}

      {/* ── 2. Lagna (Ascendant) ── */}
      {ascendant && (
        <Section title="Lagna (Ascendant)">
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            <LagnaItem label="Rashi" value={ascendant.sign ?? '—'} highlight />
            <LagnaItem label="Degree" value={formatDeg(ascendant.degree)} />
            <LagnaItem label="Nakshatra" value={nakshatraLabel(ascendant.nakshatra)} />
            {nakshatraObj?.lord && <LagnaItem label="Nakshatra Lord" value={nakshatraObj.lord} />}
            {ayanamsha && <LagnaItem label="Ayanamsa" value={ayanamsha.charAt(0).toUpperCase() + ayanamsha.slice(1)} />}
            {house_system && <LagnaItem label="House System" value={house_system.replace('_', ' ')} />}
          </div>
        </Section>
      )}

      {/* ── 3. Graha Sthiti (Planetary Positions) ── */}
      {planets && planets.length > 0 && (
        <Section title="Graha Sthiti (Planetary Positions)">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold/20 text-cosmic text-xs text-left">
                  {['Graha', 'Rashi (Sign)', 'Bhava (House)', 'Degree', 'Nakshatra', 'Pada'].map(h => (
                    <th key={h} className="pb-2 pr-5 font-normal tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {planets.map((p, i) => (
                  <tr key={i} className="border-b border-gold/10 hover:bg-raised/40 transition-colors">
                    <td className="py-2.5 pr-5">
                      <span className="text-amber font-semibold">{p.name}</span>
                      {p.is_retrograde && <span className="ml-1 text-cosmic text-xs">℞</span>}
                    </td>
                    <td className="py-2.5 pr-5 text-starlight/80">{p.sign ?? '—'}</td>
                    <td className="py-2.5 pr-5 text-starlight/80">{p.house ?? '—'}</td>
                    <td className="py-2.5 pr-5 text-starlight/80">{formatDeg(p.degree_in_sign)}</td>
                    <td className="py-2.5 pr-5 text-starlight/80">{typeof p.nakshatra === 'string' ? p.nakshatra : (p.nakshatra as Nakshatra)?.name ?? '—'}</td>
                    <td className="py-2.5 text-starlight/80">{p.pada ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* ── 4. Bhava Chakra (Houses) ── */}
      {houses && houses.length > 0 && (
        <Section title="Bhava Chakra (Houses)">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {houses.map(h => (
              <div key={h.house} className="bg-raised border border-gold/20 px-3 py-2.5 text-center hover:border-gold/40 transition-colors">
                <p className="text-amber text-xs font-semibold tracking-wide">H{h.house}</p>
                <p className="text-starlight text-sm mt-0.5">{h.sign}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── 5. Vimshottari Dasha ── */}
      {vimshottari_dasha && vimshottari_dasha.length > 0 && (
        <Section title="Vimshottari Dasha">
          {current && (
            <div className="mb-4 bg-gold/10 border border-gold/30 px-5 py-4 flex flex-col gap-1">
              <p className="text-amber text-xs tracking-[2px] uppercase">Current Mahadasha</p>
              <p className="text-starlight font-serif text-lg font-semibold">{current.lord} Dasha</p>
              <p className="text-cosmic text-sm">
                {current.start} – {current.end} ({current.duration_years} years)
              </p>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold/20 text-cosmic text-xs text-left">
                  {['Dasha Lord', 'Start', 'End', 'Duration'].map(h => (
                    <th key={h} className="pb-2 pr-6 font-normal tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vimshottari_dasha.map((d, i) => {
                  const isCurrent = current?.lord === d.lord && current?.start === d.start
                  return (
                    <tr key={i} className={`border-b border-gold/10 transition-colors ${isCurrent ? 'bg-gold/5' : 'hover:bg-raised/30'}`}>
                      <td className="py-2.5 pr-6">
                        <span className={`font-semibold ${isCurrent ? 'text-amber' : 'text-starlight/80'}`}>
                          {d.lord}{isCurrent && ' ←'}
                        </span>
                      </td>
                      <td className="py-2.5 pr-6 text-starlight/70 font-mono text-xs">{d.start}</td>
                      <td className="py-2.5 pr-6 text-starlight/70 font-mono text-xs">{d.end}</td>
                      <td className="py-2.5 text-starlight/70">{d.duration_years} yrs</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* ── 6. Sade Sati ── */}
      {sade_sati && (
        <Section title="Sade Sati (Shani Transit)">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {sade_sati.active ? (
                <span className="inline-flex px-3 py-1 text-xs font-semibold bg-amber/20 border border-amber/50 text-amber tracking-wide">
                  Active → {sade_sati.phase ?? 'Active'}
                </span>
              ) : (
                <span className="inline-flex px-3 py-1 text-xs font-semibold bg-green-900/30 border border-green-500/40 text-green-400 tracking-wide">
                  Not Active
                </span>
              )}
            </div>
            {sade_sati.description && (
              <p className="text-starlight/70 text-sm">{sade_sati.description}</p>
            )}
          </div>
        </Section>
      )}
    </div>
  )
}

// ── Shared sub-components ──────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-gold/20 p-6">
      <h2 className="font-serif text-lg text-starlight mb-4">{title}</h2>
      {children}
    </div>
  )
}

function LagnaItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-cosmic text-xs tracking-wide mb-0.5">{label}</p>
      <p className={`text-sm font-medium ${highlight ? 'text-amber' : 'text-starlight'}`}>{value}</p>
    </div>
  )
}

// ── Entry point ────────────────────────────────────────────────────────────

export default function BirthChartPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-void flex items-center justify-center text-cosmic">Loading...</div>}>
      <BirthChartContent />
    </Suspense>
  )
}
