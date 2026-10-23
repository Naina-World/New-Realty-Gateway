require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('./models/Property');

// ---- helpers ---------------------------------------------------------------
const NEARBY = {
  Mumbai: [
    { group: 'Nearby Education', items: ['Hiranandani Foundation School (1.8 Km)', 'IIT Bombay (2.1 Km)', 'Powai English High School (1.2 Km)'] },
    { group: 'Healthcare', items: ['Dr L H Hiranandani Hospital (1.8 Km)', 'Hiranandani Hospital (2.1 Km)', 'SevenHills Hospital (1.2 Km)'] },
    { group: 'Transportation', items: ['Powai Metro Station (0.8 Km)', 'Powai Bus Stop (0.2 Km)', 'Kanjurmarg Railway Station (2.1 Km)'] },
    { group: 'Employment Hubs', items: ['Hiranandani Business Park (1.8 Km)', 'Powai Business District (2.1 Km)', 'MIDC Andheri East (1.2 Km)'] },
    { group: 'Key Landmarks', items: ['Powai Lake (1.0 Km)', 'Hiranandani Gardens (2.1 Km)', 'Sanjay Gandhi National Park (1.2 Km)'] },
    { group: 'Shopping Centre', items: ['R City Mall (1.0 Km)', 'Hiranandani Retail Plaza (2.1 Km)', 'D Mart, Powai (1.2 Km)'] },
  ],
  Dubai: [
    { group: 'Nearby Education', items: ['Dubai International Academy (3.1 Km)', 'GEMS Wellington (2.4 Km)', 'Heriot-Watt University Dubai (6 Km)'] },
    { group: 'Healthcare', items: ['Mediclinic Dubai Marina (1.4 Km)', 'American Hospital Dubai (9 Km)', 'Saudi German Hospital (4 Km)'] },
    { group: 'Transportation', items: ['Dubai Tram Station (0.6 Km)', 'Metro Station (1.1 Km)', 'Dubai International Airport (28 Km)'] },
    { group: 'Employment Hubs', items: ['Dubai Internet City (4 Km)', 'DIFC (14 Km)', 'Downtown Dubai (12 Km)'] },
    { group: 'Key Landmarks', items: ['Marina Walk (0.4 Km)', 'Burj Khalifa (12 Km)', 'JBR Beach (2 Km)'] },
    { group: 'Shopping Centre', items: ['Dubai Marina Mall (0.7 Km)', 'Mall of the Emirates (8 Km)', 'The Dubai Mall (12 Km)'] },
  ],
  Singapore: [
    { group: 'Nearby Education', items: ['Changi Primary School (1.2 Km)', 'SUTD (4 Km)', 'Tanah Merah Secondary (2 Km)'] },
    { group: 'Healthcare', items: ['Changi General Hospital (3 Km)', 'Parkway East Hospital (7 Km)', 'Polyclinic Bedok (4 Km)'] },
    { group: 'Transportation', items: ['Expo MRT (1.5 Km)', 'Tanah Merah MRT (2.5 Km)', 'Changi Airport (4 Km)'] },
    { group: 'Employment Hubs', items: ['Changi Business Park (1.5 Km)', 'Singapore Expo (1.8 Km)', 'CBD (20 Km)'] },
    { group: 'Key Landmarks', items: ['Changi Beach Park (2 Km)', 'Jewel Changi Airport (4 Km)', 'East Coast Park (6 Km)'] },
    { group: 'Shopping Centre', items: ['Changi City Point (1.5 Km)', 'Jewel Changi (4 Km)', 'Bedok Mall (6 Km)'] },
  ],
  Bengaluru: [
    { group: 'Nearby Education', items: ['Inventure Academy (3 Km)', 'Vidyashilp Academy (5 Km)', 'Whitefield Global School (1.5 Km)'] },
    { group: 'Healthcare', items: ['Columbia Asia Hospital (2 Km)', 'Manipal Hospital (4 Km)', 'Vydehi Hospital (3 Km)'] },
    { group: 'Transportation', items: ['Whitefield Metro (1.2 Km)', 'ITPL Bus Stop (0.5 Km)', 'Kadugodi Railway Station (3 Km)'] },
    { group: 'Employment Hubs', items: ['ITPL (1.5 Km)', 'Prestige Tech Park (3 Km)', 'Embassy Tech Village (12 Km)'] },
    { group: 'Key Landmarks', items: ['Phoenix Marketcity (2 Km)', 'Varthur Lake (4 Km)', 'Forum Shantiniketan (3 Km)'] },
    { group: 'Shopping Centre', items: ['Phoenix Marketcity (2 Km)', 'VR Bengaluru (3 Km)', 'Nexus Whitefield (2.5 Km)'] },
  ],
};

