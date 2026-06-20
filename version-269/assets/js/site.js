(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-site-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      var target = './rank.html';

      if (value) {
        target += '?q=' + encodeURIComponent(value);
      }

      window.location.href = target;
    });
  });

  document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

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
      }, 5600);
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

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-form]').forEach(function (form) {
    var scope = form.closest('main') || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
    var keywordInput = form.querySelector('[data-filter-input]');
    var yearSelect = form.querySelector('[data-filter-year]');
    var state = form.querySelector('[data-filter-state]');
    var params = new URLSearchParams(window.location.search);
    var initialKeyword = params.get('q') || '';

    if (keywordInput && initialKeyword) {
      keywordInput.value = initialKeyword;
    }

    function matchYear(cardYear, selectedYear) {
      if (!selectedYear) {
        return true;
      }

      if (selectedYear === '2010') {
        return Number(cardYear) >= 2010 && Number(cardYear) < 2020;
      }

      if (selectedYear === '2000') {
        return Number(cardYear) >= 2000 && Number(cardYear) < 2010;
      }

      return String(cardYear).indexOf(selectedYear) !== -1;
    }

    function applyFilter() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      var selectedYear = yearSelect ? yearSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var matched = (!keyword || haystack.indexOf(keyword) !== -1) && matchYear(cardYear, selectedYear);
        card.classList.toggle('is-hidden', !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (state) {
        state.textContent = visible > 0 ? '片单已更新' : '没有匹配内容';
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });

    if (keywordInput) {
      keywordInput.addEventListener('input', applyFilter);
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }

    applyFilter();
  });
})();
