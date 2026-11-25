import * as THREE from 'three';
import type { NodeId, OpticalLinksHandle } from '../types';

interface PacketItem {
  mesh: THREE.Mesh;
  which: 'mid' | 'fh';
  offset: number;
  speed: number;
  direction: 1 | -1;
}

export interface ResizableOpticalLinksHandle extends OpticalLinksHandle {
  updateSpan: (ocuX: number, oduX: number, oruX: number, y: number) => void;
}

const CONDUIT_RADIUS = 0.036;

/**
 * Creates consistent-thickness 3D optical conduits for F1 (CU to DU) and
 * Open Fronthaul 7.2x (DU to RU) with animated beam-draw progress and data packets.
 */
export function createOpticalLinks(
  ocuPos: THREE.Vector3,
  oduPos: THREE.Vector3,
  oruPos: THREE.Vector3,
): ResizableOpticalLinksHandle {
  const group = new THREE.Group();
  group.name = 'optical-links';

  const makeCurve = (x1: number, x2: number, y: number) =>
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(x1, y, 0.06),
      new THREE.Vector3((x1 + x2) * 0.5, y + 0.03, 0.1),
      new THREE.Vector3(x2, y, 0.06),
    ]);

  let midCurve = makeCurve(ocuPos.x + 0.65, oduPos.x - 1.15, oduPos.y + 0.04);
  let fhCurve = makeCurve(oduPos.x + 1.15, oruPos.x - 0.9, oduPos.y + 0.04);

  const midMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    emissive: 0x27704b,
    emissiveIntensity: 0.25,
    roughness: 0.28,
    metalness: 0.52,
  });

  const fhMat = new THREE.MeshStandardMaterial({
    color: 0x1e40af,
    emissive: 0x0066cc,
    emissiveIntensity: 0.35,
    roughness: 0.26,
    metalness: 0.54,
  });

  let midGeo = new THREE.TubeGeometry(midCurve, 44, CONDUIT_RADIUS, 12, false);
  let midTotalIndices = midGeo.index ? midGeo.index.count : midGeo.attributes.position.count;
  midGeo.setDrawRange(0, 0);
  const midTube = new THREE.Mesh(midGeo, midMat);
  group.add(midTube);

  let fhGeo = new THREE.TubeGeometry(fhCurve, 44, CONDUIT_RADIUS, 12, false);
  let fhTotalIndices = fhGeo.index ? fhGeo.index.count : fhGeo.attributes.position.count;
  fhGeo.setDrawRange(0, 0);
  const fhTube = new THREE.Mesh(fhGeo, fhMat);
  group.add(fhTube);

  // Glowing data packets — consistent clean size across both conduits
  const packets: PacketItem[] = [];
  const packetGeo = new THREE.CapsuleGeometry(0.046, 0.18, 6, 12);
  packetGeo.rotateZ(Math.PI / 2);

  const midPacketMat = new THREE.MeshBasicMaterial({
    color: 0x10b981,
    transparent: true,
    opacity: 0,
  });

  const fhPacketMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0,
  });

  for (let i = 0; i < 3; i++) {
    const mesh = new THREE.Mesh(packetGeo, midPacketMat);
    group.add(mesh);
    packets.push({
      mesh,
      which: 'mid',
      offset: i / 3,
      speed: 0.36,
      direction: i % 2 === 0 ? 1 : -1,
    });
  }

  for (let i = 0; i < 4; i++) {
    const mesh = new THREE.Mesh(packetGeo, fhPacketMat);
    group.add(mesh);
    packets.push({
      mesh,
      which: 'fh',
      offset: i / 4,
      speed: 0.52,
      direction: i % 2 === 0 ? 1 : -1,
    });
  }

  const midhaulProgress = { value: 0 };
  const fronthaulProgress = { value: 0 };
  const flowActive = { value: 0 };
  const tempPos = new THREE.Vector3();

  return {
    group,
    midhaulProgress,
    fronthaulProgress,
    flowActive,
    updateSpan(ocuX, oduX, oruX, y) {
      midCurve = makeCurve(ocuX + 0.68, oduX - 1.15, y);
      fhCurve = makeCurve(oduX + 1.15, oruX - 0.92, y);

      const newMidGeo = new THREE.TubeGeometry(midCurve, 44, CONDUIT_RADIUS, 12, false);
      midGeo.dispose();
      midGeo = newMidGeo;
      midTotalIndices = midGeo.index ? midGeo.index.count : midGeo.attributes.position.count;
      midTube.geometry = midGeo;

      const newFhGeo = new THREE.TubeGeometry(fhCurve, 44, CONDUIT_RADIUS, 12, false);
      fhGeo.dispose();
      fhGeo = newFhGeo;
      fhTotalIndices = fhGeo.index ? fhGeo.index.count : fhGeo.attributes.position.count;
      fhTube.geometry = fhGeo;
    },
    update(elapsed, hoveredNode: NodeId, neoRuHover: boolean) {
      midGeo.setDrawRange(0, Math.floor(midTotalIndices * Math.min(1, Math.max(0, midhaulProgress.value))));
      fhGeo.setDrawRange(0, Math.floor(fhTotalIndices * Math.min(1, Math.max(0, fronthaulProgress.value))));

      const midBoost = hoveredNode === 'ocu' || hoveredNode === 'odu' ? 0.5 : 0;
      const fhBoost = hoveredNode === 'odu' || hoveredNode === 'oru' || neoRuHover ? 0.65 : 0;
      midMat.emissiveIntensity = 0.25 + midBoost;
      fhMat.emissiveIntensity = 0.35 + fhBoost;

      const active = flowActive.value;
      midPacketMat.opacity = active * (0.85 + midBoost * 0.2);
      fhPacketMat.opacity = active * (0.92 + fhBoost * 0.15);

      packets.forEach((p) => {
        const raw = (elapsed * p.speed + p.offset) % 1;
        const t = p.direction === 1 ? raw : 1 - raw;
        const curve = p.which === 'mid' ? midCurve : fhCurve;
        curve.getPointAt(t, tempPos);
        p.mesh.position.copy(tempPos);
        p.mesh.visible = active > 0.02;
      });
    },
  };
}
