import { useState } from "react";
import { toast } from "react-toastify";
import { updateProduct } from "../services/productService";
import "./AddProductModal.css";

function EditProductModal({ product, onClose, onUpdated }) {
  const [formData, setFormData] = useState({
    name: product.name || "",
    category: product.category || "Jewellery",
    price: product.price || "",
    originalPrice: product.originalPrice || "",
    discount: product.discount || "",
    stock: product.stock || "",
    description: product.description || "",
  });

  const [existingImages] = useState(() => {
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    return product.image ? [product.image] : [];
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.price || Number(formData.price) <= 0) newErrors.price = "Valid selling price is required";
    if (formData.stock === "" || Number(formData.stock) < 0) newErrors.stock = "Stock quantity is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveChanges = async () => {
    if (!validate()) return;

    try {
      await updateProduct(product.id, {
        name: formData.name.trim(),
        category: formData.category,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice || 0),
        discount: Number(formData.discount || 0),
        stock: Number(formData.stock),
        description: formData.description,
        ...(existingImages.length > 0
          ? { image: existingImages[0], images: existingImages }
          : {}),
      });

      toast.success("Product updated successfully");
      onUpdated();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update product");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-box-header">
          <h2>Edit Product</h2>
          <button className="modal-box-close" onClick={onClose} aria-label="Close">
            &#10005;
          </button>
        </div>

        <div className="modal-box-body">
          {/* Existing images */}
          {existingImages.length > 0 && (
            <>
              <div className="modal-section-label">Current Images</div>
              <div className="modal-image-preview">
                {existingImages.map((url, index) => (
                  <div key={index} className="modal-image-preview-item">
                    <img src={url} alt={`${product.name} ${index + 1}`} />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Product Info Section */}
          <div className="modal-section-label">Product Information</div>

          <div className="modal-field">
            <label>
              Product Name <span className="required">*</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Product Name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
              }}
            />
            {errors.name && <div className="field-error">{errors.name}</div>}
          </div>

          <div className="modal-field">
            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option>Jewellery</option>
              <option>Fashion</option>
            </select>
          </div>

          <div className="modal-field">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Describe the product..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Pricing Section */}
          <div className="modal-section-label">Pricing &amp; Inventory</div>

          <div className="modal-field-row">
            <div className="modal-field">
              <label>
                Selling Price (INR) <span className="required">*</span>
              </label>
              <input
                type="number"
                name="price"
                placeholder="e.g. 499"
                value={formData.price}
                onChange={(e) => {
                  setFormData({ ...formData, price: e.target.value });
                  if (errors.price) setErrors((prev) => ({ ...prev, price: "" }));
                }}
                min="0"
              />
              {errors.price && <div className="field-error">{errors.price}</div>}
            </div>

            <div className="modal-field">
              <label>Original Price (INR)</label>
              <input
                type="number"
                name="originalPrice"
                placeholder="e.g. 999"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                min="0"
              />
            </div>
          </div>

          <div className="modal-field-row">
            <div className="modal-field">
              <label>Discount %</label>
              <input
                type="number"
                name="discount"
                placeholder="e.g. 50"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                min="0"
                max="100"
              />
            </div>

            <div className="modal-field">
              <label>
                Stock Quantity <span className="required">*</span>
              </label>
              <input
                type="number"
                name="stock"
                placeholder="e.g. 25"
                value={formData.stock}
                onChange={(e) => {
                  setFormData({ ...formData, stock: e.target.value });
                  if (errors.stock) setErrors((prev) => ({ ...prev, stock: "" }));
                }}
                min="0"
              />
              {errors.stock && <div className="field-error">{errors.stock}</div>}
            </div>
          </div>
        </div>

        <div className="modal-box-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="save-btn" onClick={saveChanges}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditProductModal;
