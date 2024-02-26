// Candidats.js
import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import Candidat1 from './candidats/Candidat1';
import Candidat2 from './candidats/Candidat2';

const Candidats = () => {
  const candidatContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    paddingTop: '50px',
  };

  const candidatStyle = {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    width: '400px',
    marginBottom: '20px',
    border: '1px solid #ddd',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  };

  const imageStyle = {
    borderRadius: '50%',
    width: '200px',
    height: 'auto',
    marginBottom: '10px',
  };

  const nameStyle = {
    fontWeight: 'bold',
    fontSize: '24px',
    margin: '0',
  };

  return (
    <div>
      <Routes>
        <Route path="/components/candidats/Candidat1" element={<Candidat1 />} />
        <Route path="/components/candidats/Candidat2" element={<Candidat2 />} />
      </Routes>
      <div style={candidatContainerStyle}>
        <div>
          {/* Utilisez les liens pour rendre les images cliquables */}
          <Link to="/components/candidats/Candidat1" style={{ textDecoration: 'none', color: 'black' }}>
            <div style={candidatStyle}>
              <img src="/homme.webp" alt="Candidat1" style={imageStyle} />
              <p style={nameStyle}>Candidat 1</p>
              <p style={{ textAlign: 'center' }}>Cliquez pour en savoir plus</p>
            </div>
          </Link>
          <Link to="/components/candidats/Candidat2" style={{ textDecoration: 'none', color: 'black' }}>
            <div style={candidatStyle}>
              <img src="/femme.webp" alt="Candidat2" style={imageStyle} />
              <p style={nameStyle}>Candidat 2</p>
              <p style={{ textAlign: 'center' }}>Cliquez pour en savoir plus</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Candidats;
