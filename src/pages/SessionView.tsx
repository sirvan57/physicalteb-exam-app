import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Stage1 from '../components/Stage1';

const STAGES = [
  {
    key: 'stage1',
    label: 'تدریس عمیق',
    desc: 'مطالعه‌ی محتوا به همراه ارزیابی مرحله‌به‌مرحله',
    num: 1,
    numBg: 'bg-indigo-100 text-indigo-700',
  },
  {
    key: 'stage2',
    label: 'ارزیابی اولیه',
    desc: 'سوال و جواب کوتاه برای جا انداختن مطلب',
    num: 2,
    numBg: 'bg-emerald-100 text-emerald-700',
  },
  {
    key: 'stage3',
    label: 'مرور تلگرافی',
    desc: 'خلاصه‌ی فشرده‌ی نکات هر بخش',
    num: 3,
    numBg: 'bg-amber-100 text-amber-700',
  },
  {
    key: 'stage4',
    label: 'آزمون چهارگزینه‌ای',
    desc: 'تست نهایی برای سنجش آمادگی',
    num: 4,
    numBg: 'bg-rose-100 text-rose-700',
  },
];

const SessionView = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'journey';
  const navigate = useNavigate();
  const [sessionName, setSessionName] = useState('');

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.from('sessions').select('name').eq('id', sessionId).single();
      if (data) setSessionName(data.name);
    };
    if (sessionId) fetchSession();
  }, [sessionId]);

  if (mode === 'simple') {
    return (
      <div className="app-shell">
        <header className="topbar">
          <div>
            <button onClick={() => navigate('/')} className="btn-ghost mb-1">
              ← بازگشت به جلسه‌ها
            </button>
            <p className="topbar-title">{sessionName || 'در حال بارگذاری...'}</p>
          </div>
        </header>
        <main className="page-container">
          <p className="mb-4 text-sm font-semibold text-slate-500">یک مرحله را برای شروع انتخاب کنید</p>
          <div className="flex flex-col gap-3">
            {STAGES.map((s) => (
              <button
                key={s.key}
                onClick={() =>
                  navigate(
                    s.key === 'stage1'
                      ? `/session/${sessionId}?mode=journey`
                      : `/session/${sessionId}/${s.key}`
                  )
                }
                className="stage-pill"
              >
                <span className={`stage-num ${s.numBg}`}>{s.num}</span>
                <span className="flex-1">
                  <span className="block font-bold text-slate-800">{s.label}</span>
                  <span className="block text-xs text-slate-500">{s.desc}</span>
                </span>
              </button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // journey mode
  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <button onClick={() => navigate('/')} className="btn-ghost mb-1">
            ← بازگشت به جلسه‌ها
          </button>
          <p className="topbar-title">{sessionName || 'در حال بارگذاری...'}</p>
        </div>
        <button onClick={() => navigate(`/session/${sessionId}/review`)} className="btn btn-secondary">
          مرور
        </button>
      </header>
      <main className="page-container-wide">
        <Stage1 sessionId={sessionId!} />
      </main>
    </div>
  );
};

export default SessionView;