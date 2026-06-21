document.addEventListener("DOMContentLoaded", function () {
  setupMobileMenu();
  setupHeroSlider();
  setupSearch();
  setupFilters();
  setupPlayer();
});

function setupMobileMenu() {
  var button = document.querySelector("[data-menu-button]");
  var menu = document.querySelector("[data-mobile-nav]");
  if (!button || !menu) {
    return;
  }
  button.addEventListener("click", function () {
    menu.classList.toggle("open");
  });
}

function setupHeroSlider() {
  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  if (!slides.length || !dots.length) {
    return;
  }
  var index = 0;
  var timer;
  function show(next) {
    index = (next + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("active", i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === index);
    });
  }
  function autoplay() {
    timer = setInterval(function () {
      show(index + 1);
    }, 5200);
  }
  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      clearInterval(timer);
      show(i);
      autoplay();
    });
  });
  show(0);
  autoplay();
}

function setupSearch() {
  var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
  if (!inputs.length || !window.siteSearchIndex) {
    return;
  }
  inputs.forEach(function (input) {
    var container = input.parentElement.querySelector("[data-search-results]") || document.querySelector("[data-search-results]");
    if (!container) {
      return;
    }
    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      if (!query) {
        container.classList.remove("active");
        container.innerHTML = "";
        return;
      }
      var result = window.siteSearchIndex.filter(function (item) {
        return item.title.toLowerCase().indexOf(query) > -1 || item.oneLine.toLowerCase().indexOf(query) > -1 || item.tags.toLowerCase().indexOf(query) > -1 || item.genre.toLowerCase().indexOf(query) > -1;
      }).slice(0, 10);
      if (!result.length) {
        container.innerHTML = '<div class="search-result-item"><span>未找到相关影片</span></div>';
        container.classList.add("active");
        return;
      }
      container.innerHTML = result.map(function (item) {
        return '<a class="search-result-item" href="' + item.url + '"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '"><span><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.genre) + '</span><span>' + escapeHtml(item.oneLine) + '</span></span></a>';
      }).join("");
      container.classList.add("active");
    });
  });
  document.addEventListener("click", function (event) {
    if (!event.target.closest(".nav-search") && !event.target.closest(".hero-search")) {
      document.querySelectorAll("[data-search-results]").forEach(function (item) {
        item.classList.remove("active");
      });
    }
  });
}

function setupFilters() {
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
  var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-button]"));
  var input = document.querySelector("[data-page-filter]");
  var empty = document.querySelector("[data-empty]");
  if (!cards.length) {
    return;
  }
  var activeFilter = "all";
  var query = "";
  function apply() {
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = [card.getAttribute("data-title"), card.getAttribute("data-year"), card.getAttribute("data-region"), card.getAttribute("data-genre"), card.getAttribute("data-tags")].join(" ").toLowerCase();
      var matchQuery = !query || haystack.indexOf(query) > -1;
      var matchFilter = activeFilter === "all" || haystack.indexOf(activeFilter) > -1;
      var show = matchQuery && matchFilter;
      card.style.display = show ? "" : "none";
      if (show) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle("active", visible === 0);
    }
  }
  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      buttons.forEach(function (other) {
        other.classList.remove("active");
      });
      button.classList.add("active");
      activeFilter = (button.getAttribute("data-filter-button") || "all").toLowerCase();
      apply();
    });
  });
  if (input) {
    input.addEventListener("input", function () {
      query = input.value.trim().toLowerCase();
      apply();
    });
  }
}

function setupPlayer() {
  var video = document.querySelector("[data-video-url]");
  if (!video) {
    return;
  }
  var src = video.getAttribute("data-video-url");
  var overlay = document.querySelector("[data-player-overlay]");
  if (!src) {
    return;
  }
  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = src;
  } else if (window.Hls && window.Hls.isSupported()) {
    var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
    hls.loadSource(src);
    hls.attachMedia(video);
  } else {
    video.src = src;
  }
  function start() {
    if (overlay) {
      overlay.classList.add("hidden");
    }
    video.controls = true;
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }
  if (overlay) {
    overlay.addEventListener("click", start);
  }
  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, function (char) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;"
    }[char];
  });
}
