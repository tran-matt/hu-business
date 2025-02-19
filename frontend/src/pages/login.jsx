import React, { useState } from 'react';
import { loginUser } from '../api';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        const { error } = await loginUser(email, password);
        if (error) {
            setError(error.message);
        } else {
            navigate('/dashboard'); 
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h2 className="text-2xl font-bold mb-4">Login</h2>
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleLogin} className="space-y-4 w-1/3">
                <input 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className="border p-2 w-full" 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    className="border p-2 w-full" 
                />
                <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">
                    Login
                </button>
            </form>

            {/* Registration Link */}
            <div className="mt-4">
                <p className="text-gray-600">
                    Don't have an account? 
                    <button 
                        onClick={() => navigate('/register')} 
                        className="text-blue-500 ml-1 hover:underline"
                    >
                        Sign up here.
                    </button>
                </p>
            </div>
        </div>
    );
}

export default Login;
