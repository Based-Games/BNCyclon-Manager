<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container-fluid">
      <a class="navbar-brand" href="#/">
        <img
          src="../assets/logo.png"
          alt="Logo"
          width="30"
          height="30"
          class="d-inline-block align-text-top"
        />
        BNCyclon Manager
      </a>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbar"
        aria-controls="navbar"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div id="navbar" class="collapse navbar-collapse">
        <ul class="navbar-nav">
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Song Data
            </a>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#/songs">Manage Songs</a></li>
              <li><a class="dropdown-item disabled">Chart Editor</a></li>
              <li><a class="dropdown-item" href="#/songs/export">Export Song Data</a></li>
            </ul>
          </li>

          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              RaveUP Data
            </a>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#/raveup">Manage Disc Sets</a></li>
              <li><a class="dropdown-item" href="#/raveup/export">Export RaveUP Data</a></li>
            </ul>
          </li>

          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Club Tour Data
            </a>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#/missions">Manage Missions</a></li>
              <li><a class="dropdown-item disabled">Manage Mission Types</a></li>
              <li><a class="dropdown-item" href="#/missions/export">Export Mission Data</a></li>
            </ul>
          </li>

          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Game Data
            </a>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#/keysounds">Manage Keysounds</a></li>
              <li><a class="dropdown-item" href="#/icons">Manage Icons</a></li>
            </ul>
          </li>

          <li class="nav-item">
            <a class="nav-link" href="#/settings">Settings</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  <br />
</template>

<script>
export default {
  name: 'NavBar'
}
</script>
