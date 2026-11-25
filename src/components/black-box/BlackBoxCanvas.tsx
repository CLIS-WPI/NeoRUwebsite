import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  createBlackBoxORU,
  type BlackBoxAnimState,
} from './models/createBlackBoxORU';

export interface BlackBoxCanvasHandle {
  animState: BlackBoxAnimState;
}

interface BlackBoxCanvasProps {
  activeIndex: number | null;
  onReady?: () => void;
}

export const BlackBoxCanvas = forwardRef<BlackBoxCanvasHandle, BlackBoxCanvasProps>(
  function BlackBoxCanvas({ activeIndex, onReady }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const activeIndexRef = useRef<number | null>(activeIndex);
    const onReadyRef = useRef(onReady);

    activeIndexRef.current = activeIndex;
    onReadyRef.current = onReady;

    const animStateRef = useRef<BlackBoxAnimState>({
      seamGlow: 0,
      lidOpen: 0,
      coreGlow: 0,
      tetherProgress: 0,
      cameraTilt: 0,
      particlesFade: 1,
    });

    useImperativeHandle(ref, () => ({
      animState: animStateRef.current,
    }));

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const scene = new THREE.Scene();

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
      renderer.toneMappingExposure = 1.16;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      container.appendChild(renderer.domElement);

      // High-contrast studio PMREM RoomEnvironment so chamfered fins, nickel cans & brass bulkheads catch crisp highlights
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      const roomEnv = new RoomEnvironment();
      const envRT = pmremGenerator.fromScene(roomEnv, 0.035);
      scene.environment = envRT.texture;
      scene.environmentIntensity = 0.96;

      // Dramatic 3-point studio lighting (key, cool fill, crisp rim)
      const keyLight = new THREE.DirectionalLight(0xffffff, 1.95);
      keyLight.position.set(4.5, 7.5, 5.5);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 22;
      keyLight.shadow.camera.left = -5;
      keyLight.shadow.camera.right = 5;
      keyLight.shadow.camera.top = 5;
      keyLight.shadow.camera.bottom = -5;
      keyLight.shadow.bias = -0.0005;
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xdbeafe, 1.0);
      fillLight.position.set(-5.5, 4.2, 4.2);
      scene.add(fillLight);

      const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.55);
      rimLight.position.set(0, 4.8, -6.5);
      scene.add(rimLight);

      // Soft contact shadow plane
      const shadowPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(12, 8),
        new THREE.ShadowMaterial({ opacity: 0.1 }),
      );
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.position.y = -0.75;
      shadowPlane.receiveShadow = true;
      scene.add(shadowPlane);

      // Engineered O-RU Black Box assembly
      const stageRoot = new THREE.Group();
      scene.add(stageRoot);

      const oru = createBlackBoxORU();
      stageRoot.add(oru.group);

      let baseCamZ = 6.2;
      function updateCameraProjection(width: number, height: number) {
        const aspect = Math.max(0.65, width / Math.max(1, height));
        camera.aspect = aspect;
        if (width < 520) {
          camera.fov = 38;
          baseCamZ = 7.6;
        } else if (width < 760) {
          camera.fov = 35;
          baseCamZ = 6.9;
        } else {
          camera.fov = 33;
          baseCamZ = 6.2;
        }
        camera.updateProjectionMatrix();
      }
      updateCameraProjection(container.clientWidth, container.clientHeight);

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (width > 0 && height > 0) {
            renderer.setSize(width, height);
            updateCameraProjection(width, height);
          }
        }
      });
      resizeObserver.observe(container);

      // Subtle pointer parallax (never blocks vertical scrolling)
      const parallaxTarget = { x: 0, y: 0 };
      const parallaxCurrent = { x: 0, y: 0 };
      let nudgeXCurrent = 0;

      function onPointerMove(event: PointerEvent) {
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
        parallaxTarget.x = Math.max(-1, Math.min(1, nx));
        parallaxTarget.y = Math.max(-1, Math.min(1, ny));
      }

      function onPointerLeave() {
        parallaxTarget.x = 0;
        parallaxTarget.y = 0;
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

      function animate(now: number) {
        if (!isVisible) return;
        rafId = requestAnimationFrame(animate);

        const delta = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;
        elapsed += delta;

        const st = animStateRef.current;
        const active = activeIndexRef.current;

        // Gentle camera nudge toward the hovered capability card side
        const nudgeTarget = active === null ? 0 : active < 3 ? -0.45 : 0.45;
        nudgeXCurrent += (nudgeTarget - nudgeXCurrent) * 0.08;

        if (!prefersReducedMotion) {
          parallaxCurrent.x += (parallaxTarget.x - parallaxCurrent.x) * 0.06;
          parallaxCurrent.y += (parallaxTarget.y - parallaxCurrent.y) * 0.06;
          stageRoot.rotation.y = parallaxCurrent.x * 0.14;
          stageRoot.rotation.x = -parallaxCurrent.y * 0.07;
        }

        // Smoothly transition camera from moody frontal view into dramatic 3/4 top-down hero view
        const tilt = Math.max(0, Math.min(1, st.cameraTilt));
        const camY = 1.65 + tilt * 1.95;
        const camZ = baseCamZ - tilt * 0.45;
        camera.position.set(nudgeXCurrent, camY, camZ);
        camera.lookAt(0, 0.12 + tilt * 0.08, 0);

        oru.update(elapsed, st, active, prefersReducedMotion);
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
            mats.forEach((mat) => {
              if (!mat) return;
              if ('map' in mat && mat.map instanceof THREE.Texture) mat.map.dispose();
              if ('emissiveMap' in mat && mat.emissiveMap instanceof THREE.Texture) mat.emissiveMap.dispose();
              mat.dispose();
            });
          }
        });
        envRT.dispose();
        roomEnv.dispose();
        pmremGenerator.dispose();
        renderer.dispose();
        if (renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
      };
    }, []);

    return (
      <div
        ref={containerRef}
        className="bb-canvas-host"
        aria-label="Interactive 3D O-RU enclosure opening to reveal the programmable NeoRU core and 6 capabilities"
      />
    );
  },
);
