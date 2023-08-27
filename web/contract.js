const hre = require("hardhat");
const ContractJson = require("../artifacts/contracts/LoyaltyProgram.sol/LoyaltyProgram.json");
const abi = ContractJson.abi;

module.exports = async function (key){
    const alchemy = new hre.ethers.AlchemyProvider(
        'maticmum',
        process.env.ALCHEMY_API_KEY
    );
    const userWallet = new hre.ethers.Wallet(key, alchemy);
    const Contract = new hre.ethers.Contract(
        process.env.CONTRACT_ADDRESS,
        abi,
        userWallet
    )
    return Contract;
}