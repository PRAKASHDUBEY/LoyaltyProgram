// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract LoyaltyProgram {
    
    using SafeMath for uint256;
    using Id for uint256;

    uint256 private nonce = 0;
    address public owner;
    mapping(address => bool) private isMerchant;

    mapping(address => mapping (address => uint256)) private customerCoin;

    mapping(address => Reward[]) private rewards;
    struct Reward {
        uint256 id;
        string title;
        string desc;
        string imgURL;
        uint256 coinValue;
        uint256 minCoin; // Condition of loyalty level
        uint256 minOdrVal; // can be 0 for ( ex ) Fridge
        uint256 disPercent; // 100 % for price based discount
        uint256 disMaxVal; // Price of discount
        uint256 expiryTime;
        uint256 timestamp;
        uint256 quantLmt;
        uint256 quantOver;
    }

    struct Tokenomics{
        uint256 minOdrVal;
        uint256 maxCoinValue;
        uint256 currPerCoin;
    }
    Tokenomics merchTokenomics = Tokenomics(100, 50, 50);
    
    mapping(address => Transaction[]) private transactions;
    struct Transaction {
        address merchant;
        string status;
        uint256 value;
        DtLibrary.Date timestamp;
    }
    using DtLibrary for DtLibrary.Date;

    // event Transfer(address indexed from, address indexed to, uint256 value);

/************************************ Roles and Permisssion ***********************************************/

    constructor() { 
        owner = msg.sender;
        isMerchant[owner] = true;
    }

    function setMerchant() external {
        isMerchant[msg.sender] = true;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyMerchant() {
        require(isMerchant[msg.sender], "Only merchant can call this function");
        _;
    }

    modifier onlyCustomer() {
        require(!isMerchant[msg.sender], "Only customer can call this function");
        _;
    }

/************************************ Tokenomics ***********************************************/

    function setMerchantTokenomics(uint256 minOdrVal, uint256 maxCoinValue, uint256 currPerCoin) external onlyOwner {
        merchTokenomics = Tokenomics(minOdrVal,maxCoinValue,currPerCoin);
    }

    function getMerchantTokenomics() external view returns(Tokenomics memory){
        return merchTokenomics;
    }

/************************************ Reward ***********************************************/

    function addReward(
        string memory title, string memory desc, string memory imgURL, 
        uint256 coinValue, uint256 minCoin, uint256 minimumOrderValue, 
        uint256 disPercent, uint256 disMaxVal, 
        uint256 expiryInSeconds, uint256 quantLmt) external onlyMerchant {

        uint256 uniqueId = nonce.generateId();
        rewards[msg.sender].push(Reward(uniqueId, title,  desc,  imgURL,  coinValue, minCoin,  minimumOrderValue,  disPercent,  disMaxVal,  expiryInSeconds, block.timestamp,  quantLmt, 0));
    }

    function deleteReward(uint256 id) external onlyMerchant {
        uint256 _rewardIndex = getRewardIndex(msg.sender, id);
        uint256 rewardSize = rewards[msg.sender].length;
        
        rewards[msg.sender][_rewardIndex] = rewards[msg.sender][rewardSize -1];
        rewards[msg.sender].pop();
    }

    function getRewardIndex(address merchant, uint256 id) internal view returns(uint256){

        uint256 rewardSize = rewards[merchant].length;
        uint256 index = 0;

        for (uint256 i=0; i < rewardSize; i++){
            Reward memory reward = rewards[merchant][i];
            if(reward.id == id){ 
                index = i;
                break;
            }
        }
        return index;
    }

/************************************ Customer ***********************************************/

    function purchase(address merchant,uint256 orderValue) external onlyCustomer {
        if(orderValue >= merchTokenomics.minOdrVal) {
            uint256 earnedCoin = orderValue / merchTokenomics.currPerCoin;
            earnedCoin = earnedCoin <= merchTokenomics.maxCoinValue ? earnedCoin : merchTokenomics.maxCoinValue;
            customerCoin[msg.sender][merchant] = customerCoin[msg.sender][merchant].add(earnedCoin);
            logTransaction(merchant, "Earn", earnedCoin);
        }
    }

    function customerBalance(address merchant) external onlyCustomer view returns(uint256)   {
        return customerCoin[msg.sender][merchant];
    }

    function fetchAllReward(address merchant) external view returns(Reward [] memory) { // name error
        return rewards[merchant];
    }

    function redeemReward(address merchant, uint256 id, uint256 orderValue) external onlyCustomer returns(uint256){
        uint256 payableAmount = orderValue;
        uint256 coinBalance = customerCoin[msg.sender][merchant];

        uint256 index = getRewardIndex(merchant, id);
        Reward memory reward = rewards[merchant][index];
        
        if(coinBalance >= reward.minCoin && 
        coinBalance >= reward.coinValue && 
        orderValue >= reward.minOdrVal){

            uint256 discount = reward.disPercent * payableAmount / 100;
            if(discount > reward.disMaxVal) discount = reward.disMaxVal;
            payableAmount = payableAmount.sub(discount);

            customerCoin[msg.sender][merchant] = customerCoin[msg.sender][merchant].sub(reward.coinValue);

            rewards[merchant][index].quantOver = rewards[merchant][index].quantOver.sub(1);
            
            logTransaction(merchant, "Redeem", reward.coinValue);
        }
        return payableAmount;
    }
    
    function customerTransaction() external view onlyCustomer returns(Transaction [] memory) {
        return transactions[msg.sender];
    }

    function logTransaction(address merchant, string memory status, uint256 value) internal onlyCustomer{
        DtLibrary.Date memory date = DtLibrary.getDate(block.timestamp);
        transactions[msg.sender].push(Transaction(merchant, status, value, date));
    }
}


/************************************ Libraries ***********************************************/

library Id{
    function generateId(uint256 nonce) internal view returns (uint256){
        uint256 uniqueId = uint256(keccak256(abi.encodePacked(block.timestamp, address(this), nonce)));
        nonce++;
        return uniqueId;
    }
}

library SafeMath { 
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
      assert(b <= a);
      return a - b;
    }
    
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
      uint256 c = a + b;
      assert(c >= a);
      return c;
    }
} 

library DtLibrary {
    struct Date {
        uint16 year;
        uint8 month;
        uint8 day;
    }

    function getDate(uint256 timestamp) internal pure returns (Date memory dt) {
        uint256 secondsInDay = 86400;
        dt.year = uint16(1970 + ((timestamp / secondsInDay / 365) - 2));
        uint256 yearTimestamp = timestamp - ((dt.year - 1970 + 2) * secondsInDay * 365);
        dt.month = uint8(yearTimestamp / (secondsInDay * 30)) + 1;
        uint256 monthTimestamp = yearTimestamp - ((dt.month - 1) * secondsInDay * 30);
        dt.day = uint8(monthTimestamp / secondsInDay) + 1;
    }
}