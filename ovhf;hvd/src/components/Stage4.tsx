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
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from('mcq_items')
        .select('*')
        .eq('session_id', sessionId)
        .order('order_index');
      if (error) console.error(error);
      if (data) setItems(data);
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

    // Update state
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
      await supabase
        .from('user_mcq_state')
        .insert([{
          user_id: user.id,
          item_id: item.id,
          attempt_count: 1,
          correct_count: correct ? 1 : 0,
          last_attempt_correct: correct,
          last_seen_at: new Date().toISOString(),
        }]);
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

  if (items.length === 0) return <div>سوالی وجود ندارد.</div>;

  const item = items[currentIndex];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">آزمون چهارگزینه‌ای - مرحله ۴</h2>
      <div className="border p-4 rounded">
        <p className="font-semibold">سوال {currentIndex + 1} از {items.length}</p>
        <p className="mt-2">{item.stem}</p>
        <div className="mt-4 space-y-2">
          {Object.entries(item.options).map(([key, value]) => (
            <button
              key={key}
              onClick={() => handleOptionSelect(key)}
              className={`w-full text-left p-2 border rounded ${selectedOption === key ? 'bg-blue-100 border-blue-500' : ''} ${showResult && key === item.correct_option ? 'bg-green-100' : ''} ${showResult && selectedOption === key && !isCorrect ? 'bg-red-100' : ''}`}
            >
              {key}: {value}
            </button>
          ))}
        </div>
        {!showResult ? (
          <button onClick={handleSubmit} disabled={!selectedOption} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50">ثبت پاسخ</button>
        ) : (
          <div className="mt-4">
            <p className={isCorrect ? 'text-green-600' : 'text-red-600'}>
              {isCorrect ? 'پاسخ صحیح بود!' : 'پاسخ اشتباه بود.'}
            </p>
            <p className="mt-2 text-sm text-gray-600">{item.rationale}</p>
            <button onClick={handleNext} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded">بعدی</button>
          </div>
        )}
      </div>
      <button onClick={() => navigate(`/session/${sessionId}`)} className="mt-4 text-blue-500">بازگشت</button>
    </div>
  );
};

export default Stage4;