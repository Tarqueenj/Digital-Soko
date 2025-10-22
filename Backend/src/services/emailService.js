const { sendEmail } = require('../config/email');

/**
 * Send welcome email
 */
exports.sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to Our eCommerce Store!';
  const html = `
    <h1>Welcome ${user.firstName}!</h1>
    <p>Thank you for registering with us.</p>
    <p>We're excited to have you on board.</p>
    <p>Start shopping now and enjoy exclusive deals!</p>
    <br>
    <p>Best regards,<br>The eCommerce Team</p>
  `;
  const text = `Welcome ${user.firstName}! Thank you for registering with us.`;

  await sendEmail({ to: user.email, subject, html, text });
};

/**
 * Send password reset email
 */
exports.sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const subject = 'Password Reset Request';
  const html = `
    <h2>Password Reset Request</h2>
    <p>Hi ${user.firstName},</p>
    <p>You requested to reset your password. Click the link below to reset it:</p>
    <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
    <br>
    <p>Best regards,<br>The eCommerce Team</p>
  `;
  const text = `Hi ${user.firstName}, Click this link to reset your password: ${resetUrl}`;

  await sendEmail({ to: user.email, subject, html, text });
};

/**
 * Send order confirmation email
 */
exports.sendOrderConfirmationEmail = async (user, order) => {
  const subject = `Order Confirmation - ${order.orderNumber}`;
  
  const itemsList = order.items
    .map(
      (item) =>
        `<li>${item.name} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>`
    )
    .join('');

  const html = `
    <h2>Order Confirmation</h2>
    <p>Hi ${user.firstName},</p>
    <p>Thank you for your order! Your order has been confirmed.</p>
    
    <h3>Order Details</h3>
    <p><strong>Order Number:</strong> ${order.orderNumber}</p>
    <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
    
    <h3>Items Ordered</h3>
    <ul>${itemsList}</ul>
    
    <h3>Order Summary</h3>
    <p><strong>Subtotal:</strong> $${order.itemsPrice.toFixed(2)}</p>
    <p><strong>Shipping:</strong> $${order.shippingPrice.toFixed(2)}</p>
    <p><strong>Tax:</strong> $${order.taxPrice.toFixed(2)}</p>
    <p><strong>Total:</strong> $${order.totalPrice.toFixed(2)}</p>
    
    <h3>Shipping Address</h3>
    <p>
      ${order.shippingAddress.street}<br>
      ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
      ${order.shippingAddress.country}
    </p>
    
    <p>You can track your order status in your account dashboard.</p>
    <br>
    <p>Best regards,<br>The eCommerce Team</p>
  `;

  const text = `Order Confirmation - ${order.orderNumber}. Total: $${order.totalPrice.toFixed(2)}`;

  await sendEmail({ to: user.email, subject, html, text });
};

/**
 * Send order status update email
 */
exports.sendOrderStatusEmail = async (user, order) => {
  const subject = `Order ${order.orderNumber} - Status Update`;
  
  const statusMessages = {
    processing: 'Your order is being processed',
    shipped: 'Your order has been shipped',
    delivered: 'Your order has been delivered',
    cancelled: 'Your order has been cancelled',
  };

  const html = `
    <h2>Order Status Update</h2>
    <p>Hi ${user.firstName},</p>
    <p><strong>${statusMessages[order.orderStatus]}</strong></p>
    <p><strong>Order Number:</strong> ${order.orderNumber}</p>
    ${order.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ''}
    <p>You can view your order details in your account dashboard.</p>
    <br>
    <p>Best regards,<br>The eCommerce Team</p>
  `;

  const text = `Order ${order.orderNumber} status: ${order.orderStatus}`;

  await sendEmail({ to: user.email, subject, html, text });
};

/**
 * Send email verification
 */
exports.sendEmailVerification = async (user, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  
  const subject = 'Verify Your Email Address';
  const html = `
    <h2>Email Verification</h2>
    <p>Hi ${user.firstName},</p>
    <p>Please verify your email address by clicking the link below:</p>
    <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
    <p>This link will expire in 24 hours.</p>
    <br>
    <p>Best regards,<br>The eCommerce Team</p>
  `;
  const text = `Verify your email: ${verificationUrl}`;

  await sendEmail({ to: user.email, subject, html, text });
};
