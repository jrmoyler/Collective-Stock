import * as THREE from 'three';
import { optimizedPath } from '../components/media-card.js';
import { relativeSlot } from './art-selection.js';

// Canvas is a progressive enhancement. The DOM artwork and controls survive
// unsupported WebGL, texture errors, reduced motion and GPU context loss.
export async function createArtScene(host, assets, { selected = 0, onFailure }) {
  const canvas = document.createElement('canvas');
  canvas.className = 'art-gallery__canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const context = canvas.getContext('webgl2', { alpha: true, antialias: true, powerPreference: 'low-power' });
  if (!context) return null;
  const renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x050a18, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 60);
  camera.position.set(0, .1, 9.5);
  scene.add(new THREE.AmbientLight(0xffffff, 2));
  const light = new THREE.DirectionalLight(0xffe0a0, 4);
  light.position.set(-3, 6, 8); scene.add(light);
  const group = new THREE.Group(); scene.add(group);
  let disposed = false, visible = true, raf = 0, destination = selected, pointer = [0, 0];
  const resources = [];
  const own = r => { resources.push(r); return r; };
  const loader = new THREE.TextureLoader();
  const panels = [];
  const cancel = () => { cancelAnimationFrame(raf); raf = 0; };
  const dispose = () => {
    if (disposed) return;
    disposed = true; cancel(); resize.disconnect();
    canvas.removeEventListener('webglcontextlost', lost);
    resources.forEach(r => r.dispose()); renderer.dispose(); canvas.remove(); host.classList.remove('has-webgl');
  };
  const lost = event => { event.preventDefault(); onFailure?.(); dispose(); };
  canvas.addEventListener('webglcontextlost', lost);
  function target(i) {
    const slot = relativeSlot(i, destination, assets.length), distance = Math.abs(slot);
    return { x: slot * 1.85, y: -.08 * distance, z: -distance * 1.5, rotation: -slot * .22, scale: distance ? .9 : 1 };
  }
  function draw() {
    raf = 0;
    if (disposed || !visible) return;
    let moving = false;
    panels.forEach((panel, i) => {
      const t = target(i);
      panel.visible = Math.abs(relativeSlot(i, destination, assets.length)) <= 1;
      for (const key of ['x', 'y', 'z']) {
        panel.position[key] += (t[key] - panel.position[key]) * .12;
        if (Math.abs(t[key] - panel.position[key]) > .001) moving = true;
      }
      panel.rotation.y += (t.rotation - panel.rotation.y) * .12;
      panel.scale.lerp(new THREE.Vector3(t.scale, t.scale, t.scale), .12);
      if (Math.abs(t.rotation - panel.rotation.y) > .001) moving = true;
    });
    const ry = pointer[0] * .1, rx = pointer[1] * .04;
    group.rotation.y += (ry - group.rotation.y) * .09;
    group.rotation.x += (rx - group.rotation.x) * .09;
    if (Math.abs(ry - group.rotation.y) + Math.abs(rx - group.rotation.x) > .0002) moving = true;
    renderer.render(scene, camera);
    if (moving) raf = requestAnimationFrame(draw);
  }
  const request = () => { if (!disposed && visible && !raf) raf = requestAnimationFrame(draw); };
  const resize = new ResizeObserver(() => {
    if (disposed) return;
    const width = host.clientWidth, height = host.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false); camera.aspect = width / height;
    camera.position.z = camera.aspect < 1.2 ? 8.2 : 7.2;
    camera.updateProjectionMatrix(); request();
  });
  try {
    const textures = await Promise.all(assets.map(a => loader.loadAsync(optimizedPath(a)).then(texture => {
      if (disposed) { texture.dispose(); throw new Error('Gallery disposed'); }
      return own(texture);
    })));
    if (disposed) return null;
    textures.forEach((texture, i) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
      // Crop only in this editorial display; full previews retain original ratio.
      const ratio = texture.image.width / texture.image.height, frameRatio = 2.9 / 4.1;
      if (ratio > frameRatio) { texture.repeat.x = frameRatio / ratio; texture.offset.x = (1 - texture.repeat.x) / 2; }
      else { texture.repeat.y = ratio / frameRatio; texture.offset.y = (1 - texture.repeat.y) / 2; }
      const panel = new THREE.Group();
      const frame = new THREE.Mesh(own(new THREE.BoxGeometry(3.02, 4.22, .095)), own(new THREE.MeshStandardMaterial({ color: 0x867349, metalness: .7, roughness: .38 })));
      const mat = own(new THREE.MeshBasicMaterial({ map: texture }));
      const art = new THREE.Mesh(own(new THREE.PlaneGeometry(2.9, 4.1)), mat); art.position.z = .055;
      panel.add(frame, art); group.add(panel); panels.push(panel);
      const t = target(i); panel.position.set(t.x, t.y, t.z); panel.rotation.y = t.rotation; panel.scale.setScalar(t.scale);
    });
    host.append(canvas); resize.observe(host); host.classList.add('has-webgl'); request();
  } catch { dispose(); onFailure?.(); return null; }
  return {
    select(value) { destination = value; request(); },
    point(x, y) { pointer = [x, y]; request(); },
    setVisible(value) { visible = value; if (value) request(); else cancel(); },
    dispose
  };
}
