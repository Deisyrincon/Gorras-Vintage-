function createProductArt(label, primaryColor, secondaryColor) {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">
            <defs>
                <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="${primaryColor}"/>
                    <stop offset="100%" stop-color="${secondaryColor}"/>
                </linearGradient>
            </defs>
            <rect width="800" height="800" fill="url(#g)"/>
            <circle cx="660" cy="140" r="198" fill="rgba(255,255,255,0.12)"/>
            <circle cx="120" cy="700" r="220" fill="rgba(255,255,255,0.08)"/>
            <rect x="100" y="110" width="600" height="580" rx="28" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.55)"/>
            <text x="400" y="390" text-anchor="middle" font-size="150" font-family="Arial, sans-serif" font-weight="700" fill="rgba(255,255,255,0.95)">GV</text>
            <text x="400" y="560" text-anchor="middle" font-size="46" font-family="Arial, sans-serif" font-weight="700" fill="rgba(255,255,255,0.95)" letter-spacing="10">${label}</text>
        </svg>
    `;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const products = [
    {
        id: 1,
        name: "Vintage Classic Blue",
        category: "Clásicas",
        price: 65000,
        image: createProductArt("CLASSIC", "#174b9c", "#2865bd"),
        tag: "Más vendida"
    },
    {
        id: 2,
        name: "Retro Denim",
        category: "Retro",
        price: 70000,
        image: createProductArt("RETRO", "#1f3f75", "#4d7ad7"),
        tag: "Nueva"
    },
    {
        id: 3,
        name: "Old School Navy",
        category: "Urbanas",
        price: 75000,
        image: createProductArt("URBANA", "#0f2449", "#2d5fa6"),
        tag: "Popular"
    },
    {
        id: 4,
        name: "Blue Street",
        category: "Urbanas",
        price: 68000,
        image: createProductArt("STREET", "#14396d", "#7ca7e8"),
        tag: "Favorita"
    },
    {
        id: 5,
        name: "Retro Classic",
        category: "Retro",
        price: 72000,
        image: createProductArt("VINTAGE", "#184d8a", "#4aa5ff"),
        tag: "Nueva"
    },
    {
        id: 6,
        name: "Vintage 90s",
        category: "Clásicas",
        price: 78000,
        image: createProductArt("90S", "#0b2d63", "#5e88d0"),
        tag: "Edición especial"
    }
];

const productsGrid = document.getElementById("productsGrid");
const filters = document.querySelectorAll(".filter");
const cartButton = document.getElementById("openCart");
const cart = document.getElementById("cart");
const cartOverlay = document.getElementById("cartOverlay");
const closeCartButton = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");
const checkoutButton = document.getElementById("checkout");
const menuButton = document.getElementById("menuButton");
const navMenu = document.getElementById("navMenu");
const searchButton = document.getElementById("searchButton");
const searchBox = document.getElementById("searchBox");
const searchInput = document.getElementById("searchInput");
const closeSearchButton = document.getElementById("closeSearch");
const contactForm = document.getElementById("contactForm");
const loader = document.getElementById("loader");

let currentFilter = "all";
let searchTerm = "";
let cartData = [];

const categoryMap = {
    all: "all",
    clasicas: "Clásicas",
    urbanas: "Urbanas",
    especiales: "Retro",
    retro: "Retro"
};

function safeReadCart() {
    try {
        const stored = localStorage.getItem("gorrasVintageCart");
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

cartData = safeReadCart();

function normalizeText(text) {
    return String(text || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function formatPrice(price) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    }).format(price);
}

function renderProducts() {
    if (!productsGrid) return;

    const selectedCategory = categoryMap[currentFilter] || "all";
    const filteredProducts = products.filter(product => {
        const categoryMatch =
            selectedCategory === "all" || product.category === selectedCategory;

        const text = normalizeText(`${product.name} ${product.category} ${product.tag}`);
        const searchMatch =
            searchTerm === "" || text.includes(normalizeText(searchTerm));

        return categoryMatch && searchMatch;
    });

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="search-empty">
                <h3>NO ENCONTRAMOS ESA GORRA</h3>
                <p>Prueba con otro nombre o categoría</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = filteredProducts.map(product => `
        <article class="product-card">
            <div class="product-image">
                <span class="product-badge">${product.tag}</span>
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>

            <div class="product-info">
                <div class="product-meta">
                    <span>${product.category}</span>
                    <span>${product.tag}</span>
                </div>

                <h3>${product.name}</h3>
                <div class="product-line"></div>

                <div class="product-bottom">
                    <span class="product-price">${formatPrice(product.price)}</span>
                    <button type="button" class="product-button add-cart" data-id="${product.id}">+</button>
                </div>
            </div>
        </article>
    `).join("");

    observeElements();
}

function saveCart() {
    try {
        localStorage.setItem("gorrasVintageCart", JSON.stringify(cartData));
    } catch {
        // ignore storage errors
    }
}

function addToCart(id) {
    const product = products.find(item => item.id === id);
    if (!product) return;

    const existing = cartData.find(item => item.id === id);

    if (existing) {
        existing.quantity += 1;
    } else {
        cartData.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCart();
    openCart();
}

function removeFromCart(id) {
    cartData = cartData.filter(item => item.id !== id);
    saveCart();
    updateCart();
}

function changeQuantity(id, amount) {
    const item = cartData.find(product => product.id === id);
    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
        removeFromCart(id);
        return;
    }

    saveCart();
    updateCart();
}

function updateCart() {
    if (!cartItems || !cartTotal || !cartCount) return;

    if (cartData.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <h3>TU CARRITO ESTÁ VACÍO</h3>
                <p>Agrega una gorra y arma tu estilo.</p>
            </div>
        `;
        cartTotal.textContent = formatPrice(0);
        cartCount.textContent = "0";
        return;
    }

    cartItems.innerHTML = cartData.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>

            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <span>${formatPrice(item.price)}</span>

                <div class="cart-item-actions">
                    <button type="button" class="quantity-button" data-action="decrease" data-id="${item.id}">−</button>
                    <strong>${item.quantity}</strong>
                    <button type="button" class="quantity-button" data-action="increase" data-id="${item.id}">+</button>
                    <button type="button" class="remove-item" data-action="remove" data-id="${item.id}">ELIMINAR</button>
                </div>
            </div>
        </div>
    `).join("");

    const total = cartData.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const quantity = cartData.reduce((sum, item) => sum + item.quantity, 0);

    cartTotal.textContent = formatPrice(total);
    cartCount.textContent = quantity;
}

function openCart() {
    cart?.classList.add("active");
    cartOverlay?.classList.add("active");
    document.body.classList.add("no-scroll");
}

function closeCart() {
    cart?.classList.remove("active");
    cartOverlay?.classList.remove("active");
    document.body.classList.remove("no-scroll");
}

function openSearch() {
    searchBox?.classList.add("active");
    setTimeout(() => searchInput?.focus(), 200);
}

function closeSearch() {
    searchBox?.classList.remove("active");

    if (searchInput) {
        searchInput.value = "";
    }

    searchTerm = "";
    renderProducts();
}

function checkoutWhatsApp() {
    if (cartData.length === 0) {
        alert("Tu carrito está vacío");
        return;
    }

    const total = cartData.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = cartData.map(item => `• ${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity)}`).join("\n");
    const message = `Hola, quiero comprar estas gorras de Gorras Vintage:\n\n${order}\n\nTotal: ${formatPrice(total)}\n\nQuisiera confirmar disponibilidad y realizar el pedido.`;

    window.open(`https://wa.me/573244818035?text=${encodeURIComponent(message)}`, "_blank");
}

