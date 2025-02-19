import React, { useState } from 'react';
import { registerUser } from '../api';
import { useNavigate } from 'react-router-dom';

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [gradYear, setGradYear] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);

        const {error } = await registerUser(email, password, firstName, lastName, gradYear);
        if (error) {
            setError(error.message);
        } else {
            navigate('/dashboard'); // Redirect to dashboard after successful registration
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h2 className="text-2xl font-bold mb-4">Register</h2>
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleRegister} className="space-y-4 w-1/3">
                <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="border p-2 w-full" />
                <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="border p-2 w-full" />
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="border p-2 w-full" />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="border p-2 w-full" />
                <input type="text" placeholder="Anticipated Graduation Year" value={gradYear} onChange={(e) => setGradYear(e.target.value)} required className="border p-2 w-full" />
                <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">Register</button>
            </form>
        </div>
    );
}

export default Register;
