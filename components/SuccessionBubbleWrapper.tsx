"use client";

import React, { useMemo, useState } from "react";
import { Person } from "@/types";
import { buildLineageTreeData } from "@/utils/lineageTreeBuilder";
import SuccessionBubbleGraph from "./SuccessionBubbleGraph";
import { Search, Filter, EyeOff, Eye } from "lucide-react";

export interface SuccessionBubbleWrapperProps {
  persons: Person[];
  khoas: any[];
  currentKhoaId?: string | null;
}

export default function SuccessionBubbleWrapper({ persons, khoas, currentKhoaId }: SuccessionBubbleWrapperProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocusId, setSearchFocusId] = useState<string | null>(null);
  
  // Filter settings
  const [filterLevel, setFilterLevel] = useState<number>(4); // 4 = All, 2 = Leaders only
  
  // Build Lineage Tree Data
  const { rootId, nodes } = useMemo(() => {
    return buildLineageTreeData(persons, khoas, currentKhoaId);
  }, [persons, khoas, currentKhoaId]);

  // Handle Search Autocomplete
  const matchedNodes = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return Object.values(nodes).filter(
      n => n.name.toLowerCase().includes(query) || (n.roleTitle && n.roleTitle.toLowerCase().includes(query))
    ).slice(0, 5); // top 5 matches
  }, [searchQuery, nodes]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-stone-50 rounded-2xl border border-stone-200/60 shadow-inner flex flex-col">
      {/* TOOLBAR PORTAL OVERLAY */}
      <div className="absolute top-4 left-4 z-50 flex flex-col gap-3 pointer-events-none w-80">
        
        {/* Search Box */}
        <div className="bg-white/80 backdrop-blur-md border border-stone-200 p-2 rounded-xl shadow-sm pointer-events-auto">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm thành viên..." 
              className="w-full bg-stone-100/50 border border-stone-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchFocusId(null);
              }}
            />
          </div>
          
          {/* Autocomplete Results */}
          {matchedNodes.length > 0 && !searchFocusId && (
            <div className="mt-2 bg-white border border-stone-100 rounded-lg shadow-lg overflow-hidden divide-y divide-stone-50">
              {matchedNodes.map(node => (
                <button
                  key={node.id}
                  onClick={() => {
                    setSearchFocusId(node.id);
                    setSearchQuery(node.name);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-stone-50 transition-colors flex justify-between items-center"
                >
                  <span className="font-medium text-stone-700">{node.name}</span>
                  <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-mono">K{node.generation}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter Box */}
        <div className="bg-white/80 backdrop-blur-md border border-stone-200 p-3 rounded-xl shadow-sm pointer-events-auto flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-stone-600 mb-1">
            <Filter className="w-4 h-4" /> BỘ LỌC HIỂN THỊ
          </div>
          
          <button 
            onClick={() => setFilterLevel(4)} 
            className={`text-left text-sm py-1.5 px-2 rounded-md transition-colors flex justify-between items-center ${filterLevel === 4 ? 'bg-amber-100 text-amber-800 font-medium' : 'text-stone-600 hover:bg-stone-100'}`}
          >
            <span>Đầy đủ Thành viên</span>
            {filterLevel === 4 ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-stone-300" />}
          </button>
          
          <button 
            onClick={() => setFilterLevel(2)} 
            className={`text-left text-sm py-1.5 px-2 rounded-md transition-colors flex justify-between items-center ${filterLevel === 2 ? 'bg-amber-100 text-amber-800 font-medium' : 'text-stone-600 hover:bg-stone-100'}`}
          >
            <span>Chỉ hiện Cán bộ (Lên ban)</span>
            {filterLevel === 2 ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-stone-300" />}
          </button>
          
          <button 
            onClick={() => setFilterLevel(-1)} 
            className={`text-left text-sm py-1.5 px-2 rounded-md transition-colors flex justify-between items-center ${filterLevel === -1 ? 'bg-amber-100 text-amber-800 font-medium' : 'text-stone-600 hover:bg-stone-100'}`}
          >
            <span>Chỉ hiện Khóa trung tâm</span>
            {filterLevel === -1 ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-stone-300" />}
          </button>

          <p className="text-[10px] text-stone-400 mt-2 italic">* Chọn Node trung tâm từ thanh bên cạnh (Sidebar) để đổi Khóa bắt đầu</p>
        </div>

      </div>

      <div className="flex-1 w-full h-full relative">
        <SuccessionBubbleGraph 
          rootId={rootId} 
          nodesRecord={nodes} 
          searchFocusId={searchFocusId}
          filterLevel={filterLevel}
        />
      </div>
    </div>
  );
}
