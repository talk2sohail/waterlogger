'use client';

interface GlassWaterProps {
  current: number;
  target: number;
  size?: number;
  color?: string;
}

function generateWavePath(
  startX: number,
  startY: number,
  width: number,
  amp: number,
  bottomY: number,
  phase: number,
): string {
  const segments = 32;
  const dx = width / segments;
  const freq1 = 5;
  const amp1 = amp;
  const freq2 = 13;
  const amp2 = amp * 0.3;

  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= segments; i++) {
    const x = startX + i * dx;
    const t = (i / segments) * 2 * Math.PI + phase;
    const y = startY + Math.sin(t * freq1) * amp1 + Math.sin(t * freq2) * amp2;
    pts.push({ x, y });
  }

  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < segments; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const cpx1 = p0.x + dx * 0.4;
    const cpy1 = p0.y;
    const cpx2 = p1.x - dx * 0.4;
    const cpy2 = p1.y;
    d += `C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${p1.x} ${p1.y} `;
  }

  d += `L ${startX + width} ${bottomY} L ${startX} ${bottomY} Z`;
  return d;
}

function generateCrestPath(
  startX: number,
  startY: number,
  width: number,
  amp: number,
  phase: number,
): string {
  const segments = 32;
  const dx = width / segments;
  const freq1 = 5;
  const amp1 = amp;
  const freq2 = 13;
  const amp2 = amp * 0.3;

  let d = '';
  for (let i = 0; i <= segments; i++) {
    const x = startX + i * dx;
    const t = (i / segments) * 2 * Math.PI + phase;
    const y = startY + Math.sin(t * freq1) * amp1 + Math.sin(t * freq2) * amp2;
    if (i === 0) {
      d = `M ${x} ${y}`;
    } else {
      const px = startX + (i - 1) * dx;
      const pt = ((i - 1) / segments) * 2 * Math.PI + phase;
      const py = startY + Math.sin(pt * freq1) * amp1 + Math.sin(pt * freq2) * amp2;
      const cpx1 = px + dx * 0.4;
      const cpy1 = py;
      const cpx2 = x - dx * 0.4;
      const cpy2 = y;
      d += `C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${x} ${y} `;
    }
  }
  return d;
}

function makePhases(
  startX: number,
  startY: number,
  width: number,
  amp: number,
  bottomY: number,
  steps: number,
): string[] {
  return Array.from({ length: steps + 1 }, (_, i) =>
    generateWavePath(startX, startY, width, amp, bottomY, (i / steps) * 2 * Math.PI),
  );
}

function makeCrestPhases(
  startX: number,
  startY: number,
  width: number,
  amp: number,
  steps: number,
): string[] {
  return Array.from({ length: steps + 1 }, (_, i) =>
    generateCrestPath(startX, startY, width, amp, (i / steps) * 2 * Math.PI),
  );
}

