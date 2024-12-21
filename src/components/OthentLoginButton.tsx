import React, { useState, useEffect } from 'react';
import othent from '../wallets/Othent';

const OthentLoginButton: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated from cache
    const handleAuthState = async () => {
      try {
        const userDetails = await othent.getUserDetails();
        if (userDetails?.walletAddress) {
          setIsConnected(true);
          setWalletAddress(userDetails.walletAddress);
        }
      } catch (error) {
        console.error('Error checking authentication state:', error);
      }
    };

    handleAuthState();
  }, []);

  const handleLogin = async () => {
    try {
      const userDetails = await othent.connect();
      if (userDetails?.walletAddress) {
        setIsConnected(true);
        setWalletAddress(userDetails.walletAddress);
        console.log('User logged in:', userDetails);
        console.log('Ot:', othent.getPermissions());
        
      } else {
        console.log('Login canceled or failed.');
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await othent.disconnect(); // Call the Othent SDK logout method to fully disconnect
      setIsConnected(false);
      setWalletAddress(null);
      setShowDropdown(false);
      console.log('User fully disconnected');
    } catch (error) {
      console.error('Error during disconnection:', error);
    }
  };

  const formatWalletAddress = (address: string) =>
    `${address.slice(0, 3)}...${address.slice(-3)}`;

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center space-x-2">
        {walletAddress && (
          <span className="text-white text-sm">
            {formatWalletAddress(walletAddress)}
          </span>
        )}
        <button
          onClick={() => (isConnected ? setShowDropdown(!showDropdown) : handleLogin())}
          className={`px-4 py-2 bg-blue-600 text-white rounded-lg ${
            isConnected ? 'bg-green-500' : 'hover:bg-blue-700'
          }`}
        >
          {isConnected ? 'Connected' : 'Log in with Othent'}
        </button>
      </div>

      {showDropdown && isConnected && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10"
          role="menu"
        >
          <button
            onClick={handleDisconnect}
            className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
            role="menuitem"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default OthentLoginButton;
