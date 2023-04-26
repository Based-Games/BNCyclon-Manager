<template>
  <AppNotice
    v-if="invalidPath"
    notice="The path you provided is not a valid path!"
    notice-type="danger"
  />

  <h1 class="heading mb-4">Application Settings</h1>

  <hr class="border border-danger border-1 my-4 opacity-50" />
  <h2 class="subheading">Game path</h2>
  <p>
    Please provide the path for your install of BoomerangNet Cyclon. <br />This should be the folder
    with the folders <samp class="text-info">data</samp>, <samp class="text-info">exe</samp>,
    <samp class="text-info">launcher</samp>, and <samp class="text-info">movie</samp>.
  </p>
  <p>
    Current game path:
    <samp :class="[settings.gamePath == null ? 'text-danger' : 'text-success']">{{
      settings.gamePath == null ? 'not set!' : settings.gamePath
    }}</samp>
  </p>
  <div>
    <button class="btn btn-outline-success me-2" @click="selectFolder()">Set game path</button>
    <button class="btn btn-outline-danger" @click="resetFolder()">Reset path</button>
  </div>

  <hr class="border border-danger border-1 my-4 opacity-50" />
  <h2 class="subheading">App theme</h2>
  <form>
    <button class="btn btn-outline-success my-2" @click="toggleThemeReload()">
      Toggle {{ settings.useLightTheme ? 'dark' : 'light' }} theme
    </button>
  </form>
</template>

<script>
const { mapState, mapMutations } = require('vuex')
const { ipcRenderer } = require('electron')
import axios from 'axios'
import AppNotice from '../components/AppNotice.vue'

export default {
  name: 'SettingsPage',
  components: {
    AppNotice
  },
  data() {
    return {
      invalidPath: false
    }
  },
  computed: {
    ...mapState(['settings'])
  },
  methods: {
    ...mapMutations(['toggleTheme', 'setGamePath']),
    async selectFolder() {
      var filePath = await ipcRenderer.invoke('open-file-explorer')
      if (filePath != null) {
        filePath = filePath.replace(/\\/g, '/') + '/'
        axios
          .post('http://localhost:7364/setGamePath', {
            gamePath: filePath
          })
          .then((res) => {
            if (res.data.validPath) {
              this.setGamePath(filePath)
              this.invalidPath = false
              ipcRenderer.invoke('refresh-app')
            } else {
              this.invalidPath = true
            }
          })
      }
    },
    async resetFolder() {
      this.setGamePath(null)
      ipcRenderer.invoke('refresh-app')
    },
    async toggleThemeReload() {
      this.toggleTheme()
      ipcRenderer.invoke('refresh-app')
    }
  }
}
</script>
