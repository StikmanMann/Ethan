// Initialize permutation table
const permutationSize = 1000;
function seedPermutation(seed) {
  const permutation = Array.from({ length: permutationSize }, (_, i) => i);
  const random = (seed) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
  for (let i = permutation.length - 1; i > 0; i--) {
    const j = Math.floor(random(seed) * (i + 1));
    [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
  }
  return [...permutation, ...permutation];
}

const p = seedPermutation(12345); // Use a fixed seed

// Gradients for 2D noise (unit vectors)
const gradients = [
  [Math.SQRT1_2, Math.SQRT1_2], // 45°
  [-Math.SQRT1_2, Math.SQRT1_2], // 135°
  [Math.SQRT1_2, -Math.SQRT1_2], // 315°
  [-Math.SQRT1_2, -Math.SQRT1_2], // 225°
  [1, 0], // 0°
  [-1, 0], // 180°
  [0, 1], // 90°
  [0, -1], // 270°
];

function fade(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(t, a, b) {
  return a + t * (b - a);
}

export function perlin2D(x, y) {
  // Wrap coordinates to 0-255
  const xi = Math.floor(x) & 255;
  const yi = Math.floor(y) & 255;

  // Calculate fractional parts
  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);

  // Fade curves
  const u = fade(xf);
  const v = fade(yf);

  // Hash coordinates for the four corners
  const aa = p[p[xi] + yi] % 8;
  const ab = p[p[xi] + yi + 1] % 8;
  const ba = p[p[xi + 1] + yi] % 8;
  const bb = p[p[xi + 1] + yi + 1] % 8;

  // Calculate dot products
  const dot00 = gradients[aa][0] * xf + gradients[aa][1] * yf;
  const dot01 = gradients[ab][0] * xf + gradients[ab][1] * (yf - 1);
  const dot10 = gradients[ba][0] * (xf - 1) + gradients[ba][1] * yf;
  const dot11 = gradients[bb][0] * (xf - 1) + gradients[bb][1] * (yf - 1);

  // Interpolate and return
  return lerp(v, lerp(u, dot00, dot10), lerp(u, dot01, dot11));
}

// Example usage:
const noiseValue = perlin2D(15, 20);
console.warn(noiseValue);

// Generate fractal noise by combining multiple octaves
export function octavePerlin(x, y, octaves, persistence) {
  let total = 0;
  let frequency = 1;
  let amplitude = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    total += perlin2D(x * frequency, y * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= 2;
  }

  return total / maxValue;
}
