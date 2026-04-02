/**
 * Minimal type declaration for react-native-svg.
 * The actual runtime is provided by __mocks__/react-native-svg.ts in Jest.
 */
declare module 'react-native-svg' {
  import React from 'react';

  interface SvgProps {
    width?: number | string;
    height?: number | string;
    viewBox?: string;
    fill?: string;
    stroke?: string;
    [key: string]: any;
  }

  interface CommonProps {
    cx?: number | string;
    cy?: number | string;
    r?: number | string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number | string;
    opacity?: number;
    [key: string]: any;
  }

  const Svg: React.FC<SvgProps>;
  const Circle: React.FC<CommonProps>;
  const G: React.FC<{ [key: string]: any }>;
  const Path: React.FC<{ [key: string]: any }>;
  const Text: React.FC<{ [key: string]: any }>;

  export { Circle, G, Path, Text };
  export default Svg;
}
