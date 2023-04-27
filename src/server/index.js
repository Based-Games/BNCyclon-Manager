import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import fsp from 'fs/promises'
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

function initChartData(songData) {
  songData.chartData = {}
  for (const type of ['EZ', 'NM', 'HD', 'PR', 'MX', 'S1', 'S2']) {
    songData.chartData[type] = {
      enabled: false,
      difficulty: null,
      chartId: null,
      noteCount: null,
      maxCombo: null
    }
  }
  return songData
}

function ptInfoToChartData(songData) {
  const ptInfo = songData.ptInfo.split('_')
  for (var pt of ptInfo) {
    const pt_split = pt.split('-')
    const pt_type = pt_split[0]
    const pt_diff = Number(pt_split[1])
    songData.chartData[pt_type] = {
      enabled: true,
      difficulty: pt_diff,
      chartId: songData[pt_type],
      noteCount: songData[pt_type + 'Note'],
      maxCombo: songData[pt_type + 'Combo']
    }
  }
  return songData
}

function chartDataToPT(songData) {
  const chartData = songData.chartData
  var ptInfo = ''
  for (const type of ['EZ', 'NM', 'HD', 'PR', 'MX', 'S1', 'S2']) {
    if (chartData[type].enabled) {
      ptInfo += type + '-' + chartData[type].difficulty.toString() + '_'
    }
    songData[type] = chartData[type].chartId
    songData[type + 'Note'] = chartData[type].noteCount != null ? chartData[type].noteCount : 0
    songData[type + 'Combo'] = chartData[type].maxCombo != null ? chartData[type].maxCombo : 0
  }
  songData.ptInfo = ptInfo.substring(0, ptInfo.length - 1)
  return songData
}

async function getMusicChanges() {
  const musicChangesPath = verifiedPath + 'Data/System/JSON/musicLibrary_mod.json'
  if (!(await fse.pathExists(musicChangesPath))) {
    var emptyFile = JSON.stringify({ changes: [], creations: [], deletions: [] }, undefined, 4)
    await fsp.writeFile(musicChangesPath, emptyFile, function (err) {
      if (err) console.log('error', err)
    })
  }
  const musicChangesData = await fsp.readFile(musicChangesPath, 'utf8')
  return JSON.parse(musicChangesData)
}

async function writeMusicChanges(musicChanges) {
  const musicChangesPath = verifiedPath + 'Data/System/JSON/musicLibrary_mod.json'
  const musicChangeData = JSON.stringify(musicChanges, undefined, 4)
  await fsp.writeFile(musicChangesPath, musicChangeData, function (err) {
    if (err) console.log('error', err)
  })
}

async function getMusicLibrary() {
  const musicLibraryPath = verifiedPath + 'Data/System/JSON/musicLibrary.json'
  if (!(await fse.pathExists(musicLibraryPath))) {
    return null
  }
  const musicLibraryData = await fsp.readFile(musicLibraryPath, 'utf8')
  return JSON.parse(musicLibraryData)
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

server.get('/getMusicLibrary', async (req, res) => {
  const musicLibrary = await getMusicLibrary()
  if (musicLibrary === null) {
    res.json({
      validFile: false,
      file: 'musicLibrary.json'
    })
  }

  const musicChanges = await getMusicChanges()
  var changesMade = false

  if (musicChanges.changes !== undefined) {
    for (const change in musicChanges.changes) {
      changesMade = true
      const changeData = musicChanges.changes[change]
      var songData = musicLibrary.songs.find((song) => song.id === changeData.id)
      const songIndex = musicLibrary.songs.indexOf(songData)

      for (const [key, value] of Object.entries(changeData)) {
        songData[key] = value
      }
      musicLibrary.songs[songIndex] = songData
    }
  }

  res.json({
    validFile: true,
    musicLibrary: musicLibrary.songs,
    hasChanges: changesMade
  })
})

server.get('/loadSongJacket', async (req, res) => {
  const songPath = verifiedPath + 'Data/SongDiscBig/' + req.query.fileName + '.png'
  const exists = await fse.pathExists(songPath)
  if (exists) res.sendFile(songPath)
  else res.sendStatus(404)
})

server.post('/updateSong', async (req, res) => {
  const musicLibrary = await getMusicLibrary()
  if (musicLibrary === null) {
    res.json({
      validFile: false,
      file: 'musicLibrary.json'
    })
  }
  var newSongData = req.body.song
  if (newSongData == undefined) {
    res.json({
      saved: false
    })
    return
  }
  var oldSongData = musicLibrary.songs.find((song) => song.id === newSongData.id)
  newSongData = chartDataToPT(newSongData)
  const checkedKeys = [
    'songTitle',
    'inGameTitleEn',
    'genre',
    'difficulty',
    'BPM',
    'composedBy',
    'arrangedBy',
    'vocalist',
    'artist',
    'ptInfo',
    'EZ',
    'NM',
    'HD',
    'PR',
    'MX',
    'S1',
    'S2',
    'EZNote',
    'NMNote',
    'HDNote',
    'PRNote',
    'MXNote',
    'S1Note',
    'S2Note',
    'EZCombo',
    'NMCombo',
    'HDCombo',
    'PRCombo',
    'MXCombo',
    'S1Combo',
    'S2Combo'
  ]
  var dataChanges = { id: oldSongData.id }
  for (const key of checkedKeys) {
    if (newSongData[key] !== oldSongData[key]) {
      dataChanges[key] = newSongData[key]
    }
  }

  var musicChanges = await getMusicChanges()
  if (musicChanges.changes == undefined) {
    musicChanges.changes = []
  }

  var oldChanges = musicChanges.changes.find((x) => x.id === dataChanges.id)
  if (oldChanges == undefined) {
    musicChanges.changes.push(dataChanges)
  } else {
    const index = musicChanges.changes.indexOf(oldChanges)
    musicChanges.changes[index] = dataChanges
  }

  await writeMusicChanges(musicChanges)

  res.json({
    saved: true
  })
})

server.post('/deleteSong', async (req, res) => {})

server.post('/createSong', async (req, res) => {})

server.post('/resetChanges', async (req, res) => {
  await writeMusicChanges({
    changes: [],
    creations: [],
    deletions: []
  })
  res.json({
    saved: true
  })
})
