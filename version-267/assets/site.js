(function () {
  var navToggle = document.querySelector(".nav-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  document.querySelectorAll("img").forEach(function (image) {
    image.addEventListener("error", function () {
      image.classList.add("is-missing");
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === currentSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  var searchForm = document.querySelector("[data-search-form]");
  var searchInput = document.querySelector("[data-search-input]");
  var regionSelect = document.querySelector("[data-filter-region]");
  var typeSelect = document.querySelector("[data-filter-type]");
  var yearSelect = document.querySelector("[data-filter-year]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-title]"));
  var emptyState = document.querySelector("[data-empty-state]");

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function cardMatches(card) {
    var keyword = normalize(searchInput ? searchInput.value : "");
    var region = regionSelect ? regionSelect.value : "";
    var type = typeSelect ? typeSelect.value : "";
    var year = yearSelect ? yearSelect.value : "";
    var text = normalize([
      card.getAttribute("data-title"),
      card.getAttribute("data-region"),
      card.getAttribute("data-type"),
      card.getAttribute("data-year"),
      card.getAttribute("data-tags")
    ].join(" "));
    var okKeyword = !keyword || text.indexOf(keyword) !== -1;
    var okRegion = !region || card.getAttribute("data-region") === region;
    var okType = !type || card.getAttribute("data-type") === type;
    var okYear = !year || card.getAttribute("data-year") === year;
    return okKeyword && okRegion && okType && okYear;
  }

  function filterCards() {
    if (!cards.length) {
      return;
    }
    var visible = 0;
    cards.forEach(function (card) {
      var matched = cardMatches(card);
      card.style.display = matched ? "" : "none";
      if (matched) {
        visible += 1;
      }
    });
    if (emptyState) {
      emptyState.classList.toggle("visible", visible === 0);
    }
  }

  if (searchForm) {
    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      filterCards();
    });
    [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (field) {
      if (field) {
        field.addEventListener("input", filterCards);
        field.addEventListener("change", filterCards);
      }
    });
  }

  window.initPlayer = function (id, src) {
    var wrap = document.getElementById(id);
    if (!wrap) {
      return;
    }
    var video = wrap.querySelector("video");
    var overlay = wrap.querySelector(".play-overlay");
    var button = wrap.querySelector("[data-play]");
    var started = false;
    var hls = null;

    function playVideo() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    function start() {
      if (!video || started) {
        return;
      }
      started = true;
      if (overlay) {
        overlay.classList.add("hidden");
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        playVideo();
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
      } else {
        video.src = src;
        playVideo();
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }
    if (button) {
      button.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        if (!started) {
          start();
        } else {
          playVideo();
        }
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
