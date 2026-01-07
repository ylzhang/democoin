// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./HashProof.sol";
import "./DEMOCOINGovernance.sol";

interface IOracle {
    function latestAnswer() external view returns (int256 answer);
    function decimals() external view returns (uint8 decimals);
}

contract DEMOCOIN is ERC20, AccessControl, Pausable {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");
    bytes32 public constant FEE_COLLECTOR_ROLE = keccak256("FEE_COLLECTOR_ROLE");
    
    HashProof public hashProof;
    DEMOCOINGovernance public governance;
    IOracle public priceOracle;
    
    uint256 public constant TARGET_PRICE = 1 ether;
    uint256 public currentPrice;
    uint256 public lastPriceUpdate;
    uint256 public priceUpdateInterval = 1 hours;
    
    // Economic parameters
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10 ** 18; // 100M LON maximum supply
    uint256 public constant INITIAL_MINING_REWARD_RATE = 100 * 10 ** 18; // 100 LON per day per 100 hashrate
    uint256 public miningRewardRate = INITIAL_MINING_REWARD_RATE;
    uint256 public rewardHalvingInterval = 365 days; // Halve rewards annually
    uint256 public lastHalvingTimestamp;
    uint256 public supplyAdjustmentRate = 50; // 0.5% supply adjustment per day (50 basis points)
    uint256 public lastSupplyAdjustment;
    
    // Fee structure
    uint256 public transactionFee = 3; // 0.3% transaction fee
    uint256 public miningFee = 2; // 0.2% mining fee
    uint256 public stablePoolFee = 1; // 0.1% stable pool fee
    
    // Fee destinations
    uint256 public insuranceFund;
    uint256 public developmentFund;
    uint256 public marketingFund;
    
    // Stable pool
    mapping(address => uint256) public stablePoolDeposits;
    mapping(address => uint256) public stablePoolShares;
    mapping(address => uint256) public stablePoolLastClaim;
    uint256 public totalStablePool;
    uint256 public totalStablePoolShares;
    uint256 public stablePoolAPY = 5; // 5% APY for stable pool participants
    
    // Collateral system
    mapping(address => uint256) public collateralDeposits;
    mapping(address => uint256) public collateralShares;
    uint256 public totalCollateral;
    uint256 public totalCollateralShares;
    uint256 public targetCollateralRatio = 150; // 150% target collateral ratio
    uint256 public minCollateralRatio = 100; // 100% minimum collateral ratio
    uint256 public maxCollateralRatio = 200; // 200% maximum collateral ratio
    uint256 public collateralRatioAdjustmentSpeed = 1; // 1% adjustment per hour
    uint256 public lastCollateralRatioAdjustment;
    uint256 public constant COLLATERAL_RATIO_ADJUSTMENT_INTERVAL = 1 hours;
    
    // Insurance fund
    uint256 public constant INSURANCE_FUND_TARGET = 5000; // 5% of total supply
    uint256 public constant INSURANCE_FEE_ALLOCATION = 50; // 50% of fees to insurance fund
    
    // Risk parameters
    uint256 public volatilityThreshold = 10; // 10% price change threshold
    
    struct MiningReward {
        uint256 amount;
        uint256 timestamp;
    }
    
    mapping(address => MiningReward) public pendingRewards;
    
    event StablePoolDeposit(address indexed user, uint256 amount, uint256 shares);
    event StablePoolWithdraw(address indexed user, uint256 amount, uint256 shares);
    event StablePoolRewardClaimed(address indexed user, uint256 amount);
    event CollateralDeposit(address indexed user, uint256 amount, uint256 shares);
    event CollateralWithdraw(address indexed user, uint256 amount, uint256 shares);
    event MiningRewardClaimed(address indexed miner, uint256 amount);
    event PriceUpdated(uint256 newPrice, uint256 timestamp);
    event OracleUpdated(address newOracle);
    event StablePoolAPYUpdated(uint256 newAPY);
    event MiningRewardRateUpdated(uint256 newRate);
    event TransactionFeeUpdated(uint256 newFee);
    event EmergencyModeActivated(uint256 timestamp);
    event EmergencyModeDeactivated(uint256 timestamp);
    event FeesCollected(uint256 amount, uint256 insuranceFund, uint256 developmentFund, uint256 marketingFund);
    event CollateralRatioAdjusted(uint256 oldRatio, uint256 newRatio, uint256 timestamp);
    event SupplyAdjusted(uint256 adjustmentAmount, bool isExpansion, uint256 timestamp);
    
    constructor(address hashProofAddress, address governanceAddress) ERC20("DEMOCOIN", "DEMO") {
        hashProof = HashProof(hashProofAddress);
        governance = DEMOCOINGovernance(governanceAddress);
        currentPrice = TARGET_PRICE;
        lastPriceUpdate = block.timestamp;
        lastHalvingTimestamp = block.timestamp;
        lastCollateralRatioAdjustment = block.timestamp;
        lastSupplyAdjustment = block.timestamp;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNOR_ROLE, msg.sender);
        _grantRole(FEE_COLLECTOR_ROLE, msg.sender);
    }
    
    // Oracle management
    function setOracle(address oracleAddress) external onlyRole(ADMIN_ROLE) {
        priceOracle = IOracle(oracleAddress);
        emit OracleUpdated(oracleAddress);
    }
    
    // Fee management
    function setTransactionFee(uint256 newFee) external onlyRole(GOVERNOR_ROLE) {
        require(newFee <= 10, "Transaction fee too high");
        transactionFee = newFee;
        emit TransactionFeeUpdated(newFee);
    }
    
    function setMiningFee(uint256 newFee) external onlyRole(GOVERNOR_ROLE) {
        require(newFee <= 5, "Mining fee too high");
        miningFee = newFee;
    }
    
    function setStablePoolFee(uint256 newFee) external onlyRole(GOVERNOR_ROLE) {
        require(newFee <= 5, "Stable pool fee too high");
        stablePoolFee = newFee;
    }
    
    function collectFees() external onlyRole(FEE_COLLECTOR_ROLE) {
        uint256 contractBalance = balanceOf(address(this));
        require(contractBalance > 0, "No fees to collect");
        
        // Calculate fee distribution
        uint256 insuranceAmount = (contractBalance * INSURANCE_FEE_ALLOCATION) / 100;
        uint256 developmentAmount = (contractBalance * 30) / 100;
        uint256 marketingAmount = (contractBalance * 20) / 100;
        
        // Update fund balances
        insuranceFund += insuranceAmount;
        developmentFund += developmentAmount;
        marketingFund += marketingAmount;
        
        // Burn remaining fees for now
        uint256 burnAmount = contractBalance - insuranceAmount - developmentAmount - marketingAmount;
        if (burnAmount > 0) {
            _burn(address(this), burnAmount);
        }
        
        emit FeesCollected(contractBalance, insuranceAmount, developmentAmount, marketingAmount);
    }
    
    // Stable pool functions
    function depositToStablePool(uint256 amount) external whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(!governance.isEmergencyMode(), "Emergency mode active");
        
        // Calculate and apply fees
        uint256 fee = (amount * stablePoolFee) / 1000;
        uint256 netAmount = amount - fee;
        
        uint256 shares = calculateStablePoolShares(netAmount);
        
        _transfer(msg.sender, address(this), amount);
        stablePoolDeposits[msg.sender] += netAmount;
        stablePoolShares[msg.sender] += shares;
        totalStablePool += netAmount;
        totalStablePoolShares += shares;
        stablePoolLastClaim[msg.sender] = block.timestamp;
        
        // Update funds with fees
        updateFees(fee);
        
        emit StablePoolDeposit(msg.sender, netAmount, shares);
    }
    
    function withdrawFromStablePool(uint256 shares) external whenNotPaused {
        require(shares > 0, "Shares must be greater than 0");
        require(stablePoolShares[msg.sender] >= shares, "Insufficient shares");
        require(!governance.isEmergencyMode(), "Emergency mode active");
        
        // Calculate and claim pending rewards first
        claimStablePoolRewards();
        
        uint256 amount = calculateStablePoolAmount(shares);
        
        // Calculate and apply fees
        uint256 fee = (amount * stablePoolFee) / 1000;
        uint256 netAmount = amount - fee;
        
        stablePoolShares[msg.sender] -= shares;
        stablePoolDeposits[msg.sender] -= amount;
        totalStablePoolShares -= shares;
        totalStablePool -= amount;
        stablePoolLastClaim[msg.sender] = block.timestamp;
        
        // Update funds with fees
        updateFees(fee);
        
        _transfer(address(this), msg.sender, netAmount);
        
        emit StablePoolWithdraw(msg.sender, netAmount, shares);
    }
    
    function calculateStablePoolShares(uint256 amount) public view returns (uint256) {
        if (totalStablePoolShares == 0) {
            return amount;
        }
        return (amount * totalStablePoolShares) / totalStablePool;
    }
    
    function calculateStablePoolAmount(uint256 shares) public view returns (uint256) {
        if (totalStablePoolShares == 0) {
            return 0;
        }
        return (shares * totalStablePool) / totalStablePoolShares;
    }
    
    function claimStablePoolRewards() public whenNotPaused {
        uint256 reward = calculateStablePoolRewards(msg.sender);
        if (reward > 0) {
            stablePoolLastClaim[msg.sender] = block.timestamp;
            _mint(msg.sender, reward);
            emit StablePoolRewardClaimed(msg.sender, reward);
        }
    }
    
    function calculateStablePoolRewards(address user) public view returns (uint256) {
        if (stablePoolShares[user] == 0) {
            return 0;
        }
        
        uint256 timeElapsed = block.timestamp - stablePoolLastClaim[user];
        uint256 dailyRewardRate = (stablePoolAPY * totalStablePool) / (365 * 100);
        uint256 userShareRatio = stablePoolShares[user] * 10 ** 18 / totalStablePoolShares;
        
        return (dailyRewardRate * timeElapsed * userShareRatio) / (1 days * 10 ** 18);
    }
    
    // Collateral system functions
    function depositCollateral(uint256 amount) external whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        
        uint256 shares = calculateCollateralShares(amount);
        
        _transfer(msg.sender, address(this), amount);
        collateralDeposits[msg.sender] += amount;
        collateralShares[msg.sender] += shares;
        totalCollateral += amount;
        totalCollateralShares += shares;
        
        emit CollateralDeposit(msg.sender, amount, shares);
    }
    
    function withdrawCollateral(uint256 shares) external whenNotPaused {
        require(shares > 0, "Shares must be greater than 0");
        require(collateralShares[msg.sender] >= shares, "Insufficient shares");
        require(!governance.isEmergencyMode(), "Emergency mode active");
        
        uint256 amount = calculateCollateralAmount(shares);
        
        // Ensure collateral ratio is maintained
        require(totalCollateral - amount >= (totalSupply() * targetCollateralRatio) / 100, "Collateral ratio violated");
        
        collateralShares[msg.sender] -= shares;
        collateralDeposits[msg.sender] -= amount;
        totalCollateralShares -= shares;
        totalCollateral -= amount;
        
        _transfer(address(this), msg.sender, amount);
        
        emit CollateralWithdraw(msg.sender, amount, shares);
    }
    
    function calculateCollateralShares(uint256 amount) public view returns (uint256) {
        if (totalCollateralShares == 0) {
            return amount;
        }
        return (amount * totalCollateralShares) / totalCollateral;
    }
    
    function calculateCollateralAmount(uint256 shares) public view returns (uint256) {
        if (totalCollateralShares == 0) {
            return 0;
        }
        return (shares * totalCollateral) / totalCollateralShares;
    }
    
    // Mining reward functions
    function claimMiningReward() external whenNotPaused {
        require(!governance.isEmergencyMode(), "Emergency mode active");
        
        // Check for reward halving
        checkRewardHalving();
        
        uint256 reward = calculateMiningReward(msg.sender);
        require(reward > 0, "No pending rewards");
        require(totalSupply() + reward <= MAX_SUPPLY, "Max supply reached");
        
        pendingRewards[msg.sender] = MiningReward(0, block.timestamp);
        _mint(msg.sender, reward);
        
        updatePrice();
        
        emit MiningRewardClaimed(msg.sender, reward);
    }
    
    function calculateMiningReward(address miner) public view returns (uint256) {
        uint256 hashPower = hashProof.totalHashPower(miner);
        if (hashPower == 0) {
            return 0;
        }
        
        uint256 timeSinceLastReward = block.timestamp - hashProof.lastRewardTime(miner);
        
        // Base reward rate: LON per day per hashrate
        uint256 dailyReward = (miningRewardRate * hashPower) / 100;
        uint256 reward = (dailyReward * timeSinceLastReward) / (1 days);
        
        // Apply price adjustment
        uint256 priceAdjustment = calculatePriceAdjustment();
        reward = (reward * priceAdjustment) / 1 ether;
        
        // Apply mining fees
        uint256 fee = (reward * miningFee) / 1000;
        return reward - fee;
    }
    
    function checkRewardHalving() internal {
        if (block.timestamp >= lastHalvingTimestamp + rewardHalvingInterval) {
            miningRewardRate /= 2;
            lastHalvingTimestamp = block.timestamp;
            emit MiningRewardRateUpdated(miningRewardRate);
        }
    }
    
    function calculatePriceAdjustment() public view returns (uint256) {
        if (currentPrice > TARGET_PRICE) {
            // Reduce rewards when price is above target
            return (TARGET_PRICE * 100) / currentPrice;
        } else {
            // Increase rewards when price is below target (capped at 2x)
            uint256 adjustment = (currentPrice * 100) / TARGET_PRICE;
            return adjustment < 50 ? 50 : adjustment; // Minimum 50% adjustment, maximum 200%
        }
    }
    
    // Price management functions
    function adjustSupply() internal {
        // Only adjust supply if enough time has passed
        uint256 supplyAdjustmentInterval = 1 days; // Adjust once per day
        if (block.timestamp < lastSupplyAdjustment + supplyAdjustmentInterval) {
            return;
        }
        
        // Calculate price deviation from target
        int256 priceDeviation;
        if (currentPrice > TARGET_PRICE) {
            priceDeviation = int256(((currentPrice - TARGET_PRICE) * 10000) / TARGET_PRICE); // Basis points
        } else {
            priceDeviation = -int256(((TARGET_PRICE - currentPrice) * 10000) / TARGET_PRICE); // Basis points
        }
        
        // Skip if price is within 0.1% of target
        if (priceDeviation > -10 && priceDeviation < 10) {
            return;
        }
        
        // Calculate supply adjustment amount
        uint256 currentSupply = totalSupply();
        uint256 adjustmentAmount = (currentSupply * uint256(abs(priceDeviation)) * supplyAdjustmentRate) / (10000 * 10000); // Both in basis points
        
        if (priceDeviation > 0) {
            // Price above target: expand supply
            if (currentSupply + adjustmentAmount <= MAX_SUPPLY) {
                // Mint new tokens to stable pool
                _mint(address(this), adjustmentAmount);
                totalStablePool += adjustmentAmount;
                emit SupplyAdjusted(adjustmentAmount, true, block.timestamp);
            }
        } else {
            // Price below target: contract supply
            if (adjustmentAmount > 0 && totalStablePool >= adjustmentAmount) {
                // Burn tokens from stable pool
                _burn(address(this), adjustmentAmount);
                totalStablePool -= adjustmentAmount;
                emit SupplyAdjusted(adjustmentAmount, false, block.timestamp);
            }
        }
        
        lastSupplyAdjustment = block.timestamp;
    }
    
    function abs(int256 x) internal pure returns (uint256) {
        return uint256(x >= 0 ? x : -x);
    }
    
    function adjustCollateralRatio() internal {
        // Only adjust if enough time has passed
        if (block.timestamp < lastCollateralRatioAdjustment + COLLATERAL_RATIO_ADJUSTMENT_INTERVAL) {
            return;
        }
        
        uint256 currentCollateralRatio = calculateCollateralRatio();
        uint256 newCollateralRatio = targetCollateralRatio;
        
        // Calculate price deviation from target
        uint256 priceDeviation;
        if (currentPrice > TARGET_PRICE) {
            priceDeviation = ((currentPrice - TARGET_PRICE) * 100) / TARGET_PRICE;
        } else {
            priceDeviation = ((TARGET_PRICE - currentPrice) * 100) / TARGET_PRICE;
        }
        
        // Adjust collateral ratio based on price deviation and current ratio
        if (currentPrice < TARGET_PRICE && currentCollateralRatio < maxCollateralRatio) {
            // Price below target, increase collateral ratio to reduce supply
            newCollateralRatio = targetCollateralRatio + collateralRatioAdjustmentSpeed;
        } else if (currentPrice > TARGET_PRICE && currentCollateralRatio > minCollateralRatio) {
            // Price above target, decrease collateral ratio to increase supply
            newCollateralRatio = targetCollateralRatio - collateralRatioAdjustmentSpeed;
        }
        
        // Ensure collateral ratio stays within bounds
        newCollateralRatio = newCollateralRatio < minCollateralRatio ? minCollateralRatio : newCollateralRatio;
        newCollateralRatio = newCollateralRatio > maxCollateralRatio ? maxCollateralRatio : newCollateralRatio;
        
        // Update and emit event if ratio changed
        if (newCollateralRatio != targetCollateralRatio) {
            uint256 oldRatio = targetCollateralRatio;
            targetCollateralRatio = newCollateralRatio;
            lastCollateralRatioAdjustment = block.timestamp;
            emit CollateralRatioAdjusted(oldRatio, newCollateralRatio, block.timestamp);
        }
    }
    
    function updatePrice() public whenNotPaused {
        require(block.timestamp >= lastPriceUpdate + priceUpdateInterval, "Price update interval not elapsed");
        
        uint256 newPrice;
        
        // Use oracle price if available, otherwise use internal algorithm
        if (address(priceOracle) != address(0)) {
            int256 oraclePrice = priceOracle.latestAnswer();
            uint8 oracleDecimals = priceOracle.decimals();
            newPrice = uint256(oraclePrice) * (10 ** (18 - oracleDecimals));
        } else {
            // Algorithmic price adjustment based on supply and demand
            uint256 supply = totalSupply();
            uint256 demand = (totalStablePool * 2) + ((totalCollateral * 100) / targetCollateralRatio);
            
            // Calculate supply-demand ratio
            uint256 ratio;
            if (supply > demand) {
                ratio = (demand * 10000) / supply; // Demand as percentage of supply, scaled by 100
            } else {
                ratio = (supply * 10000) / (demand + 1); // Supply as percentage of demand, scaled by 100
            }
            
            // Gradual price adjustment based on ratio (max 0.5% change per update)
            uint256 adjustmentFactor = 10000;
            if (ratio < 9500) { // Demand is less than 95% of supply, decrease price
                uint256 delta = (9500 - ratio) / 100; // Calculate adjustment factor, max 5
                adjustmentFactor = 10000 - delta * 5; // Max 0.5% decrease
            } else if (ratio > 10500) { // Demand is more than 105% of supply, increase price
                uint256 delta = (ratio - 10500) / 100; // Calculate adjustment factor, max 5
                adjustmentFactor = 10000 + delta * 5; // Max 0.5% increase
            }
            
            newPrice = (currentPrice * adjustmentFactor) / 10000;
        }
        
        // Check for volatility and activate emergency mode if needed
        uint256 priceChange = newPrice > currentPrice ? newPrice - currentPrice : currentPrice - newPrice;
        uint256 priceChangePercent = (priceChange * 100) / TARGET_PRICE;
        
        if (priceChangePercent > volatilityThreshold && !governance.isEmergencyMode()) {
            activateEmergencyMode();
        }
        
        currentPrice = newPrice;
        lastPriceUpdate = block.timestamp;
        
        // Adjust collateral ratio based on price deviation
        adjustCollateralRatio();
        
        // Adjust supply based on price deviation
        adjustSupply();
        
        emit PriceUpdated(currentPrice, block.timestamp);
    }
    
    function manualUpdatePrice() external onlyRole(ADMIN_ROLE) {
        updatePrice();
    }
    
    // Emergency management functions
    function activateEmergencyMode() internal {
        governance.activateEmergencyMode();
    }
    
    function setEmergencyMode(bool _emergencyMode) external onlyRole(DEFAULT_ADMIN_ROLE) {
        governance.setEmergencyMode(_emergencyMode);
    }
    
    // Governance functions
    function setPriceUpdateInterval(uint256 interval) external onlyRole(GOVERNOR_ROLE) {
        require(interval >= 1 minutes, "Interval too short");
        priceUpdateInterval = interval;
    }
    
    function setStablePoolAPY(uint256 newAPY) external onlyRole(GOVERNOR_ROLE) {
        require(newAPY <= 20, "APY too high");
        stablePoolAPY = newAPY;
        emit StablePoolAPYUpdated(newAPY);
    }
    
    function setMiningRewardRate(uint256 newRate) external onlyRole(GOVERNOR_ROLE) {
        require(newRate <= INITIAL_MINING_REWARD_RATE, "Reward rate too high");
        miningRewardRate = newRate;
        emit MiningRewardRateUpdated(newRate);
    }
    
    function setVolatilityThreshold(uint256 newThreshold) external onlyRole(GOVERNOR_ROLE) {
        require(newThreshold <= 50, "Threshold too high");
        volatilityThreshold = newThreshold;
    }
    
    // Access control and pause functions
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
    
    // Fee and fund management
    function updateFees(uint256 fee) internal {
        // Calculate fee distribution
        uint256 insuranceAmount = (fee * INSURANCE_FEE_ALLOCATION) / 100;
        uint256 developmentAmount = (fee * 30) / 100;
        uint256 marketingAmount = (fee * 20) / 100;
        
        // Update fund balances
        insuranceFund += insuranceAmount;
        developmentFund += developmentAmount;
        marketingFund += marketingAmount;
        
        // Burn remaining fees
        uint256 burnAmount = fee - insuranceAmount - developmentAmount - marketingAmount;
        if (burnAmount > 0) {
            _burn(address(this), burnAmount);
        }
    }
    
    // Utility functions
    function getCurrentPrice() external view returns (uint256) {
        return currentPrice;
    }
    
    function getTotalSupply() external view returns (uint256) {
        return totalSupply();
    }
    
    function getStablePoolAPY() external view returns (uint256) {
        return stablePoolAPY;
    }
    
    function getStablePoolBalance(address user) external view returns (uint256) {
        return stablePoolDeposits[user] + calculateStablePoolRewards(user);
    }
    
    function getCollateralBalance(address user) external view returns (uint256) {
        return collateralDeposits[user];
    }
    
    function getCollateralRatio() external view returns (uint256) {
        return calculateCollateralRatio();
    }
    
    function calculateCollateralRatio() internal view returns (uint256) {
        if (totalSupply() == 0) {
            return 0;
        }
        return (totalCollateral * 100) / totalSupply();
    }
    
    function isEmergencyMode() external view returns (bool) {
        return governance.isEmergencyMode();
    }
    
    function calculateMaxBorrowable(address user) external view returns (uint256) {
        uint256 collateral = collateralDeposits[user];
        return (collateral * 100) / targetCollateralRatio;
    }
    
    // Governance functions for collateral ratio parameters
    function setCollateralRatioBounds(uint256 minRatio, uint256 maxRatio) external onlyRole(GOVERNOR_ROLE) {
        require(minRatio >= 50 && maxRatio <= 300, "Bounds out of range");
        require(minRatio < maxRatio, "Min ratio must be less than max ratio");
        minCollateralRatio = minRatio;
        maxCollateralRatio = maxRatio;
        
        // Ensure target ratio is within new bounds
        if (targetCollateralRatio < minRatio) {
            _setTargetCollateralRatio(minRatio);
        } else if (targetCollateralRatio > maxRatio) {
            _setTargetCollateralRatio(maxRatio);
        }
    }
    
    function setTargetCollateralRatio(uint256 newRatio) external onlyRole(GOVERNOR_ROLE) {
        require(newRatio >= minCollateralRatio && newRatio <= maxCollateralRatio, "Ratio out of bounds");
        _setTargetCollateralRatio(newRatio);
    }
    
    function _setTargetCollateralRatio(uint256 newRatio) internal {
        uint256 oldRatio = targetCollateralRatio;
        targetCollateralRatio = newRatio;
        emit CollateralRatioAdjusted(oldRatio, newRatio, block.timestamp);
    }
    
    function setCollateralRatioAdjustmentSpeed(uint256 newSpeed) external onlyRole(GOVERNOR_ROLE) {
        require(newSpeed >= 1 && newSpeed <= 10, "Adjustment speed out of range");
        collateralRatioAdjustmentSpeed = newSpeed;
    }
    
    // Mint function (only for testing and admin use)
    function mint(address to, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply reached");
        super._mint(to, amount);
    }
    
    // ERC20 overrides with transaction fees
    function transfer(address to, uint256 amount) public override returns (bool) {
        // Apply transaction fees
        uint256 fee = (amount * transactionFee) / 1000;
        uint256 netAmount = amount - fee;
        
        _transfer(_msgSender(), to, netAmount);
        if (fee > 0) {
            _transfer(_msgSender(), address(this), fee);
        }
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        // Apply transaction fees
        uint256 fee = (amount * transactionFee) / 1000;
        uint256 netAmount = amount - fee;
        
        _spendAllowance(from, _msgSender(), amount);
        _transfer(from, to, netAmount);
        if (fee > 0) {
            _transfer(from, address(this), fee);
        }
        return true;
    }
    
    // Override ERC20 _beforeTokenTransfer hook with Pausable check
    function _update(address from, address to, uint256 amount) internal override {
        require(!paused(), "Pausable: token transfer while paused");
        super._update(from, to, amount);
    }
}
