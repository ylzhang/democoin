# DEMOCOIN - Hashpower-Driven Algorithmic Stablecoin

DEMOCOIN is an Ethereum-based algorithmic stablecoin driven by hashpower, designed to achieve price stability through an innovative economic model and proof-of-work mechanism. The system combines hash-based proof-of-work mining with algorithmic price stabilization to create a robust stablecoin ecosystem.

## Language Switch

- [English](README.md) | [简体中文](docs/README.zh-CN.md) | [繁體中文](docs/README.zh-TW.md) | [日本語](docs/README.ja.md)

## Table of Contents

1. [Project Overview](#project-overview)
2. [Core Design Philosophy](#core-design-philosophy)
3. [Technical Architecture](#technical-architecture)
4. [Getting Started](#getting-started)
5. [User Guide](#user-guide)
6. [Development Guide](#development-guide)
7. [Security Considerations](#security-considerations)
8. [Contributing](#contributing)
9. [License](#license)

## Project Overview

### What is DEMOCOIN?

DEMOCOIN is a hashpower-driven algorithmic stablecoin that combines:
- Hash-based proof-of-work mining mechanism
- Algorithmic price stabilization
- Hybrid stabilization model (algorithmic + collateral)
- Stable pool for liquidity provision
- Emergency protection mechanisms

### Key Features

- **Hashpower Proof Mechanism**: Validates miner contributions through cryptographic puzzles
- **Algorithmic Stabilization**: Dynamic price adjustment based on supply and demand
- **Stable Pool**: Users can deposit tokens to provide liquidity and earn rewards
- **Collateral System**: 150% over-collateralization for enhanced stability
- **Emergency Mode**: Automatic activation during extreme volatility
- **Governance**: Role-based access control for parameter management

## Core Design Philosophy

### 1. Hashpower Proof Mechanism
- Hash-based Proof of Work (PoW) system
- Adjustable difficulty parameter for fair hashpower validation
- Transparent hashpower contribution recording and reward mechanism

### 2. Algorithmic Stabilization Mechanism
- Supply-demand balance adjustment: Dynamic price adjustment based on token supply and stable pool demand
- Stable pool: Absorbs market volatility and provides liquidity support
- Price adjustment algorithm: Gradual adjustment based on supply/demand ratio

### 3. Economic Model
- Token issuance proportional to hashpower contribution
- Stable pool reward mechanism
- Linked mechanism between price adjustment and reward distribution

## Technical Architecture

### Smart Contracts

#### HashProof.sol
**Purpose**: Validates miner-submitted hash proofs and records hashpower contributions.

**Key Features**:
- Hash-based proof-of-work verification
- Adjustable difficulty parameter
- Automatic difficulty adjustment based on network hashrate
- Proof cooldown to prevent spam
- Access control for critical functions

**Core Functions**:
- `verifyProof()`: Validates miner-submitted hash proofs
- `submitHashPower()`: Records valid hashpower contributions
- `calculateHashPower()`: Calculates hashpower based on difficulty and solution quality
- `adjustDifficulty()`: Automatically adjusts difficulty based on proof rate

#### DEMOCOIN.sol
**Purpose**: Core stablecoin contract implementing ERC20 functionality, mining rewards, and stabilization mechanisms.

**Key Features**:
- ERC20 token implementation with transaction fees
- Hashpower-based mining rewards
- Hybrid stabilization model (algorithmic + collateral)
- Stable pool for liquidity provision
- Insurance fund, development fund, and marketing fund for fee distribution
- Emergency mode functionality
- Role-based access control for governance

**Core Functions**:
- `mint()`: Mints new tokens (admin only)
- `claimMiningReward()`: Distributes rewards to miners based on hashpower
- `depositToStablePool()`: Allows users to deposit tokens to the stable pool
- `withdrawFromStablePool()`: Allows users to withdraw from the stable pool
- `depositCollateral()`: Allows users to deposit collateral
- `withdrawCollateral()`: Allows users to withdraw collateral
- `updatePrice()`: Updates token price based on supply-demand ratio
- `setEmergencyMode()`: Activates/deactivates emergency mode (admin only)
- `collectFees()`: Collects and distributes fees to funds
- `getTotalSupply()`: Returns total token supply
- `getStablePoolAPY()`: Returns current stable pool APY
- `isEmergencyMode()`: Checks if emergency mode is active
- `calculateMaxBorrowable()`: Calculates maximum borrowable amount based on collateral

### Development Framework

- **Ethereum**: Mature public blockchain platform
- **Solidity**: Smart contract programming language (v0.8.24)
- **Hardhat**: Development, testing, and deployment framework (v3.1.2)
- **OpenZeppelin**: Secure smart contract library (v5.4.0)
- **React**: Frontend framework
- **Vite**: Frontend build tool
- **TailwindCSS**: CSS framework
- **Ethers.js**: Web3 library for contract interaction

### Project Structure

```
democoin/
├── contracts/              # Smart contract files
│   ├── HashProof.sol       # Hash proof-of-work contract
│   └── DEMOCOIN.sol        # Core stablecoin contract
├── test/                   # Test files
│   └── DEMOCOIN.test.js    # Contract test cases
├── scripts/                # Deployment and management scripts
│   └── deploy.cjs          # Contract deployment script
├── frontend/               # Frontend application
│   ├── src/                # Frontend source code
│   │   ├── abi/            # Contract ABIs
│   │   ├── components/     # React components
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # React pages
│   │   └── main.jsx        # Frontend entry point
│   ├── package.json        # Frontend dependencies
│   ├── vite.config.js      # Vite configuration
│   └── tailwind.config.js  # TailwindCSS configuration
├── hardhat.config.js       # Hardhat configuration
├── package.json            # Project dependencies
├── .env.example            # Environment variables example
└── README.md               # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Git for version control
- MetaMask browser extension (for frontend testing)
- Basic understanding of Ethereum, Solidity, and React

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/democoin.git
cd democoin
```

2. Install backend dependencies:
```bash
# Install root dependencies (for smart contracts)
npm install --legacy-peer-deps
```

3. Compile contracts:
```bash
npx hardhat compile
```

4. Run tests:
```bash
npx hardhat test
```

5. Install frontend dependencies:
```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install --legacy-peer-deps

# Return to project root
cd ..
```

### Local Development

#### Start Local Blockchain

```bash
# Start a local Hardhat network
npx hardhat node
```

#### Deploy Contracts to Local Network

```bash
# In a new terminal, deploy contracts to local network
npx hardhat run scripts/deploy.cjs --network localhost
```

#### Start Frontend Development Server

```bash
# Navigate to frontend directory
cd frontend

# Start the Vite development server
npm run dev

# The frontend will be available at http://localhost:5173
```

### Deployment

#### Testnet (e.g., Sepolia)

**Required Configuration Elements:**

| Element | Description | Example |
|------|------|------|
| `SEPOLIA_RPC_URL` | Sepolia testnet RPC endpoint | `https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY` |
| `PRIVATE_KEY` | Ethereum private key for deployment (64-character hex string) | `0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef` |
| `ETHERSCAN_API_KEY` | Etherscan API key for contract verification | `ABCDEFGHIJKLMNOPQRSTUVWXYZ123456` |

**Operation Guide:**

1. **Configure environment variables**: 
   ```bash
   # Copy template file
   cp .env.example .env
   
   # Edit .env file to add your configurations
   # Use a text editor like vim or nano
   vim .env
   ```

2. **Deploy to Sepolia testnet**: 
   ```bash
   npx hardhat run scripts/deploy.cjs --network sepolia
   ```

3. **Update frontend contract addresses**: 
   - Copy the deployed contract addresses from the deployment output
   - Edit `frontend/src/hooks/useContract.jsx` to update the contract addresses

4. **Build frontend for production**: 
   ```bash
   cd frontend
   npm run build
   ```

**Notes:**
- Never commit .env files containing real private keys to version control
- Contract deployment requires testnet ETH, ensure sufficient balance in the account
- It is recommended to test deployment scripts on local network before deployment
- Always verify contracts on Etherscan after deployment for transparency

## User Guide

### Mining Guide

#### Overview

DEMOCOIN uses a hash-based proof-of-work (PoW) mechanism. Miners generate valid hash proofs by solving cryptographic puzzles, and are rewarded with DEMO tokens based on their hashpower contribution.

#### Step 1: Get MINER_ROLE

To mine DEMO, you need to be granted the MINER_ROLE by the contract admin. Contact the DEMOCOIN team to request this role.

#### Step 2: Generate Hash Proofs

1. Obtain a challenge from the network
2. Generate a random nonce
3. Compute the hash of the challenge and nonce
4. Check if the hash meets the difficulty requirement
5. Repeat until you find a valid solution

**Example Proof Generation Code (JavaScript)**:

```javascript
const { ethers } = require('ethers');

async function generateProof(challenge, difficulty) {
    let nonce = 0;
    let solution;
    const target = BigInt(2) ** (256n - BigInt(difficulty));
    
    do {
        solution = ethers.keccak256(ethers.solidityPacked(['bytes32', 'uint256'], [challenge, nonce]));
        nonce++;
    } while (BigInt(solution) >= target);
    
    return {
        challenge: challenge,
        nonce: nonce - 1,
        solution: solution
    };
}
```

#### Step 3: Submit Hash Proofs

1. Connect to the HashProof contract
2. Call `submitHashPower(proof)` with your generated proof
3. Pay the gas fee
4. Wait for the transaction to confirm

#### Step 4: Claim Mining Rewards

1. Connect to the DEMOCOIN contract
2. Call `claimMiningReward()`
3. Pay the gas fee
4. Wait for the transaction to confirm
5. Your DEMO rewards will be added to your wallet

### Stable Pool Guide

#### Overview

The stable pool allows users to deposit DEMO tokens to provide liquidity and stabilize the token price. In return, users earn interest based on the stable pool APY.

#### Step 1: Deposit Tokens

1. Ensure you have DEMO tokens in your wallet
2. Connect to the DEMOCOIN contract
3. Call `depositToStablePool(amount)` with the amount of DEMO you want to deposit
4. Pay the gas fee
5. Wait for the transaction to confirm
6. You'll receive stable pool shares proportional to your deposit

#### Step 2: Earn Interest

- Interest accrues automatically based on the stable pool APY
- Current APY: 5%
- Interest is calculated per block

#### Step 3: Claim Rewards

1. Connect to the DEMOCOIN contract
2. Call `claimStablePoolRewards()`
3. Pay the gas fee
4. Wait for the transaction to confirm
5. Your interest rewards will be added to your wallet

#### Step 4: Withdraw Tokens

1. Connect to the DEMOCOIN contract
2. Call `withdrawFromStablePool(shares)` with the number of shares you want to redeem
3. Pay the gas fee
4. Wait for the transaction to confirm
5. Your DEMO tokens (principal + any unclaimed interest) will be returned to your wallet

### Collateral System

#### Overview

DEMOCOIN uses a 150% over-collateralization system to enhance stability. Users can deposit DEMO tokens as collateral, which helps maintain the token's value during market volatility.

#### Step 1: Deposit Collateral

1. Ensure you have DEMO tokens in your wallet
2. Connect to the DEMOCOIN contract
3. Call `depositCollateral(amount)` with the amount of DEMO you want to deposit
4. Pay the gas fee
5. Wait for the transaction to confirm
6. You'll receive collateral shares proportional to your deposit

#### Step 2: Withdraw Collateral

1. Connect to the DEMOCOIN contract
2. Call `withdrawCollateral(shares)` with the number of shares you want to redeem
3. Pay the gas fee
4. Wait for the transaction to confirm
5. Your DEMO tokens will be returned to your wallet

**Note**: Withdrawals are restricted if they would reduce the collateral ratio below 150% or if emergency mode is active.

## Development Guide

### Economic Model

#### Tokenomics

- **Maximum Supply**: 100,000,000 DEMO
- **Initial Mining Reward Rate**: 100 DEMO per day per 100 hashrate
- **Reward Halving**: Annual halving of mining rewards
- **Transaction Fee**: 0.3% per transaction
- **Mining Fee**: 0.2% on mining rewards
- **Stable Pool Fee**: 0.1% on stable pool deposits/withdrawals

#### Stabilization Mechanisms

##### Algorithmic Adjustments

- **Price Adjustment**: Gradual price changes based on supply/demand ratio
- **Reward Adjustment**: Mining rewards scaled based on price deviation from target
- **Supply Control**: Maximum supply cap and annual reward halving

##### Hybrid Stabilization

- **Stable Pool**: Users deposit tokens to provide liquidity and stabilize price
- **Collateral System**: 150% over-collateralization requirement
- **Insurance Fund**: Accumulates fees to absorb market shocks
- **Emergency Mode**: Activated during extreme volatility to pause critical functions

#### Fee Distribution

| Fee Type | Percentage | Distribution |
|----------|------------|--------------|
| Transaction | 0.3% | Burned (for now) |
| Mining | 0.2% | Burned (for now) |
| Stable Pool | 0.1% | Burned (for now) |

**Future Distribution Plan**:
- 50% to Insurance Fund
- 30% to Development Fund
- 20% to Marketing Fund

### Technical Flow

#### Mining Process

1. Miner generates a hash proof by solving a cryptographic puzzle
2. Miner submits the proof to `HashProof.submitHashPower()`
3. Contract verifies the proof and records hashpower contribution
4. Miner claims rewards via `DEMOCOIN.claimMiningReward()`
5. Contract calculates reward based on hashpower and price adjustment
6. New tokens are minted and distributed to the miner
7. Token price is updated based on new supply

#### Stable Pool Operation

1. User deposits DEMO tokens to `DEMOCOIN.depositToStablePool()`
2. Contract issues stable pool shares proportional to deposit
3. User earns interest based on stablePoolAPY
4. User claims rewards via `DEMOCOIN.claimStablePoolRewards()`
5. User withdraws tokens via `DEMOCOIN.withdrawFromStablePool()`
6. Contract burns shares and returns tokens minus fees

#### Price Update Mechanism

1. Contract checks if price update interval has elapsed
2. If oracle is configured, fetches external price data
3. Otherwise, calculates price based on supply/demand ratio
4. Updates current price and emits PriceUpdated event
5. Checks for volatility threshold breach
6. Activates emergency mode if volatility exceeds threshold

### Security Model

#### Access Control

- **DEFAULT_ADMIN_ROLE**: Highest privilege, can grant/revoke all roles
- **ADMIN_ROLE**: Can pause/unpause, update oracle, manage emergency mode
- **GOVERNOR_ROLE**: Can adjust economic parameters, fees, and APY
- **MINER_ROLE**: Can submit hash proofs
- **FEE_COLLECTOR_ROLE**: Can collect accumulated fees

#### Risk Mitigation

- **Emergency Pause**: Can pause critical functions during extreme conditions
- **Emergency Mode**: Activated automatically during high volatility
- **Collateral Ratio**: Maintains 150% over-collateralization
- **Maximum Supply**: Caps total token issuance
- **Gradual Adjustments**: Limits price changes to 0.5% per update
- **Transaction Fees**: Generates revenue for insurance fund

#### Security Best Practices

- Uses OpenZeppelin's secure contract library
- Implements ReentrancyGuard for external calls
- Validates all inputs and states
- Emits events for all critical operations
- Follows principle of least privilege

### Governance

#### Governance Roles

- **DEFAULT_ADMIN_ROLE**: Highest privilege, can grant/revoke all roles
- **ADMIN_ROLE**: Can pause/unpause, update oracle, manage emergency mode
- **GOVERNOR_ROLE**: Can adjust economic parameters, fees, and APY

#### Governance Parameters

The following parameters can be adjusted by the GOVERNOR_ROLE:

- `transactionFee`: Transaction fee percentage
- `miningFee`: Mining fee percentage
- `stablePoolFee`: Stable pool fee percentage
- `stablePoolAPY`: Stable pool annual percentage yield
- `miningRewardRate`: Mining reward rate
- `volatilityThreshold`: Volatility threshold for emergency mode

### Emergency Procedures

#### Emergency Mode

Emergency mode is automatically activated when the token price changes by more than the volatility threshold (default: 10%) within a single price update interval.

#### What Happens During Emergency Mode?

- Mining rewards cannot be claimed
- Stable pool withdrawals are paused
- Collateral withdrawals are paused
- Only emergency-related functions can be called

#### Exiting Emergency Mode

- Emergency mode automatically ends after 24 hours
- ADMIN_ROLE can manually end emergency mode after the duration has elapsed
- DEFAULT_ADMIN_ROLE can force-end emergency mode at any time

#### Emergency Pause

ADMIN_ROLE can manually pause the contract in extreme circumstances:

1. Connect to the DEMOCOIN contract
2. Call `pause()`
3. Pay the gas fee
4. Wait for the transaction to confirm

To unpause:

1. Connect to the DEMOCOIN contract
2. Call `unpause()`
3. Pay the gas fee
4. Wait for the transaction to confirm

## Security Considerations

### Security Features

- Utilizes OpenZeppelin's secure contract library
- Strict input validation and access control
- Gradual price adjustment to avoid volatility
- Transparent hashpower recording and reward mechanism
- Emergency pause functionality for extreme conditions

### Known Limitations

- The algorithmic stabilization model may need further testing in various market conditions
- The hashproof mechanism may need optimization for production use
- Emergency mode parameters may need adjustment based on testing

### Recommendations

- Conduct thorough security audits before mainnet deployment
- Perform extensive testing on testnets before production deployment
- Consider implementing additional security measures such as:
  - Multi-signature wallets for critical operations
  - Time-locked parameter changes
  - Decentralized governance mechanisms
  - Additional oracle sources for price feeds

## Contributing

We welcome contributions from developers, researchers, and enthusiasts who are interested in algorithmic stablecoins and blockchain technology.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow the existing code style and conventions
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PRs

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

We welcome developers from all cultural backgrounds to participate in this open-source project! If you have any questions, suggestions, or encounter any issues, please don't hesitate to:

- **Submit an Issue**: [Create an issue](https://github.com/yourusername/democoin/issues) - We encourage you to report bugs, request features, or ask questions
- **Start a Discussion**: Share your ideas and engage with the community
- **Contribute Code**: See the [Contributing](#contributing) section above for guidelines

Your contributions, regardless of your background or experience level, are valuable to us. Let's build the future of algorithmic stablecoins together!

## Disclaimer

**This project is provided as-is. The authors and contributors are not responsible for any financial losses or damages that may arise from the use of this code. Always conduct your own research and understand the risks before participating in any cryptocurrency ecosystem.**
