const { expect } = require("chai");
const hre = require("hardhat");

describe("DEMOCOIN Boundary Tests", function () {
  let HashProof, hashProof, DEMOCOIN, demoCoin;
  let owner, miner1, user1;
  
  beforeEach(async function () {
    [owner, miner1, user1] = await hre.ethers.getSigners();
    
    // Deploy HashProof contract
    HashProof = await hre.ethers.getContractFactory("HashProof");
    hashProof = await HashProof.deploy();
    await hashProof.deployed();
    
    // Deploy Governance contract
    const DEMOCOINGovernance = await hre.ethers.getContractFactory("DEMOCOINGovernance");
    const governance = await DEMOCOINGovernance.deploy();
    await governance.deployed();
    
    // Deploy DEMOCOIN contract
    DEMOCOIN = await hre.ethers.getContractFactory("DEMOCOIN");
    demoCoin = await DEMOCOIN.deploy(hashProof.address, governance.address);
    await demoCoin.deployed();
    
    // Grant DEMOCOIN contract the required roles in governance
    await governance.grantRole(await governance.ADMIN_ROLE(), demoCoin.address);
    await governance.grantRole(await governance.DEFAULT_ADMIN_ROLE(), demoCoin.address);
  });
  
  describe("HashProof Contract Boundary Tests", function () {
    it("should handle minimum and maximum difficulty values", async function () {
      // Set to minimum difficulty
      await hashProof.connect(owner).setDifficulty(1);
      let difficulty = await hashProof.difficulty();
      expect(difficulty).to.equal(1);
      
      // Set to maximum difficulty
      await hashProof.connect(owner).setDifficulty(100);
      difficulty = await hashProof.difficulty();
      expect(difficulty).to.equal(100);
      
      // Try to set below minimum (should revert)
      await expect(hashProof.connect(owner).setDifficulty(0)).to.be.reverted;
      
      // Try to set above maximum (should revert)
      await expect(hashProof.connect(owner).setDifficulty(101)).to.be.reverted;
    });
    
    it("should enforce proof cooldown", async function () {
      // Set a longer cooldown for testing
      await hashProof.connect(owner).setProofCooldown(5); // 5 seconds cooldown
      
      // Generate a valid proof
      const challenge = hre.ethers.utils.keccak256(hre.ethers.utils.toUtf8Bytes("test-challenge"));
      let nonce = 0;
      let solution;
      
      do {
        solution = hre.ethers.utils.keccak256(hre.ethers.utils.defaultAbiCoder.encode(["bytes32", "uint256"], [challenge, nonce]));
        nonce++;
      } while (BigInt(solution) >= BigInt(2n ** (256n - 10n)));
      
      const proof = {
        challenge: challenge,
        nonce: nonce - 1,
        solution: solution
      };
      
      // Grant miner role to miner1
      await hashProof.connect(owner).grantMinerRole(miner1.address);
      
      // First submission should succeed
      await hashProof.connect(miner1).submitHashPower(proof);
      
      // Second submission immediately should fail due to cooldown
      await expect(hashProof.connect(miner1).submitHashPower(proof)).to.be.revertedWith("Proof cooldown not elapsed");
      
      // Wait for cooldown to expire
      await hre.ethers.provider.send("evm_increaseTime", [6]);
      await hre.ethers.provider.send("evm_mine");
      
      // Now submission should succeed again
      await expect(hashProof.connect(miner1).submitHashPower(proof)).to.not.be.reverted;
    });
    
    it("should enforce access control", async function () {
      // Non-admin should not be able to set difficulty
      await expect(hashProof.connect(miner1).setDifficulty(20)).to.be.reverted;
      
      // Only admin should be able to set difficulty
      await expect(hashProof.connect(owner).setDifficulty(20)).to.not.be.reverted;
    });
  });
  
  describe("DEMOCOIN Contract Boundary Tests", function () {
    it("should enforce maximum supply limit", async function () {
      // Mint tokens close to maximum supply
      const maxSupply = await demoCoin.MAX_SUPPLY();
      // Use a smaller amount to avoid gas issues
      const largeAmount = hre.ethers.utils.parseEther("1000000");
      
      await demoCoin.connect(owner).mint(user1.address, largeAmount);
      
      // Try to mint a very large amount that would exceed max supply (should revert)
      await expect(demoCoin.connect(owner).mint(user1.address, maxSupply)).to.be.reverted;
    });
    
    it("should restrict functions in emergency mode", async function () {
      // Activate emergency mode
      await demoCoin.connect(owner).setEmergencyMode(true);
      
      // Try to deposit to stable pool (should revert)
      await demoCoin.connect(owner).mint(user1.address, hre.ethers.utils.parseEther("1000"));
      await expect(demoCoin.connect(user1).depositToStablePool(hre.ethers.utils.parseEther("500"))).to.be.reverted;
      
      // Try to claim mining reward (should revert)
      await expect(demoCoin.connect(miner1).claimMiningReward()).to.be.reverted;
      
      // Deactivate emergency mode
      await demoCoin.connect(owner).setEmergencyMode(false);
      
      // Now functions should work
      await expect(demoCoin.connect(user1).depositToStablePool(hre.ethers.utils.parseEther("500"))).to.not.be.reverted;
    });
    
    it("should handle collateral ratio boundary", async function () {
      // Mint tokens for collateral (1000 total supply)
      await demoCoin.connect(owner).mint(user1.address, hre.ethers.utils.parseEther("1000"));
      
      // Deposit collateral (1000 collateral)
      await demoCoin.connect(user1).depositCollateral(hre.ethers.utils.parseEther("1000"));
      
      // Check initial collateral ratio (1000 / 1000 = 100%)
      let collateralRatio = await demoCoin.getCollateralRatio();
      collateralRatio = collateralRatio.toNumber();
      expect(collateralRatio).to.be.closeTo(100, 5);
      
      // Mint more tokens to decrease collateral ratio (total supply becomes 2000)
      await demoCoin.connect(owner).mint(user1.address, hre.ethers.utils.parseEther("1000"));
      
      collateralRatio = await demoCoin.getCollateralRatio();
      collateralRatio = collateralRatio.toNumber();
      expect(collateralRatio).to.be.closeTo(50, 5); // 1000 / 2000 = 50%
      
      // Deposit more collateral to increase ratio (total collateral becomes 2000)
      await demoCoin.connect(owner).mint(user1.address, hre.ethers.utils.parseEther("1000"));
      await demoCoin.connect(user1).depositCollateral(hre.ethers.utils.parseEther("1000"));
      
      collateralRatio = await demoCoin.getCollateralRatio();
      collateralRatio = collateralRatio.toNumber();
      expect(collateralRatio).to.be.closeTo(66, 5); // 2000 / 3000 = 66.66%
    });
    
    it("should handle zero value inputs", async function () {
      // Mint some tokens first
      await demoCoin.connect(owner).mint(user1.address, hre.ethers.utils.parseEther("1000"));
      
      // Try to deposit 0 to stable pool (should revert)
      await expect(demoCoin.connect(user1).depositToStablePool(0)).to.be.reverted;
      
      // Try to withdraw 0 from stable pool (should revert)
      await expect(demoCoin.connect(user1).withdrawFromStablePool(0)).to.be.reverted;
      
      // Try to deposit 0 collateral (should revert)
      await expect(demoCoin.connect(user1).depositCollateral(0)).to.be.reverted;
      
      // Try to withdraw 0 collateral (should revert)
      await expect(demoCoin.connect(user1).withdrawCollateral(0)).to.be.reverted;
    });
    
    it("should handle fee distribution correctly", async function () {
      // Mint tokens to generate fees
      await demoCoin.connect(owner).mint(user1.address, hre.ethers.utils.parseEther("10000"));
      
      // Deposit to stable pool to generate fees
      await demoCoin.connect(user1).depositToStablePool(hre.ethers.utils.parseEther("1000"));
      
      // Withdraw from stable pool to generate more fees
      await demoCoin.connect(user1).withdrawFromStablePool(hre.ethers.utils.parseEther("500"));
      
      // Collect fees
      const initialInsuranceFund = await demoCoin.insuranceFund();
      const initialDevelopmentFund = await demoCoin.developmentFund();
      const initialMarketingFund = await demoCoin.marketingFund();
      
      await demoCoin.connect(owner).collectFees();
      
      // Check that fees were distributed
      const newInsuranceFund = await demoCoin.insuranceFund();
      const newDevelopmentFund = await demoCoin.developmentFund();
      const newMarketingFund = await demoCoin.marketingFund();
      
      expect(newInsuranceFund.gt(initialInsuranceFund)).to.be.true;
      expect(newDevelopmentFund.gt(initialDevelopmentFund)).to.be.true;
      expect(newMarketingFund.gt(initialMarketingFund)).to.be.true;
    });
  });
});
