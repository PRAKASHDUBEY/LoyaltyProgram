const hre = require("hardhat");
const ContractJson = require("../artifacts/contracts/LoyaltyProgram.sol/LoyaltyProgram.json");

const abi = ContractJson.abi;

async function main(){
    const alchemy = new hre.ethers.AlchemyProvider(
        'maticmum',
        process.env.ALCHEMY_API_KEY
    );

    const userWallet = new hre.ethers.Wallet(process.env.PRIVATE_KEY2, alchemy);

    const Token = new hre.ethers.Contract(
        process.env.CONTRACT_ADDRESS,
        abi,
        userWallet
    )

    const setTx1 = await Token.customerBalance();
    await setTx1;
    console.log("Output: " + setTx1);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});


    // var ethers = require('ethers');  
    // var crypto = require('crypto');

    // var id = crypto.randomBytes(32).toString('hex');
    // var privateKey = "0x"+id;
    // console.log("SAVE BUT DO NOT SHARE THIS:", privateKey);

    // var wallet = new hre.ethers.Wallet(privateKey,alchemy);
    // 
    // const setTx2 = await Greeter.setGreeting("web3 is awesome!");
    // await setTx2.wait();
    // console.log("after: " + await Greeter.greet());