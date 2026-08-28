import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { renderFormattedText } from '../utils/formatText';

const Stage2 = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();
  const sectionParam = searchParams.get('section') || undefined;
  const [items, setItems] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const goBackToLearning = () => {
    navigate(`/session/${sessionId}`, { state: { scrollToSection: sectionParam } });
  };

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      let query = supabase
        .from('assessment_items')
        .select('*')
        .eq('session_id', sessionId)
        .order('order_index');
      if (sectionParam) {
        // بخش می‌تونه خودش دقیقاً همین section_id باشه یا زیرمجموعه‌ی سلسله‌مراتبیش
        // (مثلاً کلیک روی «§5» باید سوالات «§5.1»، «§5.2» و... رو هم بیاره)
        query = query.or(`section_id.eq.${sectionParam},section_id.like.${sectionParam}.%`);
      }
      const { data, error } = await query;
      if (error) console.error(error);
      if (data) setItems(data);
      setLoading(false);
    };
    fetchItems();
  }, [sessionId, sectionParam]);

  const handleResponse = async (correct: boolean) => {
    const item = items[currentIndex];
    if (!item) return;

    const { data: existing } = await supabase
      .from('user_assessment_state')
      .select('*')
      .eq('user_id', user.id)
      .eq('item_id', item.id)
      .single();

    if (existing) {
      await supabase
        .from('user_assessment_state')
        .update({
          attempt_count: existing.attempt_count + 1,
          correct_count: existing.correct_count + (correct ? 1 : 0),
          last_attempt_correct: correct,
          last_seen_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('item_id', item.id);
    } else {
      await supabase.from('user_assessment_state').insert([
        {
          user_id: user.id,
          item_id: item.id,
          attempt_count: 1,
          correct_count: correct ? 1 : 0,
          last_attempt_correct: correct,
          last_seen_at: new Date().toISOString(),
        },
      ]);
    }

    setShowAnswer(false);
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      goBackToLearning();
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <button onClick={goBackToLearning} className="btn-ghost">
          ← بازگشت به یادگیری
        </button>
        <span className="badge bg-emerald-50 text-emerald-700">ارزیابی اولیه — مرحله ۲</span>
      </header>

      <main className="page-container">
        {loading ? (
          <div className="flex justify-center py-16">
            <span className="spinner" />
          </div>
        ) : items.length === 0 ? (
          <div className="card card-pad text-center">
            <p className="empty-state">سوالی برای این بخش وجود ندارد.</p>
          </div>
        ) : (
          (() => {
            const item = items[currentIndex];
            const progress = ((currentIndex + 1) / items.length) * 100;
            return (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-500">
                    سوال {currentIndex + 1} از {items.length}
                  </span>
                </div>
                <div className="progress-track mb-6">
                  <div className="progress-fill" style={{ width: `${progress}%`, backgroundColor: '#0d9488' }} />
                </div>

                <div className="card card-pad">
                  <p className="text-lg font-medium leading-loose text-slate-800">{renderFormattedText(item.question)}</p>

                  {!showAnswer ? (
                    <button onClick={() => setShowAnswer(true)} className="btn btn-primary mt-6">
                      نمایش پاسخ
                    </button>
                  ) : (
                    <div className="mt-5">
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 leading-loose text-emerald-900">
                        {renderFormattedText(item.answer)}
                      </div>
                      <div className="mt-5 flex gap-3">
                        <button onClick={() => handleResponse(true)} className="btn btn-success flex-1">
                          بلد بودم
                        </button>
                        <button onClick={() => handleResponse(false)} className="btn btn-danger flex-1">
                          اشتباه جواب دادم
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            );
          })()
        )}
      </main>
    </div>
  );
};
export default Stage2;