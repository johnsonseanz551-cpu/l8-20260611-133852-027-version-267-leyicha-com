(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-site-nav]");
    if (menuButton && nav) {
      menuButton.addEventListener("click", function () {
        nav.classList.toggle("open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer = null;

      function showSlide(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === current);
        });
      }

      function startHero() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showSlide(index);
          startHero();
        });
      });

      if (slides.length > 1) {
        startHero();
      }
    }

    var filterBars = Array.prototype.slice.call(document.querySelectorAll("[data-filter-bar]"));
    filterBars.forEach(function (bar) {
      var input = bar.querySelector("[data-filter-input]");
      var select = bar.querySelector("[data-year-filter]");
      var grid = document.querySelector("[data-filter-grid]");
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
      function applyFilter() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var year = select ? select.value : "";
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-title") || "").toLowerCase();
          var cardYear = card.getAttribute("data-year") || "";
          var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchedYear = !year || cardYear === year;
          card.classList.toggle("hidden-by-filter", !(matchedKeyword && matchedYear));
        });
      }
      if (input) {
        input.addEventListener("input", applyFilter);
      }
      if (select) {
        select.addEventListener("change", applyFilter);
      }
    });

    var searchInput = document.getElementById("site-search-input");
    var searchButton = document.getElementById("site-search-button");
    var searchResults = document.getElementById("search-results");
    var searchHeading = document.getElementById("search-heading");

    function renderSearch() {
      if (!searchInput || !searchResults || !Array.isArray(window.searchItems || searchItems)) {
        return;
      }
      var items = window.searchItems || searchItems;
      var keyword = searchInput.value.trim().toLowerCase();
      var filtered = items.filter(function (item) {
        var source = [item.title, item.year, item.region, item.category, item.genre, item.oneLine, (item.tags || []).join(" ")].join(" ").toLowerCase();
        return !keyword || source.indexOf(keyword) !== -1;
      }).slice(0, 120);
      if (searchHeading) {
        searchHeading.textContent = keyword ? "搜索结果" : "热门影片";
      }
      if (!filtered.length) {
        searchResults.innerHTML = "<div class=\"article-card\"><h2>暂无符合条件的影片</h2><p>可以尝试更换影片名、地区、年份或题材关键词。</p></div>";
        return;
      }
      searchResults.innerHTML = filtered.map(function (item) {
        var tags = (item.tags || []).slice(0, 3).map(function (tag) {
          return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\">" +
          "<a class=\"movie-cover\" href=\"" + escapeAttribute(item.url) + "\">" +
          "<img class=\"card-cover\" src=\"" + escapeAttribute(item.cover) + "\" alt=\"" + escapeAttribute(item.title) + "\" loading=\"lazy\">" +
          "<span class=\"movie-badge\">" + escapeHtml(String(item.year)) + "</span>" +
          "<span class=\"movie-type\">" + escapeHtml(item.category) + "</span>" +
          "</a>" +
          "<div class=\"movie-info\">" +
          "<h2><a href=\"" + escapeAttribute(item.url) + "\">" + escapeHtml(item.title) + "</a></h2>" +
          "<p>" + escapeHtml(item.oneLine) + "</p>" +
          "<div class=\"movie-meta\"><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.genre) + "</span></div>" +
          "<div class=\"tag-row\">" + tags + "</div>" +
          "</div>" +
          "</article>";
      }).join("");
    }

    function escapeHtml(value) {
      return String(value || "").replace(/[&<>]/g, function (char) {
        return {"&": "&amp;", "<": "&lt;", ">": "&gt;"}[char];
      });
    }

    function escapeAttribute(value) {
      return escapeHtml(value).replace(/"/g, "&quot;");
    }

    if (searchInput && searchButton && searchResults) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";
      if (query) {
        searchInput.value = query;
        renderSearch();
      }
      searchButton.addEventListener("click", renderSearch);
      searchInput.addEventListener("input", renderSearch);
      searchInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          renderSearch();
        }
      });
    }
  });
})();
