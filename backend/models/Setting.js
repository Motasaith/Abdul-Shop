const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  general: {
    siteName: { type: String, default: 'ShopHub' },
    siteUrl: { type: String, default: 'https://shophub.com' },
    adminEmail: { type: String, default: 'admin@shophub.com' },
    timezone: { type: String, default: 'UTC' },
    currency: { type: String, default: 'PKR' },
    language: { type: String, default: 'en' }
  },
  notifications: {
    emailNotifications: { type: Boolean, default: true },
    orderNotifications: { type: Boolean, default: true },
    lowStockAlerts: { type: Boolean, default: true },
    userRegistrations: { type: Boolean, default: false },
    newsletterUpdates: { type: Boolean, default: true }
  },
  security: {
    twoFactorAuth: { type: Boolean, default: false },
    sessionTimeout: { type: Number, default: 30 },
    passwordPolicy: { type: String, default: 'strong' },
    ipWhitelist: [{ type: String }]
  },
  payment: {
    stripeEnabled: { type: Boolean, default: true },
    paypalEnabled: { type: Boolean, default: false },
    codEnabled: { type: Boolean, default: true },
    testMode: { type: Boolean, default: true }
  },
  email: {
    provider: { type: String, default: 'brevo' },
    fromName: { type: String, default: 'ShopHub' },
    fromEmail: { type: String, default: 'noreply@shophub.com' },
    smtpHost: { type: String, default: 'smtp-relay.brevo.com' },
    smtpPort: { type: Number, default: 587 },
    smtpSecure: { type: Boolean, default: true }
  },
  appearance: {
    primaryColor: { type: String, default: '#3B82F6' },
    secondaryColor: { type: String, default: '#1E40AF' },
    logoUrl: { type: String, default: '' },
    faviconUrl: { type: String, default: '' },
    darkMode: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingSchema.statics.getSettings = async function() {
  const settings = await this.findOne();
  if (settings) return settings;
  return await this.create({});
};

module.exports = mongoose.model('Setting', settingSchema);
