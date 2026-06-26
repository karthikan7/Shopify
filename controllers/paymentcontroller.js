const Razorpay = require('razorpay');
const crypto   = require('crypto');

const createOrder = async (req, res) => {
  try {

     const amount = Number(req.body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        message: 'A valid order amount is required'
      });
    }

    const instance = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      //The amount received is:
      //req.body.amount
      amount:   req.body.amount * 100,  // paise
      currency: "INR",
    };

    const order = await instance.orders.create(options);
    if (!order) return res.status(500).json({ message: "Razorpay order creation failed" });
    //this contain payment req id

    res.json(order);//This sends a request from your backend to Razorpay:
      //“Create a payment request for ₹52,000.”
    // send: { id, amount, currency }
      // id = Razorpay order ID

//    Razorpay responds with data similar to:

// {
//   id: 'order_RZP_1001',
//   amount: 5200000,
//   currency: 'INR',
//   status: 'created'
// }

// Your backend sends it to frontend:

  } catch (error) {
    res.status(500).json({ message: error.message || "Payment initialization failed" });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment verification fields" });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      return res.status(200).json({ message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ message: "Invalid payment signature" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, verifyPayment };
