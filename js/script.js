const API_URL =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://localhost:3000"
        : "https://TU-BACKEND-WOMPI.onrender.com";
const WHATSAPP_PHONE = "573001234567";

let cartItemsData = [];

const cartPanel = document.getElementById("cart");
const cartButton = document.getElementById("cartButton");
const closeCart = document.getElementById("closeCart");
const overlay = document.getElementById("overlay");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const paymentBtn = document.getElementById("paymentBtn");
const whatsappBtn = document.getElementById("whatsappBtn");
const paymentModal = document.getElementById("paymentModal");
const closePayment = document.getElementById("closePayment");
const wompiContainer = document.getElementById("wompiContainer");
const paymentSummary = document.getElementById("paymentSummary");

const formatPrice = value => {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    }).format(value);
};

function openCartPanel() {
    cartPanel.classList.add("active");
    overlay.classList.add("active");
    document.body.classList.add("no-scroll");
}

function closeCartPanel() {
    cartPanel.classList.remove("active");
    overlay.classList.remove("active");
    document.body.classList.remove("no-scroll");
}

cartButton.addEventListener("click", openCartPanel);
closeCart.addEventListener("click", closeCartPanel);

overlay.addEventListener("click", () => {
    closeCartPanel();
});

document.getElementById("emptyCartLink").addEventListener("click", closeCartPanel);

document.querySelectorAll(".add-cart").forEach(button => {
    button.addEventListener("click", () => {
        const id = button.dataset.id;
        const name = button.dataset.name;
        const price = Number(button.dataset.price);

        const existing = cartItemsData.find(item => item.id === id);

        if (existing) {
            existing.quantity++;
        } else {
            cartItemsData.push({
                id,
                name,
                price,
                quantity: 1
            });
        }

        updateCart();

        button.textContent = "Agregado ✓";

        setTimeout(() => {
            button.textContent = "Agregar al carrito";
        }, 1200);

        openCartPanel();
    });
});

function updateCart() {
    const totalQuantity = cartItemsData.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const total = cartItemsData.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    cartCount.textContent = totalQuantity;
    cartTotal.textContent = formatPrice(total);

    if (cartItemsData.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <span>🛒</span>
                <p>Tu carrito está vacío.</p>
                <a href="#catalogo" id="emptyCartLink">Ver catálogo</a>
            </div>
        `;

        document.getElementById("emptyCartLink").addEventListener(
            "click",
            closeCartPanel
        );

        return;
    }

    cartItems.innerHTML = cartItemsData.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-image">🧢</div>

            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>${formatPrice(item.price)}</p>

                <div class="quantity">
                    <button onclick="changeQuantity(${index}, -1)">−</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeQuantity(${index}, 1)">+</button>
                </div>
            </div>

            <button class="remove-item" onclick="removeProduct(${index})">
                Eliminar
            </button>
        </div>
    `).join("");
}

function changeQuantity(index, amount) {
    cartItemsData[index].quantity += amount;

    if (cartItemsData[index].quantity <= 0) {
        cartItemsData.splice(index, 1);
    }

    updateCart();
}

function removeProduct(index) {
    cartItemsData.splice(index, 1);
    updateCart();
}

window.changeQuantity = changeQuantity;
window.removeProduct = removeProduct;

