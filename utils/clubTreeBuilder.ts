import { Person, Relationship } from "@/types";

/**
 * Tạo virtual relationships mô phỏng cấu trúc tổ chức CLB
 * dựa trên club_roles_history entry khớp với `term`.
 *
 * Logic phân nhánh:
 * - Layer 0: Chủ nhiệm (role_level 0)
 * - Layer 1: Phó Chủ nhiệm (role_level 1) → con của Chủ nhiệm
 * - Layer 2: Trưởng ban (role_level 2) → con của Phó CN, nhóm theo department
 * - Layer 3: Phó ban (role_level 3) → con của Trưởng ban cùng department
 * - Layer 4: Thành viên (role_level 4) → con của Trưởng ban cùng department
 */
export function buildClubRelationshipsFromTerm(
  persons: Person[],
  term: string,
): { relationships: Relationship[]; roots: Person[] } {
  const virtualRels: Relationship[] = [];

  // Lấy role_level và department từ entry khớp term
  type PersonWithRole = { person: Person; role_level: number; department: string; role_title: string };
  const membersInTerm: PersonWithRole[] = [];

  for (const p of persons) {
    const history = (p.club_roles_history || []) as any[];
    const entry = history.find((e: any) => e.term === term);
    if (entry) {
      membersInTerm.push({
        person: p,
        role_level: entry.role_level ?? 4,
        department: entry.department || "",
        role_title: entry.role_title || "",
      });
    }
  }

  if (membersInTerm.length === 0) {
    return { relationships: [], roots: [] };
  }

  // Phân nhóm theo cấp bậc
  const byLevel = new Map<number, PersonWithRole[]>();
  for (const m of membersInTerm) {
    if (!byLevel.has(m.role_level)) byLevel.set(m.role_level, []);
    byLevel.get(m.role_level)!.push(m);
  }

  // Lấy các level có thành viên, sắp xếp tăng dần
  const levels = Array.from(byLevel.keys()).sort((a, b) => a - b);

  if (levels.length === 0) {
    return { relationships: [], roots: [] };
  }

  // Root = level thấp nhất (cấp cao nhất, VD: 0 = Chủ nhiệm)
  const rootLevel = levels[0];
  const roots = byLevel.get(rootLevel)!.map(m => m.person);

  // Tạo quan hệ parent-child
  // Với level 2,3,4 => nhóm theo department, gắn vào trưởng ban cùng department
  for (let i = 0; i < levels.length - 1; i++) {
    const parentLevel = levels[i];
    const childLevel = levels[i + 1];
    const parents = byLevel.get(parentLevel) || [];
    const children = byLevel.get(childLevel) || [];

    if (parents.length === 0 || children.length === 0) continue;

    // Nếu children thuộc level 2+ (ban chuyên môn), match theo department
    if (childLevel >= 2) {
      // Group parents by department
      const parentsByDept = new Map<string, PersonWithRole[]>();
      for (const p of parents) {
        const dept = p.department || "__none__";
        if (!parentsByDept.has(dept)) parentsByDept.set(dept, []);
        parentsByDept.get(dept)!.push(p);
      }

      for (const child of children) {
        const childDept = child.department || "__none__";
        // Tìm parent cùng department
        const deptParents = parentsByDept.get(childDept);
        if (deptParents && deptParents.length > 0) {
          // Gắn vào parent đầu tiên cùng department
          virtualRels.push(createRel(deptParents[0].person.id, child.person.id));
        } else {
          // Fallback: gắn vào parent đầu tiên bất kỳ
          virtualRels.push(createRel(parents[0].person.id, child.person.id));
        }
      }
    } else {
      // Level 0->1: Chủ nhiệm -> Phó CN, chia đều
      children.forEach((child, idx) => {
        const parentIdx = idx % parents.length;
        virtualRels.push(createRel(parents[parentIdx].person.id, child.person.id));
      });
    }
  }

  return { relationships: virtualRels, roots };
}

function createRel(parentId: string, childId: string): Relationship {
  return {
    id: `virtual_${parentId}_${childId}`,
    person_a: parentId,
    person_b: childId,
    type: "biological_child",
    note: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

// Legacy export for backward compatibility
export function buildClubRelationships(
  persons: Person[],
): { relationships: Relationship[]; roots: Person[] } {
  const virtualRels: Relationship[] = [];
  const layers: Map<number, Person[]> = new Map();
  layers.set(1, []);
  layers.set(2, []);
  layers.set(3, []);

  for (const p of persons) {
    const level = p.club_role_level ?? 4;
    if (level === 0 || level === 1) {
      layers.get(1)!.push(p);
    } else if (level === 2 || level === 3) {
      layers.get(2)!.push(p);
    } else {
      layers.get(3)!.push(p);
    }
  }

  const activeLayers = [1, 2, 3].filter(l => layers.get(l)!.length > 0);

  if (activeLayers.length === 0) {
    return { relationships: [], roots: [] };
  }

  const rootLayer = activeLayers[0];
  const roots = layers.get(rootLayer) || [];

  for (let i = 0; i < activeLayers.length - 1; i++) {
    const parentLayer = activeLayers[i];
    const childLayer = activeLayers[i + 1];
    const parents = layers.get(parentLayer) || [];
    const children = layers.get(childLayer) || [];

    if (parents.length === 0 || children.length === 0) continue;

    if (parents.length === 1) {
      for (const child of children) {
        virtualRels.push(createRel(parents[0].id, child.id));
      }
    } else {
      children.forEach((child, idx) => {
        const parentIdx = idx % parents.length;
        virtualRels.push(createRel(parents[parentIdx].id, child.id));
      });
    }
  }

  return { relationships: virtualRels, roots };
}
