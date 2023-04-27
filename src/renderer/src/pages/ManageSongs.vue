<template>
  <AppNotice notice="Note that changes are not saved to the game files." notice-type="info" />
  <AppNotice
    v-if="changesMade"
    notice="You have unsaved changes! You must use the export menu to save."
    notice-type="warning"
  />
  <AppNotice v-if="saveError" :notice="errorMsg" notice-type="danger" />

  <h1>Manage Songs</h1>
  <p>
    Use this to change, add, or remove songs from <samp class="text-info">musicLibrary.json</samp>
  </p>
  <button
    data-bs-toggle="modal"
    data-bs-target="#songModal"
    class="btn btn-outline-success"
    @click="setCurrentSong(null)"
  >
    Add song
  </button>
  <hr class="border border-danger border-1 my-4 opacity-50" />

  <input
    v-model="searchInput"
    type="text"
    class="form-control border-primary mb-3"
    placeholder="Search for song, artist, or file name"
  />

  <p v-if="searchInput && !filteredSongs().length" class="text-danger-emphasis py-2">
    No songs found!
  </p>
  <p v-if="filteredSongs().length" class="text-success-emphasis py-2">
    Loaded {{ filteredSongs().length }} songs
  </p>

  <div class="row">
    <div v-for="song in filteredSongs()" :key="song.id" class="col-sm-3 mb-3">
      <div class="card">
        <img
          :src="['http://localhost:7364/loadSongJacket?fileName=' + song.fileName]"
          class="card-img-top"
        />
        <div class="card-body">
          <h5 class="card-title">{{ song.songTitle }} - {{ song.artist }}</h5>
          <p class="card-text">{{ song.BPM }} BPM</p>
          <p class="card-text">{{ song.ptInfo.replace(/_/g, ' / ') }}</p>
          <a
            class="btn btn-outline-info me-2"
            data-bs-toggle="modal"
            data-bs-target="#songModal"
            @click="setCurrentSong(song)"
            >Edit</a
          >
          <a
            class="btn btn-outline-danger"
            data-bs-toggle="modal"
            data-bs-target="#deleteModal"
            @click="setCurrentSong(song)"
            >Delete</a
          >
        </div>
      </div>
    </div>
  </div>

  <div id="songModal" class="modal fade">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 v-if="editing" class="modal-title">
            Editing: {{ currentSong.songTitle }} - {{ currentSong.artist }}
          </h5>
          <h5 v-if="!editing" class="modal-title">Add Song</h5>
        </div>
        <div class="modal-body">
          <div v-if="editing">
            <AppNotice notice="You cannot change the file name or server ID" notice-type="info" />
            <p>
              File name: <samp class="text-info">{{ currentSong.fileName }}</samp>
            </p>
            <p>
              Server ID: <samp class="text-info">{{ currentSong.serverId }}</samp>
            </p>
          </div>
          <div v-if="!editing">
            <AppNotice
              notice="You won't be able to change the file name or server ID after creation"
              notice-type="warning"
            />
            <p>
              Server ID: <samp class="text-info">{{ currentSong.serverId }}</samp>
            </p>
          </div>
          <form @submit.prevent="submitDataForm(currentSong)">
            <h3>Song information</h3>
            <hr class="border border-danger border-1 opacity-50" />
            <div class="row">
              <div v-if="!editing" class="mb-3 col">
                <label class="form-label">File name</label>
                <input v-model="currentSong.fileName" type="text" class="form-control" required />
              </div>
              <div class="mb-3 col">
                <label class="form-label">Title</label>
                <input v-model="currentSong.songTitle" type="text" class="form-control" required />
              </div>
              <div class="mb-3 col">
                <label class="form-label">In-game title</label>
                <input
                  v-model="currentSong.inGameTitleEn"
                  type="text"
                  class="form-control"
                  required
                />
              </div>
            </div>
            <div class="row">
              <div class="mb-3 col">
                <label class="form-label">Artist</label>
                <input v-model="currentSong.artist" type="text" class="form-control" required />
              </div>
              <div class="mb-3 col">
                <label class="form-label">Genre</label>
                <input v-model="currentSong.genre" type="text" class="form-control" required />
              </div>
            </div>
            <div class="row">
              <div class="mb-3 col">
                <label class="form-label">Vocalist</label>
                <input v-model="currentSong.vocalist" type="text" class="form-control" />
              </div>
              <div class="mb-3 col">
                <label class="form-label">Composer</label>
                <input v-model="currentSong.composedBy" type="text" class="form-control" />
              </div>
              <div class="mb-3 col">
                <label class="form-label">Arranged by</label>
                <input v-model="currentSong.arrangedBy" type="text" class="form-control" />
              </div>
            </div>
            <div class="row">
              <div class="mb-3 col">
                <label class="form-label">Rounded difficulty</label>
                <input
                  v-model="currentSong.difficulty"
                  type="number"
                  min="1"
                  max="12"
                  class="form-control"
                  required
                />
              </div>
              <div class="mb-3 col">
                <label class="form-label">BPM</label>
                <input
                  v-model="currentSong.BPM"
                  type="number"
                  min="1"
                  max="900"
                  class="form-control"
                  required
                />
              </div>
            </div>
            <h3>Chart information</h3>
            <div v-for="pt in pt_types" :key="pt">
              <hr class="border border-danger border-1 opacity-50" />
              <div class="row row-cols-auto align-items-start">
                <h4 class="text-primary-emphasis col">{{ pt }}</h4>
                <div class="col">
                  <input
                    v-model="currentSong.chartData[pt].enabled"
                    class="form-check-input me-2"
                    type="checkbox"
                  />
                  <label class="form-label">Enabled?</label>
                </div>
              </div>
              <div v-if="currentSong.chartData[pt].enabled" class="row">
                <div class="mb-3 col-3">
                  <label class="form-label">Difficulty</label>
                  <input
                    v-model="currentSong.chartData[pt].difficulty"
                    type="number"
                    min="1"
                    max="12"
                    required
                    class="form-control"
                  />
                </div>
              </div>
            </div>
            <div class="modal-footer mt-3">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                Cancel
              </button>
              <button v-if="editing" type="submit" class="btn btn-outline-primary">Save</button>
              <button v-if="!editing" type="submit" class="btn btn-outline-success">
                Add Song
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <div id="deleteModal" class="modal fade" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5">Delete Song</h1>
        </div>
        <div class="modal-body">
          <AppNotice
            notice="This will not remove the song from any disc sets or missions"
            notice-type="warning"
          />
          <h2>
            Are you sure you want to delete {{ currentSong.songTitle }} - {{ currentSong.artist }}?
          </h2>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
            Close
          </button>
          <button
            type="button"
            class="btn btn-outline-danger"
            @click="sendSongDeletion(currentSong.id)"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { mapState } from 'vuex'
