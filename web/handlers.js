const jwt = require("jsonwebtoken");
const hre = require("hardhat");
const ContractJson = require("../artifacts/contracts/LoyaltyProgram.sol/LoyaltyProgram.json");
const abi = ContractJson.abi;
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
            res.status(200).json({
                msg: 'Athentication Success!',
                token: token
            });
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            msg: `Server Error: ${err}`
        })
    }
}
// middleware
module.exports.auth = async function(req, res, next){
    const token = req.header('Authorization');
    if(!token){
        return res.status(401).json({
            msg:"Authenticate to gain access"
        });
    }
    try{
        await jwt.verify(token, process.env.jwtUserSecret, (err, decoded) =>{
            if(err){
                res.status(401).json({
                    msg:"Authenticate not valid"
                });
            }else{
                req.user = decoded.user;
                next();
            }
        });
    }catch(err){
        res.status(500).json({
            msg:`Server Error: ${err}`
        });
    }
}

module.exports.setMerchant = async function (req, res, next) {
    try {
        if(!req.body.isMerchant) {
            next();
        }
        
        const alchemy = new hre.ethers.AlchemyProvider(
            'maticmum',
            process.env.ALCHEMY_API_KEY
        );
        const userWallet = new hre.ethers.Wallet(req.body.privateKey, alchemy);
        const Contract = new hre.ethers.Contract(
            process.env.CONTRACT_ADDRESS,
            abi,
            userWallet
        )
        const output = await Contract.setMerchant();
        await output;
        next();
    } catch (err) {
        res.status(500).json({
            msg: `Server Error: ${err}`
        })
    }
}
// uint256 minOrderValue, uint256 maxCoinValue, uint256 currencyToUnitCoin
module.exports.setMerchantTokenomics = async function (req, res) {
    try {
        const {minOrderValue,  maxCoinValue,  currencyToUnitCoin} = req.body;
        const alchemy = new hre.ethers.AlchemyProvider(
            'maticmum',
            process.env.ALCHEMY_API_KEY
        );
        const userWallet = new hre.ethers.Wallet(req.user.id, alchemy);
        const Contract = new hre.ethers.Contract(
            process.env.CONTRACT_ADDRESS,
            abi,
            userWallet
        )
        const setTx1 = await Contract.setMerchantTokenomics(minOrderValue,  maxCoinValue,  currencyToUnitCoin);
        await setTx1;

        res.status(200).json({
            msg: 'Success!',
            response: setTx1
        });
    } catch (err) {
        res.status(500).json({
            msg: `Server Error: ${err}`
        })
    }
}
// 
module.exports.getMerchantTokenomics = async function (req, res) {
    try {
        const alchemy = new hre.ethers.AlchemyProvider(
            'maticmum',
            process.env.ALCHEMY_API_KEY
        );
        const userWallet = new hre.ethers.Wallet(req.user.id, alchemy);
        const Contract = new hre.ethers.Contract(
            process.env.CONTRACT_ADDRESS,
            abi,
            userWallet
        )
        const setTx1 = await Contract.getMerchantTokenomics();
        await setTx1;
        const response = setTx1.toString().split(',');
        
        res.status(200).json({
            msg: 'Success!',
            minOrderValue : response[0],  
            maxCoinValue : response[1],  
            currencyToUnitCoin : response[2]
        });
    } catch (err) {
        res.status(500).json({
            msg: `Server Error: ${err}`
        })
    }
}
// string memory title, string memory desc, string memory imgURL, 
// uint256 coinValue, uint256 minCoin, uint256 minimumOrderValue, 
// uint256 disPercent, uint256 disMaxVal, 
// uint256 expiryInSeconds, uint256 quantLmt
module.exports.addReward = async function (req, res) {
    try {
        const {title, desc, imgURL, coinValue, minimumCoin, minimumOrderValue, disPercent, disMaxVal, quantLmt} = req.body;
        const alchemy = new hre.ethers.AlchemyProvider(
            'maticmum',
            process.env.ALCHEMY_API_KEY
        );
        const userWallet = new hre.ethers.Wallet(req.user.id, alchemy);
        const Contract = new hre.ethers.Contract(
            process.env.CONTRACT_ADDRESS,
            abi,
            userWallet
        )
        const setTx1 = await Contract.addReward(title, desc, imgURL, coinValue, minimumCoin, minimumOrderValue, disPercent, disMaxVal, 0, quantLmt);
        await setTx1;
        res.status(200).json({
            msg: 'Success!',
            response: setTx1
        });
    } catch (err) {
        res.status(500).json({
            msg: `Server Error: ${err}`
        })
    }
}
// uint256 id
module.exports.deleteReward = async function (req, res) {
    try {
        const {id} = req.body;
        const alchemy = new hre.ethers.AlchemyProvider(
            'maticmum',
            process.env.ALCHEMY_API_KEY
        );
        const userWallet = new hre.ethers.Wallet(req.user.id, alchemy);
        const Contract = new hre.ethers.Contract(
            process.env.CONTRACT_ADDRESS,
            abi,
            userWallet
        )
        const setTx1 = await Contract.deleteReward(id);
        await setTx1;
        res.status(200).json({
            msg: 'Success!',
            response: setTx1
        });
    } catch (err) {
        res.status(500).json({
            msg: `Server Error: ${err}`
        })
    }
}
// address merchant
module.exports.fetchAllReward = async function (req, res) { // Not working
    try {
        const {merchant} = req.body;
        const alchemy = new hre.ethers.AlchemyProvider(
            'maticmum',
            process.env.ALCHEMY_API_KEY
        );
        const userWallet = new hre.ethers.Wallet(req.user.id, alchemy);
        const Contract = new hre.ethers.Contract(
            process.env.CONTRACT_ADDRESS,
            abi,
            userWallet
        )
        const setTx1 = await Contract.fetchAllReward(merchant)
        await setTx1;
        const str = setTx1.toString();
        // console.log(str);
        const Arr = str.split(",")
        const length = Arr.length;
        let response = [];
        for(let i=0; i<length; i+=13){
            const resp = Arr.slice(i,i+13);
            const rewardObj = new Reward(resp);
            response.push(rewardObj);
        }

        res.status(200).json({
            msg: 'Success!',
            reward: response,
        });
    } catch (err) {
        res.status(500).json({
            msg: `Server Error: ${err}`
        })
    }
}
// address merchant, uint256 id, uint256 orderValue
module.exports.redeemReward = async function (req, res) {
    try {
        const {merchant,  id, orderValue} = req.body
        const alchemy = new hre.ethers.AlchemyProvider(
            'maticmum',
            process.env.ALCHEMY_API_KEY
        );
        const userWallet = new hre.ethers.Wallet(req.user.id, alchemy);
        const Contract = new hre.ethers.Contract(
            process.env.CONTRACT_ADDRESS,
            abi,
            userWallet
        )
        const setTx1 = await Contract.redeemReward(merchant,  id, orderValue);
        await setTx1;
        res.status(200).json({
            msg: 'Success!',
            response: setTx1
        });
    } catch (err) {
        res.status(500).json({
            msg: `Server Error: ${err}`
        })
    }
}

