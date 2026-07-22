import sharp from 'sharp';
import { writeFileSync } from 'fs';

const sizes = [16, 48, 128];

function svg(size) {
  const s = size;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 128 128">
    <defs>
      <radialGradient id="bg" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#333"/>
        <stop offset="100%" stop-color="#111"/>
      </radialGradient>
    </defs>
    <rect x="0" y="0" width="128" height="128" rx="24" fill="url(#bg)"/>

    <!-- Octocat (GitHub Invertocat mark) -->
    <g transform="scale(8)">
      <path fill="#fff" d="
        M8 0C3.58 0 0 3.58 0 8
        c0 3.54 2.29 6.53 5.47 7.59
        c0.4 0.07 0.55-0.17 0.55-0.38
        c0-0.19-0.01-0.82-0.01-1.49
        c-2.01 0.37-2.53-0.49-2.69-0.94
        c-0.09-0.23-0.48-0.94-0.82-1.13
        c-0.28-0.15-0.68-0.52-0.01-0.53
        c0.63-0.01 1.08 0.58 1.23 0.82
        c0.72 1.21 1.87 0.87 2.33 0.66
        c0.07-0.52 0.28-0.87 0.51-1.07
        c-1.78-0.2-3.64-0.89-3.64-3.95
        c0-0.87 0.31-1.59 0.82-2.15
        c-0.08-0.2-0.36-1.02 0.08-2.12
        c0 0 0.67-0.21 2.2 0.82
        c0.64-0.18 1.32-0.27 2-0.27
        s1.36 0.09 2 0.27
        c1.53-1.04 2.2-0.82 2.2-0.82
        c0.44 1.1 0.16 1.92 0.08 2.12
        c0.51 0.56 0.82 1.27 0.82 2.15
        c0 3.07-1.87 3.75-3.65 3.95
        c0.29 0.25 0.54 0.73 0.54 1.48
        c0 1.07-0.01 1.93-0.01 2.2
        c0 0.21 0.15 0.46 0.55 0.38
        A8.013 8.013 0 0 0 16 8
        C16 3.58 12.42 0 8 0z
      "/>
    </g>

    <!-- lightning -->
    <polygon fill="#ffd54f" points="
      60,42
      44,72
      56,72
      48,98
      82,62
      66,62
      76,42
    "/>
  </svg>`;
}

for (const size of sizes) {
  const svgStr = svg(size);
  writeFileSync(`icons/icon${size}.png`, await sharp(Buffer.from(svgStr)).png().toBuffer());
  console.log(`Generated icon${size}.png`);
}
