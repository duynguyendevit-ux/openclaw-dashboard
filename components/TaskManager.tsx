'use client'

import { useEffect, useState } from 'react'
import { ListTodo, CheckCircle, XCircle, Clock, Loader } from 'lucide-react'

interface Task {
  id: string
  name: string
  status: 'running' | 'completed' | 'failed' | 'pending'
  startedAt?: string
  completedAt?: string
  duration?: number
  error?: string
}

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'running' | 'completed' | 'failed'>('all')

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/openclaw/tasks')
        const data = await res.json()
        setTasks(data.tasks || [])
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch tasks:', error)
        setLoading(false)
      }
    }

    fetchTasks()
    const interval = setInterval(fetchTasks, 5000) // Update every 5s

    return () => clearInterval(interval)
  }, [])

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true
    return task.status === filter
  })

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'running': return <Loader className="w-4 h-4 text-blue-500 animate-spin" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'running': return 'text-blue-500 bg-blue-500/10'
      case 'completed': return 'text-green-500 bg-green-500/10'
      case 'failed': return 'text-red-500 bg-red-500/10'
      case 'pending': return 'text-yellow-500 bg-yellow-500/10'
    }
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A'
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return 'N/A'
    return new Date(timestamp).toLocaleTimeString()
  }

  const stats = {
    running: tasks.filter(t => t.status === 'running').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    failed: tasks.filter(t => t.status === 'failed').length,
    pending: tasks.filter(t => t.status === 'pending').length,
  }

  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-[#ff8aa7]" />
          <h2 className="text-xl font-black text-white">Tasks</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-[#ff8aa7]">{tasks.length}</span>
          <span className="text-sm text-[#adaaaa]">total</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`p-3 rounded-lg border transition-colors ${
            filter === 'all' 
              ? 'border-[#ff8aa7] bg-[#ff8aa7]/10' 
              : 'border-white/10 hover:border-white/20'
          }`}
        >
          <div className="text-2xl font-black text-white">{tasks.length}</div>
          <div className="text-xs text-[#adaaaa]">All</div>
        </button>
        <button
          onClick={() => setFilter('running')}
          className={`p-3 rounded-lg border transition-colors ${
            filter === 'running' 
              ? 'border-blue-500 bg-blue-500/10' 
              : 'border-white/10 hover:border-white/20'
          }`}
        >
          <div className="text-2xl font-black text-blue-500">{stats.running}</div>
          <div className="text-xs text-[#adaaaa]">Running</div>
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`p-3 rounded-lg border transition-colors ${
            filter === 'completed' 
              ? 'border-green-500 bg-green-500/10' 
              : 'border-white/10 hover:border-white/20'
          }`}
        >
          <div className="text-2xl font-black text-green-500">{stats.completed}</div>
          <div className="text-xs text-[#adaaaa]">Completed</div>
        </button>
        <button
          onClick={() => setFilter('failed')}
          className={`p-3 rounded-lg border transition-colors ${
            filter === 'failed' 
              ? 'border-red-500 bg-red-500/10' 
              : 'border-white/10 hover:border-white/20'
          }`}
        >
          <div className="text-2xl font-black text-red-500">{stats.failed}</div>
          <div className="text-xs text-[#adaaaa]">Failed</div>
        </button>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#20201f] rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-white/10 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-8 text-[#adaaaa]">
          No {filter !== 'all' ? filter : ''} tasks
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {filteredTasks.map((task) => (
            <div 
              key={task.id}
              className="bg-[#20201f] border border-white/5 rounded-lg p-4 hover:border-[#ff8aa7] transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                  {getStatusIcon(task.status)}
                  <span className="text-sm font-bold text-white truncate">
                    {task.name || task.id}
                  </span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-sm ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-[#adaaaa]">
                {task.startedAt && (
                  <div>Started: {formatTime(task.startedAt)}</div>
                )}
                {task.duration && (
                  <div>Duration: {formatDuration(task.duration)}</div>
                )}
              </div>

              {task.error && (
                <div className="mt-2 text-xs text-red-500 bg-red-500/10 p-2 rounded">
                  {task.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
