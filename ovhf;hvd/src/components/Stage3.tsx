import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useParams, useNavigate } from 'react-router-dom';

const Stage3 = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [sections, setSections] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
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
        const grouped = nodes.map((node) => ({
          section_id: node.section_id,
          title: node.title_fa,
          blocks: blocks.filter((b) => b.section_id === node.section_id)
        })).filter((g) => g.blocks.length > 0);
        setSections(grouped);
      }
    };
    fetchData();
  }, [sessionId]);

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">مرور تلگرافی - مرحله ۳</h2>
      {sections.map((section) => (
        <div key={section.section_id} className="mb-6 border p-4 rounded">
          <h3 className="text-lg font-bold mb-2">{section.title}</h3>
          {section.blocks.map((block: any) => (
            <div key={block.id} className="mb-2">
              <p>{block.text}</p>
            </div>
          ))}
        </div>
      ))}
      <button onClick={() => navigate(`/session/${sessionId}`)} className="text-blue-500">بازگشت</button>
    </div>
  );
};

export default Stage3;