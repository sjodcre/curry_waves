import React, { useState } from 'react';
import { useArweaveProvider, WalletEnum } from '../context/ArweaveProvider';

const WalletConnection: React.FC = () => {
  const {
    wallet,
    walletAddress,
    walletType,
    handleConnect,
    handleDisconnect,
    setWalletModalVisible,
  } = useArweaveProvider();

  const [showDropdown, setShowDropdown] = useState(false);

  const connectWallet = (walletType: WalletEnum) => {
    handleConnect(walletType);
    setShowDropdown(false);
  };

  const disconnectWallet = () => {
    handleDisconnect();
  };

  return (
    <div className="relative">
      {walletAddress ? (
        <div className="text-center text-white">
          <p>
            Connected to {walletType} wallet:
            <span className="font-bold"> {walletAddress}</span>
          </p>
          <button
            onClick={disconnectWallet}
            className="px-4 py-2 mt-2 bg-black text-white border border-white rounded-lg hover:bg-gray-900"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="px-4 py-2 bg-black text-white border border-white rounded-lg hover:bg-gray-900"
          >
            Connect
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-black border border-white ring-1 ring-white ring-opacity-5">
              <div className="py-1">
                <button
                  onClick={() => connectWallet(WalletEnum.arConnect)}
                  className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-900"
                >
                  Connect ArConnect
                </button>
                <button
                  onClick={() => connectWallet(WalletEnum.othent)}
                  className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-900"
                >
                  Connect Othent
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletConnection;
