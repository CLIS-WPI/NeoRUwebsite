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
 * Generates a crisp procedural PCB silkscreen + gold differential trace + via grid texture.
 */
function createPcbTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 768;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Deep matte solder mask base
    ctx.fillStyle = '#0d2620';
    ctx.fillRect(0, 0, 1024, 768);

    // Subtle ground-plane micro-grid
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 1024; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 768);
      ctx.stroke();
    }
    for (let y = 0; y < 768; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    // Fine copper/gold differential bus traces radiating from center FPGA
    ctx.strokeStyle = 'rgba(212, 168, 83, 0.42)';
    ctx.lineWidth = 2.2;
    const cx = 512;
    const cy = 384;
    for (let i = -7; i <= 7; i++) {
      const offset = i * 16;
      // Left & Right high-speed lanes
      ctx.beginPath();
      ctx.moveTo(cx - 120, cy + offset);
      ctx.lineTo(cx - 240, cy + offset);
      ctx.lineTo(cx - 310, cy + offset * 1.45);
      ctx.lineTo(72, cy + offset * 1.45);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + 120, cy + offset);
      ctx.lineTo(cx + 240, cy + offset);
      ctx.lineTo(cx + 310, cy + offset * 1.45);
      ctx.lineTo(952, cy + offset * 1.45);
      ctx.stroke();
    }

    // Front I/O SERDES & RF feed traces
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.48)';
    ctx.lineWidth = 2.5;
    for (let i = -5; i <= 5; i++) {
      const ox = i * 22;
      ctx.beginPath();
      ctx.moveTo(cx + ox, cy + 125);
      ctx.lineTo(cx + ox, cy + 215);
      ctx.lineTo(cx + ox * 1.75, 725);
      ctx.stroke();
    }

    // Gold plated via pads along perimeter & buses
    ctx.fillStyle = '#e5b869';
    for (let x = 44; x <= 980; x += 36) {
      ctx.beginPath();
      ctx.arc(x, 34, 3.2, 0, Math.PI * 2);
      ctx.arc(x, 734, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let y = 64; y <= 704; y += 36) {
      ctx.beginPath();
      ctx.arc(36, y, 3.2, 0, Math.PI * 2);
      ctx.arc(988, y, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Crisp silkscreen outlines around central FPGA package
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.45)';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 190, cy - 190, 380, 380);
    ctx.fillStyle = 'rgba(226, 232, 240, 0.55)';
    ctx.font = '600 16px monospace';
    ctx.fillText('NEORU-72X REV-A', 64, 68);
    ctx.fillText('SPLIT 7.2X / LOW-PHY', 760, 68);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/**
 * Generates a crisp silicon micro-grid die texture for the central NeoRU FPGA core.
 */
function createDieTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#071426';
    ctx.fillRect(0, 0, 512, 512);

    // Silicon logic tile matrix
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const x = 36 + col * 55;
        const y = 36 + row * 55;
        const isCenter = row >= 2 && row <= 5 && col >= 2 && col <= 5;
        ctx.fillStyle = isCenter ? 'rgba(14, 165, 233, 0.34)' : 'rgba(56, 189, 248, 0.14)';
        ctx.fillRect(x, y, 45, 45);
        ctx.strokeStyle = 'rgba(125, 211, 252, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, 45, 45);
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/**
 * Procedurally constructs the flagship engineered O-RU "Black Box" enclosure:
 * - Chamfered dark anodized aluminum chassis with 16 fine CNC heatsink fins per flank + rear fins
 * - Precision SMA RF bulkheads, SFP28 optical cages, corner hex socket bolts
 * - Articulated beveled top lid with micro-ribbed thermal channels & perimeter light seam
 * - Detailed multi-layer RF/Digital PCB with silkscreen traces, shielding cans, TCXO, PMIC coils, and exposed NeoRU FPGA die
 * - 6 luminous curved energy/data tethers radiating outward to radial anchor nodes
 */
export function createBlackBoxORU(): BlackBoxORUHandle {
  const group = new THREE.Group();
  group.name = 'neoru-black-box';

  const pcbTexture = createPcbTexture();
  const dieTexture = createDieTexture();

  // --- Engineered PBR Materials (tuned for PMREM RoomEnvironment specular highlights) ---
  const anodizedDarkMat = new THREE.MeshPhysicalMaterial({
    color: 0x1a202c,
    metalness: 0.84,
    roughness: 0.24,
    clearcoat: 0.48,
    clearcoatRoughness: 0.18,
  });

  const anodizedFinMat = new THREE.MeshPhysicalMaterial({
    color: 0x263040,
    metalness: 0.88,
    roughness: 0.22,
    clearcoat: 0.35,
    clearcoatRoughness: 0.2,
  });

  const machinedSteelMat = new THREE.MeshPhysicalMaterial({
    color: 0xd8e0ea,
    metalness: 0.94,
    roughness: 0.14,
    clearcoat: 0.25,
  });

  const counterboreMat = new THREE.MeshStandardMaterial({
    color: 0x0b0f17,
    metalness: 0.6,
    roughness: 0.5,
  });

  const brassConnectorMat = new THREE.MeshPhysicalMaterial({
    color: 0xe0a943,
    metalness: 0.92,
    roughness: 0.16,
    clearcoat: 0.3,
  });

  const pcbMat = new THREE.MeshStandardMaterial({
    map: pcbTexture,
    metalness: 0.26,
    roughness: 0.44,
  });

  const traceGlowMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0066cc,
    emissiveIntensity: 0.22,
    metalness: 0.72,
    roughness: 0.2,
  });

  const shieldCanMat = new THREE.MeshPhysicalMaterial({
    color: 0xc2ccd8,
    metalness: 0.94,
    roughness: 0.15,
    clearcoat: 0.2,
  });

  const dieSubstrateMat = new THREE.MeshPhysicalMaterial({
    color: 0x0b1322,
    metalness: 0.45,
    roughness: 0.22,
    clearcoat: 0.65,
  });

  const smdGoldMat = new THREE.MeshStandardMaterial({
    color: 0xd4a348,
    metalness: 0.88,
    roughness: 0.24,
  });

  // --- 1. Lower Machined Aluminum Chassis Body ---
  const chassisGroup = new THREE.Group();
  group.add(chassisGroup);

  const baseSlab = new THREE.Mesh(new RoundedBoxGeometry(2.58, 0.28, 1.98, 5, 0.06), anodizedDarkMat);
  baseSlab.position.y = -0.34;
  baseSlab.castShadow = true;
  baseSlab.receiveShadow = true;
  chassisGroup.add(baseSlab);

  // Machined Cavity Perimeter Walls
  const wallFBGeo = new RoundedBoxGeometry(2.58, 0.54, 0.14, 4, 0.032);
  const frontWall = new THREE.Mesh(wallFBGeo, anodizedDarkMat);
  frontWall.position.set(0, -0.02, 0.92);
  const backWall = frontWall.clone();
  backWall.position.z = -0.92;

  const wallLRGeo = new RoundedBoxGeometry(0.16, 0.54, 1.98, 4, 0.032);
  const leftWall = new THREE.Mesh(wallLRGeo, anodizedDarkMat);
  leftWall.position.set(-1.21, -0.02, 0);
  const rightWall = leftWall.clone();
  rightWall.position.x = 1.21;
  chassisGroup.add(frontWall, backWall, leftWall, rightWall);

  // Finer Chamfered CNC Side Heatsink Fins (16 precision fins per flank)
  const sideFinGeo = new RoundedBoxGeometry(0.18, 0.68, 0.042, 3, 0.014);
  for (let i = 0; i < 16; i++) {
    const z = -0.84 + i * 0.112;
    const finL = new THREE.Mesh(sideFinGeo, anodizedFinMat);
    finL.position.set(-1.34, -0.07, z);
    finL.castShadow = true;
    const finR = finL.clone();
    finR.position.x = 1.34;
    chassisGroup.add(finL, finR);
  }

  // Rear Chamfered Heatsink Fins (14 vertical fins along back edge)
  const rearFinGeo = new RoundedBoxGeometry(0.044, 0.66, 0.14, 3, 0.012);
  for (let i = 0; i < 14; i++) {
    const x = -0.98 + i * 0.151;
    const finB = new THREE.Mesh(rearFinGeo, anodizedFinMat);
    finB.position.set(x, -0.07, -1.03);
    chassisGroup.add(finB);
  }

  // Front Edge RF Bulkhead Connectors (4 precision SMA/N-type with hex nut + gold center pin)
  for (let i = 0; i < 4; i++) {
    const x = -0.86 + i * 0.26;
    const hexNut = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.045, 6), machinedSteelMat);
    hexNut.rotation.x = Math.PI / 2;
    hexNut.position.set(x, -0.14, 1.0);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.11, 16), brassConnectorMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(x, -0.14, 1.035);
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.14, 10), machinedSteelMat);
    pin.rotation.x = Math.PI / 2;
    pin.position.set(x, -0.14, 1.045);
    chassisGroup.add(hexNut, barrel, pin);
  }

  // Dual Optical SFP28 Transceiver Cages with metal latch bails
  for (let i = 0; i < 2; i++) {
    const x = 0.46 + i * 0.36;
    const cage = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.15, 0.14, 3, 0.016), machinedSteelMat);
    cage.position.set(x, -0.14, 1.01);
    const portInner = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.09, 0.04),
      counterboreMat,
    );
    portInner.position.set(x, -0.14, 1.07);
    const bail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.018, 0.03), brassConnectorMat);
    bail.position.set(x, -0.2, 1.08);
    chassisGroup.add(cage, portInner, bail);
  }

  // Glowing Perimeter Unlock Seam Strip around top rim of chassis
  const seamMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0066cc,
    emissiveIntensity: 0,
    roughness: 0.18,
    metalness: 0.15,
  });
  const seamFB = new THREE.BoxGeometry(2.54, 0.024, 0.026);
  const seamLR = new THREE.BoxGeometry(0.026, 0.024, 1.94);
  const sF = new THREE.Mesh(seamFB, seamMat);
  sF.position.set(0, 0.245, 0.97);
  const sB = sF.clone();
  sB.position.z = -0.97;
  const sL = new THREE.Mesh(seamLR, seamMat);
  sL.position.set(-1.27, 0.245, 0);
  const sR = sL.clone();
  sR.position.x = 1.27;
  chassisGroup.add(sF, sB, sL, sR);

  // --- 2. Detailed Multi-Layer RF/Digital PCB & NeoRU Core ---
  const pcbGroup = new THREE.Group();
  pcbGroup.position.y = -0.15;
  chassisGroup.add(pcbGroup);

  const pcbBoard = new THREE.Mesh(new THREE.BoxGeometry(2.24, 0.06, 1.66), pcbMat);
  pcbBoard.receiveShadow = true;
  pcbGroup.add(pcbBoard);

  // Raised glowing high-speed differential bus traces radiating from FPGA
  const traceConfigs: Array<[number, number, number, number]> = [
    [-0.64, 0.0, 0.58, 0.02],
    [0.64, 0.0, 0.58, 0.02],
    [-0.64, 0.18, 0.52, 0.016],
    [0.64, 0.18, 0.52, 0.016],
    [-0.64, -0.18, 0.52, 0.016],
    [0.64, -0.18, 0.52, 0.016],
    [0.0, 0.54, 0.02, 0.38],
    [0.0, -0.54, 0.02, 0.38],
  ];
  traceConfigs.forEach(([tx, tz, tw, td]) => {
    const tr = new THREE.Mesh(new THREE.BoxGeometry(tw, 0.012, td), traceGlowMat);
    tr.position.set(tx, 0.036, tz);
    pcbGroup.add(tr);
  });

  // 4 Machined Brushed-Nickel RF Shielding Cans with laser-vent slots
  const shieldPositions: Array<[number, number, number, number]> = [
    [-0.79, -0.47, 0.46, 0.42],
    [-0.79, 0.45, 0.46, 0.44],
    [0.79, -0.47, 0.46, 0.42],
    [0.79, 0.45, 0.46, 0.44],
  ];
  shieldPositions.forEach(([sx, sz, sw, sd]) => {
    const can = new THREE.Mesh(new RoundedBoxGeometry(sw, 0.135, sd, 3, 0.022), shieldCanMat);
    can.position.set(sx, 0.095, sz);
    can.castShadow = true;
    pcbGroup.add(can);
  });

  // Precision TCXO / OCXO Timing Reference Oscillator Can (top center-left)
  const oscCan = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.1, 0.2, 3, 0.018), brassConnectorMat);
  oscCan.position.set(-0.32, 0.08, -0.62);
  pcbGroup.add(oscCan);

  // Power Delivery PMIC Inductor Chokes & SMD Capacitor Banks
  const chokeMat = new THREE.MeshStandardMaterial({ color: 0x2a3240, metalness: 0.65, roughness: 0.35 });
  for (let i = 0; i < 4; i++) {
    const choke = new THREE.Mesh(new RoundedBoxGeometry(0.11, 0.075, 0.11, 2, 0.012), chokeMat);
    choke.position.set(0.14 + i * 0.15, 0.068, -0.63);
    pcbGroup.add(choke);
  }
  for (let i = 0; i < 8; i++) {
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.042, 0.034), smdGoldMat);
    cap.position.set(-0.38 + i * 0.108, 0.052, 0.68);
    pcbGroup.add(cap);
  }

  // Centerpiece Multi-Tier Programmable FPGA / SoC Die ("NeoRU Core")
  const coreGroup = new THREE.Group();
  coreGroup.position.set(0, 0.06, 0);
  pcbGroup.add(coreGroup);

  // BGA Interposer Substrate
  const fpgaSubstrate = new THREE.Mesh(new RoundedBoxGeometry(0.84, 0.068, 0.84, 4, 0.022), dieSubstrateMat);
  coreGroup.add(fpgaSubstrate);

  // Perimeter Golden Micro-Decoupling Capacitors on FPGA substrate
  for (let i = -3; i <= 3; i++) {
    const pos = i * 0.105;
    const cTop = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.022, 0.022), smdGoldMat);
    cTop.position.set(pos, 0.042, -0.36);
    const cBot = cTop.clone();
    cBot.position.z = 0.36;
    const cL = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.022, 0.036), smdGoldMat);
    cL.position.set(-0.36, 0.042, pos);
    const cR = cL.clone();
    cR.position.x = 0.36;
    coreGroup.add(cTop, cBot, cL, cR);
  }

  // Chamfered Brushed-Titanium IHS Frame
  const fpgaFrame = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.088, 0.62, 4, 0.026), machinedSteelMat);
  fpgaFrame.position.y = 0.032;
  coreGroup.add(fpgaFrame);

  // Exposed Programmable Silicon Die with Logic-Tile Matrix Texture
  const coreDieMat = new THREE.MeshPhysicalMaterial({
    map: dieTexture,
    color: 0x38bdf8,
    emissive: 0x0ea5e9,
    emissiveMap: dieTexture,
    emissiveIntensity: 0,
    roughness: 0.12,
    metalness: 0.45,
    clearcoat: 0.8,
  });
  const coreDie = new THREE.Mesh(new RoundedBoxGeometry(0.46, 0.1, 0.46, 3, 0.016), coreDieMat);
  coreDie.position.y = 0.042;
  coreGroup.add(coreDie);

  // Dual Concentric Holographic Core Rings above FPGA die
  const coreRingMat = new THREE.MeshBasicMaterial({
    color: 0x7dd3fc,
    transparent: true,
    opacity: 0,
  });
  const coreRingInner = new THREE.Mesh(new THREE.RingGeometry(0.095, 0.128, 36), coreRingMat);
  coreRingInner.rotation.x = -Math.PI / 2;
  coreRingInner.position.y = 0.098;
  const coreRingOuter = new THREE.Mesh(new THREE.RingGeometry(0.165, 0.185, 36), coreRingMat);
  coreRingOuter.rotation.x = -Math.PI / 2;
  coreRingOuter.position.y = 0.099;
  coreGroup.add(coreRingInner, coreRingOuter);

  const coreLight = new THREE.PointLight(0x0ea5e9, 0, 5.5, 1.6);
  coreLight.position.set(0, 0.48, 0);
  pcbGroup.add(coreLight);

  // --- 3. Articulated Top Lid / Front Cover Assembly ---
  const lidGroup = new THREE.Group();
  lidGroup.position.set(0, 0.31, 0);
  group.add(lidGroup);

  const lidPlate = new THREE.Mesh(new RoundedBoxGeometry(2.62, 0.15, 2.02, 5, 0.048), anodizedDarkMat);
  lidPlate.castShadow = true;
  lidPlate.receiveShadow = true;
  lidGroup.add(lidPlate);

  // Machined Micro-Ribbed Thermal Channels across top lid
  const lidRibGeo = new RoundedBoxGeometry(1.68, 0.022, 0.048, 2, 0.008);
  for (let i = 0; i < 9; i++) {
    const rib = new THREE.Mesh(lidRibGeo, anodizedFinMat);
    rib.position.set(0, 0.078, -0.52 + i * 0.13);
    lidGroup.add(rib);
  }

  // 4 Corner Counterbored Stainless Hex Socket Fasteners
  const boreGeo = new THREE.CylinderGeometry(0.068, 0.068, 0.018, 20);
  const boltGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.032, 6);
  [
    [-1.1, -0.8],
    [1.1, -0.8],
    [-1.1, 0.8],
    [1.1, 0.8],
  ].forEach(([bx, bz]) => {
    const bore = new THREE.Mesh(boreGeo, counterboreMat);
    bore.position.set(bx, 0.072, bz);
    const bolt = new THREE.Mesh(boltGeo, machinedSteelMat);
    bolt.position.set(bx, 0.078, bz);
    lidGroup.add(bore, bolt);
  });

  // Sealed Status Indicator LED Bar on front of lid
  const lockLedMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 1.2,
    roughness: 0.18,
  });
  const lockLed = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.024, 0.032), lockLedMat);
  lockLed.position.set(0, 0.01, 1.01);
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
    const startPt = new THREE.Vector3(sideSign * 0.18, 0.04, (idx % 3 - 1) * 0.12);
    const ctrl1 = new THREE.Vector3(sideSign * 0.65, 0.74 + (1 - (idx % 3)) * 0.18, endPt.z * 0.4);
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
      roughness: 0.24,
      metalness: 0.22,
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

      seamMat.emissiveIntensity = state.seamGlow * 1.9;

      const lidHover = reducedMotion ? 0 : Math.sin(elapsed * 1.8 + 0.7) * 0.035 * open;
      lidGroup.position.y = 0.31 + open * 1.2 + lidHover;
      lidGroup.position.z = -open * 0.74;
      lidGroup.rotation.x = -open * 0.48;

      const lockPulse = 0.6 + 0.4 * Math.sin(elapsed * 2.8);
      lockLedMat.emissiveIntensity = (1 - open) * (0.9 + lockPulse * 0.6);

      const hoverBoost = activeIndex !== null ? 0.9 : 0;
      const coreBreath = reducedMotion ? 0.5 : 0.5 + 0.5 * Math.sin(elapsed * 2.4);
      const glow = state.coreGlow;
      coreDieMat.emissiveIntensity = glow * (1.1 + coreBreath * 0.6 + hoverBoost);
      coreRingMat.opacity = glow * (0.65 + coreBreath * 0.32);
      coreRingInner.scale.setScalar(0.95 + coreBreath * 0.1 + hoverBoost * 0.12);
      coreRingOuter.scale.setScalar(1.0 + (1 - coreBreath) * 0.08 + hoverBoost * 0.15);
      traceGlowMat.emissiveIntensity = 0.14 + glow * (0.6 + hoverBoost * 0.55);
      coreLight.intensity = glow * (2.35 + coreBreath * 0.65 + hoverBoost * 1.3);

      const pVis = state.particlesFade * (1 - open);
      deflectParticles.forEach((p) => {
        if (pVis <= 0.01 || reducedMotion) {
          p.mesh.visible = false;
          return;
        }
        p.mesh.visible = true;
        const t = (elapsed * p.speed + p.phase) % 1;
        const radius = t < 0.5 ? 2.45 - t * 1.7 : 1.6 + (t - 0.5) * 1.9;
        p.mesh.position.set(
          Math.cos(p.angle + elapsed * 0.15) * radius,
          p.height + Math.sin(t * Math.PI) * 0.15,
          Math.sin(p.angle + elapsed * 0.15) * radius * 0.75,
        );
        p.mat.opacity = Math.sin(t * Math.PI) * 0.45 * pVis;
      });

      const tProg = Math.max(0, Math.min(1, state.tetherProgress));
      tethers.forEach((t, idx) => {
        t.geo.setDrawRange(0, Math.floor(t.totalIndices * tProg));

        const isFocused = activeIndex === idx;
        const isDimmed = activeIndex !== null && !isFocused;

        t.mat.opacity = tProg > 0.02 ? (isDimmed ? 0.22 : isFocused ? 1.0 : 0.78) : 0;
        t.mat.emissiveIntensity = isFocused ? 1.85 : isDimmed ? 0.25 : 0.78;

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
