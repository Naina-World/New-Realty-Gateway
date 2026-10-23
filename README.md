# New Realty Gateway — MERN property site

Pages: **Home** (`/`), **Property listing** (`/property`), **Property detail** (`/property/:id`).
Header contains only the logo, Home and Property.

## Stack
MongoDB + Mongoose · Express · React 18 (Vite) + React Router · Node

## Run it
1. Start MongoDB locally (or put an Atlas URI in `server/.env` as `MONGO_URI`).
2. Install: `npm run install-all`
3. Seed sample data: `npm run seed`   (8 properties across Mumbai, Dubai, Singapore, Bengaluru)
4. Terminal A: `npm run server`  → http://localhost:5000
5. Terminal B: `npm run client`  → http://localhost:5173

## API
- `GET /api/properties?country&city&type&bedrooms&verified&q&minArea&maxArea&tab&page&limit`
- `GET /api/properties/filters` · `/markets` · `/featured`
- `GET /api/properties/:id` (full detail + similar properties)

## Notes
- Seed listings have no photos, so cards show an illustrated placeholder. Add URLs to a property's `images` array (in `server/seed.js`) and re-run the seed to show real photos.
- Re-running `npm run seed` wipes and recreates the properties collection.
