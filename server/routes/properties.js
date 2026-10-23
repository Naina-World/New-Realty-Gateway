const express = require('express');
const mongoose = require('mongoose');
const Property = require('../models/Property');

const router = express.Router();

const CARD_FIELDS =
  'title category country city locality currency price priceLabel pricePerSqft fairValue rentalYield risk growth verification verified opportunityScore highlight bedrooms areaSqft areaLabel images';

// GET /api/properties — listing with filters + pagination
router.get('/', async (req, res, next) => {
  try {
    const { country, city, type, bedrooms, verified, q, minArea, maxArea, tab } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 6, 24);

    const filter = {};
    if (country) filter.country = country;
    if (city) filter.city = city;
    if (type) filter.category = type;
    if (verified === 'true') filter.verified = true;
    if (bedrooms) filter.bedrooms = bedrooms === '5' ? { $gte: 5 } : Number(bedrooms);
    if (minArea || maxArea) {
      filter.areaSqft = {};
      if (minArea) filter.areaSqft.$gte = Number(minArea);
      if (maxArea) filter.areaSqft.$lte = Number(maxArea);
    }
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ title: rx }, { city: rx }, { locality: rx }, { country: rx }];
    }
    if (tab === 'Villas') filter.category = 'Villa';
    if (tab === 'Luxury') filter.category = { $in: ['Luxury', 'Luxury Residential'] };
    if (tab === 'Commercial') filter.category = 'Commercial';

    const [items, total] = await Promise.all([
      Property.find(filter).select(CARD_FIELDS).sort({ opportunityScore: -1 }).skip((page - 1) * limit).limit(limit),
      Property.countDocuments(filter),
    ]);
    res.json({ items, total, page, pages: Math.max(Math.ceil(total / limit), 1) });
  } catch (e) { next(e); }
});

// GET /api/properties/filters — dropdown values
router.get('/filters', async (_req, res, next) => {
  try {
    const [countries, cities, types] = await Promise.all([
      Property.distinct('country'), Property.distinct('city'), Property.distinct('category'),
    ]);
    res.json({ countries: countries.sort(), cities: cities.sort(), types: types.sort() });
  } catch (e) { next(e); }
});

// GET /api/properties/markets — one summary per city for the home page
router.get('/markets', async (_req, res, next) => {
  try {
    const rows = await Property.aggregate([
      { $group: { _id: { country: '$country', city: '$city' }, count: { $sum: 1 }, avgYield: { $first: '$rentalYield' }, growth: { $first: '$growth' }, score: { $avg: '$opportunityScore' } } },
      { $sort: { count: -1 } },
    ]);
    res.json(rows.map((r) => ({ country: r._id.country, city: r._id.city, count: r.count, avgYield: r.avgYield, growth: r.growth, score: Math.round(r.score) })));
  } catch (e) { next(e); }
});

// GET /api/properties/featured
router.get('/featured', async (_req, res, next) => {
  try {
    res.json(await Property.find().select(CARD_FIELDS).sort({ opportunityScore: -1 }).limit(3));
  } catch (e) { next(e); }
});

// GET /api/properties/:id — full detail + similar
router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'Property not found.' });
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found.' });
    const similar = await Property.find({ _id: { $ne: property._id }, $or: [{ city: property.city }, { category: property.category }] })
      .select(CARD_FIELDS).sort({ opportunityScore: -1 }).limit(3);
    res.json({ property, similar });
  } catch (e) { next(e); }
});

module.exports = router;
