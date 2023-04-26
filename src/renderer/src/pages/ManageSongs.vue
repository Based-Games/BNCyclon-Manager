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

  <div class="row">
    <div v-for="song in songs" :key="song.id" class="col-sm-3 mb-3">
      <div class="card">
        <img
          :src="['http://localhost:7364/loadSongJacket?fileName=' + song.fileName]"
          class="card-img-top"
        />
        <div class="card-body">
          <h5 class="card-title">{{ song.songTitle }} - {{ song.artist }}</h5>
          <p class="card-text">{{ song.BPM }} BPM</p>
          <p class="card-text">{{ song.ptInfo.replace(/_/g, ' / ') }}</p>
          <a class="btn btn-outline-info me-2">Edit</a>
          <a class="btn btn-outline-danger">Delete</a>
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
      songs: null,
      stages: null
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
    }
  }
}
</script>
