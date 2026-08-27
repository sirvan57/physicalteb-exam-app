import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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

  useEffect(() => {
    const fetchItems = async () => {
      let query = supabase
        .from('assessment_items')
        .select('*')
        .eq('session_id', sessionId)
        .order('order_index');
      if (sectionParam) {
        query = query.eq('section_id', sectionParam);
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

    // Check if state exists
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
      await supabase
        .from('user_assessment_state')
        .insert([{
          user_id: user.id,
          item_id: item.id,
          attempt_count: 1,
          correct_count: correct ? 1 : 0,
          last_attempt_correct: correct,
          last_seen_at: new Date().toISOString(),
        }]);
    }

    setShowAnswer(false);
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // finished all items
      navigate(`/session/${sessionId}`);
    }
  };

  if (loading) return <div>در حال بارگذاری...</div>;
  if (items.length === 0) return <div>سوالی برای این بخش وجود ندارد.</div>;

  const item = items[currentIndex];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">ارزیابی اولیه - مرحله ۲</h2>
      <div className="border p-4 rounded mb-4">
        <p className="font-semibold">سوال {currentIndex + 1} از {items.length}</p>
        <p className="mt-2">{item.question}</p>
        {!showAnswer ? (
          <button onClick={() => setShowAnswer(true)} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">نمایش پاسخ</button>
        ) : (
          <div className="mt-2">
            <p className="bg-green-100 p-2 rounded">{item.answer}</p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => handleResponse(true)} className="bg-green-500 text-white px-4 py-2 rounded">بلد بودم</button>
              <button onClick={() => handleResponse(false)} className="bg-red-500 text-white px-4 py-2 rounded">اشتباه جواب دادم</button>
            </div>
          </div>
        )}
      </div>
      <button onClick={() => navigate(`/session/${sessionId}`)} className="text-blue-500">بازگشت به یادگیری</button>
    </div>
  );
};

export default Stage2;