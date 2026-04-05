'use client'

import { useEffect, useState } from 'react'
import { Users, Activity, Clock } from 'lucide-react'

interface Session {
  sessionKey: string
  kind: string
  lastMessageAt?: string
  messageCount?: number
}

export default function AgentMonitor() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch('/api/openclaw/sessions')
        const data = await res.json()
        setSessions(data.sessions || [])
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch sessions:', error)
        setLoading(false)
      }
    }

    fetchSessions()
    const interval = setInterval(fetchSessions, 10000) // Update every 10s

    return () => clearInterval(interval)
  }, [])

  const getSessionStatus = (session: Session) => {
    if (!session.lastMessageAt) return 'idle'
    const lastActive = new Date(session.lastMessageAt).getTime()
    const now = Date.now()
    const diff = now - lastActive
    
    if (diff < 60000) return 'active' // < 1 min
    if (diff < 300000) return 'recent' // < 5 min
    return 'idle'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'recent': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return 'Never'
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#ff8aa7]" />
          <h2 className="text-xl font-black text-white">Active Sessions</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-[#ff8aa7]">{sessions.length}</span>
          <span className="text-sm text-[#adaaaa]">sessions</span>
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
      ) : sessions.length === 0 ? (
        <div className="text-center py-8 text-[#adaaaa]">
          No active sessions
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {sessions.map((session) => {
            const status = getSessionStatus(session)
            return (
              <div 
                key={session.sessionKey}
                className="bg-[#20201f] border border-white/5 rounded-lg p-4 hover:border-[#ff8aa7] transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`} />
                    <span className="text-sm font-bold text-white truncate max-w-[300px]">
                      {session.sessionKey}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-1 bg-[#ff8aa7]/10 text-[#ff8aa7] rounded-sm">
                    {session.kind}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-[#adaaaa]">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(session.lastMessageAt)}
                  </div>
                  {session.messageCount !== undefined && (
                    <div className="flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      {session.messageCount} messages
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
