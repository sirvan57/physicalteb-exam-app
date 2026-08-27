import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signUp(username, password, firstName, lastName);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl mb-4">ثبت‌نام</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <input type="text" placeholder="نام" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full p-2 mb-2 border rounded" required />
        <input type="text" placeholder="نام خانوادگی" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full p-2 mb-2 border rounded" required />
        <input type="text" placeholder="نام کاربری" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-2 mb-2 border rounded" required />
        <input type="password" placeholder="رمز عبور" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 mb-4 border rounded" required />
        <button type="submit" className="w-full bg-green-500 text-white p-2 rounded">ثبت‌نام</button>
        <p className="mt-4 text-center">
          حساب دارید؟ <Link to="/login" className="text-blue-500">ورود</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;