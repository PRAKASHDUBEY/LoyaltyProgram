// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract LoyaltyProgram {
    
    using SafeMath for uint256;

    uint256 private nonce = 0;
    address public owner;
    mapping(address => bool) private isMerchant;


    mapping(address => Coin[]) private loyaltyPoint;
    struct Coin {
        address merchant;
        uint256 value; // Decaying value
        uint256 decayingRedeemed; // Redeemed before decay
    }

    mapping(address => Reward[]) private rewards;
    struct Reward {
        uint256 id;
        string title;
        string [] description;
        uint256 coinValue;
        uint256 minimumCoin;
        uint256 discountValue;
    }

    mapping(address => Order[]) private orders;
    struct Order {
        address [] merchants;
        uint256 [] merchantValue;
        uint256 orderValue;
        uint256 maxReturnPeriod;
        uint256 timestamp;
    }

    struct Tokenomics{
        uint256 minOrderValue;
        uint256 maxCoinValue;
        uint256 currencyPerCoin;
    }
    Tokenomics ownerTokenomics;
    Tokenomics merchantTokenomics;

    mapping(address =>  QueueLibrary.Queue) private decayQueue;
    using QueueLibrary for QueueLibrary.Queue;
    uint256 decayDays = 180;
    
    mapping(address => Transaction[]) private transactions;
    struct Transaction {
        address merchant;
        string status;
        uint256 value;
        DateTimeLibrary.DateTime timestamp;
    }
    using DateTimeLibrary for DateTimeLibrary.DateTime;

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

    function setMerchantTokenomics(uint256 minOrderValue, uint256 maxCoinValue, uint256 currencyToUnitCoin) external onlyOwner {
        merchantTokenomics = Tokenomics(minOrderValue,maxCoinValue,currencyToUnitCoin);
    }

    function getMerchantTokenomics() external view returns(Tokenomics memory){
        return merchantTokenomics;
    }

    function setOwnerTokenomics(uint256 minOrderValue, uint256 maxCoinValue, uint256 currencyToUnitCoin) external onlyOwner {
        ownerTokenomics = Tokenomics(minOrderValue,maxCoinValue,currencyToUnitCoin);
    }

    function getOwnerTokenomics() external view returns(Tokenomics memory){
        return ownerTokenomics;
    }

    function setDecayDays(uint256 _decayDays) external onlyOwner{
        decayDays = _decayDays;
    }

    function getDecayDays() external view returns(uint256){
        return decayDays;
    }

/************************************ Reward ***********************************************/

    function addReward(string memory title, uint256 coinValue,uint256 minimumCoin, uint256 discountValue) external onlyMerchant {
        uint256 uniqueId = generateId();
        rewards[msg.sender].push(Reward(uniqueId, title, coinValue, minimumCoin, discountValue));
    }

    function deleteReward(uint256 id) external onlyMerchant {

        uint256 rewardSize = rewards[msg.sender].length;

        uint256 _rewardIndex = getRewardIndex(msg.sender, id);
        
        rewards[msg.sender][_rewardIndex] = rewards[msg.sender][rewardSize -1];
        rewards[msg.sender].pop();
    }

    function fetchAllReward(address merchant) external view returns(Reward [] memory) {
        return rewards[merchant];
    }

    function fetchRedeemableReward(address merchant) external onlyCustomer view returns(Reward [] memory, uint256){
        uint256 _merchantBalance = merchantWiseBalance(merchant);

        uint256 rewardSize = rewards[merchant].length;
        Reward [] memory redeemableList = new Reward[] (rewardSize);
        uint256 index = 0;
        for (uint256 i=0; i < rewardSize; i++){

            Reward memory reward = rewards[merchant][i];
            if(_merchantBalance >= reward.minimumCoin){
                redeemableList[index] = reward;
                index++;
            }
        }
        return (redeemableList, index);
    }

    function redeemReward(address merchant, uint256 id) external onlyCustomer returns(bool){
        
        for (uint256 i=0; i<loyaltyPoint[msg.sender].length; i++){
            Coin memory coin = loyaltyPoint[msg.sender][i];
            if(coin.merchant == merchant){
                uint256 index = getRewardIndex(merchant, id);
                Reward memory reward = rewards[merchant][index];
                
                require(coin.value >= reward.coinValue, "Insufficient Coins");
                require(coin.value >= reward.minimumCoin, "Minimum Coin required");
                loyaltyPoint[msg.sender][i].value = loyaltyPoint[msg.sender][i].value.sub(reward.coinValue);
                loyaltyPoint[msg.sender][i].decayingRedeemed += reward.coinValue;
                
                logTransaction(merchant, "Redeem", reward.coinValue);
                break;
            }
        }
        return true;
    }

