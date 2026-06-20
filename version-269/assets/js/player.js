(function () {
  document.querySelectorAll('.player-box').forEach(function (box) {
    var url = box.getAttribute('data-play-url');
    var video = box.querySelector('video');
    var overlay = box.querySelector('.player-overlay');
    var loaded = false;
    var hls = null;

    if (!url || !video || !overlay) {
      return;
    }

    function loadVideo() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function playVideo() {
      loadVideo();
      overlay.classList.add('is-hidden');
      video.controls = true;
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    }

    overlay.addEventListener('click', playVideo);
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });
    video.addEventListener('ended', function () {
      overlay.classList.remove('is-hidden');
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
