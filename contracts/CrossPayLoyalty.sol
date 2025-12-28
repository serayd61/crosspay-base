// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CrossPayLoyalty
 * @dev Loyalty points system extension for CrossPay
 * @author serayd61
 * 
 * Features:
 * - Earn points on every payment
 * - Tier-based rewards (Bronze, Silver, Gold, Platinum)
 * - Redeem points for discounts
 * - Merchant-specific bonus campaigns
 */
contract CrossPayLoyalty {
    
    // Constants
    uint256 public constant POINTS_PER_ETH = 1000; // 1 ETH = 1000 points
    uint256 public constant BRONZE_THRESHOLD = 100;
    uint256 public constant SILVER_THRESHOLD = 500;
    uint256 public constant GOLD_THRESHOLD = 2000;
    uint256 public constant PLATINUM_THRESHOLD = 10000;
    
    // State
    address public owner;
    address public crossPayContract;
    
    enum Tier { None, Bronze, Silver, Gold, Platinum }
    
    struct UserLoyalty {
        uint256 totalPoints;
        uint256 availablePoints;
        uint256 lifetimeSpent;
        uint256 transactionCount;
        Tier currentTier;
        uint256 tierAchievedAt;
    }
    
    struct MerchantCampaign {
        string name;
        uint256 bonusMultiplier; // 100 = 1x, 200 = 2x, etc.
        uint256 startTime;
        uint256 endTime;
        bool isActive;
    }
    
    mapping(address => UserLoyalty) public userLoyalty;
    mapping(address => MerchantCampaign) public merchantCampaigns;
    
    // Events
    event PointsEarned(address indexed user, uint256 points, uint256 newTotal);
    event PointsRedeemed(address indexed user, uint256 points, uint256 discountValue);
    event TierUpgrade(address indexed user, Tier oldTier, Tier newTier);
    event CampaignCreated(address indexed merchant, string name, uint256 multiplier);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyCrossPay() {
        require(msg.sender == crossPayContract || msg.sender == owner, "Only CrossPay");
        _;
    }
    
    constructor(address _crossPayContract) {
        owner = msg.sender;
        crossPayContract = _crossPayContract;
    }
    
    /**
     * @dev Award points to user after payment
     * @param user User address
     * @param paymentAmount Payment amount in wei
     * @param merchant Merchant address for bonus campaigns
     */
    function awardPoints(
        address user, 
        uint256 paymentAmount,
        address merchant
    ) external onlyCrossPay {
        // Calculate base points
        uint256 basePoints = (paymentAmount * POINTS_PER_ETH) / 1 ether;
        
        // Apply tier bonus
        uint256 tierMultiplier = _getTierMultiplier(userLoyalty[user].currentTier);
        uint256 points = (basePoints * tierMultiplier) / 100;
        
        // Apply merchant campaign bonus if active
        if (merchantCampaigns[merchant].isActive && 
            block.timestamp >= merchantCampaigns[merchant].startTime &&
            block.timestamp <= merchantCampaigns[merchant].endTime) {
            points = (points * merchantCampaigns[merchant].bonusMultiplier) / 100;
        }
        
        // Update user stats
        userLoyalty[user].totalPoints += points;
        userLoyalty[user].availablePoints += points;
        userLoyalty[user].lifetimeSpent += paymentAmount;
        userLoyalty[user].transactionCount++;
        
        // Check for tier upgrade
        _checkTierUpgrade(user);
        
        emit PointsEarned(user, points, userLoyalty[user].totalPoints);
    }
    
    /**
     * @dev Redeem points for discount
     * @param points Number of points to redeem
     * @return discountValue Value of discount in wei
     */
    function redeemPoints(uint256 points) external returns (uint256 discountValue) {
        require(userLoyalty[msg.sender].availablePoints >= points, "Insufficient points");
        
        // 1 point = 0.001 ETH discount value
        discountValue = (points * 1 ether) / POINTS_PER_ETH;
        
        userLoyalty[msg.sender].availablePoints -= points;
        
        emit PointsRedeemed(msg.sender, points, discountValue);
        return discountValue;
    }
    
    /**
     * @dev Create merchant bonus campaign
     */
    function createCampaign(
        string memory name,
        uint256 bonusMultiplier,
        uint256 duration
    ) external {
        require(bonusMultiplier >= 100 && bonusMultiplier <= 500, "Invalid multiplier");
        require(duration <= 30 days, "Max 30 days");
        
        merchantCampaigns[msg.sender] = MerchantCampaign({
            name: name,
            bonusMultiplier: bonusMultiplier,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            isActive: true
        });
        
        emit CampaignCreated(msg.sender, name, bonusMultiplier);
    }
    
    /**
     * @dev Get user's loyalty info
     */
    function getUserLoyalty(address user) external view returns (
        uint256 totalPoints,
        uint256 availablePoints,
        uint256 lifetimeSpent,
        uint256 transactionCount,
        string memory tierName,
        uint256 pointsToNextTier
    ) {
        UserLoyalty memory ul = userLoyalty[user];
        return (
            ul.totalPoints,
            ul.availablePoints,
            ul.lifetimeSpent,
            ul.transactionCount,
            _getTierName(ul.currentTier),
            _getPointsToNextTier(ul.totalPoints, ul.currentTier)
        );
    }
    
    // Internal functions
    function _getTierMultiplier(Tier tier) internal pure returns (uint256) {
        if (tier == Tier.Platinum) return 150; // 1.5x
        if (tier == Tier.Gold) return 130; // 1.3x
        if (tier == Tier.Silver) return 115; // 1.15x
        if (tier == Tier.Bronze) return 105; // 1.05x
        return 100; // 1x
    }
    
    function _checkTierUpgrade(address user) internal {
        UserLoyalty storage ul = userLoyalty[user];
        Tier oldTier = ul.currentTier;
        Tier newTier = oldTier;
        
        if (ul.totalPoints >= PLATINUM_THRESHOLD) {
            newTier = Tier.Platinum;
        } else if (ul.totalPoints >= GOLD_THRESHOLD) {
            newTier = Tier.Gold;
        } else if (ul.totalPoints >= SILVER_THRESHOLD) {
            newTier = Tier.Silver;
        } else if (ul.totalPoints >= BRONZE_THRESHOLD) {
            newTier = Tier.Bronze;
        }
        
        if (newTier != oldTier) {
            ul.currentTier = newTier;
            ul.tierAchievedAt = block.timestamp;
            emit TierUpgrade(user, oldTier, newTier);
        }
    }
    
    function _getTierName(Tier tier) internal pure returns (string memory) {
        if (tier == Tier.Platinum) return "Platinum";
        if (tier == Tier.Gold) return "Gold";
        if (tier == Tier.Silver) return "Silver";
        if (tier == Tier.Bronze) return "Bronze";
        return "None";
    }
    
    function _getPointsToNextTier(uint256 points, Tier current) internal pure returns (uint256) {
        if (current == Tier.Platinum) return 0;
        if (current == Tier.Gold) return PLATINUM_THRESHOLD - points;
        if (current == Tier.Silver) return GOLD_THRESHOLD - points;
        if (current == Tier.Bronze) return SILVER_THRESHOLD - points;
        return BRONZE_THRESHOLD - points;
    }
    
    // Admin functions
    function setCrossPayContract(address _contract) external onlyOwner {
        crossPayContract = _contract;
    }
    
    function endCampaign(address merchant) external onlyOwner {
        merchantCampaigns[merchant].isActive = false;
    }
}

