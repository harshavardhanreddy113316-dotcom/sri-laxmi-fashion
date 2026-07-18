const express = require("express");
const cors = require("cors");
require("dotenv").config();
console.log("Backend Key:", process.env.RAZORPAY_KEY_ID);
const Razorpay = require("razorpay");
const razorpay = new Razorpay({
 key_id: process.env.RAZORPAY_KEY_ID,
 key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Sri Laxmi Fashion Backend is Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to create order",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});