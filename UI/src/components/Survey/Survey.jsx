import React, { useState, useEffect } from 'react';
import './Survey.css';
import '../../user/Navbar/Navbar.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Navbar = ({ setShowLogin, setSearchTerm }) => {
    const [menu, setMenu] = useState("menu");
    const navigate = useNavigate();

    return (
        <div className='navbar-container'>
            <Link to='/'><img src='NewLogo.png' alt="" className="logo" /></Link>
            <ul className="navbar-menuu">
                <Link to='/' onClick={() => setMenu("home")} className={menu === "home" ? "active" : ""}>home</Link>
                <Link to='/items' onClick={() => setMenu("items")} className={menu === "items" ? "active" : ""}>items</Link>
                <Link to='/cases'>cases</Link>
                <a onClick={() => document.getElementById('footer').scrollIntoView({ behavior: 'smooth' })} className={menu === "contact-us" ? "active" : ""}> contact us </a>
            </ul>
            <div className="navbar-right"></div>
        </div>
    );
};

const Survey = () => {
    const [cases, setCases] = useState([]);
    const [selectedCases, setSelectedCases] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();
    let userId = null;
    let userRole = "";
    const token = localStorage.getItem("token");

    if (token) {
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            userId = payload.id;
            userRole = payload.role;

            if (!userId) {
                console.error("user ID is missing from the token.");
            }
        } catch (error) {
            console.error("Invalid token format:", error);
        }
    }

    useEffect(() => {
        const fetchCases = async () => {
            const response = await axios.get('http://localhost:4000/api/cases/filter');
            setCases(response.data.cases);
        };
        fetchCases();
    }, []);

    const handleCaseSelect = (caseId) => {
        if (selectedCases.includes(caseId)) {
            setSelectedCases(selectedCases.filter(id => id !== caseId));
        } else if (selectedCases.length < 3) {
            setSelectedCases([...selectedCases, caseId]);
        }
    };

    const handleSubmit = async () => {
        if (selectedCases.length < 3) {
            setErrorMessage('Please select exactly 3 cases before submitting.');
            return;
        }

        setErrorMessage('');

        try {
            const response = await axios.post('http://localhost:4000/api/cases/save-temporary-history', {
                userId: userId,
                caseIds: selectedCases,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            setSubmitted(true);
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (error) {
            if (error.response) {
                setErrorMessage(error.response.data.message || 'Failed to save temporary history. Please try again.');
            } else {
                setErrorMessage('Failed to save temporary history. Please try again.');
            }
        }
    };

    return (
        <div className="creative-survey-container">
            <header className="creative-survey-header">
                <h1 className="creative-survey-title">Your Impact Starts Here!</h1>
                <p className="creative-survey-description">
                    Select 3 cases that speak to your heart. Together, we can create change.
                </p>
                <p className="creative-survey-info">{selectedCases.length} of 3 cases selected</p>
            </header>

            <div className="creative-survey-case-list">
                {cases.map(caseItem => (
                    <div
                        key={caseItem._id}
                        className={`creative-survey-case-card ${
                            selectedCases.includes(caseItem._id) ? 'selected' : ''
                        }`}
                        onClick={() => handleCaseSelect(caseItem._id)}
                    >
                        <h3 className="creative-survey-case-title">{caseItem.title}</h3>
                        <p className="creative-survey-case-description">{caseItem.description}</p>
                        <div className="creative-survey-case-items">
                            <h4 className="creative-survey-items-header">Items Needed:</h4>
                            <ul className="creative-survey-items-list">
                                {caseItem.itemsNeeded.map((item, index) => (
                                    <li key={index} className="creative-survey-case-item">
                                        • {item.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>

            {errorMessage && <p className="creative-survey-error-message">{errorMessage}</p>}
            {submitted && <p className="creative-survey-thank-you-message">Thank you for your submission!</p>}

            <button className="creative-survey-submit-button" onClick={handleSubmit}>
                Submit Your Choices
            </button>
        </div>
    );
};

export default Survey;