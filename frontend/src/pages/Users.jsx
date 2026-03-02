import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const ROLES = ['employee', 'manager', 'admin']

export default function Users() {
  const { api, user } = useAuth()
  const [users, setUsers] = useState([])
  const [managers, setManagers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'employee', manager_id: '' })
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    setLoading(true)
    setError('')
    api('/users')
      .then((list) => {
        setUsers(list)
        setManagers(list.filter((u) => u.role === 'manager' || u.role === 'admin'))
      })
      .catch((err) => {
        setError(err.message || 'Failed to load users')
        setUsers([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [api])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api('/users', {
        method: 'POST',
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          full_name: form.full_name,
          role: form.role,
          manager_id: form.manager_id ? Number(form.manager_id) : null,
        }),
      })
      setShowForm(false)
      setForm({ email: '', password: '', full_name: '', role: 'employee', manager_id: '' })
      load()
    } catch (err) {
      setError(err.message || 'Failed to create user')
    } finally {
      setSubmitting(false)
    }
  }

  if (user?.role !== 'admin') {
    return (
      <div>
        <p className="text-red-600">You do not have permission to view this page.</p>
      </div>
    )
  }

  if (loading) return <p className="text-slate-500">Loading...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Users</h1>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-amber-600 text-white font-medium py-2 px-4 hover:bg-amber-700"
        >
          {showForm ? 'Cancel' : 'Add user'}
        </button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {showForm && (
        <form onSubmit={handleCreate} className="mb-8 p-6 rounded-xl border border-slate-200 bg-slate-50 max-w-md space-y-4">
          <h2 className="font-medium text-slate-800">New user</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Manager (optional)</label>
            <select
              value={form.manager_id}
              onChange={(e) => setForm((f) => ({ ...f, manager_id: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="">None</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>{m.full_name} ({m.email})</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={submitting} className="rounded-lg bg-amber-600 text-white py-2 px-4 font-medium hover:bg-amber-700 disabled:opacity-50">
            {submitting ? 'Creating...' : 'Create user'}
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No users.</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-800">{u.full_name}</td>
                  <td className="px-4 py-3 text-slate-700">{u.email}</td>
                  <td className="px-4 py-3 text-slate-700">{u.role}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
