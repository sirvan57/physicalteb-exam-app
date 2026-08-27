import { useParams, useNavigate } from 'react-router-dom';

const Review = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <header className="topbar">
        <button onClick={() => navigate(`/session/${sessionId}`)} className="btn-ghost">
          ← بازگشت
        </button>
        <span className="badge bg-indigo-50 text-indigo-700">مرور</span>
      </header>
      <main className="page-container">
        <div className="card card-pad text-center">
          <p className="empty-state">این بخش به‌زودی تکمیل می‌شود.</p>
          <button onClick={() => navigate(`/session/${sessionId}`)} className="btn btn-secondary mt-2">
            بازگشت
          </button>
        </div>
      </main>
    </div>
  );
};

export default Review;