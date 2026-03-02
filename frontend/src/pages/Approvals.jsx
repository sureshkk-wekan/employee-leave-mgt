import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Approvals() {
  const { api } = useAuth()
  const [requests, setRequests] = useState([])
  const [leaveTypes, setLeaveTypes] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rejectingId, setRejectingId] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    Promise.all([
      api('/leave-requests?my_only=false&status=pending'),
      api('/leave-types').then((list) => Object.fromEntries(list.map((t) => [t.id, t.name]))),
    ])
      .then(([reqs, types]) => {
        setRequests(reqs)
        setLeaveTypes(types)
      })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [api])

  const approve = async (requestId) => {
    try {
      await api(`/leave-requests/${requestId}/approve`, {
        method: 'POST',
        body: JSON.stringify({ approved: true }),
      })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const reject = async (requestId, reason = null) => {
    try {
      await api(`/leave-requests/${requestId}/approve`, {
        method: 'POST',
        body: JSON.stringify({ approved: false, rejection_reason: reason || undefined }),
      })
      setRejectingId(null)
      setRejectionReason('')
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const startReject = (id) => {
    setRejectingId(id)
    setRejectionReason('')
  }

  if (loading) return <p className="text-slate-500">Loading...</p>
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">Pending Approvals</h1>
      <div className="space-y-4">
        {requests.length === 0 ? (
          <p className="text-slate-500">No pending requests.</p>
        ) : (
          requests.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800">Request #{r.id}</p>
                <p className="text-sm text-slate-600">
                  {leaveTypes[r.leave_type_id] ?? r.leave_type_id} • {r.start_date} – {r.end_date}
                </p>
                {r.reason && <p className="text-sm text-slate-500 mt-1">{r.reason}</p>}
              </div>
              <div className="flex gap-2 items-start">
                {rejectingId === r.id ? (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Rejection reason (optional)"
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => reject(r.id, rejectionReason)}
                        className="rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700"
                      >
                        Confirm Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => { setRejectingId(null); setRejectionReason(''); }}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => approve(r.id)}
                      className="rounded-lg bg-green-600 text-white px-4 py-2 text-sm font-medium hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => startReject(r.id)}
                      className="rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
