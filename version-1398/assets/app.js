(function() {
    var body = document.body;
    var menuToggle = document.querySelector('[data-menu-toggle]');
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            body.classList.toggle('menu-open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        dots.forEach(function(dot, dotIndex) {
            dot.addEventListener('click', function() {
                showSlide(dotIndex);
            });
        });

        window.setInterval(function() {
            showSlide(current + 1);
        }, 5600);
    }

    var activeFilter = 'all';
    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-site-search]'));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-item'));

    function cardMatchesFilter(card) {
        if (activeFilter === 'all') {
            return true;
        }
        var type = card.getAttribute('data-type') || '';
        var region = card.getAttribute('data-region') || '';
        var year = parseInt(card.getAttribute('data-year') || '0', 10);
        var title = card.getAttribute('data-title') || '';
        if (activeFilter === '海外') {
            return !/中国|大陆|国产|香港|台湾/.test(region);
        }
        if (activeFilter === '2026') {
            return year >= 2025;
        }
        return type.indexOf(activeFilter) !== -1 || region.indexOf(activeFilter) !== -1 || title.indexOf(activeFilter) !== -1;
    }

    function applySearch(value) {
        var query = (value || '').trim().toLowerCase();
        cards.forEach(function(card) {
            var haystack = (card.getAttribute('data-title') || '').toLowerCase();
            var searchOk = !query || haystack.indexOf(query) !== -1;
            var filterOk = cardMatchesFilter(card);
            card.classList.toggle('is-search-hidden', !searchOk);
            card.classList.toggle('is-filter-hidden', !filterOk);
        });
    }

    searchInputs.forEach(function(input) {
        input.addEventListener('input', function() {
            searchInputs.forEach(function(otherInput) {
                if (otherInput !== input) {
                    otherInput.value = input.value;
                }
            });
            applySearch(input.value);
        });
    });

    filterButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            activeFilter = button.getAttribute('data-filter-value') || 'all';
            filterButtons.forEach(function(item) {
                item.classList.toggle('active', item === button || item.getAttribute('data-filter-value') === activeFilter);
            });
            var value = searchInputs.length ? searchInputs[0].value : '';
            applySearch(value);
        });
    });
}());
