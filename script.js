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
            title: "إعلان عن مناقصة عامة",
            date: "20 سبتمبر 2025",
            description: "تعلن بلدية زان عن مناقصة عامة لتوريد وتركيب أعمدة إنارة للشوارع الرئيسية.",
            image: "https://picsum.photos/400/250?random=11",
            category: "announcements"
        },
    ];

    const galleryData = [
        {
            albumTitle: "افتتاح مطعم تراس العلا",
            items: [
                { type: 'photo', src: 'https://picsum.photos/400/250?random=15', description: 'صورة من الافتتاح' },
                { type: 'photo', src: 'https://picsum.photos/400/250?random=16', description: 'الحضور في الافتتاح' },
                { type: 'video', src: 'https://www.w3schools.com/html/mov_bbb.mp4', description: 'فيديو قصير من الحدث' }
            ]
        },
        {
            albumTitle: "حملة تشجير",
            items: [
                { type: 'photo', src: 'https://picsum.photos/400/250?random=17', description: 'متطوعون يزرعون الأشجار' },
                { type: 'photo', src: 'https://picsum.photos/400/250?random=18', description: 'الأشجار الجديدة' },
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
        setupPagination(newsContainer, newsPagination, newsData);

        const announcementsContainer = document.getElementById('announcements-container');
        const announcementsPagination = document.getElementById('announcements-pagination');
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
                    galleryItem.innerHTML = `
                        <img src="${item.src}" alt="${item.description}">
                        <div class="item-description">${item.description}</div>
                    `;
                } else if (item.type === 'video') {
                    galleryItem.innerHTML = `
                        <video>
                            <source src="${item.src}" type="video/mp4">
                        </video>
                        <div class="item-description">${item.description}</div>
                        <div class="video-play-icon"><i class="fas fa-play"></i></div>
                    `;
                }
                itemsContainer.appendChild(galleryItem);
            });

            albumContainer.appendChild(itemsContainer);
            gallerySection.appendChild(albumContainer);
        });
    }

    // Modal Popup functionality
    const modal = document.getElementById('details-modal');
    if (modal) {
        const modalTitle = document.getElementById('modal-title');
        const modalText = document.getElementById('modal-text');
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
                } else if (itemType === 'announcements') {
                    data = announcementsData.find(item => item.id === itemId);
                } else if (itemType === 'projects') {
                    data = projectsData.find(item => item.id === itemId);
                }

                if (data) {
                    modalTitle.textContent = data.title;
                    modalText.textContent = data.description;
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
});