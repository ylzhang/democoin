import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../context/WalletContext';
import DEMOCOIN_ABI from '../abi/DEMOCOIN.json';
import HASH_PROOF_ABI from '../abi/HashProof.json';

// Contract addresses (testnet)
// Note: These are test addresses, replace after actual deployment
const DEMOCOIN_ADDRESS = '0x0000000000000000000000000000000000000000';
const HASH_PROOF_ADDRESS = '0x0000000000000000000000000000000000000000';

const useContract = () => {
  const { provider, signer, isConnected } = useWallet();
  const [demoCoinContract, setDemoCoinContract] = useState(null);
  const [hashProofContract, setHashProofContract] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize contract instances
  useEffect(() => {
    const initContracts = async () => {
      try {
        setError(null);
        setIsLoading(true);

        if (provider) {
          // Create contract instance (read-only)
          const demoCoinReadonly = new ethers.Contract(
            DEMOCOIN_ADDRESS,
            DEMOCOIN_ABI.abi,
            provider
          );

          const hashProofReadonly = new ethers.Contract(
            HASH_PROOF_ADDRESS,
            HASH_PROOF_ABI.abi,
            provider
          );

          // If wallet is connected, create writable contract instance
          if (isConnected && signer) {
            const demoCoinWritable = demoCoinReadonly.connect(signer);
            const hashProofWritable = hashProofReadonly.connect(signer);

            setDemoCoinContract(demoCoinWritable);
            setHashProofContract(hashProofWritable);
          } else {
            setDemoCoinContract(demoCoinReadonly);
            setHashProofContract(hashProofReadonly);
          }
        }
      } catch (err) {
        setError('Failed to initialize contracts: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    initContracts();
  }, [provider, signer, isConnected]);

  // Contract method wrappers
  const contractMethods = {
    // DEMOCOIN contract methods
    demoCoin: {
      // Read methods
      getCurrentPrice: async () => {
        if (!demoCoinContract) return null;
        try {
          return await demoCoinContract.getCurrentPrice();
        } catch (err) {
          setError('Failed to get price: ' + err.message);
          return null;
        }
      },
      getTotalSupply: async () => {
        if (!demoCoinContract) return null;
        try {
          return await demoCoinContract.totalSupply();
        } catch (err) {
          setError('Failed to get total supply: ' + err.message);
          return null;
        }
      },
      getStablePoolAPY: async () => {
        if (!demoCoinContract) return null;
        try {
          return await demoCoinContract.stablePoolAPY();
        } catch (err) {
          setError('Failed to get stable pool APY: ' + err.message);
          return null;
        }
      },
      getUserStablePoolBalance: async (userAddress) => {
        if (!demoCoinContract) return null;
        try {
          return await demoCoinContract.getStablePoolBalance(userAddress);
        } catch (err) {
          setError('Failed to get stable pool balance: ' + err.message);
          return null;
        }
      },
      getCollateralRatio: async () => {
        if (!demoCoinContract) return null;
        try {
          return await demoCoinContract.getCollateralRatio();
        } catch (err) {
          setError('Failed to get collateral ratio: ' + err.message);
          return null;
        }
      },
      isEmergencyMode: async () => {
        if (!demoCoinContract) return null;
        try {
          return await demoCoinContract.isEmergencyMode();
        } catch (err) {
          setError('Failed to check emergency mode: ' + err.message);
          return null;
        }
      },
      calculateMiningReward: async (minerAddress) => {
        if (!demoCoinContract) return null;
        try {
          return await demoCoinContract.calculateMiningReward(minerAddress);
        } catch (err) {
          setError('Failed to calculate mining reward: ' + err.message);
          return null;
        }
      },
      
      // Write methods
      depositToStablePool: async (amount) => {
        if (!demoCoinContract) return null;
        try {
          const tx = await demoCoinContract.depositToStablePool(amount);
          return tx.wait();
        } catch (err) {
          setError('Failed to deposit to stable pool: ' + err.message);
          throw err;
        }
      },
      withdrawFromStablePool: async (shares) => {
        if (!demoCoinContract) return null;
        try {
          const tx = await demoCoinContract.withdrawFromStablePool(shares);
          return tx.wait();
        } catch (err) {
          setError('Failed to withdraw from stable pool: ' + err.message);
          throw err;
        }
      },
      claimMiningReward: async () => {
        if (!demoCoinContract) return null;
        try {
          const tx = await demoCoinContract.claimMiningReward();
          return tx.wait();
        } catch (err) {
          setError('Failed to claim mining reward: ' + err.message);
          throw err;
        }
      },
      depositCollateral: async (amount) => {
        if (!demoCoinContract) return null;
        try {
          const tx = await demoCoinContract.depositCollateral(amount);
          return tx.wait();
        } catch (err) {
          setError('Failed to deposit collateral: ' + err.message);
          throw err;
        }
      },
      withdrawCollateral: async (shares) => {
        if (!demoCoinContract) return null;
        try {
          const tx = await demoCoinContract.withdrawCollateral(shares);
          return tx.wait();
        } catch (err) {
          setError('Failed to withdraw collateral: ' + err.message);
          throw err;
        }
      },
    },

    // HashProof contract methods
    hashProof: {
      // Read methods
      totalHashPower: async (minerAddress) => {
        if (!hashProofContract) return null;
        try {
          return await hashProofContract.totalHashPower(minerAddress);
        } catch (err) {
          setError('Failed to get total hash power: ' + err.message);
          return null;
        }
      },
      lastRewardTime: async (minerAddress) => {
        if (!hashProofContract) return null;
        try {
          return await hashProofContract.lastRewardTime(minerAddress);
        } catch (err) {
          setError('Failed to get last reward time: ' + err.message);
          return null;
        }
      },
      difficulty: async () => {
        if (!hashProofContract) return null;
        try {
          return await hashProofContract.difficulty();
        } catch (err) {
          setError('Failed to get difficulty: ' + err.message);
          return null;
        }
      },
      
      // Write methods
      submitHashPower: async (proof) => {
        if (!hashProofContract) return null;
        try {
          const tx = await hashProofContract.submitHashPower(proof);
          return tx.wait();
        } catch (err) {
          setError('Failed to submit hash power: ' + err.message);
          throw err;
        }
      },
    },
  };

  return {
    demoCoinContract,
    hashProofContract,
    isLoading,
    error,
    ...contractMethods,
  };
};

export default useContract;