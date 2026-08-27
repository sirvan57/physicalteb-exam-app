import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Stage4 = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [items, setItems] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('mcq_items')
        .select('*')
        .eq('session_id', sessionId)
        .order('order_index');
      if (error) console.error(error);
      if (data) setItems(data);
      setLoading(false);
    };
    fetchItems();
  }, [sessionId]);

  const handleOptionSelect = (option: string) => {
    if (showResult) return;
    setSelectedOption(option);
  };

  const handleSubmit = async () => {
    if (!selectedOption) return;
    const item = items[currentIndex];
    const correct = selectedOption === item.correct_option;
    setIsCorrect(correct);
    setShowResult(true);

    const { data: existing } = await supabase
      .from('user_mcq_state')
      .select('*')
      .eq('user_id', user.id)
      .eq('item_id', item.id)
      .single();

    if (existing) {
      await supabase
        .from('user_mcq_state')
        .update({
          attempt_count: existing.attempt_count + 1,
          correct_count: existing.correct_count + (correct ? 1 : 0),
          last_attempt_correct: correct,
          last_seen_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('item_id', item.id);
    } else {
      await supabase.from('user_mcq_state').insert([
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
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowResult(false);
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigate(`/session/${sessionId}`);
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <button onClick={() => navigate(`/session/${sessionId}`)} className="btn-ghost">
          ← بازگشت
        </button>
        <span className="badge bg-rose-50 text-rose-700">آزمون چهارگزینه‌ای — مرحله ۴</span>
      </header>

      <main className="page-container">
        {loading ? (
          <div className="flex justify-center py-16">
            <span className="spinner" />
          </div>
        ) : items.length === 0 ? (
          <div className="card card-pad text-center">
            <p className="empty-state">سوالی وجود ندارد.</p>
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
                  <div className="progress-fill" style={{ width: `${progress}%`, backgroundColor: '#e11d48' }} />
                </div>

                <div className="card card-pad">
                  <p className="text-lg font-medium leading-loose text-slate-800">{item.stem}</p>

                  <div className="mt-5 flex flex-col gap-2.5">
                    {Object.entries(item.options).map(([key, value]) => {
                      const isSelected = selectedOption === key;
                      const isCorrectOption = showResult && key === item.correct_option;
                      const isWrongPick = showResult && isSelected && !isCorrect;
                      return (
                        <button
                          key={key}
                          onClick={() => handleOptionSelect(key)}
                          className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-right transition-all ${
                            isCorrectOption
                              ? 'border-emerald-300 bg-emerald-50'
                              : isWrongPick
                              ? 'border-rose-300 bg-rose-50'
                              : isSelected
                              ? 'border-indigo-400 bg-indigo-50'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <span
                            className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                              isCorrectOption
                                ? 'bg-emerald-600 text-white'
                                : isWrongPick
                                ? 'bg-rose-600 text-white'
                                : isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {key}
                          </span>
                          <span className="text-[15px] text-slate-800">{value as string}</span>
                        </button>
                      );
                    })}
                  </div>

                  {!showResult ? (
                    <button
                      onClick={handleSubmit}
                      disabled={!selectedOption}
                      className="btn btn-primary btn-block mt-6"
                    >
                      ثبت پاسخ
                    </button>
                  ) : (
                    <div className="mt-6">
                      <p className={`font-bold ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isCorrect ? 'پاسخ صحیح بود! ✓' : 'پاسخ اشتباه بود.'}
                      </p>
                      <p className="mt-2 text-sm leading-loose text-slate-600">{item.rationale}</p>
                      <button onClick={handleNext} className="btn btn-secondary mt-4">
                        سوال بعدی
                      </button>
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

export default Stage4;