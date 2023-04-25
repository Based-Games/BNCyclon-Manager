<template>
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
  <form>
    <button class="btn btn-outline-success" @click="selectFolder()">Set game path</button>
  </form>

  <hr class="border border-danger border-1 my-4 opacity-50" />
  <h2 class="subheading">App theme</h2>
  <form>
    <button class="btn btn-outline-success my-2" @click="toggleThemeReload()">
      Toggle {{ settings.useLightTheme ? 'dark' : 'light' }} theme
    </button>
  </form>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
const { ipcRenderer } = require('electron')
var filePath = ''

export default {
  name: 'SettingsPage',
  data() {
    return {
      filePath: filePath
    }
  },
  computed: {
    ...mapState(['settings'])
  },
  methods: {
    ...mapMutations(['toggleTheme']),
    async selectFolder() {
      var response = await ipcRenderer.invoke('open-file-explorer')
      if (response != null) {
        console.log(response)
      }
    },
    async toggleThemeReload() {
      this.toggleTheme()
      ipcRenderer.invoke('refresh-app')
    }
  }
}
</script>
