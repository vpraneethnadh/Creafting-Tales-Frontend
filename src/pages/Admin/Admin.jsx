import { useState } from "react";
import AdminOrders from "./AdminOrders";
import AdminProducts from "./AdminProducts";

const Admin = () => {
  const [tab, setTab] = useState("orders");

  return (
    <main className="admin-page">
      <section className="admin-container">

        <div className="orders-header">
          <p className="orders-eyebrow">ADMIN</p>
          <h1>Dashboard</h1>
          <p>Manage orders and products for Crafting Tales.</p>
        </div>

        <div className="admin-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "orders"}
            className={tab === "orders" ? "admin-tab active" : "admin-tab"}
            onClick={() => setTab("orders")}
          >
            Orders
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={tab === "products"}
            className={tab === "products" ? "admin-tab active" : "admin-tab"}
            onClick={() => setTab("products")}
          >
            Products
          </button>
        </div>

        {tab === "orders" ? <AdminOrders /> : <AdminProducts />}

      </section>
    </main>
  );
};

export default Admin;
