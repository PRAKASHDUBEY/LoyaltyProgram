// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract LoyaltyProgram {
    
    using SafeMath for uint256;
    using Id for uint256;

    uint256 private nonce = 0;
    address public owner;
    mapping(address => bool) private isMerchant;
    mapping(address => string) private merchantName;


    mapping(address => Coin[]) private loyaltyPoint;
    struct Coin {
        address merchant;
        uint256 value; // Decaying
        uint256 redeem; // Redeemed before decay
    }

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

    mapping(address => Order[]) private orders;
    struct Order {
        uint256 id;
        address merchant;
        uint256 orderValue;
        uint256 delay;
        uint256 timestamp;
    }

    struct Tokenomics{
        uint256 minOdrVal;
        uint256 maxCoinValue;
        uint256 currPerCoin;
    }
    Tokenomics merchTokenomics = Tokenomics(200, 50, 50);

    using QueueLibrary for QueueLibrary.Queue;
    mapping(address =>  QueueLibrary.Queue) private decayQueue;
    uint256 decayDays = 180;
    
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

    constructor(string memory name) { 
        owner = msg.sender;
        isMerchant[owner] = true;
        merchantName[owner] = name;
    }

    function setMerchant(string memory name) external {
        isMerchant[msg.sender] = true;
        merchantName[msg.sender] = name;
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

    function setDecayDays(uint256 _decayDays) external onlyOwner{
        decayDays = _decayDays;
    }

    function getDecayDays() external view returns(uint256){
        return decayDays;
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
        deleteReI(_rewardIndex);
    }

    function deleteReI(uint256 index) internal onlyMerchant {
        uint256 rewardSize = rewards[msg.sender].length;
        
        rewards[msg.sender][index] = rewards[msg.sender][rewardSize -1];
        rewards[msg.sender].pop();
    }

    function expireReward(address merchant) external {
        uint256 rewardSize = rewards[merchant].length;
        for (uint256 i=0; i<rewardSize; i++) 
        {
            Reward memory reward = rewards[merchant][i];
            uint256 elapsedTime = block.timestamp.sub(reward.timestamp);
            uint256 elapsedSeconds = elapsedTime * 1 seconds;
            if(reward.expiryTime <= elapsedSeconds || reward.quantLmt <= reward.quantOver){
                deleteReI(i);
                rewardSize = rewardSize.sub(1);
                i = i.sub(1);
            }
        }
    }

    function fetchAllReward(address merchant) external view returns(Reward [] memory, string memory) { // name error
        return (rewards[merchant], merchantName[merchant]);
    }

    function fetchRedeemableReward(address merchant, uint256 orderValue) external onlyCustomer  returns(Reward [] memory, uint256, string memory name){
        uint256 _coinIndex = coinIndex(merchant);
        uint256 rewardSize = rewards[merchant].length;
        Reward [] memory redeemableList = new Reward[] (rewardSize);
        uint256 index = 0;
        for (uint256 i=0; i < rewardSize; i++){
            bool redemable = checkReedemable(merchant, i, orderValue, _coinIndex);
            if(redemable){
                Reward memory reward = rewards[merchant][i];
                redeemableList[index] = reward;
                index++;
            }
        }
        return (redeemableList, index, merchantName[merchant]);
    }

    function checkReedemable(address merchant, uint256 i, uint256 orderValue, uint256 _coinIndex) internal onlyCustomer view returns(bool){
        bool state = false;
        uint256 coinBalance = loyaltyPoint[msg.sender][_coinIndex].value;
        Reward memory reward = rewards[merchant][i];
        if(coinBalance >= reward.minCoin && 
        coinBalance >= reward.coinValue && 
        orderValue >= reward.minOdrVal)state = true;
        return state;
    }

    function redeemReward(address merchant, uint256 id, uint256 orderValue) external onlyCustomer returns(uint256){
        uint256 payableAmount = orderValue;
        uint256 index = getRewardIndex(merchant, id);
        uint256 _coinIndex = coinIndex(merchant);
        bool redemable = checkReedemable(merchant, index, orderValue, _coinIndex);
        if(redemable){
            Reward memory reward = rewards[merchant][index];
            uint256 discount = reward.disPercent * payableAmount / 100;
            if(discount > reward.disMaxVal) discount = reward.disMaxVal;
            payableAmount = payableAmount.sub(discount);
            removeCoin(_coinIndex, reward.coinValue);
            loyaltyPoint[msg.sender][_coinIndex].redeem += reward.coinValue;
            rewards[merchant][index].quantOver = rewards[merchant][index].quantOver.add(1);
            logTransaction(merchant, "Redeem", reward.coinValue);
        }
        return payableAmount;
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

/************************************ Customer Interaction ***********************************************/

    function customerBalance() external onlyCustomer view returns(Coin [] memory)   {
        return loyaltyPoint[msg.sender];
    }
    
    function updateBalance() external onlyCustomer{
        decayCoin();
        checkEarningStatus();
    }

    function customerTransaction() external view onlyCustomer returns(Transaction [] memory) {
        return transactions[msg.sender];
    }

    // Coin earning method
    function purchase(address merchant,uint256 orderValue, uint256 delay) external onlyCustomer {
        uint256 uniqueId = nonce.generateId();
        orders[msg.sender].push(Order(uniqueId, merchant, orderValue, delay, block.timestamp));
    }

    function getOrders() external view onlyCustomer returns(Order [] memory) {
        return orders[msg.sender];
    }

    function cancelOrder(uint256 id) external onlyCustomer returns(bool){
        uint256 i = getOrderIndex(id);
        deleteSettledOrder(i);
        return true;
    }

    function getOrderIndex(uint256 id) internal onlyCustomer view returns(uint256){
        uint256 index;
        uint256 orderSize = orders[msg.sender].length;
        for (uint256 i=0; i<orderSize; i++) 
        {
            Order memory order = orders[msg.sender][i];

            if(order.id == id){
                index = i;
                break;
            }
        }
        return index;
    }

/************************************ Earning and Decay ***********************************************/

    function checkEarningStatus() internal onlyCustomer returns (bool) {
        uint256 orderSize = orders[msg.sender].length;
        for (uint256 i=0; i<orderSize; i++) 
        {
            Order memory order = orders[msg.sender][i];

            uint256 elapsedTime = block.timestamp - order.timestamp;
            uint256 elapsedSeconds = elapsedTime * 1 seconds;
            if(order.delay <= elapsedSeconds){
                if(order.orderValue >= merchTokenomics.minOdrVal){
                    uint256 earnedCoin = addEarnedCoin(order.orderValue, owner);
                    updateLogAndDecay( earnedCoin, order.merchant);
                }
                
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

    function addEarnedCoin(uint256 orderValue, address merchant ) internal onlyCustomer returns(uint256) {
        uint256 earnedCoin = orderValue / merchTokenomics.currPerCoin;
        earnedCoin = earnedCoin <= merchTokenomics.maxCoinValue ? earnedCoin : merchTokenomics.maxCoinValue;
        uint256 ownerCoinIndex = coinIndex(merchant);
        loyaltyPoint[msg.sender][ownerCoinIndex].value += earnedCoin;
        return earnedCoin;
    }

    function removeCoin(uint256 i, uint256 value)internal onlyCustomer{
        loyaltyPoint[msg.sender][i].value = loyaltyPoint[msg.sender][i].value.sub(value);
    }

    function updateLogAndDecay(uint256 earnedCoin, address merchant)internal onlyCustomer{
        decayQueue[msg.sender].enqueue(QueueLibrary.Item( block.timestamp, earnedCoin, merchant));
        logTransaction(merchant, "Earned", earnedCoin);
    }


    function logTransaction(address merchant, string memory status, uint256 value) internal onlyCustomer{
        DtLibrary.Date memory date = DtLibrary.getDate(block.timestamp);
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
        uint256 elapsedSeconds = elapsedTime * 1 seconds;
        while (elapsedSeconds >= decayDays) {

            uint256 decayAmount = headItem.value;
            uint256 _coinIndex = coinIndex(headItem.merchant);
            
            uint256 redeemedValue = loyaltyPoint[msg.sender][_coinIndex].redeem;
            if(redeemedValue <= decayAmount){
                loyaltyPoint[msg.sender][_coinIndex].redeem = 0;
                decayAmount = decayAmount.sub(redeemedValue);
            }
            removeCoin(_coinIndex, decayAmount);
            logTransaction(headItem.merchant, "Decay", decayAmount);

            queue.dequeue();

            if(queue.size() == 0) break;
            headItem = queue.getFront();
            elapsedTime = block.timestamp.sub(headItem.timestamp);
            elapsedSeconds = elapsedTime * 1 seconds;
        }
        return true;
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