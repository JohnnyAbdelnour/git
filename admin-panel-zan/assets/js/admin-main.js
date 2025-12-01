/**
 * Admin Panel Main JavaScript
 * Handles all Arabic-specific functionality:
 * - Eastern Arabic Numerals
 * - Smart Search
 * - Sorting
 * - Pagination
 * - Sidebar & UI Interactions
 */

// --- Global Helpers ---

/**
 * Converts standard numbers (0-9) to Eastern Arabic numerals (٠-٩).
 * @param {string|number} num - The number to convert.
 * @returns {string} - The converted string.
 */
function toArabicNum(num) {
    if (num === null || num === undefined) return '';
    const id = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().replace(/[0-9]/g, function (w) {
        return id[+w];
    });
}

/**
 * Normalizes Arabic text for search.
 * Removes tashkeel, normalizes alef, yeh, teh marbuta.
 * @param {string} text
 * @returns {string}
 */
function normalizeArabic(text) {
    text = text || '';
    text = text.replace(/([^\u0621-\u063A\u0641-\u064A\u0660-\u0669a-zA-Z 0-9])/g, ''); // Remove tashkeel & special chars

    // Normalize Alef
    text = text.replace(/(آ|إ|أ)/g, 'ا');
    // Normalize Yeh
    text = text.replace(/(ى)/g, 'ي');
    // Normalize Teh Marbuta
    text = text.replace(/(ة)/g, 'ه');

    return text.toLowerCase();
}

// --- Date Helpers ---

function getHijriDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', calendar: 'islamic-umalqura' };
    return new Intl.DateTimeFormat('ar-SA', options).format(date);
}

function getGregorianDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Intl.DateTimeFormat('ar-LB', options).format(date);
}

// --- Table Management ---

class TableManager {
    constructor(tableId, searchInputId, paginationContainerId, itemsPerPageId) {
        this.table = document.getElementById(tableId);
        if (!this.table) return;

        this.tbody = this.table.querySelector('tbody');
        this.rows = Array.from(this.tbody.querySelectorAll('tr'));
        this.filteredRows = [...this.rows];

        this.searchInput = document.getElementById(searchInputId);
        this.paginationContainer = document.getElementById(paginationContainerId);
        this.itemsPerPageSelect = document.getElementById(itemsPerPageId);

        this.currentPage = 1;
        this.itemsPerPage = this.itemsPerPageSelect ? parseInt(this.itemsPerPageSelect.value) : 10;
        this.sortDirection = 1; // 1 for asc, -1 for desc
        this.currentSortColumn = -1;

        this.init();
    }

    init() {
        // Search
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Sorting
        const headers = this.table.querySelectorAll('th[data-sort]');
        headers.forEach((th, index) => {
            th.addEventListener('click', () => this.handleSort(th, index));
        });

        // Items Per Page
        if (this.itemsPerPageSelect) {
            this.itemsPerPageSelect.addEventListener('change', (e) => {
                this.itemsPerPage = parseInt(e.target.value);
                this.currentPage = 1;
                this.render();
            });
        }

        this.render();
    }

    handleSearch(query) {
        const normalizedQuery = normalizeArabic(query);

        this.filteredRows = this.rows.filter(row => {
            const visibleText = row.innerText;
            const hiddenDesc = row.getAttribute('data-desc') || '';
            const combinedText = normalizeArabic(visibleText + ' ' + hiddenDesc);
            return combinedText.includes(normalizedQuery);
        });

        this.currentPage = 1;
        this.render();
        this.updateResultCount();
    }

