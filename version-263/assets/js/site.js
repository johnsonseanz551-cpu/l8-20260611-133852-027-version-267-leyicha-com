(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMobileNav() {
        var button = $('[data-mobile-toggle]');
        var nav = $('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
            button.setAttribute('aria-expanded', nav.classList.contains('is-open') ? 'true' : 'false');
        });
    }

    function initHeaderSearch() {
        $all('[data-site-search]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = form.querySelector('input[name="q"]');
                var value = input ? input.value.trim() : '';
                if (value) {
                    window.location.href = './search.html?q=' + encodeURIComponent(value);
                } else {
                    window.location.href = './search.html';
                }
            });
        });
    }

    function initHero() {
        var root = $('[data-hero-slider]');
        if (!root) {
            return;
        }
        var slides = $all('[data-hero-slide]', root);
        var dots = $all('[data-hero-dot]', root);
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;
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
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function initSearchFilters() {
        var panel = $('[data-filter-panel]');
        var grid = $('[data-filter-grid]');
        if (!panel || !grid) {
            return;
        }
        var input = $('[data-filter-keyword]', panel);
        var type = $('[data-filter-type]', panel);
        var year = $('[data-filter-year]', panel);
        var cards = $all('[data-movie-card]', grid);
        var empty = $('[data-no-results]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        if (input && initialQuery) {
            input.value = initialQuery;
        }
        function apply() {
            var query = normalize(input && input.value);
            var selectedType = normalize(type && type.value);
            var selectedYear = normalize(year && year.value);
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search') || card.textContent);
                var cardType = normalize(card.getAttribute('data-type'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var ok = true;
                if (query && text.indexOf(query) === -1) {
                    ok = false;
                }
                if (selectedType && selectedType !== cardType) {
                    ok = false;
                }
                if (selectedYear && selectedYear !== cardYear) {
                    ok = false;
                }
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        }
        [input, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    }

    function initPlayer() {
        var video = $('[data-player-video]');
        var source = window.__MOVIE_SOURCE__;
        if (!video || !source) {
            return;
        }
        var poster = $('[data-player-poster]');
        var playButton = $('[data-player-button]');
        var hlsInstance = null;
        function bindSource() {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (video.getAttribute('src') !== source) {
                    video.setAttribute('src', source);
                }
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                if (!hlsInstance) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                }
                return;
            }
            if (video.getAttribute('src') !== source) {
                video.setAttribute('src', source);
            }
        }
        function startPlayback() {
            bindSource();
            if (poster) {
                poster.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }
        if (playButton) {
            playButton.addEventListener('click', startPlayback);
        }
        if (poster) {
            poster.addEventListener('click', startPlayback);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            } else {
                video.pause();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileNav();
        initHeaderSearch();
        initHero();
        initSearchFilters();
        initPlayer();
    });
})();
