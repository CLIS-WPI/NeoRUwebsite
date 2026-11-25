import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export interface BlackBoxAnimState {
  seamGlow: number;
  lidOpen: number;
  coreGlow: number;
  tetherProgress: number;
  cameraTilt: number;
  particlesFade: number;
}

export interface BlackBoxORUHandle {
  group: THREE.Group;
  update: (
    elapsed: number,
    state: BlackBoxAnimState,
    activeIndex: number | null,
    reducedMotion: boolean,
  ) => void;
}

interface TetherRecord {
  geo: THREE.TubeGeometry;
  totalIndices: number;
  mat: THREE.MeshStandardMaterial;
  anchorMat: THREE.MeshStandardMaterial;
  anchorMesh: THREE.Mesh;
  pulseMesh: THREE.Mesh;
  pulseMat: THREE.MeshBasicMaterial;
  curve: THREE.CatmullRomCurve3;
  phase: number;
}

interface DeflectParticle {
  mesh: THREE.Mesh;
  mat: THREE.MeshBasicMaterial;
  angle: number;
  height: number;
  speed: number;
  phase: number;
}

/**
 * Procedurally constructs the flagship engineered O-RU "Black Box" enclosure:
 * - Chamfered dark anodized aluminum chassis with CNC side heatsink fins, bolts, RF/SFP ports
 * - Articulated beveled top lid with locked status indicator & perimeter light seam
 * - Internal multi-layer RF/Digital PCB, shielding cans, optical cages, and glowing NeoRU FPGA die
 * - 6 luminous curved energy/data tethers radiating outward to radial anchor nodes
 */
