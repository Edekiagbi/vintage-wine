/* VINTAGE — cart page script */

(function () {
    var KEY = 'vintage_cart';
    var FREE_SHIP = 75;
    var SHIP_FEE = 6;
    var DISCOUNT_RATE = 0.4;

    function money(n) {
        return '$' + (Math.round(n * 100) / 100).toFixed(2);
    }

    function escapeHtml(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function seedCart() {
        return [
            { id: 'tropic-glow', name: 'Tropic Glow', flavor: 'Mango · Passionfruit', price: 58, image: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=500&q=80', qty: 2 },
            { id: 'sunrise-blend', name: 'Sunrise Blend', flavor: 'Orange · Pineapple · Ginger', price: 54, image: 'https://images.unsplash.com/photo-1553787499-6f9133860278?auto=format&fit=crop&w=500&q=80', qty: 1 }
        ];
    }

    function getCart() {
        try {
            var raw = localStorage.getItem(KEY);
            if (!raw) {
                var s = seedCart();
                localStorage.setItem(KEY, JSON.stringify(s));
                return s;
            }
            var arr = JSON.parse(raw);
            return Array.isArray(arr) ? arr : seedCart();
        } catch (err) {
            return seedCart();
        }
    }

    function saveCart(cart) {
        localStorage.setItem(KEY, JSON.stringify(cart));
        window.dispatchEvent(new CustomEvent('vintage:cartchange'));
    }

    function cartCount(cart) {
        return cart.reduce(function (n, i) { return n + (Number(i.qty) || 1); }, 0);
    }

    var listEl = document.getElementById('cartList');
    var emptyEl = document.getElementById('cartEmpty');
    var layoutEl = document.getElementById('cartLayout');
    var subtotalAmt = document.getElementById('subtotalAmt');
    var shippingAmt = document.getElementById('shippingAmt');
    var discountAmt = document.getElementById('discountAmt');
    var totalAmt = document.getElementById('totalAmt');
    var checkoutBtn = document.getElementById('checkoutBtn');

    function updateBadge(cart) {
        var el = document.getElementById('cartCount');
        if (el) el.textContent = String(cartCount(cart));
    }

    function itemCard(item) {
        var qty = Number(item.qty) || 1;
        var price = Number(item.price) || 0;
        var img = item.image || '';
        var line = money(price * qty);
        return (
            '<article class="cart-item" data-id="' + escapeHtml(item.id) + '">' +
                '<img src="' + escapeHtml(img) + '" alt="' + escapeHtml(item.name) + '">' +
                '<div class="cart-item-main">' +
                    '<h3>' + escapeHtml(item.name) + '</h3>' +
                    '<span>' + escapeHtml(item.flavor || '') + '</span>' +
                '</div>' +
                '<span class="cart-item-price">' + line + '</span>' +
                '<div class="qty-stepper">' +
                    '<button type="button" data-act="dec" aria-label="Decrease quantity">−</button>' +
                    '<output>' + qty + '</output>' +
                    '<button type="button" data-act="inc" aria-label="Increase quantity">+</button>' +
                '</div>' +
                '<button type="button" class="cart-item-remove" data-act="remove" aria-label="Remove from cart">' +
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>' +
                '</button>' +
            '</article>'
        );
    }

    function updateTotals(cart) {
        var subtotal = cart.reduce(function (s, i) {
            return s + (Number(i.price) || 0) * (Number(i.qty) || 1);
        }, 0);
        var shipping = subtotal === 0 ? 0 : (subtotal >= FREE_SHIP ? 0 : SHIP_FEE);
        var discount = Math.round(subtotal * DISCOUNT_RATE * 100) / 100;
        var total = subtotal + shipping - discount;
        subtotalAmt.textContent = money(subtotal);
        shippingAmt.textContent = shipping === 0 ? 'Free' : money(shipping);
        discountAmt.textContent = '– ' + money(discount);
        totalAmt.textContent = money(total);
    }

    function render() {
        var cart = getCart();
        var count = cartCount(cart);
        if (count === 0) {
            emptyEl.classList.add('show');
            layoutEl.style.display = 'none';
            updateBadge(cart);
            return;
        }
        emptyEl.classList.remove('show');
        layoutEl.style.display = 'grid';
        listEl.innerHTML = cart.map(itemCard).join('');
        updateTotals(cart);
        updateBadge(cart);
    }

    function showToast(message) {
        var toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            toast.id = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(function () { toast.classList.remove('show'); }, 2400);
    }

    if (listEl) {
        listEl.addEventListener('click', function (e) {
            var btn = e.target.closest('button[data-act]');
            if (!btn) return;
            var row = btn.closest('.cart-item');
            if (!row) return;
            var cart = getCart();
            var idx = cart.findIndex(function (i) { return String(i.id) === row.getAttribute('data-id'); });
            if (idx === -1) return;
            var act = btn.getAttribute('data-act');
            if (act === 'inc') {
                cart[idx].qty = (Number(cart[idx].qty) || 1) + 1;
            } else if (act === 'dec') {
                cart[idx].qty = Math.max(1, (Number(cart[idx].qty) || 1) - 1);
            } else if (act === 'remove') {
                cart.splice(idx, 1);
            }
            saveCart(cart);
            render();
        });

        window.addEventListener('vintage:cartchange', render);
        window.addEventListener('storage', function (e) {
            if (e.key === KEY) render();
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function () {
            var cart = getCart();
            if (cartCount(cart) === 0) {
                showToast('Your cart is empty');
                return;
            }
            saveCart([]);
            render();
            showToast('Order placed — pressed at 6 AM!');
        });
    }

    render();
})();