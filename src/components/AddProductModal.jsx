import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import axios from "axios";
import "./AddProductModal.css";

function AddProductModal({
  onClose,
  productList,
  setProductList,
}) {
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

 const handleImageUpload = (e) => {
  const files = Array.from(e.target.files);

  setImages(files);
};
  

 const saveProduct = async () => {
  if (
    !product.name ||
    !product.price ||
    !product.stock
  ) {
    alert("Please fill all required fields.");
    return;
  }

  try {
    const uploadedImages = [];

    for (const image of images) {
      const formData = new FormData();

      formData.append("file", image);
      formData.append(
        "upload_preset",
        "srilaxmifashion"
      );

      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/i2lem7e7/image/upload",
        formData
      );

      uploadedImages.push(
        response.data.secure_url
      );
    }

    const newProduct = {
      ...product,

      image:
        uploadedImages.length > 0
          ? uploadedImages[0]
          : "",

      images: uploadedImages,

      price: Number(product.price),
      originalPrice: Number(
        product.originalPrice || 0
      ),
      discount: Number(
        product.discount || 0
      ),
      stock: Number(product.stock),
    };

    const docRef = await addDoc(
      collection(db, "products"),
      newProduct
    );

    setProductList((prev) => [
      ...prev,
      {
        ...newProduct,
        id: docRef.id,
      },
    ]);

    alert("✅ Product Added Successfully");

    onClose();
  } catch (error) {
    console.error(error);

    alert(
      "❌ Failed to upload image. Check Cloudinary settings."
    );
  }
};

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>➕ Add Product</h2>

    <h3>📷 Product Images</h3>

<input
  type="file"
  multiple
  accept="image/*"
  onChange={handleImageUpload}
/>

<div
  style={{
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "20px",
  }}
>
  {images.map((img, index) => (
    <img
      key={index}
      src={URL.createObjectURL(img)}
      alt="Preview"
      style={{
        width: "80px",
        height: "80px",
        objectFit: "cover",
        borderRadius: "10px",
        border: "2px solid #374151",
      }}
    />
  ))}
</div>  

        <input
          type="text"
          placeholder="Product Name *"
          value={product.name}
          onChange={(e) =>
            setProduct({
              ...product,
              name: e.target.value,
            })
          }
        />

        <select
          value={product.category}
          onChange={(e) =>
            setProduct({
              ...product,
              category: e.target.value,
            })
          }
        >
          <option>Jewellery</option>
          <option>Fashion</option>
        </select>

        <input
          type="number"
          placeholder="Selling Price *"
          value={product.price}
          onChange={(e) =>
            setProduct({
              ...product,
              price: e.target.value,
            })
          }
        />

        <input
          type="number"
          placeholder="Original Price (Optional)"
          value={product.originalPrice}
          onChange={(e) =>
            setProduct({
              ...product,
              originalPrice: e.target.value,
            })
          }
        />

        <input
          type="number"
          placeholder="Discount % (Optional)"
          value={product.discount}
          onChange={(e) =>
            setProduct({
              ...product,
              discount: e.target.value,
            })
          }
        />

        <input
          type="number"
          placeholder="Stock *"
          value={product.stock}
          onChange={(e) =>
            setProduct({
              ...product,
              stock: e.target.value,
            })
          }
        />

        <textarea
          placeholder="Description"
          value={product.description}
          onChange={(e) =>
            setProduct({
              ...product,
              description: e.target.value,
            })
          }
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
            onClick={saveProduct}
          >
            Save Product
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddProductModal;