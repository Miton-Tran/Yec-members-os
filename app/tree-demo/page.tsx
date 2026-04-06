'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown } from 'lucide-react';
import * as d3 from 'd3';

// --- DUMMY DATA FOR LINEAGE TREE ---
const LINEAGE_DATA = {
  id: 'yec_root', name: 'YEC CLUB', role: 'Trung tâm', type: 'root',
  children: [
    {
      id: 'k54_cn', name: 'Trần Minh Thông', k: 'K54', role: 'Chủ nhiệm K54', type: 'president',
      children: [
        { id: 'k55_mem1', name: 'Nguyễn Văn A', k: 'K55', role: 'Thành viên', type: 'member' },
        { id: 'k55_mem2', name: 'Lê Thị B', k: 'K55', role: 'Thành viên', type: 'member' },
        { id: 'k55_mem4', name: 'Trần C', k: 'K55', role: 'Thành viên', type: 'member' },
        { id: 'k55_mem5', name: 'Lý D', k: 'K55', role: 'Thành viên', type: 'member' },
        {
          id: 'k55_cn', name: 'Phạm Văn C', k: 'K55', role: 'Chủ nhiệm K55', type: 'president',
          children: [
            { id: 'k56_mem1', name: 'Đặng D', k: 'K56', role: 'Thành viên', type: 'member' },
            { id: 'k56_mem2', name: 'Bùi E', k: 'K56', role: 'Thành viên', type: 'member' },
            { id: 'k56_mem3', name: 'Vũ F', k: 'K56', role: 'Thành viên', type: 'member' },
            { id: 'k56_mem4', name: 'Đỗ G', k: 'K56', role: 'Thành viên', type: 'member' },
            { id: 'k56_mem5', name: 'Trịnh H', k: 'K56', role: 'Thành viên', type: 'member' },
            {
              id: 'k56_cn', name: 'Ngô G', k: 'K56', role: 'Chủ nhiệm K56', type: 'president',
              children: [
                { id: 'k57_mem1', name: 'Hoàng H', k: 'K57', role: 'Thành viên K57', type: 'member' },
                { id: 'k57_mem2', name: 'Đinh I', k: 'K57', role: 'Thành viên K57', type: 'member' }
              ]
            }
          ]
        },
        { id: 'k55_mem3', name: 'Mai J', k: 'K55', role: 'Thành viên', type: 'member' }
      ]
    }
  ]
};

// --- D3 FORCE DIRECTED GRAPH BUBBLE COMPONENT ---
const BubbleGraph = ({ data }: { data: any }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    const width = 800;
    const height = 600;

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove();

    // Transform hierarchical data to nodes and links
    const root = d3.hierarchy(data);
    const links = root.links();
    const nodes = root.descendants();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .call(d3.zoom<SVGSVGElement, unknown>().on("zoom", (e) => {
        g.attr("transform", e.transform);
      }))
      .append("g");

    const g = svg.append("g");

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(60))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius((d: any) => d.data.type === 'root' ? 50 : d.data.type === 'president' ? 35 : 20));

    // Draw Links
    const link = g.append("g")
      .attr("stroke", "#404040")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", (d: any) => d.source.data.type === 'root' ? 3 : 1.5);

    // Group for nodes
    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(drag(simulation) as any)
      // Thêm tương tác click để expand/collapse sau nếu cần (demo thì hover)
      .style("cursor", "pointer")
      
    // Bubble circles
    node.append("circle")
      .attr("r", (d: any) => d.data.type === 'root' ? 40 : d.data.type === 'president' ? 30 : 18)
      .attr("fill", (d: any) => d.data.type === 'root' ? '#f97316' : d.data.type === 'president' ? '#b45309' : '#262626')
      .attr("stroke", (d: any) => d.data.type === 'root' ? '#ffedd5' : d.data.type === 'president' ? '#fde68a' : '#525252')
      .attr("stroke-width", 2);

    // Text labels
    node.append("text")
      .text((d: any) => d.data.type === 'root' ? 'YEC' : d.data.name.split(' ').pop()) // Lấy tên cuối
      .attr("text-anchor", "middle")
      .attr("dy", "0.3em")
      .attr("fill", "#ffffff")
      .attr("font-size", (d: any) => d.data.type === 'root' ? '18px' : d.data.type === 'president' ? '12px' : '9px')
      .attr("font-weight", "bold");

    // Title on hover
    node.append("title")
      .text((d: any) => `${d.data.name} - ${d.data.role}`);

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    // Drag behavior definition
    function drag(simulation: any) {
      function dragstarted(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      function dragged(event: any, d: any) {
        d.fx = event.x;
        d.fy = event.y;
      }
      function dragended(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
    
    return () => {
      simulation.stop();
    };
  }, [data]);

  return (
    <div className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden relative shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
      {/* Help tooltip */}
      <div className="absolute top-4 left-4 text-xs font-mono text-neutral-500 bg-neutral-900/80 px-3 py-1.5 rounded-lg border border-neutral-800 backdrop-blur-sm z-10 pointer-events-none">
        Kéo/thả chuột để di chuyển - Cuộn chuột để Zoom in/out
      </div>
      
      <svg ref={svgRef} className="w-full h-[600px] cursor-grab active:cursor-grabbing"></svg>
    </div>
  );
};


