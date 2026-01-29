const mongoose = require("mongoose");
const validator = require("validator");
const { ObjectId } = mongoose.Schema.Types;

const brandSchema = mongoose.Schema({
  logo: {
    type: String,
    required: false,
    validate: {
      validator: (value) => {
        if (value === null || value === undefined || value === "") return true;
        if (typeof value !== "string") return false;
        const v = value.trim();
        if (v.startsWith("/brand-logos/")) return true;
        if (v.startsWith("/site-assets/")) return true;
        return validator.isURL(v);
      },
      message: "Please provide valid url(s)",
    },
  },
  name: {
    type: String,
    trim: true,
    required: [true, "Please provide a brand name"],
    maxLength: 100,
    unique: true,
  },
  description: String,
  email: {
    type: String,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"]
  },
  website: {
    type: String,
    validate: [validator.isURL, "Please provide a valid url"]
  },
  location: String,
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },
  products: [{
    type: ObjectId,
    ref: "Products"
  }],
}, {
  timestamps: true
});

brandSchema.index({ status: 1, name: 1 });

const Brand = mongoose.model("Brand", brandSchema);

module.exports = Brand;




