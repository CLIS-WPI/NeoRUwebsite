import * as THREE from 'three';
import type { NodeId, OpticalLinksHandle } from '../types';

interface PacketItem {
  mesh: THREE.Mesh;
  curve: THREE.CatmullRomCurve3;
  offset: number;
  speed: number;
  direction: 1 | -1;
}

/**
 * Creates the 3D optical conduits for Midhaul (F1) and Fronthaul (OFH / Split-7.2)
 * with animated beam-draw progress and continuous glowing data packets.
 */
export function createOpticalLinks(
  ocuPos: THREE.Vector3,
  oduPos: THREE.Vector3,
  oruPos: THREE.Vector3,
): OpticalLinksHandle {
  const group = new THREE.Group();
  group.name = 'optical-links';

  // Midhaul (F1): O-CU -> O-DU
  const midStart = new THREE.Vector3(ocuPos.x + 0.62, oduPos.y + 0.04, 0.08);
  const midEnd = new THREE.Vector3(oduPos.x - 1.12, oduPos.y + 0.04, 0.08);
  const midCurve = new THREE.CatmullRomCurve3([
    midStart,
    new THREE.Vector3((midStart.x + midEnd.x) * 0.5, oduPos.y + 0.06, 0.14),
    midEnd,
  ]);
  const midGeo = new THREE.TubeGeometry(midCurve, 40, 0.022, 10, false);
  const midTotalIndices = midGeo.index ? midGeo.index.count : midGeo.attributes.position.count;
  midGeo.setDrawRange(0, 0);

  const midMat = new THREE.MeshStandardMaterial({
    color: 0x3b4d63,
    emissive: 0x10b981,
    emissiveIntensity: 0.22,
    roughness: 0.3,
    metalness: 0.5,
  });
  const midTube = new THREE.Mesh(midGeo, midMat);
  group.add(midTube);

  // Fronthaul (OFH / Split-7.2): O-DU -> O-RU (thicker, high-speed conduit)
  const fhStart = new THREE.Vector3(oduPos.x + 1.12, oduPos.y + 0.04, 0.08);
  const fhEnd = new THREE.Vector3(oruPos.x - 0.86, oduPos.y + 0.04, 0.08);
  const fhCurve = new THREE.CatmullRomCurve3([
    fhStart,
    new THREE.Vector3((fhStart.x + fhEnd.x) * 0.5, oduPos.y + 0.07, 0.14),
    fhEnd,
  ]);
  const fhGeo = new THREE.TubeGeometry(fhCurve, 44, 0.042, 12, false);
  const fhTotalIndices = fhGeo.index ? fhGeo.index.count : fhGeo.attributes.position.count;
  fhGeo.setDrawRange(0, 0);

  const fhMat = new THREE.MeshStandardMaterial({
    color: 0x3f5b78,
    emissive: 0x0066cc,
    emissiveIntensity: 0.35,
    roughness: 0.25,
    metalness: 0.55,
  });
  const fhTube = new THREE.Mesh(fhGeo, fhMat);
  group.add(fhTube);

  // Glowing data packets
  const packets: PacketItem[] = [];
  const midPacketGeo = new THREE.CapsuleGeometry(0.036, 0.14, 6, 12);
  midPacketGeo.rotateZ(Math.PI / 2);
  const midPacketMat = new THREE.MeshBasicMaterial({
    color: 0x10b981,
    transparent: true,
    opacity: 0,
  });

  for (let i = 0; i < 3; i++) {
    const mesh = new THREE.Mesh(midPacketGeo, midPacketMat);
    group.add(mesh);
    packets.push({
      mesh,
      curve: midCurve,
      offset: i / 3,
      speed: 0.34,
      direction: i % 2 === 0 ? 1 : -1,
    });
  }

  const fhPacketGeo = new THREE.CapsuleGeometry(0.048, 0.2, 6, 12);
  fhPacketGeo.rotateZ(Math.PI / 2);
  const fhPacketMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0,
  });

  for (let i = 0; i < 4; i++) {
    const mesh = new THREE.Mesh(fhPacketGeo, fhPacketMat);
    group.add(mesh);
    packets.push({
      mesh,
      curve: fhCurve,
      offset: i / 4,
      speed: 0.56,
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
    update(elapsed, hoveredNode: NodeId, neoRuHover: boolean) {
      midGeo.setDrawRange(0, Math.floor(midTotalIndices * Math.min(1, Math.max(0, midhaulProgress.value))));
      fhGeo.setDrawRange(0, Math.floor(fhTotalIndices * Math.min(1, Math.max(0, fronthaulProgress.value))));

      const midBoost = hoveredNode === 'ocu' || hoveredNode === 'odu' ? 0.5 : 0;
      const fhBoost = hoveredNode === 'odu' || hoveredNode === 'oru' || neoRuHover ? 0.65 : 0;
      midMat.emissiveIntensity = 0.22 + midBoost;
      fhMat.emissiveIntensity = 0.35 + fhBoost;

      const active = flowActive.value;
      midPacketMat.opacity = active * (0.85 + midBoost * 0.2);
      fhPacketMat.opacity = active * (0.92 + fhBoost * 0.15);

      packets.forEach((p) => {
        const raw = (elapsed * p.speed + p.offset) % 1;
        const t = p.direction === 1 ? raw : 1 - raw;
        p.curve.getPointAt(t, tempPos);
        p.mesh.position.copy(tempPos);
        p.mesh.visible = active > 0.02;
      });
    },
  };
}
