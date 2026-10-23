const mongoose = require('mongoose');
const { Schema } = mongoose;

const pair = { label: String, value: String };

const PropertySchema = new Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true }, // Residential, Luxury Residential, Luxury, Commercial, Villa
    country: String,
    city: String,
    locality: String,
    currency: String,
    price: Number,
    priceLabel: String,
    pricePerSqft: String,
    fairValue: String,
    rentalYield: String,
    risk: String,
    growth: String,
    verification: String, // "Verified Listing" | "Property Reviewed"
    verified: Boolean,
    opportunityScore: Number,
    highlight: String,
    bedrooms: Number,
    bathrooms: Number,
    areaSqft: Number,
    areaLabel: String,
    images: [String],

    details: {
      propertyType: String,
      parking: String,
      floor: String,
      status: String,
      furnishing: String,
      possession: String,
      listedBy: String,
      address: String,
      lastReviewed: String,
    },
    amenities: [String],
    investment: { opportunity: Number, fairValue: String, riskScore: String, futureGrowth: String },
    project: {
      name: String,
      developer: String,
      description: String,
      priceRange: String,
      perSqftRange: String,
      flats: String,
      towers: String,
    },
    nearby: [{ group: String, items: [String] }],
    market: [
      { name: String, pricing: String, perSqft: String, trend: String, rent: String, yield: String, demand: String },
    ],
    verificationChecks: [{ label: String, status: String, date: String }],
    acquisitionCosts: [pair],
    holdingCosts: [pair],
    scenarios: { positive: [String], base: [String], risk: [String] },
    whyConsider: [String],
    whatToConsider: [String],
    agent: { name: String, firm: String, location: String, experience: String, rating: Number },
    faqs: [{ q: String, a: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Property', PropertySchema);