/************************************ Reward Utils ***********************************************/


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

    function merchantWiseBalance(address merchant) internal view onlyCustomer returns (uint256){

        uint256 _merchantBalance = 0;

        for (uint256 i=0; i<loyaltyPoint[msg.sender].length; i++){
            Coin memory coin = loyaltyPoint[msg.sender][i];
            if(coin.merchant == merchant){
                _merchantBalance = coin.value;
                break;
            }
        }
        return _merchantBalance;
    }

    function generateId() internal returns (uint256){
        uint256 uniqueId = uint256(keccak256(abi.encodePacked(block.timestamp, address(this), nonce)));
        nonce++;
        return uniqueId;
    }

/************************************ Customer Interaction ***********************************************/

    function customerBalance() external onlyCustomer  returns(Coin [] memory)   {
        decayCoin();
        checkEarningStatus();
        return loyaltyPoint[msg.sender];
        // return 4;
    }

    function customerTransaction() public view onlyCustomer returns(Transaction [] memory) {
        return transactions[msg.sender];
    }

    // Coin earning method
    function purchase(address [] calldata merchants, uint256 [] calldata merchantValue, uint256 orderValue, uint256 maxReturnPeriod) external onlyCustomer {
        orders[msg.sender].push(Order(merchants, merchantValue, orderValue, maxReturnPeriod, block.timestamp));
    }

