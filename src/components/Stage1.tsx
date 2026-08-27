import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';
import { renderFormattedText } from '../utils/formatText';

interface Stage1Props {
  sessionId?: string;
}

interface Section {
  section_id: string;
  title: string;
  level: number;
  blocks: any[];
}

const Stage1: React.FC<Stage1Props> = ({ sessionId: sessionIdProp }) => {
  const { sessionId: sessionIdParam } = useParams<{ sessionId: string }>();
  const sessionId = sessionIdProp ?? sessionIdParam ?? '';
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionsWithQuestions, setSectionsWithQuestions] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch registry nodes
        const { data: nodes, error: nodeError } = await supabase
          .from('registry_nodes')
          .select('*')
          .eq('session_id', sessionId)
          .order('order_index');
        if (nodeError) throw nodeError;

        // Fetch content blocks for stage 1
        const { data: blocks, error: blockError } = await supabase
          .from('content_blocks')
          .select('*')
          .eq('session_id', sessionId)
          .eq('stage', 1)
          .order('order_index');
        if (blockError) throw blockError;

        // Fetch distinct section_ids from assessment_items (برای فهمیدن کدام بخش‌ها سوال دارند)
        const { data: assessmentSections, error: assessError } = await supabase
          .from('assessment_items')
          .select('section_id')
          .eq('session_id', sessionId);
        if (assessError) throw assessError;

        const questionSet = new Set<string>();
        assessmentSections?.forEach(item => questionSet.add(item.section_id));
        setSectionsWithQuestions(questionSet);

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

    if (sessionId) fetchData();
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
    return <div className="flex justify-center py-20 text-gray-500">در حال بارگذاری...</div>;
  }

  if (sections.length === 0) {
    return <div className="text-center py-10 text-gray-500">محتوایی برای این جلسه ثبت نشده.</div>;
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
              {sectionsWithQuestions.has(section.section_id) ? (
                <button
                  onClick={() => handleAssess(section.section_id)}
                  className="bg-gradient-to-l from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium px-8 py-2.5 rounded-lg shadow-sm hover:shadow transition-all"
                >
                  ارزیابی این بخش
                </button>
              ) : (
                <span className="text-sm text-gray-400">برای این بخش ارزیابی ثبت نشده است</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Stage1;