import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import os from 'os'

const execAsync = promisify(exec)

export async function GET() {
  try {
    // CPU Usage
    const cpuUsage = await getCpuUsage()
    
    // Memory
    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = totalMem - freeMem
    
    // GPU (if available)
    const gpu = await getGpuInfo()
    
    // Uptime
    const uptime = os.uptime()

    return NextResponse.json({
      cpu: {
        usage: cpuUsage,
        cores: os.cpus().length,
        model: os.cpus()[0]?.model || 'Unknown'
      },
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        percentage: (usedMem / totalMem) * 100
      },
      gpu,
      uptime
    })
  } catch (error) {
    console.error('Failed to fetch system metrics:', error)
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 })
  }
}

async function getCpuUsage(): Promise<number> {
  try {
    // Get CPU usage via top command
    const { stdout } = await execAsync("top -bn1 | grep 'Cpu(s)' | sed 's/.*, *\\([0-9.]*\\)%* id.*/\\1/' | awk '{print 100 - $1}'")
    return parseFloat(stdout.trim()) || 0
  } catch {
    // Fallback: calculate from os.cpus()
    const cpus = os.cpus()
    let totalIdle = 0
    let totalTick = 0
    
    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times]
      }
      totalIdle += cpu.times.idle
    })
    
    const idle = totalIdle / cpus.length
    const total = totalTick / cpus.length
    const usage = 100 - ~~(100 * idle / total)
    
    return usage
  }
}

async function getGpuInfo() {
  try {
    // Try nvidia-smi for NVIDIA GPUs
    const { stdout } = await execAsync('nvidia-smi --query-gpu=name,memory.total,memory.used --format=csv,noheader,nounits')
    const [name, memTotal, memUsed] = stdout.trim().split(',').map(s => s.trim())
    
    return {
      available: true,
      name,
      memory: {
        total: parseFloat(memTotal) * 1024 * 1024, // Convert MB to bytes
        used: parseFloat(memUsed) * 1024 * 1024
      }
    }
  } catch {
    // No GPU or nvidia-smi not available
    return {
      available: false
    }
  }
}