/************************************ Earning and Decay ***********************************************/

    function checkEarningStatus() internal onlyCustomer returns (bool) {
        uint256 orderSize = orders[msg.sender].length;
        for (uint256 i=0; i<orderSize; i++) 
        {
            Order memory order = orders[msg.sender][i];

            uint256 elapsedTime = block.timestamp - order.timestamp;
            uint256 elapsedDays = elapsedTime * 1 days;
            if(order.maxReturnPeriod <= elapsedDays){

                addCoinFromOwner(order.orderValue);
                addCoinFromMerchant(order);
                
                orderSize = deleteSettledOrder(i);
                i = i.sub(1);
            }
        }
        return true;
    }

    function deleteSettledOrder(uint256 index) internal onlyCustomer returns(uint256){
        uint256 orderSize = orders[msg.sender].length;
        orders[msg.sender][index] = orders[msg.sender][orderSize.sub(1)];
        orders[msg.sender].pop();
        return orderSize.sub(1);
    }

    function addCoinFromOwner(uint256 orderValue) internal onlyCustomer {
        if(orderValue >= ownerTokenomics.minOrderValue){
            uint256 earnedCoin = addEarnedCoin(orderValue, ownerTokenomics, owner);
            updateLogAndDecay( earnedCoin, owner);
        }
    }

    function addCoinFromMerchant(Order memory order) internal onlyCustomer {
        for (uint256 j=0; j<order.merchants.length; j++) 
        {
            if(order.merchantValue[j] >= merchantTokenomics.minOrderValue){
                uint256 earnedCoin = addEarnedCoin(order.merchantValue[j], merchantTokenomics, order.merchants[j]);
                updateLogAndDecay( earnedCoin, order.merchants[j]);
            }
        }
    }

    function addEarnedCoin(uint256 orderValue, Tokenomics memory _merchantTokenomics, address merchant ) internal onlyCustomer returns(uint256) {
        uint256 earnedCoin = orderValue / _merchantTokenomics.currencyPerCoin;
        earnedCoin = earnedCoin <= _merchantTokenomics.maxCoinValue ? earnedCoin : _merchantTokenomics.maxCoinValue;
        uint256 ownerCoinIndex = coinIndex(merchant);
        loyaltyPoint[msg.sender][ownerCoinIndex].value += earnedCoin;
        return earnedCoin;
    }

    function updateLogAndDecay(uint256 earnedCoin, address merchant)internal onlyCustomer{
        decayQueue[msg.sender].enqueue(QueueLibrary.Item( block.timestamp, earnedCoin, merchant));
        logTransaction(merchant, "Earned", earnedCoin);
    }


    function logTransaction(address merchant, string memory status, uint256 value) internal onlyCustomer{
        DateTimeLibrary.DateTime memory date = DateTimeLibrary.getDateTime(block.timestamp);
        transactions[msg.sender].push(Transaction(merchant, status, value, date));
    }

    function coinIndex(address merchant) internal onlyCustomer returns(uint256){
        
        uint256 coinLength = loyaltyPoint[msg.sender].length;
        uint256 index;
        for (uint256 i=0; i < coinLength; i++){
            Coin memory coin = loyaltyPoint[msg.sender][i];
            if(coin.merchant == merchant){
                index = i;
                break;
            }
            if(i == coinLength.sub(1)){
                loyaltyPoint[msg.sender].push(Coin(merchant, 0, 0));
                index = i.add(1);
            }
        }
        return index;
    }

    function decayCoin() internal onlyCustomer returns (bool){
        QueueLibrary.Queue storage queue = decayQueue[msg.sender];
        if(queue.size() == 0) return false;

        QueueLibrary.Item memory headItem = queue.getFront();
        uint256 elapsedTime = block.timestamp.sub(headItem.timestamp);
        uint256 elapsedDays = elapsedTime * 1 days;
        while (elapsedDays >= decayDays) {

            uint256 decayAmount = headItem.value;
            uint256 _coinIndex = coinIndex(headItem.merchant);
            
            uint256 redeemedValue = loyaltyPoint[msg.sender][_coinIndex].decayingRedeemed;
            if(redeemedValue <= decayAmount){
                loyaltyPoint[msg.sender][_coinIndex].decayingRedeemed = 0;
                decayAmount = decayAmount.sub(redeemedValue);
            }
            loyaltyPoint[msg.sender][_coinIndex].value = loyaltyPoint[msg.sender][_coinIndex].value.sub(decayAmount);
            
            logTransaction(headItem.merchant, "Decay", decayAmount);

            queue.dequeue();

            if(queue.size() == 0) break;
            headItem = queue.getFront();
            elapsedTime = block.timestamp.sub(headItem.timestamp);
            elapsedDays = elapsedTime * 1 days;
        }
        return true;
    }
}

/************************************ Libraries ***********************************************/

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

library QueueLibrary {
    
    struct Queue {
        Item[] elements;
        uint256 front;
        uint256 rear;
    }

    struct Item {
        uint256 timestamp;
        uint256 value;
        address merchant;
    }

    function enqueue(Queue storage queue, Item memory value) internal {
        queue.elements.push(value);
        if (queue.front == type(uint256).max) {
            queue.front = 0;
        }
        queue.rear++;
    }

    function dequeue(Queue storage queue) internal  {
        require(queue.rear > queue.front, "Queue is empty");
        delete queue.elements[queue.front];
        queue.front++;
    }

    function size(Queue storage queue) internal view returns (uint256) {
        return queue.rear - queue.front;
    }

    function getFront(Queue storage queue) internal view returns (Item memory) {
        require(queue.rear > queue.front, "Queue is empty");
        return queue.elements[queue.front];
    }

    function updateFront(Queue storage queue, Item memory value) internal {
        queue.elements[queue.front] = value;
    }
}

library DateTimeLibrary {
    struct DateTime {
        uint16 year;
        uint8 month;
        uint8 day;
    }

    function getDateTime(uint256 timestamp) internal pure returns (DateTime memory dt) {
        uint256 secondsInDay = 86400;
        dt.year = uint16(1970 + ((timestamp / secondsInDay / 365) - 2));
        uint256 yearTimestamp = timestamp - ((dt.year - 1970 + 2) * secondsInDay * 365);
        dt.month = uint8(yearTimestamp / (secondsInDay * 30)) + 1;
        uint256 monthTimestamp = yearTimestamp - ((dt.month - 1) * secondsInDay * 30);
        dt.day = uint8(monthTimestamp / secondsInDay) + 1;
    }
}