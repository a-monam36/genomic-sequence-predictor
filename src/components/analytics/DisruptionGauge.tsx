import React from 'react';

interface DisruptionGaugeProps {
  llr: number;
  verdict: 'pathogenic' | 'vus' | 'tolerated';
  verdictColor: string;
}

export const DisruptionGauge: React.FC<DisruptionGaugeProps> = ({ llr, verdict, verdictColor }) => {
  // Clamp LLR between -6.0 and +1.5 for the visual gauge
  const minScore = -6.0;
  const maxScore = 1.5;
  const clamped = Math.max(minScore, Math.min(maxScore, llr));
  const normalized = (clamped - minScore) / (maxScore - minScore); // 0 to 1

  // Arc angles: 180 degrees (from PI to 0)
  const angle = 180 * (1 - normalized); // 180 = left (pathogenic), 0 = right (benign)

  // Needle tip coordinates
  const radius = 68;
  const centerX = 100;
  const centerY = 90;
  const rad = (angle * Math.PI) / 180;
  const needleX = centerX - Math.cos(rad) * radius;
  const needleY = centerY - Math.sin(rad) * radius;

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-slate-950/70 border border-slate-800 rounded-2xl relative">
      <div className="w-full text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
        Disruption Severity Meter
      </div>

      <div className="relative w-52 h-28 flex items-center justify-center">
        <svg viewBox="0 0 200 115" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" /> {/* Pathogenic (Coral) */}
              <stop offset="45%" stopColor="#f59e0b" /> {/* VUS (Amber) */}
              <stop offset="100%" stopColor="#10b981" /> {/* Tolerated (Emerald) */}
            </linearGradient>
            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Arc Track */}
          <path
            d="M 25 90 A 75 75 0 0 1 175 90"
            fill="none"
            stroke="#1e293b"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Colored Gradient Arc */}
          <path
            d="M 25 90 A 75 75 0 0 1 175 90"
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="12"
            strokeLinecap="round"
            filter="url(#glowFilter)"
            opacity="0.85"
          />

          {/* Zone Division Markers */}
          {/* -3.0 boundary: normalized is (-3 - (-6)) / 7.5 = 3 / 7.5 = 0.40 */}
          {/* -1.5 boundary: normalized is (-1.5 - (-6)) / 7.5 = 4.5 / 7.5 = 0.60 */}
          
          {/* Animated Needle */}
          <line
            x1={centerX}
            y1={centerY}
            x2={needleX}
            y2={needleY}
            stroke={verdictColor}
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#glowFilter)"
            className="transition-all duration-700 ease-out"
          />

          {/* Needle Hub Pivot */}
          <circle cx={centerX} cy={centerY} r="6" fill="#0f172a" stroke={verdictColor} strokeWidth="2.5" />
          <circle cx={centerX} cy={centerY} r="2.5" fill={verdictColor} />
        </svg>

        {/* Readout Overlay in Center */}
        <div className="absolute bottom-0 flex flex-col items-center">
          <div className="text-xl font-black font-mono-seq" style={{ color: verdictColor }}>
            {llr > 0 ? `+${llr.toFixed(2)}` : llr.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400 font-mono-seq">LLR Score</div>
        </div>
      </div>

      {/* Threshold Labels Below Gauge */}
      <div className="w-full flex justify-between px-2 text-[10px] text-slate-400 font-mono-seq mt-1">
        <span className="text-rose-400">&lt; -3.0 Pathogenic</span>
        <span className="text-amber-400">-3.0 to -1.5 VUS</span>
        <span className="text-emerald-400">&ge; -1.5 Benign</span>
      </div>
    </div>
  );
};