const AMENITIES = ['Swimming Pool', 'Clubhouse', 'Gym', 'Kids Area', 'Garden', '24x7 Security', '100% Backup', 'Covered Parking'];

const money = (cur, n) => {
  if (cur === 'INR') return n >= 1e7 ? `₹${+(n / 1e7).toFixed(2)} Cr` : `₹${+(n / 1e5).toFixed(2)} L`;
  if (cur === 'AED') return `AED ${n.toLocaleString('en-US')}`;
  return `S$${n.toLocaleString('en-US')}`;
};

function build(p) {
  const ver = p.verification === 'Verified Listing';
  const cur = p.currency;
  const inr = cur === 'INR';
  const price = p.price;
  const stamp = Math.round(price * (inr ? 0.05 : 0.04));
  const reg = Math.round(price * (inr ? 0.01 : 0.0025));
  const broker = Math.round(price * 0.01);
  const finance = Math.round(price * (inr ? 0.004 : 0.003));
  const total = price + stamp + reg + broker + finance + (inr ? 75000 : 5000);
  const cost = (n) => (inr ? (n >= 1e7 ? money(cur, n) : n >= 1e5 ? `₹${+(n / 1e5).toFixed(2)}L` : `₹${Math.round(n / 1000)}K`) : money(cur, n));

  return {
    ...p,
    verified: p.verification === 'Verified Listing',
    images: [],
    bathrooms: p.bedrooms || 2,
    details: {
      propertyType: p.category === 'Commercial' ? 'Commercial Office' : p.category === 'Villa' ? 'Independent Villa' : 'Residential Apartment',
      parking: p.category === 'Villa' ? '4 Cars' : '2 Cars',
      floor: p.category === 'Villa' ? 'G + 2' : '18th / 32',
      status: 'Ready to Move',
      furnishing: 'Semi-Furnished',
      possession: 'Immediate',
      listedBy: !ver ? 'Agent' : 'Verified Agent',
      address: `${p.locality}, ${p.city}, ${p.country}`,
      lastReviewed: 'Sep 2026',
    },
    amenities: AMENITIES,
    investment: { opportunity: p.opportunityScore, fairValue: 'Good', riskScore: p.risk, futureGrowth: p.growth === 'Positive' ? 'Strong' : p.growth },
    project: {
      name: p.projectName,
      developer: p.developer,
      description: `A contemporary development designed for modern urban living, offering thoughtfully planned homes, lifestyle amenities, green spaces and convenient access to key parts of ${p.city}.`,
      priceRange: p.projectRange,
      perSqftRange: p.perSqftRange,
      flats: p.flats,
      towers: p.towers,
    },
    nearby: NEARBY[p.city] || NEARBY.Mumbai,
    market: [
      { name: p.title, pricing: p.priceLabel, perSqft: p.pricePerSqft, trend: '+6.5%', rent: p.rent, yield: p.rentalYield, demand: 'High' },
      { name: `${p.locality} Heights`, pricing: money(cur, Math.round(price * 0.955)), perSqft: p.pricePerSqft, trend: '+6.2%', rent: p.rent, yield: p.rentalYield, demand: 'High' },
      { name: `${p.locality} Central`, pricing: money(cur, Math.round(price * 1.03)), perSqft: p.pricePerSqft, trend: '+5.8%', rent: p.rent, yield: p.rentalYield, demand: 'Moderate' },
    ],
    verificationChecks: [
      { label: 'Developer Verification', status: 'Verified', date: '12 Jun 2026' },
      { label: 'Agent Verification', status: 'Verified', date: '12 Jun 2026' },
      { label: 'Listing Verification', status: !ver ? 'In Review' : 'Verified', date: '12 Jun 2026' },
      { label: 'Document Verification', status: !ver ? 'In Review' : 'Verified', date: '12 Jun 2026' },
    ],
    acquisitionCosts: [
      { label: 'Purchase Price', value: p.priceLabel },
      { label: 'Stamp Duty / Taxes', value: cost(stamp) },
      { label: 'Registration', value: cost(reg) },
      { label: 'Legal & Documentation', value: inr ? '₹75K' : money(cur, 5000) },
      { label: 'Brokerage', value: cost(broker) },
      { label: 'Financing Costs', value: cost(finance) },
      { label: 'Estimated Acquisition Cost', value: cost(total) },
    ],
    holdingCosts: inr
      ? [
          { label: 'Maintenance / Service Charges', value: '₹8K–₹12K' },
          { label: 'Property Tax', value: '₹25K–₹40K' },
          { label: 'Insurance', value: '₹10K–₹20K' },
          { label: 'Property Management', value: '₹5K–₹10K' },
        ]
      : [
          { label: 'Maintenance / Service Charges', value: `${money(cur, 12000)}–${money(cur, 18000)}` },
          { label: 'Property Tax', value: 'Minimal / None' },
          { label: 'Insurance', value: `${money(cur, 900)}–${money(cur, 1500)}` },
          { label: 'Property Management', value: `${money(cur, 1500)}–${money(cur, 2500)}` },
        ],
    scenarios: {
      positive: ['Continued rental demand', 'New employment hubs nearby', 'Infrastructure development'],
      base: ['Prices track local market growth', 'Rental yield stays in range', 'Stable demand from end users'],
      risk: ['Limited quality supply may reverse', 'Interest-rate changes', 'Slower leasing in a downturn'],
    },
    whyConsider: ['Established location', 'Strong connectivity', 'High rental demand', 'Asking price within estimated fair-value range', 'Good surrounding infrastructure', 'Positive development outlook'],
    whatToConsider: ['Check maintenance charges and society rules', 'Confirm title and approvals with a legal expert', 'Compare with at least two similar listings'],
    agent: { name: p.agentName, firm: `${p.agentName.split(' ')[0]} Property Advisory`, location: `${p.city}, ${p.country}`, experience: '15+ Years Experience', rating: 4.9 },
    faqs: [
      { q: 'Is this property verified?', a: 'NRG displays verification status for the developer, agent, listing, documents and ownership based on the checks completed. Review the verification details before proceeding.' },
      { q: 'Is the asking price a fair price?', a: 'Compare the asking price with the NRG Fair Value range shown on this page, along with prices of similar properties nearby.' },
      { q: 'How does NRG determine the Fair Value?', a: 'Fair Value is estimated from comparable listings, recent market trends, location quality and property attributes.' },
      { q: 'What is the Opportunity Score?', a: 'A score out of 100 combining price fairness, rental potential, growth outlook, verification and risk.' },
      { q: 'What are the additional costs of buying this property?', a: 'Expect stamp duty, registration, legal fees, brokerage and financing costs. See the Cost of Acquisition section.' },
    ],
  };
}

