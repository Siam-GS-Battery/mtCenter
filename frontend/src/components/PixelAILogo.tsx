import React from "react";

interface PixelAILogoProps {
  className?: string;
  title?: string;
}

/** Accent colors — hard-coded so eyes/antenna stay visible on both light and dark backgrounds. */
const EYE_COLOR = "#2997ff";
const EYE_HIGHLIGHT = "#ffffff";
const ANTENNA_BULB = "#0066cc";

/** A single 1x1 pixel on the 16x16 grid. */
interface Pixel {
  x: number;
  y: number;
  fill: string;
  opacity?: number;
}

/** Small helper to keep the pixel list declarative and readable. */
function px(x: number, y: number, fill: string, opacity?: number): Pixel {
  return { x, y, fill, opacity };
}

/** Draws a filled rectangle of pixels (inclusive bounds) with a given fill. */
function rect(x0: number, y0: number, x1: number, y1: number, fill: string, opacity?: number): Pixel[] {
  const pixels: Pixel[] = [];
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      pixels.push(px(x, y, fill, opacity));
    }
  }
  return pixels;
}

// ---- Head silhouette: a 10x10 rounded square (x 3-12, y 3-12), corners clipped ----
const HEAD_BODY = "currentColor";
const headCorners = new Set(["3,3", "12,3", "3,12", "12,12"]);
const HEAD: Pixel[] = rect(3, 3, 12, 12, HEAD_BODY).filter((p) => !headCorners.has(`${p.x},${p.y}`));

// ---- Antenna: stem + round bulb on top, centered ----
const ANTENNA: Pixel[] = [
  px(7, 2, HEAD_BODY),
  px(8, 2, HEAD_BODY),
  px(7, 1, ANTENNA_BULB),
  px(8, 1, ANTENNA_BULB),
];

// ---- Side "ear" panels ----
const EARS: Pixel[] = [...rect(1, 6, 2, 9, HEAD_BODY), ...rect(13, 6, 14, 9, HEAD_BODY)];

// ---- Big square eyes (2x2 each) with a 1px white highlight pixel ----
const LEFT_EYE: Pixel[] = [px(5, 6, EYE_HIGHLIGHT), px(6, 6, EYE_COLOR), px(5, 7, EYE_COLOR), px(6, 7, EYE_COLOR)];
const RIGHT_EYE: Pixel[] = [px(9, 6, EYE_HIGHLIGHT), px(10, 6, EYE_COLOR), px(9, 7, EYE_COLOR), px(10, 7, EYE_COLOR)];

// ---- Tiny smile, drawn on top of the head in currentColor at reduced opacity ----
const SMILE: Pixel[] = [
  px(6, 10, HEAD_BODY, 0.6),
  px(7, 11, HEAD_BODY, 0.6),
  px(8, 11, HEAD_BODY, 0.6),
  px(9, 10, HEAD_BODY, 0.6),
];

// Draw order matters: head first, then features on top so they aren't covered.
const PIXELS: Pixel[] = [...HEAD, ...ANTENNA, ...EARS, ...LEFT_EYE, ...RIGHT_EYE, ...SMILE];

/**
 * Cute pixel-art AI mascot for MT Center.
 *
 * Renders a 16x16 pixel-grid robot head (rounded head, antenna bulb, big
 * square eyes with a highlight pixel, side ear panels, and a tiny smile).
 * The head body uses `currentColor` so it inherits the surrounding text
 * color (white on the dark sidebar, blue elsewhere); eyes and antenna bulb
 * use fixed accent colors so they stay legible on any background.
 */
const PixelAILogo: React.FC<PixelAILogoProps> = ({ className = "w-6 h-6", title = "MT Center AI" }) => {
  return (
    <svg
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      className={className}
    >
      <title>{title}</title>
      {PIXELS.map((p, i) => (
        <rect key={i} x={p.x} y={p.y} width="1" height="1" fill={p.fill} opacity={p.opacity} />
      ))}
    </svg>
  );
};

export default PixelAILogo;
