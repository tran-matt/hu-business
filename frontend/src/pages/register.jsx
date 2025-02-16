import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import { supabase } from '../supabaseClient'; // Import supabase client

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    predictedGraduationYear: '', // New field for predicted graduation year
  });

  const navigate = useNavigate(); // Initialize navigate function
  const currentYear = new Date().getFullYear();  // Get the current year
  const years = [];  // Array to store valid years

  // Generate years from the current year to 10 years in advance
  for (let i = currentYear; i <= currentYear + 10; i++) {
    years.push(i);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Email validation (basic format check)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      console.error('Invalid email format');
      alert('Invalid email format');
      return; // Return early if email is invalid
    }
  
    // Password validation (minimum length and other criteria)
    const password = formData.password;
    const passwordMinLength = 6;
    const passwordRequirementsMessage = [];
  
    if (password.length < passwordMinLength) {
      passwordRequirementsMessage.push(`Password must be at least ${passwordMinLength} characters long.`);
    }
    if (!/[A-Z]/.test(password)) {
      passwordRequirementsMessage.push('Password must contain at least one uppercase letter.');
    }
    if (!/[a-z]/.test(password)) {
      passwordRequirementsMessage.push('Password must contain at least one lowercase letter.');
    }
    if (!/[0-9]/.test(password)) {
      passwordRequirementsMessage.push('Password must contain at least one number.');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      passwordRequirementsMessage.push('Password must contain at least one special character.');
    }
  
    // If any password requirements are not met, display an error
    if (passwordRequirementsMessage.length > 0) {
      alert(passwordRequirementsMessage.join('\n'));
      return; // Return early to prevent form submission
    }
  
    try {
      // Register the user with Supabase
      const { user, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });
  
      // Log the full response object for debugging
      console.log('Supabase sign-up response:', { user, error });
  
      if (error) {
        console.error('Error during registration:', error.message);
        alert(error.message);  // Display error message to the user
        return;
      }
  
      // Check if user is returned successfully
      if (!user) {
        console.error('No user object returned.');
        alert('Something went wrong. Please try again later.');
        return;
      }
  
      console.log('User registered:', user);
  
      // Immediately sign-in after sign-up to verify session
      const { session, error: sessionError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (sessionError) {
        console.error('Error signing in after sign-up:', sessionError.message);
        alert(sessionError.message);
        return;
      }

      console.log('User signed in after sign-up:', session);

      // Optionally store predictedGraduationYear in the database
      const { data, updateError } = await supabase
        .from('students')
        .upsert({
          id: user.id,  // Ensure correct user ID is passed
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          anticipated_graduation_year: formData.predictedGraduationYear,
        });
  
      if (updateError) {
        console.error("Error saving student data:", updateError.message);
        alert("Error saving student data");
        return;
      }
  
      console.log('Student data updated:', data);
  
      // Redirect to the dashboard after successful registration
      navigate('/dashboard'); // Redirect to the dashboard page
  
    } catch (error) {
      console.error('Error during registration:', error.message);
      alert(error.message);  // Display error message to the user
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-center text-3xl font-bold">Register</h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-w-sm mx-auto">
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="First Name"
          className="w-full p-2 border border-gray-300 rounded"
          autoComplete="given-name"
        />
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Last Name"
          className="w-full p-2 border border-gray-300 rounded"
          autoComplete="family-name"
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full p-2 border border-gray-300 rounded"
          autoComplete="email"
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          className="w-full p-2 border border-gray-300 rounded"
          autoComplete="new-password"
        />
        
        {/* Predicted Graduation Year Dropdown */}
        <div className="mb-4">
          <label htmlFor="predictedGraduationYear" className="block text-sm font-medium text-gray-700">
            Predicted Graduation Year
          </label>
          <select
            id="predictedGraduationYear"
            name="predictedGraduationYear"
            value={formData.predictedGraduationYear}
            onChange={handleChange}
            className="mt-1 p-2 border border-gray-300 rounded w-full"
          >
            <option value="">Select a year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;
