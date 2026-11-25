import type * as THREE from 'three';

export type NodeId = 'ocu' | 'odu' | 'oru' | null;

export interface HardwareNodeHandle {
  id: Exclude<NodeId, null>;
  group: THREE.Group;
  hitTarget: THREE.Object3D;
  accentLight: THREE.PointLight;
  baseY: number;
  baseAccentIntensity: number;
  /** Called each frame with elapsed time (s), delta (s), active power level (0..1), and hover boost (0..1). */
  update: (elapsed: number, delta: number, power: number, hoverBoost: number) => void;
}

export interface OranORUHandle extends HardwareNodeHandle {
  rimLight: THREE.SpotLight;
  setRfWaveBoost: (boost: number) => void;
}

export interface OpticalLinksHandle {
  group: THREE.Group;
  midhaulProgress: { value: number };
  fronthaulProgress: { value: number };
  flowActive: { value: number };
  update: (elapsed: number, hoveredNode: NodeId, neoRuHover: boolean) => void;
}
