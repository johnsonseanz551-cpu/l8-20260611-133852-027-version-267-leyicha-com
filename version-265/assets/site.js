(function () {
    var navButton = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (navButton && mobileNav) {
        navButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    document.querySelectorAll('.hero-carousel').forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    document.querySelectorAll('[data-movie-filter]').forEach(function (form) {
        var scopeSelector = form.getAttribute('data-movie-filter');
        var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
        var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll('.movie-card')) : [];
        var input = form.querySelector('[data-filter-input]');
        var region = form.querySelector('[data-filter-region]');
        var year = form.querySelector('[data-filter-year]');
        var empty = document.querySelector(form.getAttribute('data-empty-target') || '');

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            var keyword = normalize(input && input.value);
            var regionValue = normalize(region && region.value);
            var yearValue = normalize(year && year.value);
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var cardRegion = normalize(card.getAttribute('data-region'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var matched = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (regionValue && cardRegion.indexOf(regionValue) === -1) {
                    matched = false;
                }
                if (yearValue && cardYear !== yearValue) {
                    matched = false;
                }

                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('show', visible === 0);
            }
        }

        [input, region, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    });
})();
