import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { MeshNode } from '../types';

interface NetworkGraphProps {
  nodes: MeshNode[];
  onNodeClick?: (id: string) => void;
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({ nodes, onNodeClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredNode, setHoveredNode] = useState<any>(null);

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

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0 || dimensions.width === 0) return;

    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create links based on proximity simulation for the topological view
    const links: any[] = [];
    nodes.forEach((node, i) => {
      // Connect each node to 1-3 nearest neighbors to simulate a mesh topology
      const neighbors = [...nodes]
        .filter(n => n.id !== node.id)
        .sort((a, b) => {
          const distA = Math.hypot(a.lat - node.lat, a.lng - node.lng);
          const distB = Math.hypot(b.lat - node.lat, b.lng - node.lng);
          return distA - distB;
        })
        .slice(0, Math.floor(Math.random() * 2) + 1);

      neighbors.forEach(neighbor => {
        links.push({ source: node.id, target: neighbor.id });
      });
    });

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(40));

    const g = svg.append("g");

    const link = g.append("g")
      .attr("stroke", "rgba(59, 130, 246, 0.2)")
      .attr("stroke-width", 1)
      .selectAll("line")
      .data(links)
      .join("line");

    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("class", "cursor-pointer")
      .on("mouseenter", (e, d: any) => setHoveredNode(d))
      .on("mouseleave", () => setHoveredNode(null))
      .on("click", (e, d: any) => onNodeClick?.(d.id))
      .call(d3.drag<any, any>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    node.append("circle")
      .attr("r", 15)
      .attr("fill", "rgba(59, 130, 246, 0.1)")
      .attr("stroke", d => (d as any).isVerified ? "rgba(34, 211, 238, 0.5)" : "rgba(59, 130, 246, 0.3)")
      .attr("stroke-width", 2);

    node.append("circle")
      .attr("r", 4)
      .attr("fill", d => (d as any).classification === 'Hub' ? "#f59e0b" : "#3b82f6")
      .attr("class", d => (d as any).strength > 1.2 ? "animate-pulse" : "");

    node.append("text")
      .attr("dy", 25)
      .attr("text-anchor", "middle")
      .attr("class", "mono text-[7px] font-black fill-slate-500 uppercase tracking-widest")
      .text((d: any) => d.id.split('-')[0]);

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom as any);

    return () => simulation.stop();
  }, [nodes, dimensions]);

  return (
    <div ref={containerRef} className="w-full h-full bg-[#020617] overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]" 
           style={{ backgroundImage: 'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
      
      <div className="absolute top-6 left-6 z-20 pointer-events-none">
        <div className="mono text-[10px] text-blue-500 font-black uppercase tracking-[0.4em] mb-1">Network_Topology_View</div>
        <div className="text-[8px] text-slate-500 mono uppercase tracking-widest">Logical Mesh Connectivity // No-Geo Mode</div>
      </div>

      <svg ref={svgRef} className="w-full h-full relative z-10" />

      {hoveredNode && (
        <div 
          className="absolute pointer-events-none bg-slate-950/95 backdrop-blur-3xl border border-blue-500/40 p-4 rounded-2xl shadow-2xl z-50 flex flex-col gap-2 min-w-[200px]"
          style={{ left: 20, bottom: 20 }}
        >
          <div className="text-[9px] text-blue-500 mono font-black uppercase tracking-[0.4em] border-b border-white/10 pb-2">Peer_Metadata</div>
          <div className="text-sm font-black text-white mono">{hoveredNode.id.toUpperCase()}</div>
          <div className="grid grid-cols-2 gap-2 text-[9px] mono">
            <span className="text-slate-500">TYPE:</span>
            <span className="text-slate-200">{hoveredNode.classification || 'Edge'}</span>
            <span className="text-slate-500">STRENGTH:</span>
            <span className="text-emerald-500">{(hoveredNode.strength * 100).toFixed(0)}%</span>
            <span className="text-slate-500">PEERS:</span>
            <span className="text-blue-400">ACTIVE</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkGraph;