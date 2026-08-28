import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useParams, useNavigate } from 'react-router-dom';
import { renderFormattedText } from '../utils/formatText';

const Stage3 = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: nodes, error: nodeError } = await supabase
        .from('registry_nodes')
        .select('*')
        .eq('session_id', sessionId)
        .order('order_index');
      if (nodeError) console.error(nodeError);

      const { data: blocks, error: blockError } = await supabase
        .from('content_blocks')
        .select('*')
        .eq('session_id', sessionId)
        .eq('stage', 3)
        .order('order_index');
      if (blockError) console.error(blockError);

      if (nodes && blocks) {
        const grouped = nodes
          .map((node) => ({
            section_id: node.section_id,
            title: node.title_fa,
            blocks: blocks.filter((b) => b.section_id === node.section_id),
          }))
          .filter((g) => g.blocks.length > 0);
        setSections(grouped);
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
        ) : sections.length === 0 ? (
          <div className="empty-state">خلاصه‌ای برای این جلسه ثبت نشده.</div>
        ) : (
          <div className="flex flex-col gap-4">
            {sections.map((section) => (
              <div key={section.section_id} className="card card-pad">
                <h3 className="mb-3 text-base font-bold text-amber-700">
                  <span className="text-amber-400 font-normal ml-1.5">{section.section_id.replace('§', '')}</span>
                  {section.title}
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {section.blocks.map((block: any) => (
                    <li key={block.id} className="flex items-start gap-2.5 leading-loose text-slate-700">
                      <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                      <span>{renderFormattedText(block.text)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
export default Stage3;