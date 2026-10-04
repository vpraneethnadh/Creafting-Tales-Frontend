import { useState } from "react";
import {
  db,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  collection,
  serverTimestamp,
  storage,
  storageRef,
  uploadBytes,
  getDownloadURL,
} from "../../firebase/firebase";
import { useProducts } from "../../context/ProductsContext";
import { useToast } from "../../context/ToastContext";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { formatPrice, getFirebaseErrorMessage } from "../../utils/helpers";
import { products as bundledProducts } from "../../data/products.js";

const bundledIds = new Set(bundledProducts.map((p) => String(p.id)));

const blank = {
  name: "",
  category: "",
  price: "",
  stock: "10",
  description: "",
  image: "",
  featured: false,
  hidden: false,
};

const AdminProducts = () => {
  const { allProducts, categories } = useProducts();
  const toast = useToast();

  const [editing, setEditing] = useState(null); // product | "new" | null
  const [form, setForm] = useState(blank);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [toRemove, setToRemove] = useState(null);

  const isBundled = (product) => bundledIds.has(String(product.id));

  const openEditor = (product) => {
    setFile(null);

    if (product === "new") {
      setForm({ ...blank, category: categories[0]?.name || "" });
    } else {
      setForm({
        name: product.name,
        category: product.category,
        price: String(product.price),
        stock: String(product.stock),
        description: product.description || "",
        image: isBundled(product) ? "" : product.image || "",
        featured: !!product.featured,
        hidden: !!product.hidden,
      });
    }

    setEditing(product);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!form.name.trim() || !form.category) {
      toast.error("Name and category are required.");
      return;
    }
    if (!(price > 0)) {
      toast.error("Enter a price greater than 0.");
      return;
    }
    if (!Number.isInteger(stock) || stock < 0) {
      toast.error("Stock must be a whole number (0 or more).");
      return;
    }

    const creating = editing === "new";

    if (creating && !form.image.trim() && !file) {
      toast.error("Add an image URL or choose an image file.");
      return;
    }

    setSaving(true);

    try {
      let image = form.image.trim();

      if (file) {
        try {
          const path = `products/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
          const fileRef = storageRef(storage, path);
          await uploadBytes(fileRef, file);
          image = await getDownloadURL(fileRef);
        } catch (err) {
          console.error("Image upload failed:", err);
          toast.error(
            "Image upload failed (is Firebase Storage enabled?). Paste an image URL instead."
          );
          setSaving(false);
          return;
        }
      }

      const data = {
        name: form.name.trim(),
        category: form.category,
        price,
        stock,
        description: form.description.trim(),
        featured: form.featured,
        hidden: form.hidden,
        updatedAt: serverTimestamp(),
      };

      if (image) data.image = image;

      if (creating) {
        await addDoc(collection(db, "products"), {
          ...data,
          rating: 5,
          createdAt: serverTimestamp(),
        });
      } else {
        await setDoc(doc(db, "products", String(editing.id)), data, {
          merge: true,
        });
      }

      toast.success(creating ? "Product added." : "Product updated.");
      setEditing(null);
    } catch (err) {
      console.error(err);
      toast.error(getFirebaseErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!toRemove) return;

    setSaving(true);

    try {
      if (isBundled(toRemove)) {
        // Built-in product: hide it from the shop (reversible).
        await setDoc(
          doc(db, "products", String(toRemove.id)),
          { hidden: true, updatedAt: serverTimestamp() },
          { merge: true }
        );
        toast.success("Product hidden from the shop.");
      } else {
        await deleteDoc(doc(db, "products", String(toRemove.id)));
        toast.success("Product deleted.");
      }

      setToRemove(null);
    } catch (err) {
      console.error(err);
      toast.error(getFirebaseErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const term = search.trim().toLowerCase();
  const visible = allProducts.filter(
    (p) =>
      !term ||
      `${p.name} ${p.category}`.toLowerCase().includes(term)
  );

  return (
    <div>
      <div className="admin-toolbar">
        <input
          type="search"
          placeholder="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search products"
        />

        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={() => openEditor("new")}
        >
          + Add product
        </button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th />
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {visible.map((product) => (
              <tr key={product.id} className={product.hidden ? "is-hidden" : ""}>
                <td>
                  <img
                    src={product.image}
                    alt=""
                    className="admin-thumb"
                    loading="lazy"
                  />
                </td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{formatPrice(product.price)}</td>
                <td className={product.stock <= 0 ? "admin-low" : ""}>
                  {product.stock}
                </td>
                <td>{product.hidden ? "Hidden" : "Live"}</td>
                <td className="admin-actions">
                  <button type="button" onClick={() => openEditor(product)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="admin-danger"
                    onClick={() => setToRemove(product)}
                    disabled={product.hidden && isBundled(product)}
                  >
                    {isBundled(product) ? "Hide" : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div
          className="dialog-backdrop"
          role="presentation"
          onClick={() => !saving && setEditing(null)}
        >
          <form
            className="dialog admin-form"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSave}
          >
            <h3>{editing === "new" ? "Add product" : "Edit product"}</h3>

            <label>
              Name
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>

            <div className="admin-form-row">
              <label>
                Category
                <select name="category" value={form.category} onChange={handleChange}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Price (₹)
                <input
                  name="price"
                  type="number"
                  min="1"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Stock
                <input
                  name="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <label>
              Description
              <textarea
                name="description"
                rows="3"
                value={form.description}
                onChange={handleChange}
              />
            </label>

            <label>
              Image URL {editing !== "new" && "(leave empty to keep current image)"}
              <input
                name="image"
                type="url"
                placeholder="https://..."
                value={form.image}
                onChange={handleChange}
              />
            </label>

            <label>
              ...or upload an image
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>

            <div className="admin-form-row admin-form-checks">
              <label className="admin-check">
                <input
                  type="checkbox"
                  name="featured"
                  checked={form.featured}
                  onChange={handleChange}
                />
                Featured on home page
              </label>

              <label className="admin-check">
                <input
                  type="checkbox"
                  name="hidden"
                  checked={form.hidden}
                  onChange={handleChange}
                />
                Hidden from shop
              </label>
            </div>

            <div className="dialog-actions">
              <button
                type="button"
                className="dialog-btn dialog-btn-secondary"
                onClick={() => setEditing(null)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="dialog-btn dialog-btn-primary"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={!!toRemove}
        title={toRemove && isBundled(toRemove) ? "Hide this product?" : "Delete this product?"}
        message={
          toRemove && isBundled(toRemove)
            ? "It will disappear from the shop. You can bring it back later by editing it and unticking 'Hidden'."
            : "This permanently removes the product."
        }
        confirmLabel={toRemove && isBundled(toRemove) ? "Hide" : "Delete"}
        cancelLabel="Cancel"
        danger
        busy={saving}
        onConfirm={handleRemove}
        onCancel={() => setToRemove(null)}
      />
    </div>
  );
};

export default AdminProducts;
