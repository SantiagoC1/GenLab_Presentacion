// Public address of the published presentation. The QR code on slides 1 and 10 points here.
// Leave it empty to hide the QR. The GitHub Pages workflow sets VITE_PRESENTATION_URL automatically,
// so you only need to write the address here (or export the variable) to build the QR on your own machine.
export const PRESENTATION_URL = import.meta.env?.VITE_PRESENTATION_URL || '';
