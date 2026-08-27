import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [mode, setMode] = useState<'simple' | 'journey'>('journey');
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    const { data } = await supabase
      .from('sessions')
      .select('*')
      .order('session_number');
    if (data) setSessions(data);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">دوره آموزشی</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">خروج</button>
      </div>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setMode('journey')} className={`px-4 py-2 rounded ${mode === 'journey' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Journey</button>
        <button onClick={() => setMode('simple')} className={`px-4 py-2 rounded ${mode === 'simple' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Simple</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sessions.map((session) => (
          <div key={session.id} className="border p-4 rounded shadow-sm cursor-pointer hover:shadow-md" onClick={() => navigate(`/session/${session.id}?mode=${mode}`)}>
            <h3 className="font-bold">جلسه {session.session_number}</h3>
            <p>{session.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;