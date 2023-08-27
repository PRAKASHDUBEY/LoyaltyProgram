const jwt = require("jsonwebtoken");
const contract = require("./contract");
const errorLog = require("./responseHandler").error
const success = require("./responseHandler").success

// privateKey
module.exports.tokenize = async function tokenize(req, res) {
    try {
        const payload = {
            user: {
                id: req.body.privateKey
            }
        }
        jwt.sign(payload, process.env.jwtUserSecret, {
            expiresIn: 30000
        }, (err, token) => {
            if (err) throw err;
            success(res, 200, token);
        })
    } catch (err) {
        errorLog(res, err);
    }
}
// uint256 minOrderValue, uint256 maxCoinValue, uint256 currencyToUnitCoin
module.exports.setMerchantTokenomics = async function (req, res) {
    try {
        const {minOrderValue,  maxCoinValue,  currencyToUnitCoin} = req.body;
        const Contract = await contract(req.user.id);
        const output = await Contract.setMerchantTokenomics(minOrderValue,  maxCoinValue,  currencyToUnitCoin);
        await output;
        success(res, 200, output);
    } catch (err) {
        errorLog(res, err);
    }
}
// 
module.exports.getMerchantTokenomics = async function (req, res) {
    try {
        const Contract = await contract(req.user.id);
        const output = await Contract.getMerchantTokenomics();
        await output;
        const response = output.toString().split(',');
        const resObj = {
            minOrderValue : response[0],  
            maxCoinValue : response[1],  
            currencyToUnitCoin : response[2]
        }
        success(res, 200, resObj);
    } catch (err) {
        errorLog(res, err);
    }
}
// string memory title, string memory desc, string memory imgURL, 
// uint256 coinValue, uint256 minCoin, uint256 minimumOrderValue, 
// uint256 disPercent, uint256 disMaxVal, 
// uint256 expiryInSeconds, uint256 quantLmt
module.exports.addReward = async function (req, res) {
    try {
        const {title, desc, imgURL, coinValue, minimumCoin, minimumOrderValue, disPercent, disMaxVal, quantLmt} = req.body;
        const Contract = await contract(req.user.id);
        const output = await Contract.addReward(title, desc, imgURL, coinValue, minimumCoin, minimumOrderValue, disPercent, disMaxVal, 0, quantLmt);
        await output;
        success(res, 200, output);
    } catch (err) {
        errorLog(res, err);
    }
}
// uint256 id
module.exports.deleteReward = async function (req, res) {
    try {
        const {id} = req.body;
        const Contract = await contract(req.user.id);
        const output = await Contract.deleteReward(id);
        await output;
        success(res, 200, output);
    } catch (err) {
        errorLog(res, err);
    }
}
// address merchant
module.exports.fetchAllReward = async function (req, res) { // Not working
    try {
        const {merchant} = req.body;
        const Contract = await contract(req.user.id);
        const setTx1 = await Contract.fetchAllReward(merchant)
        await setTx1;
        const str = setTx1.toString();
        const Arr = str.split(",")
        const length = Arr.length;
        let response = [];
        for(let i=0; i<length; i+=13){
            const resp = Arr.slice(i,i+13);
            const rewardObj = new Reward(resp);
            response.push(rewardObj);
        }

        success(res, 200, response);
    } catch (err) {
        errorLog(res, err);
    }
}
// address merchant, uint256 id, uint256 orderValue
module.exports.redeemReward = async function (req, res) {
    try {
        const {merchant,  id, orderValue} = req.body
        const Contract = await contract(req.user.id);
        const output = await Contract.redeemReward(merchant,  id, orderValue);
        await output;
        success(res, 200, output);
    } catch (err) {
        errorLog(res, err);
    }
}

module.exports.customerBalance = async function (req, res) {
    try {
        const {merchant} = req.body
        const Contract = await contract(req.user.id);
        const output = await Contract.customerBalance(merchant);
        await output;
        success(res, 200, output.toString());
    } catch (err) {
        errorLog(res, err);
    }
}

module.exports.customerTransaction = async function (req, res) {
    try {
        const Contract = await contract(req.user.id);
        const setTx1 = await Contract.customerTransaction();
        await setTx1;
        const str = setTx1.toString();
        const Arr = str.split(",")
        const length = Arr.length;
        let response = [];
        for(let i=0; i<length; i+=6){
            const resp = Arr.slice(i,i+6);
            const Obj = new Transaction(resp);
            response.push(Obj);
        }
        success(res, 200, response);
    } catch (err) {
        errorLog(res, err);
    }
}
// address merchants, uint256 orderValue, uint256 maxReturnPeriod
module.exports.purchase = async function (req, res) {
    try {
        const order = req.body;
        const Contract = await contract(req.user.id);
        const output = await Contract.purchase(order[0].merchant,  order[0].orderValue);
        await output;
        const output2 = await Contract.purchase(order[1].merchant,  order[1].orderValue);
        await output2;
        success(res, 200, output);
    } catch (err) {
        errorLog(res, err);
    }
}

class Reward{
    constructor(arr){
        this.id = arr[0],
        this.title = arr[1], 
        this.desc = arr[2].split('\\n'), 
        this.imgURL = arr[3], 
        this.coinValue = arr[4], 
        this.minimumCoin = arr[5], 
        this.minimumOrderValue = arr[6], 
        this.discountPercent = arr[7], 
        this.discountMaxVal = arr[8], 
        this.expiryInSeconds = arr[9], 
        this.timestamp = arr[10],
        this.quantityLimit = arr[11],
        this.quantityOver = arr[12]
    }
}

class Transaction{
    constructor(arr){
        this.merchant = arr[0];
        this.status = arr[1];
        this.value = arr[2];
        // this.timestamp = `${arr[3]} ${arr[4]} ${arr[5]}`;
    }
}