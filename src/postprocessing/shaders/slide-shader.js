/* eslint-disable indent */
/**
 * @author aeroheim / http://aeroheim.moe/
 */

const SlideDirection = Object.freeze({
  LEFT: 0,
  RIGHT: 1,
  TOP: 2,
  BOTTOM: 3,
});

const SlideShader = {
  uniforms: {
    tDiffuse1: { value: null },
    tDiffuse2: { value: null },
    // the number of slides to perform
    slides: { value: 1.0 },
    // a value from 0 to 1 indicating the slide ratio
    amount: { value: 0.0 },
    // the amount value of the previous frame - used to calculate the velocity for the blur
    prevAmount: { value: 0.0 },
    // an value from 0 to 1 indicating the size of the blend gradient
    gradient: { value: 0.0 },
    // a positive value that affects the intensity of the slide blur
    intensity: { value: 1.0 },
    // the direction to slide to
    direction: { value: SlideDirection.RIGHT },
  },

  vertexShader: [

    'varying vec2 vUv;',

    'void main() {',
    ' vUv = uv;',
    ' gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
    '}',

  ].join('\n'),

  fragmentShader: [

    'uniform sampler2D tDiffuse1;',
    'uniform sampler2D tDiffuse2;',
    'uniform int slides;',
    'uniform float amount;',
    'uniform float prevAmount;',
    'uniform float intensity;',
    'uniform int direction;',
    'varying vec2 vUv;',

    'float getComponentForDirection(int direction, vec2 uv) {',
    ' return direction < 2 ? uv.x : uv.y;',
    '}',

    'vec2 getVectorForDirection(int direction, vec2 uv, float position) {',
    ' return direction < 2 ? vec2(position, uv.y) : vec2(uv.x, position);',
    '}',

    'float getOffsetPosition(int direction, float uv, float offset) {',
    ' return direction == 1 || direction == 3',
    '   ? mod(uv + offset, 1.0)',
    '   : mod(uv + (1.0 - offset), 1.0);',
    '}',

    'void main() {',
    ' vec4 texel;',
    ' float offset = amount * float(slides);',
    ' float position = getComponentForDirection(direction, vUv);',

    ' bool isFirstSlide = direction == 1 || direction == 3',
    '   ? position + offset <= 1.0',
    '   : position - offset >= 0.0;',

    ' if (isFirstSlide) {',
    '   texel = texture2D(tDiffuse1, getVectorForDirection(direction, vUv, getOffsetPosition(direction, position, offset)));',
    ' } else {',
    '   texel = texture2D(tDiffuse2, getVectorForDirection(direction, vUv, getOffsetPosition(direction, position, offset)));',
    ' }',

    ' float velocity = (amount - prevAmount) * intensity;',
    ' const int numSamples = 100;',
    ' for (int i = 1; i < numSamples; ++i) {',
    '   float blurOffset = velocity * (float(i) / float(numSamples - 1) - 0.5);',
    '   bool isFirstSlide = direction == 1 || direction == 3',
    '     ? position + offset + blurOffset <= 1.0',
    '     : position - offset - blurOffset >= 0.0;',
    '   if (isFirstSlide) {',
    '     texel += texture2D(tDiffuse1, getVectorForDirection(direction, vUv, getOffsetPosition(direction, position, offset + blurOffset)));',
    '   } else {',
    '     texel += texture2D(tDiffuse2, getVectorForDirection(direction, vUv, getOffsetPosition(direction, position, offset + blurOffset)));',
    '   }',
    ' }',

    ' gl_FragColor = texel / max(1.0, float(numSamples));',
    '}',

  ].join('\n'),
};

export {
  SlideShader,
  SlideDirection,
};

export default SlideShader;
