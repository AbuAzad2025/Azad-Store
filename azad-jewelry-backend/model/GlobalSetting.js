const mongoose = require('mongoose');

const globalSettingSchema = new mongoose.Schema({
  siteName: {
    type: String,
    required: true,
    default: "Azad Advanced Systems"
  },
  logo: {
    type: String,
    required: false,
    default: ""
  },
  favicon: {
    type: String,
    required: false
  },
  footerText: {
    type: String,
    required: false,
    default: "Copyright © Azad Advanced Systems. All Rights Reserved."
  },
  contactEmail: {
    type: String,
    required: false
  },
  contactPhone: {
    type: String,
    required: false
  },
  address: {
    type: String,
    required: false
  },
  facebook: { type: String, required: false },
  twitter: { type: String, required: false },
  instagram: { type: String, required: false },
  linkedin: { type: String, required: false },
  youtube: { type: String, required: false },
  
  // SEO Defaults
  siteUrl: { type: String, required: false, default: "" },
  metaTitle: { type: String, required: false },
  metaDescription: { type: String, required: false },
  ogImage: { type: String, required: false, default: "" },
  
  currency: { type: String, default: "USD" },
  deliveryCharge: { type: Number, default: 0 },
  deliveryChargeStandard: { type: Number, default: 0 },
  deliveryChargeExpress: { type: Number, default: 0 },
  freeShippingMinSubtotal: { type: Number, default: 0 },
  shippingCostTiers: { type: Array, default: [] },

  bundleDiscountEnabled: { type: Boolean, default: false },
  bundleDiscountPercent: { type: Number, default: 0 },
  bundleDiscountMinItems: { type: Number, default: 2 },

  giftWrapEnabled: { type: Boolean, default: false },
  giftWrapFeeStandard: { type: Number, default: 0 },
  giftWrapFeePremium: { type: Number, default: 0 },

  whatsappNumber: { type: String, required: false, default: "" },
  whatsappDefaultMessage: { type: String, required: false, default: "" },
  deliveryEstimateMinDays: { type: Number, default: 1 },
  deliveryEstimateMaxDays: { type: Number, default: 3 },

  paymentCodEnabled: { type: Boolean, default: true },
  paymentCardEnabled: { type: Boolean, default: false },
  paymentPaypalEnabled: { type: Boolean, default: false },
  paymentBankTransferEnabled: { type: Boolean, default: false },
  bankTransferInstructions: { type: String, required: false, default: "" }
}, {
  timestamps: true
});

const GlobalSetting = mongoose.model('GlobalSetting', globalSettingSchema);

module.exports = GlobalSetting;
