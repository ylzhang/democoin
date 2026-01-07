import React from 'react';
import { useWallet } from '../context/WalletContext';

const Navbar = () => {
  const { account, isConnected, connectWallet, disconnectWallet } = useWallet();

  // Navigation Links
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Mining', path: '/mining' },
    { name: 'Stable Pool', path: '/stable-pool' },
    { name: 'Collateral', path: '/collateral' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Docs', path: '/docs' },
  ];

  // Truncate Account Address
  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Name */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                DEMOCOIN
              </div>
            </div>
            
            {/* Navigation Links - Desktop */}
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.path}
                  href={link.path}
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Right Operations Area */}
          <div className="flex items-center">
            {/* Wallet Connect Button */}
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                  <span className="font-medium">{truncateAddress(account)}</span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="ml-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className="md:hidden">
        <div className="pt-2 pb-3 space-y-1 sm:px-2">
          {navLinks.map((link) => (
            <a
              key={link.path}
              href={link.path}
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:bg-gray-50 focus:border-gray-300 transition duration-150 ease-in-out"
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;