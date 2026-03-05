// script.js — MiniMini Babyshop Kenya

// ══════════════════════════════════════════
// PRODUCT DATABASE
// ══════════════════════════════════════════
const products = [
    {
        id: 1,
        name: "Organic Cotton Onesie",
        price: 2990,
        image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800",
        description: "Ultra-soft 100% organic cotton for sensitive skin. Breathable, hypoallergenic, and designed with easy-snap buttons for quick changes.",
        images: [
            "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800",
            "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800"
        ]
    },
    {
        id: 2,
        name: "Wooden Rainbow Stacker",
        price: 4150,
        image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800",
        description: "Montessori-approved sustainable wood toy. Hand-painted with non-toxic colors. Encourages fine motor skills and colour recognition.",
        images: ["https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800"]
    },
    {
        id: 3,
        name: "Premium Baby Stroller",
        price: 23880,
        image: "https://images.unsplash.com/photo-1594708767771-a7502209ff51?w=800",
        description: "All-terrain safety engineered for Kenyan roads. Lightweight, one-hand fold, airline-approved, and UV-protective canopy included.",
        images: ["https://images.unsplash.com/photo-1594708767771-a7502209ff51?w=800"]
    },
    {
        id: 4,
        name: "Bamboo Swaddle Set",
        price: 4799,
        image: "https://images.unsplash.com/photo-1526948128573-703a59e39c2e?w=800",
        description: "Ultra-soft bamboo viscose swaddles. Set of 2, breathable and perfect for Kenya's warm climate. Gets softer with every wash.",
        images: ["https://images.unsplash.com/photo-1526948128573-703a59e39c2e?w=800"]
    },
    {
        id: 5,
        name: "Baby Bouncer Seat",
        price: 8990,
        image: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800",
        description: "Soothing vibrations with 5 speeds and a removable toy bar. Machine-washable seat pad. Folds flat for easy storage.",
        images: ["https://images.unsplash.com/photo-1544717305-2782549b5136?w=800"]
    },
    {
        id: 6,
        name: "Muslin Bibs (3 Pack)",
        price: 1290,
        image: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800",
        description: "Super absorbent, extra-soft muslin bibs. Set of 3 adorable patterns. Adjustable snap closure fits babies 3–24 months.",
        images: ["https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800"]
    }
];

window.products = products;

// ══════════════════════════════════════════
// CART STATE
// ══════════════════════════════════════════
let cart = [];

function loadCart() {
    try {
        const saved = localStorage.getItem('minimini_cart');
        cart = saved ? JSON.parse(saved) : [];
        if (!Array.isArray(cart)) cart = [];
    } catch (e) {
        cart = [];
    }
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('minimini_cart', JSON.stringify(cart));
    updateCartUI();
}

function formatKES(amount) {
    return 'KSh ' + amount.toLocaleString('en-KE');
}
window.formatKES = formatKES;

// ══════════════════════════════════════════
// CART OPEN / CLOSE
// ══════════════════════════════════════════
function openCart(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    if (!sidebar || !overlay) return;
    sidebar.classList.remove('translate-x-full');
    overlay.classList.remove('hidden');
    // Force reflow then add opacity
    requestAnimationFrame(() => overlay.classList.add('opacity-100'));
    document.body.style.overflow = 'hidden';
}
window.openCart = openCart;

function closeCart(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    if (!sidebar || !overlay) return;
    sidebar.classList.add('translate-x-full');
    overlay.classList.remove('opacity-100');
    setTimeout(() => {
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
    }, 350);
}
window.closeCart = closeCart;

// ══════════════════════════════════════════
// CART OPERATIONS
// ══════════════════════════════════════════
function addToCart(productId, size = '0–3 Months', qty = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId && item.size === size);
    if (existing) {
        existing.qty += qty;
    } else {
        cart.push({ ...product, size, qty });
    }

    saveCart();
    showToast(`${product.name} added to cart`);
    openCart();
}
window.addToCart = addToCart;

function removeCartItem(index) {
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        saveCart();
    }
}
window.removeCartItem = removeCartItem;

