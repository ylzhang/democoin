import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import useContract from '../hooks/useContract';

const Dashboard = () => {
  const { account, isConnected } = useWallet();
  const { demoCoin } = useContract();
  
  // State Management
  const [price, setPrice] = useState(null);
  const [totalSupply, setTotalSupply] = useState(null);
  const [stablePoolAPY, setStablePoolAPY] = useState(null);
  const [collateralRatio, setCollateralRatio] = useState(null);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [userBalance, setUserBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get protocol data
        const [currentPrice, supply, apy, ratio, emergency] = await Promise.all([
          demoCoin.getCurrentPrice(),
          demoCoin.getTotalSupply(),
          demoCoin.getStablePoolAPY(),
          demoCoin.getCollateralRatio(),
          demoCoin.isEmergencyMode(),
        ]);
        
        setPrice(currentPrice);
        setTotalSupply(supply);
        setStablePoolAPY(apy);
        setCollateralRatio(ratio);
        setEmergencyMode(emergency);
        
        // If wallet is connected, get user data
        if (isConnected && account) {
          // User balance logic should be added here
          // const balance = await demoCoin.getUserBalance(account);
          // setUserBalance(balance);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Set data refresh interval (5 seconds)
    const interval = setInterval(fetchData, 5000);
    
    return () => clearInterval(interval);
  }, [demoCoin, isConnected, account]);

  // Format numbers
  const formatNumber = (num) => {
    if (num === null || num === undefined) return 'Loading...';
    return num.toLocaleString();
  };

  // Format Ethereum numbers
  const formatEth = (num) => {
    if (num === null || num === undefined) return 'Loading...';
    return parseFloat(num.toString()) / 1e18;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-8">DEMOCOIN Dashboard</h1>
      
      {/* Emergency Mode Banner */}
      {emergencyMode && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Emergency Mode Activated</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>The protocol is currently in emergency mode. Please proceed with caution.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Price Card */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Current Price</h2>
            <div className="flex items-baseline">
              <span className="text-5xl font-bold text-white">${formatEth(price)?.toFixed(2)}</span>
              <span className="ml-2 text-xl text-blue-200">DEMO/USD</span>
            </div>
            <div className="mt-2 text-sm text-blue-200">
              <span className="font-medium">Target Price: $1.00 USD</span>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3">
              <div className="text-sm text-blue-100">24h Change</div>
              <div className="text-2xl font-bold text-white">+0.5%</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Supply */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">Total Supply</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {formatNumber(formatEth(totalSupply))?.toLocaleString()} DEMO
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Stable Pool APY */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">Stable Pool APY</div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                {stablePoolAPY?.toString()}%
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Collateral Ratio */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">Collateral Ratio</div>
              <div className="text-2xl font-bold text-purple-600 mt-1">
                {collateralRatio?.toString()}%
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* TVL */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">Total Value Locked (TVL)</div>
              <div className="text-2xl font-bold text-orange-600 mt-1">
                $0.00
              </div>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* User Overview */}
      {isConnected && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">My Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">My Balance</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                0.00 DEMO
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">Stable Pool Balance</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                0.00 DEMO
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-500">Pending Rewards</div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                0.00 DEMO
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Deposit to Stable Pool
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
              Claim Rewards
            </button>
            <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
              View Details
            </button>
          </div>
        </div>
      )}
      
      {/* Quick Start */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Start</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Start Mining</h4>
              <div className="bg-yellow-100 p-2 rounded-full">
                <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">Submit hash proofs to earn DEMO rewards.</p>
            <a href="/mining" className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium">
              Go to Mining
              <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Deposit to Stable Pool</h4>
              <div className="bg-green-100 p-2 rounded-full">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">Provide liquidity and earn stable returns.</p>
            <a href="/stable-pool" className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium">
              Go to Stable Pool
              <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Deposit Collateral</h4>
              <div className="bg-purple-100 p-2 rounded-full">
                <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">Increase protocol stability and earn rewards.</p>
            <a href="/collateral" className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium">
              Go to Collateral
              <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;