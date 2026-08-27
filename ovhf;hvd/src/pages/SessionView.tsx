import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import Stage1 from '../components/Stage1';

const SessionView = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'journey';
  const navigate = useNavigate();

  if (mode === 'simple') {
    return (
      <div className="p-4">
        <h2>انتخاب مرحله</h2>
        <div className="flex flex-col gap-2 mt-4">
          <button onClick={() => navigate(`/session/${sessionId}/stage1`)} className="bg-blue-500 text-white p-2 rounded">مرحله ۱: تدریس عمیق</button>
          <button onClick={() => navigate(`/session/${sessionId}/stage2`)} className="bg-green-500 text-white p-2 rounded">مرحله ۲: ارزیابی اولیه</button>
          <button onClick={() => navigate(`/session/${sessionId}/stage3`)} className="bg-yellow-500 text-white p-2 rounded">مرحله ۳: مرور تلگرافی</button>
          <button onClick={() => navigate(`/session/${sessionId}/stage4`)} className="bg-red-500 text-white p-2 rounded">مرحله ۴: آزمون چهارگزینه‌ای</button>
        </div>
      </div>
    );
  }

  // journey mode
  return (
    <div className="p-4">
      <button onClick={() => navigate('/')} className="mb-4 text-blue-500">← بازگشت</button>
      <div className="flex justify-end mb-2">
        <button onClick={() => navigate(`/session/${sessionId}/review`)} className="bg-purple-500 text-white px-4 py-2 rounded">مرور</button>
      </div>
      <Stage1 sessionId={sessionId!} />
    </div>
  );
};

export default SessionView;