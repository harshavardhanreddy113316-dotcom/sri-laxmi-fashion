import { useState, useRef } from "react";
import { toast } from "react-toastify";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { supabase } from "../supabase";
import "./AddProductModal.css";

function AddProductModal({ onClose, productList, setProductList }) {
  const [product, setProduct] = useState({
    name: "",
    category: "Jewellery",
    price: "",
    originalPrice: "",
    discount: "",
    stock: "",
    description: "",
  });

  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};
    if (!product.name.trim()) newErrors.name = "Product name is required";
    if (!product.price || Number(product.price) <= 0) newErrors.price = "Valid selling price is required";
    if (!product.stock || Number(product.stock) < 0) newErrors.stock = "Stock quantity is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveProduct = async () => {
    if (!validate()) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadedImages = [];
      const total = images.length || 1;

      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const fileExt = image.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, image, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        uploadedImages.push(data.publicUrl);
        setUploadProgress(Math.round(((i + 1) / total) * 100));
      }

      const newProduct = {
        ...product,
        image: uploadedImages.length > 0 ? uploadedImages[0] : "",
        images: uploadedImages,
        price: Number(product.price),
        originalPrice: Number(product.originalPrice || 0),
        discount: Number(product.discount || 0),
        stock: Number(product.stock),
      };

      const docRef = await addDoc(collection(db, "products"), newProduct);

      setProductList((prev) => [...prev, { ...newProduct, id: docRef.id }]);
      toast.success("Product added successfully");
      onClose();
    } catch (error) {
      console.error("Product upload error:", error);
      toast.error("Failed to upload product. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-box-header">
          <h2>Add Product</h2>
          <button className="modal-box-close" onClick={onClose} aria-label="Close">
            &#10005;
          </button>
        </div>

        <div className="modal-box-body">
          {/* Media Section */}
          <div className="modal-section-label">Product Images</div>

          <div
            className="modal-image-upload"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="modal-image-upload-icon">&#128247;</div>
            <p>Click to upload images</p>
            <span>JPG, PNG, WEBP &middot; Multiple files supported</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: "none" }}
          />

          {images.length > 0 && (
            <div className="modal-image-preview">
              {images.map((img, index) => (
                <div key={index} className="modal-image-preview-item">
                  <img src={URL.createObjectURL(img)} alt={`Preview ${index + 1}`} />
                  <button
                    className="remove-image-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    aria-label="Remove image"
                  >
                    &#10005;
                  </button>
                </div>
              ))}
            </div>
          )}

          {uploading && (
            <div className="modal-upload-progress">
              <div className="modal-upload-progress-bar">
                <div
                  className="modal-upload-progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="modal-upload-progress-text">
                Uploading... {uploadProgress}%
              </div>
            </div>
          )}

          {/* Product Info Section */}
          <div className="modal-section-label">Product Information</div>

          <div className="modal-field">
            <label>
              Product Name <span className="required">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Gold Necklace Set"
              value={product.name}
              onChange={(e) => {
                setProduct({ ...product, name: e.target.value });
                if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
              }}
            />
            {errors.name && <div className="field-error">{errors.name}</div>}
          </div>

          <div className="modal-field">
            <label>Category</label>
            <select
              value={product.category}
              onChange={(e) => setProduct({ ...product, category: e.target.value })}
            >
              <option>Jewellery</option>
              <option>Fashion</option>
            </select>
          </div>

          <div className="modal-field">
            <label>Description</label>
            <textarea
              placeholder="Describe the product..."
              value={product.description}
              onChange={(e) => setProduct({ ...product, description: e.target.value })}
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
                placeholder="e.g. 499"
                value={product.price}
                onChange={(e) => {
                  setProduct({ ...product, price: e.target.value });
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
                placeholder="e.g. 999"
                value={product.originalPrice}
                onChange={(e) => setProduct({ ...product, originalPrice: e.target.value })}
                min="0"
              />
            </div>
          </div>

          <div className="modal-field-row">
            <div className="modal-field">
              <label>Discount %</label>
              <input
                type="number"
                placeholder="e.g. 50"
                value={product.discount}
                onChange={(e) => setProduct({ ...product, discount: e.target.value })}
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
                placeholder="e.g. 25"
                value={product.stock}
                onChange={(e) => {
                  setProduct({ ...product, stock: e.target.value });
                  if (errors.stock) setErrors((prev) => ({ ...prev, stock: "" }));
                }}
                min="0"
              />
              {errors.stock && <div className="field-error">{errors.stock}</div>}
            </div>
          </div>
        </div>

        <div className="modal-box-footer">
          <button className="cancel-btn" onClick={onClose} disabled={uploading}>
            Cancel
          </button>
          <button
            className="save-btn"
            onClick={saveProduct}
            disabled={uploading}
          >
            {uploading ? `Uploading... ${uploadProgress}%` : "Save Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddProductModal;