export function ProgressRing({ current, target, size = 280, color = '#3b82f6' }: GlassWaterProps) {
  const percentage = target > 0 ? Math.min(current / target, 1) : 0;

  const cx = size / 2;
  const tw = size * 0.42;
  const bw = size * 0.34;
  const glassH = size * 0.6;
  const glassTop = size * 0.15;
  const glassBot = glassTop + glassH;

  const gradId = `wg-${color.replace('#', '')}`;
  const grad2Id = `wg2-${color.replace('#', '')}`;
  const glossId = `gl-${color.replace('#', '')}`;

  const pad = 5;
  const waterFillH = percentage * (glassH - pad * 2);
  const waterTopY = glassBot - pad - waterFillH;

  const waveWidth = tw * 1.8;
  const waveStartX = cx - waveWidth / 2;
  const waveAmp = 4;

  const numSteps = 6;
  const backPhases = makePhases(waveStartX, waterTopY, waveWidth, waveAmp, glassBot, numSteps);
  const frontPhases = makePhases(waveStartX, waterTopY + 2, waveWidth, waveAmp - 1, glassBot, numSteps);
  const crestPhases = makeCrestPhases(waveStartX, waterTopY + 2, waveWidth, waveAmp - 1, numSteps);

  const infoR = size * 0.095;
  const infoX = size - infoR - size * 0.005;
  const infoY1 = glassTop + glassH * 0.25;
  const infoY2 = glassTop + glassH * 0.65;

  const keyTimes = Array.from({ length: numSteps + 1 }, (_, i) => String(i / numSteps)).join('; ');

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity={0.88} />
            <stop offset="100%" stopColor={color} stopOpacity={0.4} />
          </linearGradient>
          <linearGradient id={grad2Id} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity={0.5} />
            <stop offset="100%" stopColor={color} stopOpacity={0.12} />
          </linearGradient>
          <linearGradient id={glossId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="white" stopOpacity="0.3" />
            <stop offset="25%" stopColor="white" stopOpacity="0.06" />
            <stop offset="60%" stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="white" stopOpacity="0.08" />
          </linearGradient>
          <clipPath id="glassClip">
            <path
              d={`M ${cx - tw / 2} ${glassTop} L ${cx + tw / 2} ${glassTop} L ${cx + bw / 2} ${glassBot - 4} Q ${cx} ${glassBot + 4}, ${cx - bw / 2} ${glassBot - 4} Z`}
            />
          </clipPath>
        </defs>

        {/* === INFO CIRCLES (right side) === */}

        {/* Percentage circle */}
        <circle cx={infoX} cy={infoY1} r={infoR} fill={color} fillOpacity="0.08" stroke={color} strokeWidth="2" strokeOpacity="0.6" />
        <text
          x={infoX} y={infoY1}
          textAnchor="middle" dominantBaseline="central"
          fill={color}
          fontSize="17" fontWeight="bold" fontFamily="system-ui"
        >
          {Math.round(percentage * 100)}%
        </text>

        {/* Capacity circle */}
        <circle cx={infoX} cy={infoY2} r={infoR} fill={color} fillOpacity="0.08" stroke={color} strokeWidth="2" strokeOpacity="0.6" />
        <text
          x={infoX} y={infoY2 - 6}
          textAnchor="middle" dominantBaseline="central"
          fill={color}
          fontSize="14" fontWeight="600" fontFamily="system-ui"
        >
          {current}
        </text>
        <text
          x={infoX} y={infoY2 + 12}
          textAnchor="middle" dominantBaseline="central"
          fill="#9ca3af"
          fontSize="9" fontFamily="system-ui"
        >
          / {target} ml
        </text>

        {/* === GLASS SHELL === */}

        {/* Outer outline */}
        <path
          d={`M ${cx - tw / 2} ${glassTop} L ${cx + tw / 2} ${glassTop} L ${cx + bw / 2} ${glassBot - 4} Q ${cx} ${glassBot + 4}, ${cx - bw / 2} ${glassBot - 4} Z`}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeOpacity="0.35"
        />

        {/* Inner highlight (glass thickness) */}
        <path
          d={`M ${cx - tw / 2 + 3} ${glassTop + 3} L ${cx + tw / 2 - 3} ${glassTop + 3} L ${cx + bw / 2 - 3} ${glassBot - 6} Q ${cx} ${glassBot + 1}, ${cx - bw / 2 + 3} ${glassBot - 6} Z`}
          fill="none"
          stroke="white"
          strokeWidth="1"
          strokeOpacity="0.12"
        />

        {/* Top rim */}
        <ellipse cx={cx} cy={glassTop} rx={tw / 2} ry="3" fill="none" stroke={color} strokeWidth="2" strokeOpacity="0.3" />
        <ellipse cx={cx} cy={glassTop} rx={tw / 2 - 2} ry="2" fill="none" stroke="white" strokeWidth="0.8" strokeOpacity="0.18" />

        {/* Bottom thickness */}
        <path
          d={`M ${cx - bw / 2} ${glassBot - 4} Q ${cx} ${glassBot + 4}, ${cx + bw / 2} ${glassBot - 4} L ${cx + bw / 2 - 4} ${glassBot - 1} Q ${cx} ${glassBot + 7}, ${cx - bw / 2 + 4} ${glassBot - 1} Z`}
          fill={color}
          fillOpacity="0.18"
        />

        {/* Bottom thickness highlight */}
        <path
          d={`M ${cx - bw / 2 + 4} ${glassBot - 3} Q ${cx} ${glassBot + 5}, ${cx + bw / 2 - 4} ${glassBot - 3} L ${cx + bw / 2 - 6} ${glassBot - 2} Q ${cx} ${glassBot + 6}, ${cx - bw / 2 + 6} ${glassBot - 2} Z`}
          fill="white"
          fillOpacity="0.06"
        />

        {/* === WATER === */}
        {percentage > 0 && (
          <g clipPath="url(#glassClip)">
            {/* Deep zone at bottom */}
            <rect x={cx - tw / 2 - 2} y={glassBot - 14} width={tw + 4} height="14" fill={color} opacity="0.1" />

            {/* Back wave (lighter, slower) */}
            <path d={backPhases[0]} fill={`url(#${grad2Id})`}>
              <animate
                attributeName="d"
                values={backPhases.join('; ')}
                keyTimes={keyTimes}
                dur="4s"
                repeatCount="indefinite"
              />
            </path>

            {/* Front wave (main color, faster) */}
            <path d={frontPhases[0]} fill={`url(#${gradId})`}>
              <animate
                attributeName="d"
                values={frontPhases.join('; ')}
                keyTimes={keyTimes}
                dur="2.5s"
                repeatCount="indefinite"
              />
            </path>

            {/* Surface crest highlight */}
            <path d={crestPhases[0]} fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.22">
              <animate
                attributeName="d"
                values={crestPhases.join('; ')}
                keyTimes={keyTimes}
                dur="2.5s"
                repeatCount="indefinite"
              />
            </path>

            {/* Bubbles */}
            <circle cx={cx - 8} cy={glassBot - 20} r="2" fill="white" opacity="0.22">
              <animate attributeName="cy" values={`${glassBot - 20}; ${waterTopY + 10}`} dur="4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.22; 0" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle cx={cx + 12} cy={glassBot - 28} r="1.5" fill="white" opacity="0.16">
              <animate attributeName="cy" values={`${glassBot - 28}; ${waterTopY + 10}`} dur="5s" begin="1.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.16; 0" dur="5s" begin="1.2s" repeatCount="indefinite" />
            </circle>
            <circle cx={cx - 16} cy={glassBot - 42} r="1.2" fill="white" opacity="0.12">
              <animate attributeName="cy" values={`${glassBot - 42}; ${waterTopY + 10}`} dur="6s" begin="0.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.12; 0" dur="6s" begin="0.5s" repeatCount="indefinite" />
            </circle>
            <circle cx={cx + 6} cy={glassBot - 52} r="1.8" fill="white" opacity="0.14">
              <animate attributeName="cy" values={`${glassBot - 52}; ${waterTopY + 10}`} dur="4.5s" begin="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.14; 0" dur="4.5s" begin="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx={cx - 4} cy={glassBot - 60} r="1" fill="white" opacity="0.18">
              <animate attributeName="cy" values={`${glassBot - 60}; ${waterTopY + 10}`} dur="5.5s" begin="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.18; 0" dur="5.5s" begin="3s" repeatCount="indefinite" />
            </circle>
          </g>
        )}

        {/* === REFLECTIONS (on top of everything) === */}

        {/* Full glossy overlay */}
        <path
          d={`M ${cx - tw / 2} ${glassTop} L ${cx + tw / 2} ${glassTop} L ${cx + bw / 2} ${glassBot - 4} Q ${cx} ${glassBot + 4}, ${cx - bw / 2} ${glassBot - 4} Z`}
          fill={`url(#${glossId})`}
        />

        {/* Left-edge reflection stripe */}
        <path
          d={`M ${cx - tw / 2 + 4} ${glassTop + 6} L ${cx - tw / 2 + 7} ${glassTop + 6} L ${cx - bw / 2 + 6} ${glassBot - 10} L ${cx - bw / 2 + 3} ${glassBot - 10} Z`}
          fill="white"
          opacity="0.18"
        />

        {/* Short upper reflection */}
        <path
          d={`M ${cx - tw / 2 + 5} ${glassTop + 14} L ${cx - tw / 2 + 10} ${glassTop + 14} L ${cx - bw / 2 + 8} ${glassTop + glassH * 0.35} L ${cx - bw / 2 + 4} ${glassTop + glassH * 0.35} Z`}
          fill="white"
          opacity="0.08"
        />

        {/* Diagonal glare */}
        <polygon
          points={`${cx - tw / 2 + 22},${glassTop + 18} ${cx - tw / 2 + 38},${glassTop + 8} ${cx - tw / 2 + 52},${glassTop + 42} ${cx - tw / 2 + 36},${glassTop + 52}`}
          fill="white"
          opacity="0.07"
        />

        {/* Right subtle edge */}
        <path
          d={`M ${cx + tw / 2 - 7} ${glassTop + 22} L ${cx + tw / 2 - 4} ${glassTop + 22} L ${cx + bw / 2 - 5} ${glassBot - 14} L ${cx + bw / 2 - 8} ${glassBot - 14} Z`}
          fill="white"
          opacity="0.04"
        />
      </svg>
    </div>
  );
}
