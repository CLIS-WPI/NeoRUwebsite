import * as THREE from 'three';
import type { OranORUHandle } from '../types';

/**
 * Procedurally constructs the Outdoor O-RU mounted on a telecom pole alongside
 * a 5G sector antenna panel, curved RF jumper cables, and animated concentric RF waves.
 * Styled with NeoRU's signature brand blue (#0066cc) as the visual focal point.
 */
export function createORU(position: THREE.Vector3): OranORUHandle {
  const group = new THREE.Group();
  group.name = 'node-oru';
  group.position.copy(position);

  const poleMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.36,
    metalness: 0.72,
  });
  // NeoRU signature cobalt blue anodized chassis
  const ruBrandBlueMat = new THREE.MeshStandardMaterial({
    color: 0x0066cc,
    roughness: 0.3,
    metalness: 0.42,
  });
  const ruDeepBlueFinMat = new THREE.MeshStandardMaterial({
    color: 0x004c99,
    roughness: 0.32,
    metalness: 0.55,
  });
  const ruSilverTrimMat = new THREE.MeshStandardMaterial({
    color: 0xdbeafe,
    roughness: 0.25,
    metalness: 0.5,
  });
  const bracketMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.42,
    metalness: 0.65,
  });
  const antennaRadomeMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.24,
    metalness: 0.12,
  });
  const antennaAccentMat = new THREE.MeshStandardMaterial({
    color: 0x0066cc,
    roughness: 0.28,
    metalness: 0.35,
  });
  const cableMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.55,
    metalness: 0.18,
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

  // Outdoor Radio Unit (O-RU) housing on the left side of the pole — NeoRU Brand Blue
  const ruGroup = new THREE.Group();
  ruGroup.position.set(-0.46, 0.14, 0.06);
  group.add(ruGroup);

  const ruBody = new THREE.Mesh(new THREE.BoxGeometry(0.82, 1.22, 0.46), ruBrandBlueMat);
  ruBody.castShadow = true;
  ruBody.receiveShadow = true;
  ruGroup.add(ruBody);

  // Subtle metallic bevel frame around front face
  const topTrim = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.055, 0.48), ruSilverTrimMat);
  topTrim.position.y = 0.61;
  const bottomTrim = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.055, 0.48), ruSilverTrimMat);
  bottomTrim.position.y = -0.61;
  ruGroup.add(topTrim, bottomTrim);

  // Machined vertical heatsink cooling fins across the front face
  for (let i = 0; i < 8; i++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.044, 1.08, 0.15), ruDeepBlueFinMat);
    fin.position.set(-0.315 + i * 0.09, 0, 0.27);
    ruGroup.add(fin);
  }

  // Top carry handle
  const handleBar = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.048, 0.06), bracketMat);
  handleBar.position.set(0, 0.71, 0);
  const handlePostL = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.1, 0.06), bracketMat);
  handlePostL.position.set(-0.17, 0.66, 0);
  const handlePostR = handlePostL.clone();
  handlePostR.position.x = 0.17;
  ruGroup.add(handleBar, handlePostL, handlePostR);

  // Bottom RF/optical weatherproof gland connectors
  for (let i = 0; i < 4; i++) {
    const gland = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.14, 12), bracketMat);
    gland.position.set(-0.24 + i * 0.16, -0.68, 0.04);
    ruGroup.add(gland);
  }

  // O-RU glowing status LEDs
  const ledMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x38bdf8,
    emissiveIntensity: 0,
    roughness: 0.15,
  });
  const led1 = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 10), ledMat);
  led1.position.set(0.34, 0.5, 0.25);
  const led2 = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 10), ledMat);
  led2.position.set(0.34, 0.4, 0.25);
  ruGroup.add(led1, led2);

  // 5G Sector Antenna Panel on the right side of the pole with blue brand accent stripe
  const antenna = new THREE.Mesh(new THREE.BoxGeometry(0.44, 1.66, 0.24), antennaRadomeMat);
  antenna.position.set(0.62, 0.26, 0.04);
  antenna.castShadow = true;
  group.add(antenna);

  const antennaBlueTrim = new THREE.Mesh(new THREE.BoxGeometry(0.46, 1.6, 0.05), antennaAccentMat);
  antennaBlueTrim.position.set(0.62, 0.26, -0.07);
  group.add(antennaBlueTrim);

  // Curved RF jumper cables connecting O-RU bottom ports to Sector Antenna bottom
  const cableConfigs: Array<[THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3]> = [
    [
      new THREE.Vector3(-0.62, -0.54, 0.1),
      new THREE.Vector3(-0.56, -0.98, 0.18),
      new THREE.Vector3(0.32, -1.0, 0.16),
      new THREE.Vector3(0.54, -0.56, 0.06),
    ],
    [
      new THREE.Vector3(-0.46, -0.54, 0.1),
      new THREE.Vector3(-0.36, -0.89, 0.12),
      new THREE.Vector3(0.42, -0.87, 0.1),
      new THREE.Vector3(0.64, -0.56, 0.06),
    ],
    [
      new THREE.Vector3(-0.3, -0.54, 0.08),
      new THREE.Vector3(-0.18, -0.79, 0.04),
      new THREE.Vector3(0.5, -0.77, 0.02),
      new THREE.Vector3(0.72, -0.56, 0.04),
    ],
  ];
  cableConfigs.forEach((pts) => {
    const curve = new THREE.CatmullRomCurve3(pts);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 22, 0.024, 8, false), cableMat);
    group.add(tube);
  });

  // Animated concentric RF signal waves radiating outward from the sector antenna
  const rfWavesGroup = new THREE.Group();
  rfWavesGroup.position.set(0.86, 0.34, 0.08);
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
    const arcGeo = new THREE.TorusGeometry(0.42, 0.022, 10, 32, Math.PI * 0.62);
    const mesh = new THREE.Mesh(arcGeo, mat);
    mesh.rotation.z = -Math.PI * 0.31;
    rfWavesGroup.add(mesh);
    rfWaves.push({ mesh, mat, phase: i / 3 });
  }

  // Brand blue accent light + climax rim spotlight
  const accentLight = new THREE.PointLight(0x0066cc, 0, 5.6, 1.6);
  accentLight.position.set(0.1, 0.35, 1.5);
  group.add(accentLight);

  const rimLight = new THREE.SpotLight(0x38bdf8, 0, 7.5, Math.PI * 0.38, 0.55, 1.3);
  rimLight.position.set(0.6, 2.5, -1.6);
  rimLight.target = ruBody;
  group.add(rimLight);

  const hitTarget = new THREE.Mesh(
    new THREE.BoxGeometry(2.05, 2.6, 1.4),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hitTarget.userData.nodeId = 'oru';
  group.add(hitTarget);

  group.rotation.y = -0.24;

  const baseAccentIntensity = 1.35;
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
      ledMat.emissiveIntensity = (1.35 + 0.55 * Math.sin(elapsed * 3.2) + combinedBoost * 0.9) * power;
      accentLight.intensity = (baseAccentIntensity + combinedBoost * 1.45) * power;

      const waveSpeed = 0.48 + combinedBoost * 0.32;
      rfWaves.forEach((wave) => {
        const t = (elapsed * waveSpeed + wave.phase) % 1;
        const scale = 0.55 + t * 1.45;
        wave.mesh.scale.setScalar(scale);
        wave.mesh.position.x = t * 0.22;
        const envelope = Math.sin(t * Math.PI);
        wave.mat.opacity = envelope * (0.48 + combinedBoost * 0.35) * power;
      });
    },
  };
}
