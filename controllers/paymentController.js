// const instance  = require("../server.js");
const Razorpay = require('razorpay')
const crypto = require("crypto");
// const Payment = require("../server.js");
// const Payment = require("../server.js").Payment; 

require('dotenv').config();


const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});


const checkout = async (req, res) => {
  const options = {
    amount: Number(req.body.amount * 100),
    currency: 'INR',
  };
  try {
    const order = await instance.orders.create(options);

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create order',
    });
  }
};

const paymentVerification = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

    console.log('Request Body:', req.body);

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  console.log('Body:', body); 

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
    .update(body.toString())
    .digest("hex");

    console.log('Expected Signature:', expectedSignature, "Razorpay signature", razorpay_signature);

  const isAuthentic = expectedSignature === razorpay_signature;

  console.log('Is Authentic:', isAuthentic);

  if (isAuthentic) {
    try {
const Payment = require("../server.js").Payment; 
      
      await Payment.create({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });

      res.redirect(
        `https://watchflixott.netlify.app/success?reference=${razorpay_payment_id}`
      );
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create payment entry',
      });
    }
  } else {
    res.status(400).json({
      success: false,
      error: 'Payment verification failed',
    });
  }
};

module.exports = {
  checkout,
  paymentVerification,
};