import { Modal } from 'bootstrap'

import AppNotice from '../components/AppNotice.vue'

export default {
  name: 'ManageSongs',
  components: {
    AppNotice
  },
  data() {
    return {
      editing: true,
      changesMade: false,
      saveError: false,
      errorMsg: '',
      songs: [],
      pt_types: ['EZ', 'NM', 'HD', 'PR', 'MX', 'S1', 'S2'],
      currentSong: this.initChartData({}),
      searchInput: ''
    }
  },
  computed: {
    ...mapState(['settings'])
  },
  mounted() {
    this.getMusicLibrary()
  },
  methods: {
    getMusicLibrary() {
      if (this.settings.gamePath != null) {
        axios
          .get('http://localhost:7364/getMusicLibrary')
          .then((res) => {
            this.saveError = true
            this.errorMsg = 'The server was unable to find your music database'
            if (res.data.validFile) {
              this.saveError = false
              this.songs = res.data.musicLibrary
              this.changesMade = res.data.hasChanges
            }
          })
          .catch(() => {
            this.errorMsg = 'The server was unable to load songs'
            this.saveError = true
          })
      }
    },
    sendSongChange(songObject) {
      if (this.settings.gamePath != null) {
        axios
          .post('http://localhost:7364/updateSong', { song: songObject })
          .then((res) => {
            this.saveError = true
            if (res.data.saved) {
              this.saveError = false
              this.getMusicLibrary()
            }
          })
          .catch(() => {
            this.errorMsg = 'The server was unable to save the changes'
            this.saveError = true
          })
      }
    },
    sendSongDeletion(songId) {
      this.closeModal('deleteModal')
      if (this.settings.gamePath != null) {
        axios
          .post('http://localhost:7364/deleteSong', { songId: songId })
          .then((res) => {
            this.saveError = true
            if (res.data.saved) {
              this.saveError = false
              this.getMusicLibrary()
            }
          })
          .catch(() => {
            this.errorMsg = 'The server was unable to save the changes'
            this.saveError = true
          })
      }
    },
    sendNewSong(songObject) {
      if (this.settings.gamePath != null) {
        axios
          .post('http://localhost:7364/createSong', { song: songObject })
          .then((res) => {
            this.saveError = true
            if (res.data.saved) {
              this.saveError = false
              this.getMusicLibrary()
            }
          })
          .catch(() => {
            this.errorMsg = 'The server was unable to save the changes'
            this.saveError = true
          })
      }
    },
    setCurrentSong(songObject) {
      if (songObject === null) {
        this.editing = false
        songObject = { ptInfo: null }
      } else {
        this.editing = true
      }
      this.currentSong = Object.assign({}, songObject)
      this.initChartData(this.currentSong)
      if (!this.editing) {
        this.currentSong.serverId = this.getServerId()
      } else {
        const ptInfo = this.currentSong.ptInfo.split('_')
        for (var pt of ptInfo) {
          const pt_split = pt.split('-')
          const pt_type = pt_split[0]
          const pt_diff = pt_split[1]
          this.currentSong.chartData[pt_type] = {
            enabled: true,
            difficulty: pt_diff,
            chartId: this.currentSong[pt_type],
            noteCount: this.currentSong[pt_type + 'Note'],
            maxCombo: this.currentSong[pt_type + 'Combo']
          }
        }
      }
    },
    filteredSongs() {
      return this.songs.filter(
        (song) =>
          song.songTitle.toLowerCase().includes(this.searchInput.toLowerCase()) ||
          song.artist.toLowerCase().includes(this.searchInput.toLowerCase()) ||
          song.fileName.toLowerCase().includes(this.searchInput.toLowerCase())
      )
    },
    initChartData(currentSong) {
      currentSong.chartData = {}
      for (var type of ['EZ', 'NM', 'HD', 'PR', 'MX', 'S1', 'S2']) {
        currentSong.chartData[type] = {
          enabled: false,
          difficulty: null,
          chartId: null,
          noteCount: null,
          maxCombo: null
        }
      }
      return currentSong
    },
    getServerId() {
      const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
      let result = ''
      let counter = 0
      while (counter < 24) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
        counter += 1
      }
      return result
    },
    closeModal(modalName) {
      const modal = document.getElementById(modalName)
      const bootstrapModal = Modal.getInstance(modal)
      bootstrapModal.hide()
    },
    submitDataForm() {
      this.closeModal('songModal')

      var chartEnabled = false
      for (const chart in this.currentSong.chartData) {
        if (this.currentSong.chartData[chart].enabled) {
          chartEnabled = true
        }
      }
      if (!chartEnabled) {
        this.errorMsg = 'You must enable at least 1 chart!'
        this.saveError = true
        return
      } else {
        this.saveError = false
      }

      if (this.editing) {
        this.sendSongChange(this.currentSong)
      } else {
        this.sendNewSong(this.currentSong)
      }
    }
  }
}
</script>
