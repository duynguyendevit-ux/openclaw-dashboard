'use client'

import { useEffect, useState } from 'react'
import { Cpu, HardDrive, Zap, Activity } from 'lucide-react'

interface SystemMetrics {
  cpu: {
    usage: number
    cores: number
    model: string
  }
  memory: {
    total: number
    used: number
    free: number
    percentage: number
  }
  gpu: {
    available: boolean
    name?: string
    memory?: {
      total: number
      used: number
    }
  }
  uptime: number
}

export default function SystemStats() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/system/metrics')
        const data = await res.json()
        setMetrics(data)
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch metrics:', error)
        setLoading(false)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 5000) // Update every 5s

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-white/10 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-white/10 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6">
        <p className="text-[#adaaaa]">Failed to load system metrics</p>
      </div>
    )
  }

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 ** 3)
    return `${gb.toFixed(1)} GB`
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${mins}m`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* CPU */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6 hover:border-[#ff8aa7] transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#ff8aa7]" />
            <span className="text-sm font-bold text-[#adaaaa]">CPU</span>
          </div>
          <span className="text-xs text-[#adaaaa]">{metrics.cpu.cores} cores</span>
        </div>
        <div className="mb-2">
          <div className="text-3xl font-black text-white">{metrics.cpu.usage.toFixed(1)}%</div>
          <div className="text-xs text-[#adaaaa] mt-1 truncate">{metrics.cpu.model}</div>
        </div>
        <div className="w-full bg-[#20201f] rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#ff8aa7] to-[#ff6c95] transition-all duration-500"
            style={{ width: `${metrics.cpu.usage}%` }}
          />
        </div>
      </div>

      {/* Memory */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6 hover:border-[#ff8aa7] transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-[#ff8aa7]" />
            <span className="text-sm font-bold text-[#adaaaa]">RAM</span>
          </div>
          <span className="text-xs text-[#adaaaa]">{formatBytes(metrics.memory.total)}</span>
        </div>
        <div className="mb-2">
          <div className="text-3xl font-black text-white">{metrics.memory.percentage.toFixed(1)}%</div>
          <div className="text-xs text-[#adaaaa] mt-1">
            {formatBytes(metrics.memory.used)} / {formatBytes(metrics.memory.total)}
          </div>
        </div>
        <div className="w-full bg-[#20201f] rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#ff8aa7] to-[#ff6c95] transition-all duration-500"
            style={{ width: `${metrics.memory.percentage}%` }}
          />
        </div>
      </div>

      {/* GPU */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6 hover:border-[#ff8aa7] transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#ff8aa7]" />
            <span className="text-sm font-bold text-[#adaaaa]">GPU</span>
          </div>
        </div>
        {metrics.gpu.available ? (
          <>
            <div className="mb-2">
              <div className="text-3xl font-black text-white">
                {metrics.gpu.memory ? 
                  `${((metrics.gpu.memory.used / metrics.gpu.memory.total) * 100).toFixed(1)}%` : 
                  'N/A'
                }
              </div>
              <div className="text-xs text-[#adaaaa] mt-1 truncate">{metrics.gpu.name}</div>
            </div>
            {metrics.gpu.memory && (
              <div className="w-full bg-[#20201f] rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#ff8aa7] to-[#ff6c95] transition-all duration-500"
                  style={{ width: `${(metrics.gpu.memory.used / metrics.gpu.memory.total) * 100}%` }}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-[#adaaaa] text-sm">No GPU detected</div>
        )}
      </div>

      {/* Uptime */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-6 hover:border-[#ff8aa7] transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#ff8aa7]" />
            <span className="text-sm font-bold text-[#adaaaa]">Uptime</span>
          </div>
        </div>
        <div className="mb-2">
          <div className="text-2xl font-black text-white">{formatUptime(metrics.uptime)}</div>
          <div className="text-xs text-[#adaaaa] mt-1">System running</div>
        </div>
      </div>
    </div>
  )
}
