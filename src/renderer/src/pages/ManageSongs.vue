<template>
  <AppNotice notice="Note that changes are not saved to the game files." notice-type="info" />
  <AppNotice
    v-if="changesMade"
    notice="You have unsaved changes! You must use the export menu to save."
    notice-type="warning"
  />

  <h1>Manage Songs</h1>
  <p>
    Use this to change, add, or remove songs from <samp class="text-info">musicLibrary.json</samp>
  </p>
  <button class="btn btn-outline-success">Add song</button>
  <hr class="border border-danger border-1 my-4 opacity-50" />

  <input
    v-model="searchInput"
    type="text"
    class="form-control border-primary mb-3"
    placeholder="Search for song or artist"
  />

  <p v-if="searchInput && !filteredSongs().length" class="text-danger-emphasis py-2">
    No songs found!
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
            data-bs-target="#editModal"
            @click="setEditModal(song)"
            >Edit</a
          >
          <a class="btn btn-outline-danger">Delete</a>
        </div>
      </div>
    </div>
  </div>

  <div id="editModal" class="modal">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            Editing: {{ currentSong.songTitle }} - {{ currentSong.artist }}
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <AppNotice notice="You cannot change the file name or server ID" notice-type="info" />
          <p>
            File name: <samp class="text-info">{{ currentSong.fileName }}</samp>
          </p>
          <p>
            Server ID: <samp class="text-info">{{ currentSong.serverId }}</samp>
          </p>
          <form>
            <div class="row">
              <div class="mb-3 col">
                <label class="form-label">Title</label>
                <input v-model="currentSong.songTitle" type="text" class="form-control" />
              </div>
              <div class="mb-3 col">
                <label class="form-label">In-game title</label>
                <input v-model="currentSong.inGameTitleEn" type="text" class="form-control" />
              </div>
            </div>
            <div class="row">
              <div class="mb-3 col">
                <label class="form-label">Artist</label>
                <input v-model="currentSong.artist" type="text" class="form-control" />
              </div>
              <div class="mb-3 col">
                <label class="form-label">Genre</label>
                <input v-model="currentSong.genre" type="text" class="form-control" />
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
            </div>
            <div class="row">
              <div class="mb-3 col">
                <label class="form-label">Arranged by</label>
                <input v-model="currentSong.arrangedBy" type="text" class="form-control" />
              </div>
              <div class="mb-3 col">
                <label class="form-label">Rounded difficulty</label>
                <input v-model="currentSong.difficulty" type="text" class="form-control" />
              </div>
            </div>
            <div class="row">
              <div class="mb-3 col">
                <label class="form-label">BPM</label>
                <input v-model="currentSong.BPM" type="text" class="form-control" />
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
            Cancel
          </button>
          <button type="button" class="btn btn-outline-primary">Save changes</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { mapState } from 'vuex'

import AppNotice from '../components/AppNotice.vue'

export default {
  name: 'ManageSongs',
  components: {
    AppNotice
  },
  data() {
    return {
      changesMade: false,
      songs: [],
      stages: null,
      currentSong: {},
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
        axios.get('http://localhost:7364/getMusicLibrary').then((res) => {
          if (res.data.validFile) {
            this.songs = res.data.musicLibrary
            this.stages = res.data.hausStages
          }
        })
      }
    },
    setEditModal(songObject) {
      this.currentSong = Object.assign({}, songObject)
    },
    filteredSongs() {
      return this.songs.filter(
        (song) =>
          song.songTitle.toLowerCase().includes(this.searchInput.toLowerCase()) ||
          song.artist.toLowerCase().includes(this.searchInput.toLowerCase())
      )
    }
  }
}
</script>
