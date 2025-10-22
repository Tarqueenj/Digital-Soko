const stripe = require('../config/stripe');
const { AppError } = require('../utils/errorHandler');

/**
 * Create Stripe payment intent
 * @param {number} amount - Amount in cents
 * @param {string} currency - Currency code (default: usd)
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} Payment intent object
 */
exports.createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  } catch (error) {
    throw new AppError(`Payment intent creation failed: ${error.message}`, 400);
  }
};

/**
 * Confirm payment intent
 * @param {string} paymentIntentId - Payment intent ID
 * @returns {Promise<Object>} Confirmed payment intent
 */
exports.confirmPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    throw new AppError(`Payment confirmation failed: ${error.message}`, 400);
  }
};

/**
 * Retrieve payment intent
 * @param {string} paymentIntentId - Payment intent ID
 * @returns {Promise<Object>} Payment intent object
 */
exports.retrievePaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    throw new AppError(`Failed to retrieve payment: ${error.message}`, 400);
  }
};

/**
 * Create refund
 * @param {string} paymentIntentId - Payment intent ID
 * @param {number} amount - Amount to refund (optional, full refund if not specified)
 * @returns {Promise<Object>} Refund object
 */
exports.createRefund = async (paymentIntentId, amount = null) => {
  try {
    const refundData = { payment_intent: paymentIntentId };
    if (amount) {
      refundData.amount = Math.round(amount * 100);
    }

    const refund = await stripe.refunds.create(refundData);
    return refund;
  } catch (error) {
    throw new AppError(`Refund creation failed: ${error.message}`, 400);
  }
};

/**
 * Verify webhook signature
 * @param {string} payload - Request body
 * @param {string} signature - Stripe signature header
 * @returns {Object} Verified event object
 */
exports.verifyWebhookSignature = (payload, signature) => {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return event;
  } catch (error) {
    throw new AppError(`Webhook signature verification failed: ${error.message}`, 400);
  }
};

/**
 * Create customer in Stripe
 * @param {Object} customerData - Customer information
 * @returns {Promise<Object>} Stripe customer object
 */
exports.createCustomer = async (customerData) => {
  try {
    const customer = await stripe.customers.create({
      email: customerData.email,
      name: `${customerData.firstName} ${customerData.lastName}`,
      metadata: {
        userId: customerData.userId,
      },
    });
    return customer;
  } catch (error) {
    throw new AppError(`Customer creation failed: ${error.message}`, 400);
  }
};
