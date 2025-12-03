const nodemailer = require('nodemailer');
const crypto = require('crypto');

class EmailService {
  constructor() {
    // Initialize SMTP transporter with Brevo
    this.transporter = nodemailer.createTransport({
      host: process.env.BREVO_SMTP_HOST,
      port: parseInt(process.env.BREVO_SMTP_PORT),
      secure: false, // Use TLS
      auth: {
        user: process.env.BREVO_SMTP_LOGIN,
        pass: process.env.BREVO_SMTP_PASSWORD,
      },
    });

    // Default sender configuration
    this.defaultSender = {
      email: process.env.FROM_EMAIL || 'saithmota@gmail.com',
      name: process.env.FROM_NAME || 'ShopHub E-commerce'
    };

    // Verify connection on startup
    this.verifyConnection();
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service (Brevo) connected successfully');
    } catch (error) {
      console.error('❌ Email service connection failed:', error.message);
    }
  }

  /**
   * Send basic email
   */
  async sendEmail({ to, subject, html, text, from = this.defaultSender, attachments = [] }) {
    const mailOptions = {
      from: `${from.name} <${from.email}>`,
      to,
      subject,
      html,
      text,
      attachments,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', info.messageId);
      return {
        success: true,
        messageId: info.messageId,
        info: info
      };
    } catch (error) {
      console.error('❌ Email sending failed:', error.message);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }
  }

  /**
   * Send welcome email with email verification
   */
  async sendWelcomeEmail(user, verificationToken) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ShopHub!</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
              🎉 Welcome to ShopHub!
            </h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #333; margin-top: 0; font-size: 24px;">
              Hi ${user.name}! 👋
            </h2>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
              Welcome to <strong>ShopHub</strong> - your ultimate e-commerce destination! We're thrilled to have you join our community of smart shoppers.
            </p>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px; margin-bottom: 30px;">
              To get started and secure your account, please verify your email address by clicking the button below:
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${verificationUrl}" 
                 style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                ✅ Verify Email Address
              </a>
            </div>
            
            <!-- Benefits -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #333; margin-top: 0; font-size: 18px;">🚀 What's waiting for you:</h3>
              <ul style="color: #666; line-height: 1.8; padding-left: 20px;">
                <li>🛍️ Access to exclusive deals and discounts</li>
                <li>📦 Fast and secure checkout process</li>
                <li>🔔 Order tracking and notifications</li>
                <li>⭐ Personalized product recommendations</li>
                <li>🎁 Special member-only offers</li>
              </ul>
            </div>
            
            <!-- Alternative Link -->
            <div style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>Can't click the button?</strong> Copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
              </p>
            </div>
            
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              This verification link will expire in 24 hours for security reasons.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #333; color: white; padding: 30px; text-align: center;">
            <p style="margin: 0; font-size: 16px; font-weight: bold;">ShopHub E-commerce</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.8;">
              Your trusted online shopping destination
            </p>
            <p style="margin: 15px 0 0 0; font-size: 12px; opacity: 0.6;">
              © 2024 ShopHub. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Welcome to ShopHub!
      
      Hi ${user.name}!
      
      Welcome to ShopHub - your ultimate e-commerce destination! We're thrilled to have you join our community.
      
      To get started and secure your account, please verify your email address by visiting:
      ${verificationUrl}
      
      What's waiting for you:
      • Access to exclusive deals and discounts
      • Fast and secure checkout process  
      • Order tracking and notifications
      • Personalized product recommendations
      • Special member-only offers
      
      This verification link will expire in 24 hours for security reasons.
      
      Happy shopping!
      The ShopHub Team
      
      © 2024 ShopHub. All rights reserved.
    `;

    return await this.sendEmail({
      to: user.email,
      subject: '🎉 Welcome to ShopHub! Please verify your email',
      html,
      text
    });
  }

  /**
   * Send email verification
   */
async sendEmailVerification(user, verificationToken, isNewEmail = false) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - ShopHub</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white;">
          <!-- Header -->
          <div style="background: #667eea; padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🔐 Verify Your Email</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${user.name}!</h2>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
Please verify your email address to secure your ShopHub account. This applies to both registration email and if you're updating to a new email address.
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                ✅ Verify Email Address
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px; text-align: center;">
              Link expires in 24 hours. If you didn't request this, please ignore this email.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            © 2024 ShopHub. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Verify Your Email - ShopHub
      
      Hi ${user.name}!
      
      Please verify your email address to secure your ShopHub account: ${verificationUrl}
      
      Link expires in 24 hours. If you didn't request this, please ignore this email.
      
      © 2024 ShopHub. All rights reserved.
    `;

    const targetEmail = isNewEmail ? user.newEmail : user.email;
    const subjectText = isNewEmail ? '🔐 Verify your new email address - ShopHub' : '🔐 Verify your email address - ShopHub';
    
    return await this.sendEmail({
      to: targetEmail,
      subject: subjectText,
      html,
      text
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - ShopHub</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white;">
          <!-- Header -->
          <div style="background: #dc3545; padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🔐 Reset Your Password</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${user.name}!</h2>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              You requested a password reset for your ShopHub account. Click the button below to create a new password:
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                🔐 Reset Password
              </a>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>Security Notice:</strong> This link expires in 1 hour. If you didn't request this reset, please ignore this email and your password will remain unchanged.
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            © 2024 ShopHub. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Reset Your Password - ShopHub
      
      Hi ${user.name}!
      
      You requested a password reset. Click here to reset: ${resetUrl}
      
      This link expires in 1 hour. If you didn't request this, please ignore this email.
      
      © 2024 ShopHub. All rights reserved.
    `;

    return await this.sendEmail({
      to: user.email,
      subject: '🔐 Reset your password - ShopHub',
      html,
      text
    });
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(user, order) {
    const orderItemsHtml = order.items.map(item => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px 8px; color: #333;">${item.product.name}</td>
        <td style="padding: 12px 8px; text-align: center; color: #666;">${item.quantity}</td>
        <td style="padding: 12px 8px; text-align: right; color: #333; font-weight: bold;">Rs. ${Math.round(item.price)}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - ShopHub</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white;">
          <!-- Header -->
          <div style="background: #28a745; padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Order Confirmed!</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${user.name}!</h2>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              Thank you for your order! Your order <strong>#${order._id}</strong> has been confirmed and is being processed.
            </p>
            
            <!-- Order Details -->
            <div style="background: #f8f9fa; padding: 25px; margin: 25px 0; border-radius: 8px; border: 1px solid #e9ecef;">
              <h3 style="margin-top: 0; color: #333; font-size: 20px;">📦 Order Details</h3>
              
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <thead>
                  <tr style="background: #e9ecef;">
                    <th style="padding: 12px 8px; text-align: left; color: #495057; font-weight: bold;">Product</th>
                    <th style="padding: 12px 8px; text-align: center; color: #495057; font-weight: bold;">Qty</th>
                    <th style="padding: 12px 8px; text-align: right; color: #495057; font-weight: bold;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderItemsHtml}
                </tbody>
                <tfoot>
                  <tr style="background: #e9ecef; font-weight: bold; border-top: 2px solid #dee2e6;">
                    <td colspan="2" style="padding: 15px 8px; color: #495057; font-size: 16px;">Total</td>
                    <td style="padding: 15px 8px; text-align: right; color: #28a745; font-size: 18px; font-weight: bold;">Rs. ${Math.round(order.totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <!-- Next Steps -->
            <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; border-left: 4px solid #2196f3;">
              <h4 style="margin-top: 0; color: #1976d2;">📬 What's Next?</h4>
              <ul style="margin: 10px 0; padding-left: 20px; color: #666; line-height: 1.6;">
                <li>We'll send you another email when your order ships</li>
                <li>You'll receive tracking information to monitor delivery</li>
                <li>Estimated delivery: 3-7 business days</li>
              </ul>
            </div>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px; margin-top: 30px;">
              Questions about your order? Feel free to contact our support team - we're here to help!
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #333; color: white; padding: 30px; text-align: center;">
            <p style="margin: 0; font-size: 16px; font-weight: bold;">ShopHub E-commerce</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.8;">
              Thank you for shopping with us!
            </p>
            <p style="margin: 15px 0 0 0; font-size: 12px; opacity: 0.6;">
              © 2024 ShopHub. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Order Confirmed! - ShopHub
      
      Hi ${user.name}!
      
      Thank you for your order! Your order #${order._id} has been confirmed and is being processed.
      
      Order Details:
      ${order.items.map(item => `- ${item.product.name} x${item.quantity} - Rs. ${Math.round(item.price)}`).join('\n')}
      
      Total: Rs. ${Math.round(order.totalAmount)}
      
      What's Next?
      • We'll send you another email when your order ships
      • You'll receive tracking information to monitor delivery  
      • Estimated delivery: 3-7 business days
      
      Thank you for shopping with ShopHub!
      
      © 2024 ShopHub. All rights reserved.
    `;

    return await this.sendEmail({
      to: user.email,
      subject: `🎉 Order Confirmation #${order._id} - ShopHub`,
      html,
      text
    });
  }

  /**
   * Send order shipped notification
   */
  async sendOrderShipped(user, order, trackingInfo) {
    const trackingSection = trackingInfo ? `
      <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #e9ecef;">
        <h3 style="margin-top: 0; color: #333;">📦 Tracking Information</h3>
        <p style="margin: 8px 0;"><strong>Tracking Number:</strong> ${trackingInfo.trackingNumber}</p>
        <p style="margin: 8px 0;"><strong>Carrier:</strong> ${trackingInfo.carrier}</p>
        ${trackingInfo.trackingUrl ? `
          <div style="text-align: center; margin: 20px 0;">
            <a href="${trackingInfo.trackingUrl}" 
               style="background: #17a2b8; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              📍 Track Your Package
            </a>
          </div>
        ` : ''}
      </div>
    ` : '';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Order Has Shipped - ShopHub</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white;">
          <!-- Header -->
          <div style="background: #17a2b8; padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🚚 Your Order Has Shipped!</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${user.name}!</h2>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              Great news! Your order <strong>#${order._id}</strong> has been shipped and is on its way to you! 📦✨
            </p>
            
            ${trackingSection}
            
            <div style="background: #d4edda; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 25px 0;">
              <h4 style="margin-top: 0; color: #155724;">🎯 Delivery Information</h4>
              <p style="margin: 8px 0; color: #155724;">
                Your package should arrive within the estimated delivery window. We'll notify you when it's delivered!
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              Thank you for choosing ShopHub for your shopping needs. We hope you love your purchase!
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #333; color: white; padding: 30px; text-align: center;">
            <p style="margin: 0; font-size: 16px; font-weight: bold;">ShopHub E-commerce</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.8;">
              Your package is on the way!
            </p>
            <p style="margin: 15px 0 0 0; font-size: 12px; opacity: 0.6;">
              © 2024 ShopHub. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Your Order Has Shipped! - ShopHub
      
      Hi ${user.name}!
      
      Great news! Your order #${order._id} has been shipped and is on its way to you!
      
      ${trackingInfo ? `
      Tracking Information:
      Tracking Number: ${trackingInfo.trackingNumber}
      Carrier: ${trackingInfo.carrier}
      ${trackingInfo.trackingUrl ? `Track here: ${trackingInfo.trackingUrl}` : ''}
      ` : ''}
      
      Your package should arrive within the estimated delivery window. We'll notify you when it's delivered!
      
      Thank you for choosing ShopHub!
      
      © 2024 ShopHub. All rights reserved.
    `;

    return await this.sendEmail({
      to: user.email, 
      subject: `🚚 Your order #${order._id} has shipped! - ShopHub`,
      html,
      text
    });
  }

  /**
   * Send marketing/promotional email
   */
  async sendMarketingEmail({ to, subject, content, campaignName = 'General' }) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">ShopHub</h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            ${content}
          </div>
          
          <!-- Footer -->
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p style="margin: 0;">
              You received this email because you're subscribed to ShopHub updates.
            </p>
            <p style="margin: 10px 0 0 0;">
              © 2024 ShopHub. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to,
      subject: `${subject} - ShopHub`,
      html,
      text: content.replace(/\<[^\>]*\>/g, '') // Strip HTML for text version
    });
  }

  /**
   * Send newsletter welcome email
   */
  async sendNewsletterWelcome(subscriber) {
    const unsubscribeUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/newsletter/unsubscribe/${subscriber.unsubscribeToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ShopHub Newsletter!</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to ShopHub!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Thanks for subscribing to our newsletter!</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #333; margin-top: 0;">Hi there! 👋</h2>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              Welcome to the ShopHub family! You're now subscribed to receive:
            </p>
            
            <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin: 25px 0;">
              <ul style="color: #374151; line-height: 1.8; padding-left: 20px; margin: 0;">
                <li>🏷️ <strong>Exclusive deals and discounts</strong> - Get early access to sales!</li>
                <li>🆕 <strong>New product announcements</strong> - Be the first to know!</li>
                <li>📱 <strong>Product updates and features</strong> - Stay in the loop!</li>
                <li>🎁 <strong>Special offers</strong> - Subscriber-only promotions!</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/products" style="display: inline-block; background: #4f46e5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Start Shopping Now! 🛍️</a>
            </div>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              Thank you for joining us on this journey. We're excited to keep you updated with the best deals and newest products!
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #f9fafb; padding: 25px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0 0 10px 0;">📧 You're receiving this because you subscribed to ShopHub newsletter from our ${subscriber.subscriptionSource || 'website'}.</p>
            <p style="margin: 0 0 15px 0;">Don't want to receive these emails? <a href="${unsubscribeUrl}" style="color: #4f46e5;">Unsubscribe here</a></p>
            <p style="margin: 0; font-size: 12px; color: #9ca3af;">© 2024 ShopHub. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Welcome to ShopHub Newsletter!
      
      Hi there!
      
      Welcome to the ShopHub family! You're now subscribed to receive:
      
      • Exclusive deals and discounts - Get early access to sales!
      • New product announcements - Be the first to know!
      • Product updates and features - Stay in the loop!
      • Special offers - Subscriber-only promotions!
      
      Start Shopping: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/products
      
      Thank you for joining us on this journey. We're excited to keep you updated with the best deals and newest products!
      
      Don't want to receive these emails? Unsubscribe: ${unsubscribeUrl}
      
      © 2024 ShopHub. All rights reserved.
    `;

    return await this.sendEmail({
      to: subscriber.email, 
      subject: '🎉 Welcome to ShopHub Newsletter - Exclusive Deals Await!',
      html,
      text
    });
  }

  /**
   * Send newsletter broadcast email
   */
  async sendNewsletterBroadcast({ subscribers, subject, content, campaignName = 'General' }) {
    const results = [];
    
    for (const subscriber of subscribers) {
      try {
        const unsubscribeUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/newsletter/unsubscribe/${subscriber.unsubscribeToken}`;
        
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white;">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">ShopHub</h1>
              </div>
              
              <!-- Content -->
              <div style="padding: 40px 30px;">
                ${content}
              </div>
              
              <!-- Footer -->
              <div style="background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 10px 0;">You're receiving this because you're subscribed to ShopHub newsletter.</p>
                <p style="margin: 0;">Don't want to receive these emails? <a href="${unsubscribeUrl}" style="color: #4f46e5;">Unsubscribe here</a></p>
                <p style="margin: 10px 0 0 0; color: #9ca3af;">© 2024 ShopHub. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        const result = await this.sendEmail({
          to: subscriber.email,
          subject: `${subject} - ShopHub`,
          html,
          text: content.replace(/<[^>]*>/g, '') // Strip HTML for text version
        });

        results.push({ 
          email: subscriber.email, 
          success: result.success,
          error: result.error 
        });

        // Update subscriber stats
        if (result.success) {
          subscriber.emailsSent = (subscriber.emailsSent || 0) + 1;
          subscriber.lastEmailSent = new Date();
          await subscriber.save();
        }
        
        // Add small delay to avoid overwhelming email service
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Failed to send newsletter to ${subscriber.email}:`, error);
        results.push({ 
          email: subscriber.email, 
          success: false, 
          error: error.message 
        });
      }
    }
    
    return {
      success: true,
      campaignName,
      totalEmails: subscribers.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    };
  }

  /**
   * Send contact form confirmation email to user
   */
  async sendContactConfirmation(contact) {
    const priorityColors = {
      low: '#10b981',
      medium: '#f59e0b', 
      high: '#ef4444',
      urgent: '#dc2626'
    };

    const subjectLabels = {
      general: 'General Inquiry',
      support: 'Customer Support',
      order: 'Order Issue',
      return: 'Return/Refund',
      feedback: 'Feedback',
      other: 'Other'
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contact Confirmation - ShopHub</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
              ✅ Message Received!
            </h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
              We've got your message and will get back to you soon.
            </p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #333; margin-top: 0; font-size: 24px;">
              Hi ${contact.name}! 👋
            </h2>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px; margin-bottom: 30px;">
              Thank you for contacting ShopHub! We've received your message and our team will review it shortly.
            </p>
            
            <!-- Contact Details -->
            <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #333; margin-top: 0; font-size: 18px; margin-bottom: 20px;">📋 Your Message Details:</h3>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #374151;">Ticket ID:</strong> 
                <span style="color: #6b7280; font-family: monospace; background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">#${contact._id.toString().slice(-8).toUpperCase()}</span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #374151;">Subject:</strong> 
                <span style="color: #6b7280;">${subjectLabels[contact.subject] || contact.subject}</span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #374151;">Priority:</strong> 
                <span style="background: ${priorityColors[contact.priority]}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 12px; text-transform: uppercase; font-weight: bold;">${contact.priority}</span>
              </div>
              
              ${contact.orderNumber ? `
                <div style="margin-bottom: 15px;">
                  <strong style="color: #374151;">Order Number:</strong> 
                  <span style="color: #6b7280; font-family: monospace;">${contact.orderNumber}</span>
                </div>
              ` : ''}
              
              <div style="margin-bottom: 15px;">
                <strong style="color: #374151;">Submitted:</strong> 
                <span style="color: #6b7280;">${new Date(contact.createdAt).toLocaleString()}</span>
              </div>
              
              <div>
                <strong style="color: #374151;">Your Message:</strong>
                <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 8px; border-left: 4px solid #10b981;">
                  <p style="color: #374151; margin: 0; line-height: 1.6;">${contact.message.replace(/\n/g, '<br>')}</p>
                </div>
              </div>
            </div>
            
            <!-- Response Time -->
            <div style="background: #dbeafe; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 30px 0;">
              <h4 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px;">⏰ Expected Response Time:</h4>
              <p style="color: #1e3a8a; margin: 0; font-size: 14px;">
                ${contact.priority === 'urgent' ? 'Within 2-4 hours' : contact.priority === 'high' ? 'Within 4-8 hours' : contact.priority === 'medium' ? 'Within 12-24 hours' : 'Within 24-48 hours'} during business hours.
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              If you need to add more information to your request, please reply to this email with your ticket ID: <strong>#${contact._id.toString().slice(-8).toUpperCase()}</strong>
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #333; color: white; padding: 30px; text-align: center;">
            <p style="margin: 0; font-size: 16px; font-weight: bold;">ShopHub Customer Support</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.8;">
              We're here to help you have the best shopping experience
            </p>
            <p style="margin: 15px 0 0 0; font-size: 12px; opacity: 0.6;">
              © 2024 ShopHub. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Message Received - ShopHub
      
      Hi ${contact.name}!
      
      Thank you for contacting ShopHub! We've received your message and our team will review it shortly.
      
      Your Message Details:
      - Ticket ID: #${contact._id.toString().slice(-8).toUpperCase()}
      - Subject: ${subjectLabels[contact.subject] || contact.subject}
      - Priority: ${contact.priority.toUpperCase()}
      ${contact.orderNumber ? `- Order Number: ${contact.orderNumber}` : ''}
      - Submitted: ${new Date(contact.createdAt).toLocaleString()}
      - Your Message: ${contact.message}
      
      Expected Response Time: ${contact.priority === 'urgent' ? 'Within 2-4 hours' : contact.priority === 'high' ? 'Within 4-8 hours' : contact.priority === 'medium' ? 'Within 12-24 hours' : 'Within 24-48 hours'} during business hours.
      
      If you need to add more information to your request, please reply to this email with your ticket ID: #${contact._id.toString().slice(-8).toUpperCase()}
      
      ShopHub Customer Support
      © 2024 ShopHub. All rights reserved.
    `;

    return await this.sendEmail({
      to: contact.email,
      subject: `✅ Message Received - Ticket #${contact._id.toString().slice(-8).toUpperCase()} - ShopHub`,
      html,
      text
    });
  }

  /**
   * Send contact notification email to admin
   */
  async sendContactNotification(contact) {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL;
    if (!adminEmail) {
      console.warn('No admin email configured for contact notifications');
      return { success: false, error: 'No admin email configured' };
    }

    const priorityColors = {
      low: '#10b981',
      medium: '#f59e0b', 
      high: '#ef4444',
      urgent: '#dc2626'
    };

    const subjectLabels = {
      general: 'General Inquiry',
      support: 'Customer Support',
      order: 'Order Issue',
      return: 'Return/Refund',
      feedback: 'Feedback',
      other: 'Other'
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">
              🔔 New Contact Form Submission
            </h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="color: #333; margin-top: 0; font-size: 18px; margin-bottom: 20px;">📋 Submission Details:</h3>
              
              <div style="margin-bottom: 15px;">
                <strong>Ticket ID:</strong> 
                <span style="font-family: monospace; background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">#${contact._id.toString().slice(-8).toUpperCase()}</span>
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong>Name:</strong> ${contact.name}
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong>Email:</strong> 
                <a href="mailto:${contact.email}" style="color: #3b82f6;">${contact.email}</a>
              </div>
              
              ${contact.phone ? `
                <div style="margin-bottom: 15px;">
                  <strong>Phone:</strong> 
                  <a href="tel:${contact.phone}" style="color: #3b82f6;">${contact.phone}</a>
                </div>
              ` : ''}
              
              <div style="margin-bottom: 15px;">
                <strong>Subject:</strong> ${subjectLabels[contact.subject] || contact.subject}
              </div>
              
              <div style="margin-bottom: 15px;">
                <strong>Priority:</strong> 
                <span style="background: ${priorityColors[contact.priority]}; color: white; padding: 3px 8px; border-radius: 12px; font-size: 12px; text-transform: uppercase; font-weight: bold;">${contact.priority}</span>
              </div>
              
              ${contact.orderNumber ? `
                <div style="margin-bottom: 15px;">
                  <strong>Order Number:</strong> 
                  <span style="font-family: monospace;">${contact.orderNumber}</span>
                </div>
              ` : ''}
              
              <div style="margin-bottom: 15px;">
                <strong>Submitted:</strong> ${new Date(contact.createdAt).toLocaleString()}
              </div>
              
              <div>
                <strong>Message:</strong>
                <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 8px; border-left: 4px solid #f59e0b;">
                  <p style="margin: 0; line-height: 1.6;">${contact.message.replace(/\n/g, '<br>')}</p>
                </div>
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/contact/${contact._id}" 
                 style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                View in Admin Panel
              </a>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>Response Time Target:</strong> ${contact.priority === 'urgent' ? '2-4 hours' : contact.priority === 'high' ? '4-8 hours' : contact.priority === 'medium' ? '12-24 hours' : '24-48 hours'}
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: adminEmail,
      subject: `🔔 [${contact.priority.toUpperCase()}] New Contact: ${subjectLabels[contact.subject]} - #${contact._id.toString().slice(-8).toUpperCase()}`,
      html
    });
  }

  /**
   * Send contact response email to user
   */
  async sendContactResponse(contact, responseMessage) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Response to Your Message - ShopHub</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
              💬 We've Responded!
            </h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
              Re: Ticket #${contact._id.toString().slice(-8).toUpperCase()}
            </p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #333; margin-top: 0; font-size: 24px;">
              Hi ${contact.name}! 👋
            </h2>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px; margin-bottom: 30px;">
              Thank you for your patience! Our team has reviewed your message and here's our response:
            </p>
            
            <!-- Response -->
            <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 30px 0;">
              <h3 style="color: #1e40af; margin-top: 0; font-size: 18px; margin-bottom: 15px;">📝 Our Response:</h3>
              <div style="color: #374151; line-height: 1.6;">${responseMessage.replace(/\n/g, '<br>')}</div>
            </div>
            
            <!-- Original Message -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h4 style="color: #6b7280; margin-top: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Your Original Message:</h4>
              <p style="color: #374151; margin: 10px 0 0 0; line-height: 1.6; font-style: italic;">${contact.message.replace(/\n/g, '<br>')}</p>
            </div>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
              If you have any follow-up questions or need further assistance, please don't hesitate to reply to this email. 
              Make sure to include your ticket ID: <strong>#${contact._id.toString().slice(-8).toUpperCase()}</strong>
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/contact" 
                 style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Contact Us Again
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #333; color: white; padding: 30px; text-align: center;">
            <p style="margin: 0; font-size: 16px; font-weight: bold;">ShopHub Customer Support</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.8;">
              Thank you for choosing ShopHub!
            </p>
            <p style="margin: 15px 0 0 0; font-size: 12px; opacity: 0.6;">
              © 2024 ShopHub. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Response to Your Message - ShopHub
      
      Hi ${contact.name}!
      
      Thank you for your patience! Our team has reviewed your message and here's our response:
      
      Our Response:
      ${responseMessage}
      
      Your Original Message:
      ${contact.message}
      
      If you have any follow-up questions or need further assistance, please don't hesitate to reply to this email. 
      Make sure to include your ticket ID: #${contact._id.toString().slice(-8).toUpperCase()}
      
      ShopHub Customer Support
      © 2024 ShopHub. All rights reserved.
    `;

    return await this.sendEmail({
      to: contact.email,
      subject: `💬 Response to Your Message - Ticket #${contact._id.toString().slice(-8).toUpperCase()} - ShopHub`,
      html,
      text
    });
  }
}

module.exports = new EmailService();