function observeElements() {
    const elements = document.querySelectorAll(
        ".product-card, .story-content, .story-image, .collection-card, .gallery-item, .review-card, .contact-info, .contact-form"
    );

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    elements.forEach(element => observer.observe(element));
}

function bindEvents() {
    filters.forEach(filter => {
        filter.addEventListener("click", () => {
            filters.forEach(item => item.classList.remove("active"));
            filter.classList.add("active");
            currentFilter = filter.dataset.filter || "all";
            renderProducts();
        });
    });

    productsGrid?.addEventListener("click", event => {
        const button = event.target.closest(".add-cart");
        if (!button) return;
        addToCart(Number(button.dataset.id));
    });

    cartItems?.addEventListener("click", event => {
        const button = event.target.closest("button");
        if (!button) return;

        const id = Number(button.dataset.id);
        const action = button.dataset.action;

        if (action === "increase") changeQuantity(id, 1);
        if (action === "decrease") changeQuantity(id, -1);
        if (action === "remove") removeFromCart(id);
    });

    cartButton?.addEventListener("click", openCart);
    closeCartButton?.addEventListener("click", closeCart);
    cartOverlay?.addEventListener("click", closeCart);
    checkoutButton?.addEventListener("click", checkoutWhatsApp);
    searchButton?.addEventListener("click", openSearch);
    closeSearchButton?.addEventListener("click", closeSearch);

    searchInput?.addEventListener("input", event => {
        searchTerm = event.target.value.trim();
        renderProducts();
    });

    menuButton?.addEventListener("click", () => {
        navMenu?.classList.toggle("active");
        menuButton?.classList.toggle("active");
    });

    navMenu?.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navMenu?.classList.remove("active");
            menuButton?.classList.remove("active");
        });
    });

    contactForm?.addEventListener("submit", event => {
        event.preventDefault();

        const name = document.getElementById("name")?.value.trim();
        const phone = document.getElementById("phone")?.value.trim();
        const message = document.getElementById("message")?.value.trim();

        if (!name || !phone || !message) {
            alert("Completa todos los campos");
            return;
        }

        const whatsappMessage = `Hola, soy ${name}.\n\nMi teléfono: ${phone}\n\n${message}\n\nQuiero recibir información sobre las gorras de Gorras Vintage.`;
        window.open(`https://wa.me/573244818035?text=${encodeURIComponent(whatsappMessage)}`, "_blank");
        contactForm.reset();
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeCart();
            closeSearch();
            navMenu?.classList.remove("active");
            menuButton?.classList.remove("active");
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener("click", event => {
            const targetId = link.getAttribute("href");
            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);
            if (!target) return;

            event.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });
}

function init() {
    bindEvents();
    renderProducts();
    updateCart();

    window.addEventListener("load", () => {
        setTimeout(() => {
            loader?.classList.add("hide");
            setTimeout(() => {
                if (loader) loader.style.display = "none";
            }, 500);
        }, 700);
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
