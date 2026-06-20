(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initNavigation() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.site-nav');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    if (!slides.length) {
      return;
    }

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    var hero = document.querySelector('.hero-stage');
    if (hero) {
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
    }

    show(0);
    start();
  }

  function initSearchAndFilters() {
    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.js-search'));

    searchInputs.forEach(function (input) {
      var panel = input.closest('.search-panel') || document;
      var scope = panel.parentElement || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
      var countNode = scope.querySelector('[data-result-count]');
      var filterButtons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-value]'));
      var activeFilter = 'all';

      function apply() {
        var keyword = normalize(input.value);
        var visible = 0;

        cards.forEach(function (card) {
          var searchable = normalize(card.getAttribute('data-search'));
          var matchKeyword = !keyword || searchable.indexOf(keyword) !== -1;
          var matchFilter = activeFilter === 'all' || searchable.indexOf(normalize(activeFilter)) !== -1;
          var shouldShow = matchKeyword && matchFilter;

          card.classList.toggle('is-hidden-card', !shouldShow);
          if (shouldShow) {
            visible += 1;
          }
        });

        if (countNode) {
          countNode.textContent = '当前显示 ' + visible + ' 部影片';
        }
      }

      filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          filterButtons.forEach(function (item) {
            item.classList.remove('is-active');
          });
          button.classList.add('is-active');
          activeFilter = button.getAttribute('data-filter-value') || 'all';
          apply();
        });
      });

      input.addEventListener('input', apply);

      var query = new URLSearchParams(window.location.search).get('q');
      if (query && input.value === '') {
        input.value = query;
      }

      apply();
    });
  }

  function initImageFallbacks() {
    var images = Array.prototype.slice.call(document.querySelectorAll('.poster img, .category-covers img, .category-large-images img, .rank-list-item img'));

    images.forEach(function (image) {
      image.addEventListener('error', function () {
        var poster = image.closest('.poster');
        if (poster) {
          poster.classList.add('poster-fallback');
        }
        image.remove();
      }, { once: true });
    });
  }

  ready(function () {
    initNavigation();
    initHero();
    initSearchAndFilters();
    initImageFallbacks();
  });
}());
