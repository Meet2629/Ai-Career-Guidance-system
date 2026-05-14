import React, { useState } from 'react';
import './AuthForm.css';
import { FaUser, FaLock, FaGoogle, FaFacebookF, FaLinkedinIn } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password, confirmPassword } = formData;

    if (isSignUp) {
      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      try {
        const res = await axios.post('http://localhost:3000/api/auth/register', {
          name,
          email,
          password
        });
        alert(res.data.message || "Registered successfully!");
        setIsSignUp(false);
      } catch (err) {
        alert(err.response?.data?.message || "Registration failed!");
      }
    } else {
      try {
        const res = await axios.post('http://localhost:3000/api/auth/login', {
          email,
          password
        });
        localStorage.setItem('token', res.data.token || 'logged_in'); // save login state
        alert(res.data.message || "Logged in successfully!");
        navigate('/');  // redirect to home
      } catch (err) {
        alert(err.response?.data?.message || "Login failed!");
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="left-panel">
          <h2>Hello, Welcome!</h2>
          <p>Don't have an account?</p>
          <button onClick={() => setIsSignUp(true)}>Register</button>
        </div>

        <div className="right-panel">
          <h2>{isSignUp ? 'Register' : 'Login'}</h2>
          <form onSubmit={handleSubmit}>
            {isSignUp && (
              <div className="input-box">
                <FaUser />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            <div className="input-box">
              <FaUser />
              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-box">
              <FaLock />
              <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
                required
              />
            </div>
            {isSignUp && (
              <div className="input-box">
                <FaLock />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {!isSignUp && <a href="#" className="forgot-link">Forgot Password?</a>}

            <button type="submit" className="submit-btn">
              {isSignUp ? 'Register' : 'Login'}
            </button>

            <p className="social-text">or login with social platforms</p>
            <div className="social-icons">
              <FaGoogle />
              <FaFacebookF />
              <FaLinkedinIn />
            </div>

            {isSignUp && (
              <p className="toggle-msg">
                Already have an account?{' '}
                <span onClick={() => setIsSignUp(false)}>Login here</span>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;