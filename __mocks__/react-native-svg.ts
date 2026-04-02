import React from 'react';

// Minimal mock for react-native-svg — returns plain React elements so tests
// that import RechargeArc.tsx or other SVG components don't crash.
const Svg = (props: any) => React.createElement('svg', props);
const Circle = (props: any) => React.createElement('circle', props);
const G = (props: any) => React.createElement('g', props);
const Path = (props: any) => React.createElement('path', props);
const SvgText = (props: any) => React.createElement('text', props);

export default Svg;
export { Circle, G, Path };
export { SvgText as Text };