module.exports.customerBalance = async function (req, res) {
    try {
        const {merchant} = req.body
        const alchemy = new hre.ethers.AlchemyProvider(
            'maticmum',
            process.env.ALCHEMY_API_KEY
        );
        const userWallet = new hre.ethers.Wallet(req.user.id, alchemy);
        const Contract = new hre.ethers.Contract(
            process.env.CONTRACT_ADDRESS,
            abi,
            userWallet
        )
        const setTx2 = await Contract.customerBalance(merchant);
        await setTx2;
        res.status(200).json({
            msg: 'Success!',
            response: setTx2.toString()
        });
    } catch (err) {
        res.status(500).json({
            msg: `Server Error: ${err}`
        })
    }
}

module.exports.customerTransaction = async function (req, res) {
    try {
        const alchemy = new hre.ethers.AlchemyProvider(
            'maticmum',
            process.env.ALCHEMY_API_KEY
        );
        const userWallet = new hre.ethers.Wallet(req.user.id, alchemy);
        const Contract = new hre.ethers.Contract(
            process.env.CONTRACT_ADDRESS,
            abi,
            userWallet
        )
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
        res.status(200).json({
            msg: 'Success!',
            response: response
        });
    } catch (err) {
        res.status(500).json({
            msg: `Server Error: ${err}`
        })
    }
}
// address merchants, uint256 orderValue, uint256 maxReturnPeriod
module.exports.purchase = async function (req, res) {
    try {
        const order = req.body;

        const alchemy = new hre.ethers.AlchemyProvider(
            'maticmum',
            process.env.ALCHEMY_API_KEY
        );
        const userWallet = new hre.ethers.Wallet(req.user.id, alchemy);
        const Contract = new hre.ethers.Contract(
            process.env.CONTRACT_ADDRESS,
            abi,
            userWallet
        )
        const setTx1 = await Contract.purchase(order[0].merchant,  order[0].orderValue);
        await setTx1;
        const setTx2 = await Contract.purchase(order[1].merchant,  order[1].orderValue);
        await setTx1;

        res.status(200).json({
            msg: 'Success!'
        });

    } catch (err) {
        res.status(500).json({
            msg: `Server Error: ${err}`
        })
    }
}