'use client';

import { useState, useEffect } from 'react';

interface BiteTitleProps {
  size?: 'large' | 'hero';
}

const C = {
  brown: '#674A40',
  orange: '#F95335',
  cream: '#FFFAF5',
};

export default function BiteTitle({ size = 'hero' }: BiteTitleProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const seq: [number, number][] = [
      [1, 300],
      [2, 1800],
    ];
    const timers = seq.map(([p, ms]) => setTimeout(() => setPhase(p), ms));
    return () => timers.forEach(clearTimeout);
  }, []);

  const fontSize = size === 'hero'
    ? 'clamp(80px, 14vw, 160px)'
    : 'clamp(64px, 10vw, 112px)';

  // All bite/crumb sizes in em so they scale with the font
  return (
    <div style={{
      position: 'relative',
      display: 'inline-block',
      opacity: phase >= 1 ? 1 : 0,
      transform: phase >= 1 ? 'scale(1)' : 'scale(0.9)',
      transition: 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
    }}>
      <h1 style={{
        fontSize,
        fontWeight: 900,
        letterSpacing: '-0.04em',
        margin: 0,
        lineHeight: 1,
        color: C.brown,
        position: 'relative',
        userSelect: 'none',
      }}>
        munch<span style={{ color: C.orange }}>.</span>
      </h1>

      {/* bite marks — em-based so they scale with font size */}
      {phase >= 2 && (
        <div style={{
          position: 'absolute',
          top: '-0.08em',
          right: '0.95em',
          fontSize,
          animation: 'biteReveal 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        }}>
          {/* main bite */}
          <div style={{
            width: '0.35em',
            height: '0.35em',
            borderRadius: '50%',
            background: C.cream,
            position: 'absolute',
            top: 0,
            left: 0,
          }} />
          {/* secondary tooth marks */}
          <div style={{
            width: '0.2em',
            height: '0.2em',
            borderRadius: '50%',
            background: C.cream,
            position: 'absolute',
            top: '0.18em',
            left: '-0.12em',
          }} />
          <div style={{
            width: '0.17em',
            height: '0.17em',
            borderRadius: '50%',
            background: C.cream,
            position: 'absolute',
            top: '-0.07em',
            left: '0.22em',
          }} />
          <div style={{
            width: '0.13em',
            height: '0.13em',
            borderRadius: '50%',
            background: C.cream,
            position: 'absolute',
            top: '0.28em',
            left: '0.1em',
          }} />
        </div>
      )}

      {/* crumb particles — also em-based */}
      {phase >= 2 && (
        <div style={{ position: 'absolute', top: '0.05em', right: '0.8em', fontSize }}>
          {[
            { tx: '0.25em', ty: '-0.22em', size: '0.05em', delay: 0 },
            { tx: '0.38em', ty: '-0.14em', size: '0.035em', delay: 0.05 },
            { tx: '0.28em', ty: '0.1em', size: '0.04em', delay: 0.08 },
            { tx: '0.44em', ty: '-0.26em', size: '0.025em', delay: 0.03 },
            { tx: '0.34em', ty: '0.16em', size: '0.035em', delay: 0.1 },
          ].map((crumb, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: crumb.size,
              height: crumb.size,
              borderRadius: '50%',
              background: C.brown,
              animation: `crumbFly${i} 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${crumb.delay}s forwards`,
              opacity: 0,
            }} />
          ))}
        </div>
      )}

      <style>{`
        @keyframes biteReveal {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes crumbFly0 {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(30px, -28px) scale(0); opacity: 0; }
        }
        @keyframes crumbFly1 {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(48px, -18px) scale(0); opacity: 0; }
        }
        @keyframes crumbFly2 {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(36px, 14px) scale(0); opacity: 0; }
        }
        @keyframes crumbFly3 {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(55px, -32px) scale(0); opacity: 0; }
        }
        @keyframes crumbFly4 {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(42px, 22px) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
