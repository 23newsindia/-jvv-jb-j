document.addEventListener('DOMContentLoaded', function() {
    // Initialize all grids on the page
    const grids = document.querySelectorAll('.cg-grid-container');
    grids.forEach(initCategoryGrid);
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            grids.forEach(initCategoryGrid);
        }, 250);
    });
});

function initCategoryGrid(container) {
    const isMobile = window.innerWidth < 768;
    const isCarousel = container.dataset.carousel === 'true';
    const mobileColumns = parseInt(container.dataset.mobileColumns);
    
    // Reset previous classes
    container.classList.remove('cg-carousel-mode', 'cg-grid-mode');
    
    if (isMobile && isCarousel) {
        initCarousel(container, mobileColumns);
    } else {
        initGridLayout(container);
    }
}

function initGridLayout(container) {
    container.classList.add('cg-grid-mode');
    const columns = window.innerWidth >= 768 ? 
        parseInt(container.dataset.columns) : 
        parseInt(container.dataset.mobileColumns);
    
    container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
}

function initCarousel(container, slidesToShow) {
    container.classList.add('cg-carousel-mode');
    
    // Create carousel navigation
    const navHTML = `
        <button class="cg-carousel-prev" aria-label="Previous">
            <svg viewBox="0 0 24 24"><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>
        </button>
        <button class="cg-carousel-next" aria-label="Next">
            <svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
        </button>
        <div class="cg-carousel-dots"></div>
    `;
    
    container.insertAdjacentHTML('beforeend', navHTML);
    
    // Carousel logic
    const items = container.querySelectorAll('.cg-grid-item');
    const dotsContainer = container.querySelector('.cg-carousel-dots');
    let currentIndex = 0;
    
    // Create dots
    items.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.classList.add('cg-carousel-dot');
        dot.dataset.index = index;
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
    
    // Navigation events
    container.querySelector('.cg-carousel-prev').addEventListener('click', () => {
        goToSlide(currentIndex - 1);
    });
    
    container.querySelector('.cg-carousel-next').addEventListener('click', () => {
        goToSlide(currentIndex + 1);
    });
    
    // Touch events for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, {passive: true});
    
    container.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, {passive: true});
    
    function handleSwipe() {
        const threshold = 50;
        if (touchEndX < touchStartX - threshold) {
            goToSlide(currentIndex + 1);
        } else if (touchEndX > touchStartX + threshold) {
            goToSlide(currentIndex - 1);
        }
    }
    
    function goToSlide(index) {
        // Wrap around for infinite effect
        if (index >= items.length) index = 0;
        if (index < 0) index = items.length - 1;
        
        currentIndex = index;
        
        // Update visible items based on slidesToShow
        const offset = -index * 100;
        container.querySelector('.cg-carousel-inner').style.transform = `translateX(${offset}%)`;
        
        // Update active dot
        container.querySelectorAll('.cg-carousel-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }
    
    // Wrap items in a carousel inner container
    const carouselInner = document.createElement('div');
    carouselInner.className = 'cg-carousel-inner';
    items.forEach(item => {
        item.style.flex = `0 0 ${100 / slidesToShow}%`;
        carouselInner.appendChild(item);
    });
    container.insertBefore(carouselInner, container.firstChild);
    
    // Initialize first slide
    goToSlide(0);
}