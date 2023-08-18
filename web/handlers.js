const jwt = require("jsonwebtoken");
const hre = require("hardhat");
const ContractJson = require("../artifacts/contracts/LoyaltyProgram.sol/LoyaltyProgram.json");
const abi = ContractJson.abi;

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
// string memory name
module.exports.setMerchant = async function (req, res, next) {
    try {
        if (!req.body.isMerchant) {
            next();
        }
        const {name} = req.body;
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
        const output = await Contract.setMerchant(name);
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
            token: setTx1
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
        res.status(200).json({
            msg: 'Success!',
            token: setTx1.toString()
        });
    } catch (err) {
        res.status(500).json({
            msg: `Server Error: ${err}`
        })
    }
}
// uint256 _decayDays
module.exports.setDecayDays = async function (req, res) {
    try {
        const {_decayDays} = req.body;
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
        const setTx1 = await Contract.setDecayDays(_decayDays);
        await setTx1;
        res.status(200).json({
            msg: 'Success!',
            token: setTx1
        });
    } catch (err) {
        res.status(500).json({
            msg: `Server Error: ${err}`
        })
    }
}

module.exports.getDecayDays = async function (req, res) {
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
        const setTx1 = await Contract.getDecayDays();
        await setTx1;
        res.status(200).json({
            msg: 'Success!',
            token: setTx1.toString()
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
        const {title, desc, imgURL, coinValue, minimumCoin, minimumOrderValue, disPercent, disMaxVal, expiryInSeconds, quantLmt} = req.body;
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
        const setTx1 = await Contract.addReward(title, desc, imgURL, coinValue, minimumCoin, minimumOrderValue, disPercent, disMaxVal, expiryInSeconds, quantLmt);
        await setTx1;
        res.status(200).json({
            msg: 'Success!',
            token: setTx1
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
            token: setTx1
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
        const setTx = await Contract.expireReward();
        await setTx;
        const setTx1 = await Contract.fetchAllReward(merchant)
        await setTx1.toString()
        res.status(200).json({
            msg: 'Success!',
            token: setTx1
        });
    } catch (err) {
        res.status(500).json({
            msg: `Server Error: ${err}`
        })
    }
}
// address merchant, uint256 orderValue
module.exports.fetchRedeemableReward = async function (req, res) {
    try {
        const {merchant, orderValue} = req.body;
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
        const setTx1 = await Contract.fetchRedeemableReward(merchant, orderValue);
        await setTx1;
        res.status(200).json({
            msg: 'Success!',
            token: setTx1
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
            token: setTx1
        });
    } catch (err) {
        res.status(500).json({
            msg: `Server Error: ${err}`
        })
    }
}

module.exports.customerBalance = async function (req, res) {
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
        const setTx1 = await Contract.updateBalance();
        await setTx1;
        const setTx2 = await Contract.customerBalance();
        await setTx2;
        res.status(200).json({
            msg: 'Success!',
            token: setTx2
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
        res.status(200).json({
            msg: 'Success!',
            token: setTx1
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
        const {merchant,  orderValue,  maxReturnPeriod} = req.body;
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
        const setTx1 = await Contract.purchase(merchant,  orderValue,  maxReturnPeriod);
        await setTx1;
        res.status(200).json({
            msg: 'Success!',
            token: setTx1
        });
    } catch (err) {
        res.status(500).json({
            msg: `Server Error: ${err}`
        })
    }
}

// uint256 id
module.exports.getOrders = async function (req, res) {
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
        const setTx1 = await Contract.getOrders(id);
        await setTx1;
        res.status(200).json({
            msg: 'Success!',
            token: setTx1
        });
    } catch (err) {
        res.status(500).json({
            msg: `Server Error: ${err}`
        })
    }
}

// uint256 id
module.exports.cancelOrder = async function (req, res) {
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
        const setTx1 = await Contract.cancelOrder(id);
        await setTx1;
        res.status(200).json({
            msg: 'Success!',
            token: setTx1
        });
    } catch (err) {
        res.status(500).json({
            msg: `Server Error: ${err}`
        })
    }
}