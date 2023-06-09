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

function chartDataToPT(songData) {
  const chartData = songData.chartData
  var ptInfo = ''
  var tIndex = 1
  for (const type of ['EZ', 'NM', 'HD', 'PR', 'MX', 'S1', 'S2']) {
    if (chartData[type].enabled) {
      ptInfo += type + '-' + chartData[type].difficulty.toString() + '_'
    }
    songData[type] = tIndex
    songData[type + 'Note'] = chartData[type].noteCount != null ? chartData[type].noteCount : 0
    songData[type + 'Combo'] = chartData[type].maxCombo != null ? chartData[type].maxCombo : 0
    tIndex += 1
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
  var musicLibrary = JSON.parse(musicLibraryData)

  const musicChanges = await getMusicChanges()
  var changesMade = false

  if (musicChanges.creations !== undefined) {
    for (const creation of musicChanges.creations) {
      changesMade = true
      musicLibrary.songs.push(creation)
    }
  }

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

  if (musicChanges.deletions !== undefined) {
    for (const deletion of musicChanges.deletions) {
      changesMade = true
      musicLibrary.songs.splice(
        musicLibrary.songs.findIndex(function (i) {
          return i.id === deletion
        }),
        1
      )
    }
  }

  return [musicLibrary, changesMade]
}

function getNextSongID(musicData) {
  let maxId = 0
  for (let i = 0; i < musicData.length; i++) {
    const obj = musicData[i]
    if (obj.id > maxId) {
      maxId = obj.id
    }
  }

  return maxId + 1
}

async function generateHausStages(musicData) {
  var hausStages = { stages: [] }
  var songIndex = 1
  for (const song of musicData.songs) {
    for (const index of [1, 2, 3, 4]) {
      var stageData = {
        id: songIndex,
        stage: index,
        songId: song.id
      }
      const ptInfo = song.ptInfo.split('_')
      var usedDiffs = []
      for (pt of ptInfo) {
        usedDiffs.push(pt.split('-')[0])
      }

      for (var pt of ['EZ', 'NM', 'HD', 'PR', 'MX', 'S1', 'S2']) {
        if (usedDiffs.includes(pt)) {
          stageData[pt] = true
        } else {
          stageData[pt] = false
        }
      }

      hausStages.stages.push(stageData)
      songIndex += 1
    }
  }

  const hausStagesPath = verifiedPath + 'Data/System/JSON/hausStages.json'
  if (!(await fse.pathExists(hausStagesPath))) {
    return
  }

  const hausStagesJSON = await fsp.readFile(hausStagesPath, 'utf8')
  await fsp.writeFile(hausStagesPath + '.bak', hausStagesJSON, function (err) {
    if (err) console.log('error', err)
  })

  const moddedHausStages = JSON.stringify(hausStages, undefined, 4)
  await fsp.writeFile(hausStagesPath, moddedHausStages, function (err) {
    if (err) console.log('error', err)
  })
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
  const [musicLibrary, changesMade] = await getMusicLibrary()
  if (musicLibrary === null) {
    res.json({
      validFile: false,
      file: 'musicLibrary.json'
    })
  }

  res.json({
    validFile: true,
    musicLibrary: musicLibrary.songs,
    hasChanges: changesMade
  })
})

server.post('/saveMusicLibrary', async (req, res) => {
  const [musicLibrary, hasChanges] = await getMusicLibrary()
  if (musicLibrary === null) {
    res.json({
      validFile: false,
      file: 'musicLibrary.json'
    })
  }

  const musicLibraryPath = verifiedPath + 'Data/System/JSON/musicLibrary.json'
  if (!(await fse.pathExists(musicLibraryPath))) {
    res.json({
      validFile: false
    })
    return
  }

  const musicLibraryJSON = await fsp.readFile(musicLibraryPath, 'utf8')
  await fsp.writeFile(musicLibraryPath + '.bak', musicLibraryJSON, function (err) {
    if (err) console.log('error', err)
  })

  const moddedLibrary = JSON.stringify(musicLibrary, undefined, 4)
  await fsp.writeFile(musicLibraryPath, moddedLibrary, function (err) {
    if (err) console.log('error', err)
  })

  await writeMusicChanges({
    changes: [],
    creations: [],
    deletions: []
  })

  await generateHausStages(musicLibrary)

  res.json({
    validFile: true,
    changesMade: hasChanges
  })
})

