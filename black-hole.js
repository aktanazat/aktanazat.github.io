// WebGL2 host for the black hole illustration: one full-screen triangle, no
// buffers, no attributes, no dependencies. assets/black-hole.webp sits under the
// canvas and shows through whenever this module, WebGL2, or the shader program
// is unavailable, so the artwork never disappears.
import { fragmentShader, vertexShader } from './black-hole-shader.js';

const stage = document.getElementById('blackHole');
const canvas = document.getElementById('blackHoleCanvas');
const toggle = document.getElementById('blackHoleToggle');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const MAX_EDGE = 512; // drawing-buffer cap in pixels; the disk needs no more
const FRAME_MS = 1000 / 30; // slow flow, so 30fps instead of a 120Hz burn
const STALL_S = 0.05; // largest time step a single frame may advance
const YAW_LIMIT = 0.7; // shader tolerates 1.2; a modest sweep reads better
const PITCH_LIMIT = 0.42; // shader re-clamps inclination on its own
const KEY_STEP = 0.06;
const DRAG_YAW = 0.006;
const DRAG_PITCH = 0.005;

const gl = canvas.getContext('webgl2', {
  alpha: false,
  antialias: false,
  depth: false,
  stencil: false,
  powerPreference: 'low-power',
});

// Animation state. sync() is its only owner; every event routes through it.
let program = null;
let resolutionLocation = null;
let timeLocation = null;
let orbitLocation = null;
let frame = 0;
let seconds = 0;
let lastStamp = 0;
let lastDraw = 0;
let paused = false;
let onScreen = true;
let yaw = 0;
let pitch = 0;
let pointer = -1;
let pointerX = 0;
let pointerY = 0;

const clamp = (value, limit) => (value < -limit ? -limit : value > limit ? limit : value);

function compile(type, source, label) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  console.warn(`black hole: ${label} shader did not compile\n${gl.getShaderInfoLog(shader)}`);
  gl.deleteShader(shader);
  return null;
}

function build() {
  const vertex = compile(gl.VERTEX_SHADER, vertexShader, 'vertex');
  const fragment = compile(gl.FRAGMENT_SHADER, fragmentShader, 'fragment');
  let linked = null;

  if (vertex && fragment) {
    linked = gl.createProgram();
    gl.attachShader(linked, vertex);
    gl.attachShader(linked, fragment);
    gl.linkProgram(linked);
    if (!gl.getProgramParameter(linked, gl.LINK_STATUS)) {
      console.warn(`black hole: program did not link\n${gl.getProgramInfoLog(linked)}`);
      gl.deleteProgram(linked);
      linked = null;
    }
  }

  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!linked) return false;

  program = linked;
  gl.useProgram(program);
  resolutionLocation = gl.getUniformLocation(program, 'uResolution');
  timeLocation = gl.getUniformLocation(program, 'uTime');
  orbitLocation = gl.getUniformLocation(program, 'uOrbit');
  return true;
}

// Sizes arrive from the ResizeObserver entry, so nothing here reads layout.
function resize(cssWidth, cssHeight) {
  const longest = Math.max(cssWidth, cssHeight, 1);
  const scale = Math.min(window.devicePixelRatio || 1, 2, MAX_EDGE / longest);
  const width = Math.max(1, Math.round(cssWidth * scale));
  const height = Math.max(1, Math.round(cssHeight * scale));
  if (width === canvas.width && height === canvas.height) return;
  canvas.width = width;
  canvas.height = height;
  gl.viewport(0, 0, width, height);
  gl.uniform2f(resolutionLocation, width, height);
}

function draw() {
  gl.uniform1f(timeLocation, seconds);
  gl.uniform2f(orbitLocation, yaw, pitch);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

function tick(stamp) {
  frame = requestAnimationFrame(tick);
  const resumed = lastStamp === 0;
  if (!resumed) seconds += Math.min((stamp - lastStamp) / 1000, STALL_S);
  lastStamp = stamp;
  if (!resumed && stamp - lastDraw < FRAME_MS - 1) return;
  lastDraw = stamp;
  draw();
}

function sync() {
  if (program && !paused && !document.hidden && onScreen && !reducedMotion.matches) {
    if (!frame) {
      lastStamp = 0;
      lastDraw = 0;
      frame = requestAnimationFrame(tick);
    }
    return;
  }
  if (frame) {
    cancelAnimationFrame(frame);
    frame = 0;
  }
  if (program) draw(); // still frame: paused, reduced motion, resize, orbit nudge
}

function expose() {
  if (program) {
    stage.dataset.live = 'on';
    canvas.tabIndex = 0;
  } else {
    delete stage.dataset.live;
    canvas.removeAttribute('tabindex');
  }
  toggle.hidden = !program || reducedMotion.matches;
  toggle.textContent = paused ? 'Resume' : 'Pause';
}

function release(event) {
  if (event.pointerId === pointer) pointer = -1;
}

function onLost(event) {
  event.preventDefault(); // required, or the context can never come back
  program = null;
  expose();
  sync();
}

function onRestored() {
  if (!build()) return; // build() logged why; the poster stays
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
  expose();
  sync();
}

function init() {
  if (!gl) {
    console.warn('black hole: no WebGL2 context, keeping the poster image');
    return;
  }

  canvas.addEventListener('webglcontextlost', onLost);
  canvas.addEventListener('webglcontextrestored', onRestored);

  canvas.addEventListener('pointerdown', (event) => {
    if (pointer !== -1 || !program) return;
    pointer = event.pointerId;
    pointerX = event.clientX;
    pointerY = event.clientY;
    canvas.setPointerCapture(pointer);
  });
  canvas.addEventListener('pointermove', (event) => {
    if (event.pointerId !== pointer) return;
    yaw = clamp(yaw + (event.clientX - pointerX) * DRAG_YAW, YAW_LIMIT);
    pitch = clamp(pitch + (event.clientY - pointerY) * DRAG_PITCH, PITCH_LIMIT);
    pointerX = event.clientX;
    pointerY = event.clientY;
    sync();
  });
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('lostpointercapture', release);

  canvas.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || !program) return;
    let step = 0;
    if (event.key === 'ArrowLeft') step = -1;
    else if (event.key === 'ArrowRight') step = 1;
    if (step) {
      yaw = clamp(yaw + step * KEY_STEP, YAW_LIMIT);
    } else {
      if (event.key === 'ArrowUp') step = -1;
      else if (event.key === 'ArrowDown') step = 1;
      else return;
      pitch = clamp(pitch + step * KEY_STEP, PITCH_LIMIT);
    }
    event.preventDefault();
    sync();
  });

  toggle.addEventListener('click', () => {
    paused = !paused;
    expose();
    sync();
  });

  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener('change', () => {
    expose();
    sync();
  });

  new ResizeObserver((entries) => {
    const box = entries[entries.length - 1].contentRect;
    resize(box.width, box.height);
    expose();
    sync();
  }).observe(canvas);

  new IntersectionObserver((entries) => {
    onScreen = entries[entries.length - 1].isIntersecting;
    sync();
  }).observe(canvas);

  // The first ResizeObserver callback is what gives the canvas its real pixel
  // size, so the artwork goes live there rather than at a stale 300x150.
  build();
}

init();
