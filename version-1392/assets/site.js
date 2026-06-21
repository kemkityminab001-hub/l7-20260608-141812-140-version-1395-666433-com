(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var navToggle = document.querySelector("[data-nav-toggle]");
        var navMenu = document.querySelector("[data-nav-menu]");

        if (navToggle && navMenu) {
            navToggle.addEventListener("click", function () {
                navMenu.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, idx) {
                    slide.classList.toggle("active", idx === current);
                });
                dots.forEach(function (dot, idx) {
                    dot.classList.toggle("active", idx === current);
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
                }
            }

            dots.forEach(function (dot, idx) {
                dot.addEventListener("click", function () {
                    show(idx);
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

        var filterInput = document.querySelector("[data-local-filter]");
        var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-type]"));
        var sortButtons = Array.prototype.slice.call(document.querySelectorAll("[data-sort]"));
        var grid = document.querySelector("[data-card-grid]");

        function applyFilter() {
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
            var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
            var activeTypeButton = document.querySelector("[data-filter-type].active");
            var type = activeTypeButton ? activeTypeButton.getAttribute("data-filter-type") : "all";

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-summary") || ""
                ].join(" ").toLowerCase();
                var itemType = card.getAttribute("data-type") || "";
                var okKeyword = !keyword || text.indexOf(keyword) !== -1;
                var okType = type === "all" || itemType === type;
                card.style.display = okKeyword && okType ? "" : "none";
            });
        }

        if (filterInput) {
            filterInput.addEventListener("input", applyFilter);
        }

        filterButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                filterButtons.forEach(function (item) {
                    item.classList.remove("active");
                });
                button.classList.add("active");
                applyFilter();
            });
        });

        sortButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                if (!grid) {
                    return;
                }
                var mode = button.getAttribute("data-sort");
                var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
                cards.sort(function (a, b) {
                    var av = Number(a.getAttribute(mode === "views" ? "data-views" : "data-year"));
                    var bv = Number(b.getAttribute(mode === "views" ? "data-views" : "data-year"));
                    return bv - av;
                });
                cards.forEach(function (card) {
                    grid.appendChild(card);
                });
                sortButtons.forEach(function (item) {
                    item.classList.remove("active");
                });
                button.classList.add("active");
                applyFilter();
            });
        });

        var searchData = document.getElementById("search-data");
        var searchResults = document.querySelector("[data-search-results]");
        var searchInput = document.querySelector("[data-search-input]");
        var searchNote = document.querySelector("[data-search-note]");

        if (searchData && searchResults) {
            var items = [];
            try {
                items = JSON.parse(searchData.textContent || "[]");
            } catch (err) {
                items = [];
            }

            var params = new URLSearchParams(window.location.search);
            var q = params.get("q") || "";
            if (searchInput) {
                searchInput.value = q;
            }

            function render(term) {
                var key = term.trim().toLowerCase();
                var matched = items.filter(function (item) {
                    var bag = [item.title, item.oneLine, item.summary, item.tags, item.region, item.type, item.genre].join(" ").toLowerCase();
                    return key && bag.indexOf(key) !== -1;
                }).slice(0, 120);

                searchResults.innerHTML = "";

                if (searchNote) {
                    searchNote.textContent = key ? "找到 " + matched.length + " 个相关内容" : "请输入关键词后检索片库内容";
                }

                if (!key) {
                    searchResults.innerHTML = '<div class="empty-state">输入片名、地区、类型或标签进行检索。</div>';
                    return;
                }

                if (!matched.length) {
                    searchResults.innerHTML = '<div class="empty-state">没有找到匹配内容，可尝试更换关键词。</div>';
                    return;
                }

                matched.forEach(function (item) {
                    var card = document.createElement("article");
                    card.className = "movie-card";
                    card.innerHTML = '' +
                        '<a class="poster" href="./' + item.file + '">' +
                        '<img src="./' + item.cover + '.jpg" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                        '<span class="play-badge">▶</span>' +
                        '<span class="duration">' + escapeHtml(item.duration) + '</span>' +
                        '</a>' +
                        '<div class="card-body">' +
                        '<h2><a href="./' + item.file + '">' + escapeHtml(item.title) + '</a></h2>' +
                        '<p>' + escapeHtml(item.oneLine) + '</p>' +
                        '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><a href="./' + item.categorySlug + '.html">' + escapeHtml(item.categoryName) + '</a></div>' +
                        '</div>';
                    searchResults.appendChild(card);
                });
            }

            function escapeHtml(value) {
                return String(value).replace(/[&<>"']/g, function (char) {
                    return {
                        "&": "&amp;",
                        "<": "&lt;",
                        ">": "&gt;",
                        '"': "&quot;",
                        "'": "&#39;"
                    }[char];
                });
            }

            if (searchInput) {
                searchInput.addEventListener("input", function () {
                    render(searchInput.value);
                });
            }

            render(q);
        }
    });
})();