server.get('/loadSongJacket', async (req, res) => {
  const songPath = verifiedPath + 'Data/SongDiscBig/' + req.query.fileName + '.png'
  const exists = await fse.pathExists(songPath)
  if (exists) res.sendFile(songPath)
  else res.sendStatus(404)
})

server.post('/updateSong', async (req, res) => {
  const [musicLibrary, changesMade] = await getMusicLibrary()
  if (musicLibrary === null) {
    res.json({
      saved: false
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
    saved: true,
    hasChanges: changesMade
  })
})

server.post('/deleteSong', async (req, res) => {
  var musicChanges = await getMusicChanges()
  if (musicChanges.deletions == undefined) {
    musicChanges.deletions = []
  }

  if (req.body.songId != undefined) {
    musicChanges.deletions.push(req.body.songId)
    musicChanges.deletions = [...new Set(musicChanges.deletions)]
    res.json({
      saved: true
    })
    await writeMusicChanges(musicChanges)
    return
  } else {
    res.json({
      saved: false
    })
    return
  }
})

server.post('/createSong', async (req, res) => {
  const [musicLibrary, changesMade] = await getMusicLibrary()
  if (musicLibrary === null) {
    res.json({
      saved: false
    })
  }

  var newSong = {
    id: 0,
    fileName: '',
    songTitle: '',
    inGameTitleKr: '',
    inGameTitleEn: '',
    genre: '',
    difficulty: 0,
    BPM: 0,
    composedBy: '',
    arrangedBy: '',
    vocalist: '',
    artist: '',
    ptInfo: '',
    serverId: '',
    EZ: 0,
    NM: 0,
    HD: 0,
    PR: 0,
    MX: 0,
    S1: 0,
    S2: 0,
    EZNote: 0,
    EZCombo: 0,
    NMNote: 0,
    NMCombo: 0,
    HDNote: 0,
    HDCombo: 0,
    PRNote: 0,
    PRCombo: 0,
    MXNote: 0,
    MXCombo: 0,
    S1Note: 0,
    S1Combo: 0,
    S2Note: 0,
    S2Combo: 0,
    groupSet: 1
  }

  var newSongData = req.body.song
  if (newSongData === undefined) {
    res.json({
      saved: false
    })
    return
  }
  newSongData = chartDataToPT(newSongData)
  const nextId = getNextSongID(musicLibrary.songs)
  newSongData.id = nextId
  newSongData.inGameTitleKr = newSongData.inGameTitleEn
  newSongData.composedBy = newSongData.composedBy !== undefined ? newSongData.composedBy : ''
  newSongData.vocalist = newSongData.vocalist !== undefined ? newSongData.vocalist : ''
  newSongData.arrangedBy = newSongData.arrangedBy !== undefined ? newSongData.arrangedBy : ''

  const checkedKeys = [
    'id',
    'fileName',
    'songTitle',
    'inGameTitleEn',
    'inGameTitleKr',
    'genre',
    'difficulty',
    'BPM',
    'composedBy',
    'arrangedBy',
    'vocalist',
    'artist',
    'ptInfo',
    'serverId',
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

  for (const key of checkedKeys) {
    newSong[key] = newSongData[key]
  }

  var musicChanges = await getMusicChanges()
  if (musicChanges.creations == undefined) {
    musicChanges.creations = []
  }
  musicChanges.creations.push(newSong)
  await writeMusicChanges(musicChanges)

  res.json({
    saved: true,
    hasChanges: changesMade
  })
})

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
