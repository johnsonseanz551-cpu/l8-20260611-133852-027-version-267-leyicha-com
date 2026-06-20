(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-mobile-menu-button]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = selectAll(".hero-slide", slider);
        var dots = selectAll("[data-hero-dot]", slider);
        var index = 0;
        function show(nextIndex) {
            index = nextIndex;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                show((index + 1) % slides.length);
            }, 5200);
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupFilters() {
        selectAll("[data-filter-scope]").forEach(function (scope) {
            var search = scope.querySelector("[data-filter-search]");
            var year = scope.querySelector("[data-filter-year]");
            var type = scope.querySelector("[data-filter-type]");
            var cards = selectAll("[data-filter-grid] .movie-card, [data-filter-grid] .ranking-card", scope);
            var status = scope.querySelector("[data-filter-status]");
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";
            if (search && query) {
                search.value = query;
            }
            function apply() {
                var keyword = normalize(search ? search.value : "");
                var chosenYear = normalize(year ? year.value : "");
                var chosenType = normalize(type ? type.value : "");
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.tags
                    ].join(" "));
                    var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchesYear = !chosenYear || normalize(card.dataset.year) === chosenYear;
                    var matchesType = !chosenType || normalize(card.dataset.type) === chosenType;
                    var ok = matchesKeyword && matchesYear && matchesType;
                    card.classList.toggle("is-hidden", !ok);
                    if (ok) {
                        visible += 1;
                    }
                });
                if (status) {
                    status.textContent = visible > 0 ? "筛选结果已更新" : "暂无匹配影片";
                }
            }
            [search, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    window.initMoviePlayer = function (movieUrl) {
        var video = document.getElementById("movie-video");
        var overlay = document.getElementById("play-cover");
        var attached = false;
        var hlsInstance = null;
        if (!video || !movieUrl) {
            return;
        }
        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = movieUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(movieUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = movieUrl;
            }
        }
        function play() {
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }
        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        video.addEventListener("pause", function () {
            if (video.currentTime === 0 && overlay) {
                overlay.classList.remove("is-hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
    });
}());
