<template>
  <AppNotice
    v-if="!changesMade"
    notice="You don't have any modifications! Set some and come back."
    notice-type="warning"
  />
  <AppNotice v-if="saveError" :notice="errorMsg" notice-type="danger" />

  <h1>Export Song Data</h1>
  <p>
    This will export all of your active modifications to
    <samp class="text-info">musicLibrary.json</samp> and
    <samp class="text-info">hausStages.json</samp>. <br />A backup of your current library will be
    made as <samp class="text-info">musicLibrary.json.bak</samp> and
    <samp class="text-info">hausStages.json.bak</samp>.
  </p>

  <button v-if="changesMade" class="btn btn-outline-success me-2" @click="runExport()">
    Save Library
  </button>
</template>

<script>
import axios from 'axios'
import { mapState } from 'vuex'

import AppNotice from '../components/AppNotice.vue'

export default {
  name: 'ExportSongs',
  components: {
    AppNotice
  },
  data() {
    return {
      changesMade: false,
      saveError: false,
      errorMsg: ''
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
    runExport() {
      if (this.settings.gamePath != null) {
        axios
          .post('http://localhost:7364/saveMusicLibrary', {})
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
            this.errorMsg = 'The server was unable to export the data'
            this.saveError = true
          })
      }
    }
  }
}
</script>