// ══════════════════════════════════════════
// TOAST NOTIFICATION
// ══════════════════════════════════════════
function showToast(message) {
    // Remove any existing toasts
    document.querySelectorAll('.toast-notification').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i><span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('leaving');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// ══════════════════════════════════════════
// CART UI — FIXED VERSION
// Key fixes:
// 1. emptyMsg never moved into container (no appendChild)
// 2. Badge always updated regardless of cart state
// 3. Cart items use new CSS classes matching new design
// ══════════════════════════════════════════
function updateCartUI() {
    const container = document.getElementById('cart-items');
    const totalEl   = document.getElementById('cart-total');
    const badge     = document.querySelector('.cart-badge');
    const emptyMsg  = document.getElementById('empty-cart-msg');

    if (!container) return;

    // Clear only dynamically-added items; emptyMsg stays in the DOM as-is
    container.innerHTML = '';

    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

    // ─── Badge (always updated) ───
    if (badge) {
        badge.textContent = totalItems > 0 ? totalItems : '0';
        if (totalItems > 0) {
            badge.classList.remove('scale-0');
            badge.classList.add('scale-100');
        } else {
            badge.classList.add('scale-0');
            badge.classList.remove('scale-100');
        }
    }

    // ─── Empty state ───
    if (cart.length === 0) {
        if (emptyMsg) emptyMsg.style.display = 'block';
        if (totalEl) totalEl.textContent = 'KSh 0';
        return;
    }

    // ─── Hide empty message ───
    if (emptyMsg) emptyMsg.style.display = 'none';

    // ─── Render items ───
    let subtotal = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.qty;
        subtotal += itemTotal;

        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>${item.size} &times; ${item.qty}</p>
                <p class="cart-item-price">${formatKES(itemTotal)}</p>
            </div>
            <button class="cart-remove remove-item-btn" data-index="${index}" aria-label="Remove ${item.name}">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;
        container.appendChild(div);
    });

    // Attach remove listeners (scoped to container only)
    container.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            removeCartItem(parseInt(btn.dataset.index, 10));
        });
    });

    if (totalEl) totalEl.textContent = formatKES(subtotal);
}

