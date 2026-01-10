# PlanScope - Planning Permission Intelligence Overlay

A Chrome extension (Manifest V3) that overlays UK planning permission intelligence directly onto property listing pages on Rightmove and Zoopla.

## Features

- **Planning Application Overlay**: View nearby planning applications directly on property listings
- **Local Authority Climate**: See approval rates, decision times, and planning climate
- **Interactive Map**: Visualize applications with color-coded status markers
- **Smart Filters**: Filter by status (Approved, Refused, Pending, Withdrawn)
- **Intelligent Insights**: Rules-based analysis of planning patterns
- **Shadow DOM Isolation**: Clean UI that doesn't interfere with host sites

## Project Structure

```
planscope/
├── extension/          # Chrome extension (TypeScript + Vite)
│   ├── src/
│   │   ├── content/    # Content scripts and overlay UI
│   │   ├── background/ # Service worker
│   │   ├── popup/      # Extension popup
│   │   ├── services/   # API client, geocoding, storage
│   │   └── types/      # TypeScript type definitions
│   └── public/         # Static assets (manifest, icons)
│
└── api/                # Mock API server (Express + TypeScript)
    └── src/
        ├── routes/     # API endpoints
        └── data/       # Mock data generators
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Chrome browser

### Installation

1. **Install dependencies**:

```bash
# Install extension dependencies
cd extension
npm install

# Install API dependencies
cd ../api
npm install
```

2. **Start the mock API**:

```bash
cd api
npm run dev
```

The API will run on `http://localhost:3000`

3. **Build the extension**:

```bash
cd extension
npm run build
```

4. **Load in Chrome**:

- Open `chrome://extensions/`
- Enable "Developer mode"
- Click "Load unpacked"
- Select the `extension/dist` folder

### Development

Run the extension in watch mode:

```bash
cd extension
npm run dev
```

## Usage

1. Navigate to a property listing on:
   - Rightmove: `https://www.rightmove.co.uk/properties/...`
   - Zoopla: `https://www.zoopla.co.uk/for-sale/details/...`

2. The PlanScope overlay will appear in the top-right corner

3. View:
   - Local authority planning climate and approval rates
   - Map of nearby planning applications
   - List of applications with status, type, and decision dates
   - Smart insights about the area

4. Use filters to narrow down by application status

5. Click the header to collapse/expand the panel

## API Endpoints

### GET /planning-applications

Fetch planning applications near a location.

**Query Parameters:**
- `lat` (required): Latitude
- `lng` (required): Longitude
- `radius_m` (optional): Search radius in meters (default: 500)
- `from_date` (optional): Filter from date (YYYY-MM-DD)
- `to_date` (optional): Filter to date (YYYY-MM-DD)

**Response:**
```json
{
  "applications": [
    {
      "id": "APP/2024/1234",
      "address": "12 High Street",
      "lat": 51.501,
      "lng": -0.141,
      "distance_m": 120,
      "status": "APPROVED",
      "decision_date": "2024-06-14",
      "type": "EXTENSION",
      "summary": "Single storey rear extension"
    }
  ],
  "local_authority": {
    "name": "Camden",
    "approval_rate": 0.72,
    "avg_decision_days": 56,
    "planning_climate": "PRO_DEVELOPMENT"
  }
}
```

## Tech Stack

- **Extension**: TypeScript, Vite, Manifest V3
- **UI**: Shadow DOM (vanilla TypeScript, no framework)
- **Map**: Leaflet + OpenStreetMap
- **API**: Express.js + TypeScript
- **Styling**: CSS-in-JS (injected into Shadow DOM)

## Status Colors

| Status | Color |
|--------|-------|
| Approved | Green (#22c55e) |
| Refused | Red (#ef4444) |
| Pending | Amber (#f59e0b) |
| Withdrawn | Grey (#6b7280) |

## License

MIT
