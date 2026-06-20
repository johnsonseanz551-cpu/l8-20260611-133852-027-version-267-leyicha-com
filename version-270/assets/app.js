(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("open");
      });
    }

    var carousel = document.querySelector("[data-hero-carousel]");
    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
      var thumbs = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-thumb]"));
      var prev = carousel.querySelector("[data-hero-prev]");
      var next = carousel.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === current);
        });
        thumbs.forEach(function (thumb, i) {
          thumb.classList.toggle("active", i === current);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          restart();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          restart();
        });
      }

      show(0);
      restart();
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var filterInputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    filterInputs.forEach(function (input) {
      if (query) {
        input.value = query;
      }
    });

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-bar]")).forEach(function (bar) {
      var input = bar.querySelector("[data-filter-input]");
      var year = bar.querySelector("[data-year-filter]");
      var region = bar.querySelector("[data-region-filter]");
      var scope = document.querySelector("[data-filter-scope]");
      var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .ranking-card")) : [];

      function applyFilter() {
        var text = input ? input.value.trim().toLowerCase() : "";
        var yearValue = year ? year.value : "";
        var regionValue = region ? region.value : "";
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();
          var passText = !text || haystack.indexOf(text) !== -1;
          var passYear = !yearValue || card.getAttribute("data-year") === yearValue;
          var passRegion = !regionValue || card.getAttribute("data-region") === regionValue;
          card.classList.toggle("hidden-by-filter", !(passText && passYear && passRegion));
        });
      }

      [input, year, region].forEach(function (element) {
        if (element) {
          element.addEventListener("input", applyFilter);
          element.addEventListener("change", applyFilter);
        }
      });

      applyFilter();
    });
  });

  window.initMoviePlayer = function (videoId, source) {
    ready(function () {
      var video = document.getElementById(videoId);
      if (!video || !source) {
        return;
      }
      var frame = video.closest(".player-frame");
      var overlay = frame ? frame.querySelector("[data-player-overlay]") : null;
      var attached = false;
      var hls = null;

      function attach() {
        if (attached) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function start() {
        attach();
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        var playRequest = video.play();
        if (playRequest && typeof playRequest.catch === "function") {
          playRequest.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener("click", start);
      }
      video.addEventListener("click", function () {
        if (!attached) {
          start();
        }
      });
      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  };
})();
