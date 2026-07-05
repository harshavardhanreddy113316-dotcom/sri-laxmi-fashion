import { useState } from "react";
import { updateProduct } from "../services/productService";
import "./AddProductModal.css";

function EditProductModal({
  product,
  onClose,
  onUpdated,
}) {
  const [formData, setFormData] = useState({
    name: product.name || "",
    category: product.category || "Jewellery",
    price: product.price || "",
    stock: product.stock || "",
    description: product.description || "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const saveChanges = async () => {
    console.log("PRODUCT:", product);
console.log("PRODUCT ID:", product.id, typeof product.id);

    try {
      await updateProduct(product.id, {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
      });

      alert("✅ Product Updated");

      onUpdated();

      onClose();
    } catch (error) {
      console.error(error);
      alert("Update Failed");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">

        <h2>✏ Edit Product</h2>

        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Product Name"
        />

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
        >
          <option>Jewellery</option>
          <option>Fashion</option>
        </select>

        <input
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          placeholder="Price"
        />

        <input
          name="stock"
          type="number"
          value={formData.stock}
          onChange={handleChange}
          placeholder="Stock"
        />

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
        />

        <div className="modal-buttons">

          <button
            className="cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="save-btn"
            onClick={saveChanges}
          >
            Save Changes
          </button>

        </div>

      </div>
    </div>
  );
}

export default EditProductModal;