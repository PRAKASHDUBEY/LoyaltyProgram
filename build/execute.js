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

    const setTx1 = await Token.customerBalance("0xc0463F10454A6c6C88936FAc221e138e55a70530");
    await setTx1;
    console.log("Output: " + setTx1);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
// npx hardhat run build/execute.js