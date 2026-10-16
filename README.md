# Leaflet Map Explorer

An interactive map application built with **Angular**, **TypeScript**, and **Leaflet**. It provides a map-based interface for exploring geographic regions, switching between world and US map views, searching for locations, and managing map markers.

## Repository Description

**Leaflet Map Explorer — an Angular and Leaflet application for interactive world/US maps, geographic navigation, location search, and marker management.**

## Features

- Interactive map navigation and zooming.
- World map with country boundaries, hover highlighting, and country selection where supported by the available GeoJSON data.
- CONUS / OCONUS map modes.
- Location search by name or manual latitude/longitude entry.
- Add and view location markers.
- Duplicate-coordinate checks.
- Review and remove markers.
- Capture supported location details such as accommodation, sightseeing, or location benefits.
- Export supported marker data as JSON.
- Responsive map layout.

> US state-level selection requires a compatible US states GeoJSON dataset. Available features depend on the components and geographic data included in the repository.

## Technology Stack

- Angular
- TypeScript
- Leaflet
- OpenStreetMap map tiles
- GeoJSON geographic data
- Nominatim / OpenStreetMap search, if enabled

## Prerequisites

- Node.js compatible with the Angular version specified in `package.json`
- npm
- Internet access for online map tiles and location search

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd <repository-folder>
```

Replace the placeholders with your actual repository URL and folder name.

### 2. Install dependencies

```bash
npm install
```

### 3. Start the application

If `package.json` defines a `start` script:

```bash
npm start
```

Otherwise, run Angular CLI:

```bash
npx ng serve
```

### 4. Open the application

The development server usually runs at:

```text
http://localhost:4200
```

Use the URL printed in your terminal if Angular chooses a different port.

## How to Use

1. Start the application.
2. Choose an available map mode, such as CONUS or OCONUS.
3. Pan and zoom the map.
4. Select a country or region if its geographic data is available.
5. Search for a location or enter coordinates.
6. Add a marker and any supported location details.
7. Review or remove markers.
8. Export marker data if the export option is available.

## Geographic Data and Map Tiles

- **Map tiles:** The application uses online map tiles such as OpenStreetMap, so an internet connection is required.
- **GeoJSON:** Country and state boundaries depend on the data files included in the project.
- **US state selection:** If a US states GeoJSON file is not included, add a compatible dataset and update the asset path and selection logic.
- **Location search:** If Nominatim is enabled, requests depend on the service being available. Follow its current usage policy and rate limits.

## Project Structure

The exact structure depends on the Angular version and components in this repository. Common folders may look like:

```text
src/
  app/
    components/       # Map and UI components
    services/         # API and map-related services, if present
  assets/
    maps/             # GeoJSON, SVG, and other map data
  styles.scss         # Global styles, if present
```

Check the actual project tree for the exact component and asset names.

## Useful Commands

```bash
npm install       # Install dependencies
npm start         # Start, if configured in package.json
npx ng serve      # Start Angular dev server
npx ng build      # Build the application
npx ng test       # Run tests, if configured
```

## Troubleshooting

### The page is blank

1. Check the browser Developer Tools **Console**.
2. Check the terminal for Angular compilation errors.
3. Confirm the map container has a non-zero height.
4. Confirm Leaflet CSS is loaded.
5. Verify GeoJSON/SVG asset paths match the files under `src/assets`.
6. Initialize the map only once the container exists.
7. If the map container becomes visible after initialization, call Leaflet's `invalidateSize()`.

### The map background does not appear

- Check your internet connection.
- Inspect the Network tab for failed tile requests.
- Verify the tile URL and attribution configuration.

### Location search returns no results

- Confirm the search service is enabled and reachable.
- Inspect the Network tab for request errors.
- Try a more specific location.
- Follow the provider's usage policy and rate limits.

### US states do not open individually

The app needs a compatible US states GeoJSON dataset and matching selection logic. A world-country dataset does not contain state boundaries.

## Development Notes

- Keep geographic data in the configured assets folder and ensure paths match the code.
- Leaflet marker positions use `[latitude, longitude]`; GeoJSON coordinate arrays are generally `[longitude, latitude]`.
- Do not commit `node_modules`, build output, or local cache folders.
- Do not commit API keys, secrets, or environment-specific credentials.

## License

Add the license that applies to this repository before publishing it publicly. If no license is specified, the repository should not be assumed to be open source.

## Contributing

1. Create a feature branch.
2. Make a focused change.
3. Test the application locally.
4. Open a pull request describing the change and testing performed.
