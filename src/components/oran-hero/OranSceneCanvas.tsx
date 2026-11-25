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
import {
  createOpticalLinks,
  type ResizableOpticalLinksHandle,
} from './models/createOpticalLinks';
import type {
  HardwareNodeHandle,
  NodeId,
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

export interface ProjectedAnchors {
  ocuX: number;
  oduX: number;
  oruX: number;
  f1X: number;
  ofhX: number;
  lineY: number;
}

export interface OranSceneHandle {
  animState: SceneAnimState;
}

interface OranSceneCanvasProps {
  hoveredNode: NodeId;
  neoRuHovered: boolean;
  onHoverNode: (node: NodeId) => void;
  onAnchorsChange?: (anchors: ProjectedAnchors) => void;
  onReady?: () => void;
}

const DEFAULT_SPAN = 4.5;

export const OranSceneCanvas = forwardRef<OranSceneHandle, OranSceneCanvasProps>(
  function OranSceneCanvas(
    { hoveredNode, neoRuHovered, onHoverNode, onAnchorsChange, onReady },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const hoveredNodeRef = useRef<NodeId>(hoveredNode);
    const neoRuHoveredRef = useRef<boolean>(neoRuHovered);
    const onHoverNodeRef = useRef(onHoverNode);
    const onAnchorsChangeRef = useRef(onAnchorsChange);
    const onReadyRef = useRef(onReady);

    hoveredNodeRef.current = hoveredNode;
    neoRuHoveredRef.current = neoRuHovered;
    onHoverNodeRef.current = onHoverNode;
    onAnchorsChangeRef.current = onAnchorsChange;
    onReadyRef.current = onReady;

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

      const camera = new THREE.PerspectiveCamera(
        29,
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

      // Soft studio lighting
      const hemiLight = new THREE.HemisphereLight(0xffffff, 0xdbe4f0, 1.4);
      hemiLight.position.set(0, 10, 0);
      scene.add(hemiLight);

      const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
      keyLight.position.set(4, 8, 7);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 24;
      keyLight.shadow.camera.left = -9;
      keyLight.shadow.camera.right = 9;
      keyLight.shadow.camera.top = 5;
      keyLight.shadow.camera.bottom = -5;
      keyLight.shadow.bias = -0.0005;
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.8);
      fillLight.position.set(-6, 4, 5);
      scene.add(fillLight);

      // Stage root group for gentle mouse parallax
      const stageGroup = new THREE.Group();
      scene.add(stageGroup);

      // Subtle perspective tech grid beneath the hardware stage
      const gridHelper = new THREE.GridHelper(22, 32, 0xcbd5e1, 0xe2e8f0);
      gridHelper.position.set(0, -1.26, 0);
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
        new THREE.PlaneGeometry(22, 8),
        new THREE.ShadowMaterial({ opacity: 0.08 }),
      );
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.position.y = -1.25;
      shadowPlane.receiveShadow = true;
      stageGroup.add(shadowPlane);

      // Build procedural hardware nodes & uniform optical conduits
      const ocu: HardwareNodeHandle = createOCU(new THREE.Vector3(-DEFAULT_SPAN, 0.04, 0));
      const odu: HardwareNodeHandle = createODU(new THREE.Vector3(0, -0.14, 0));
      const oru: OranORUHandle = createORU(new THREE.Vector3(DEFAULT_SPAN, 0.04, 0));
      const links: ResizableOpticalLinksHandle = createOpticalLinks(
        ocu.group.position,
        odu.group.position,
        oru.group.position,
      );

      stageGroup.add(ocu.group, odu.group, oru.group, links.group);

      const hitTargets = [ocu.hitTarget, odu.hitTarget, oru.hitTarget];
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2(99, 99);
      const parallaxTarget = { x: 0, y: 0 };
      const parallaxCurrent = { x: 0, y: 0 };

      const hoverLerp = { ocu: 0, odu: 0, oru: 0 };
      let raycastHovered: NodeId = null;

      function projectXPercent(worldX: number, worldY: number): number {
        const v = new THREE.Vector3(worldX, worldY, 0.06).project(camera);
        return ((v.x + 1) / 2) * 100;
      }

      function projectYPercent(worldX: number, worldY: number): number {
        const v = new THREE.Vector3(worldX, worldY, 0.06).project(camera);
        return ((1 - v.y) / 2) * 100;
      }

      /**
       * Frames the camera tightly so devices are large and sit cleanly at 1/6, 1/2, 5/6
       * of the stage width, with optical link pills centered cleanly in the open gaps.
       */
      function updateCameraAndSpan(width: number, height: number) {
        const aspect = Math.max(0.6, width / Math.max(1, height));
        camera.aspect = aspect;

        // Tight vertical framing (~3.8–4.4 world units tall) so devices fill the stage boldly
        const camFov = width < 900 ? 32 : 28;
        const camZ = width < 900 ? 9.6 : 8.1;
        camera.fov = camFov;
        camera.position.set(0, 0.52, camZ);
        camera.lookAt(0, -0.02, 0);
        camera.updateProjectionMatrix();
        camera.updateMatrixWorld();

        // Compute visible half-width at z = 0 and place O-CU / O-RU right at 1/6 & 5/6
        const halfH = Math.tan(THREE.MathUtils.degToRad(camFov / 2)) * camZ;
        const halfW = halfH * aspect;
        const targetSpan = Math.max(3.35, Math.min(5.6, halfW * 0.6667));

        ocu.group.position.x = -targetSpan;
        odu.group.position.x = 0;
        oru.group.position.x = targetSpan;

        const conduitY = -0.08;
        links.updateSpan(-targetSpan, 0, targetSpan, conduitY);

        // Emit exact projected percentages so DOM badges & link pills never misalign
        const f1MidX = (-targetSpan + 0.68 + -1.15) * 0.5;
        const ofhMidX = (1.15 + targetSpan - 0.92) * 0.5;

        onAnchorsChangeRef.current?.({
          ocuX: projectXPercent(-targetSpan, 0),
          oduX: projectXPercent(0, 0),
          oruX: projectXPercent(targetSpan, 0),
          f1X: projectXPercent(f1MidX, conduitY),
          ofhX: projectXPercent(ofhMidX, conduitY),
          lineY: projectYPercent(0, conduitY),
        });
      }

      updateCameraAndSpan(container.clientWidth, container.clientHeight);

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            renderer.setSize(width, height);
            updateCameraAndSpan(width, height);
          }
        }
      });
      resizeObserver.observe(container);

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
        baseScale: number,
      ) {
        const clamped = Math.max(0, Math.min(1, rise));
        const idleFloat = prefersReducedMotion ? 0 : Math.sin(timeSec * 1.35 + phaseOffset) * 0.03 * clamped;
        node.group.position.y = node.baseY - (1 - clamped) * 1.35 + hoverVal * 0.14 + idleFloat;
        const s = baseScale * (0.74 + 0.26 * clamped + hoverVal * 0.035);
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

        if (!prefersReducedMotion) {
          parallaxCurrent.x += (parallaxTarget.x - parallaxCurrent.x) * 0.06;
          parallaxCurrent.y += (parallaxTarget.y - parallaxCurrent.y) * 0.06;
          stageGroup.rotation.y = parallaxCurrent.x * 0.05;
          stageGroup.rotation.x = -parallaxCurrent.y * 0.025;
        }

        gridMaterials.forEach((m) => {
          m.opacity = st.gridOpacity * 0.4;
        });

        const activeHover = hoveredNodeRef.current;
        const neoHover = neoRuHoveredRef.current;
        const targetOcu = activeHover === 'ocu' ? 1 : 0;
        const targetOdu = activeHover === 'odu' ? 1 : 0;
        const targetOru = activeHover === 'oru' || neoHover ? 1 : 0;

        hoverLerp.ocu += (targetOcu - hoverLerp.ocu) * 0.12;
        hoverLerp.odu += (targetOdu - hoverLerp.odu) * 0.12;
        hoverLerp.oru += (targetOru - hoverLerp.oru) * 0.12;

        applyNodeTransform(ocu, st.ocuRise, hoverLerp.ocu, elapsed, 0, 1.08);
        applyNodeTransform(odu, st.oduRise, hoverLerp.odu, elapsed, 1.4, 1.08);
        applyNodeTransform(oru, st.oruRise, hoverLerp.oru, elapsed, 2.8, 1.12);

        ocu.update(elapsed, delta, st.ocuPower, hoverLerp.ocu);
        odu.update(elapsed, delta, st.oduPower, hoverLerp.odu);

        oru.setRfWaveBoost(neoHover ? 0.85 : 0);
        oru.rimLight.intensity = (st.oruSpotlight * 2.5 + (neoHover ? 1.8 : 0)) * st.oruPower;
        oru.update(elapsed, delta, st.oruPower, hoverLerp.oru);

        links.midhaulProgress.value = st.midhaulProgress;
        links.fronthaulProgress.value = st.fronthaulProgress;
        links.flowActive.value = prefersReducedMotion ? 0 : st.flowActive;
        links.update(elapsed, activeHover, neoHover);

        renderer.render(scene, camera);
      }

      rafId = requestAnimationFrame(animate);
      onReadyRef.current?.();

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
        aria-label="Interactive 3D visualization of O-RAN with the 7.2x split connecting O-CU, O-DU, and O-RU"
      />
    );
  },
);