// ══════════════════════════════════════════
// CAROUSEL — TOUCH + INFINITE LOOP
// ══════════════════════════════════════════
function initCarousel() {
    const viewport  = document.querySelector('.carousel-viewport');
    const track     = document.querySelector('.carousel-track');
    const prevBtn   = document.querySelector('.carousel-btn.prev');
    const nextBtn   = document.querySelector('.carousel-btn.next');
    const dotsWrap  = document.querySelector('.carousel-dots');
    if (!track || !viewport) return;

    // Native touch scroll — do NOT intercept touch events
    viewport.style.touchAction = 'pan-x';
    viewport.style.webkitOverflowScrolling = 'touch';

    const SLIDE_W        = 280 + 20;  // width + gap
    const MOBILE_SLIDE_W = 240 + 20;
    const COPIES         = 5;

    // Build slides
    track.innerHTML = '';
    for (let c = 0; c < COPIES; c++) {
        products.forEach(product => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.innerHTML = `
                <div class="carousel-card">
                    <img src="${product.image}" loading="lazy" alt="${product.name}">
                    <div class="carousel-card-body">
                        <h3>${product.name}</h3>
                        <p>${formatKES(product.price)}</p>
                        <a href="product.html?id=${product.id}">View Details</a>
                    </div>
                </div>
            `;
            track.appendChild(slide);
        });
    }

    // Dots
    if (dotsWrap) {
        dotsWrap.innerHTML = '';
        products.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = `carousel-dot${i === 0 ? ' active' : ''}`;
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.addEventListener('click', () => {
                pauseAutoScroll();
                const w = slideW();
                viewport.scrollTo({ left: (products.length * 2 + i) * w, behavior: 'smooth' });
                resumeAfter(900);
            });
            dotsWrap.appendChild(dot);
        });
    }

    function slideW() {
        return window.innerWidth <= 768 ? MOBILE_SLIDE_W : SLIDE_W;
    }

    function updateDots() {
        if (!dotsWrap) return;
        const w = slideW();
        const raw = Math.round(viewport.scrollLeft / w);
        const n   = products.length;
        const idx = ((raw % n) + n) % n;
        dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) => {
            d.classList.toggle('active', i === idx);
        });
    }

    // Infinite loop repositioning
    function onScroll() {
        const pos = viewport.scrollLeft;
        const w   = slideW();
        const mid = products.length * 2 * w;
        const max = products.length * 3.5 * w;
        const min = products.length * 1.5 * w;

        if (pos > max || pos < min) {
            viewport.style.scrollBehavior = 'auto';
            viewport.scrollLeft = mid;
            void viewport.offsetLeft; // force reflow
            viewport.style.scrollBehavior = 'smooth';
        }
        updateDots();
    }

    viewport.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateDots);

    // Auto-scroll
    let interval = null;
    let paused   = false;
    let resumeTimer = null;

    function startAutoScroll() {
        clearInterval(interval);
        interval = setInterval(() => {
            if (!paused) viewport.scrollBy({ left: slideW(), behavior: 'smooth' });
        }, 2200);
    }

    function pauseAutoScroll() {
        paused = true;
        clearInterval(interval);
    }

    function resumeAfter(ms = 800) {
        clearTimeout(resumeTimer);
        resumeTimer = setTimeout(() => {
            paused = false;
            startAutoScroll();
        }, ms);
    }

    // Mouse / wheel pause (NOT touch — let browser handle it natively)
    ['mousedown', 'wheel'].forEach(ev => {
        viewport.addEventListener(ev, pauseAutoScroll, { passive: true });
    });
    ['mouseup', 'mouseleave'].forEach(ev => {
        viewport.addEventListener(ev, () => resumeAfter(900));
    });

    // Detect end of touch scroll via debounced scroll event
    let scrollDebounce = null;
    viewport.addEventListener('scroll', () => {
        paused = true;
        clearTimeout(scrollDebounce);
        scrollDebounce = setTimeout(() => {
            paused = false;
            startAutoScroll();
        }, 900);
    }, { passive: true });

    // Arrow buttons
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            pauseAutoScroll();
            viewport.scrollBy({ left: -slideW(), behavior: 'smooth' });
            resumeAfter(900);
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            pauseAutoScroll();
            viewport.scrollBy({ left: slideW(), behavior: 'smooth' });
            resumeAfter(900);
        });
    }

    // Start centred on middle copy
    setTimeout(() => {
        viewport.style.scrollBehavior = 'auto';
        viewport.scrollLeft = products.length * 2 * slideW();
        void viewport.offsetLeft;
        viewport.style.scrollBehavior = 'smooth';
        startAutoScroll();
    }, 150);
}

