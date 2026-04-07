import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { TrajectoryMap } from './components/TrajectoryMap'
import './App.css'

type LoginResponse = {
  success: true
  token?: string
  accessToken?: string
}

type AdminUser = {
  id: string
  email: string
  totalLocations: number
  lastLocation: {
    latitude: number
    longitude: number
    createdAt: string
  } | null
}

type LocationPoint = {
  id: string
  latitude: number
  longitude: number
  createdAt: string
}

const TOKEN_KEY = 'admin_token'
const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim()
const API_BASE_URL =
  configuredApiBaseUrl && configuredApiBaseUrl.length > 0
    ? configuredApiBaseUrl.replace(/\/+$/, '')
    : `${window.location.protocol}//${window.location.hostname}:3000`

async function apiRequest<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'x-admin-token': token } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new Error(`Cannot reach backend at ${API_BASE_URL}. Check if Nest server is running.`)
  }

  if (!response.ok) {
    const fallback = `Request failed (${response.status})`
    const message = await response.text().catch(() => fallback)
    throw new Error(message || fallback)
  }

  return (await response.json()) as T
}

async function postAdminLogin(email: string, password: string): Promise<string> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
  } catch {
    throw new Error(`Cannot reach backend at ${API_BASE_URL}. Check if Nest server is running.`)
  }

  if (!response.ok) {
    const message = await response.text().catch(() => `Request failed (${response.status})`)
    throw new Error(message || `Request failed (${response.status})`)
  }

  const data = (await response.json()) as LoginResponse
  const fromBody = data.token?.trim() || data.accessToken?.trim()
  const fromHeader = response.headers.get('x-admin-token')?.trim()
  const token = fromBody || fromHeader
  if (!token) {
    throw new Error(
      'Login retornou sucesso, mas sem token no corpo nem no header. Reconstrua o backend (docker compose up --build) ou confira VITE_API_BASE_URL.',
    )
  }
  return token
}

function App() {
  const initialToken = localStorage.getItem(TOKEN_KEY)
  const sanitizedInitialToken =
    initialToken && initialToken !== 'undefined' && initialToken !== 'null' ? initialToken : null

  if (!sanitizedInitialToken && initialToken) {
    localStorage.removeItem(TOKEN_KEY)
  }

  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('admin123')
  const [token, setToken] = useState<string | null>(sanitizedInitialToken)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [history, setHistory] = useState<LocationPoint[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [loginError, setLoginError] = useState<string | null>(null)

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId, users],
  )

  useEffect(() => {
    if (!token) {
      setUsers([])
      setSelectedUserId(null)
      setHistory([])
      return
    }

    const fetchUsers = async () => {
      setIsLoadingUsers(true)
      setErrorMessage(null)
      try {
        const data = await apiRequest<AdminUser[]>('/admin/users', {}, token)
        setUsers(data)
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Could not load users')
      } finally {
        setIsLoadingUsers(false)
      }
    }

    void fetchUsers()
  }, [token])

  useEffect(() => {
    if (!token || !selectedUserId) {
      setHistory([])
      return
    }

    const fetchHistory = async () => {
      setIsLoadingHistory(true)
      setErrorMessage(null)
      try {
        const data = await apiRequest<LocationPoint[]>(`/admin/users/${selectedUserId}/trajectory`, {}, token)
        setHistory(data)
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Could not load user history')
      } finally {
        setIsLoadingHistory(false)
      }
    }

    void fetchHistory()
  }, [selectedUserId, token])

  const onLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoginError(null)

    try {
      const authToken = await postAdminLogin(email, password)
      localStorage.setItem(TOKEN_KEY, authToken)
      setToken(authToken)
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login failed')
    }
  }

  const onLogout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setLoginError(null)
    setErrorMessage(null)
  }

  return (
    <div className="layout">
      <aside className="sidebar card">
        <h1>Admin Dashboard</h1>
        <p className="muted">Authenticate and inspect client position history.</p>

        {!token && (
          <form className="login-form" onSubmit={onLogin}>
            <label>
              Email
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label>
              Password
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </label>
            <button type="submit">Sign in</button>
            {loginError && <p className="error">{loginError}</p>}
          </form>
        )}

        {token && (
          <>
            <button className="logout-button" type="button" onClick={onLogout}>
              Log out
            </button>
            <h2>Users</h2>
            {isLoadingUsers ? (
              <p className="muted">Loading users...</p>
            ) : users.length === 0 ? (
              <p className="muted">Nenhum usuario encontrado.</p>
            ) : (
              <ul className="users-list">
                {users.map((user) => (
                  <li key={user.id}>
                    <button
                      type="button"
                      className={selectedUserId === user.id ? 'selected' : ''}
                      onClick={() => setSelectedUserId(user.id)}
                    >
                      <span>{user.email}</span>
                      <small>{user.totalLocations} locations</small>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </aside>

      <main className="content card">
        <h2>Position history</h2>
        {!selectedUser && <p className="muted">Select a user to view trajectory points.</p>}
        {selectedUser && (
          <>
            <p className="muted">
              User: <strong>{selectedUser.email}</strong>
            </p>
            {isLoadingHistory ? (
              <p className="muted">Loading history...</p>
            ) : (
              <>
                <h3 className="section-title">Mapa</h3>
                <TrajectoryMap points={history} />
                <h3 className="section-title">Pontos</h3>
                <div className="history-table-wrapper">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Latitude</th>
                      <th>Longitude</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr key={item.id}>
                        <td>{new Date(item.createdAt).toLocaleString()}</td>
                        <td>{item.latitude}</td>
                        <td>{item.longitude}</td>
                      </tr>
                    ))}
                    {!history.length && (
                      <tr>
                        <td colSpan={3}>No locations found for this user.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              </>
            )}
          </>
        )}
        {errorMessage && <p className="error">{errorMessage}</p>}
      </main>
    </div>
  )
}

export default App
