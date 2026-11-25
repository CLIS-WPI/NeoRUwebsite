import * as THREE from 'three';
import type { HardwareNodeHandle } from '../types';

/**
 * Procedurally constructs the stylized O-CU Edge Compute Server Tower.
 * Modularized so a .glb asset can replace this group without changing scene orchestration.
 */
export function createOCU(position: THREE.Vector3): HardwareNodeHandle {
  const group = new THREE.Group();
  group.name = 'node-ocu';
  group.position.copy(position);

  const chassisMat = new THREE.MeshStandardMaterial({
    color: 0x8b95a5,
    roughness: 0.42,
    metalness: 0.35,
  });
  const bezelMat = new THREE.MeshStandardMaterial({
    color: 0x262d38,
    roughness: 0.55,
    metalness: 0.25,
  });
  const darkSlotMat = new THREE.MeshStandardMaterial({
    color: 0x171c24,
    roughness: 0.7,
    metalness: 0.2,
  });
  const silverTrimMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    roughness: 0.28,
    metalness: 0.65,
  });

  // Main tower body
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.12, 1.92, 1.24), chassisMat);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Subtle top bevel plate
  const topCap = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.06, 1.18), silverTrimMat);
  topCap.position.y = 0.98;
  group.add(topCap);

  // Base pedestal feet
  const basePlate = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.08, 1.28), bezelMat);
  basePlate.position.y = -0.99;
  group.add(basePlate);

  // Front dark bezel
  const frontBezel = new THREE.Mesh(new THREE.BoxGeometry(0.98, 1.78, 0.08), bezelMat);
  frontBezel.position.set(0, 0, 0.61);
  group.add(frontBezel);

  // Twin vertical glowing green accent edge strips on front bezel
  const stripMat = new THREE.MeshStandardMaterial({
    color: 0x34d399,
    emissive: 0x10b981,
    emissiveIntensity: 0,
    roughness: 0.2,
    metalness: 0.1,
  });
  const leftStrip = new THREE.Mesh(new THREE.BoxGeometry(0.032, 1.56, 0.03), stripMat);
  leftStrip.position.set(-0.44, 0, 0.655);
  const rightStrip = leftStrip.clone();
  rightStrip.position.x = 0.44;
  group.add(leftStrip, rightStrip);

  // Upper drive bays / ventilation louvers
  for (let i = 0; i < 4; i++) {
    const bay = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.15, 0.04), darkSlotMat);
    bay.position.set(0, 0.56 - i * 0.21, 0.645);
    group.add(bay);
  }

  // Lower mesh intake grille bars
  for (let i = 0; i < 6; i++) {
    const louver = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.035, 0.03), darkSlotMat);
    louver.position.set(0, -0.38 - i * 0.08, 0.645);
    group.add(louver);
  }

  // Side ventilation slots
  for (let i = 0; i < 5; i++) {
    const sideVent = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.05, 0.65), darkSlotMat);
    sideVent.position.set(-0.565, -0.5 + i * 0.11, 0.05);
    group.add(sideVent);
  }

  // Fiber SFP+ ports & miniature patch plugs (yellow + cyan)
  const portBlock = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.22, 0.05), darkSlotMat);
  portBlock.position.set(0, -0.17, 0.645);
  group.add(portBlock);

  const fiberCyanMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.35, metalness: 0.2 });
  const fiberAmberMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35, metalness: 0.2 });
  const plug1 = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.12), fiberCyanMat);
  plug1.position.set(-0.14, -0.17, 0.68);
  const plug2 = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.12), fiberAmberMat);
  plug2.position.set(0.14, -0.17, 0.68);
  group.add(plug1, plug2);

  // Status LEDs (green + cyan)
  const ledMaterials: THREE.MeshStandardMaterial[] = [];
  const ledColors = [0x22c55e, 0x34d399, 0x06b6d4, 0x22c55e];
  ledColors.forEach((hex, idx) => {
    const mat = new THREE.MeshStandardMaterial({
      color: hex,
      emissive: hex,
      emissiveIntensity: 0,
      roughness: 0.2,
    });
    ledMaterials.push(mat);
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 12), mat);
    led.position.set(-0.28 + idx * 0.11, 0.76, 0.665);
    group.add(led);
  });

  // Subtle green accent light
  const accentLight = new THREE.PointLight(0x34d399, 0, 4.5, 1.8);
  accentLight.position.set(0, 0.2, 1.35);
  group.add(accentLight);

  // Invisible hit volume for smooth raycasting
  const hitTarget = new THREE.Mesh(
    new THREE.BoxGeometry(1.45, 2.25, 1.55),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hitTarget.userData.nodeId = 'ocu';
  group.add(hitTarget);

  // Slight angled studio presentation pose
  group.rotation.y = 0.32;

  const baseAccentIntensity = 0.9;

  return {
    id: 'ocu',
    group,
    hitTarget,
    accentLight,
    baseY: position.y,
    baseAccentIntensity,
    update(elapsed, _delta, power, hoverBoost) {
      stripMat.emissiveIntensity = (0.75 + hoverBoost * 0.7) * power;
      ledMaterials.forEach((mat, i) => {
        const blink = 0.55 + 0.45 * Math.sin(elapsed * (2.6 + i * 0.7) + i * 1.4);
        mat.emissiveIntensity = (0.9 + blink * 0.9 + hoverBoost * 0.6) * power;
      });
      accentLight.intensity = (baseAccentIntensity + hoverBoost * 1.1) * power;
    },
  };
}
