import {
  createContext,
  useState,
  useEffect,
} from "react";

import { toast } from "react-toastify";

export const CartContext = createContext();

function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart =
      localStorage.getItem("cartItems");

    return savedCart
      ? JSON.parse(savedCart)
      : [];
  });

  useEffect(() => {
    localStorage.setItem(
      "cartItems",
      JSON.stringify(cartItems)
    );
  }, [cartItems]);

 const addToCart = (product) => {
  const existingItem = cartItems.find(
    (item) => item.name === product.name
  );

  if (existingItem) {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.name === product.name
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );

    toast.success("🛍 Cart Updated!");
  } else {
    setCartItems((prevItems) => [
      ...prevItems,
      {
        ...product,
        quantity: 1,
      },
    ]);

    toast.success("🛒 Added to Cart!");
  }
};

  const removeFromCart = (id) => {
    toast.info("🗑 Item Removed");

    setCartItems((prevItems) =>
      prevItems.filter(
        (item, index) =>
          index !== id
      )
    );
  };

  const clearCart = () => {
    toast.info("🛒 Cart Cleared");
    setCartItems([]);
  };

  const increaseQuantity = (name) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.name === name
          ? {
              ...item,
              quantity:
                item.quantity + 1,
            }
          : item
      )
    );
  };

  const decreaseQuantity = (name) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.name === name
            ? {
                ...item,
                quantity:
                  item.quantity - 1,
              }
            : item
        )
        .filter(
          (item) => item.quantity > 0
        )
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export default CartProvider;