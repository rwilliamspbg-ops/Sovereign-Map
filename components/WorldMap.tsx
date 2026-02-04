import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import { MeshNode, MapLayer } from '../types';
import { resolveLocation } from '../services/geminiService';

interface WorldMapProps {
  onCountrySelect: (country: { id: string; name: string }) => void;
  selectedId?: string;
  meshNodes?: MeshNode[];
  simulationOffset?: number;
  activeLayers?: MapLayer[];
  onNodeClick?: (nodeId: string) => void;
}

const WorldMap: React.FC<WorldMapProps> = ({ 
  onCountrySelect, 
  selectedId, 
  meshNodes = [], 
  simulationOffset = 0, 
  activeLayers = [],
  onNodeClick
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [worldData, setWorldData] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [coords, setCoords] = useState({ x: 0, y: 0, lat: 0, lng: 0 });
  const [hoveredCountry, setHoveredCountry] = useState<{ name: string; id: string } | null>(null);
  const [hoveredNode, setHoveredNode] = useState<MeshNode | null>(null);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{ lat: number; lng: number; name: string } | null>(null);
  
  const zoomRef = useRef<any>(null);

  // Load World Atlas data
  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(res => res.json())
      .then(data => {
        setWorldData(feature(data, data.objects.countries));
      })
      .catch(err => console.error("Failed to fetch world data:", err));
  }, []);

  // Robust sizing with ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const getProjectedNodes = (nodes: MeshNode[]) => {
    if (simulationOffset === 0) return nodes;
    return nodes.map(node => {
      const nodeIdx = parseInt(node.id.split('-')[1]) || 0;
      const driftLat = (node.predictedDrift?.lat || Math.sin(nodeIdx)) * (simulationOffset / 24) * 2;
      const driftLng = (node.predictedDrift?.lng || Math.cos(nodeIdx)) * (simulationOffset / 24) * 2;
      return {
        ...node,
        lat: node.lat + driftLat,
        lng: node.lng + driftLng,
        strength: Math.max(0.2, node.strength - (simulationOffset / 100))
      };
    });
  };

  useEffect(() => {
    if (!worldData || !svgRef.current || dimensions.width === 0 || dimensions.height === 0) return;
    
    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Definitions for tactical glows
    const defs = svg.append('defs');
    
    // Core Tactical Glow
    const blueGlow = defs.append('filter')
      .attr('id', 'tacticalGlow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    blueGlow.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'blur');
    blueGlow.append('feMerge').selectAll('feMergeNode')
      .data(['blur', 'SourceGraphic'])
      .enter().append('feMergeNode')
      .attr('in', d => d);

    const zoomGroup = svg.append('g').attr('class', 'zoom-container');
    const g = zoomGroup.append('g').attr('class', 'map-layer');
    const gridG = zoomGroup.append('g').attr('class', 'grid-layer');
    const meshG = zoomGroup.append('g').attr('class', 'mesh-layer');
    const searchG = zoomGroup.append('g').attr('class', 'search-layer');

    const projection = d3.geoMercator()
      .scale(width / 6.5)
      .translate([width / 2, height / 1.5]);
    const path = d3.geoPath().projection(projection);

    // Zoom and Pan Handling
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 15])
      .on('zoom', (e) => {
        zoomGroup.attr('transform', e.transform);
      });
    svg.call(zoom as any);
    zoomRef.current = { zoom, svg, projection };

    // Draw Graticule (Lat/Lng Grid)
    const graticule = d3.geoGraticule();
    gridG.append('path')
      .datum(graticule())
      .attr('d', path as any)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(59, 130, 246, 0.1)')
      .attr('stroke-width', 0.5);

    // Draw Countries
    const layers = Array.isArray(activeLayers) ? activeLayers : [];
    g.selectAll('path.country')
      .data((worldData as any).features)
      .enter()
      .append('path')
      .attr('class', 'country')
      .attr('d', path as any)
      .attr('fill', (d: any) => {
        if (layers.includes('RISK')) {
          const risk = (parseInt(d.id) % 10) / 10;
          return d3.interpolateReds(risk * 0.5);
        }
        return d.id === selectedId ? 'rgba(59, 130, 246, 0.3)' : 'rgba(30, 41, 59, 0.4)';
      })
      .attr('stroke', (d: any) => {
        if (d.id === selectedId) return '#60a5fa';
        return layers.includes('RISK') ? 'rgba(239, 68, 68, 0.4)' : 'rgba(59, 130, 246, 0.3)';
      })
      .attr('stroke-width', (d: any) => d.id === selectedId ? 1.5 : 0.7)
      .style('transition', 'fill 0.4s ease, stroke 0.4s ease')
      .style('cursor', 'crosshair')
      .on('mousemove', (e, d: any) => {
        const [mx, my] = d3.pointer(e, svgRef.current);
        const transform = d3.zoomTransform(svgRef.current!);
        const [targetX, targetY] = transform.invert([mx, my]);
        const [lng, lat] = projection.invert!([targetX, targetY]) || [0, 0];
        
        setCoords({ x: mx, y: my, lat, lng });
        setHoveredCountry({ name: d.properties.name, id: d.id });
      })
      .on('mouseleave', () => setHoveredCountry(null))
      .on('click', (e, d: any) => {
        e.stopPropagation();
        onCountrySelect({ id: d.id, name: d.properties.name });
      });

    // Mesh Layer Connections
    const projectedNodes = getProjectedNodes(meshNodes);
    
    if (layers.includes('MESH') && projectedNodes.length > 0) {
      const connections: [MeshNode, MeshNode][] = [];
      const threshold = 60; // Proximity for mesh linking
      for (let i = 0; i < projectedNodes.length; i++) {
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const dx = projectedNodes[i].lat - projectedNodes[j].lat;
          const dy = projectedNodes[i].lng - projectedNodes[j].lng;
          if (Math.sqrt(dx * dx + dy * dy) < threshold) connections.push([projectedNodes[i], projectedNodes[j]]);
        }
      }

      meshG.selectAll('line.mesh-edge')
        .data(connections)
        .enter()
        .append('line')
        .attr('x1', d => projection([d[0].lng, d[0].lat])![0])
        .attr('y1', d => projection([d[0].lng, d[0].lat])![1])
        .attr('x2', d => projection([d[1].lng, d[1].lat])![0])
        .attr('y2', d => projection([d[1].lng, d[1].lat])![1])
        .attr('stroke', d => (d[0].strength > 1.2 || d[1].strength > 1.2) ? 'rgba(255, 255, 255, 0.5)' : (simulationOffset > 0 ? 'rgba(251, 191, 36, 0.4)' : 'rgba(34, 211, 238, 0.3)'))
        .attr('stroke-width', d => (d[0].strength > 1.2 || d[1].strength > 1.2) ? 2 : 1)
        .attr('stroke-dasharray', '5,3');
    }

    // Node Markers
    if (layers.includes('ASSETS') || layers.includes('MESH')) {
      const nodes = meshG.selectAll('g.mesh-node')
        .data(projectedNodes)
        .enter()
        .append('g')
        .attr('class', 'mesh-node')
        .attr('transform', d => {
          const projected = projection([d.lng, d.lat]);
          return projected ? `translate(${projected[0]}, ${projected[1]})` : 'translate(0,0)';
        })
        .style('cursor', 'pointer')
        .on('mouseenter', (e, d) => setHoveredNode(d))
        .on('mouseleave', () => setHoveredNode(null))
        .on('click', (e, d) => {
          e.stopPropagation();
          onNodeClick?.(d.id);
        });

      nodes.append('circle')
        .attr('r', d => 10 * d.strength)
        .attr('class', 'pulse-bloom')
        .attr('fill', d => {
          if (d.strength > 1.2) return 'rgba(255, 255, 255, 0.3)';
          return simulationOffset > 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)';
        })
        .attr('filter', 'url(#tacticalGlow)');

      nodes.append('circle')
        .attr('r', d => (layers.includes('ASSETS') && d.classification === 'Infrastructure' ? 6 : 4) * Math.sqrt(d.strength))
        .attr('fill', d => {
          if (d.strength > 1.2) return '#ffffff'; // Highly active node
          if (simulationOffset > 0) return '#fbbf24';
          if (d.classification === 'Infrastructure') return '#f59e0b';
          if (d.classification === 'Logistics') return '#10b981';
          return '#06b6d4';
        })
        .style('stroke', 'rgba(255,255,255,0.4)')
        .style('stroke-width', 0.5)
        .style('transition', 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)');
    }

    // Search Result Marker
    if (searchResult) {
      const pos = projection([searchResult.lng, searchResult.lat]);
      if (pos) {
        const marker = searchG.append('g')
          .attr('transform', `translate(${pos[0]}, ${pos[1]})`);

        marker.append('circle')
          .attr('r', 25)
          .attr('class', 'animate-ping')
          .attr('fill', 'rgba(244, 63, 94, 0.2)');

        marker.append('circle')
          .attr('r', 6)
          .attr('fill', '#f43f5e')
          .attr('stroke', 'white')
          .attr('stroke-width', 2);

        marker.append('text')
          .attr('y', -15)
          .attr('text-anchor', 'middle')
          .attr('class', 'mono text-[10px] font-black fill-rose-500 uppercase tracking-widest')
          .text(`TARGET: ${searchResult.name}`);
      }
    }

  }, [worldData, selectedId, meshNodes, simulationOffset, activeLayers, dimensions, searchResult]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isSearching) return;
    
    setIsSearching(true);
    const result = await resolveLocation(searchQuery);
    setIsSearching(false);
    
    if (result && zoomRef.current) {
      setSearchResult(result);
      const { zoom, svg, projection } = zoomRef.current;
      const { width, height } = dimensions;
      
      const [x, y] = projection([result.lng, result.lat]);
      
      svg.transition()
        .duration(2000)
        .ease(d3.easeCubicInOut)
        .call(
          zoom.transform,
          d3.zoomIdentity
            .translate(width / 2, height / 2)
            .scale(8)
            .translate(-x, -y)
        );
    } else {
      alert("Spatial coordinates for location could not be verified.");
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-[#020617] overflow-hidden relative group">
      {/* Scanning Laser Line Effect */}
      <div className="scan-effect"></div>
      
      {/* Background Micro-Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }}></div>
      
      {/* Tactical Search Interface */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Geocode coordinate search..."
            className="w-full bg-slate-950/80 backdrop-blur-3xl border border-white/10 rounded-2xl py-3.5 pl-5 pr-20 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 shadow-2xl transition-all font-mono tracking-widest uppercase font-black"
          />
          <button 
            type="submit" 
            disabled={isSearching}
            className="absolute right-2 top-1.5 bottom-1.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSearching ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div> : 'Lock'}
          </button>
        </form>
      </div>
      
      <svg ref={svgRef} className="w-full h-full relative z-10" />
      
      {/* Precision Telemetry HUD Overlay */}
      <div className="absolute bottom-8 right-8 z-20 mono flex flex-col items-end gap-1.5 pointer-events-none">
        <div className="flex gap-6 text-[10px] font-black tracking-widest text-blue-400 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-md">
           <span>LAT_SCAN: {coords.lat.toFixed(6)}</span>
           <span>LNG_SCAN: {coords.lng.toFixed(6)}</span>
        </div>
        <div className="text-[7px] text-slate-500 uppercase tracking-widest font-bold">Synchronized: {new Date().toLocaleTimeString()}</div>
      </div>

      {/* Country Insight Tooltip */}
      {hoveredCountry && !hoveredNode && (
        <div 
          className="absolute pointer-events-none bg-slate-950/90 backdrop-blur-2xl border border-blue-500/40 p-4 rounded-2xl shadow-[0_0_40px_rgba(59,130,246,0.15)] z-50 flex flex-col gap-1.5 min-w-[220px] animate-in fade-in zoom-in-95 duration-200"
          style={{ left: Math.min(coords.x + 20, dimensions.width - 240), top: Math.min(coords.y + 20, dimensions.height - 120) }}
        >
          <div className="text-[9px] text-blue-500 mono font-black uppercase tracking-[0.4em] border-b border-blue-500/20 pb-2 mb-1 flex justify-between items-center">
             Sector_Lock
             <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          </div>
          <div className="text-sm font-black text-white uppercase tracking-tight">{hoveredCountry.name}</div>
          <div className="text-[9px] mono text-slate-400">Node Population: <span className="text-blue-400">{Math.floor(Math.random() * 24 + 1)} ACTIVE</span></div>
        </div>
      )}

      {/* Peer Node Tooltip */}
      {hoveredNode && (
        <div 
          className="absolute pointer-events-none bg-slate-950/95 backdrop-blur-3xl border border-amber-500/40 p-4 rounded-2xl shadow-2xl z-[60] flex flex-col gap-2 min-w-[240px] animate-in fade-in slide-in-from-bottom-3 duration-200"
          style={{ left: Math.min(coords.x + 20, dimensions.width - 260), top: Math.min(coords.y + 20, dimensions.height - 150) }}
        >
          <div className="text-[9px] text-amber-500 mono font-black uppercase tracking-[0.4em] border-b border-white/10 pb-2">Mesh_Auth_v5</div>
          <div className="flex justify-between items-center">
             <span className="text-[12px] text-white font-black mono tracking-wider">{hoveredNode.id.toUpperCase()}</span>
             <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded border border-emerald-500/30 font-black">ENCRYPTED</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-1 border-t border-white/5 pt-2">
             <div>
                <div className="text-[7px] text-slate-500 uppercase font-black">Cluster</div>
                <div className="text-[10px] text-slate-200 font-bold uppercase">{hoveredNode.classification || 'Stationary'}</div>
             </div>
             <div>
                <div className="text-[7px] text-slate-500 uppercase font-black">Signal</div>
                <div className="text-[10px] text-emerald-500 font-black">STRENGTH: {(hoveredNode.strength * 100).toFixed(0)}%</div>
             </div>
          </div>
          <div className="text-[7px] text-slate-600 italic mono mt-2">Click to optimize node strength</div>
        </div>
      )}
    </div>
  );
};

export default WorldMap;