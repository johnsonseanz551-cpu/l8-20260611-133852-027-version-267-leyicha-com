(function () {
    var header = document.querySelector('[data-site-header]');
    var toggle = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 20) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;

        function showHero(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        window.setInterval(function () {
            showHero(index + 1);
        }, 5200);
    }

    function getQueryValue(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || '';
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applyFilter(input) {
        var list = document.querySelector('.js-card-list');
        var empty = document.querySelector('[data-filter-empty]');
        if (!list || !input) {
            return;
        }
        var value = normalize(input.value);
        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-search]'));
        var visible = 0;
        cards.forEach(function (card) {
            var haystack = normalize(card.getAttribute('data-search'));
            var matched = !value || haystack.indexOf(value) !== -1;
            card.classList.toggle('is-hidden-by-filter', !matched);
            if (matched) {
                visible += 1;
            }
        });
        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    }

    var filterInput = document.querySelector('.js-filter-input');
    if (filterInput) {
        var query = getQueryValue('q');
        if (query) {
            filterInput.value = query;
        }
        applyFilter(filterInput);
        filterInput.addEventListener('input', function () {
            applyFilter(filterInput);
        });
    }
})();
