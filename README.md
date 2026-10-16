# Leaflet Map (merged features)

This Angular 19 standalone application merges the reusable features from the uploaded `maps/` folder into the runnable Leaflet app.

## Run

```bash
npm install
npm start
```

Open `http://localhost:4200`. Internet access is needed for OpenStreetMap tiles and Nominatim location search.

## Included features

- World map with country boundary hover, tooltips, click-to-zoom, and return-to-world control.
- CONUS and OCONUS mode controls.
- Location search by name or manual latitude/longitude.
- Optional accommodation, sightseeing, and location-benefit fields.
- Marker display, duplicate-coordinate checks, remove marker, and JSON export.
- Coordinate range validation and basic selected-region bounds validation.
- Responsive layout, Leaflet resize handling, and map cleanup.

## Important data limitation

The uploaded `maps/` source code references files such as `assets/maps/usa.svg`, `assets/maps/world.svg`, `assets/maps/states.json`, and country boundary data, but those files were not included in the ZIP. The merged app therefore uses the included world-country GeoJSON (`src/app/map/geo.ts`). The CONUS mode zooms to the United States country boundary; **state-level selection needs a US states GeoJSON dataset**. Also, location validation currently checks the selected feature's bounding box, not its exact polygon.
