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

// Metrics endpoint
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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: os.uptime() })
})

app.listen(PORT, () => {
  console.log(`📊 Metrics API running on port ${PORT}`)
  console.log(`🌐 http://localhost:${PORT}/api/metrics`)
})
