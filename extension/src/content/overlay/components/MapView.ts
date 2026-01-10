import type { PlanningApplication } from '../../../types';
import { STATUS_COLORS } from '../../../types';
import { escapeHtml } from '../../../utils';

/**
 * Map view component using Leaflet with OpenStreetMap tiles
 */

// We'll load Leaflet dynamically to avoid bundling issues
let leafletLoaded = false;
let L: any;

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

async function loadLeaflet(): Promise<void> {
  if (leafletLoaded) return;

  // Load CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = LEAFLET_CSS;
  document.head.appendChild(link);

  // Load JS
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = LEAFLET_JS;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });

  L = (window as any).L;
  leafletLoaded = true;
}

export async function createMapView(
  centerLat: number,
  centerLng: number,
  applications: PlanningApplication[],
  shadowRoot: ShadowRoot
): Promise<HTMLElement> {
  const container = document.createElement('div');
  container.className = 'planscope-map-container';

  const mapDiv = document.createElement('div');
  mapDiv.className = 'planscope-map';
  mapDiv.id = 'planscope-map-' + Date.now();
  container.appendChild(mapDiv);

  try {
    await loadLeaflet();

    // Inject Leaflet CSS into shadow root
    const leafletStyles = document.createElement('link');
    leafletStyles.rel = 'stylesheet';
    leafletStyles.href = LEAFLET_CSS;
    shadowRoot.appendChild(leafletStyles);

    // Wait for element to be in DOM
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        initializeMap(mapDiv, centerLat, centerLng, applications);
      });
    });
  } catch (error) {
    console.error('[PlanScope] Failed to load Leaflet:', error);
    mapDiv.innerHTML = '<div style="padding: 20px; text-align: center; color: #6b7280;">Map unavailable</div>';
  }

  return container;
}

function initializeMap(
  element: HTMLElement,
  centerLat: number,
  centerLng: number,
  applications: PlanningApplication[]
): void {
  if (!L) return;

  const map = L.map(element, {
    zoomControl: true,
    scrollWheelZoom: false,
  }).setView([centerLat, centerLng], 15);

  // OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map);

  // Property marker (center)
  const propertyIcon = L.divIcon({
    className: 'planscope-marker-property',
    html: `<div style="
      width: 24px;
      height: 24px;
      background: #1f2937;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  L.marker([centerLat, centerLng], { icon: propertyIcon })
    .addTo(map)
    .bindPopup('This property');

  // Application markers
  for (const app of applications) {
    const color = STATUS_COLORS[app.status];

    const icon = L.divIcon({
      className: 'planscope-marker-app',
      html: `<div style="
        width: 16px;
        height: 16px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    L.marker([app.lat, app.lng], { icon })
      .addTo(map)
      .bindPopup(`
        <strong>${escapeHtml(app.address)}</strong><br>
        ${escapeHtml(app.summary)}<br>
        <em>${escapeHtml(app.status)}</em>
      `);
  }

  // Fit bounds to show all markers
  if (applications.length > 0) {
    const bounds = L.latLngBounds([
      [centerLat, centerLng],
      ...applications.map((app) => [app.lat, app.lng]),
    ]);
    map.fitBounds(bounds, { padding: [20, 20] });
  }
}

export function updateMapView(
  _container: HTMLElement,
  _applications: PlanningApplication[]
): void {
  // For now, map doesn't update dynamically
  // Would need to store map reference and update markers
}
