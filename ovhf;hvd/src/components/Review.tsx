import { useParams, useNavigate } from 'react-router-dom';

const Review = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">مرور</h2>
      <p>این بخش به‌زودی تکمیل می‌شود.</p>
      <button onClick={() => navigate(`/session/${sessionId}`)} className="mt-4 text-blue-500">بازگشت</button>
    </div>
  );
};

export default Review;