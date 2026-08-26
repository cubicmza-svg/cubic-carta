const FLOATERS = [
  { emoji: '🚀', top: '8%',  left: '4%',  size: 48, dur: 8,  delay: 0   },
  { emoji: '🪐', top: '12%', left: '87%', size: 56, dur: 12, delay: 2   },
  { emoji: '⭐', top: '38%', left: '2%',  size: 32, dur: 6,  delay: 1   },
  { emoji: '🌙', top: '58%', left: '91%', size: 40, dur: 10, delay: 3   },
  { emoji: '👨‍🚀', top: '72%', left: '5%',  size: 52, dur: 14, delay: 1.5 },
  { emoji: '✨', top: '22%', left: '48%', size: 28, dur: 5,  delay: 0.5 },
  { emoji: '🌟', top: '48%', left: '79%', size: 36, dur: 7,  delay: 2.5 },
  { emoji: '🛸', top: '82%', left: '58%', size: 44, dur: 11, delay: 0.8 },
  { emoji: '💫', top: '30%', left: '94%', size: 28, dur: 6,  delay: 3.5 },
];

export default function BBSpaceBackground() {
  return (
    <>
      <style>{`
        @keyframes bb-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%       { transform: translateY(-12px) rotate(4deg); }
          66%       { transform: translateY(6px) rotate(-3deg); }
        }
      `}</style>
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {FLOATERS.map((f, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: f.top,
            left: f.left,
            fontSize: f.size,
            opacity: 0.22,
            animation: `bb-float ${f.dur}s ease-in-out ${f.delay}s infinite`,
          }}>
            {f.emoji}
          </div>
        ))}
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: 400, height: 400, borderRadius: '50%', opacity: 0.04,
          background: 'radial-gradient(circle, #f97316, transparent)',
          filter: 'blur(80px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', left: 0,
          width: 350, height: 350, borderRadius: '50%', opacity: 0.04,
          background: 'radial-gradient(circle, #3b82f6, transparent)',
          filter: 'blur(80px)',
        }} />
      </div>
    </>
  );
}
