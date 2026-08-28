import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2
} from 'lucide-react';
import { AIChatbotIcon } from '../common/AIChatbotIcon';
import type { Project } from '../../types/project';

interface Project3DIntelligenceProps {
  project: Project;
  documents: any[];
  selectedDocId?: string | null;
  highlightedDocIds?: string[];
  onSelectDoc?: (doc: any) => void;
  onOpenModal?: (doc: any) => void;
}

export const Project3DIntelligence: React.FC<Project3DIntelligenceProps> = ({
  project,
  documents,
  selectedDocId,
  highlightedDocIds = [],
  onSelectDoc,
  onOpenModal
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredDoc, setHoveredDoc] = useState<any | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isWebGLError, setIsWebGLError] = useState(false);

  // Status & Category Color Helper (Data Visualization Palette)
  const getStatusColorHex = (doc: any) => {
    const status = doc.processing_status?.toLowerCase();
    const type = doc.document_type || '';

    if (status === 'processing' || status === 'uploading') return 0x6366F1; // Indigo/Blue
    if (type === 'Energy Report') return 0xF97316; // Orange
    if (type === 'Water Report') return 0x06B6D4; // Cyan/Blue
    if (type === 'Waste Report') return 0x10B981; // Green
    if (type === 'Audit Report') return 0x8B5CF6; // Purple
    if (type === 'Compliance Document') return 0xEF4444; // Red

    const score = doc.compliance_score || 0;
    if (score >= 80) return 0x10B981;
    if (score >= 50) return 0xF97316;
    return 0xEF4444;
  };

  useEffect(() => {
    if (!mountRef.current || documents.length === 0) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight || 420;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setIsWebGLError(true);
        return;
      }
    } catch {
      setIsWebGLError(true);
      return;
    }

    // 1. Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 16);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xF97316, 2, 50);
    pointLight.position.set(0, 0, 10);
    scene.add(pointLight);

    const secondaryOrangeLight = new THREE.PointLight(0xEA580C, 1.5, 50);
    secondaryOrangeLight.position.set(-10, 5, 5);
    scene.add(secondaryOrangeLight);

    // 3. Central Project Node (Glow Sphere)
    const centerGroup = new THREE.Group();
    const coreGeo = new THREE.SphereGeometry(1.6, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xF97316,
      emissive: 0xEA580C,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: false
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    centerGroup.add(coreMesh);

    // Outer Radial Compliance Rings
    const ringGeo = new THREE.RingGeometry(2.2, 2.35, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xF97316,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 3;
    centerGroup.add(ringMesh);

    const outerRingGeo = new THREE.RingGeometry(2.6, 2.7, 64);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0xF97316,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3
    });
    const outerRingMesh = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRingMesh.rotation.x = -Math.PI / 4;
    centerGroup.add(outerRingMesh);

    scene.add(centerGroup);

    // 4. Background Particle Field
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 35;
      particlePositions[i + 1] = (Math.random() - 0.5) * 35;
      particlePositions[i + 2] = (Math.random() - 0.5) * 20 - 5;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xF97316,
      size: 0.08,
      transparent: true,
      opacity: 0.35
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 5. Connected Satellite Document Nodes
    const docNodes: { mesh: THREE.Mesh; docData: any; basePos: THREE.Vector3 }[] = [];
    const radius = 6.5;
    const count = documents.length;

    documents.forEach((doc, idx) => {
      const angle = (idx / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * (radius * 0.65);
      const z = (Math.sin(angle * 2) * 1.5);

      const colorHex = getStatusColorHex(doc);

      const isSelected = selectedDocId === doc._id;
      const isHighlighted = highlightedDocIds.includes(doc._id);

      const nodeSize = isSelected || isHighlighted ? 0.95 : 0.75;
      const docGeo = new THREE.SphereGeometry(nodeSize, 24, 24);
      const docMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: colorHex,
        emissiveIntensity: isSelected || isHighlighted ? 0.8 : 0.4,
        roughness: 0.3,
        metalness: 0.7
      });
      const docMesh = new THREE.Mesh(docGeo, docMat);
      docMesh.position.set(x, y, z);
      docMesh.userData = { doc };
      scene.add(docMesh);

      // Energy beam lines to center
      const lineMat = new THREE.LineBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: isSelected || isHighlighted ? 0.8 : 0.25,
        linewidth: 2
      });
      const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(x, y, z)];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeo, lineMat);
      scene.add(line);

      docNodes.push({ mesh: docMesh, docData: doc, basePos: new THREE.Vector3(x, y, z) });
    });

    // 6. Raycasting & Mouse Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = (event: MouseEvent) => {
      if (!mountRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(docNodes.map(n => n.mesh));

      if (intersects.length > 0) {
        const hitDoc = intersects[0].object.userData.doc;
        setHoveredDoc(hitDoc);
        setTooltipPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
        mountRef.current.style.cursor = 'pointer';
      } else {
        setHoveredDoc(null);
        mountRef.current.style.cursor = 'default';
      }
    };

    const handleClick = (event: MouseEvent) => {
      if (!mountRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(docNodes.map(n => n.mesh));

      if (intersects.length > 0) {
        const hitDoc = intersects[0].object.userData.doc;
        onSelectDoc?.(hitDoc);
        onOpenModal?.(hitDoc);
      }
    };

    const container = mountRef.current;
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('click', handleClick);

    // 7. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Rotate center core
      centerGroup.rotation.y = elapsedTime * 0.2;
      ringMesh.rotation.z = elapsedTime * 0.15;
      outerRingMesh.rotation.z = -elapsedTime * 0.25;

      // Orbit particles softly
      particles.rotation.y = elapsedTime * 0.03;

      // Pulse & float satellite document nodes
      docNodes.forEach((node, idx) => {
        const pulse = Math.sin(elapsedTime * 2 + idx) * 0.12;
        node.mesh.position.y = node.basePos.y + pulse;
        node.mesh.rotation.y += 0.01;
      });

      renderer.render(scene, camera);
    };

    animate();

    // 8. Handle Resize & Cleanup
    const handleResize = () => {
      if (!mountRef.current) return;
      const newW = mountRef.current.clientWidth;
      const newH = mountRef.current.clientHeight || 420;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
      if (renderer.domElement && mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [documents, selectedDocId, highlightedDocIds]);

  return (
    <div className="relative bg-card-base/80 backdrop-blur-2xl border border-border-base rounded-3xl p-6 shadow-2xl space-y-4 overflow-hidden">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/[0.06] dark:border-white/[0.08] pb-4">
        <div className="flex items-center gap-3">
          <AIChatbotIcon size="md" animated />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-tight text-text-main font-display">
                3D Project Intelligence Network
              </h3>
              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest">
                Interactive Canvas
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Live document topology mapping project hierarchy, IGBC status & compliance metrics.
            </p>
          </div>
        </div>

        {/* Category Visualization Legend */}
        <div className="flex flex-wrap items-center gap-2.5 text-[10px] font-bold text-text-muted bg-black/[0.03] dark:bg-white/[0.05] px-3 py-1.5 rounded-xl border border-black/[0.04] dark:border-white/10 shrink-0">
          <span className="flex items-center gap-1 text-orange-500">
            <span className="w-2 h-2 rounded-full bg-orange-500" /> Energy
          </span>
          <span className="flex items-center gap-1 text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400" /> Water
          </span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Waste
          </span>
          <span className="flex items-center gap-1 text-purple-400">
            <span className="w-2 h-2 rounded-full bg-purple-400" /> Audit
          </span>
          <span className="flex items-center gap-1 text-rose-500">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Compliance
          </span>
        </div>
      </div>

      {/* Main 3D Canvas / Fallback Area */}
      {isWebGLError || documents.length === 0 ? (
        /* Fallback 2D Topology Network */
        <div className="relative h-[380px] rounded-2xl bg-neutral-950/60 border border-white/10 p-6 flex flex-col items-center justify-center overflow-hidden">
          <div className="relative z-10 flex flex-col items-center text-center space-y-4 max-w-md">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 p-1 shadow-xl shadow-primary/20 animate-spin-slow">
              <div className="w-full h-full bg-neutral-950 rounded-full flex items-center justify-center">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                {project.name}
              </h4>
              <p className="text-xs text-text-muted mt-1">
                {documents.length} Uploaded Documents linked to project command core
              </p>
            </div>

            {/* 2D Document Nodes Grid */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {documents.map((doc) => {
                const type = doc.document_type || '';
                const isSelected = selectedDocId === doc._id;
                const isHighlighted = highlightedDocIds.includes(doc._id);
                const dotColor = type === 'Water Report' ? 'bg-cyan-400' : type === 'Waste Report' ? 'bg-emerald-400' : type === 'Audit Report' ? 'bg-purple-400' : type === 'Compliance Document' ? 'bg-rose-500' : 'bg-orange-500';
                return (
                  <button
                    key={doc._id}
                    onClick={() => {
                      onSelectDoc?.(doc);
                      onOpenModal?.(doc);
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      isSelected || isHighlighted
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30 scale-105'
                        : 'bg-white/10 text-white border-white/15 hover:bg-white/20'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                    <span className="truncate max-w-[120px]">{doc.filename}</span>
                    <span className="text-[10px] opacity-80">{doc.compliance_score || 0}%</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* 3D Canvas Mount Point */
        <div ref={mountRef} className="relative w-full h-[400px] rounded-2xl bg-neutral-950/70 border border-black/10 dark:border-white/10 overflow-hidden cursor-grab active:cursor-grabbing">
          {/* Central Project Identity Tag */}
          <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 pointer-events-none">
            <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-wider block">
              Central Node ({project.project_id})
            </span>
            <span className="text-xs font-extrabold text-white font-display">
              {project.name}
            </span>
          </div>

          {/* Interactive Hover Tooltip */}
          <AnimatePresence>
            {hoveredDoc && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 5 }}
                style={{
                  position: 'absolute',
                  left: Math.min(tooltipPos.x + 15, mountRef.current?.clientWidth! - 220),
                  top: Math.max(tooltipPos.y - 80, 15),
                  pointerEvents: 'none'
                }}
                className="z-30 w-52 p-3 rounded-2xl bg-neutral-900/95 backdrop-blur-xl border border-white/20 text-white shadow-2xl"
              >
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2 mb-2">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider truncate">
                    {hoveredDoc.document_type || 'Document'}
                  </span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                    {hoveredDoc.compliance_score || 0}% Score
                  </span>
                </div>
                <h5 className="text-xs font-bold truncate mb-1" title={hoveredDoc.filename}>
                  {hoveredDoc.filename}
                </h5>
                <div className="flex items-center justify-between text-[10px] text-neutral-400">
                  <span>Passed: <strong className="text-primary">{hoveredDoc.passed_checks || 0}</strong></span>
                  <span>Failed: <strong className="text-orange-300">{hoveredDoc.failed_checks || 0}</strong></span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
