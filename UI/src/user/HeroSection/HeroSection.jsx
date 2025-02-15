import React from 'react';
import './HeroSection.css';

const HeroSection = () => {
    return (
        <div className="hero-container">
        <section className="hero">
            <div className="hero-overlay"></div>
            <div className="hero-content">
                <h1 className="title-animation">Together We Can</h1>
                <h2 className="subtitle-animation">Build a Box of Essentials</h2>
                <p className="description-animation">
                    Create a box filled with essential items like food, clothes, and supplies, and help us deliver hope to those in need.
                </p>
                <button className="cta-button">Start Filling Your Box</button>
            </div>
        </section>
        </div>
    );
};

export default HeroSection;