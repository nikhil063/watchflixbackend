const instance  = require("../server.js");
const crypto = require("crypto");
// const Payment = require("../server.js");

const checkout = async (req, res) => {
  const options = {
    currency: 'INR',
    amount: Number(req.body.amount * 100),
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

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    try {
      const Payment = require("../server.js").Payment; 
      await Payment.create({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });

      res.redirect(
        `http://localhost:3000/success?reference=${razorpay_payment_id}`
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






