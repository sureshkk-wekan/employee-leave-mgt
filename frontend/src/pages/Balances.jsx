import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Balances() {
  const { api, user } = useAuth()
  const [balances, setBalances] = useState([])
  const [leaveTypes, setLeaveTypes] = useState({})
  const [userOptions, setUserOptions] = useState([]) // reportees for manager, all users for admin
  const [selectedUserId, setSelectedUserId] = useState(null) // null = "Me"
  const [year, setYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const canViewOthers = user?.role === 'manager' || user?.role === 'admin'

  useEffect(() => {
    if (!canViewOthers) return
    if (user?.role === 'admin') {
      api('/users')
        .then((list) => list.map((u) => ({ id: u.id, full_name: u.full_name, email: u.email })))
        .then(setUserOptions)
        .catch(() => setUserOptions([]))
    } else {
      api('/leave-balances/reportees')
        .then(setUserOptions)
        .catch(() => setUserOptions([]))
    }
  }, [api, canViewOthers, user?.role])

  const loadBalances = () => {
    setLoading(true)
    setError('')
    const params = new URLSearchParams()
    if (selectedUserId != null) params.set('user_id', selectedUserId)
    if (year != null) params.set('year', year)
    api(`/leave-balances?${params.toString()}`)
      .then(setBalances)
      .catch((err) => {
        setError(err.message || 'Failed to load balances')
        setBalances([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    api('/leave-types')
      .then((list) => Object.fromEntries(list.map((t) => [t.id, t.name])))
      .then(setLeaveTypes)
      .catch(() => setLeaveTypes({}))
  }, [api])

  useEffect(() => {
    loadBalances()
  }, [selectedUserId, year, api])

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">Leave Balances</h1>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        {canViewOthers && userOptions.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">View balances for</label>
            <select
              value={selectedUserId ?? ''}
              onChange={(e) => setSelectedUserId(e.target.value === '' ? null : Number(e.target.value))}
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Me</option>
              {userOptions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.full_name} ({r.email})
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Year</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:ring-2 focus:ring-amber-500"
          >
            {[year - 2, year - 1, year, year + 1].filter((y) => y >= 2020).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Leave type</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Entitlement</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Used</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Remaining</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {balances.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    No balances for this year.
                  </td>
                </tr>
              ) : (
                balances.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-800">{leaveTypes[b.leave_type_id] ?? b.leave_type_id}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{b.entitlement_days}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{b.used_days}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-800">{b.remaining_days}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
