// Real-GPU smoke check for the production black-hole shader.
// Serve the repo and open checks/black-hole-render-check.html. Throws on failure.
import { vertexShader, fragmentShader } from '../black-hole-shader.js';

// Square and pinned: the moved-pixel floor below counts pixels, so shrinking this
// to the widget's own size would shrink the margin with it. The disk-emission
// floor scales with band area instead and holds at any size.
const SIZE = 512;

const canvas = document.getElementById('stage');
canvas.width = SIZE;
canvas.height = SIZE;
const gl = canvas.getContext('webgl2', { alpha: true, antialias: false, preserveDrawingBuffer: true });
if (!gl) throw new Error('WebGL2 is unavailable in this browser');

function compile(type, source, label) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(`${label} shader failed to compile:\n${gl.getShaderInfoLog(shader)}`);
  }
  return shader;
}

const program = gl.createProgram();
gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexShader, 'vertex'));
gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentShader, 'fragment'));
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  throw new Error(`shader program failed to link:\n${gl.getProgramInfoLog(program)}`);
}

const uResolution = gl.getUniformLocation(program, 'uResolution');
const uTime = gl.getUniformLocation(program, 'uTime');
const uOrbit = gl.getUniformLocation(program, 'uOrbit');

function draw(time, yaw, pitch) {
  gl.viewport(0, 0, SIZE, SIZE);
  gl.useProgram(program);
  gl.uniform2f(uResolution, SIZE, SIZE);
  gl.uniform1f(uTime, time);
  gl.uniform2f(uOrbit, yaw, pitch);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  const pixels = new Uint8Array(SIZE * SIZE * 4);
  gl.readPixels(0, 0, SIZE, SIZE, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  return pixels; // rows bottom-up; every region below is vertically symmetric
}

function luma(pixels, at) {
  return 0.2126 * pixels[at] + 0.7152 * pixels[at + 1] + 0.0722 * pixels[at + 2];
}

// Radii are in the shader's own units: it builds uv by dividing both components
// by uResolution.y, so one unit is the half-height on either axis. The shadow
// edge sits at 0.33 and the outer disk reaches 1.02, touching the middle of each
// edge, so only the corners past 1.2 are white by construction. The shader's
// white-edge term measures uv.x/aspect, which equals this radius only on a square
// canvas — another reason SIZE stays square.
function measure(pixels) {
  let coreLuma = 0;
  let coreCount = 0;
  let bandWarm = 0;
  let bandArea = 0;
  let bandPeak = 0;
  let dimmestCorner = 255;
  let coldPixels = 0;
  let minAlpha = 255;
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      const at = (y * SIZE + x) * 4;
      const radius = Math.hypot((2 * x - SIZE) / SIZE, (2 * y - SIZE) / SIZE);
      const value = luma(pixels, at);
      if (pixels[at + 3] < minAlpha) minAlpha = pixels[at + 3];
      if (radius < 0.12) {
        coreLuma += value;
        coreCount += 1;
      } else if (radius > 0.4 && radius < 0.84) {
        bandArea += 1;
        if (value > bandPeak) bandPeak = value;
        if (value > 110 && pixels[at] - pixels[at + 2] >= 10) bandWarm += 1;
      }
      if (radius > 1.2 && value < dimmestCorner) dimmestCorner = value;
      // The palette holds no blue or magenta, so anything with real hue must run
      // red >= green >= blue. Gate on chroma, not brightness: the near-neutral
      // aura and shadow interior are deliberately a hair cool and have no hue
      // to test.
      const chroma = Math.max(pixels[at], pixels[at + 1], pixels[at + 2])
        - Math.min(pixels[at], pixels[at + 1], pixels[at + 2]);
      if (chroma > 6 && (pixels[at + 1] > pixels[at] || pixels[at + 2] > pixels[at + 1])) {
        coldPixels += 1;
      }
    }
  }
  return {
    core: coreLuma / coreCount,
    bandWarm,
    bandFloor: bandArea / 100,
    bandPeak,
    dimmestCorner,
    coldPixels,
    minAlpha,
  };
}

// Absolute count of visibly moved pixels: the exterior is white and the flow is
// slow, so a share of the whole frame would reject valid subtle motion.
function movedPixels(first, second) {
  let moved = 0;
  for (let at = 0; at < first.length; at += 4) {
    if (Math.abs(luma(first, at) - luma(second, at)) > 2) moved += 1;
  }
  return moved;
}

function sameBytes(first, second) {
  for (let at = 0; at < first.length; at += 1) {
    if (first[at] !== second[at]) return false;
  }
  return true;
}

const base = draw(0, 0, 0);
const repeat = draw(0, 0, 0);
const later = draw(2.7, 0, 0);
const orbited = draw(0, 0.3, 0.15);
const seen = measure(base);
const overTime = movedPixels(base, later);
const overOrbit = movedPixels(base, orbited);
draw(0, 0, 0); // leave the canvas on the default view for pixel inspection

const results = [
  ['shadow core is dark', seen.core < 60, `core mean luma ${seen.core.toFixed(1)}`],
  ['disk emits warm light', seen.bandWarm > seen.bandFloor, `${seen.bandWarm} bright warm pixels in the disk band, floor ${seen.bandFloor}`],
  ['disk is brighter than the shadow', seen.bandPeak - seen.core > 60, `disk peak luma ${seen.bandPeak.toFixed(1)} vs core ${seen.core.toFixed(1)}`],
  ['canvas corners are page white', seen.dimmestCorner >= 250, `dimmest corner pixel luma ${seen.dimmestCorner.toFixed(1)}`],
  ['coloured pixels stay warm', seen.coldPixels === 0, `${seen.coldPixels} chromatic pixels run green or blue above red`],
  ['output is fully opaque', seen.minAlpha === 255, `lowest alpha ${seen.minAlpha}`],
  ['same uniforms render the same image', sameBytes(base, repeat), 'two draws at uTime 0, uOrbit 0'],
  ['time advances the flow', overTime > 400, `${overTime} pixels moved by uTime 2.7`],
  ['orbit changes the view', overOrbit > 400, `${overOrbit} pixels moved at uOrbit 0.3, 0.15`],
];

const failed = results.filter(([, pass]) => !pass);
const summary = failed.length === 0
  ? `PASS: all ${results.length} shader checks hold`
  : `FAIL: ${failed.length} of ${results.length} shader checks broke`;
const text = `${results.map(([name, pass, detail]) => `${pass ? 'PASS' : 'FAIL'}  ${name} — ${detail}`).join('\n')}\n\n${summary}`;
console.log(text);
document.getElementById('results').textContent = text;
if (failed.length > 0) throw new Error(`${summary}\n${failed.map(([name, , detail]) => `${name} — ${detail}`).join('\n')}`);
