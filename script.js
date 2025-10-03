document.addEventListener('DOMContentLoaded', function () {
    const newsData = [
        {
            id: 1,
            title: "افتتاح حديقة عامة جديدة",
            date: "25 سبتمبر 2025",
            description: "تم افتتاح حديقة \"الأمل\" الجديدة في وسط المدينة لتكون متنفساً طبيعياً للسكان.",
            image: "https://picsum.photos/400/250?random=7",
            category: "events"
        },
        {
            id: 2,
            title: "مشروع تطوير الطرقات",
            date: "24 سبتمبر 2025",
            description: "بدء المرحلة الثانية من مشروع تطوير وتعبيد الطرقات الرئيسية والفرعية في المدينة.",
            image: "https://picsum.photos/400/250?random=8",
            category: "projects"
        },
    ];

    const announcementsData = [
        {
            id: 1,
            title: "إعلان هام: انقطاع المياه",
            date: "26 سبتمبر 2025",
            description: "سيتم قطع المياه عن المنطقة الشمالية يوم غد من الساعة 8 صباحًا حتى 4 عصرًا لأعمال الصيانة.",
            image: "https://picsum.photos/400/250?random=1",
            category: "announcements"
        },
        {
            id: 2,
            title: "دعوة لحضور اجتماع عام",
            date: "22 سبتمبر 2025",
            description: "تدعوكم البلدية لحضور اجتماع عام لمناقشة خطط التطوير يوم السبت القادم.",
            image: "https://picsum.photos/400/250?random=2",
            category: "announcements"
        },
    ];

    const galleryData = [
        {
            albumTitle: "افتتاح مطعم تراس العلا",
            items: [
                { type: 'photo', src: 'https://via.placeholder.com/800x600.png/FF0000/FFFFFF?text=Large+Image+1', thumbnail: 'https://via.placeholder.com/400x250.png/FF0000/FFFFFF?text=Thumb+1', description: 'صورة من الافتتاح' },
                { type: 'photo', src: 'https://via.placeholder.com/800x600.png/00FF00/FFFFFF?text=Large+Image+2', thumbnail: 'https://via.placeholder.com/400x250.png/00FF00/FFFFFF?text=Thumb+2', description: 'الحضور في الافتتاح' },
                { type: 'video', src: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnail: 'https://via.placeholder.com/400x250.png/0000FF/FFFFFF?text=Video+Thumb', description: 'فيديو قصير من الحدث' }
            ]
        },
        {
            albumTitle: "حملة تشجير",
            items: [
                { type: 'photo', src: 'https://via.placeholder.com/800x600.png/FFFF00/000000?text=Large+Image+3', thumbnail: 'https://via.placeholder.com/400x250.png/FFFF00/000000?text=Thumb+3', description: 'متطوعون يزرعون الأشجار' },
                { type: 'photo', src: 'https://via.placeholder.com/800x600.png/00FFFF/000000?text=Large+Image+4', thumbnail: 'https://via.placeholder.com/400x250.png/00FFFF/000000?text=Thumb+4', description: 'الأشجار الجديدة' },
            ]
        }
    ];

    const projectsData = [
        {
            id: 1,
            title: "توسعة شبكة الصرف الصحي",
            date: "28 سبتمبر 2025",
            description: "مشروع يهدف إلى توسعة شبكة الصرف الصحي لتشمل الأحياء الجديدة في المدينة.",
            image: "https://picsum.photos/400/250?random=12",
            category: "projects"
        },
        {
            id: 2,
            title: "بناء مركز ثقافي جديد",
            date: "15 سبتمبر 2025",
            description: "وضع حجر الأساس لبناء مركز ثقافي متكامل يضم مكتبة عامة ومسرحًا وقاعات للأنشطة.",
            image: "https://picsum.photos/400/250?random=13",
            category: "projects"
        },
        {
            id: 3,
            title: "مشروع تطوير الطرقات",
            date: "24 سبتمبر 2025",
            description: "بدء المرحلة الثانية من مشروع تطوير وتعبيد الطرقات الرئيسية والفرعية في المدينة.",
            image: "https://picsum.photos/400/250?random=8",
            category: "projects"
        },
    ];

    const ITEMS_PER_PAGE = 20;

    // Function to render cards
    function renderCards(container, data) {
        container.innerHTML = '';
        data.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src="${item.image}" alt="صورة">
                <div class="card-content">
                    <h3>${item.title}</h3>
                    <a href="#" class="card-button" data-id="${item.id}" data-type="${item.category}">إقرأ المزيد</a>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // Function to setup pagination
    function setupPagination(container, paginationControls, data) {
        let currentPage = 1;
        const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

        function displayPage(page) {
            currentPage = page;
            const start = (currentPage - 1) * ITEMS_PER_PAGE;
            const end = start + ITEMS_PER_PAGE;
            renderCards(container, data.slice(start, end));
            renderPaginationControls();
        }

        function renderPaginationControls() {
            paginationControls.innerHTML = '';
            for (let i = 1; i <= totalPages; i++) {
                const button = document.createElement('button');
                button.innerText = i;
                button.className = (i === currentPage) ? 'active' : '';
                button.addEventListener('click', () => displayPage(i));
                paginationControls.appendChild(button);
            }
        }

        displayPage(1);
    }

    // Handle homepage sections
    const latestAnnouncementsContainer = document.getElementById('latest-announcements-container');
    if (latestAnnouncementsContainer) {
        const sortedAnnouncements = [...announcementsData].sort((a, b) => new Date(b.date) - new Date(a.date));
        renderCards(latestAnnouncementsContainer, sortedAnnouncements.slice(0, 3));
    }

    const latestNewsContainer = document.getElementById('latest-news-container');
    if (latestNewsContainer) {
        const sortedNews = [...newsData].sort((a, b) => new Date(b.date) - new Date(a.date));
        renderCards(latestNewsContainer, sortedNews.slice(0, 3));
    }

    const latestProjectsContainer = document.getElementById('latest-projects-container');
    if (latestProjectsContainer) {
        const sortedProjects = [...projectsData].sort((a, b) => new Date(b.date) - new Date(a.date));
        renderCards(latestProjectsContainer, sortedProjects.slice(0, 3));
    }

    // Handle news and announcements page
    const newsContainer = document.getElementById('news-container');
    if (newsContainer) {
        const newsPagination = document.getElementById('news-pagination');
        const searchInput = document.getElementById('news-search-input');
        const searchButton = document.getElementById('news-search-button');

        function performSearch() {
            const searchTerm = searchInput.value.toLowerCase();
            if (searchTerm) {
                const filteredData = newsData.filter(item =>
                    item.title.toLowerCase().includes(searchTerm) ||
                    item.description.toLowerCase().includes(searchTerm)
                );
                setupPagination(newsContainer, newsPagination, filteredData);
            } else {
                // If search term is empty, show all news
                setupPagination(newsContainer, newsPagination, newsData);
            }
        }

        searchButton.addEventListener('click', performSearch);

        // Optional: Also search on pressing Enter key
        searchInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                performSearch();
            }
        });

        // Initial render
        setupPagination(newsContainer, newsPagination, newsData);
    }

    const announcementsContainer = document.getElementById('announcements-container');
    if (announcementsContainer) {
        const announcementsPagination = document.getElementById('announcements-pagination');
        const searchInput = document.getElementById('announcements-search-input');
        const searchButton = document.getElementById('announcements-search-button');

        function performSearch() {
            const searchTerm = searchInput.value.toLowerCase();
            if (searchTerm) {
                const filteredData = announcementsData.filter(item =>
                    item.title.toLowerCase().includes(searchTerm) ||
                    item.description.toLowerCase().includes(searchTerm)
                );
                setupPagination(announcementsContainer, announcementsPagination, filteredData);
            } else {
                setupPagination(announcementsContainer, announcementsPagination, announcementsData);
            }
        }

        searchButton.addEventListener('click', performSearch);

        searchInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                performSearch();
            }
        });

        // Initial render
        setupPagination(announcementsContainer, announcementsPagination, announcementsData);
    }

    // Handle projects page
    const projectsContainer = document.getElementById('projects-container');
    if (projectsContainer) {
        const projectsPagination = document.getElementById('projects-pagination');
        setupPagination(projectsContainer, projectsPagination, projectsData);
    }

    // Handle gallery page
    const gallerySection = document.getElementById('gallery-section');
    if (gallerySection) {
        galleryData.forEach((album, index) => {
            const albumContainer = document.createElement('div');
            albumContainer.className = 'album-container';

            const albumTitle = document.createElement('h2');
            albumTitle.className = 'album-title';
            albumTitle.textContent = album.albumTitle;
            albumContainer.appendChild(albumTitle);

            const itemsContainer = document.createElement('div');
            itemsContainer.className = 'gallery-items-container';

            album.items.forEach(item => {
                const galleryItem = document.createElement('a');
                galleryItem.href = item.src;
                galleryItem.className = 'gallery-item';
                galleryItem.setAttribute('data-lightbox', `album-${index}`);
                galleryItem.setAttribute('data-title', item.description);

                if (item.type === 'photo') {
                    const thumbnailUrl = item.thumbnail || item.src;
                    galleryItem.innerHTML = `
                        <img src="${thumbnailUrl}" alt="${item.description}">
                        <div class="item-description">${item.description}</div>
                    `;
                } else if (item.type === 'video') {
                    galleryItem.innerHTML = `
                        <img src="${item.thumbnail}" alt="${item.description}">
                        <div class="item-description">${item.description}</div>
                        <div class="video-play-icon"><i class="fas fa-play"></i></div>
                    `;
                }
                itemsContainer.appendChild(galleryItem);
            });

            albumContainer.appendChild(itemsContainer);
            gallerySection.appendChild(albumContainer);
        });

        if (window.lightbox && typeof lightbox.init === 'function') {
            lightbox.init();
        }
    }

    // Modal Popup functionality
    const modal = document.getElementById('details-modal');
    if (modal) {
        const modalTitle = document.getElementById('modal-title');
        const modalText = document.getElementById('modal-text');
        const modalImage = modal.querySelector('.modal-header-image');
        const closeButton = modal.querySelector('.close-button');

        document.body.addEventListener('click', function(e) {
            if (e.target.classList.contains('card-button')) {
                e.preventDefault();
                const button = e.target;
                const itemId = parseInt(button.dataset.id);
                const itemType = button.dataset.type;

                let data;
                if (itemType === 'events' || itemType === 'projects' && (window.location.pathname.includes('index') || window.location.pathname.includes('news'))) {
                    data = newsData.find(item => item.id === itemId);
                     if(!data) data = projectsData.find(item => item.id === itemId);
                } else if (itemType === 'projects') {
                    data = projectsData.find(item => item.id === itemId);
                } else if (itemType === 'announcements') {
                    data = announcementsData.find(item => item.id === itemId);
                }


                if (data) {
                    modalTitle.textContent = data.title;
                    modalText.textContent = data.description;
                    modalImage.src = data.image;
                    modal.style.display = 'block';
                }
            }
        });

        closeButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Slider functionality
    const sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.dot');
        const nextSlide = document.querySelector('.next-slide');
        const prevSlide = document.querySelector('.prev-slide');
        let currentSlide = 0;

        function showSlide(n) {
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            slides[n].classList.add('active');
            dots[n].classList.add('active');
        }

        function changeSlide(n) {
            currentSlide = (n + slides.length) % slides.length;
            showSlide(currentSlide);
        }

        if (nextSlide && prevSlide) {
            nextSlide.addEventListener('click', () => {
                changeSlide(currentSlide + 1);
            });

            prevSlide.addEventListener('click', () => {
                changeSlide(currentSlide - 1);
            });
        }

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                changeSlide(index);
            });
        });

        // Initialize slider
        showSlide(currentSlide);

        // Auto-play functionality
        let slideInterval = setInterval(() => {
            changeSlide(currentSlide + 1);
        }, 5000); // Change slide every 5 seconds

        // Optional: Pause auto-play on hover
        sliderContainer.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });

        sliderContainer.addEventListener('mouseleave', () => {
            slideInterval = setInterval(() => {
                changeSlide(currentSlide + 1);
            }, 5000);
        });
    }

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }
});