'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { api, getUser } from '@/lib/api'

export default function EditProfilePage() {
  const router = useRouter()
  const user = getUser()

  const [form, setForm] = useState({
    name: '', gender: 'male', dateOfBirth: '', timeOfBirth: '',
    city: '', state: '', country: '', timezone: '+5.5',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!user) { router.push('/auth/signin'); return }
    api.profile.get().then(res => {
      if (res.success && res.data) {
        const p = res.data as any
        const dob = p.personalInfo?.dateOfBirth
          ? new Date(p.personalInfo.dateOfBirth).toISOString().split('T')[0]
          : ''
        setForm({
          name: p.personalInfo?.name ?? '',
          gender: p.personalInfo?.gender ?? 'male',
          dateOfBirth: dob,
          timeOfBirth: p.personalInfo?.timeOfBirth ?? '',
          city: p.personalInfo?.placeOfBirth?.city ?? '',
          state: p.personalInfo?.placeOfBirth?.state ?? '',
          country: p.personalInfo?.placeOfBirth?.country ?? '',
          timezone: p.timezone ?? '+5.5',
        })
      }
      setLoading(false)
    })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess(false); setSaving(true)
    try {
      const res = await api.profile.update(form)
      if (!res.success) { setError(res.message ?? 'Update failed'); return }
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 1200)
    } catch { setError('Could not connect to server') }
    finally { setSaving(false) }
  }

  if (!user || loading) return (
    <div className="min-h-screen bg-void flex items-center justify-center text-cosmic">Loading...</div>
  )

  return (
    <div className="min-h-screen bg-void text-starlight">
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-surface border-b border-gold/20">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-amber">★</span>
          <span className="text-amber font-serif">Deepa&apos;s Vision</span>
        </Link>
        <Link href="/dashboard" className="text-xs tracking-widest text-cosmic hover:text-gold transition-colors">
          ← DASHBOARD
        </Link>
      </nav>

      <div className="max-w-xl mx-auto px-8 py-12">
        <p className="text-xs tracking-[3px] uppercase text-amber mb-1">जन्म विवरण</p>
        <h1 className="font-serif text-3xl text-amber mb-2">Update Profile</h1>
        <p className="text-cosmic text-sm mb-8">Edit your birth details. Changes will affect future chart generations.</p>

        <form onSubmit={handleSubmit} className="bg-surface border border-gold/20 p-8 flex flex-col gap-5">
          <Field label="Full Name">
            <input name="name" value={form.name} onChange={handleChange} required
              className="input" placeholder="As per birth records" />
          </Field>

          <Field label="Gender">
            <select name="gender" value={form.gender} onChange={handleChange} className="input">
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Date of Birth">
              <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} required className="input" />
            </Field>
            <Field label="Time of Birth (24h)">
              <input name="timeOfBirth" type="time" value={form.timeOfBirth} onChange={handleChange} required className="input" />
            </Field>
          </div>

          <Field label="City of Birth">
            <input name="city" value={form.city} onChange={handleChange} required placeholder="e.g. Mumbai" className="input" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="State (optional)">
              <input name="state" value={form.state} onChange={handleChange} placeholder="e.g. Maharashtra" className="input" />
            </Field>
            <Field label="Country">
              <input name="country" value={form.country} onChange={handleChange} required placeholder="e.g. India" className="input" />
            </Field>
          </div>

          {error && (
            <p className="text-red-400 text-sm border border-red-400/30 bg-red-400/10 px-3 py-2">{error}</p>
          )}
          {success && (
            <p className="text-green-400 text-sm border border-green-400/30 bg-green-400/10 px-3 py-2">
              Profile updated. Redirecting...
            </p>
          )}

          <button type="submit" disabled={saving}
            className="mt-2 bg-saffron text-white py-3 text-sm tracking-widest hover:bg-saffron/80 transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'SAVE CHANGES'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .input {
          background: #241A38;
          border: 1px solid rgba(200,146,10,0.2);
          color: #EDE8F5;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          outline: none;
          width: 100%;
        }
        .input:focus { border-color: rgba(200,146,10,0.6); }
      `}</style>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-cosmic text-xs tracking-wide">{label}</label>
      {children}
    </div>
  )
}
