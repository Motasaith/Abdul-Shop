const { MailerSend, EmailParams, Sender, Recipient, Attachment } = require('mailersend');

class MailerSendService {
  constructor() {
    this.mailerSend = new MailerSend({
      apiKey: process.env.MAILERSEND_API_KEY,
    });
    
    // Default sender configuration for trial accounts
    // For trial accounts, we'll use the same email as recipient for testing
    this.defaultSender = {
      email: process.env.MAILERSEND_FROM_EMAIL || process.env.TEST_EMAIL || 'saithmota@gmail.com',
      name: process.env.MAILERSEND_FROM_NAME || 'Your E-commerce Store'
    };
  }

  /**
   * Send a basic email
   * @param {Object} emailData - Email configuration
   * @param {string} emailData.to - Recipient email
   * @param {string} emailData.toName - Recipient name
   * @param {string} emailData.subject - Email subject
   * @param {string} emailData.html - HTML content
   * @param {string} emailData.text - Plain text content
   * @param {Object} emailData.from - Sender info (optional)
   * @param {Array} emailData.attachments - File attachments (optional)
   */
  async sendEmail(emailData) {
    try {
      const {
        to,
        toName = '',
        subject,
        html,
        text,
        from = this.defaultSender,
        attachments = [],
        templateId = null,
        variables = {},
        tags = []
      } = emailData;

      const sentFrom = new Sender(from.email, from.name);
      const recipients = [new Recipient(to, toName)];

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject(subject);

      // Add template or content
      if (templateId) {
        emailParams.setTemplateId(templateId);
        if (Object.keys(variables).length > 0) {
          emailParams.setVariables([{
            email: to,
            substitutions: variables
          }]);
        }
      } else {
        if (html) emailParams.setHtml(html);
        if (text) emailParams.setText(text);
      }

      // Add attachments if any
      if (attachments.length > 0) {
        const attachmentObjects = attachments.map(att => 
          new Attachment(att.content, att.filename, att.disposition)
        );
        emailParams.setAttachments(attachmentObjects);
      }

      // Add tags for tracking
      if (tags.length > 0) {
        emailParams.setTags(tags);
      }

      const response = await this.mailerSend.email.send(emailParams);
      console.log('Email sent successfully:', response.body);
      return {
        success: true,
        messageId: response.body.message_id || response.body,
        response: response.body
      };
    } catch (error) {
      console.error('Error sending email:', error);
      
      // Development mode fallback - show email content in console
      if (process.env.NODE_ENV === 'development') {
        console.log('\n🚀 ==========================================');
        console.log('📧 EMAIL WOULD BE SENT (Development Mode)');
        console.log('==========================================');
        console.log(`📨 To: ${emailData.to} (${emailData.toName || 'No name'})`);
        console.log(`📬 From: ${emailData.from?.email || this.defaultSender.email} (${emailData.from?.name || this.defaultSender.name})`);
        console.log(`📝 Subject: ${emailData.subject}`);
        console.log(`🏷️  Tags: ${(emailData.tags || []).join(', ')}`);
        if (emailData.templateId) {
          console.log(`📄 Template ID: ${emailData.templateId}`);
          console.log(`🔧 Variables: ${JSON.stringify(emailData.variables || {}, null, 2)}`);
        }
        if (emailData.html) {
          console.log('📄 HTML Content Preview:');
          console.log(emailData.html.substring(0, 200) + '...');
        }
        if (emailData.text) {
          console.log('📝 Text Content:');
          console.log(emailData.text.substring(0, 300) + '...');
        }
        console.log('==========================================');
        console.log('💡 To enable actual email sending:');
        console.log('   1. Verify your domain in MailerSend dashboard');
        console.log('   2. Update MAILERSEND_FROM_EMAIL in .env');
        console.log('   3. Test again');
        console.log('==========================================\n');
        
        // Return success for development mode
        return {
          success: true,
          messageId: 'dev-mode-' + Date.now(),
          response: 'Development mode - email logged to console',
          devMode: true
        };
      }
      
      return {
        success: false,
        error: error.message,
        details: error.response?.body || error
      };
    }
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(user, verificationToken) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Our Store!</h1>
        </div>
        
        <div style="padding: 40px 20px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">Hi ${user.name}!</h2>
          
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Thank you for joining our e-commerce platform. We're excited to have you as part of our community!
          </p>
          
          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            To get started, please verify your email address by clicking the button below:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #667eea;">${verificationUrl}</a>
          </p>
          
          <p style="color: #999; font-size: 14px;">
            This verification link will expire in 24 hours.
          </p>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2024 Your E-commerce Store. All rights reserved.</p>
        </div>
      </div>
    `;

    const text = `
      Welcome to Our Store!
      
      Hi ${user.name}!
      
      Thank you for joining our e-commerce platform. To get started, please verify your email address by visiting:
      ${verificationUrl}
      
      This verification link will expire in 24 hours.
      
      © 2024 Your E-commerce Store. All rights reserved.
    `;

    return await this.sendEmail({
      to: user.email,
      toName: user.name,
      subject: 'Welcome! Please verify your email address',
      html,
      text,
      tags: ['welcome', 'email-verification']
    });
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(user, verificationToken) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: #667eea; padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Verify Your Email</h1>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #333;">Hi ${user.name}!</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Please verify your email address by clicking the button below:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px;">
            Link expires in 24 hours. If you didn't request this, please ignore this email.
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: user.email,
      toName: user.name,
      subject: 'Verify your email address',
      html,
      tags: ['email-verification']
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: #dc3545; padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Reset Your Password</h1>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #333;">Hi ${user.name}!</h2>
          
          <p style="color: #666; line-height: 1.6;">
            You requested a password reset. Click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px;">
            This link expires in 1 hour. If you didn't request this, please ignore this email.
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: user.email,
      toName: user.name,
      subject: 'Reset your password',
      html,
      tags: ['password-reset']
    });
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(user, order) {
    const orderItemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          ${item.product.name}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          Rs. ${Math.round(item.price)}
        </td>
      </tr>
    `).join('');

    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: #28a745; padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Order Confirmed!</h1>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #333;">Hi ${user.name}!</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Thank you for your order! Your order #${order._id} has been confirmed and is being processed.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #333;">Order Details</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #e9ecef;">
                  <th style="padding: 10px; text-align: left;">Product</th>
                  <th style="padding: 10px; text-align: center;">Qty</th>
                  <th style="padding: 10px; text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${orderItemsHtml}
              </tbody>
              <tfoot>
                <tr style="background: #e9ecef; font-weight: bold;">
                  <td colspan="2" style="padding: 10px;">Total</td>
                  <td style="padding: 10px; text-align: right;">Rs. ${Math.round(order.totalAmount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            We'll send you another email when your order ships with tracking information.
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: user.email,
      toName: user.name,
      subject: `Order Confirmation #${order._id}`,
      html,
      tags: ['order-confirmation', 'transactional']
    });
  }

  /**
   * Send order shipped notification
   */
  async sendOrderShipped(user, order, trackingInfo) {
    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: #17a2b8; padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Your Order Has Shipped!</h1>
        </div>
        
        <div style="padding: 30px 20px;">
          <h2 style="color: #333;">Hi ${user.name}!</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Great news! Your order #${order._id} has been shipped and is on its way to you.
          </p>
          
          ${trackingInfo ? `
            <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <h3 style="margin-top: 0; color: #333;">Tracking Information</h3>
              <p><strong>Tracking Number:</strong> ${trackingInfo.trackingNumber}</p>
              <p><strong>Carrier:</strong> ${trackingInfo.carrier}</p>
              ${trackingInfo.trackingUrl ? `
                <div style="text-align: center; margin: 20px 0;">
                  <a href="${trackingInfo.trackingUrl}" 
                     style="background: #17a2b8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Track Your Package
                  </a>
                </div>
              ` : ''}
            </div>
          ` : ''}
          
          <p style="color: #666; line-height: 1.6;">
            You should receive your order within the estimated delivery time. Thank you for shopping with us!
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: user.email,
      toName: user.name,
      subject: `Your order #${order._id} has shipped!`,
      html,
      tags: ['order-shipped', 'transactional']
    });
  }

  /**
   * Get email activity and analytics
   */
  async getEmailActivity(messageId) {
    try {
      const response = await this.mailerSend.analytics.getActivitiesByDate({
        date_from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        date_to: new Date().toISOString(),
        message_id: messageId
      });
      return response.body;
    } catch (error) {
      console.error('Error fetching email activity:', error);
      return null;
    }
  }

  /**
   * Add email to suppression list
   */
  async suppressEmail(email, reason = 'unsubscribe') {
    try {
      const response = await this.mailerSend.suppressions.add({
        domain_id: process.env.MAILERSEND_DOMAIN_ID,
        recipients: [email],
        reason: reason
      });
      return response.body;
    } catch (error) {
      console.error('Error adding to suppression list:', error);
      return null;
    }
  }

  /**
   * Remove email from suppression list
   */
  async unsuppressEmail(email) {
    try {
      const response = await this.mailerSend.suppressions.delete({
        domain_id: process.env.MAILERSEND_DOMAIN_ID,
        ids: [email]
      });
      return response.body;
    } catch (error) {
      console.error('Error removing from suppression list:', error);
      return null;
    }
  }
}

module.exports = new MailerSendService();
