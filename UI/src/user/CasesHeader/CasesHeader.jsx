import React from 'react';
import './CasesHeader.css';

const HeroSection = () => {
    return (
        <section className="cases-hero">
            <div className="cases-overlay"></div>
            <div className="cases-content">
                <h1 className="title-animation">Support Those Who Need It Most</h1>
                <h2 className="subtitle-animation">Explore Our Active Cases</h2>

                <div className="description-animation">
                <p>Your help makes a difference. Select an available case and make an impact today!</p>
                </div>
            </div>
        </section>




    );
};

export default HeroSection;