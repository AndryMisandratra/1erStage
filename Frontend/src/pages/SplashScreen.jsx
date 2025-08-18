import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import "../styles/SplashScreen.css";
import logo1 from "../assets/logo1.jpeg";
import logo2 from "../assets/logo2.png";
import logo3 from "../assets/logo3.jpeg";
import background from "../assets/background.jpg";

const SplashScreen = () => {


    return (
        <div
            className="splash-container"
            style={{ backgroundImage: `url(${background})` }}
        >
            <div className="splash-logos">
                <img src={logo1} alt="Logo 1" />
                <img src={logo2} alt="Logo 2" />
                <img src={logo3} alt="Logo 3" />
            </div>
            <h1 className="splash-text">
                Bienvenue dans le systeme d'information et de gestion de congé et permission du personnel
                du Tribunal Financier d'Antananarivo
            </h1>
        </div>
    );
};

export default SplashScreen;
