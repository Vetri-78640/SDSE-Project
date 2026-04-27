const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5001'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('dv_token')
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string }> {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
    ...options,
  })
  return res.json()
}

export const api = {
  auth: {
    signup: (body: { name: string; email: string; password: string }) =>
      request<{ token: string; user: { _id: string; name: string; email: string } }>(
        '/api/auth/signup',
        { method: 'POST', body: JSON.stringify(body) }
      ),
    signin: (body: { email: string; password: string }) =>
      request<{ token: string; user: { _id: string; name: string; email: string } }>(
        '/api/auth/signin',
        { method: 'POST', body: JSON.stringify(body) }
      ),
  },
  profile: {
    get: () =>
      request<{ _id: string; personalInfo: { name: string; gender: string; dateOfBirth: string; timeOfBirth: string; placeOfBirth: { city: string; country: string } } }>(
        '/api/profile'
      ),
    create: (body: {
      name: string; gender: string; dateOfBirth: string; timeOfBirth: string
      city: string; state?: string; country: string; timezone?: string
    }) => request('/api/profile/create', { method: 'POST', body: JSON.stringify(body) }),
    update: (body: Partial<{
      name: string; gender: string; dateOfBirth: string; timeOfBirth: string
      city: string; state: string; country: string; timezone: string
    }>) => request('/api/profile', { method: 'PATCH', body: JSON.stringify(body) }),
  },
  chart: {
    generate: (chartName?: string) =>
      request('/api/birth-chart/generate', {
        method: 'POST',
        body: JSON.stringify({ chartName: chartName ?? 'My Birth Chart' }),
      }),
    list: () =>
      request<{ count: number; data: Array<{ _id: string; chartName: string; generatedAt: string; chartData: Record<string, unknown> }> }>(
        '/api/birth-chart/user'
      ),
    delete: (chartId: string) =>
      request(`/api/birth-chart/${chartId}`, { method: 'DELETE' }),
    generateForFriend: (body: {
      name: string; gender: string; dateOfBirth: string; timeOfBirth: string
      city: string; state?: string; country: string
    }) => request('/api/birth-chart/generate-for', { method: 'POST', body: JSON.stringify(body) }),
  },
}

export function saveSession(token: string, user: { _id: string; name: string; email: string }) {
  localStorage.setItem('dv_token', token)
  localStorage.setItem('dv_user', JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem('dv_token')
  localStorage.removeItem('dv_user')
}

export function getUser(): { _id: string; name: string; email: string } | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem('dv_user')
  return raw ? JSON.parse(raw) : null
}
