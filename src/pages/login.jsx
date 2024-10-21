import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './login.css'; // Importing CSS

const Login = () => {
    const navigate = useNavigate(); // Initialize navigate

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add login logic (API calls etc.) here
        navigate('/home'); // On successful login, navigate to the home page
    };

    return (
        <div className="login-container">
            {/* Background Gradient Circles */}
            <div className="circle circle-1"></div>
            <div className="circle circle-2"></div>

            <div className="login-wrapper">
                {/* Welcome Section */}
                <div className="welcome-section">
                    <h1>Welcome Back!</h1>
                    <button className="skip-button">Skip the lag?</button>
                </div>

                {/* Login Form Section */}
                <div className="login-box">
                    <h2>Login</h2>
                    <p className="subtext">Glad you're back!</p>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <input type="text" id="username" placeholder="Username" aria-label="Username" />
                        </div>
                        <div className="form-group">
                            <input type="password" id="password" placeholder="Password" aria-label="Password" />
                        </div>

                        <div className="form-footer">
                            <label className="remember-me">
                                <input type="checkbox" /> Remember me
                            </label>
                            <a href="#" className="forgot-link">Forgot password?</a>
                        </div>

                        <button type="submit" className="login-btn">Login</button>
                    </form>

                    {/* OR Section */}
                    <div className="divider">
                        <span>Or</span>
                    </div>

                    {/* Social Login */}
                    <div className="social-login">
                        <a href="#"><img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" /></a>
                        <a href="#"><img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png.svg" alt="Facebook" /></a>
                        <a href="#"><img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg" alt="GitHub" /></a>
                    </div>

                    {/* Sign Up Link */}
                    <div className="signup-text">
                        <p>Don't have an account? 
                            <button onClick={() => navigate('/signup')} className="signup-button">Signup</button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
