// Public address of the published presentation. The QR code on slides 1 and 10 points here.
// Make it an empty string to hide the QR. The VITE_PRESENTATION_URL environment variable overrides it.
export const PRESENTATION_URL = import.meta.env?.VITE_PRESENTATION_URL || 'https://santiagoc1.github.io/GenLab_Presentacion/#1';
