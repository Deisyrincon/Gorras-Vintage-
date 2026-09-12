const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const PRODUCTS = {
    "gorra-vintage-classic": {
        name: "Gorra Vintage Classic",
        price: 45000
    },
    "gorra-retro-street": {
        name: "Gorra Retro Street",
        price: 50000
    },
    "gorra-sport-vintage": {
        name: "Gorra Sport Vintage",
        price: 55000
    },
    "gorra-heritage": {
        name: "Gorra Heritage",
        price: 48000
    },
    "gorra-urban-retro": {
        name: "Gorra Urban Retro",
        price: 52000
    },
    "gorra-classic-sport": {
        name: "Gorra Classic Sport",
        price: 49000
    }
};

function createIntegritySignature(reference, amountInCents, currency) {
    const rawValue =
        `${reference}${amountInCents}${currency}${process.env.WOMPI_INTEGRITY_SECRET}`;

    return crypto
        .createHash("sha256")
        .update(rawValue)
        .digest("hex");
}

function createReference() {
    return `GV-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
}

app.get("/", (req, res) => {
    res.json({
        message: "Backend Gorras Vintage funcionando"
    });
});

app.post("/api/payment-data", (req, res) => {
    try {
        const { items } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                error: "El carrito está vacío."
            });
        }

        let total = 0;

        for (const item of items) {
            if (!item || !PRODUCTS[item.id]) {
                return res.status(400).json({
                    error: "Producto no válido."
                });
            }

            const quantity = Number(item.quantity);

            if (
                !Number.isInteger(quantity) ||
                quantity < 1 ||
                quantity > 20
            ) {
                return res.status(400).json({
                    error: "Cantidad de producto no válida."
                });
            }

            total += PRODUCTS[item.id].price * quantity;
        }

        const amountInCents = total * 100;
        const currency = "COP";
        const reference = createReference();

        const signature = createIntegritySignature(
            reference,
            amountInCents,
            currency
        );

        res.json({
            publicKey: process.env.WOMPI_PUBLIC_KEY,
            amountInCents,
            reference,
            currency,
            signature
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Error interno del servidor."
        });
    }
});

app.post("/api/wompi-webhook", (req, res) => {
    try {
        const event = req.body;

        if (!event || !event.signature) {
            return res.status(400).json({
                error: "Firma no encontrada."
            });
        }

        const properties = event.signature.properties || [];
        const timestamp = event.signature.timestamp;

        let concatenatedValues = "";

        for (const property of properties) {
            const value = property
                .split(".")
                .reduce((current, key) => {
                    return current?.[key];
                }, event.data);

            if (value === undefined || value === null) {
                return res.status(400).json({
                    error: "Propiedad de firma inválida."
                });
            }

            concatenatedValues += String(value);
        }

        concatenatedValues += timestamp;
        concatenatedValues += process.env.WOMPI_EVENTS_SECRET;

        const calculatedChecksum = crypto
            .createHash("sha256")
            .update(concatenatedValues)
            .digest("hex");

        const receivedChecksum =
            req.headers["x-event-checksum"] ||
            event.signature.checksum;

        if (calculatedChecksum !== receivedChecksum) {
            return res.status(401).json({
                error: "Firma inválida."
            });
        }

        const transaction = event.data?.transaction;

        if (transaction) {
            console.log({
                reference: transaction.reference,
                status: transaction.status,
                amount: transaction.amount_in_cents,
                currency: transaction.currency
            });
        }

        return res.status(200).json({
            received: true
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Error procesando webhook."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});