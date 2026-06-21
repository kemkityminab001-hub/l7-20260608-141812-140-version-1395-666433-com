(function () {
  function bindPlayer(player) {
    var video = player.querySelector('video');
    var stream = player.getAttribute('data-stream');
    var bigPlay = player.querySelector('.big-play');
    var playToggle = player.querySelector('[data-play-toggle]');
    var muteToggle = player.querySelector('[data-mute-toggle]');
    var fullscreen = player.querySelector('[data-fullscreen]');
    var hls = null;
    var loaded = false;

    if (!video || !stream) {
      return;
    }

    function loadStream() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function startPlayback() {
      loadStream();
      var attempt = video.play();

      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    function togglePlayback(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      if (video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    }

    function updateState() {
      player.classList.toggle('is-playing', !video.paused);
      if (playToggle) {
        playToggle.textContent = video.paused ? '▶' : '暂停';
      }
    }

    if (bigPlay) {
      bigPlay.addEventListener('click', togglePlayback);
    }

    if (playToggle) {
      playToggle.addEventListener('click', togglePlayback);
    }

    video.addEventListener('click', togglePlayback);
    video.addEventListener('play', updateState);
    video.addEventListener('pause', updateState);
    video.addEventListener('ended', updateState);

    if (muteToggle) {
      muteToggle.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        video.muted = !video.muted;
        muteToggle.textContent = video.muted ? '静音' : '音量';
      });
    }

    if (fullscreen) {
      fullscreen.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (player.requestFullscreen) {
          player.requestFullscreen();
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.querySelectorAll('.movie-player').forEach(bindPlayer);
})();
