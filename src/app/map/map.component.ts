import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { geoJSON } from './geo';

type MapMode = 'CONUS' | 'OCONUS';
interface LocationMarker {
  locationName: string;
  latitude: number;
  longitude: number;
  areaAccomodations?: string;
  sightSeeing?: string;
  locationBenefits?: string;
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private map?: L.Map;
  private boundaryLayer?: L.GeoJSON;
  private selectedFeature?: GeoJSON.Feature;
  private resizeObserver?: ResizeObserver;
  private markersLayer?: L.LayerGroup;

  mode: MapMode = 'OCONUS';
  selectedPlace = '';
  locationName = '';
  latitude: number | null = null;
  longitude: number | null = null;
  areaAccomodations = '';
  sightSeeing = '';
  locationBenefits = '';
  useCoordinates = false;
  message = '';
  messageType: 'error' | 'success' | 'info' = 'info';
  locations: LocationMarker[] = [];

  ngAfterViewInit(): void {
    requestAnimationFrame(() => this.initMap());
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.map?.remove();
    this.map = undefined;
  }

  private initMap(): void {
    const element = document.getElementById('map');
    if (!element) {
      this.showMessage('The map container could not be found.', 'error');
      return;
    }
    if (this.map) this.map.remove();
    this.map = L.map(element, { center: [20, 0], zoom: 2, minZoom: 2, maxZoom: 10, worldCopyJump: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors', maxZoom: 19,
    }).addTo(this.map);
    this.markersLayer = L.layerGroup().addTo(this.map);
    this.drawBoundaries();
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.map?.invalidateSize());
      this.resizeObserver.observe(element);
    }
    requestAnimationFrame(() => this.map?.invalidateSize());
  }

  private drawBoundaries(): void {
    if (!this.map) return;
    this.boundaryLayer?.remove();
    this.selectedFeature = undefined;
    const features = (geoJSON as unknown as GeoJSON.FeatureCollection).features;
    const filtered = this.mode === 'CONUS'
      ? features.filter(feature => ['United States of America', 'United States'].includes(String(feature.properties?.['name'])))
      : features;
    this.boundaryLayer = L.geoJSON({ type: 'FeatureCollection', features: filtered } as GeoJSON.FeatureCollection, {
      style: () => ({ color: '#526477', weight: 1, fillColor: '#8db6d8', fillOpacity: 0.25 }),
      onEachFeature: (feature, layer) => {
        const name = String(feature.properties?.['name'] ?? 'Unknown place');
        layer.bindTooltip(name);
        layer.on('mouseover', () => (layer as L.Path).setStyle({ color: '#e05b47', weight: 2, fillOpacity: 0.45 }));
        layer.on('mouseout', () => this.boundaryLayer?.resetStyle(layer));
        layer.on('click', () => this.selectFeature(feature, layer, name));
      },
    }).addTo(this.map);
    if (this.mode === 'CONUS') {
      const us = filtered[0];
      if (us) {
        this.selectedPlace = String(us.properties?.['name'] ?? 'United States');
        const layer = L.geoJSON(us);
        const bounds = layer.getBounds();
        if (bounds.isValid()) this.map.fitBounds(bounds, { padding: [12, 12] });
      }
    } else {
      this.selectedPlace = '';
      this.map.setView([20, 0], 2);
    }
  }

  private selectFeature(feature: GeoJSON.Feature, layer: L.Layer, name: string): void {
    if (this.mode === 'CONUS') {
      // The supplied project does not include state-boundary data; the available GeoJSON contains country boundaries.
      this.showMessage('The supplied data has country boundaries only. Add a US states GeoJSON file to enable state-level selection.', 'info');
    }
    this.selectedFeature = feature;
    this.selectedPlace = name;
    const bounds = (layer as L.Polygon).getBounds?.();
    if (bounds?.isValid() && this.map) this.map.fitBounds(bounds, { padding: [20, 20], maxZoom: 6 });
    this.showMessage(`Selected ${name}. You can add a location by name or coordinates.`, 'success');
  }

  setMode(mode: MapMode): void {
    this.mode = mode;
    this.message = '';
    this.drawBoundaries();
  }

  goBackToWorldMap(): void {
    this.mode = 'OCONUS';
    this.selectedPlace = '';
    this.drawBoundaries();
    this.map?.setView([20, 0], 2);
  }

  async addLocation(): Promise<void> {
    this.message = '';
    let lat: number;
    let lon: number;
    let name = this.locationName.trim();
    if (this.useCoordinates) {
      if (this.latitude === null || this.longitude === null || !Number.isFinite(Number(this.latitude)) || !Number.isFinite(Number(this.longitude))) {
        this.showMessage('Enter valid latitude and longitude values.', 'error'); return;
      }
      lat = Number(this.latitude); lon = Number(this.longitude);
      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        this.showMessage('Latitude must be between -90 and 90 and longitude between -180 and 180.', 'error'); return;
      }
      if (!name) name = await this.reverseGeocode(lat, lon) || `Location ${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    } else {
      if (!name) { this.showMessage('Enter a location name.', 'error'); return; }
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(name)}`);
        if (!response.ok) throw new Error('Location search failed');
        const results = await response.json();
        if (!results.length) { this.showMessage('No coordinates were found for that location.', 'error'); return; }
        lat = Number(results[0].lat); lon = Number(results[0].lon);
      } catch {
        this.showMessage('Could not search for this location. Check your internet connection and try coordinates instead.', 'error'); return;
      }
    }
    if (!this.isWithinSelectedPlace(lon, lat)) {
      this.showMessage(`This location is outside the selected ${this.mode === 'CONUS' ? 'United States map area' : 'country'}. Select a matching country or choose another location.`, 'error'); return;
    }
    const duplicate = this.locations.some(item => Math.abs(item.latitude - lat) < 0.00001 && Math.abs(item.longitude - lon) < 0.00001);
    if (duplicate) { this.showMessage('A marker already exists at these coordinates.', 'error'); return; }
    const marker: LocationMarker = {
      locationName: name, latitude: lat, longitude: lon,
      areaAccomodations: this.areaAccomodations.trim(), sightSeeing: this.sightSeeing.trim(), locationBenefits: this.locationBenefits.trim(),
    };
    this.locations.push(marker);
    const leafletMarker = L.marker([lat, lon]).bindPopup(this.markerPopup(marker));
    leafletMarker.addTo(this.markersLayer ?? this.map!);
    this.map?.setView([lat, lon], Math.max(this.map.getZoom(), 5));
    this.locationName = ''; this.latitude = null; this.longitude = null;
    this.areaAccomodations = ''; this.sightSeeing = ''; this.locationBenefits = '';
    this.showMessage(`Added ${name}.`, 'success');
  }

  private isWithinSelectedPlace(longitude: number, latitude: number): boolean {
    if (!this.selectedFeature) return this.mode === 'OCONUS' || (latitude >= 24 && latitude <= 50 && longitude >= -126 && longitude <= -66);
    // A Leaflet GeoJSON layer gives a useful first validation for polygon boundaries.
    const layer = L.geoJSON(this.selectedFeature);
    const bounds = layer.getBounds();
    return bounds.contains([latitude, longitude]);
  }

  private async reverseGeocode(lat: number, lon: number): Promise<string> {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
      if (!response.ok) return '';
      const result = await response.json();
      return String(result.name || result.display_name || '');
    } catch { return ''; }
  }

  private markerPopup(marker: LocationMarker): string {
    const safe = (value: string) => value.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]!));
    return `<strong>${safe(marker.locationName)}</strong><br>Lat: ${marker.latitude}<br>Long: ${marker.longitude}` +
      (marker.areaAccomodations ? `<br>Area accommodations: ${safe(marker.areaAccomodations)}` : '') +
      (marker.sightSeeing ? `<br>Sight seeing: ${safe(marker.sightSeeing)}` : '') +
      (marker.locationBenefits ? `<br>Location benefits: ${safe(marker.locationBenefits)}` : '');
  }

  removeLocation(index: number): void {
    this.locations.splice(index, 1);
    this.markersLayer?.clearLayers();
    this.locations.forEach(marker => L.marker([marker.latitude, marker.longitude]).bindPopup(this.markerPopup(marker)).addTo(this.markersLayer!));
  }

  exportLocations(): void {
    const blob = new Blob([JSON.stringify(this.locations, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = 'map-locations.json'; anchor.click();
    URL.revokeObjectURL(url);
  }

  private showMessage(message: string, type: 'error' | 'success' | 'info'): void {
    this.message = message; this.messageType = type;
  }
}