// ══════════════════════════════════════════
// FEATURED GRID (index.html)
// ══════════════════════════════════════════
function initFeatured() {
    const container = document.getElementById('featured-grid');
    if (!container) return;

    container.innerHTML = '';
    products.slice(0, 3).forEach((product, i) => {
        const card = document.createElement('div');
        card.className = 'product-card reveal';
        card.style.transitionDelay = `${i * 0.1}s`;
        card.innerHTML = `
            <div class="product-card__img-wrap">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <span class="product-card__badge">Bestseller</span>
            </div>
            <div class="product-card__body">
                <div class="product-card__name">${product.name}</div>
                <div class="product-card__price">${formatKES(product.price)}</div>
                <div class="product-card__actions">
                    <a href="product.html?id=${product.id}" class="view-btn">View Details</a>
                    <button class="cart-btn-sm" onclick="addToCart(${product.id})" aria-label="Add ${product.name} to cart">
                        <i class="fa-solid fa-bag-shopping"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// ══════════════════════════════════════════
// SCROLL REVEAL (IntersectionObserver)
// ══════════════════════════════════════════
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ══════════════════════════════════════════
// NAVBAR SCROLL EFFECT
// ══════════════════════════════════════════
function initNavbar() {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    const onScroll = () => {
        nav.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

// ══════════════════════════════════════════
// MOBILE MENU
// ══════════════════════════════════════════
function initMobileMenu() {
    const menuBtn  = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('close-mobile-menu');
    const menu     = document.getElementById('mobile-menu');
    if (!menuBtn || !closeBtn || !menu) return;

    const open  = () => { menu.classList.add('open'); document.body.style.overflow = 'hidden'; };
    const close = () => { menu.classList.remove('open'); document.body.style.overflow = ''; };

    menuBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    // Close on outside click
    document.addEventListener('click', (e) => {
        if (menu.classList.contains('open') && !menu.contains(e.target) && e.target !== menuBtn) close();
    });
    document.querySelectorAll('.nav-link.mobile').forEach(l => l.addEventListener('click', close));
}

// ══════════════════════════════════════════
// BACK TO TOP
// ══════════════════════════════════════════
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ══════════════════════════════════════════
// ACTIVE NAV LINK (index only)
// ══════════════════════════════════════════
function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const links    = document.querySelectorAll('.nav-link:not(.mobile)');
    if (!sections.length || !links.length) return;

    const onScroll = () => {
        let current = '';
        sections.forEach(sec => {
            if (window.scrollY >= sec.offsetTop - 250) current = sec.id;
        });
        links.forEach(link => {
            const href = link.getAttribute('href') || '';
            link.classList.toggle('active', href.includes(current) && current !== '');
        });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
}

// ══════════════════════════════════════════
// LOADER
// ══════════════════════════════════════════
function initLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;
    // Fade out after 2.2s (bar animation is 2s)
    setTimeout(() => loader.classList.add('fade-out'), 2200);
}

// ══════════════════════════════════════════
// GSAP ANIMATIONS (index only)
// ══════════════════════════════════════════
function initAnimations() {
    if (!window.gsap || !document.getElementById('home')) return;
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    gsap.from('.hero-content', {
        y: 40, opacity: 0, duration: 1.2, ease: 'power3.out', delay: 2.3
    });
    if (window.ScrollTrigger) {
        gsap.from('.about-img-wrap', {
            scrollTrigger: { trigger: '#about', start: 'top 80%' },
            x: -50, opacity: 0, duration: 1
        });
        gsap.from('.about-img-wrap ~ div', {
            scrollTrigger: { trigger: '#about', start: 'top 80%' },
            x: 50, opacity: 0, duration: 1, delay: 0.2
        });
    }
}

// ══════════════════════════════════════════
// WHATSAPP CHECKOUT
// ══════════════════════════════════════════
window.checkoutToWhatsApp = function () {
    if (cart.length === 0) {
        showToast('Your cart is empty!');
        return;
    }
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const lines = cart.map(i => `• ${i.name} (${i.size}) ×${i.qty} — ${formatKES(i.price * i.qty)}`).join('%0A');
    const text  = `Hello MiniMini! 👋%0A%0AI'd like to place an order:%0A%0A${lines}%0A%0A*Total: ${formatKES(total)}*%0A%0APayment: M-PESA 🇰🇪`;
    window.open(`https://wa.me/254712345678?text=${text}`, '_blank');
};

// ══════════════════════════════════════════
// INIT
// ══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    initNavbar();
    initLoader();
    initMobileMenu();
    initBackToTop();
    initActiveNav();
    initFeatured();
    initScrollReveal();

    // Carousel and animations after loader
    setTimeout(() => {
        initCarousel();
        initAnimations();
        initScrollReveal(); // re-run after carousel injects elements
    }, 2300);

    // Cart button bindings
    const cartBtn    = document.getElementById('cart-btn');
    const closeCart_ = document.getElementById('close-cart');
    const overlay    = document.getElementById('cart-overlay');

    if (cartBtn)    cartBtn.addEventListener('click', openCart);
    if (closeCart_) closeCart_.addEventListener('click', closeCart);
    if (overlay)    overlay.addEventListener('click', closeCart);

    // ESC key closes cart
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeCart();
    });
});
