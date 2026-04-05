const express = require('express')
const os = require('os')
const { exec } = require('child_process')
const { promisify } = require('util')

const execAsync = promisify(exec)
const app = express()
const PORT = process.env.PORT || 19999

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

// Get CPU usage
async function getCpuUsage() {
  try {
    const { stdout } = await execAsync("top -bn1 | grep 'Cpu(s)' | sed 's/.*, *\\([0-9.]*\\)%* id.*/\\1/' | awk '{print 100 - $1}'")
    return parseFloat(stdout.trim()) || 0
  } catch {
    return 0
  }
}

// Get GPU info
async function getGpuInfo() {
  try {
    const { stdout } = await execAsync('nvidia-smi --query-gpu=name,memory.total,memory.used --format=csv,noheader,nounits')
    const [name, memTotal, memUsed] = stdout.trim().split(',').map(s => s.trim())
    
    return {
      available: true,
      name,
      memory: {
        total: parseFloat(memTotal) * 1024 * 1024,
        used: parseFloat(memUsed) * 1024 * 1024
      }
    }
  } catch {
    return { available: false }
  }
}

// Get OpenClaw sessions
async function getOpenClawSessions() {
  try {
    const { stdout } = await execAsync('openclaw sessions 2>/dev/null | tail -n +2')
    const lines = stdout.trim().split('\n').filter(l => l.trim())
    
    const sessions = lines.map(line => {
      const parts = line.trim().split(/\s+/)
      if (parts.length < 4) return null
      
      const sessionKey = parts[1]
      const lastActive = parts[2] + ' ' + parts[3]
      const model = parts[4]
      
      return {
        sessionKey,
        kind: sessionKey.includes(':cron:') ? 'cron' : sessionKey.includes(':telegram:') ? 'telegram' : 'main',
        lastMessageAt: lastActive,
        model
      }
    }).filter(Boolean)
    
    return sessions
  } catch {
    return []
  }
}

// Get OpenClaw cron jobs
async function getOpenClawCron() {
  try {
    const { stdout } = await execAsync('openclaw cron status 2>/dev/null')
    // Parse cron output - for now return mock data
    // TODO: Implement proper parsing when cron command format is known
    return []
  } catch {
    return []
  }
}

// System metrics endpoint
app.get('/api/metrics', async (req, res) => {
  try {
    const cpuUsage = await getCpuUsage()
    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = totalMem - freeMem
    const gpu = await getGpuInfo()
    const uptime = os.uptime()

    res.json({
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
      uptime,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Failed to fetch metrics:', error)
    res.status(500).json({ error: 'Failed to fetch metrics' })
  }
})

// OpenClaw sessions endpoint
app.get('/api/openclaw/sessions', async (req, res) => {
  try {
    const sessions = await getOpenClawSessions()
    res.json({ sessions })
  } catch (error) {
    console.error('Failed to fetch sessions:', error)
    res.status(500).json({ sessions: [] })
  }
})

// OpenClaw cron jobs endpoint
app.get('/api/openclaw/cron', async (req, res) => {
  try {
    const jobs = await getOpenClawCron()
    res.json({ jobs })
  } catch (error) {
    console.error('Failed to fetch cron jobs:', error)
    res.status(500).json({ jobs: [] })
  }
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: os.uptime() })
})

app.listen(PORT, () => {
  console.log(`📊 Metrics API running on port ${PORT}`)
  console.log(`🌐 http://localhost:${PORT}/api/metrics`)
  console.log(`🤖 http://localhost:${PORT}/api/openclaw/sessions`)
  console.log(`⏰ http://localhost:${PORT}/api/openclaw/cron`)
})
