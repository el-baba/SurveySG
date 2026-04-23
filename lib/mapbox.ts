export const SINGAPORE_CENTER: [number, number] = [103.8198, 1.3521];
export const SINGAPORE_ZOOM = 11;

export const SINGAPORE_BOUNDS: [[number, number], [number, number]] = [
  [103.4, 1.1],  // SW
  [104.2, 1.6],  // NE
];

export const MAP_STYLES = {
  streets: "mapbox://styles/mapbox/streets-v12",
  dark: "mapbox://styles/mapbox/dark-v11",
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
} as const;

// Blue choropleth color steps: [0, 10, 50, 100, 200, 500+]
export const CHOROPLETH_COLORS = [
  "#e8f4f8",
  "#c6e2f0",
  "#7bbcd5",
  "#2196b0",
  "#0d6e8c",
  "#04394d",
];

export const CHOROPLETH_STEPS = [0, 5, 15, 30, 60, 100];