// --- Component đệ quy của cách 3 (Dạng Dọc List) ---
const TreeNode = ({ node, level = 0 }: { node: any, level?: number }) => {
  const [isExpanded, setIsExpanded] = useState(level === 0);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="relative">
      <div className={`flex items-center gap-3 p-2 my-2 rounded-xl border transition-all ${
          node.type === 'root' ? 'bg-orange-500/10 border-orange-500/30' :
          node.type === 'president' ? 'bg-amber-500/10 border-amber-500/30 cursor-pointer hover:bg-amber-500/20' :
          'bg-neutral-800/50 border-neutral-700'
        } ${hasChildren ? 'cursor-pointer' : ''}`}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        style={{ marginLeft: `${level * 2}rem` }}
      >
        <div className="w-6 flex justify-center">
          {hasChildren ? (
            isExpanded ? <ChevronDown size={18} className="text-orange-400" /> : <ChevronRight size={18} className="text-orange-400" />
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-600"></div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
          ${node.type === 'root' ? 'bg-orange-500 text-white' : 
            node.type === 'president' ? 'bg-amber-600 text-white' : 'bg-neutral-700 text-neutral-300'}`}>
          {node.type === 'root' ? 'Y' : node.name.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-neutral-200">{node.name}</div>
          <div className={`text-xs ${node.type === 'president' ? 'text-amber-400 font-medium' : 'text-neutral-500'}`}>
            {node.role} {node.k ? `· ${node.k}` : ''}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden relative">
            <div className="absolute left-6 top-0 bottom-4 w-[1px] bg-neutral-800" style={{ left: `calc(${level * 2}rem + 1.5rem)` }}></div>
            {node.children.map((child: any) => <TreeNode key={child.id} node={child} level={level + 1} />)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


export default function TreeDemoPage() {
  const [activeTab, setActiveTab] = useState<'lineage' | 'bubble'>('bubble');

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-8 font-sans pb-24">
      <div className="max-w-[1200px] mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent mb-8 text-center">
          Sơ đồ Kế Thừa (Demo)
        </h1>

        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          <button
            onClick={() => setActiveTab('lineage')}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
              activeTab === 'lineage' ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
           Cách 1: List Xổ Dọc (Folders)
          </button>
          
          <button
            onClick={() => setActiveTab('bubble')}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'bubble' ? 'bg-[#ffca28] text-neutral-900 shadow-[0_0_15px_rgba(255,202,40,0.5)]' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
            }`}
          >
            Cách 2: Bóng nổi (Bubble Map/D3 Force) 🔥
          </button>
        </div>

        {activeTab === 'lineage' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
            <div className="w-full max-w-3xl bg-neutral-900/40 p-8 rounded-2xl border border-neutral-800 backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-2 text-white">Sơ đồ Kế Thừa Dạng List Nồng</h2>
              <div className="pl-4"><TreeNode node={LINEAGE_DATA} /></div>
            </div>
          </motion.div>
        )}

        {/* CHẾ ĐỘ BONG BÓNG */}
        {activeTab === 'bubble' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
            <div className="w-full relative">
               <BubbleGraph data={LINEAGE_DATA} />

               {/* Chú giải góc dưới */}
               <div className="absolute bottom-4 left-4 bg-neutral-900/80 p-4 border border-neutral-800 rounded-xl backdrop-blur-sm flex flex-col gap-2">
                 <div className="flex items-center gap-2">
                   <div className="w-4 h-4 rounded-full bg-orange-500 border border-orange-200"></div>
                   <span className="text-xs text-neutral-300">YEC Root</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-4 h-4 rounded-full bg-amber-600 border border-amber-200"></div>
                   <span className="text-xs text-neutral-300">Ban Chủ nhiệm (Keys)</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-4 h-4 rounded-full bg-neutral-800 border border-neutral-600"></div>
                   <span className="text-xs text-neutral-300">Thành viên (Leaves)</span>
                 </div>
               </div>
            </div>

            <div className="mt-8 max-w-2xl text-center text-sm text-neutral-400">
              Chế độ bong bóng <strong>(Force-Directed Graph)</strong> cực kỳ hiệu quả để giải quyết vấn đề "không gian" cho dữ liệu lớn. Các node tự động phân bổ xô đẩy nhau xung quanh các "trung tâm lõi" (Chủ nhiệm). Rất hợp để làm UI "Visual" xịn xò.
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
