// Shows the first image URL if present, otherwise an illustrated skyline placeholder.
const PALETTES = [
  ['#cfe0f5', '#7ea6d8', '#274b82'],
  ['#d9e8f2', '#8fb4cc', '#2d5470'],
  ['#e2e8f5', '#98a8d4', '#34457a'],
  ['#d5ecee', '#85bcc2', '#245a62'],
];

export default function PropertyImage({ src, seed = 0, label = '', className = '' }) {
  if (src) return <img className={className} src={src} alt={label} loading="lazy" />;
  const [sky, mid, dark] = PALETTES[seed % PALETTES.length];
  const towers = [
    [18, 70, 34], [60, 40, 40], [108, 58, 30], [146, 24, 44], [196, 52, 32], [236, 34, 38], [282, 62, 28],
  ];
  return (
    <svg className={className} viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" role="img" aria-label={label}>
      <rect width="320" height="180" fill={sky} />
      {towers.map(([x, y, w], i) => (
        <g key={i}>
          <rect x={x} y={y + (i % 3) * 6} width={w} height={180 - y} fill={i % 2 ? mid : dark} />
          {[0, 1, 2, 3, 4].map((r) => (
            <rect key={r} x={x + 5} y={y + 12 + r * 18 + (i % 3) * 6} width={w - 10} height="6" fill="#fff" opacity=".35" />
          ))}
        </g>
      ))}
    </svg>
  );
}
