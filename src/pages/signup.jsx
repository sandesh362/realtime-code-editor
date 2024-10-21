import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './signup.css'; // Importing CSS
import google from "./images/google.svg"

const Signup = () => {
    const navigate = useNavigate(); // Initialize navigate

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add signup logic (API calls etc.) here
        navigate('/home'); // On successful signup, navigate to the home page
    };

    return (
        <div className="signup-container">
            {/* Background Gradient Circles */}
            <div className="circle circle-1"></div>
            <div className="circle circle-2"></div>

            <div className="signup-wrapper">
                {/* Welcome Section */}
                <div className="welcome-section">
                    <h1>Join Us!</h1>
                    <button className="skip-button">Skip the wait?</button>
                </div>

                {/* Signup Form Section */}
                <div className="signup-box">
                    <h2>Signup</h2>
                    <p className="subtext">We're excited to have you!</p>

                    <form className="signup-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <input type="text" id="username" placeholder="Username" aria-label="Username" required />
                        </div>
                        <div className="form-group">
                            <input type="email" id="email" placeholder="Email / Phone" aria-label="Email" required />
                        </div>
                        <div className="form-group">
                            <input type="password" id="password" placeholder="Password" aria-label="Password" required />
                        </div>
                        <div className="form-group">
                            <input type="password" id="confirmPassword" placeholder="Confirm Password" aria-label="Confirm Password" required />
                        </div>

                        <button type="submit" className="signup-btn">Signup</button>
                    </form>

                    {/* OR Section */}
                    <div className="divider">
                        <span>Or</span>
                    </div>

                    {/* Social Signup */}
                    <div className="social-signup">
                        <a href="#"><img src={google} alt="Google" /></a>
                        <a href="#"><img src={'https://cdn-icons-png.freepik.com/512/2504/2504903.png'} alt="Facebook" /></a>
                        <a href="#"><img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg" alt="GitHub" /></a>
                    </div>

                    {/* Login Link */}
                    <div className="login-text">
                        <p>Already have an account? 
                            <button onClick={() => navigate('/')} className="login-button hover:text-[#8B5CF6] text-white duration-200">Login</button> {/* Navigate to '/' for login */}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
