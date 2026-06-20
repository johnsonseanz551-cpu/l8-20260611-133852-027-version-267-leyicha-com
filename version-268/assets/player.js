(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var player = document.querySelector("[data-player]");
    if (!player) {
      return;
    }
    var video = player.querySelector("video");
    var overlay = player.querySelector(".player-overlay");
    var streamUrl = video ? video.getAttribute("data-stream") : "";
    var hlsInstance = null;

    function loadStream() {
      if (!video || !streamUrl || video.getAttribute("data-loaded") === "true") {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 30,
          backBufferLength: 30,
          enableWorker: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      video.setAttribute("data-loaded", "true");
    }

    function playVideo() {
      loadStream();
      if (!video) {
        return;
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          player.classList.remove("is-playing");
        });
      }
      player.classList.add("is-playing");
    }

    if (overlay) {
      overlay.addEventListener("click", playVideo);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        player.classList.remove("is-playing");
      });
      video.addEventListener("ended", function () {
        player.classList.remove("is-playing");
      });
    }
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
