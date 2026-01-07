// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract HashProof is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINER_ROLE = keccak256("MINER_ROLE");
    
    uint256 public difficulty = 10;
    uint256 public constant MIN_DIFFICULTY = 1;
    uint256 public constant MAX_DIFFICULTY = 100;
    
    uint256 public proofCooldown = 1 minutes;
    uint256 public difficultyAdjustmentPeriod = 60 minutes;
    uint256 public targetProofRate = 10; // Target proofs per adjustment period
    
    mapping(address => uint256) public lastRewardTime;
    mapping(address => uint256) public totalHashPower;
    mapping(address => uint256) public lastSubmissionTime;
    
    uint256 public proofCounter;
    uint256 public lastDifficultyAdjustment;
    
    struct Proof {
        bytes32 challenge;
        uint256 nonce;
        bytes32 solution;
    }
    
    event HashPowerSubmitted(address indexed miner, uint256 hashPower, uint256 timestamp);
    event DifficultyAdjusted(uint256 newDifficulty, uint256 timestamp);
    event ProofCooldownUpdated(uint256 newCooldown);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINER_ROLE, msg.sender);
        
        lastDifficultyAdjustment = block.timestamp;
    }
    
    function verifyProof(Proof calldata proof) public view returns (bool) {
        bytes32 computedHash = keccak256(abi.encodePacked(proof.challenge, proof.nonce));
        return computedHash == proof.solution && checkDifficulty(computedHash);
    }
    
    function checkDifficulty(bytes32 hash) public view returns (bool) {
        uint256 target = 2 ** (256 - difficulty);
        return uint256(hash) < target;
    }
    
    function submitHashPower(Proof calldata proof) external onlyRole(MINER_ROLE) {
        require(verifyProof(proof), "Invalid proof");
        require(block.timestamp >= lastSubmissionTime[msg.sender] + proofCooldown, "Proof cooldown not elapsed");
        
        // Calculate hashpower based on difficulty and solution quality
        uint256 hashPower = calculateHashPower(proof);
        totalHashPower[msg.sender] += hashPower;
        lastRewardTime[msg.sender] = block.timestamp;
        lastSubmissionTime[msg.sender] = block.timestamp;
        
        // Increment proof counter for difficulty adjustment
        proofCounter++;
        
        // Check if difficulty adjustment is needed
        if (block.timestamp >= lastDifficultyAdjustment + difficultyAdjustmentPeriod) {
            adjustDifficulty();
        }
        
        emit HashPowerSubmitted(msg.sender, hashPower, block.timestamp);
    }
    
    function calculateHashPower(Proof calldata proof) public view returns (uint256) {
        // More sophisticated hashpower calculation
        // Takes into account difficulty and solution quality (how far below target it is)
        uint256 target = 2 ** (256 - difficulty);
        uint256 solutionValue = uint256(proof.solution);
        
        if (solutionValue == 0) {
            return difficulty * 2;
        }
        
        // Calculate how efficient the solution is compared to the target
        uint256 efficiency = target / (solutionValue + 1);
        
        // Return hashpower based on difficulty and efficiency
        return difficulty + (efficiency / 1000);
    }
    
    function adjustDifficulty() internal {
        // Calculate actual proof rate
        uint256 timeElapsed = block.timestamp - lastDifficultyAdjustment;
        uint256 actualProofRate = (proofCounter * difficultyAdjustmentPeriod) / timeElapsed;
        
        // Adjust difficulty based on proof rate
        if (actualProofRate > targetProofRate * 110 / 100) {
            // Too many proofs, increase difficulty
            difficulty = min(difficulty + 1, MAX_DIFFICULTY);
        } else if (actualProofRate < targetProofRate * 90 / 100) {
            // Too few proofs, decrease difficulty
            difficulty = max(difficulty - 1, MIN_DIFFICULTY);
        }
        
        // Reset counters
        proofCounter = 0;
        lastDifficultyAdjustment = block.timestamp;
        
        emit DifficultyAdjusted(difficulty, block.timestamp);
    }
    
    function setDifficulty(uint256 newDifficulty) external onlyRole(ADMIN_ROLE) {
        require(newDifficulty >= MIN_DIFFICULTY && newDifficulty <= MAX_DIFFICULTY, "Difficulty out of bounds");
        difficulty = newDifficulty;
        emit DifficultyAdjusted(difficulty, block.timestamp);
    }
    
    function setProofCooldown(uint256 newCooldown) external onlyRole(ADMIN_ROLE) {
        require(newCooldown >= 1 seconds, "Cooldown too short");
        proofCooldown = newCooldown;
        emit ProofCooldownUpdated(newCooldown);
    }
    
    function setDifficultyAdjustmentPeriod(uint256 newPeriod) external onlyRole(ADMIN_ROLE) {
        require(newPeriod >= 10 minutes, "Period too short");
        difficultyAdjustmentPeriod = newPeriod;
    }
    
    function setTargetProofRate(uint256 newRate) external onlyRole(ADMIN_ROLE) {
        require(newRate >= 1, "Rate too low");
        targetProofRate = newRate;
    }
    
    function grantMinerRole(address miner) external onlyRole(ADMIN_ROLE) {
        grantRole(MINER_ROLE, miner);
    }
    
    function revokeMinerRole(address miner) external onlyRole(ADMIN_ROLE) {
        revokeRole(MINER_ROLE, miner);
    }
    
    function getTotalHashPower(address miner) external view returns (uint256) {
        return totalHashPower[miner];
    }
    
    function getLastSubmissionTime(address miner) external view returns (uint256) {
        return lastSubmissionTime[miner];
    }
    
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
    
    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a : b;
    }
}
