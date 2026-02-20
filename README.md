# MRMS Browser

A client-side web application for visualizing NOAA's Multi-Radar Multi-Sensor (MRMS) weather data products. The application fetches GRIB2 files directly from NOAA's public S3 bucket, decodes them in the browser using Web Workers, and renders animated precipitation and reflectivity overlays on Google Maps.

## Overview

MRMS combines data from NEXRAD radars, rain gauges, and atmospheric models to produce gridded precipitation and reflectivity products updated every 2 minutes. This browser provides real-time access to 60+ MRMS products including Quantitative Precipitation Estimates (QPE), radar reflectivity composites, echo tops, and quality indices—without requiring a backend server.

## Features

- **Direct S3 Access**: Fetches GRIB2 files from `noaa-mrms-pds.s3.amazonaws.com` without proxying
- **Browser-Based GRIB2 Decoding**: Parses GRIB2 format and extracts embedded PNG data using a Web Worker
- **Multi-Layer Caching**: Three-tier cache (memory → IndexedDB → network) with gzip compression
- **Animated Playback**: Frame-by-frame or continuous playback at configurable speeds (0.5x–3x)
- **Interactive Color Mapping**: Adjustable palettes, color counts, value ranges, and per-color overrides
- **Point Queries**: Click anywhere on the overlay to read the underlying data value
- **USGS Basin Overlays**: Search and display watershed boundaries linked to USGS gauge stations
- **Unit Conversion**: Toggle between metric and imperial units

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              Browser                                     │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────┐  │
│  │ Product/Time │───▶│   api.js     │───▶│    api-worker.js         │  │
│  │  Selection   │    │  Orchestrator │    │  (Web Worker)            │  │
│  └──────────────┘    └──────────────┘    │  - GRIB2 decode          │  │
│                             │            │  - LUT transform         │  │
│                             ▼            │  - PNG extraction        │  │
│                      ┌──────────────┐    └──────────────────────────┘  │
│                      │  IndexedDB   │◀──── gzip-compressed Uint16Array │
│                      │  grib2-cache │                                   │
│                      └──────────────┘                                   │
│                             │                                           │
│                             ▼                                           │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────┐  │
│  │  dataStore   │◀───│  display.js  │───▶│    RasterGenerator       │  │
│  │ (raw grids)  │    │  Coordinator │    │  (OffscreenCanvas)       │  │
│  └──────────────┘    └──────────────┘    └──────────────────────────┘  │
│                             │                        │                  │
│                             ▼                        ▼                  │
│                      ┌──────────────┐         ┌─────────────┐          │
│                      │ imageCache   │◀────────│ PNG Blob    │          │
│                      │ (Object URLs)│         │ URL         │          │
│                      └──────────────┘         └─────────────┘          │
│                             │                                           │
│                             ▼                                           │
│                      ┌──────────────────────────────────────────────┐  │
│                      │          MercatorOverlay (Google Maps)        │  │
│                      │          - Web Mercator projection            │  │
│                      │          - Click-to-grid coordinate mapping   │  │
│                      └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

**Data Flow**:
1. User selects a product and time range via the UI
2. `api.js` lists files from S3, checks IndexedDB cache, dispatches uncached files to the Web Worker
3. Worker fetches gzipped GRIB2, decompresses via `DecompressionStream`, parses GRIB2 sections, extracts PNG, applies lookup table (LUT) to transform from native grid to display grid
4. Decoded `Uint16Array` is gzip-compressed and stored in IndexedDB; raw data cached in `dataStore`
5. `display.js` applies color map transformations, generates PNG via `OffscreenCanvas`, caches the Object URL
6. `MercatorOverlay` renders the image aligned to CONUS bounding box

**Event-Driven Communication**: Components communicate exclusively through `CustomEvent` dispatching on `document`. Events include `product-selected`, `time-selected`, `display-file`, `frame-changed`, `palette-set`, `overlay-click`, etc.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Build | Vite |
| Maps | Google Maps JavaScript API |
| GRIB2 Parsing | Custom decoder (ported from Java) |
| PNG Decoding | fast-png (bundled) |
| Compression | Native CompressionStream/DecompressionStream |
| Persistence | IndexedDB |
| Parallel Processing | Web Workers |
| Rendering | OffscreenCanvas |
| Vector Data | Geobuf/Protobuf (pbf) |
| Data Tables | DataTables.js |

## Key Engineering Decisions

### 1. Browser-Side GRIB2 Decoding
GRIB2 is a complex binary format typically processed server-side. This implementation ports the NOAA GRIB2 specification to JavaScript, extracting:
- Section 5 (Data Representation): `referenceValue`, `binaryScaleFactor`, `decimalScaleFactor`
- Section 7 (Data): PNG-compressed grid values

Values are stored as `Uint16` and decoded on-demand: `real = (scaled × 2^binaryScale + referenceValue) / 10^decimalScale`

### 2. Lookup Table (LUT) Grid Transformation
MRMS grids use a Lambert Conformal Conic projection. Rather than reprojecting 2.17M grid cells per frame at runtime, a precomputed 1D index array (`MRMS_LUT.json`, ~8MB base64-encoded) maps each Web Mercator display pixel to the corresponding GRIB cell index. This reduces per-frame transformation to a single array lookup.

### 3. Three-Tier Caching Strategy
- **L1 (Memory)**: `dataStore` holds decoded `Uint16Array` for instant access during playback
- **L2 (IndexedDB)**: gzip-compressed grids persist across sessions; ~4:1 compression ratio
- **L3 (Network)**: S3 fetch only when L1 and L2 miss

Image cache is keyed by `fileName + visualizationState` (palette, color count, range, custom colors), allowing palette changes without re-fetching data.

### 4. OffscreenCanvas Rendering
Raster generation runs off the main thread where supported. Each 1924×1128 grid (~2.17M pixels) is colorized via threshold-based color mapping and exported as PNG Blob → Object URL.

### 5. Abort Controller for Fetch Cancellation
Long time ranges may span thousands of files. The API layer tracks in-flight requests and prompts users before canceling if:
- Product changed
- New time range is a strict subset of current
- New time range has zero overlap

### 6. Custom Google Maps Overlay
`MercatorOverlay` extends `google.maps.OverlayView` to:
- Position raster images using Web Mercator projection (not WGS84 `GroundOverlay`)
- Convert pixel clicks to grid coordinates via bounding box interpolation
- Distinguish clicks from map drags (5px threshold)

## Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| GRIB2 files are gzip-compressed binary with embedded PNG | Chain `DecompressionStream` → custom GRIB2 parser → fast-png decoder |
| Lambert Conformal grid doesn't align with Web Mercator tiles | Precomputed LUT transforms 1D index mapping at load time |
| Playback lag when generating images on-the-fly | Pre-generate all frames before playback; cache by visualization key |
| IndexedDB storage grows unbounded | Expose cache viewer (DataTables) with selective deletion |
| Color palette changes require regenerating all frames | Cache images by composite key; regenerate current frame first for immediate feedback |
| Point query accuracy on Web Mercator overlay | Map click → container pixel → projection → bounding box interpolation → grid index |

## Setup Instructions

### Prerequisites
- Node.js 18+
- Google Maps API key with Maps JavaScript API enabled

### Installation

```bash
git clone <repository-url>
cd mrms-browser
npm install
```

### Configuration

Create a `.env` file or configure `index.html` with your Google Maps API key:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY"></script>
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```