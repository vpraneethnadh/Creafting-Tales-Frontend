const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");

initializeApp();

const db = getFirestore();

// Keep functions in a single region.
setGlobalOptions({
  region: "asia-south1",
});

// ============================================================
// ADMIN EMAIL
// ============================================================

const ADMIN_EMAIL = "vpraneethnadh@gmail.com";

// ============================================================
// HELPERS
// ============================================================

const escapeHtml = (value) => {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const formatPrice = (value) => {
  const amount = Number(value) || 0;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const buildItemsHtml = (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    return "<p>No items found.</p>";
  }

  return `
    <table
      style="
        width:100%;
        border-collapse:collapse;
        margin-top:20px;
        font-family:Arial,sans-serif;
      "
    >
      <thead>
        <tr>
          <th
            style="
              text-align:left;
              padding:10px;
              border-bottom:1px solid #eadfdb;
            "
          >
            Product
          </th>

          <th
            style="
              text-align:center;
              padding:10px;
              border-bottom:1px solid #eadfdb;
            "
          >
            Qty
          </th>

          <th
            style="
              text-align:right;
              padding:10px;
              border-bottom:1px solid #eadfdb;
            "
          >
            Price
          </th>
        </tr>
      </thead>

      <tbody>
        ${items
          .map(
            (item) => `
              <tr>
                <td
                  style="
                    padding:10px;
                    border-bottom:1px solid #f0e8e5;
                  "
                >
                  ${escapeHtml(item.name)}
                </td>

                <td
                  style="
                    text-align:center;
                    padding:10px;
                    border-bottom:1px solid #f0e8e5;
                  "
                >
                  ${Number(item.quantity) || 0}
                </td>

                <td
                  style="
                    text-align:right;
                    padding:10px;
                    border-bottom:1px solid #f0e8e5;
                  "
                >
                  ${formatPrice(
                    (Number(item.price) || 0) *
                      (Number(item.quantity) || 0)
                  )}
                </td>
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
  `;
};

// ============================================================
// NEW ORDER EMAIL FUNCTION
// ============================================================
//
// Trigger:
// orders/{orderId}
//
// Whenever Checkout creates a new order, this function runs.
//
// It creates:
// 1. Admin email
// 2. Customer confirmation email
//
// The Firebase Trigger Email extension watches the "mail"
// collection and actually sends these emails.
// ============================================================

exports.sendOrderEmails = onDocumentCreated(
  "orders/{orderId}",
  async (event) => {
    const snapshot = event.data;

    if (!snapshot) {
      console.error("Order snapshot is missing.");
      return;
    }

    const order = snapshot.data();

    if (!order) {
      console.error("Order data is missing.");
      return;
    }

    const orderId = event.params.orderId;

    const customer = order.customer || {};

    const customerEmail = customer.email;

    const customerName = customer.fullName || "Customer";

    const orderNumber =
      order.orderNumber || orderId;

    const total = formatPrice(order.total);

    const items = Array.isArray(order.items)
      ? order.items
      : [];

    const itemsHtml = buildItemsHtml(items);

    // ========================================================
    // ADMIN EMAIL
    // ========================================================

    const adminSubject =
      `New Order ${orderNumber} - Crafting Tales`;

    const adminHtml = `
      <div
        style="
          max-width:700px;
          margin:0 auto;
          padding:30px;
          background:#fffaf8;
          color:#152d50;
          font-family:Arial,sans-serif;
        "
      >

        <h1
          style="
            color:#152d50;
            margin-bottom:5px;
          "
        >
          New Order Received
        </h1>

        <p
          style="
            color:#c95b78;
            font-weight:bold;
            letter-spacing:1px;
          "
        >
          CRAFTING TALES
        </p>

        <div
          style="
            background:#ffffff;
            border:1px solid #eadfdb;
            border-radius:12px;
            padding:20px;
            margin-top:20px;
          "
        >

          <p>
            <strong>Order Number:</strong>
            ${escapeHtml(orderNumber)}
          </p>

          <p>
            <strong>Order ID:</strong>
            ${escapeHtml(orderId)}
          </p>

          <p>
            <strong>Customer:</strong>
            ${escapeHtml(customerName)}
          </p>

          <p>
            <strong>Email:</strong>
            ${escapeHtml(customerEmail)}
          </p>

          <p>
            <strong>Phone:</strong>
            ${escapeHtml(customer.phone)}
          </p>

          <p>
            <strong>Payment:</strong>
            ${escapeHtml(order.paymentMethod || "Cash on Delivery")}
          </p>

          <p>
            <strong>Payment Status:</strong>
            ${escapeHtml(order.paymentStatus || "Pending")}
          </p>

          <p>
            <strong>Order Status:</strong>
            ${escapeHtml(order.status || "Order Placed")}
          </p>

          <h2 style="margin-top:25px;">
            Delivery Address
          </h2>

          <p>
            ${escapeHtml(customer.address)}<br/>
            ${escapeHtml(customer.city)},
            ${escapeHtml(customer.state)}
            - ${escapeHtml(customer.pincode)}
          </p>

        </div>

        <h2 style="margin-top:30px;">
          Ordered Items
        </h2>

        ${itemsHtml}

        <div
          style="
            margin-top:25px;
            padding:20px;
            background:#ffffff;
            border-radius:12px;
            border:1px solid #eadfdb;
            text-align:right;
          "
        >
          <strong
            style="
              font-size:20px;
              color:#c95b78;
            "
          >
            Total: ${total}
          </strong>
        </div>

      </div>
    `;

    // ========================================================
    // CUSTOMER EMAIL
    // ========================================================

    const customerSubject =
      `Order Confirmation - ${orderNumber} | Crafting Tales`;

    const customerHtml = `
      <div
        style="
          max-width:700px;
          margin:0 auto;
          padding:30px;
          background:#fffaf8;
          color:#152d50;
          font-family:Arial,sans-serif;
        "
      >

        <p
          style="
            color:#c95b78;
            font-weight:bold;
            letter-spacing:2px;
          "
        >
          CRAFTING TALES
        </p>

        <h1>
          Thank you for your order!
        </h1>

        <p>
          Hi ${escapeHtml(customerName)},
        </p>

        <p>
          We've received your order and it has been
          successfully placed.
        </p>

        <div
          style="
            background:#ffffff;
            border:1px solid #eadfdb;
            border-radius:12px;
            padding:20px;
            margin:25px 0;
          "
        >

          <p>
            <strong>Order Number:</strong>
            ${escapeHtml(orderNumber)}
          </p>

          <p>
            <strong>Order Status:</strong>
            ${escapeHtml(order.status || "Order Placed")}
          </p>

          <p>
            <strong>Payment Method:</strong>
            ${escapeHtml(
              order.paymentMethod || "Cash on Delivery"
            )}
          </p>

          <p>
            <strong>Payment Status:</strong>
            ${escapeHtml(
              order.paymentStatus || "Pending"
            )}
          </p>

        </div>

        <h2>
          Your Items
        </h2>

        ${itemsHtml}

        <div
          style="
            margin-top:25px;
            padding:20px;
            background:#ffffff;
            border-radius:12px;
            border:1px solid #eadfdb;
            text-align:right;
          "
        >
          <strong
            style="
              font-size:20px;
              color:#c95b78;
            "
          >
            Total: ${total}
          </strong>
        </div>

        <h2 style="margin-top:30px;">
          Delivery Address
        </h2>

        <p>
          ${escapeHtml(customer.address)}<br/>
          ${escapeHtml(customer.city)},
          ${escapeHtml(customer.state)}
          - ${escapeHtml(customer.pincode)}
        </p>

        <p style="margin-top:30px;">
          We'll keep you updated as your order moves
          through the delivery process.
        </p>

        <p>
          Thank you for supporting Crafting Tales ❤️
        </p>

      </div>
    `;

    // ========================================================
    // CREATE ADMIN EMAIL
    // ========================================================

    await db.collection("mail").add({
      to: ADMIN_EMAIL,

      message: {
        subject: adminSubject,
        html: adminHtml,
        text: `
New order received.

Order Number: ${orderNumber}
Customer: ${customerName}
Email: ${customerEmail}
Phone: ${customer.phone}

Total: ${total}

Payment Method: ${
          order.paymentMethod || "Cash on Delivery"
        }

Order Status: ${
          order.status || "Order Placed"
        }
        `,
      },

      orderId,
      type: "admin-order-notification",
      createdAt: new Date(),
    });

    // ========================================================
    // CREATE CUSTOMER EMAIL
    // ========================================================

    if (customerEmail) {
      await db.collection("mail").add({
        to: customerEmail,

        message: {
          subject: customerSubject,
          html: customerHtml,
          text: `
Hi ${customerName},

Thank you for your order!

Your order ${orderNumber} has been successfully placed.

Total: ${total}

Payment Method: ${
            order.paymentMethod || "Cash on Delivery"
          }

Order Status: ${
            order.status || "Order Placed"
          }

Thank you for supporting Crafting Tales.
          `,
        },

        orderId,
        type: "customer-order-confirmation",
        createdAt: new Date(),
      });
    } else {
      console.warn(
        `No customer email found for order ${orderNumber}`
      );
    }

    console.log(
      `Order emails queued for ${orderNumber}`
    );
  }
);