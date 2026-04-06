import { Person } from "@/types";

export interface LineageNode {
  id: string;
  name: string;
  generation: number;
  roleLevel: number;
  roleTitle: string;
  avatar: string | null;
  gender: string;
  isLeader: boolean; // true if roleLevel <= 2
  childrenIds?: string[]; // IDs of children in the next generation
}

/**
 * Builds a hierarchical succession model where Leaders of K(n) are the parents of K(n+1).
 * If multiple leaders exist in K(n), all K(n+1) children can be assigned to the highest leader,
 * or grouped under a virtual "Board K(n)" node. For simplicity, we attach K(n+1) to the President (0)
 * or the first Leader found.
 */
export function buildLineageTreeData(persons: Person[], khoas: any[], startingKhoaId?: string | null) {
  const nodes: Record<string, LineageNode> = {};
  
  // Create quick lookup for Generation -> Leaders
  const genLeaders: Record<number, LineageNode[]> = {};
  
  // Sort persons by generation ascending
  // Parse numeric generation from Khoa name (e.g. "K54" -> 54) or use p.generation
  const parseGen = (p: Person) => {
    if (p.generation) return p.generation;
    const khoaId = p.khoa_id;
    if (khoaId && khoas) {
      const khoa = khoas.find(k => k.id === khoaId);
      if (khoa && khoa.name.startsWith('K')) {
        return parseInt(khoa.name.substring(1), 10);
      }
    }
    return 0; // unknown
  };

  const parsedPersons = persons.map(p => {
    const gen = parseGen(p);
    const roleLevel = p.club_role_level ?? 4;
    return {
      ...p,
      parsedGen: gen,
      isLeader: roleLevel <= 2
    };
  }).filter(p => p.parsedGen > 0);

  // Build basic nodes
  parsedPersons.forEach(p => {
    const lNode: LineageNode = {
      id: p.id,
      name: p.full_name,
      generation: p.parsedGen,
      roleLevel: p.club_role_level ?? 4,
      roleTitle: p.club_role_title || 'Thành viên',
      avatar: p.avatar_url,
      gender: p.gender,
      isLeader: p.isLeader,
      childrenIds: []
    };
    nodes[p.id] = lNode;

    if (p.isLeader) {
      if (!genLeaders[p.parsedGen]) genLeaders[p.parsedGen] = [];
      genLeaders[p.parsedGen].push(lNode);
    }
  });

  // Assign children: For every person in K(N), they are children of President(s) of K(N-1)
  parsedPersons.forEach(child => {
    const prevGen = child.parsedGen - 1;
    const prevLeaders = genLeaders[prevGen];
    
    if (prevLeaders && prevLeaders.length > 0) {
      // Find the highest ranking leader (e.g. Chủ nhiệm level 0)
      prevLeaders.sort((a, b) => a.roleLevel - b.roleLevel);
      const parent = prevLeaders[0]; 
      
      // We only attach to ONE leader to keep it a clean tree (or we can attach to all, but D3 handles trees better if 1 parent)
      if (nodes[parent.id]) {
        nodes[parent.id].childrenIds!.push(child.id);
      }
    } else {
      // If no leaders in K(N-1), they are orphans (will be attached to YEC Root)
    }
  });

  // Find overall Root(s) - The earliest generation leaders
  let rootId = 'yec_root';

  if (startingKhoaId) {
    const startingKhoa = khoas.find(k => k.id === startingKhoaId);
    if (startingKhoa && startingKhoa.name.startsWith('K')) {
      const genNum = parseInt(startingKhoa.name.substring(1), 10);
      const targetLeaders = genLeaders[genNum];
      if (targetLeaders && targetLeaders.length > 0) {
        targetLeaders.sort((a, b) => a.roleLevel - b.roleLevel);
        rootId = targetLeaders[0].id;
      }
    }
  }

  if (rootId === 'yec_root') {
    const orphans = parsedPersons.filter(p => {
      // Check if they are in anyone's childrenIds
      const isChild = Object.values(nodes).some(n => n.childrenIds?.includes(p.id));
      return !isChild;
    });

    // Create YEC Root
    const rootNode: LineageNode = {
      id: rootId,
      name: 'YEC CLUB',
      generation: 0,
      roleLevel: -1,
      roleTitle: 'TRUNG TÂM',
      avatar: null,
      gender: 'other',
      isLeader: true, // It acts as a super leader
      childrenIds: orphans.map(o => o.id)
    };
    nodes[rootId] = rootNode;
  }

  return { rootId, nodes };
}
