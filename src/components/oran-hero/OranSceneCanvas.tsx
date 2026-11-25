import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import * as THREE from 'three';
import { createOCU } from './models/createOCU';
import { createODU } from './models/createODU';
import { createORU } from './models/createORU';
import { createOpticalLinks } from './models/createOpticalLinks';
import type {
  HardwareNodeHandle,
  NodeId,
  OpticalLinksHandle,
  OranORUHandle,
} from './types';

export interface SceneAnimState {
  gridOpacity: number;
  ocuRise: number;
  ocuPower: number;
  oduRise: number;
  oduPower: number;
  oruRise: number;
  oruPower: number;
  oruSpotlight: number;
  midhaulProgress: number;
  fronthaulProgress: number;
  flowActive: number;
}

export interface OranSceneHandle {
  animState: SceneAnimState;
}

interface OranSceneCanvasProps {
  hoveredNode: NodeId;
  neoRuHovered: boolean;
  onHoverNode: (node: NodeId) => void;
}

const NODE_POSITIONS = {
  ocu: new THREE.Vector3(-4.15, 0.08, 0),
  odu: new THREE.Vector3(0, -0.14, 0),
  oru: new THREE.Vector3(4.15, 0.08, 0),
};

export const OranSceneCanvas = forwardRef<OranSceneHandle, OranSceneCanvasProps>(
  function OranSceneCanvas({ hoveredNode, neoRuHovered, onHoverNode }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const hoveredNodeRef = useRef<NodeId>(hoveredNode);
    const neoRuHoveredRef = useRef<boolean>(neoRuHovered);
    const onHoverNodeRef = useRef(onHoverNode);

    hoveredNodeRef.current = hoveredNode;
    neoRuHoveredRef.current = neoRuHovered;
    onHoverNodeRef.current = onHoverNode;

    const animStateRef = useRef<SceneAnimState>({
      gridOpacity: 0,
      ocuRise: 0,
      ocuPower: 0,
      oduRise: 0,
      oduPower: 0,
      oruRise: 0,
      oruPower: 0,
      oruSpotlight: 0,
      midhaulProgress: 0,
      fronthaulProgress: 0,
      flowActive: 0,
    });

    useImperativeHandle(ref, () => ({
      animState: animStateRef.current,
    }));

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const scene = new THREE.Scene();

      // Perspective camera tuned to frame all 3 nodes cleanly
      const camera = new THREE.PerspectiveCamera(
        34,
        Math.max(1, container.clientWidth) / Math.max(1, container.clientHeight),
        0.1,
        100,
      );

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      container.appendChild(renderer.domElement);

      // Soft studio lighting for bright, high-craft hardware rendering
      const hemiLight = new THREE.HemisphereLight(0xffffff, 0xdbe4f0, 1.35);
      hemiLight.position.set(0, 10, 0);
      scene.add(hemiLight);

      const keyLight = new THREE.DirectionalLight(0xffffff, 1.45);
      keyLight.position.set(4, 8, 7);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 24;
      keyLight.shadow.camera.left = -8;
      keyLight.shadow.camera.right = 8;
      keyLight.shadow.camera.top = 5;
      keyLight.shadow.camera.bottom = -5;
      keyLight.shadow.bias = -0.0005;
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.75);
      fillLight.position.set(-6, 4, 5);
      scene.add(fillLight);

      // Stage root group for gentle mouse parallax
      const stageGroup = new THREE.Group();
      scene.add(stageGroup);

      // Subtle perspective tech grid beneath the hardware stage
      const gridHelper = new THREE.GridHelper(18, 28, 0xcbd5e1, 0xe2e8f0);
      gridHelper.position.set(0, -1.25, 0);
      const gridMaterials = Array.isArray(gridHelper.material)
        ? gridHelper.material
        : [gridHelper.material];
      gridMaterials.forEach((m) => {
        m.transparent = true;
        m.opacity = 0;
        m.depthWrite = false;
      });
      stageGroup.add(gridHelper);

      // Soft shadow-receiving floor plane
      const shadowPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(18, 8),
        new THREE.ShadowMaterial({ opacity: 0.08 }),
      );
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.position.y = -1.24;
      shadowPlane.receiveShadow = true;
      stageGroup.add(shadowPlane);

      // Build procedural hardware nodes & optical links
      const ocu: HardwareNodeHandle = createOCU(NODE_POSITIONS.ocu);
      const odu: HardwareNodeHandle = createODU(NODE_POSITIONS.odu);
      const oru: OranORUHandle = createORU(NODE_POSITIONS.oru);
      const links: OpticalLinksHandle = createOpticalLinks(
        NODE_POSITIONS.ocu,
        NODE_POSITIONS.odu,
        NODE_POSITIONS.oru,
      );

      stageGroup.add(ocu.group, odu.group, oru.group, links.group);

      const hitTargets = [ocu.hitTarget, odu.hitTarget, oru.hitTarget];
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2(99, 99);
      const parallaxTarget = { x: 0, y: 0 };
      const parallaxCurrent = { x: 0, y: 0 };

      // Smooth hover boost states per node
      const hoverLerp = { ocu: 0, odu: 0, oru: 0 };
      let raycastHovered: NodeId = null;

      // Responsive camera framing so all 3 nodes stay visible and unclipped on every viewport
      function updateCameraFraming(width: number, height: number) {
        const aspect = Math.max(0.5, width / Math.max(1, height));
        camera.aspect = aspect;
        if (width < 640) {
          camera.fov = 44;
          camera.position.set(0, 1.0, 13.8);
        } else if (width < 1024) {
          camera.fov = 38;
          camera.position.set(0, 0.9, 12.2);
        } else {
          // Ensure horizontal span (-5.6 .. +5.6) fits comfortably even on narrower desktop splits
          const requiredZ = Math.max(10.6, 12.4 / Math.min(aspect, 2.6) * 1.95);
          camera.fov = 32;
          camera.position.set(0, 0.85, Math.min(13.6, requiredZ));
        }
        camera.lookAt(0, -0.05, 0);
        camera.updateProjectionMatrix();
      }

      updateCameraFraming(container.clientWidth, container.clientHeight);

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            renderer.setSize(width, height);
            updateCameraFraming(width, height);
          }
        }
      });
      resizeObserver.observe(container);

      // Pointer tracking for subtle parallax + raycasting (never prevents vertical scroll)
      function onPointerMove(event: PointerEvent) {
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
        pointer.set(nx, ny);
        parallaxTarget.x = Math.max(-1, Math.min(1, nx));
        parallaxTarget.y = Math.max(-1, Math.min(1, ny));

        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(hitTargets, false);
        const hitId = (hits[0]?.object?.userData?.nodeId as NodeId) ?? null;
        if (hitId !== raycastHovered) {
          raycastHovered = hitId;
          container.style.cursor = hitId ? 'pointer' : 'default';
          onHoverNodeRef.current(hitId);
        }
      }

      function onPointerLeave() {
        parallaxTarget.x = 0;
        parallaxTarget.y = 0;
        if (raycastHovered !== null) {
          raycastHovered = null;
          if (container) container.style.cursor = 'default';
          onHoverNodeRef.current(null);
        }
      }

      container.addEventListener('pointermove', onPointerMove, { passive: true });
      container.addEventListener('pointerleave', onPointerLeave, { passive: true });

      // Pause rAF render loop when hero section is scrolled out of view
      let isVisible = true;
      let rafId = 0;
      let lastTime = performance.now();
      let elapsed = 0;

      const intersectionObserver = new IntersectionObserver(
        (entries) => {
          const visible = entries[0]?.isIntersecting ?? true;
          if (visible && !isVisible) {
            isVisible = true;
            lastTime = performance.now();
            rafId = requestAnimationFrame(animate);
          } else if (!visible && isVisible) {
            isVisible = false;
            cancelAnimationFrame(rafId);
          }
        },
        { threshold: 0.02 },
      );
      intersectionObserver.observe(container);

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      function applyNodeTransform(
        node: HardwareNodeHandle,
        rise: number,
        hoverVal: number,
        timeSec: number,
        phaseOffset: number,
      ) {
        const clamped = Math.max(0, Math.min(1, rise));
        const idleFloat = prefersReducedMotion ? 0 : Math.sin(timeSec * 1.35 + phaseOffset) * 0.035 * clamped;
        node.group.position.y = node.baseY - (1 - clamped) * 1.45 + hoverVal * 0.16 + idleFloat;
        const s = 0.72 + 0.28 * clamped + hoverVal * 0.035;
        node.group.scale.setScalar(s);
        node.group.visible = clamped > 0.01;
      }

      function animate(now: number) {
        if (!isVisible) return;
        rafId = requestAnimationFrame(animate);

        const delta = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;
        elapsed += delta;
        const st = animStateRef.current;

        // Smooth mouse parallax damping
        if (!prefersReducedMotion) {
          parallaxCurrent.x += (parallaxTarget.x - parallaxCurrent.x) * 0.06;
          parallaxCurrent.y += (parallaxTarget.y - parallaxCurrent.y) * 0.06;
          stageGroup.rotation.y = parallaxCurrent.x * 0.065;
          stageGroup.rotation.x = -parallaxCurrent.y * 0.035;
        }

        // Update grid fade
        gridMaterials.forEach((m) => {
          m.opacity = st.gridOpacity * 0.42;
        });

        // Smooth hover transitions
        const activeHover = hoveredNodeRef.current;
        const neoHover = neoRuHoveredRef.current;
        const targetOcu = activeHover === 'ocu' ? 1 : 0;
        const targetOdu = activeHover === 'odu' ? 1 : 0;
        const targetOru = activeHover === 'oru' || neoHover ? 1 : 0;

        hoverLerp.ocu += (targetOcu - hoverLerp.ocu) * 0.12;
        hoverLerp.odu += (targetOdu - hoverLerp.odu) * 0.12;
        hoverLerp.oru += (targetOru - hoverLerp.oru) * 0.12;

        // Update hardware node positions, scales, LEDs, and lights
        applyNodeTransform(ocu, st.ocuRise, hoverLerp.ocu, elapsed, 0);
        applyNodeTransform(odu, st.oduRise, hoverLerp.odu, elapsed, 1.4);
        applyNodeTransform(oru, st.oruRise, hoverLerp.oru, elapsed, 2.8);

        ocu.update(elapsed, delta, st.ocuPower, hoverLerp.ocu);
        odu.update(elapsed, delta, st.oduPower, hoverLerp.odu);

        oru.setRfWaveBoost(neoHover ? 0.85 : 0);
        oru.rimLight.intensity = (st.oruSpotlight * 2.4 + (neoHover ? 1.8 : 0)) * st.oruPower;
        oru.update(elapsed, delta, st.oruPower, hoverLerp.oru);

        // Update optical conduits & bidirectional data packets
        links.midhaulProgress.value = st.midhaulProgress;
        links.fronthaulProgress.value = st.fronthaulProgress;
        links.flowActive.value = prefersReducedMotion ? 0 : st.flowActive;
        links.update(elapsed, activeHover, neoHover);

        renderer.render(scene, camera);
      }

      rafId = requestAnimationFrame(animate);

      // Thorough cleanup on unmount (zero WebGL memory leaks)
      return () => {
        isVisible = false;
        cancelAnimationFrame(rafId);
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
        container.removeEventListener('pointermove', onPointerMove);
        container.removeEventListener('pointerleave', onPointerLeave);

        scene.traverse((obj) => {
          if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) {
            obj.geometry?.dispose();
            const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
            mats.forEach((mat) => mat?.dispose());
          }
        });
        renderer.dispose();
        if (renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
      };
    }, []);

    return (
      <div
        ref={containerRef}
        className="oran-canvas-host"
        aria-label="Interactive 3D visualization of O-RAN 7.2 Split connecting O-CU, O-DU, and O-RU"
      />
    );
  },
);
