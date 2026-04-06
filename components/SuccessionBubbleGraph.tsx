"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { LineageNode } from '@/utils/lineageTreeBuilder';

export interface SuccessionBubbleGraphProps {
  rootId: string;
  nodesRecord: Record<string, LineageNode>;
  onNodeClick?: (nodeId: string) => void;
  searchFocusId?: string | null;
  filterLevel?: number; // e.g. 4=All, 2=Leaders only
}

// Internal D3 Graph types
interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  data: LineageNode;
  isExpanded: boolean;
  canExpand: boolean;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  source: SimNode | string;
  target: SimNode | string;
}

export default function SuccessionBubbleGraph({ rootId, nodesRecord, onNodeClick, searchFocusId, filterLevel = 4 }: SuccessionBubbleGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  // State: Which nodes are currently open (expanded)?
  // Initially, only the root is open.
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set([rootId]));
  
  // We keep a ref to the zoom behavior to programmatically zoom during search
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const svgSelectionRef = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>(null);

  // Compute Active Geometry and Graph based on expandedNodes
  const { activeNodes, activeLinks } = useMemo(() => {
    const nodes: SimNode[] = [];
    const links: SimLink[] = [];
    const addedIds = new Set<string>();

    const traverse = (currentId: string, depth: number) => {
      if (addedIds.has(currentId)) return;
      const nodeData = nodesRecord[currentId];
      if (!nodeData) return;

      // Filter logic: if node > filterLevel (except Root), don't show it
      if (currentId !== rootId && nodeData.roleLevel > filterLevel) {
        return; 
      }

      addedIds.add(currentId);
      
      const isExpanded = expandedNodes.has(currentId);
      const originalChildren = nodeData.childrenIds || [];
      const visibleChildren = originalChildren.filter(cid => {
         const c = nodesRecord[cid];
         return c && c.roleLevel <= filterLevel;
      });
      
      const canExpand = visibleChildren.length > 0;

      nodes.push({
        id: currentId,
        data: nodeData,
        isExpanded,
        canExpand,
        x: undefined, 
        y: undefined,
      });

      if (isExpanded && canExpand) {
        visibleChildren.forEach(childId => {
          // Link Current -> Child
          links.push({
            source: currentId,
            target: childId
          });
          traverse(childId, depth + 1);
        });
      }
    };

    traverse(rootId, 0);

    return { activeNodes: nodes, activeLinks: links };
  }, [expandedNodes, nodesRecord, rootId, filterLevel]);

  // Handle Search Focus
  useEffect(() => {
    if (!searchFocusId || !svgSelectionRef.current || !zoomRef.current || !containerRef.current) return;
    
    // We need to auto-expand all parents up to searchFocusId
    // Since we don't have a direct parent array, we can find the path.
    const findPathToRoot = (target: string): string[] => {
      const path: string[] = [];
      let curr = target;
      while (curr !== rootId) {
        // Find who has 'curr' in childrenIds
        const parent = Object.values(nodesRecord).find(n => n.childrenIds?.includes(curr));
        if (!parent) break;
        curr = parent.id;
        path.unshift(curr);
      }
      return path;
    };

    const path = findPathToRoot(searchFocusId);
    if (path.length > 0) {
      setExpandedNodes(prev => {
        const next = new Set(prev);
        path.forEach(id => next.add(id));
        return next;
      });
    }

    // Delay the zoom slightly to let D3 nodes generate
    setTimeout(() => {
      // It's tricky to zoom to a force-directed node immediately because it hasn't settled.
      // We will add a highlight tag to it inside D3 tick.
    }, 500);

  }, [searchFocusId, rootId, nodesRecord]);


  // D3 Setup & Execution
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height]);
    svg.selectAll("*").remove(); 

    const g = svg.append("g");
    
    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (e) => {
        g.attr("transform", e.transform);
      });
    
    svg.call(zoom);
    zoomRef.current = zoom;
    svgSelectionRef.current = svg;

    // Center root initially
    svg.call(zoom.translateTo, width / 2, height / 2);

    // Forces
    const simulation = d3.forceSimulation<SimNode>(activeNodes)
      .force("link", d3.forceLink<SimNode, SimLink>(activeLinks).id(d => d.id).distance(80))
      .force("charge", d3.forceManyBody<SimNode>().strength((d) => d.data.isLeader ? -600 : -150))
      .force("collide", d3.forceCollide<SimNode>().radius(d => d.data.id === rootId ? 50 : (d.data.isLeader ? 35 : 20)).iterations(2))
      .force("x", d3.forceX(width / 2).strength(0.02))
      .force("y", d3.forceY(height / 2).strength(0.02));

    // Draw Links
    const link = g.append("g")
      .attr("stroke", "#d6d3d1")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(activeLinks)
      .join("line")
      .attr("stroke-width", d => {
        // Thicker link from Root
        return (typeof d.source === 'object' && d.source.id === rootId) ? 3 : 1.5;
      });

    // Draw Nodes
    const node = g.append("g")
      .selectAll("g")
      .data(activeNodes, (d: any) => d.id)
      .join("g")
      .style("cursor", d => d.canExpand ? "pointer" : "grab")
      .call(drag(simulation) as any);

    // Events
    node.on("click", (event, d) => {
      // Stop drag propagating to click
      if (event.defaultPrevented) return;
      
      if (onNodeClick) onNodeClick(d.id);

      if (d.canExpand) {
        setExpandedNodes(prev => {
          const next = new Set(prev);
          if (next.has(d.id)) {
            next.delete(d.id); // Collapse
          } else {
            next.add(d.id); // Expand
          }
          return next;
        });
      }
    });

    // Bubble formatting
    node.append("circle")
      .attr("r", d => d.id === rootId ? 40 : (d.data.isLeader ? 30 : 15))
      // Highlight: Role <= 2 gets Orange (Amber), Members get dark grey. Root gets Red.
      .attr("fill", d => {
        if (d.id === rootId) return '#ea580c'; // Tailwind orange-600
        if (d.data.isLeader) return '#f59e0b'; // Tailwind amber-500
        return '#404040'; // neutral-700
      })
      // Stroke: Glowing if expanded or has children
      .attr("stroke", d => {
        if (d.id === searchFocusId) return '#10b981'; // Emerald glow for search
        if (d.isExpanded) return '#fff';
        return d.data.isLeader ? '#fde68a' : '#525252';
      })
      .attr("stroke-width", d => (d.id === searchFocusId ? 4 : (d.isExpanded ? 3 : 1)))
      .attr("class", "transition-all duration-300");

    // Inner icon / text
    node.append("text")
      .text(d => d.id === rootId ? 'YEC' : (d.data.name.split(' ').pop()?.substring(0, 8) || ''))
      .attr("text-anchor", "middle")
      .attr("dy", "0.3em")
      .attr("fill", "#ffffff")
      .attr("font-size", d => d.id === rootId ? '16px' : (d.data.isLeader ? '10px' : '7px'))
      .attr("font-weight", d => d.data.isLeader ? "bold" : "normal")
      .style("pointer-events", "none");

    // Generation Tag on top of the node (e.g. K55)
    node.filter(d => d.id !== rootId)
      .append("text")
      .text(d => `K${d.data.generation}`)
      .attr("text-anchor", "middle")
      .attr("dy", d => -(d.data.isLeader ? 35 : 20))
      .attr("fill", "#a8a29e")
      .attr("font-size", "9px")
      .attr("font-weight", "bold");

    // Plus/Minus indicator for expandable nodes
    node.filter(d => d.canExpand && d.id !== rootId)
      .append("circle")
      .attr("cx", d => d.data.isLeader ? 20 : 10)
      .attr("cy", d => d.data.isLeader ? 20 : 10)
      .attr("r", 6)
      .attr("fill", "#ffffff")
      .attr("stroke", "#f59e0b");
      
    node.filter(d => d.canExpand && d.id !== rootId)
      .append("text")
      .text(d => d.isExpanded ? "-" : "+")
      .attr("x", d => d.data.isLeader ? 20 : 10)
      .attr("y", d => d.data.isLeader ? 20 : 10)
      .attr("dy", "0.3em")
      .attr("text-anchor", "middle")
      .attr("fill", "#d97706")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .style("pointer-events", "none");

    // Hover tooltip
    node.append("title")
      .text(d => `${d.data.name} \nChức vụ: ${d.data.roleTitle} \nKhóa: K${d.data.generation}`);

    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as SimNode).x!)
        .attr("y1", d => (d.source as SimNode).y!)
        .attr("x2", d => (d.target as SimNode).x!)
        .attr("y2", d => (d.target as SimNode).y!);

      node.attr("transform", d => `translate(${d.x},${d.y})`);

      // If searchFocus is active, keep centering it for a brief moment if it flies away
      if (searchFocusId) {
        const targetNode = activeNodes.find(n => n.id === searchFocusId);
        if (targetNode && targetNode.x !== undefined && targetNode.y !== undefined) {
          // You could optionally pan the camera here slowly
        }
      }
    });

    // Drag setup
    function drag(simulation: any) {
      return d3.drag()
        .on("start", (event: any, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event: any, d: any) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event: any, d: any) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        });
    }

    return () => {
      simulation.stop();
    };
  }, [activeNodes, activeLinks, searchFocusId, rootId]); // Re-run when graph topology changes

  return (
    <div className="w-full h-full relative group">
      <div ref={containerRef} className="w-full h-full absolute inset-0 bg-neutral-950 overflow-hidden rounded-xl border border-neutral-800 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
        <svg ref={svgRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />
      </div>
      
      {/* Help Overlay */}
      <div className="absolute bottom-4 left-4 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
        <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl text-xs text-neutral-400 space-y-2 backdrop-blur-md">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-600"></div> ROOT (Trung tâm)</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500 border border-amber-200"></div> Chủ nhiệm/Khóa chính (Click để mở rộng)</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-neutral-700"></div> Thành viên Nhánh lá</div>
        </div>
      </div>
    </div>
  );
}
