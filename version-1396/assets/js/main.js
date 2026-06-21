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
        var navLinks = document.querySelector("[data-nav-links]");

        if (menuButton && navLinks) {
            menuButton.addEventListener("click", function () {
                navLinks.classList.toggle("is-open");
            });
        }

        var carousel = document.querySelector("[data-hero-carousel]");
        if (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
            var index = 0;

            function showSlide(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, position) {
                    slide.classList.toggle("is-active", position === index);
                });
                dots.forEach(function (dot, position) {
                    dot.classList.toggle("is-active", position === index);
                });
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                });
            });

            window.setInterval(function () {
                showSlide(index + 1);
            }, 6200);
        }

        var params = new URLSearchParams(window.location.search);
        var queryValue = params.get("q") || "";
        var input = document.querySelector(".movie-filter-input");
        var typeSelect = document.querySelector(".movie-type-filter");
        var yearSelect = document.querySelector(".movie-year-filter");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".filterable-grid .movie-card"));

        if (input && queryValue) {
            input.value = queryValue;
        }

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function applyFilters() {
            if (!cards.length) {
                return;
            }
            var q = normalize(input ? input.value : "");
            var type = normalize(typeSelect ? typeSelect.value : "");
            var year = normalize(yearSelect ? yearSelect.value : "");

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-genre"),
                    card.textContent
                ].join(" "));
                var cardType = normalize(card.getAttribute("data-type"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var matchedQuery = !q || haystack.indexOf(q) !== -1;
                var matchedType = !type || cardType.indexOf(type) !== -1;
                var matchedYear = !year || cardYear.indexOf(year) !== -1;
                card.classList.toggle("is-hidden", !(matchedQuery && matchedType && matchedYear));
            });
        }

        if (input) {
            input.addEventListener("input", applyFilters);
        }
        if (typeSelect) {
            typeSelect.addEventListener("change", applyFilters);
        }
        if (yearSelect) {
            yearSelect.addEventListener("change", applyFilters);
        }
        applyFilters();
    });

    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById("movie-video");
        var overlay = document.getElementById("movie-play-overlay");
        var attached = false;

        if (!video || !overlay || !streamUrl) {
            return;
        }

        function attach() {
            if (attached) {
                return;
            }
            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function play() {
            attach();
            overlay.classList.add("is-hidden");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    overlay.classList.remove("is-hidden");
                });
            }
        }

        overlay.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            overlay.classList.add("is-hidden");
        });
        video.addEventListener("pause", function () {
            if (!video.ended) {
                overlay.classList.remove("is-hidden");
            }
        });
    };
})();
