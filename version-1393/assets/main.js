(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                if (query) {
                    window.location.href = "./search.html?q=" + encodeURIComponent(query);
                }
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
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

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupCardFilters() {
        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var search = scope.querySelector("[data-card-search]");
            var region = scope.querySelector("[data-card-region]");
            var type = scope.querySelector("[data-card-type]");
            var year = scope.querySelector("[data-card-year]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));

            function apply() {
                var query = normalize(search && search.value);
                var regionValue = normalize(region && region.value);
                var typeValue = normalize(type && type.value);
                var yearValue = normalize(year && year.value);

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.genre,
                        card.dataset.tags
                    ].join(" "));
                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesRegion = !regionValue || normalize(card.dataset.region).indexOf(regionValue) !== -1;
                    var matchesType = !typeValue || normalize(card.dataset.type).indexOf(typeValue) !== -1;
                    var matchesYear = !yearValue || normalize(card.dataset.year) === yearValue;
                    card.hidden = !(matchesQuery && matchesRegion && matchesType && matchesYear);
                });
            }

            [search, region, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    }

    function createSearchCard(movie) {
        return "" +
            "<article class=\"movie-card\" data-movie-card>" +
                "<a class=\"movie-poster\" href=\"./" + escapeHtml(movie.file) + "\">" +
                    "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
                    "<span class=\"poster-gradient\"></span>" +
                    "<span class=\"score-pill\">" + escapeHtml(movie.score) + "</span>" +
                "</a>" +
                "<div class=\"movie-card-body\">" +
                    "<div class=\"movie-meta-line\">" +
                        "<span>" + escapeHtml(movie.year) + "</span>" +
                        "<span>" + escapeHtml(movie.region) + "</span>" +
                        "<span>" + escapeHtml(movie.type) + "</span>" +
                    "</div>" +
                    "<h2><a href=\"./" + escapeHtml(movie.file) + "\">" + escapeHtml(movie.title) + "</a></h2>" +
                    "<p>" + escapeHtml(movie.oneLine) + "</p>" +
                    "<div class=\"tag-row\"><span>" + escapeHtml(movie.genre) + "</span></div>" +
                "</div>" +
            "</article>";
    }

    function setupSearchPage() {
        var root = document.querySelector("[data-search-page]");
        if (!root || !window.SITE_MOVIES) {
            return;
        }

        var input = root.querySelector("[data-search-input]");
        var form = root.querySelector("[data-search-page-form]");
        var results = root.querySelector("[data-search-results]");
        var note = root.querySelector("[data-search-note]");
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";

        if (input) {
            input.value = initialQuery;
        }

        function render(query) {
            var words = normalize(query).split(/\s+/).filter(Boolean);
            var matches = window.SITE_MOVIES.filter(function (movie) {
                if (!words.length) {
                    return movie.featured;
                }
                var haystack = normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.tags,
                    movie.oneLine
                ].join(" "));
                return words.every(function (word) {
                    return haystack.indexOf(word) !== -1;
                });
            }).slice(0, 120);

            if (note) {
                note.textContent = words.length ? "搜索结果" : "热门影片";
            }

            if (!results) {
                return;
            }

            if (!matches.length) {
                results.innerHTML = "<div class=\"no-results\">暂无匹配影片</div>";
                return;
            }

            results.innerHTML = matches.map(createSearchCard).join("");
        }

        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var query = input ? input.value.trim() : "";
                var nextUrl = query ? "./search.html?q=" + encodeURIComponent(query) : "./search.html";
                history.replaceState(null, "", nextUrl);
                render(query);
            });
        }

        if (input) {
            input.addEventListener("input", function () {
                render(input.value);
            });
        }

        render(initialQuery);
    }

    function setupMoviePlayer(source) {
        var card = document.querySelector("[data-player]");
        if (!card) {
            return;
        }

        var video = card.querySelector("video");
        var overlay = card.querySelector(".play-overlay");
        var hlsInstance = null;
        var isReady = false;

        function markPlaying() {
            card.classList.add("is-playing");
        }

        function playVideo() {
            if (!video) {
                return;
            }

            markPlaying();

            if (!isReady) {
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    isReady = true;
                    video.play().catch(function () {});
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        isReady = true;
                        video.play().catch(function () {});
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal && hlsInstance) {
                            hlsInstance.destroy();
                            hlsInstance = null;
                            video.src = source;
                            isReady = true;
                        }
                    });
                    return;
                }

                video.src = source;
                isReady = true;
            }

            video.play().catch(function () {});
        }

        if (overlay) {
            overlay.addEventListener("click", playVideo);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    playVideo();
                }
            });
            video.addEventListener("play", markPlaying);
        }
    }

    window.setupMoviePlayer = setupMoviePlayer;

    ready(function () {
        setupNavigation();
        setupHero();
        setupCardFilters();
        setupSearchPage();
    });
})();
