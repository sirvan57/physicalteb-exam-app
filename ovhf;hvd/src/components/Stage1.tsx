import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

interface Stage1Props {
  sessionId: string;
}

interface Section {
  section_id: string;
  title: string;
  level: number;
  blocks: any[];
}

// تابع تبدیل مارک‌داون ساده به JSX
const renderFormattedText = (text: string) => {
  // جدا کردن بخش‌های با تگ ==...==
  const parts = text.split(/(==[^=]+==|\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('==') && part.endsWith('==')) {
      // هایلایت زرد
      return <mark key={index} className="bg-yellow-200 text-gray-900 font-medium px-1 rounded">{part.slice(2, -2)}</mark>;
    } else if (part.startsWith('**') && part.endsWith('**')) {
      // بولد
      return <strong key={index} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
    } else {
      return part;
    }
  });
};

const Stage1: React.FC<Stage1Props> = ({ sessionId }) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: nodes, error: nodeError } = await supabase
          .from('registry_nodes')
          .select('*')
          .eq('session_id', sessionId)
          .order('order_index');

        if (nodeError) throw nodeError;

        const { data: blocks, error: blockError } = await supabase
          .from('content_blocks')
          .select('*')
          .eq('session_id', sessionId)
          .eq('stage', 1)
          .order('order_index');

        if (blockError) throw blockError;

        if (nodes && blocks) {
          const grouped = nodes
            .map((node) => {
              const sectionBlocks = blocks.filter((b) => b.section_id === node.section_id);
              return {
                section_id: node.section_id,
                title: node.title_fa,
                level: node.level,
                blocks: sectionBlocks,
              };
            })
            .filter((g) => g.blocks.length > 0);
          setSections(grouped);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionId]);

  const handleAssess = (sectionId: string) => {
    navigate(`/session/${sessionId}/stage2?section=${sectionId}`);
  };

  const getTitleStyles = (level: number) => {
    switch (level) {
      case 1:
        return 'text-2xl font-extrabold text-indigo-700';
      case 2:
        return 'text-xl font-bold text-blue-700';
      case 3:
        return 'text-lg font-semibold text-teal-700';
      default:
        return 'text-base font-medium text-gray-700';
    }
  };

  const getHeaderBg = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-indigo-50';
      case 2:
        return 'bg-blue-50';
      case 3:
        return 'bg-teal-50';
      default:
        return 'bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-gray-500">
        در حال بارگذاری...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <div
          key={section.section_id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className={`${getHeaderBg(section.level)} px-6 py-4 border-b border-gray-200`}>
            <h3 className={getTitleStyles(section.level)}>{section.title}</h3>
          </div>
          <div className="px-8 py-6">
            {section.blocks.map((block) => (
              <div key={block.id} className="mb-5 leading-loose">
                {block.block_type === 'reflective_prompt' ? (
                  <div className="bg-amber-50 p-5 rounded-lg border-r-4 border-amber-400">
                    <p className="font-semibold text-gray-800">{renderFormattedText(block.question || '')}</p>
                    <p className="text-sm text-gray-600 mt-3">{renderFormattedText(block.answer || '')}</p>
                  </div>
                ) : (
                  <p className="text-gray-800 text-base md:text-lg">
                    {renderFormattedText(block.text)}
                  </p>
                )}
              </div>
            ))}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => handleAssess(section.section_id)}
                className="bg-gradient-to-l from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium px-8 py-2.5 rounded-lg shadow-sm hover:shadow transition-all"
              >
                ارزیابی این بخش
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Stage1;