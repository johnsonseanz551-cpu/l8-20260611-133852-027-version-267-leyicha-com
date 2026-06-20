(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupImages() {
    document.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('image-missing');
      }, { once: true });
    });
  }

  function setupMenu() {
    var button = document.querySelector('.menu-toggle');
    var menu = document.querySelector('.mobile-menu');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('is-open');
      button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      button.textContent = isOpen ? '×' : '☰';
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }
    function start() {
      stop();
      timer = setInterval(function () {
        show(active + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        clearInterval(timer);
      }
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
      var scope = panel.closest('main') || document;
      var input = panel.querySelector('.filter-input');
      var region = panel.querySelector('.filter-region');
      var year = panel.querySelector('.filter-year');
      var type = panel.querySelector('.filter-type');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
      var noResults = scope.querySelector('.no-results');
      var params = new URLSearchParams(document.location.search);
      var requested = params.get('search') || params.get('q') || '';
      if (input && requested) {
        input.value = requested;
      }
      function normalize(value) {
        return String(value || '').trim().toLowerCase();
      }
      function filter() {
        var keyword = normalize(input && input.value);
        var selectedRegion = normalize(region && region.value);
        var selectedYear = normalize(year && year.value);
        var selectedType = normalize(type && type.value);
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.year,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.tags
          ].join(' '));
          var matched = true;
          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (selectedRegion && normalize(card.dataset.region) !== selectedRegion) {
            matched = false;
          }
          if (selectedYear && normalize(card.dataset.year) !== selectedYear) {
            matched = false;
          }
          if (selectedType && normalize(card.dataset.type) !== selectedType) {
            matched = false;
          }
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });
        if (noResults) {
          noResults.classList.toggle('is-visible', visible === 0);
        }
      }
      [input, region, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener('input', filter);
          control.addEventListener('change', filter);
        }
      });
      filter();
    });
  }

  function setupPlayers() {
    document.querySelectorAll('.video-player').forEach(function (player) {
      var video = player.querySelector('video');
      var overlay = player.querySelector('.play-overlay');
      var stream = player.getAttribute('data-stream');
      var initialized = false;
      function loadStream() {
        if (initialized || !video || !stream) {
          return;
        }
        initialized = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
          var hls = new Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          player.hlsInstance = hls;
        } else {
          video.src = stream;
        }
      }
      function playVideo() {
        loadStream();
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        var playAction = video.play();
        if (playAction && typeof playAction.catch === 'function') {
          playAction.catch(function () {
            if (overlay) {
              overlay.classList.remove('is-hidden');
            }
          });
        }
      }
      if (overlay && video) {
        overlay.addEventListener('click', playVideo);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            playVideo();
          }
        });
        video.addEventListener('play', function () {
          if (overlay) {
            overlay.classList.add('is-hidden');
          }
        });
        video.addEventListener('pause', function () {
          if (overlay && video.currentTime === 0) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    });
  }

  ready(function () {
    setupImages();
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
}());
