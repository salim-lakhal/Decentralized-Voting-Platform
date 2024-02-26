// Candidat2.jsx
import React from 'react';
import '../candidatStyles.css';

const Candidat2 = () => {
  const handleVoteClick = () => {
    return null; // Placeholder function, does nothing
  };

  return (
    <div className="candidat-container">
      <img src="/femme.webp" alt="Candidat 2" className="candidat-image" />
      <p className="candidat-title"> Candidat 2</p>
      <p className="candidat-text">
        "Ma candidature repose sur l'idée que la diversité est notre plus grande force. Je m'efforcerai de créer un environnement où chaque voix compte, où les idées novatrices sont encouragées et où la transparence prévaut. Ensemble, nous pouvons construire un avenir prometteur pour tous"
      </p>
      <button className="vote-button" onClick={handleVoteClick} style={buttonStyle}>Voter pour Candidat 2</button>
    </div>
  );
};
const buttonStyle = {
  backgroundColor: '#95a5a6',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '40px',
  cursor: 'pointer',
};

export default Candidat2;