export function createBlackBoxORU(): BlackBoxORUHandle {
  const group = new THREE.Group();
  group.name = 'neoru-black-box';

  // --- Engineered PBR Materials ---
  const anodizedDarkMat = new THREE.MeshPhysicalMaterial({
    color: 0x1a202c,
    metalness: 0.78,
    roughness: 0.28,
    clearcoat: 0.38,
    clearcoatRoughness: 0.22,
  });

  const anodizedFinMat = new THREE.MeshStandardMaterial({
    color: 0x252e3d,
    metalness: 0.82,
    roughness: 0.3,
  });

  const machinedSteelMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    metalness: 0.9,
    roughness: 0.18,
  });

  const brassConnectorMat = new THREE.MeshStandardMaterial({
    color: 0xd9a03b,
    metalness: 0.88,
    roughness: 0.22,
  });

  const pcbMat = new THREE.MeshStandardMaterial({
    color: 0x0f2922,
    metalness: 0.22,
    roughness: 0.52,
  });

  const traceGoldMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0066cc,
    emissiveIntensity: 0.2,
    metalness: 0.7,
    roughness: 0.25,
  });

  const shieldCanMat = new THREE.MeshStandardMaterial({
    color: 0xb8c4d4,
    metalness: 0.92,
    roughness: 0.16,
  });

  const dieSubstrateMat = new THREE.MeshPhysicalMaterial({
    color: 0x0b1220,
    metalness: 0.45,
    roughness: 0.2,
    clearcoat: 0.6,
  });

  // --- 1. Lower Machined Aluminum Chassis Body ---
  const chassisGroup = new THREE.Group();
  group.add(chassisGroup);

  // Main outer shell floor & walls (cavity open on top)
  const baseSlab = new THREE.Mesh(new RoundedBoxGeometry(2.55, 0.28, 1.95, 4, 0.06), anodizedDarkMat);
  baseSlab.position.y = -0.34;
  baseSlab.castShadow = true;
  baseSlab.receiveShadow = true;
  chassisGroup.add(baseSlab);

  // Side & Front/Back Machined Cavity Walls
  const wallFBGeo = new RoundedBoxGeometry(2.55, 0.54, 0.14, 3, 0.03);
  const frontWall = new THREE.Mesh(wallFBGeo, anodizedDarkMat);
  frontWall.position.set(0, -0.02, 0.905);
  const backWall = frontWall.clone();
  backWall.position.z = -0.905;

  const wallLRGeo = new RoundedBoxGeometry(0.16, 0.54, 1.95, 3, 0.03);
  const leftWall = new THREE.Mesh(wallLRGeo, anodizedDarkMat);
  leftWall.position.set(-1.195, -0.02, 0);
  const rightWall = leftWall.clone();
  rightWall.position.x = 1.195;
  chassisGroup.add(frontWall, backWall, leftWall, rightWall);

  // CNC Side Heatsink Fins (10 deep vertical fins on both left & right sides)
  const finGeo = new RoundedBoxGeometry(0.16, 0.68, 0.065, 2, 0.015);
  for (let i = 0; i < 10; i++) {
    const z = -0.78 + i * 0.173;
    const finL = new THREE.Mesh(finGeo, anodizedFinMat);
    finL.position.set(-1.31, -0.07, z);
    finL.castShadow = true;
    const finR = finL.clone();
    finR.position.x = 1.31;
    chassisGroup.add(finL, finR);
  }

  // Front Edge RF Connectors (4 machined SMA/N-type ports) & 2 Optical SFP28 Cages
  for (let i = 0; i < 4; i++) {
    const x = -0.82 + i * 0.26;
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.1, 16), machinedSteelMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.set(x, -0.14, 1.0);
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.13, 12), brassConnectorMat);
    pin.rotation.x = Math.PI / 2;
    pin.position.set(x, -0.14, 1.02);
    chassisGroup.add(collar, pin);
  }
  for (let i = 0; i < 2; i++) {
    const x = 0.48 + i * 0.34;
    const cage = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.14, 0.12, 2, 0.015), machinedSteelMat);
    cage.position.set(x, -0.14, 0.99);
    const portInner = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.08, 0.04),
      new THREE.MeshBasicMaterial({ color: 0x0b1220 }),
    );
    portInner.position.set(x, -0.14, 1.045);
    chassisGroup.add(cage, portInner);
  }

  // Glowing Perimeter Unlock Seam Strip around top rim of chassis
  const seamMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0066cc,
    emissiveIntensity: 0,
    roughness: 0.2,
    metalness: 0.1,
  });
  const seamFB = new THREE.BoxGeometry(2.5, 0.025, 0.028);
  const seamLR = new THREE.BoxGeometry(0.028, 0.025, 1.9);
  const sF = new THREE.Mesh(seamFB, seamMat);
  sF.position.set(0, 0.245, 0.955);
  const sB = sF.clone();
  sB.position.z = -0.955;
  const sL = new THREE.Mesh(seamLR, seamMat);
  sL.position.set(-1.255, 0.245, 0);
  const sR = sL.clone();
  sR.position.x = 1.255;
  chassisGroup.add(sF, sB, sL, sR);

  // --- 2. Internal Multi-Layer RF/Digital PCB & NeoRU Core ---
  const pcbGroup = new THREE.Group();
  pcbGroup.position.y = -0.15;
  chassisGroup.add(pcbGroup);

  const pcbBoard = new THREE.Mesh(new THREE.BoxGeometry(2.22, 0.055, 1.64), pcbMat);
  pcbBoard.receiveShadow = true;
  pcbGroup.add(pcbBoard);

  // Fine glowing copper/blue PCB traces radiating from central FPGA core
  const traceConfigs: Array<[number, number, number, number]> = [
    [-0.65, 0.0, 0.62, 0.022],
    [0.65, 0.0, 0.62, 0.022],
    [-0.65, 0.24, 0.56, 0.018],
    [0.65, 0.24, 0.56, 0.018],
    [-0.65, -0.24, 0.56, 0.018],
    [0.65, -0.24, 0.56, 0.018],
    [0.0, 0.52, 0.022, 0.42],
    [0.0, -0.52, 0.022, 0.42],
  ];
  traceConfigs.forEach(([tx, tz, tw, td]) => {
    const tr = new THREE.Mesh(new THREE.BoxGeometry(tw, 0.01, td), traceGoldMat);
    tr.position.set(tx, 0.033, tz);
    pcbGroup.add(tr);
  });

  // RF Shielding Cans (Left & Right banks)
  const shieldPositions: Array<[number, number, number, number]> = [
    [-0.78, -0.46, 0.46, 0.42],
    [-0.78, 0.44, 0.46, 0.46],
    [0.78, -0.46, 0.46, 0.42],
    [0.78, 0.44, 0.46, 0.46],
  ];
  shieldPositions.forEach(([sx, sz, sw, sd]) => {
    const can = new THREE.Mesh(new RoundedBoxGeometry(sw, 0.13, sd, 2, 0.02), shieldCanMat);
    can.position.set(sx, 0.09, sz);
    can.castShadow = true;
    pcbGroup.add(can);
  });

  // High-speed SMD capacitor rows
  const capMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.35 });
  for (let i = 0; i < 6; i++) {
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.04), capMat);
    cap.position.set(-0.32 + i * 0.128, 0.052, 0.66);
    pcbGroup.add(cap);
  }

  // Centerpiece Programmable FPGA / SoC Die ("NeoRU Core")
  const coreGroup = new THREE.Group();
  coreGroup.position.set(0, 0.06, 0);
  pcbGroup.add(coreGroup);

  const fpgaSubstrate = new THREE.Mesh(new RoundedBoxGeometry(0.76, 0.07, 0.76, 3, 0.02), dieSubstrateMat);
  coreGroup.add(fpgaSubstrate);

  const fpgaFrame = new THREE.Mesh(new RoundedBoxGeometry(0.58, 0.09, 0.58, 3, 0.025), machinedSteelMat);
  fpgaFrame.position.y = 0.03;
  coreGroup.add(fpgaFrame);

  const coreDieMat = new THREE.MeshStandardMaterial({
    color: 0x0066cc,
    emissive: 0x0ea5e9,
    emissiveIntensity: 0,
    roughness: 0.15,
    metalness: 0.4,
  });
  const coreDie = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.1, 0.42, 2, 0.018), coreDieMat);
  coreDie.position.y = 0.036;
  coreGroup.add(coreDie);

  // Glowing inner core ring on top of FPGA die
  const coreRingMat = new THREE.MeshBasicMaterial({
    color: 0x7dd3fc,
    transparent: true,
    opacity: 0,
  });
  const coreRing = new THREE.Mesh(new THREE.RingGeometry(0.11, 0.155, 32), coreRingMat);
  coreRing.rotation.x = -Math.PI / 2;
  coreRing.position.y = 0.092;
  coreGroup.add(coreRing);

  // Core point light illuminating the open cavity
  const coreLight = new THREE.PointLight(0x0ea5e9, 0, 5.2, 1.7);
  coreLight.position.set(0, 0.45, 0);
  pcbGroup.add(coreLight);

  // --- 3. Articulated Top Lid / Front Cover Assembly ---
  const lidGroup = new THREE.Group();
  lidGroup.position.set(0, 0.31, 0);
  group.add(lidGroup);

  const lidPlate = new THREE.Mesh(new RoundedBoxGeometry(2.58, 0.14, 1.98, 4, 0.045), anodizedDarkMat);
  lidPlate.castShadow = true;
  lidPlate.receiveShadow = true;
  lidGroup.add(lidPlate);

  // Subtle machined recessed center plate on lid
  const lidInlay = new THREE.Mesh(new RoundedBoxGeometry(1.72, 0.03, 1.18, 3, 0.02), anodizedFinMat);
  lidInlay.position.y = 0.068;
  lidGroup.add(lidInlay);

  // 4 Corner Hex Fastener Bolts on the lid
  const boltGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.03, 6);
  [
    [-1.08, -0.78],
    [1.08, -0.78],
    [-1.08, 0.78],
    [1.08, 0.78],
  ].forEach(([bx, bz]) => {
    const bolt = new THREE.Mesh(boltGeo, machinedSteelMat);
    bolt.position.set(bx, 0.072, bz);
    lidGroup.add(bolt);
  });

  // Sealed Status Indicator LED Bar on front of lid (amber when locked, dims when open)
  const lockLedMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 1.2,
    roughness: 0.2,
  });
  const lockLed = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.022, 0.03), lockLedMat);
  lockLed.position.set(0, 0.01, 0.99);
  lidGroup.add(lockLed);

  // --- 4. Ambient RF Particles Deflecting off Locked Shell ---
  const particlesGroup = new THREE.Group();
  group.add(particlesGroup);
  const deflectParticles: DeflectParticle[] = [];
  const pGeo = new THREE.SphereGeometry(0.032, 8, 8);
  for (let i = 0; i < 14; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: 0x64748b,
      transparent: true,
      opacity: 0,
    });
    const mesh = new THREE.Mesh(pGeo, mat);
    particlesGroup.add(mesh);
    deflectParticles.push({
      mesh,
      mat,
      angle: (i / 14) * Math.PI * 2,
      height: -0.25 + (i % 3) * 0.28,
      speed: 0.42 + (i % 4) * 0.09,
      phase: (i * 0.27) % 1,
    });
  }

  // --- 5. Six Luminous Curved Energy/Data Tethers & Anchor Nodes ---
  const tethersGroup = new THREE.Group();
  group.add(tethersGroup);

  const tetherColors = [0x0066cc, 0x0284c7, 0x4f46e5, 0x0066cc, 0x16a34a, 0x0369a1];
  // 3 radial targets on the left, 3 on the right
  const targetPoints: THREE.Vector3[] = [
    new THREE.Vector3(-2.65, 0.85, -0.35),
    new THREE.Vector3(-2.85, 0.15, 0.15),
    new THREE.Vector3(-2.55, -0.52, 0.45),
    new THREE.Vector3(2.65, 0.85, -0.35),
    new THREE.Vector3(2.85, 0.15, 0.15),
    new THREE.Vector3(2.55, -0.52, 0.45),
  ];

  const tethers: TetherRecord[] = [];
  const anchorGeo = new THREE.SphereGeometry(0.075, 16, 16);
  const pulseGeo = new THREE.SphereGeometry(0.048, 10, 10);

  targetPoints.forEach((endPt, idx) => {
    const sideSign = endPt.x < 0 ? -1 : 1;
    const startPt = new THREE.Vector3(sideSign * 0.16, 0.02, (idx % 3 - 1) * 0.12);
    const ctrl1 = new THREE.Vector3(sideSign * 0.65, 0.72 + (1 - (idx % 3)) * 0.18, endPt.z * 0.4);
    const ctrl2 = new THREE.Vector3(endPt.x * 0.72, endPt.y + 0.18, endPt.z * 0.8);
    const curve = new THREE.CatmullRomCurve3([startPt, ctrl1, ctrl2, endPt]);

    const geo = new THREE.TubeGeometry(curve, 44, 0.022, 10, false);
    const totalIndices = geo.index ? geo.index.count : geo.attributes.position.count;
    geo.setDrawRange(0, 0);

    const color = tetherColors[idx];
    const mat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.7,
      roughness: 0.25,
      metalness: 0.2,
      transparent: true,
      opacity: 0.9,
    });
    const tube = new THREE.Mesh(geo, mat);
    tethersGroup.add(tube);

    const anchorMat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.9,
      roughness: 0.2,
      transparent: true,
      opacity: 0,
    });
    const anchorMesh = new THREE.Mesh(anchorGeo, anchorMat);
    anchorMesh.position.copy(endPt);
    tethersGroup.add(anchorMesh);

    const pulseMat = new THREE.MeshBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0,
    });
    const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
    tethersGroup.add(pulseMesh);

    tethers.push({
      geo,
      totalIndices,
      mat,
      anchorMat,
      anchorMesh,
      pulseMesh,
      pulseMat,
      curve,
      phase: idx / 6,
    });
  });

  const tempPos = new THREE.Vector3();

  return {
    group,
    update(elapsed, state, activeIndex, reducedMotion) {
      const open = Math.max(0, Math.min(1, state.lidOpen));
      const floatY = reducedMotion ? 0 : Math.sin(elapsed * 1.4) * 0.04;
      group.position.y = floatY;

      // Perimeter seam glow during unlock
      seamMat.emissiveIntensity = state.seamGlow * 1.85;

      // Articulated lid mechanical lift + subtle backward tilt + gentle hover when open
      const lidHover = reducedMotion ? 0 : Math.sin(elapsed * 1.8 + 0.7) * 0.035 * open;
      lidGroup.position.y = 0.31 + open * 1.18 + lidHover;
      lidGroup.position.z = -open * 0.72;
      lidGroup.rotation.x = -open * 0.48;

      // Locked LED dims as enclosure unlocks
      const lockPulse = 0.6 + 0.4 * Math.sin(elapsed * 2.8);
      lockLedMat.emissiveIntensity = (1 - open) * (0.9 + lockPulse * 0.6);

      // Internal FPGA Core breathing glow + hover micro-pulse
      const hoverBoost = activeIndex !== null ? 0.85 : 0;
      const coreBreath = reducedMotion ? 0.5 : 0.5 + 0.5 * Math.sin(elapsed * 2.4);
      const glow = state.coreGlow;
      coreDieMat.emissiveIntensity = glow * (0.95 + coreBreath * 0.55 + hoverBoost);
      coreRingMat.opacity = glow * (0.65 + coreBreath * 0.3);
      coreRing.scale.setScalar(0.95 + coreBreath * 0.12 + hoverBoost * 0.14);
      traceGoldMat.emissiveIntensity = 0.12 + glow * (0.55 + hoverBoost * 0.5);
      coreLight.intensity = glow * (2.2 + coreBreath * 0.6 + hoverBoost * 1.2);

      // Ambient RF particles deflecting off sealed Black Box (only visible when locked)
      const pVis = state.particlesFade * (1 - open);
      deflectParticles.forEach((p) => {
        if (pVis <= 0.01 || reducedMotion) {
          p.mesh.visible = false;
          return;
        }
        p.mesh.visible = true;
        const t = (elapsed * p.speed + p.phase) % 1;
        // Approach from radius 2.5 to shell ~1.6, then bounce outward
        const radius = t < 0.5 ? 2.45 - t * 1.7 : 1.6 + (t - 0.5) * 1.9;
        p.mesh.position.set(
          Math.cos(p.angle + elapsed * 0.15) * radius,
          p.height + Math.sin(t * Math.PI) * 0.15,
          Math.sin(p.angle + elapsed * 0.15) * radius * 0.75,
        );
        p.mat.opacity = Math.sin(t * Math.PI) * 0.45 * pVis;
      });

      // 6 Luminous Curved Tethers & Data Pulses
      const tProg = Math.max(0, Math.min(1, state.tetherProgress));
      tethers.forEach((t, idx) => {
        t.geo.setDrawRange(0, Math.floor(t.totalIndices * tProg));

        const isFocused = activeIndex === idx;
        const isDimmed = activeIndex !== null && !isFocused;

        t.mat.opacity = tProg > 0.02 ? (isDimmed ? 0.22 : isFocused ? 1.0 : 0.78) : 0;
        t.mat.emissiveIntensity = isFocused ? 1.8 : isDimmed ? 0.25 : 0.75;

        t.anchorMat.opacity = tProg > 0.85 ? (isDimmed ? 0.3 : 1.0) : 0;
        t.anchorMesh.scale.setScalar(isFocused ? 1.38 : 1.0);

        if (tProg > 0.92 && !reducedMotion) {
          t.pulseMesh.visible = true;
          const pt = (elapsed * (isFocused ? 0.9 : 0.52) + t.phase) % 1;
          t.curve.getPointAt(pt, tempPos);
          t.pulseMesh.position.copy(tempPos);
          t.pulseMat.opacity = isDimmed ? 0.2 : isFocused ? 1.0 : 0.85;
          t.pulseMesh.scale.setScalar(isFocused ? 1.35 : 0.95);
        } else {
          t.pulseMesh.visible = false;
        }
      });
    },
  };
}
