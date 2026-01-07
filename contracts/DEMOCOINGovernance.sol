// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title DEMOCOIN Governance
 * @dev Separate contract for governance-related functionality
 */
contract DEMOCOINGovernance is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");
    bytes32 public constant FEE_COLLECTOR_ROLE = keccak256("FEE_COLLECTOR_ROLE");
    
    // Emergency management
    bool public emergencyMode = false;
    uint256 public emergencyModeTimestamp;
    uint256 public constant EMERGENCY_MODE_DURATION = 24 hours;
    
    event EmergencyModeActivated(uint256 timestamp);
    event EmergencyModeDeactivated(uint256 timestamp);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNOR_ROLE, msg.sender);
        _grantRole(FEE_COLLECTOR_ROLE, msg.sender);
    }
    
    function activateEmergencyMode() external onlyRole(ADMIN_ROLE) {
        emergencyMode = true;
        emergencyModeTimestamp = block.timestamp;
        emit EmergencyModeActivated(block.timestamp);
    }
    
    function deactivateEmergencyMode() external onlyRole(ADMIN_ROLE) {
        require(emergencyMode, "Emergency mode not active");
        require(block.timestamp >= emergencyModeTimestamp + EMERGENCY_MODE_DURATION, "Emergency mode duration not elapsed");
        
        emergencyMode = false;
        emit EmergencyModeDeactivated(block.timestamp);
    }
    
    function forceDeactivateEmergencyMode() external onlyRole(DEFAULT_ADMIN_ROLE) {
        emergencyMode = false;
        emit EmergencyModeDeactivated(block.timestamp);
    }
    
    function setEmergencyMode(bool _emergencyMode) external onlyRole(DEFAULT_ADMIN_ROLE) {
        emergencyMode = _emergencyMode;
        if (_emergencyMode) {
            emergencyModeTimestamp = block.timestamp;
            emit EmergencyModeActivated(block.timestamp);
        } else {
            emit EmergencyModeDeactivated(block.timestamp);
        }
    }
    
    function isEmergencyMode() external view returns (bool) {
        return emergencyMode;
    }
}