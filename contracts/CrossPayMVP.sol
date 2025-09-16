// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CrossPayMVP {
    // Merchant kayıtları
    mapping(address => Merchant) public merchants;
    mapping(bytes32 => Payment) public payments;
    mapping(address => uint256) public userBalances;
    
    uint256 public totalPayments;
    uint256 public platformFeePercent = 10; // 1% = 10/1000
    address public owner;
    
    struct Merchant {
        string businessName;
        string businessType; // cafe, restaurant, store
        bool isActive;
        uint256 totalReceived;
        uint256 dailyVolume;
        uint256 lastResetDate;
        uint256 dailyLimit;
    }
    
    struct Payment {
        address customer;
        address merchant;
        uint256 amount;
        uint256 timestamp;
        string invoiceId;
        bool completed;
    }
    
    // Events
    event MerchantRegistered(address indexed merchant, string businessName);
    event PaymentProcessed(
        address indexed customer, 
        address indexed merchant, 
        uint256 amount, 
        string invoiceId
    );
    event FundsDeposited(address indexed user, uint256 amount);
    event FundsWithdrawn(address indexed user, uint256 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyActiveMerchant(address merchant) {
        require(merchants[merchant].isActive, "Merchant not active");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    // Merchant kayıt
    function registerMerchant(
        string memory _businessName,
        string memory _businessType
    ) external {
        require(bytes(_businessName).length > 0, "Invalid name");
        require(!merchants[msg.sender].isActive, "Already registered");
        
        merchants[msg.sender] = Merchant({
            businessName: _businessName,
            businessType: _businessType,
            isActive: true,
            totalReceived: 0,
            dailyVolume: 0,
            lastResetDate: block.timestamp,
            dailyLimit: 10 ether // Default daily limit
        });
        
        emit MerchantRegistered(msg.sender, _businessName);
    }
    
    // Kullanıcı para yükleme (prepaid)
    function deposit() external payable {
        require(msg.value > 0, "Must deposit something");
        userBalances[msg.sender] += msg.value;
        emit FundsDeposited(msg.sender, msg.value);
    }
    
    // QR kod ödemesi
    function payWithQR(
        address merchantAddress,
        uint256 amount,
        string memory invoiceId
    ) external onlyActiveMerchant(merchantAddress) {
        require(userBalances[msg.sender] >= amount, "Insufficient balance");
        require(amount > 0, "Invalid amount");
        
        // Check daily limit
        Merchant storage merchant = merchants[merchantAddress];
        
        // Reset daily volume if new day
        if (block.timestamp > merchant.lastResetDate + 1 days) {
            merchant.dailyVolume = 0;
            merchant.lastResetDate = block.timestamp;
        }
        
        require(
            merchant.dailyVolume + amount <= merchant.dailyLimit,
            "Daily limit exceeded"
        );
        
        // Calculate fees
        uint256 fee = (amount * platformFeePercent) / 1000;
        uint256 merchantAmount = amount - fee;
        
        // Update balances
        userBalances[msg.sender] -= amount;
        userBalances[merchantAddress] += merchantAmount;
        userBalances[owner] += fee; // Platform fee
        
        // Update merchant stats
        merchant.totalReceived += merchantAmount;
        merchant.dailyVolume += amount;
        
        // Record payment
        bytes32 paymentId = keccak256(
            abi.encodePacked(msg.sender, merchantAddress, invoiceId, block.timestamp)
        );
        
        payments[paymentId] = Payment({
            customer: msg.sender,
            merchant: merchantAddress,
            amount: amount,
            timestamp: block.timestamp,
            invoiceId: invoiceId,
            completed: true
        });
        
        totalPayments++;
        
        emit PaymentProcessed(msg.sender, merchantAddress, amount, invoiceId);
    }
    
    // Direkt ödeme (QR olmadan)
    function payDirect(address merchantAddress) 
        external 
        payable 
        onlyActiveMerchant(merchantAddress) 
    {
        require(msg.value > 0, "Must pay something");
        
        uint256 fee = (msg.value * platformFeePercent) / 1000;
        uint256 merchantAmount = msg.value - fee;
        
        // Transfer to merchant
        userBalances[merchantAddress] += merchantAmount;
        userBalances[owner] += fee;
        
        // Update stats
        merchants[merchantAddress].totalReceived += merchantAmount;
        merchants[merchantAddress].dailyVolume += msg.value;
        
        totalPayments++;
        
        emit PaymentProcessed(
            msg.sender, 
            merchantAddress, 
            msg.value, 
            "DIRECT"
        );
    }
    
    // Para çekme
    function withdraw(uint256 amount) external {
        require(userBalances[msg.sender] >= amount, "Insufficient balance");
        
        userBalances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        
        emit FundsWithdrawn(msg.sender, amount);
    }
    
    // Merchant istatistikleri
    function getMerchantStats(address merchant) 
        external 
        view 
        returns (
            string memory businessName,
            uint256 totalReceived,
            uint256 dailyVolume,
            uint256 availableLimit
        ) 
    {
        Merchant memory m = merchants[merchant];
        uint256 available = m.dailyLimit - m.dailyVolume;
        
        // Check if needs reset
        if (block.timestamp > m.lastResetDate + 1 days) {
            available = m.dailyLimit;
        }
        
        return (
            m.businessName,
            m.totalReceived,
            m.dailyVolume,
            available
        );
    }
    
    // Batch payment için hazırlık (gelecek versiyon)
    struct BatchPayment {
        address merchant;
        uint256 amount;
        string invoiceId;
    }
    
    function processBatchPayments(BatchPayment[] memory batchPayments) 
        external 
    {
        uint256 totalAmount = 0;
        
        // Calculate total
        for(uint i = 0; i <batchPayments.length; i++) {
            totalAmount += batchPayments[i].amount;
        }
        
        require(userBalances[msg.sender] >= totalAmount, "Insufficient balance");
        
        // Process each payment
        for(uint i = 0; i < batchPayments.length; i++) {
            BatchPayment memory p = batchPayments[i]; 
            
            uint256 fee = (p.amount * platformFeePercent) / 1000;
            uint256 merchantAmount = p.amount - fee;
            
            userBalances[msg.sender] -= p.amount;
            userBalances[p.merchant] += merchantAmount;
            userBalances[owner] += fee;
            
            emit PaymentProcessed(msg.sender, p.merchant, p.amount, p.invoiceId);
        }
    }
    
    // Admin functions
    function updatePlatformFee(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= 50, "Max fee 5%"); // Max 5%
        platformFeePercent = newFeePercent;
    }
    
    function updateMerchantLimit(address merchant, uint256 newLimit) 
        external 
        onlyOwner 
    {
        merchants[merchant].dailyLimit = newLimit;
    }
    
    // Emergency functions
    function pauseMerchant(address merchant) external onlyOwner {
        merchants[merchant].isActive = false;
    }
    
    function activateMerchant(address merchant) external onlyOwner {
        merchants[merchant].isActive = true;
    }
    
    // View functions
    function getBalance(address user) external view returns (uint256) {
        return userBalances[user];
    }
    
    function getPlatformStats() 
        external 
        view 
        returns (
            uint256 _totalPayments,
            uint256 _platformBalance,
            uint256 _platformFeePercent
        ) 
    {
        return (
            totalPayments,
            userBalances[owner],
            platformFeePercent
        );
    }
}
