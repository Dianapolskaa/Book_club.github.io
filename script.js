let allBooks = [];
let catalogCurrentPage = 1;
const BOOKS_PER_PAGE = 8;

let recentBooks = JSON.parse(localStorage.getItem('recentBooks')) || [];

const modal = document.getElementById('bookModal');
const modalBody = document.getElementById('modalBody');

async function loadBooks() {
    try {
        const response = await fetch('books.json');
        const data = await response.json();
        allBooks = data.books;
        
        const isCatalogPage = window.location.pathname.includes('catalog.html');
        const isIndexPage = window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname === '';
        
        if (isIndexPage) {
            const popularBooks = allBooks.filter(book => book.popular === true).slice(0, 5);
            displayBooks(popularBooks, 'popularGrid');
            renderRecentBooks();
        } else if (isCatalogPage) {
            catalogCurrentPage = 1;
            displayCatalogPage();
            setupPagination();
        }
    } catch (error) {
        console.error('Ошибка загрузки книг:', error);
        const grid = document.getElementById('popularGrid') || document.getElementById('catalogGrid');
        if (grid) grid.innerHTML = '<div class="loading">Ошибка загрузки книг</div>';
    }
}

function displayBooks(books, gridId) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    
    if (!books.length) {
        grid.innerHTML = '<div class="loading">Нет книг</div>';
        return;
    }
    
    grid.innerHTML = books.map(book => `
        <div class="book-card" data-id="${book.id}">
            <img src="${book.cover}" class="book-cover" alt="${book.title}" onerror="this.src='https://via.placeholder.com/200x260?text=No+Cover'">
            <h3 class="book-title">${escapeHtml(book.title)}</h3>
            <p class="book-author">${escapeHtml(book.author)} • ${book.year}</p>
            <span class="book-rating">⭐ ${book.rating}</span>
        </div>
    `).join('');
    
    document.querySelectorAll(`#${gridId} .book-card`).forEach(card => {
        card.addEventListener('click', () => {
            const bookId = parseInt(card.dataset.id);
            const book = allBooks.find(b => b.id === bookId);
            if (book) {
                addToRecent(bookId);
                openBookModal(book);
            }
        });
    });
}

function displayCatalogPage() {
    const start = (catalogCurrentPage - 1) * BOOKS_PER_PAGE;
    const pageBooks = allBooks.slice(start, start + BOOKS_PER_PAGE);
    
    const grid = document.getElementById('catalogGrid');
    if (!grid) return;
    
    grid.innerHTML = pageBooks.map(book => `
        <div class="book-card" data-id="${book.id}">
            <img src="${book.cover}" class="book-cover" alt="${book.title}" onerror="this.src='https://via.placeholder.com/200x260?text=No+Cover'">
            <h3 class="book-title">${escapeHtml(book.title)}</h3>
            <p class="book-author">${escapeHtml(book.author)} • ${book.year}</p>
            <span class="book-rating">⭐ ${book.rating}</span>
        </div>
    `).join('');
    
    document.querySelectorAll('#catalogGrid .book-card').forEach(card => {
        card.addEventListener('click', () => {
            const bookId = parseInt(card.dataset.id);
            const book = allBooks.find(b => b.id === bookId);
            if (book) {
                addToRecent(bookId);
                openBookModal(book);
            }
        });
    });
}

function setupPagination() {
    const totalPages = Math.ceil(allBooks.length / BOOKS_PER_PAGE);
    const paginationDiv = document.getElementById('pagination');
    if (!paginationDiv || totalPages <= 1) {
        if (paginationDiv) paginationDiv.innerHTML = '';
        return;
    }
    
    paginationDiv.innerHTML = Array.from({ length: totalPages }, (_, i) => 
        `<div class="page-dot ${i+1 === catalogCurrentPage ? 'active' : ''}" data-page="${i+1}">${i+1}</div>`
    ).join('');
    
    document.querySelectorAll('.page-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            catalogCurrentPage = parseInt(dot.dataset.page);
            displayCatalogPage();
            setupPagination();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

function addToRecent(bookId) {
    recentBooks = [bookId, ...recentBooks.filter(id => id !== bookId)].slice(0, 6);
    localStorage.setItem('recentBooks', JSON.stringify(recentBooks));
    renderRecentBooks();
}

function renderRecentBooks() {
    const recentGrid = document.getElementById('recentGrid');
    if (!recentGrid) return;
    
    if (!recentBooks.length) {
        recentGrid.innerHTML = '<div class="loading">Нет просмотренных книг</div>';
        return;
    }
    
    const recentBooksData = recentBooks.slice(0, 4).map(id => allBooks.find(b => b.id === id)).filter(b => b);
    
    if (!recentBooksData.length) {
        recentGrid.innerHTML = '<div class="loading">Нет просмотренных книг</div>';
        return;
    }
    
    recentGrid.innerHTML = recentBooksData.map(book => `
        <div class="book-card" data-id="${book.id}">
            <img src="${book.cover}" class="book-cover" alt="${book.title}" onerror="this.src='https://via.placeholder.com/200x260?text=No+Cover'">
            <h3 class="book-title">${escapeHtml(book.title)}</h3>
            <p class="book-author">${escapeHtml(book.author)} • ${book.year}</p>
            <span class="book-rating">⭐ ${book.rating}</span>
        </div>
    `).join('');
    
    document.querySelectorAll('#recentGrid .book-card').forEach(card => {
        card.addEventListener('click', () => {
            const bookId = parseInt(card.dataset.id);
            const book = allBooks.find(b => b.id === bookId);
            if (book) {
                addToRecent(bookId);
                openBookModal(book);
            }
        });
    });
}

function openBookModal(book) {
    modalBody.innerHTML = `
        <div class="modal-book-cover">
            <img src="${book.cover}" alt="${book.title}" onerror="this.src='https://via.placeholder.com/180x260?text=No+Cover'">
        </div>
        <div class="modal-book-info">
            <div class="modal-book-title">${escapeHtml(book.title)}</div>
            <div class="modal-book-author">${escapeHtml(book.author)}</div>
            <div class="modal-book-year"><strong>Год издания:</strong> ${book.year}</div>
            <div class="modal-book-rating"><strong>Рейтинг:</strong> ⭐ ${book.rating}</div>
            <div class="modal-book-description"><strong>Описание:</strong><br>${escapeHtml(book.description)}</div>
        </div>
    `;
    modal.style.display = 'flex';
}

function closeModal() {
    modal.style.display = 'none';
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function handleSubscribe(form) {
    if (!form) return;
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Спасибо за подписку!');
        form.reset();
    });
}

document.querySelectorAll('.subscribe-form').forEach(form => handleSubscribe(form));

const mainSubscribeBtn = document.getElementById('mainSubscribeBtn');
if (mainSubscribeBtn) {
    mainSubscribeBtn.addEventListener('click', () => {
        alert('Спасибо за подписку!');
    });
}

const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Сообщение отправлено! Мы свяжемся с вами.');
        contactForm.reset();
    });
}

document.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => {
    if (btn) btn.addEventListener('click', closeModal);
});
window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

loadBooks();

const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.textContent = 'Светлая тема';
    }
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        themeToggle.textContent = isDark ? 'Светлая тема' : 'Тёмная тема';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}