import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';

export const Building3DVisual: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const [hasWebGLError, setHasWebGLError] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    // Check WebGL context support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGLError(true);
        return;
      }
    } catch {
      setHasWebGLError(true);
      return;
    }

    const container = mountRef.current;
    let width = container.clientWidth || 400;
    let height = container.clientHeight || 280;

    // Scene, Camera, Renderer setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(18, 14, 22);
    camera.lookAt(0, 4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Color definitions based on active theme
    const isDark = theme === 'dark';
    const wireframeColor = isDark ? 0x384152 : 0x94A3B8;
    const windowOrangeColor = 0xF97316;
    const windowOrangeEmissive = 0xEA580C;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.3 : 0.7);
    scene.add(ambientLight);

    const orangePointLight = new THREE.PointLight(0xF97316, isDark ? 3 : 2, 40);
    orangePointLight.position.set(5, 10, 8);
    scene.add(orangePointLight);

    const secondaryLight = new THREE.PointLight(0xFB923C, isDark ? 1.5 : 1, 30);
    secondaryLight.position.set(-10, 8, -5);
    scene.add(secondaryLight);

    // Group to hold all building structures
    const cityGroup = new THREE.Group();
    scene.add(cityGroup);

    // Building definitions (width, height, depth, x, z)
    const buildingConfigs = [
      { w: 3.5, h: 12, d: 3.5, x: 0, z: 0 },      // Main tower
      { w: 2.8, h: 9.5, d: 2.8, x: -4.2, z: 1 },  // Left tower
      { w: 3.0, h: 8.0, d: 3.0, x: 4.0, z: -1 },  // Right tower
      { w: 2.2, h: 6.5, d: 2.2, x: 2.5, z: 3.5 },  // Front right tower
      { w: 2.5, h: 5.5, d: 2.5, x: -3.0, z: -3.5 },// Rear left building
      { w: 4.0, h: 4.0, d: 2.5, x: 1.0, z: -4.5 }, // Low rise rear center
      { w: 2.0, h: 7.2, d: 2.0, x: -1.5, z: 4.0 }, // Front center left tower
    ];

    const windowMaterials: THREE.MeshStandardMaterial[] = [];

    buildingConfigs.forEach((cfg) => {
      // 1. Building Solid Base Mesh
      const bGeo = new THREE.BoxGeometry(cfg.w, cfg.h, cfg.d);
      const bMat = new THREE.MeshStandardMaterial({
        color: isDark ? 0x090B10 : 0xF1F5F9,
        transparent: true,
        opacity: isDark ? 0.75 : 0.85,
        roughness: 0.4,
        metalness: 0.8,
      });
      const bMesh = new THREE.Mesh(bGeo, bMat);
      bMesh.position.set(cfg.x, cfg.h / 2, cfg.z);
      cityGroup.add(bMesh);

      // 2. Wireframe Edges
      const edgesGeo = new THREE.EdgesGeometry(bGeo);
      const lineMat = new THREE.LineBasicMaterial({
        color: wireframeColor,
        transparent: true,
        opacity: isDark ? 0.6 : 0.45,
      });
      const wireframe = new THREE.LineSegments(edgesGeo, lineMat);
      wireframe.position.copy(bMesh.position);
      cityGroup.add(wireframe);

      // 3. Orange Illuminated Windows
      const floors = Math.floor(cfg.h / 1.2);
      const windowsPerFloor = Math.floor(cfg.w / 0.9);

      for (let f = 1; f < floors; f++) {
        for (let w = 0; w < windowsPerFloor; w++) {
          // Semi-random window illumination pattern
          if ((f * 3 + w * 7 + Math.floor(cfg.x * 2)) % 3 === 0) {
            const winW = 0.35;
            const winH = 0.45;
            const winGeo = new THREE.PlaneGeometry(winW, winH);
            const isBright = (f + w) % 2 === 0;

            const winMat = new THREE.MeshStandardMaterial({
              color: windowOrangeColor,
              emissive: windowOrangeEmissive,
              emissiveIntensity: isBright ? 0.9 : 0.5,
              roughness: 0.2,
              side: THREE.DoubleSide,
            });
            windowMaterials.push(winMat);

            const winMesh = new THREE.Mesh(winGeo, winMat);
            // Place window slightly offset on building facade
            const yPos = f * 1.1 + 0.3;
            const xPos = cfg.x + (w - (windowsPerFloor - 1) / 2) * 0.7;
            const zPos = cfg.z + cfg.d / 2 + 0.02;

            winMesh.position.set(xPos, yPos, zPos);
            cityGroup.add(winMesh);
          }
        }
      }
    });

    // 4. Subtle Ground Grid Base
    const gridHelper = new THREE.GridHelper(30, 15, isDark ? 0xF97316 : 0xEA580C, isDark ? 0x1E293B : 0xE2E8F0);
    gridHelper.position.y = 0;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = isDark ? 0.25 : 0.15;
    cityGroup.add(gridHelper);

    // 5. Floating Ambient Energy Particles (Green/Orange sustainability data points)
    const particleCount = 40;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const particleSpeeds: number[] = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = Math.random() * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      particleSpeeds.push(0.01 + Math.random() * 0.02);
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xF97316,
      size: 0.25,
      transparent: true,
      opacity: 0.7,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    cityGroup.add(particleSystem);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle floating/rotating city motion
      cityGroup.rotation.y = Math.sin(elapsedTime * 0.15) * 0.1 + 0.3;
      cityGroup.position.y = Math.sin(elapsedTime * 0.5) * 0.15;

      // Animate floating energy particles
      const posArr = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        posArr[i * 3 + 1] += particleSpeeds[i];
        if (posArr[i * 3 + 1] > 15) {
          posArr[i * 3 + 1] = 0;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Handle container resize
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 400;
      height = container.clientHeight || 280;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [theme]);

  if (hasWebGLError) {
    // Fallback vector wireframe architectural graphic when WebGL is unavailable
    return (
      <div className="w-full h-full flex items-center justify-center p-4 opacity-40 select-none pointer-events-none">
        <svg viewBox="0 0 300 200" className="w-full h-full max-h-56 text-orange-500 stroke-current fill-none">
          <path d="M 50 170 L 50 70 L 110 40 L 110 170 Z" strokeWidth="1.5" className="stroke-text-muted" />
          <path d="M 110 170 L 110 30 L 180 10 L 180 170 Z" strokeWidth="1.5" className="stroke-orange-500" />
          <path d="M 180 170 L 180 80 L 240 60 L 240 170 Z" strokeWidth="1.5" className="stroke-text-muted" />
          <line x1="20" y1="170" x2="280" y2="170" strokeWidth="2" className="stroke-orange-500/50" />
          {/* Illuminated windows */}
          <rect x="125" y="45" width="12" height="16" className="fill-orange-500/80 stroke-none" />
          <rect x="150" y="45" width="12" height="16" className="fill-orange-500/60 stroke-none" />
          <rect x="125" y="75" width="12" height="16" className="fill-orange-500/90 stroke-none" />
          <rect x="150" y="105" width="12" height="16" className="fill-orange-500/70 stroke-none" />
        </svg>
      </div>
    );
  }

  return <div ref={mountRef} className="w-full h-full select-none pointer-events-none opacity-80 hover:opacity-100 transition-opacity duration-500" />;
};

export default Building3DVisual;
