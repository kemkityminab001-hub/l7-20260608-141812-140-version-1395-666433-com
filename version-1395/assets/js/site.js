(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var navMenu = document.querySelector('[data-nav-menu]');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            navMenu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startAuto() {
            stopAuto();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 6200);
        }

        function stopAuto() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startAuto();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startAuto();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startAuto();
            });
        });

        hero.addEventListener('mouseenter', stopAuto);
        hero.addEventListener('mouseleave', startAuto);
        showSlide(0);
        startAuto();
    }

    var filterForm = document.querySelector('[data-filter-form]');
    var filterList = document.querySelector('[data-filter-list]');

    if (filterForm && filterList) {
        var items = Array.prototype.slice.call(filterList.querySelectorAll('.search-item'));
        var queryInput = filterForm.querySelector('[data-filter-query]');
        var yearInput = filterForm.querySelector('[data-filter-year]');
        var regionInput = filterForm.querySelector('[data-filter-region]');
        var typeInput = filterForm.querySelector('[data-filter-type]');
        var categoryInput = filterForm.querySelector('[data-filter-category]');
        var countNode = document.querySelector('[data-result-count]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');

        if (queryInput && initialQuery) {
            queryInput.value = initialQuery;
        }

        function textValue(node) {
            return node ? String(node.value || '').trim().toLowerCase() : '';
        }

        function applyFilter() {
            var query = textValue(queryInput);
            var year = textValue(yearInput);
            var region = textValue(regionInput);
            var type = textValue(typeInput);
            var category = textValue(categoryInput);
            var visible = 0;

            items.forEach(function (item) {
                var haystack = [
                    item.dataset.title,
                    item.dataset.region,
                    item.dataset.type,
                    item.dataset.year,
                    item.dataset.tags,
                    item.textContent
                ].join(' ').toLowerCase();
                var matchesQuery = !query || haystack.indexOf(query) !== -1;
                var matchesYear = !year || String(item.dataset.year || '').toLowerCase() === year;
                var matchesRegion = !region || String(item.dataset.region || '').toLowerCase().indexOf(region) !== -1;
                var matchesType = !type || String(item.dataset.type || '').toLowerCase() === type;
                var matchesCategory = !category || String(item.dataset.category || '').toLowerCase() === category;
                var show = matchesQuery && matchesYear && matchesRegion && matchesType && matchesCategory;

                item.classList.toggle('is-hidden', !show);

                if (show) {
                    visible += 1;
                }
            });

            if (countNode) {
                countNode.textContent = '共 ' + visible + ' 部影片';
            }
        }

        ['input', 'change'].forEach(function (eventName) {
            filterForm.addEventListener(eventName, applyFilter);
        });

        applyFilter();
    }

    var scrollPlayer = document.querySelector('[data-scroll-player]');

    if (scrollPlayer) {
        scrollPlayer.addEventListener('click', function (event) {
            event.preventDefault();
            var player = document.querySelector('[data-player]');

            if (player) {
                player.scrollIntoView({ behavior: 'smooth', block: 'center' });
                var button = player.querySelector('[data-play-button]');

                if (button) {
                    window.setTimeout(function () {
                        button.focus();
                    }, 350);
                }
            }
        });
    }
}());
