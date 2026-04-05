import React, { useState, useEffect, useCallback } from 'react';

// ---------------------------------------------------------------------------
// AdaptiveColorProvider
//
// Provides a time-based white-point color that shifts from cool (6 AM) to
// warm (10 PM) to support circadian rhythm optimization.
//
// Cool anchor:  #F8FAFF  (rgb 248, 250, 255) — 6 AM
// Warm anchor:  #FFF5E6  (rgb 255, 245, 230) — 10 PM (22:00)
// Linear interpolation over hours 6–22 (t = clamp((hour - 6) / 16, 0, 1))
// Updates every 60 seconds.
// ---------------------------------------------------------------------------

const COOL_RGB = { r: 248, g: 250, b: 255 } as const;
const WARM_RGB = { r: 255, g: 245, b: 230 } as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function toHex(value: number): string {
  return Math.round(value).toString(16).padStart(2, '0');
}

function computeAdaptiveColor(hour: number): string {
  const t = clamp((hour - 6) / 16, 0, 1);
  const r = COOL_RGB.r + t * (WARM_RGB.r - COOL_RGB.r);
  const g = COOL_RGB.g + t * (WARM_RGB.g - COOL_RGB.g);
  const b = COOL_RGB.b + t * (WARM_RGB.b - COOL_RGB.b);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const AdaptiveColorContext = React.createContext<string>('#FFFFFF');

export function useAdaptiveColor(): string {
  return React.useContext(AdaptiveColorContext);
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function AdaptiveColorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const getColor = useCallback(() => {
    const now = new Date();
    const hour = now.getHours() + now.getMinutes() / 60;
    return computeAdaptiveColor(hour);
  }, []);

  const [color, setColor] = useState<string>(getColor);

  useEffect(() => {
    const interval = setInterval(() => {
      setColor(getColor());
    }, 60_000);

    return () => clearInterval(interval);
  }, [getColor]);

  return (
    <AdaptiveColorContext.Provider value={color}>
      {children}
    </AdaptiveColorContext.Provider>
  );
}
