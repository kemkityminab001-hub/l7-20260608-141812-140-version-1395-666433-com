(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var button = document.querySelector(".mobile-menu-button");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHeaderSearch() {
    var forms = document.querySelectorAll("form[action='./search.html']");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          input && input.focus();
        }
      });
    });
  }

  function initHeroCarousel() {
    var carousel = document.querySelector("[data-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dots button"));
    var previous = carousel.querySelector(".hero-prev");
    var next = carousel.querySelector(".hero-next");
    var active = Math.max(0, slides.findIndex(function (slide) {
      return slide.classList.contains("is-active");
    }));
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    if (previous) {
      previous.addEventListener("click", function () {
        show(active - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        restart();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });
    show(active);
    restart();
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var list = document.querySelector("[data-filter-list]");
    if (!panel || !list) {
      return;
    }
    var keyword = panel.querySelector("[data-filter-keyword]");
    var year = panel.querySelector("[data-filter-year]");
    var type = panel.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

    function apply() {
      var query = keyword ? keyword.value.trim().toLowerCase() : "";
      var selectedYear = year ? year.value : "";
      var selectedType = type ? type.value : "";
      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-category")
        ].join(" ").toLowerCase();
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchYear = !selectedYear || card.getAttribute("data-year") === selectedYear;
        var matchType = !selectedType || card.getAttribute("data-type") === selectedType;
        card.style.display = matchQuery && matchYear && matchType ? "" : "none";
      });
    }

    [keyword, year, type].forEach(function (item) {
      if (item) {
        item.addEventListener("input", apply);
        item.addEventListener("change", apply);
      }
    });
  }

  function createSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
      "<a href=\"" + escapeAttribute(movie.url) + "\" aria-label=\"" + escapeAttribute(movie.title) + " 在线观看\">" +
      "<div class=\"movie-thumb\">" +
      "<img src=\"" + escapeAttribute(movie.poster) + "\" alt=\"" + escapeAttribute(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"movie-play\">▶</span>" +
      "</div>" +
      "<div class=\"movie-card-body\">" +
      "<h3>" + escapeHtml(movie.title) + "</h3>" +
      "<p class=\"movie-card-desc\">" + escapeHtml(movie.description || "") + "</p>" +
      "<div class=\"movie-meta\"><span>" + escapeHtml(movie.year || "") + "</span><span>" + escapeHtml(movie.type || "") + "</span><span>" + escapeHtml(movie.category || "") + "</span></div>" +
      "<div class=\"movie-tags\">" + tags + "</div>" +
      "</div>" +
      "</a>" +
      "</article>";
  }

  function initSearchPage() {
    var results = document.getElementById("searchResults");
    var summary = document.getElementById("searchSummary");
    var input = document.getElementById("siteSearchInput");
    if (!results || typeof SITE_SEARCH_DATA === "undefined") {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (input) {
      input.value = query;
      input.addEventListener("input", function () {
        render(input.value);
      });
    }
    render(query);

    function render(value) {
      var q = (value || "").trim().toLowerCase();
      var data = SITE_SEARCH_DATA;
      var matched = q ? data.filter(function (movie) {
        var text = [
          movie.title,
          movie.year,
          movie.type,
          movie.genre,
          movie.category,
          movie.description,
          (movie.tags || []).join(" ")
        ].join(" ").toLowerCase();
        return text.indexOf(q) !== -1;
      }) : data.slice(0, 24);
      var visible = matched.slice(0, 80);
      if (summary) {
        summary.textContent = q ? "与“" + value.trim() + "”相关的影片" : "推荐影片";
      }
      if (!visible.length) {
        results.innerHTML = "<div class=\"empty-results\">未找到相关影片</div>";
        return;
      }
      results.innerHTML = visible.map(createSearchCard).join("");
    }
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, function (match) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[match];
    });
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/'/g, "&#39;");
  }

  function initPlayer() {
    var video = document.getElementById("moviePlayer");
    var overlay = document.querySelector(".player-overlay");
    if (!video || typeof PLAYER_CONFIG === "undefined" || !PLAYER_CONFIG.url) {
      return;
    }
    var started = false;
    var hlsInstance = null;

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    function start() {
      if (!started) {
        started = true;
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = PLAYER_CONFIG.url;
          playVideo();
        } else if (window.Hls && Hls.isSupported()) {
          hlsInstance = new Hls();
          hlsInstance.loadSource(PLAYER_CONFIG.url);
          hlsInstance.attachMedia(video);
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
          });
        } else {
          video.src = PLAYER_CONFIG.url;
          playVideo();
        }
      } else {
        playVideo();
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (!started) {
        start();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    initMobileMenu();
    initHeaderSearch();
    initHeroCarousel();
    initFilters();
    initSearchPage();
    initPlayer();
  });
})();
