'use client'

import { useEffect, useState } from 'react'
import { Clock, CheckCircle, XCircle, AlertCircle, Play } from 'lucide-react'

interface CronJob {
  id: string
  name: string
  enabled: boolean
  schedule: {
    kind: string
    everyMs?: number
    expr?: string
  }
  state: {
    nextRunAtMs?: number
    lastRunAtMs?: number
    lastRunStatus?: string
    consecutiveErrors?: number
  }
}

export default function CronJobs() {
  const [jobs, setJobs] = useState<CronJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/openclaw/cron')
        const data = await res.json()
        setJobs(data.jobs || [])
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch cron jobs:', error)
        setLoading(false)
      }
    }

    fetchJobs()
    const interval = setInterval(fetchJobs, 10000) // Update every 10s

    return () => clearInterval(interval)
  }, [])

  const formatNextRun = (ms?: number) => {
    if (!ms) return 'Not scheduled'
    const date = new Date(ms)
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    
    if (diff < 0) return 'Overdue'
    if (diff < 60000) return `${Math.floor(diff / 1000)}s`
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`
    return `${Math.floor(diff / 86400000)}d`
  }

  const formatSchedule = (schedule: CronJob['schedule']) => {
    if (schedule.kind === 'every' && schedule.everyMs) {
      const minutes = schedule.everyMs / 60000
      if (minutes < 60) return `Every ${minutes}m`
      const hours = minutes / 60
      return `Every ${hours}h`
    }
    if (schedule.kind === 'cron') return schedule.expr || 'Cron'
    return schedule.kind
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'ok': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#ff8aa7]" />
          <h2 className="text-xl font-black text-white">Cron Jobs</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-[#ff8aa7]">
            {jobs.filter(j => j.enabled).length}
          </span>
          <span className="text-sm text-[#adaaaa]">active</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#20201f] rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-white/10 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-8 text-[#adaaaa]">
          No cron jobs configured
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {jobs.map((job) => (
            <div 
              key={job.id}
              className={`bg-[#20201f] border rounded-lg p-4 transition-colors ${
                job.enabled 
                  ? 'border-white/5 hover:border-[#ff8aa7]' 
                  : 'border-white/5 opacity-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(job.state.lastRunStatus)}
                    <span className="text-sm font-bold text-white">
                      {job.name || job.id.slice(0, 8)}
                    </span>
                  </div>
                  <div className="text-xs text-[#adaaaa]">
                    {formatSchedule(job.schedule)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-[#ff8aa7]">
                    {formatNextRun(job.state.nextRunAtMs)}
                  </div>
                  {job.state.consecutiveErrors ? (
                    <div className="text-xs text-red-500 mt-1">
                      {job.state.consecutiveErrors} errors
                    </div>
                  ) : null}
                </div>
              </div>
              
              {!job.enabled && (
                <div className="text-xs text-yellow-500 mt-2">
                  ⚠️ Disabled
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
