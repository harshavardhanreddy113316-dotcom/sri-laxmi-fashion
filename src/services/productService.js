import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";

const productsCollection = collection(db, "products");

// Get all products
export const getProducts = async () => {
  const snapshot = await getDocs(productsCollection);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
};

// Add new product
export const addProduct = async (product) => {
  const docRef = await addDoc(productsCollection, product);

  return {
  ...product,
  id: docRef.id,
};
};

// Delete product
export const deleteProduct = async (id) => {
  await deleteDoc(doc(db, "products", id));
};

// Update product
export const updateProduct = async (id, updatedData) => {
  await updateDoc(
    doc(db, "products", id),
    updatedData
  );
};