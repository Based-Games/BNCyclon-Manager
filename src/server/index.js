import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import fse from 'fs-extra'

const server = express()
var verifiedPath = null

server.use(
  bodyParser.urlencoded({
    extended: true
  })
)
server.use(bodyParser.json())
server.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true)
    },
    methods: 'GET, POST',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
)

// cyclon project name was "736TIR64T" :)
server.listen(7364)

async function testGamePath(gamePath) {
  var valid = true
  const testFiles = [
    'exe/cyclon.exe',
    'launcher/patcher.exe',
    'launcher/config.json',
    'Data/System/JSON/config.json'
  ]

  for (const item of testFiles) {
    if (!(await fse.pathExists(gamePath + item))) {
      valid = false
    }
  }
  return valid
}

server.post('/setGamePath', async (req, res) => {
  var gamePath = req.body.gamePath

  const valid = await testGamePath(gamePath)
  if (valid) {
    verifiedPath = gamePath
    res.json({
      validPath: true
    })
  } else {
    res.json({
      validPath: false
    })
  }
})
