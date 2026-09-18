/* VINTAGE — site-wide interactions */

document.addEventListener('DOMContentLoaded', () => {

    /* ---------- Mobile nav toggle ---------- */
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            const open = navLinks.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', String(open));
        });

        navLinks.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    /* ---------- Featured flavors carousel ---------- */
    const flavorsViewport = document.getElementById('flavorsViewport');
    const flavorsPrev = document.getElementById('flavorsPrev');
    const flavorsNext = document.getElementById('flavorsNext');

    function updateFlavorsButtons() {
        if (!flavorsViewport) return;
        const maxScroll = flavorsViewport.scrollWidth - flavorsViewport.clientWidth;
        const atStart = flavorsViewport.scrollLeft <= 2;
        const atEnd = flavorsViewport.scrollLeft >= maxScroll - 2;
        if (flavorsPrev) flavorsPrev.disabled = atStart;
        if (flavorsNext) flavorsNext.disabled = atEnd;
    }

    function flavorsStep() {
        const first = flavorsViewport.querySelector('.product-card');
        return first ? first.getBoundingClientRect().width + 8 : 120;
    }

    if (flavorsViewport && flavorsPrev && flavorsNext) {
        flavorsPrev.addEventListener('click', () => {
            flavorsViewport.scrollBy({ left: -flavorsStep(), behavior: 'smooth' });
        });
        flavorsNext.addEventListener('click', () => {
            flavorsViewport.scrollBy({ left: flavorsStep(), behavior: 'smooth' });
        });
        flavorsViewport.addEventListener('scroll', updateFlavorsButtons, { passive: true });
        window.addEventListener('resize', updateFlavorsButtons);
        updateFlavorsButtons();
    }

    /* ---------- Most popular tiles spotlight ---------- */
    const tilesPrev = document.getElementById('tilesPrev');
    const tilesNext = document.getElementById('tilesNext');
    const tiles = Array.from(document.querySelectorAll('.popular-tile'));

    function activeTileIndex() {
        return Math.max(0, tiles.findIndex((t) => t.classList.contains('is-active')));
    }

    function highlightTile(index) {
        tiles.forEach((t) => t.classList.remove('is-active'));
        tiles[index].classList.add('is-active');
        if (tilesPrev) tilesPrev.disabled = index === 0;
        if (tilesNext) tilesNext.disabled = index === tiles.length - 1;
    }

    if (tiles.length && tilesPrev && tilesNext) {
        tilesPrev.addEventListener('click', () => {
            const idx = Math.max(0, activeTileIndex() - 1);
            highlightTile(idx);
        });
        tilesNext.addEventListener('click', () => {
            const idx = Math.min(tiles.length - 1, activeTileIndex() + 1);
            highlightTile(idx);
        });
        highlightTile(activeTileIndex());
    }

    /* ---------- Wine collection tabs ---------- */
    const wineTabs = document.querySelectorAll('.wine-tabs button');
    const wineCards = document.querySelectorAll('.wine-card');

    if (wineTabs.length && wineCards.length) {
        wineTabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                const cat = tab.getAttribute('data-category');
                wineCards.forEach((card) => {
                    const show = cat === 'all' || card.getAttribute('data-category') === cat;
                    card.classList.toggle('is-hidden', !show);
                });
                wineTabs.forEach((b) => b.classList.toggle('is-active', b === tab));
            });
        });
    }

    /* ---------- Hero bottle 3D tilt ---------- */
    const bottle3d = document.getElementById('bottle3d');
    const canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (bottle3d && canHover) {
        const inner = bottle3d.querySelector('.bottle3d-inner');
        if (inner) {
            const strength = 12;
            let raf = null;
            bottle3d.addEventListener('pointermove', (e) => {
                const rect = bottle3d.getBoundingClientRect();
                const px = (e.clientX - rect.left) / rect.width - 0.5;
                const py = (e.clientY - rect.top) / rect.height - 0.5;
                if (raf) cancelAnimationFrame(raf);
                raf = requestAnimationFrame(() => {
                    inner.style.transform =
                        'rotateY(' + (px * strength).toFixed(2) + 'deg) rotateX(' +
                        (-py * strength).toFixed(2) + 'deg) scale3d(1.02, 1.02, 1.02)';
                });
            });
            bottle3d.addEventListener('pointerleave', () => {
                if (raf) cancelAnimationFrame(raf);
                inner.style.transform = 'rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)';
            });
        }
    }

    /* ---------- Hero wine bubbles ---------- */
    const bubbles = document.getElementById('heroBubbles');
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (bubbles && !reduceMotion) {
        const n = Math.min(16, Math.max(10, Math.round(window.innerWidth / 100)));
        let html = '';
        for (let i = 0; i < n; i++) {
            const size = (8 + Math.random() * 18).toFixed(1);
            const left = (Math.random() * 100).toFixed(1);
            const dur = (7 + Math.random() * 9).toFixed(1);
            const delay = (Math.random() * -12).toFixed(2);
            html += '<span style="left:' + left + '%; width:' + size + 'px; height:' + size + 'px; animation-duration:' + dur + 's; animation-delay:' + delay + 's;"></span>';
        }
        bubbles.innerHTML = html;
    }

    /* ---------- Reveal on scroll ---------- */
    const revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
        );
        revealEls.forEach((el) => observer.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add('is-visible'));
    }

    /* ---------- Newsletter ---------- */
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]');
            const success = document.getElementById('newsletterSuccess');
            if (email && email.checkValidity() && email.value.trim()) {
                if (success) success.classList.add('visible');
                showToast('Thanks for subscribing — welcome to the green side');
                email.value = '';
                newsletterForm.querySelector('button[type="submit"]').disabled = true;
            } else {
                email.reportValidity();
            }
        });
    }

    /* ---------- Toast ---------- */
    let toastTimer = null;
    function showToast(message) {
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            toast.id = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
    }

    /* ---------- Cart (localStorage) ---------- */
    var CART_KEY = 'vintage_cart';

    function getCart() {
        try {
            var raw = localStorage.getItem(CART_KEY);
            var arr = raw ? JSON.parse(raw) : [];
            return Array.isArray(arr) ? arr : [];
        } catch (err) {
            return [];
        }
    }

    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        updateCartBadge();
        window.dispatchEvent(new CustomEvent('vintage:cartchange'));
    }

    function cartCount(cart) {
        return cart.reduce(function (n, i) { return n + (Number(i.qty) || 1); }, 0);
    }

    function updateCartBadge() {
        var el = document.getElementById('cartCount');
        if (el) el.textContent = String(cartCount(getCart()));
    }

    /* ---------- Add to cart ---------- */
    document.querySelectorAll('.add-to-cart, .btn-icon[data-name]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            var name = btn.getAttribute('data-name');
            if (!name) return;
            var cart = getCart();
            var item = {
                id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                name: name,
                flavor: btn.getAttribute('data-flavor') || '',
                price: parseFloat(btn.getAttribute('data-price')) || 0,
                image: btn.getAttribute('data-image') || '',
                qty: 1
            };
            var idx = cart.findIndex(function (i) { return i.id === item.id; });
            if (idx > -1) {
                cart[idx].qty = (Number(cart[idx].qty) || 1) + 1;
            } else {
                cart.push(item);
            }
            saveCart(cart);
            showToast(name + ' added to your cart');
        });
    });

    updateCartBadge();
    window.addEventListener('storage', function (e) {
        if (e.key === CART_KEY) updateCartBadge();
    });
    window.addEventListener('vintage:cartchange', updateCartBadge);
});