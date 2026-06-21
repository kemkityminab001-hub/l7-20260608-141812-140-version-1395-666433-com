(function () {
  const HLS_SCRIPT = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function uniqueSorted(values) {
    return Array.from(new Set(values.filter(Boolean))).sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-Hans-CN');
    });
  }

  function initMobileMenu() {
    const button = qs('[data-menu-toggle]');
    const menu = qs('[data-mobile-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      const open = menu.classList.toggle('open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      button.textContent = open ? '×' : '☰';
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }

    values.forEach(function (value) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initFilters() {
    qsa('[data-filter-scope]').forEach(function (scope) {
      const list = scope.parentElement.querySelector('[data-filter-list]');
      const cards = qsa('[data-movie-card]', list || document);
      const keyword = qs('[data-filter-keyword]', scope);
      const region = qs('[data-filter-region]', scope);
      const year = qs('[data-filter-year]', scope);
      const result = qs('[data-filter-result]', scope);

      fillSelect(region, uniqueSorted(cards.map(function (card) {
        return card.dataset.region;
      })));

      fillSelect(year, uniqueSorted(cards.map(function (card) {
        return card.dataset.year;
      })));

      const params = new URLSearchParams(window.location.search);
      const initialKeyword = params.get('q');
      if (initialKeyword && keyword) {
        keyword.value = initialKeyword;
      }

      function apply() {
        const word = normalize(keyword && keyword.value);
        const selectedRegion = normalize(region && region.value);
        const selectedYear = normalize(year && year.value);
        let visible = 0;

        cards.forEach(function (card) {
          const text = normalize(card.dataset.search);
          const cardRegion = normalize(card.dataset.region);
          const cardYear = normalize(card.dataset.year);
          const ok = (!word || text.indexOf(word) !== -1) &&
            (!selectedRegion || cardRegion === selectedRegion) &&
            (!selectedYear || cardYear === selectedYear);

          card.classList.toggle('is-hidden', !ok);
          if (ok) {
            visible += 1;
          }
        });

        if (result) {
          result.textContent = '当前显示 ' + visible + ' 部';
        }
      }

      ['input', 'change'].forEach(function (eventName) {
        if (keyword) {
          keyword.addEventListener(eventName, apply);
        }
        if (region) {
          region.addEventListener(eventName, apply);
        }
        if (year) {
          year.addEventListener(eventName, apply);
        }
      });

      apply();
    });
  }

  let hlsLoadingPromise = null;

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsLoadingPromise) {
      return hlsLoadingPromise;
    }

    hlsLoadingPromise = new Promise(function (resolve, reject) {
      const script = document.createElement('script');
      script.src = HLS_SCRIPT;
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = function () {
        reject(new Error('HLS library failed to load'));
      };
      document.head.appendChild(script);
    });

    return hlsLoadingPromise;
  }

  function setStatus(video, message) {
    const shell = video.closest('.video-shell');
    const status = shell ? qs('[data-player-status]', shell) : null;
    if (status) {
      status.textContent = message || '';
    }
  }

  function attachVideoSource(video) {
    const src = video.dataset.src;

    if (!src) {
      setStatus(video, '暂无可用播放源');
      return Promise.reject(new Error('Missing video source'));
    }

    if (video.dataset.ready === 'true') {
      return Promise.resolve();
    }

    setStatus(video, '正在加载播放源...');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.dataset.ready = 'true';
      setStatus(video, '播放源已就绪');
      return Promise.resolve();
    }

    return loadHlsLibrary().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        if (video._hls) {
          video._hls.destroy();
        }

        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 60
        });

        hls.loadSource(src);
        hls.attachMedia(video);
        video._hls = hls;
        video.dataset.ready = 'true';
        setStatus(video, '播放源已就绪');
        return;
      }

      video.src = src;
      video.dataset.ready = 'true';
      setStatus(video, '已尝试使用浏览器原生播放');
    }).catch(function () {
      video.src = src;
      video.dataset.ready = 'true';
      setStatus(video, '已切换为原生播放模式');
    });
  }

  function playVideo(video) {
    return attachVideoSource(video).then(function () {
      return video.play().catch(function () {
        setStatus(video, '请点击播放器继续播放');
      });
    });
  }

  function initPlayers() {
    qsa('video[data-src]').forEach(function (video) {
      const shell = video.closest('.video-shell');
      const overlay = shell ? qs('[data-play-button]', shell) : null;

      if (overlay) {
        overlay.addEventListener('click', function () {
          overlay.classList.add('hidden');
          playVideo(video);
        });
      }

      video.addEventListener('click', function () {
        if (video.dataset.ready !== 'true') {
          if (overlay) {
            overlay.classList.add('hidden');
          }
          playVideo(video);
        }
      });

      video.addEventListener('play', function () {
        if (video.dataset.ready !== 'true') {
          if (overlay) {
            overlay.classList.add('hidden');
          }
          playVideo(video);
        }
      });

      video.addEventListener('error', function () {
        setStatus(video, '播放源加载异常，可刷新或稍后重试');
      });
    });

    qsa('a[data-play-button]').forEach(function (link) {
      link.addEventListener('click', function () {
        const id = link.getAttribute('data-play-button');
        const video = document.getElementById(id);
        const shell = video && video.closest('.video-shell');
        const overlay = shell ? qs('[data-play-button]', shell) : null;

        if (overlay) {
          overlay.classList.add('hidden');
        }

        if (video) {
          playVideo(video);
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initFilters();
    initPlayers();
  });
}());
