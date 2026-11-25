import * as THREE from 'three';
import type { HardwareNodeHandle } from '../types';

/**
 * Procedurally constructs the stylized O-DU Rackmount Baseband / Hardware Accelerator Compute Unit.
 */
export function createODU(position: THREE.Vector3): HardwareNodeHandle {
  const group = new THREE.Group();
  group.name = 'node-odu';
  group.position.copy(position);

  const aluminumMat = new THREE.MeshStandardMaterial({
    color: 0xc2cbd6,
    roughness: 0.34,
    metalness: 0.52,
  });
  const slateMat = new THREE.MeshStandardMaterial({
    color: 0x3b4454,
    roughness: 0.48,
    metalness: 0.35,
  });
  const darkRecessMat = new THREE.MeshStandardMaterial({
    color: 0x1d232d,
    roughness: 0.65,
    metalness: 0.25,
  });
  const latchBlueMat = new THREE.MeshStandardMaterial({
    color: 0x2563eb,
    roughness: 0.35,
    metalness: 0.2,
  });
  const goldConnectorMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.25,
    metalness: 0.75,
  });

  // Main 3U horizontal rackmount chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.96, 1.38), aluminumMat);
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  group.add(chassis);

  // Subtle top cover seam
  const topPanel = new THREE.Mesh(new THREE.BoxGeometry(1.94, 0.04, 1.28), aluminumMat);
  topPanel.position.y = 0.49;
  group.add(topPanel);

  // Left & Right Rackmount Ears + Pull Handles
  [-1.08, 1.08].forEach((x) => {
    const ear = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.96, 0.08), slateMat);
    ear.position.set(x, 0, 0.67);
    group.add(ear);

    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.56, 0.14), aluminumMat);
    handle.position.set(x, 0, 0.75);
    group.add(handle);
  });

  // Front dark bay recess
  const frontFace = new THREE.Mesh(new THREE.BoxGeometry(1.94, 0.84, 0.05), darkRecessMat);
  frontFace.position.set(0, 0, 0.68);
  group.add(frontFace);

  // Left half: 3 horizontal perforated storage/baseband trays
  for (let i = 0; i < 3; i++) {
    const tray = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.16, 0.06), slateMat);
    tray.position.set(-0.48, 0.23 - i * 0.21, 0.705);
    group.add(tray);

    const handleBar = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.04, 0.03), aluminumMat);
    handleBar.position.set(-0.48, 0.23 - i * 0.21, 0.74);
    group.add(handleBar);
  }

  // Bottom-left RJ45 / SFP management ports
  for (let i = 0; i < 3; i++) {
    const port = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.05), slateMat);
    port.position.set(-0.76 + i * 0.2, -0.32, 0.705);
    group.add(port);
  }

  // Right half: 4 vertical modular PCIe / FPGA Accelerator bays
  for (let i = 0; i < 4; i++) {
    const x = 0.16 + i * 0.22;
    const bayCard = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.74, 0.06), slateMat);
    bayCard.position.set(x, 0, 0.705);
    group.add(bayCard);

    // Blue quick-release latch at top
    const latch = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.04), latchBlueMat);
    latch.position.set(x, 0.28, 0.74);
    group.add(latch);

    // Gold/amber fiber transceiver ports
    if (i >= 2) {
      for (let p = 0; p < 2; p++) {
        const transceiver = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.07), goldConnectorMat);
        transceiver.position.set(x, -0.05 - p * 0.17, 0.74);
        group.add(transceiver);
      }
    }
  }

  // Amber & Blue activity LEDs
  const ledMaterials: THREE.MeshStandardMaterial[] = [];
  const ledPositions: Array<[number, number, number]> = [
    [-0.14, -0.32, 0xf59e0b],
    [-0.04, -0.32, 0x3b82f6],
    [0.16, -0.31, 0xf59e0b],
    [0.38, -0.31, 0x3b82f6],
    [0.6, -0.31, 0xf59e0b],
    [0.82, -0.31, 0x22c55e],
  ];
  ledPositions.forEach(([lx, ly, hex]) => {
    const mat = new THREE.MeshStandardMaterial({
      color: hex,
      emissive: hex,
      emissiveIntensity: 0,
      roughness: 0.2,
    });
    ledMaterials.push(mat);
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 10), mat);
    led.position.set(lx, ly, 0.745);
    group.add(led);
  });

  // Warm amber accent light
  const accentLight = new THREE.PointLight(0xf59e0b, 0, 4.8, 1.8);
  accentLight.position.set(0, 0.35, 1.45);
  group.add(accentLight);

  const hitTarget = new THREE.Mesh(
    new THREE.BoxGeometry(2.35, 1.35, 1.65),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hitTarget.userData.nodeId = 'odu';
  group.add(hitTarget);

  group.rotation.y = -0.14;
  group.rotation.x = 0.08;

  const baseAccentIntensity = 0.95;

  return {
    id: 'odu',
    group,
    hitTarget,
    accentLight,
    baseY: position.y,
    baseAccentIntensity,
    update(elapsed, _delta, power, hoverBoost) {
      ledMaterials.forEach((mat, i) => {
        const pulse = 0.5 + 0.5 * Math.sin(elapsed * (3.4 + i * 0.55) + i * 0.9);
        mat.emissiveIntensity = (0.85 + pulse * 1.0 + hoverBoost * 0.7) * power;
      });
      accentLight.intensity = (baseAccentIntensity + hoverBoost * 1.15) * power;
    },
  };
}
