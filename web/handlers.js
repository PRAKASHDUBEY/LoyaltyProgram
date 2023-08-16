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
            msg: `Server Error`
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

module.exports.setMerchant = async function (req, res, next) {
    try {
        if (!req.body.isMerchant) {
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
            msg: "Server Error"
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
            msg: "Server Error"
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
            token: setTx1
        });
    } catch (err) {
        res.status(500).json({
            msg: "Server Error"
        })
    }
}
// uint256 minOrderValue, uint256 maxCoinValue, uint256 currencyToUnitCoin
module.exports.setOwnerTokenomics = async function (req, res) {
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
        const setTx1 = await Contract.setOwnerTokenomics(minOrderValue,  maxCoinValue,  currencyToUnitCoin);
        await setTx1;
        res.status(200).json({
            msg: 'Success!',
            token: setTx1
        });
    } catch (err) {
        res.status(500).json({
            msg: "Server Error"
        })
    }
}
// 
module.exports.getOwnerTokenomics = async function (req, res) {
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
        const setTx1 = await Contract.getOwnerTokenomics();
        await setTx1;
        res.status(200).json({
            msg: 'Success!',
            token: setTx1
        });
    } catch (err) {
        res.status(500).json({
            msg: "Server Error"
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
            msg: "Server Error"
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
            token: setTx1
        });
    } catch (err) {
        res.status(500).json({
            msg: "Server Error"
        })
    }
}
// string memory name, uint256 coinValue,uint256 minimumCoin, uint256 discountValue
module.exports.addReward = async function (req, res) {
    try {
        const {name,  coinValue, minimumCoin,  discountValue} = req.body;
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
        const setTx1 = await Contract.addReward(name,  coinValue, minimumCoin,  discountValue);
        await setTx1;
        res.status(200).json({
            msg: 'Success!',
            token: setTx1
        });
    } catch (err) {
        res.status(500).json({
            msg: "Server Error"
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
            msg: "Server Error"
        })
    }
}
// address merchant
module.exports.fetchAllReward = async function (req, res) {
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
        const setTx1 = await Contract.fetchAllReward(merchant);
        await setTx1;
        res.status(200).json({
            msg: 'Success!',
            token: setTx1
        });
    } catch (err) {
        res.status(500).json({
            msg: "Server Error"
        })
    }
}
// address merchant
module.exports.fetchRedeemableReward = async function (req, res) {
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
        const setTx1 = await Contract.fetchRedeemableReward(merchant);
        await setTx1;
        res.status(200).json({
            msg: 'Success!',
            token: setTx1
        });
    } catch (err) {
        res.status(500).json({
            msg: "Server Error"
        })
    }
}
// address merchant, uint256 id
module.exports.redeemReward = async function (req, res) {
    try {
        const {merchant,  id} = req.body
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
        const setTx1 = await Contract.redeemReward(merchant,  id);
        await setTx1;
        res.status(200).json({
            msg: 'Success!',
            token: setTx1
        });
    } catch (err) {
        res.status(500).json({
            msg: "Server Error"
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
        const setTx1 = await Contract.customerBalance();
        await setTx1;
        res.status(200).json({
            msg: 'Success!',
            token: setTx1
        });
    } catch (err) {
        res.status(500).json({
            msg: "Server Error"
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
            msg: "Server Error"
        })
    }
}
// address [] calldata merchants, uint256 [] calldata merchantValue, uint256 orderValue, uint256 maxReturnPeriod
module.exports.purchase = async function (req, res) {
    try {
        const {merchants,   merchantValue,  orderValue,  maxReturnPeriod} = req.body;
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
        const setTx1 = await Contract.purchase(merchants,   merchantValue,  orderValue,  maxReturnPeriod);
        await setTx1;
        res.status(200).json({
            msg: 'Success!',
            token: setTx1
        });
    } catch (err) {
        res.status(500).json({
            msg: "Server Error"
        })
    }
}
