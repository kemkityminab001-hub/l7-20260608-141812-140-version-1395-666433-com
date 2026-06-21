(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var previous = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var activeIndex = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(activeIndex + 1);
      }, 5000);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        show(activeIndex - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(activeIndex + 1);
        restart();
      });
    }

    restart();
  });

  document.querySelectorAll('.rail-shell').forEach(function (shell) {
    var rail = shell.querySelector('[data-rail]');
    var left = shell.querySelector('[data-rail-left]');
    var right = shell.querySelector('[data-rail-right]');

    if (!rail) {
      return;
    }

    if (left) {
      left.addEventListener('click', function () {
        rail.scrollBy({ left: -420, behavior: 'smooth' });
      });
    }

    if (right) {
      right.addEventListener('click', function () {
        rail.scrollBy({ left: 420, behavior: 'smooth' });
      });
    }
  });

  document.querySelectorAll('[data-filter-grid]').forEach(function (grid) {
    var panel = grid.previousElementSibling;
    var input = panel ? panel.querySelector('[data-filter-input]') : null;
    var select = panel ? panel.querySelector('[data-filter-select]') : null;
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var category = select ? select.value.trim().toLowerCase() : '';

      cards.forEach(function (card) {
        var search = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
        var matchesQuery = !query || search.indexOf(query) !== -1;
        var matchesCategory = !category || search.indexOf(category) !== -1;
        card.hidden = !(matchesQuery && matchesCategory);
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (select) {
      select.addEventListener('change', applyFilter);
    }
  });

  var results = document.querySelector('[data-search-results]');
  var searchInput = document.querySelector('[data-search-input]');

  if (results && window.MOVIE_SEARCH_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (searchInput) {
      searchInput.value = query;
    }

    renderSearchResults(query);
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderSearchResults(query) {
    var normalized = String(query || '').trim().toLowerCase();

    if (!normalized) {
      results.innerHTML = '';
      return;
    }

    var items = window.MOVIE_SEARCH_INDEX.filter(function (item) {
      return item.search.indexOf(normalized) !== -1;
    }).slice(0, 120);

    results.innerHTML = items.map(function (item) {
      return [
        '<a class="movie-card" href="./' + escapeHtml(item.file) + '" data-card>',
        '  <span class="poster-wrap">',
        '    <img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '    <span class="poster-gradient"></span>',
        '    <span class="play-ring">▶</span>',
        '    <span class="year-badge">' + escapeHtml(item.year) + '</span>',
        '    <span class="poster-title">',
        '      <strong>' + escapeHtml(item.title) + '</strong>',
        '      <em>' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</em>',
        '    </span>',
        '  </span>',
        '  <span class="card-body">',
        '    <span class="card-meta"><b>' + escapeHtml(item.category) + '</b><i>' + escapeHtml(item.genre) + '</i></span>',
        '    <span class="card-title">' + escapeHtml(item.title) + '</span>',
        '    <span class="card-desc">' + escapeHtml(item.oneLine) + '</span>',
        '  </span>',
        '</a>'
      ].join('\n');
    }).join('\n');
  }
})();
