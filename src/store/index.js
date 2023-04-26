import { createStore } from 'vuex'

export default createStore({
  state: {
    settings: {
      gamePath: null,
      useLightTheme: false
    }
  },
  getters: {
    settings(state) {
      var settings = localStorage.getItem('settings')
      if (settings != null) {
        state.settings = JSON.parse(settings)
      }
      return state.settings
    }
  },
  mutations: {
    toggleTheme(state) {
      state.settings.useLightTheme = !state.settings.useLightTheme
      localStorage.setItem('settings', JSON.stringify(state.settings))
    },
    setGamePath(state, gamePath) {
      state.settings.gamePath = gamePath
      localStorage.setItem('settings', JSON.stringify(state.settings))
    }
  }
})
