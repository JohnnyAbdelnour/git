document.addEventListener('DOMContentLoaded', function () {

    // Slider functionality (only on homepage)
    if (document.querySelector('.slider-container')) {
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.dot');
        const prevBtn = document.querySelector('.prev-slide');
        const nextBtn = document.querySelector('.next-slide');

        let currentSlide = 0;

        function showSlide(n) {
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));

            if (n >= slides.length) {
                currentSlide = 0;
            } else if (n < 0) {
                currentSlide = slides.length - 1;
            } else {
                currentSlide = n;
            }

            slides[currentSlide].classList.add('active');
            dots[currentSlide].classList.add('active');
        }

        function nextSlide() {
            showSlide(currentSlide + 1);
        }

        function prevSlide() {
            showSlide(currentSlide - 1);
        }

        nextBtn.addEventListener('click', nextSlide);
        prevBtn.addEventListener('click', prevSlide);

        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const slideIndex = parseInt(e.target.getAttribute('data-slide'));
                showSlide(slideIndex);
            });
        });

        setInterval(nextSlide, 7000);
        showSlide(currentSlide);
    }

    // Mobile menu functionality
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }

    // Form search functionality (only on services page)
    if (document.getElementById('form-search')) {
        const searchInput = document.getElementById('form-search');
        const formsList = document.getElementById('forms-list');
        const formItems = formsList.querySelectorAll('.form-item');

        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();

            formItems.forEach(item => {
                const formName = item.querySelector('.form-name').textContent.toLowerCase();
                if (formName.includes(searchTerm)) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    }

    // News page tab and search functionality
    if (document.querySelector('.content-filter-container')) {
        const tabs = document.querySelectorAll('.tab-link');
        const contents = document.querySelectorAll('.tab-content');
        const searchInput = document.getElementById('news-search-input');
        const categorySelect = document.getElementById('news-category-select');
        const searchButton = document.getElementById('news-search-button');

        // Tab switching
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = document.getElementById(tab.dataset.tab);

                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                contents.forEach(c => c.classList.remove('active'));
                target.classList.add('active');
            });
        });

        // Search functionality
        const filterContent = () => {
            const searchText = searchInput.value.toLowerCase();
            const category = categorySelect.value;

            document.querySelectorAll('#news .news-card, #announcements .news-card').forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                const cardCategory = card.dataset.category;

                const textMatch = title.includes(searchText);
                const categoryMatch = (category === 'all' || cardCategory === category);

                if (textMatch && categoryMatch) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        };

        searchButton.addEventListener('click', filterContent);
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') filterContent();
        });
        categorySelect.addEventListener('change', filterContent);
    }
});