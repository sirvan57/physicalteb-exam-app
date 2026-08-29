import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useParams, useNavigate } from 'react-router-dom';
import { renderFormattedText } from '../utils/formatText';
import { sortRegistryHierarchically, RegistryNodeLike } from '../utils/registrySort';

interface TopLevelGroup {
  section_id: string;
  title: string;
  subsections: { section_id: string; title: string; blocks: any[] }[];
}

const Stage3 = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [groups, setGroups] = useState<TopLevelGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: nodes, error: nodeError } = await supabase
        .from('registry_nodes')
        .select('*')
        .eq('session_id', sessionId);
      if (nodeError) console.error(nodeError);

      const { data: blocks, error: blockError } = await supabase
        .from('content_blocks')
        .select('*')
        .eq('session_id', sessionId)
        .eq('stage', 3)
        .order('order_index');
      if (blockError) console.error(blockError);

      if (nodes && blocks) {
        const sortedNodes = sortRegistryHierarchically(nodes as RegistryNodeLike[]);
        const nodesById = new Map(sortedNodes.map((n) => [n.section_id, n]));

        const getTopLevelAncestorId = (sectionId: string): string => {
          let current = nodesById.get(sectionId);
          while (current?.parent_id) {
            const parent = nodesById.get(current.parent_id);
            if (!parent) break;
            current = parent;
          }
          return current?.section_id ?? sectionId;
        };

        const groupMap = new Map<string, TopLevelGroup>();
        for (const node of sortedNodes) {
          const nodeBlocks = blocks.filter((b) => b.section_id === node.section_id);
          if (nodeBlocks.length === 0) continue;

          const topId = getTopLevelAncestorId(node.section_id);
          const topNode = nodesById.get(topId);
          if (!groupMap.has(topId)) {
            groupMap.set(topId, {
              section_id: topId,
              title: topNode?.title_fa ?? topId,
              subsections: [],
            });
          }
          groupMap.get(topId)!.subsections.push({
            section_id: node.section_id,
            title: node.title_fa,
            blocks: nodeBlocks,
          });
        }
        setGroups(Array.from(groupMap.values()));
      }
      setLoading(false);
    };
    fetchData();
  }, [sessionId]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <button onClick={() => navigate(`/session/${sessionId}`)} className="btn-ghost">
          ← بازگشت
        </button>
        <span className="badge bg-amber-50 text-amber-700">مرور تلگرافی — مرحله ۳</span>
      </header>

      <main className="page-container">
        {loading ? (
          <div className="flex justify-center py-16">
            <span className="spinner" />
          </div>
        ) : groups.length === 0 ? (
          <div className="empty-state">خلاصه‌ای برای این جلسه ثبت نشده.</div>
        ) : (
          <div className="flex flex-col gap-6">
            {groups.map((group) => (
              <div key={group.section_id} className="rounded-2xl border-2 border-amber-200 bg-white shadow-sm overflow-hidden">
                <div className="bg-amber-100/70 px-6 py-3.5 border-b-2 border-amber-200">
                  <h2 className="text-lg font-extrabold text-amber-800">
                    <span className="text-amber-500 font-normal ml-2">{group.section_id.replace('§', '')}</span>
                    {group.title}
                  </h2>
                </div>
                <div className="px-6 py-5 flex flex-col gap-5">
                  {group.subsections.map((sub) => (
                    <div key={sub.section_id}>
                      {sub.section_id !== group.section_id && (
                        <h3 className="mb-2.5 text-sm font-bold text-amber-600">
                          <span className="text-amber-400 font-normal ml-1.5">{sub.section_id.replace('§', '')}</span>
                          {sub.title}
                        </h3>
                      )}
                      <ul className="flex flex-col gap-2.5">
                        {sub.blocks.map((block: any) => (
                          <li key={block.id} className="flex items-start gap-2.5 leading-loose text-slate-700">
                            <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                            <span>{renderFormattedText(block.text)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
export default Stage3;
