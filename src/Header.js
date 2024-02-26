import React, { useContext } from 'react';
import { Button } from '@nextui-org/react';
import { WalletContext } from './WalletProvider';
import { Link } from 'react-router-dom';

const Header = () => {
  const { walletConnected, walletAddress, connectWallet, disconnectWallet } = useContext(WalletContext);

  const truncateAddress = (address) => address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : '';

  return (
    <div style={{ backgroundColor: 'black', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img src="logo.png" alt="logo" style={{ width: '50px', marginRight: '10px' }} />
        <h1 style={{ color: 'white', fontSize: '1.5em', margin: 0 }}>PREMIERE DAPP</h1>
        {/* Ajout des liens pour la navigation */}
        <Link to="/" style={linkStyle}>Home</Link>        
        <Link to="/components/Candidats" style={linkStyle}>Candidats</Link>
        <Link to="/components/Voter" style={linkStyle}>Voter</Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {walletConnected ? (
          <>
            <div style={{ color: 'white', marginRight: '10px' }}>
              {truncateAddress(walletAddress)}
            </div>
            <Button auto flat color="error" onClick={disconnectWallet} style={buttonStyle}>
              Disconnect Wallet
            </Button>
          </>
        ) : (
          <Button auto flat color="success" onClick={connectWallet} style={buttonStyle}>
            Connect Wallet
          </Button>
        )}
      </div>
    </div>
  );
};

const linkStyle = {
  color: 'white',
  marginLeft: '20px',
  textDecoration: 'none',
  backgroundColor: '#95a5a6',
  padding: '20px 60px',
  border: 'none',
  cursor: 'pointer',
  borderRadius: '40px'
};

const buttonStyle = {
  color: 'white',
  marginLeft: '20px',
  textDecoration: 'none',
  backgroundColor: '#95a5a6',
  padding: '20px 60px',
  border: 'none',
  cursor: 'pointer',
  borderRadius: '10px'
};

export default Header;