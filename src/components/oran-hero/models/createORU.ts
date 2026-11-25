import * as THREE from 'three';
import type { OranORUHandle } from '../types';

/**
 * Procedurally constructs the Outdoor O-RU mounted on a telecom pole alongside
 * a 5G sector antenna panel, curved RF jumper cables, and animated concentric RF waves.
 */
export function createORU(position: THREE.Vector3): OranORUHandle {
  const group = new THREE.Group();
  group.name = 'node-oru';
  group.position.copy(position);

  const poleMat = new THREE.MeshStandardMaterial({
    color: 0x9aa5b4,
    roughness: 0.36,
    metalness: 0.68,
  });
  const ruAluminumMat = new THREE.MeshStandardMaterial({
    color: 0xd0d7e2,
    roughness: 0.32,
    metalness: 0.55,
  });
  const finMat = new THREE.MeshStandardMaterial({
    color: 0xb6c0ce,
    roughness: 0.38,
    metalness: 0.58,
  });
  const bracketMat = new THREE.MeshStandardMaterial({
    color: 0x526071,
    roughness: 0.45,
    metalness: 0.6,
  });
  const antennaRadomeMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.28,
    metalness: 0.12,
  });
  const cableMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.6,
    metalness: 0.15,
  });

  // Vertical galvanized telecommunications pole
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 2.55, 24), poleMat);
  pole.position.set(0.12, 0.02, -0.06);
  pole.castShadow = true;
  group.add(pole);

  // Pole clamping brackets
  [0.52, -0.28].forEach((y) => {
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.145, 0.12, 20), bracketMat);
    collar.position.set(0.12, y, -0.06);
    group.add(collar);

    const strut = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.08, 0.12), bracketMat);
    strut.position.set(0.06, y, -0.02);
    group.add(strut);
  });

  // Outdoor Radio Unit (O-RU) housing on the left side of the pole
  const ruGroup = new THREE.Group();
  ruGroup.position.set(-0.46, 0.14, 0.06);
  group.add(ruGroup);

  const ruBody = new THREE.Mesh(new THREE.BoxGeometry(0.78, 1.18, 0.44), ruAluminumMat);
  ruBody.castShadow = true;
  ruBody.receiveShadow = true;
  ruGroup.add(ruBody);

  // Machined vertical heatsink cooling fins across the front face
  for (let i = 0; i < 8; i++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.042, 1.06, 0.14), finMat);
    fin.position.set(-0.31 + i * 0.088, 0, 0.26);
    ruGroup.add(fin);
  }

  // Top carry handle
  const handleBar = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.045, 0.06), bracketMat);
  handleBar.position.set(0, 0.67, 0);
  const handlePostL = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.1, 0.06), bracketMat);
  handlePostL.position.set(-0.17, 0.62, 0);
  const handlePostR = handlePostL.clone();
  handlePostR.position.x = 0.17;
  ruGroup.add(handleBar, handlePostL, handlePostR);

  // Bottom RF/optical weatherproof gland connectors
  for (let i = 0; i < 4; i++) {
    const gland = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.14, 12), bracketMat);
    gland.position.set(-0.24 + i * 0.16, -0.65, 0.04);
    ruGroup.add(gland);
  }

  // O-RU glowing status LEDs
  const ledMat = new THREE.MeshStandardMaterial({
    color: 0x0ea5e9,
    emissive: 0x0284c7,
    emissiveIntensity: 0,
    roughness: 0.2,
  });
  const led1 = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 10), ledMat);
  led1.position.set(0.32, 0.48, 0.24);
  const led2 = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 10), ledMat);
  led2.position.set(0.32, 0.39, 0.24);
  ruGroup.add(led1, led2);

  // 5G Sector Antenna Panel on the right side of the pole
  const antenna = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.62, 0.24), antennaRadomeMat);
  antenna.position.set(0.62, 0.26, 0.04);
  antenna.castShadow = true;
  group.add(antenna);

  // Subtle radome trim line
  const antennaTrim = new THREE.Mesh(new THREE.BoxGeometry(0.44, 1.56, 0.04), finMat);
  antennaTrim.position.set(0.62, 0.26, -0.07);
  group.add(antennaTrim);

  // Curved RF jumper cables connecting O-RU bottom ports to Sector Antenna bottom
  const cableConfigs: Array<[THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3]> = [
    [
      new THREE.Vector3(-0.62, -0.52, 0.1),
      new THREE.Vector3(-0.56, -0.96, 0.18),
      new THREE.Vector3(0.32, -0.98, 0.16),
      new THREE.Vector3(0.54, -0.55, 0.06),
    ],
    [
      new THREE.Vector3(-0.46, -0.52, 0.1),
      new THREE.Vector3(-0.36, -0.88, 0.12),
      new THREE.Vector3(0.42, -0.86, 0.1),
      new THREE.Vector3(0.64, -0.55, 0.06),
    ],
    [
      new THREE.Vector3(-0.3, -0.52, 0.08),
      new THREE.Vector3(-0.18, -0.78, 0.04),
      new THREE.Vector3(0.5, -0.76, 0.02),
      new THREE.Vector3(0.72, -0.55, 0.04),
    ],
  ];
  cableConfigs.forEach((pts) => {
    const curve = new THREE.CatmullRomCurve3(pts);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 22, 0.022, 8, false), cableMat);
    group.add(tube);
  });

  // Animated concentric RF signal waves radiating outward from the sector antenna
  const rfWavesGroup = new THREE.Group();
  rfWavesGroup.position.set(0.84, 0.34, 0.08);
  group.add(rfWavesGroup);

  const rfWaves: Array<{ mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; phase: number }> = [];
  for (let i = 0; i < 3; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: 0x0066cc,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    // Partial arc facing rightward (approx 110 deg)
    const arcGeo = new THREE.TorusGeometry(0.42, 0.018, 10, 32, Math.PI * 0.62);
    const mesh = new THREE.Mesh(arcGeo, mat);
    mesh.rotation.z = -Math.PI * 0.31;
    rfWavesGroup.add(mesh);
    rfWaves.push({ mesh, mat, phase: i / 3 });
  }

  // Cool blue accent light + NeoRU climax rim spotlight
  const accentLight = new THREE.PointLight(0x0066cc, 0, 5.2, 1.7);
  accentLight.position.set(0.1, 0.35, 1.4);
  group.add(accentLight);

  const rimLight = new THREE.SpotLight(0x38bdf8, 0, 7, Math.PI * 0.35, 0.6, 1.4);
  rimLight.position.set(0.6, 2.4, -1.6);
  rimLight.target = ruBody;
  group.add(rimLight);

  const hitTarget = new THREE.Mesh(
    new THREE.BoxGeometry(1.95, 2.5, 1.35),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hitTarget.userData.nodeId = 'oru';
  group.add(hitTarget);

  group.rotation.y = -0.26;

  const baseAccentIntensity = 1.05;
  let externalRfBoost = 0;

  return {
    id: 'oru',
    group,
    hitTarget,
    accentLight,
    rimLight,
    baseY: position.y,
    baseAccentIntensity,
    setRfWaveBoost(boost: number) {
      externalRfBoost = boost;
    },
    update(elapsed, _delta, power, hoverBoost) {
      const combinedBoost = Math.min(1.4, hoverBoost + externalRfBoost);
      ledMat.emissiveIntensity = (1.1 + 0.5 * Math.sin(elapsed * 3.2) + combinedBoost * 0.8) * power;
      accentLight.intensity = (baseAccentIntensity + combinedBoost * 1.35) * power;

      const waveSpeed = 0.48 + combinedBoost * 0.32;
      rfWaves.forEach((wave) => {
        const t = (elapsed * waveSpeed + wave.phase) % 1;
        const scale = 0.55 + t * 1.45;
        wave.mesh.scale.setScalar(scale);
        wave.mesh.position.x = t * 0.22;
        const envelope = Math.sin(t * Math.PI);
        wave.mat.opacity = envelope * (0.42 + combinedBoost * 0.35) * power;
      });
    },
  };
}