// ---- data ------------------------------------------------------------------
const base = [
  {
    title: 'Premium 3 BHK Residence', category: 'Residential', country: 'India', city: 'Mumbai', locality: 'Powai', currency: 'INR',
    price: 28500000, priceLabel: '₹2.85 Cr', pricePerSqft: '₹15,405', fairValue: '₹2.75–2.95 Cr', rentalYield: '3.1%', risk: 'Moderate', growth: 'Positive',
    verification: 'Property Reviewed', opportunityScore: 89, highlight: 'Prime location · Strong connectivity · High rental demand',
    bedrooms: 3, areaSqft: 1850, areaLabel: '3 BHK · 1,850 sq.ft.', rent: '₹70K–₹78K/month',
    projectName: 'Aurum Heights', developer: 'Sobha Limited Developers', projectRange: '₹1.35 Cr – ₹2.40 Cr', perSqftRange: '₹9,850 – ₹12,600', flats: '2 & 3 BHK Flats', towers: '6 Towers · 1,024 Units', agentName: 'Raj Mehta',
  },
  {
    title: 'Waterfront Luxury Apartment', category: 'Luxury Residential', country: 'UAE', city: 'Dubai', locality: 'Dubai Marina', currency: 'AED',
    price: 2950000, priceLabel: 'AED 2.95M', pricePerSqft: 'AED 2,077', fairValue: 'AED 2.80–3.10M', rentalYield: '6.2%', risk: 'Moderate', growth: 'Strong',
    verification: 'Verified Listing', opportunityScore: 93, highlight: 'Waterfront location · Strong rental demand · Premium amenities',
    bedrooms: 2, areaSqft: 1420, areaLabel: '2 BR · 1,420 sq.ft.', rent: 'AED 14K–16K/month',
    projectName: 'Marina Crest', developer: 'Emaar Properties', projectRange: 'AED 1.8M – AED 4.2M', perSqftRange: 'AED 1,750 – 2,400', flats: '1, 2 & 3 BR Apartments', towers: '4 Towers · 860 Units', agentName: 'Layla Hassan',
  },
  {
    title: 'The Shorefront', category: 'Luxury Residential', country: 'Singapore', city: 'Singapore', locality: 'Loyang / Changi', currency: 'SGD',
    price: 1555000, priceLabel: 'S$1.555M', pricePerSqft: 'S$1,983', fairValue: 'S$1.50–1.65M', rentalYield: '3.2%', risk: 'Moderate', growth: 'Positive',
    verification: 'Verified Listing', opportunityScore: 89, highlight: 'Coastal location · Boutique 23-unit development',
    bedrooms: 2, areaSqft: 775, areaLabel: '2 BR + Utility · 775–818 sq.ft.', rent: 'S$4.2K–4.8K/month',
    projectName: 'The Shorefront', developer: 'Changi Coast Developments', projectRange: 'S$1.2M – S$2.1M', perSqftRange: 'S$1,850 – 2,150', flats: '1–3 BR Units', towers: '1 Block · 23 Units', agentName: 'Daniel Tan',
  },
  {
    title: 'Downtown Sky Residences', category: 'Residential', country: 'UAE', city: 'Dubai', locality: 'Downtown Dubai', currency: 'AED',
    price: 2400000, priceLabel: 'AED 2.40M', pricePerSqft: 'AED 2,025', fairValue: 'AED 2.30–2.55M', rentalYield: '6.1%', risk: 'Moderate', growth: 'Strong',
    verification: 'Verified Listing', opportunityScore: 94, highlight: 'Prime location · High rental demand',
    bedrooms: 2, areaSqft: 1185, areaLabel: '2 BR · 1,185 sq.ft.', rent: 'AED 12K–14K/month',
    projectName: 'Sky Residences', developer: 'Emaar Properties', projectRange: 'AED 1.6M – AED 3.5M', perSqftRange: 'AED 1,900 – 2,300', flats: '1 & 2 BR Apartments', towers: '2 Towers · 540 Units', agentName: 'Omar Khalid',
  },
  {
    title: 'Premium Sea View Tower', category: 'Luxury', country: 'India', city: 'Mumbai', locality: 'Worli', currency: 'INR',
    price: 48500000, priceLabel: '₹4.85 Cr', pricePerSqft: '₹25,260', fairValue: '₹4.65–5.05 Cr', rentalYield: '2.7%', risk: 'Moderate', growth: 'Positive',
    verification: 'Verified Listing', opportunityScore: 92, highlight: 'Sea-facing · Premium neighbourhood',
    bedrooms: 3, areaSqft: 1920, areaLabel: '3 BHK · 1,920 sq.ft.', rent: '₹1.1L–₹1.3L/month',
    projectName: 'Worli Sea Towers', developer: 'Lodha Group', projectRange: '₹3.9 Cr – ₹9.5 Cr', perSqftRange: '₹22,000 – ₹30,000', flats: '3 & 4 BHK Flats', towers: '2 Towers · 380 Units', agentName: 'Neha Kapoor',
  },
  {
    title: 'Tech Park Residency', category: 'Residential', country: 'India', city: 'Bengaluru', locality: 'Whitefield', currency: 'INR',
    price: 14800000, priceLabel: '₹1.48 Cr', pricePerSqft: '₹10,137', fairValue: '₹1.40–1.55 Cr', rentalYield: '3.6%', risk: 'Moderate', growth: 'Strong',
    verification: 'Verified Listing', opportunityScore: 90, highlight: 'IT corridor · Strong rental potential',
    bedrooms: 3, areaSqft: 1460, areaLabel: '3 BHK · 1,460 sq.ft.', rent: '₹45K–₹52K/month',
    projectName: 'Tech Park Residency', developer: 'Prestige Group', projectRange: '₹95 L – ₹1.9 Cr', perSqftRange: '₹8,800 – ₹11,200', flats: '2 & 3 BHK Flats', towers: '5 Towers · 960 Units', agentName: 'Arjun Rao',
  },
  {
    title: 'Prime Office Tower', category: 'Commercial', country: 'India', city: 'Mumbai', locality: 'Bandra Kurla Complex', currency: 'INR',
    price: 62500000, priceLabel: '₹6.25 Cr', pricePerSqft: '₹19,531', fairValue: '₹5.95–6.50 Cr', rentalYield: '5.2%', risk: 'Moderate', growth: 'Positive',
    verification: 'Verified Listing', opportunityScore: 87, highlight: 'Business district · Corporate rental demand',
    bedrooms: 0, areaSqft: 3200, areaLabel: 'Office · 3,200 sq.ft.', rent: '₹2.4L–₹2.8L/month',
    projectName: 'BKC Prime', developer: 'Godrej Properties', projectRange: '₹3.2 Cr – ₹14 Cr', perSqftRange: '₹17,500 – ₹22,000', flats: 'Office Units', towers: '1 Tower · 210 Units', agentName: 'Sameer Joshi',
  },
  {
    title: 'Palm Garden Villa', category: 'Villa', country: 'UAE', city: 'Dubai', locality: 'Jumeirah', currency: 'AED',
    price: 7500000, priceLabel: 'AED 7.50M', pricePerSqft: 'AED 1,442', fairValue: 'AED 7.20–7.80M', rentalYield: '4.8%', risk: 'Moderate', growth: 'Strong',
    verification: 'Verified Listing', opportunityScore: 90, highlight: 'Private pool · Gated community · Premium location',
    bedrooms: 5, areaSqft: 5200, areaLabel: '5 BR · 5,200 sq.ft.', rent: 'AED 38K–45K/month',
    projectName: 'Palm Garden Estate', developer: 'Meraas', projectRange: 'AED 5.5M – AED 12M', perSqftRange: 'AED 1,300 – 1,800', flats: '4 & 5 BR Villas', towers: '64 Villas', agentName: 'Fatima Al Noor',
  },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nrg_realty');
    await Property.deleteMany({});
    const docs = await Property.insertMany(base.map(build));
    console.log(`Seeded ${docs.length} properties.`);
  } catch (e) {
    console.error('Seed failed:', e.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
