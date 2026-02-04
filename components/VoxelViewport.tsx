import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Voxel } from '../types';

interface VoxelViewportProps {
  voxels: Voxel[];
  isMainnet: boolean;
}

const VoxelViewport: React.FC<VoxelViewportProps> = ({ voxels, isMainnet }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isMainnet ? 0x01060d : 0x010409);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 100;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Grid Helper
    const grid = new THREE.GridHelper(200, 20, 0x334155, 0x1e293b);
    grid.position.y = -50;
    scene.add(grid);

    // Points Material
    const geometry = new THREE.BufferGeometry();
    geometryRef.current = geometry;
    const material = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [isMainnet]);

  // Update Points when voxels change
  useEffect(() => {
    if (!geometryRef.current || voxels.length === 0) return;

    const positions = new Float32Array(voxels.length * 3);
    const colors = new Float32Array(voxels.length * 3);

    voxels.forEach((v, i) => {
      positions[i * 3] = v.x;
      positions[i * 3 + 1] = v.y;
      positions[i * 3 + 2] = v.z;

      const color = new THREE.Color(v.isPeerData ? 0x22d3ee : 0x10b981);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    });

    geometryRef.current.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometryRef.current.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometryRef.current.attributes.position.needsUpdate = true;
    geometryRef.current.attributes.color.needsUpdate = true;
  }, [voxels]);

  return (
    <div ref={containerRef} className="w-full h-full relative cursor-move">
      <div className="absolute top-4 right-4 pointer-events-none mono text-[9px] text-slate-500 bg-slate-900/40 p-3 rounded-lg border border-white/5 backdrop-blur-sm">
        <div className="text-emerald-500 font-black mb-1">VOXEL_ENGINE_V1</div>
        <div>RENDERED_POINTS: {voxels.length}</div>
        <div>TRIANGULATION: {isMainnet ? 'PRODUCTION' : 'BETA'}</div>
      </div>
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2 rounded-full border border-white/10 text-[9px] mono uppercase font-bold text-slate-400">
           <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Local_Source
        </div>
        <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2 rounded-full border border-white/10 text-[9px] mono uppercase font-bold text-slate-400">
           <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Mesh_Source
        </div>
      </div>
    </div>
  );
};

export default VoxelViewport;