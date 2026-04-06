"use client";

import { useDashboard } from "@/components/DashboardContext";
import DashboardMemberList from "@/components/DashboardMemberList";
import RootSelector from "@/components/RootSelector";
import { Person, Relationship } from "@/types";
import { useMemo } from "react";
import dynamic from "next/dynamic";

import { buildClubRelationshipsFromTerm } from "@/utils/clubTreeBuilder";

const FamilyTree = dynamic(() => import("@/components/FamilyTree"));
const MindmapTree = dynamic(() => import("@/components/MindmapTree"));
const KhoaOverview = dynamic(() => import("@/components/KhoaOverview"));
const SuccessionBubbleWrapper = dynamic(() => import("@/components/SuccessionBubbleWrapper"), { ssr: false });
const BubbleMapTree = dynamic(
  () =>
    import("@/components/BubbleMapTree").catch((err) => {
      console.error("Failed to load BubbleMapTree:", err);
      return {
        default: () => (
          <div className="flex absolute inset-0 items-center justify-center p-4 text-center bg-stone-50 rounded-2xl border border-stone-200/60 shadow-inner text-stone-500">
            Tính năng này không được hỗ trợ trên trình duyệt của bạn. Vui lòng cập nhật hoặc sử dụng trình duyệt khác.
          </div>
        ),
      };
    }),
  { ssr: false },
);

interface DashboardViewsProps {
  persons: Person[];
  relationships: Relationship[];
  khoas: any[];
  canEdit?: boolean;
}

export default function DashboardViews({
  persons,
  relationships,
  khoas,
  canEdit = false,
}: DashboardViewsProps) {
  const { view: currentView, rootId, currentKhoaId, currentTerm } = useDashboard();

  // Filter persons: by term (from club_roles_history) or by khoaId
  const activePersons = useMemo(() => {
    if (currentTerm) {
      // Lọc những thành viên có ít nhất 1 entry trong club_roles_history khớp với term
      return persons.filter((p) => {
        const history = (p.club_roles_history || []) as any[];
        return history.some((entry: any) => entry.term === currentTerm);
      });
    }
    if (currentKhoaId) {
      return persons.filter((p) => p.khoa_id === currentKhoaId);
    }
    return persons;
  }, [persons, currentKhoaId, currentTerm]);

  // Build relationships: by term (club tree) or DB relationships
  const { activeRels, clubRoots } = useMemo(() => {
    if (currentTerm && activePersons.length > 0) {
      const { relationships: clubRels, roots } = buildClubRelationshipsFromTerm(activePersons, currentTerm);
      return { activeRels: clubRels, clubRoots: roots };
    }
    // Fallback: DB relationships
    const activeIds = new Set(activePersons.map((p) => p.id));
    const filtered = relationships.filter(
      (r) => activeIds.has(r.person_a) && activeIds.has(r.person_b)
    );
    return { activeRels: filtered, clubRoots: null as Person[] | null };
  }, [relationships, activePersons, currentTerm]);

  // Prepare map and roots for tree views
  const { personsMap, roots, defaultRootId } = useMemo(() => {
    const pMap = new Map<string, Person>();
    activePersons.forEach((p) => pMap.set(p.id, p));

    // Nếu đã có clubRoots (chế độ CLB), dùng nó
    if (clubRoots && clubRoots.length > 0) {
      return {
        personsMap: pMap,
        roots: clubRoots,
        defaultRootId: clubRoots[0].id,
      };
    }

    // Fallback: original logic
    const childIds = new Set(
      activeRels
        .filter(
          (r) => r.type === "biological_child" || r.type === "adopted_child",
        )
        .map((r) => r.person_b),
    );

    let finalRootId = rootId;

    if (!finalRootId || !pMap.has(finalRootId)) {
      const rootsFallback = activePersons.filter((p) => !childIds.has(p.id));
      if (rootsFallback.length > 0) {
        const gen1 = rootsFallback.filter((p) => p.generation === 1);
        const sortByBirthYear = (a: Person, b: Person) => {
          const ya = a.birth_year ?? Infinity;
          const yb = b.birth_year ?? Infinity;
          return ya - yb;
        };

        if (gen1.length > 0) {
          finalRootId = gen1.sort(sortByBirthYear)[0].id;
        } else {
          finalRootId = rootsFallback.sort(sortByBirthYear)[0].id;
        }
      } else if (activePersons.length > 0) {
        finalRootId = activePersons[0].id;
      }
    }

    let calculatedRoots: Person[] = [];
    if (finalRootId && pMap.has(finalRootId)) {
      calculatedRoots = [pMap.get(finalRootId)!];
    }

    return {
      personsMap: pMap,
      roots: calculatedRoots,
      defaultRootId: finalRootId,
    };
  }, [activePersons, activeRels, rootId, clubRoots]);

  const activeRootId = rootId || defaultRootId;

  return (
    <>
      <main className="flex-1 w-full flex flex-col">
        {currentView !== "list" && currentView !== "overview" && activePersons.length > 0 && activeRootId && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2 w-full flex flex-col sm:flex-row flex-wrap items-center sm:justify-between gap-4 relative z-20">
            <RootSelector persons={activePersons} currentRootId={activeRootId} />
            <div
              id="tree-toolbar-portal"
              className="flex items-center gap-2 flex-wrap justify-center"
            />
          </div>
        )}

        {currentView === "list" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative z-10">
            <DashboardMemberList
              initialPersons={activePersons}
              relationships={activeRels}
              khoas={khoas}
              canEdit={canEdit}
            />
          </div>
        )}

        {currentView === "overview" && currentKhoaId && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative z-10">
            {khoas.find((k) => k.id === currentKhoaId) && (
              <KhoaOverview khoa={khoas.find((k) => k.id === currentKhoaId)} />
            )}
          </div>
        )}

        <div className="flex-1 w-full relative z-10">
          {currentView === "tree" && (
            <FamilyTree
              personsMap={personsMap}
              relationships={activeRels}
              roots={roots}
              canEdit={canEdit}
            />
          )}
          {currentView === "mindmap" && (
            <MindmapTree
              personsMap={personsMap}
              relationships={activeRels}
              roots={roots}
              canEdit={canEdit}
            />
          )}
          {currentView === "bubble" && (
            <SuccessionBubbleWrapper
              persons={persons}
              khoas={khoas}
              currentKhoaId={currentKhoaId}
            />
          )}
        </div>
      </main>
    </>
  );
}
