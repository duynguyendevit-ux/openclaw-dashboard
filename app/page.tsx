'use client'

import { useEffect, useState } from 'react'
import { Activity, Cpu, HardDrive, Zap, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import SystemStats from '@/components/SystemStats'
import AgentMonitor from '@/components/AgentMonitor'
import CronJobs from '@/components/CronJobs'
import TaskManager from '@/components/TaskManager'

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-[#ff8aa7] mb-2">
              OpenClaw Dashboard
            </h1>
            <p className="text-[#adaaaa]">
              Monitor agents, tasks, cron jobs, and system resources
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono text-white">
              {currentTime.toLocaleTimeString('en-US', { hour12: false })}
            </div>
            <div className="text-sm text-[#adaaaa]">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      {/* System Stats */}
      <SystemStats />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Agent Monitor */}
        <AgentMonitor />

        {/* Cron Jobs */}
        <CronJobs />
      </div>

      {/* Task Manager */}
      <div className="mt-6">
        <TaskManager />
      </div>
    </div>
  )
}