    handleSort(th, columnIndex) {
        const type = th.getAttribute('data-sort'); // 'string', 'number', 'date'

        // Toggle direction
        if (this.currentSortColumn === columnIndex) {
            this.sortDirection *= -1;
        } else {
            this.sortDirection = 1;
            this.currentSortColumn = columnIndex;
        }

        // Update UI icons
        this.table.querySelectorAll('th').forEach(h => h.classList.remove('sort-asc', 'sort-desc'));
        th.classList.add(this.sortDirection === 1 ? 'sort-asc' : 'sort-desc');

        this.filteredRows.sort((a, b) => {
            let valA = a.children[columnIndex].innerText.trim();
            let valB = b.children[columnIndex].innerText.trim();

            if (type === 'number') {
                // Remove non-numeric chars (except dot) and map Arabic nums to English
                valA = parseFloat(valA.replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[^0-9.]/g, '')) || 0;
                valB = parseFloat(valB.replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[^0-9.]/g, '')) || 0;
            } else if (type === 'date') {
                // Simplistic date parse for string comparison or use data attribute if available
                // Assuming format like "15 تشرين الأول 2023" might be complex,
                // but usually sortable strings work if YYYY-MM-DD is in data attribute.
                // Let's rely on data-date if present, else string.
                const dateA = a.children[columnIndex].getAttribute('data-date') || valA;
                const dateB = b.children[columnIndex].getAttribute('data-date') || valB;
                return dateA > dateB ? 1 * this.sortDirection : -1 * this.sortDirection;
            } else {
                return valA.localeCompare(valB, 'ar') * this.sortDirection;
            }

            return (valA > valB ? 1 : -1) * this.sortDirection;
        });

        this.currentPage = 1;
        this.render();
    }

    render() {
        // Clear table
        this.tbody.innerHTML = '';

        // Pagination Logic
        const totalItems = this.filteredRows.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);

        if (this.currentPage > totalPages) this.currentPage = totalPages || 1;

        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageRows = this.filteredRows.slice(start, end);

        pageRows.forEach(row => this.tbody.appendChild(row));

        this.renderPagination(totalPages);
        this.updateInfo(start + 1, Math.min(end, totalItems), totalItems);
    }

    renderPagination(totalPages) {
        if (!this.paginationContainer) return;
        this.paginationContainer.innerHTML = '';

        if (totalPages <= 1) return;

        const createBtn = (text, page, disabled = false, active = false) => {
            const btn = document.createElement('button');
            btn.className = `page-btn ${active ? 'active' : ''}`;
            btn.innerText = text;
            btn.disabled = disabled;
            btn.addEventListener('click', () => {
                this.currentPage = page;
                this.render();
            });
            return btn;
        };

        // First & Prev
        this.paginationContainer.appendChild(createBtn('الأولى', 1, this.currentPage === 1));
        this.paginationContainer.appendChild(createBtn('السابق', this.currentPage - 1, this.currentPage === 1));

        // Pages (Simple range for now: current-2 to current+2)
        let startPage = Math.max(1, this.currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

        for (let i = startPage; i <= endPage; i++) {
            this.paginationContainer.appendChild(createBtn(toArabicNum(i), i, false, i === this.currentPage));
        }

        // Next & Last
        this.paginationContainer.appendChild(createBtn('التالي', this.currentPage + 1, this.currentPage === totalPages));
        this.paginationContainer.appendChild(createBtn('الأخيرة', totalPages, this.currentPage === totalPages));
    }

    updateInfo(start, end, total) {
        const infoEl = document.querySelector('.pagination-info');
        if (infoEl) {
            if (total === 0) {
                infoEl.innerText = 'لا يوجد نتائج';
            } else {
                infoEl.innerText = `عرض ${toArabicNum(start)} إلى ${toArabicNum(end)} من أصل ${toArabicNum(total)} مدخلات`;
            }
        }
    }

    updateResultCount() {
        // Optionally update a badge elsewhere
    }
}

// --- UI Logic ---

document.addEventListener('DOMContentLoaded', () => {

    // Sidebar Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            if (overlay) overlay.classList.toggle('active');
        });
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }

    // Auto-init TableManager if table exists
    if (document.getElementById('dataTable')) {
        new TableManager('dataTable', 'tableSearch', 'pagination', 'itemsPerPage');
    }

    // Image Upload Preview
    const fileInput = document.getElementById('imageUpload');
    const previewContainer = document.getElementById('imagePreviewContainer');

    if (fileInput && previewContainer) {
        fileInput.addEventListener('change', function(e) {
            // Clear previous previews if needed, or append?
            // Requirement says "Multiple image upload"
            // Let's append for now, or clear if it's a fresh selection of many.
            previewContainer.innerHTML = '';

            Array.from(this.files).forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const div = document.createElement('div');
                        div.className = 'preview-item';
                        div.innerHTML = `
                            <img src="${e.target.result}" alt="Preview">
                            <div class="preview-remove" onclick="this.parentElement.remove()">×</div>
                        `;
                        previewContainer.appendChild(div);
                    };
                    reader.readAsDataURL(file);
                }
            });
        });
    }

    // Date Auto-Fill (Gregorian to Hijri)
    const dateInput = document.getElementById('gregorianDate');
    const hijriDisplay = document.getElementById('hijriDateDisplay');

    if (dateInput && hijriDisplay) {
        dateInput.addEventListener('change', (e) => {
            const date = new Date(e.target.value);
            if (!isNaN(date)) {
                hijriDisplay.value = getHijriDate(date);
            }
        });
    }

    // Convert all static numbers on page load (Stats cards, etc.)
    document.querySelectorAll('.arabic-num').forEach(el => {
        el.innerText = toArabicNum(el.innerText);
    });
});