paymentBtn.addEventListener("click", async () => {
    if (cartItemsData.length === 0) {
        alert("Agrega productos al carrito antes de realizar el pago.");
        return;
    }

    paymentModal.classList.add("active");
    wompiContainer.innerHTML = `
        <div class="payment-loading">
            Preparando pago seguro...
        </div>
    `;

    paymentSummary.innerHTML = `
        <div class="payment-summary">
            ${cartItemsData.map(item => `
                <div>
                    <span>${item.name} x${item.quantity}</span>
                    <strong>${formatPrice(item.price * item.quantity)}</strong>
                </div>
            `).join("")}

            <div class="summary-total">
                <span>Total</span>
                <strong>${cartTotal.textContent}</strong>
            </div>
        </div>
    `;

    try {
        const response = await fetch(`${API_URL}/api/payment-data`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                items: cartItemsData.map(item => ({
                    id: item.id,
                    quantity: item.quantity
                }))
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "No fue posible preparar el pago.");
        }

        wompiContainer.innerHTML = "";

        const wompiScript = document.createElement("script");

        wompiScript.src = "https://checkout.wompi.co/widget.js";
        wompiScript.setAttribute("data-render", "button");
        wompiScript.setAttribute("data-public-key", data.publicKey);
        wompiScript.setAttribute("data-currency", data.currency);
        wompiScript.setAttribute("data-amount-in-cents", data.amountInCents);
        wompiScript.setAttribute("data-reference", data.reference);
        wompiScript.setAttribute("data-signature:integrity", data.signature);
        wompiScript.setAttribute(
            "data-redirect-url",
            `${window.location.origin}/?pago=finalizado`
        );

        wompiContainer.appendChild(wompiScript);

    } catch (error) {
        wompiContainer.innerHTML = `
            <div class="payment-error">
                <p>No fue posible conectar con el sistema de pago.</p>
                <small>${error.message}</small>
            </div>
        `;
    }
});

closePayment.addEventListener("click", () => {
    paymentModal.classList.remove("active");
    wompiContainer.innerHTML = "";
});

paymentModal.addEventListener("click", event => {
    if (event.target === paymentModal) {
        paymentModal.classList.remove("active");
        wompiContainer.innerHTML = "";
    }
});

whatsappBtn.addEventListener("click", () => {
    if (cartItemsData.length === 0) {
        alert("Agrega productos al carrito antes de continuar.");
        return;
    }

    const phone = WHATSAPP_PHONE;

    const products = cartItemsData.map(item => {
        return `• ${item.name} x${item.quantity} - ${formatPrice(
            item.price * item.quantity
        )}`;
    }).join("\n");

    const total = cartItemsData.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const message = `Hola, quiero realizar el siguiente pedido en Gorras Vintage:

${products}

Total: ${formatPrice(total)}

Quisiera recibir información para continuar con mi pedido.`;

    window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
        "_blank"
    );
});

document.querySelectorAll(".filter").forEach(filter => {
    filter.addEventListener("click", () => {
        document.querySelectorAll(".filter").forEach(item => {
            item.classList.remove("active");
        });

        filter.classList.add("active");

        const category = filter.dataset.category;

        document.querySelectorAll(".product-card").forEach(product => {
            if (
                category === "todos" ||
                product.dataset.category === category
            ) {
                product.classList.remove("hidden-product");
            } else {
                product.classList.add("hidden-product");
            }
        });
    });
});

const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", () => {
    const search = searchInput.value.toLowerCase().trim();

    document.querySelectorAll(".product-card").forEach(product => {
        const name = product.dataset.name.toLowerCase();

        if (name.includes(search)) {
            product.classList.remove("hidden-product");
        } else {
            product.classList.add("hidden-product");
        }
    });
});

document.querySelectorAll(".faq-question").forEach(question => {
    question.addEventListener("click", () => {
        const current = question.parentElement;

        document.querySelectorAll(".faq-item").forEach(item => {
            if (item !== current) {
                item.classList.remove("open");
            }
        });

        current.classList.toggle("open");
    });
});

document.getElementById("contactForm").addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("contactName").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const subject = document.getElementById("contactSubject").value.trim();
    const message = document.getElementById("contactMessage").value.trim();

    const phone = WHATSAPP_PHONE;

    const whatsappMessage = `Hola, soy ${name}.

Correo: ${email}

Asunto: ${subject}

Mensaje:
${message}`;

    window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`,
        "_blank"
    );

    event.target.reset();
});

const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");

menuToggle.addEventListener("click", () => {
    nav.classList.toggle("active");
});

document.querySelectorAll(".nav a").forEach(link => {
    link.addEventListener("click", () => {
        nav.classList.remove("active");
    });
});

const observer = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.12
    }
);

document.querySelectorAll(".reveal").forEach(element => {
    observer.observe(element);
});

if (window.location.search.includes("pago=finalizado")) {
    setTimeout(() => {
        alert("Tu proceso de pago ha finalizado. Gracias por comprar en Gorras Vintage.");
    }, 500);
}

updateCart();