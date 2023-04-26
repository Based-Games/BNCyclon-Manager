<template>
  <NavBar />

  <div class="container">
    <AppNotice
      v-if="settings.gamePath == null"
      notice="You need to set your game path!"
      notice-type="danger"
      link-uri="#/settings"
      link-text="Fix now"
    />

    <component :is="currentView" />
  </div>

  <PageFooter />
</template>

<script>
import axios from 'axios'
import { mapGetters, mapMutations } from 'vuex'

import NavBar from './components/NavBar.vue'
import PageFooter from './components/PageFooter.vue'
import AppNotice from './components/AppNotice.vue'

import HomePage from './pages/HomePage.vue'
import ManageSongs from './pages/ManageSongs.vue'
import ExportSongs from './pages/ExportSongs.vue'
import ManageRaveup from './pages/ManageRaveup.vue'
import ExportRaveup from './pages/ExportRaveup.vue'
import ManageMissions from './pages/ManageMissions.vue'
import ExportMissions from './pages/ExportMissions.vue'
import ManageKeysounds from './pages/ManageKeysounds.vue'
import ManageIcons from './pages/ManageIcons.vue'
import SettingsPage from './pages/SettingsPage.vue'

const routes = {
  '/': HomePage,
  '/songs': ManageSongs,
  '/songs/export': ExportSongs,
  '/raveup': ManageRaveup,
  '/raveup/export': ExportRaveup,
  '/missions': ManageMissions,
  '/missions/export': ExportMissions,
  '/keysounds': ManageKeysounds,
  '/icons': ManageIcons,
  '/settings': SettingsPage
}

export default {
  name: 'App',
  components: {
    NavBar,
    PageFooter,
    AppNotice
  },
  data() {
    return {
      currentPath: window.location.hash
    }
  },
  computed: {
    currentView() {
      return routes[this.currentPath.slice(1) || '/']
    },
    ...mapGetters(['settings']),
    theme() {
      return this.settings.useLightTheme ? 'light' : 'dark'
    }
  },
  mounted() {
    window.addEventListener('hashchange', () => {
      this.currentPath = window.location.hash
    })
    document.documentElement.setAttribute('data-bs-theme', this.theme)
    this.verifyFolder()
  },
  methods: {
    ...mapMutations(['setGamePath']),
    verifyFolder() {
      if (this.settings.gamePath != null) {
        axios
          .post('http://localhost:7364/setGamePath', {
            gamePath: this.settings.gamePath
          })
          .then((res) => {
            if (!res.data.validPath) {
              this.setGamePath(null)
            }
          })
      }
    }
  }
}
</script>
