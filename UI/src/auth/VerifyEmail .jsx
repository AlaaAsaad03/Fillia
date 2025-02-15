// VerifyEmail.js
import React, { useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const VerifyEmail = ({ url }) => {
    const { token } = useParams(); // Get the token from the URL

    useEffect(() => {
        const verifyEmail = async () => {
            if (token) {
                try {
                    const response = await axios.get(`${url}/api/user/verify/${token}`);
                    if (response.data.success) {
                        alert(response.data.message); // Notify user of success
                    } else {
                        alert(response.data.message); // Notify user of failure
                    }
                } catch (error) {
                    console.error("Error verifying email:", error);
                    alert("An error occurred during verification.");
                }
            }
        };

        verifyEmail(); // Call the function to verify email
    }, [token, url]);

    return (
        <div>            <h2>Email Verification</h2>
            <p>Please wait while we verify your email...</p>
        </div>
    );
};

export default VerifyEmail;