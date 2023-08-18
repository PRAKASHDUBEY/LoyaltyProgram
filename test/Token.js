// const { expect } = require("chai");
// const hre = require("hardhat");

// describe("Token contract", function() {
  
//   let Token;
//   let oceanToken;
//   let owner;
//   let addr1;
//   let addr2;
//   let tokenCap = 100000000;
//   let tokenBlockReward = 50;

//   beforeEach(async function () {
    
//     Token = await ethers.getContractFactory("Token");
//     [owner, addr1, addr2] = await hre.ethers.getSigners();

//     oceanToken = await Token.deploy("token_name", "token_symbol", 18, 1000);
//   });

//   describe("Deployment", function () {
//     it("Should set the right owner", async function () {
//       expect(await oceanToken.owner()).to.equal(owner.address);
//     });

//     it("Should assign the total supply of tokens to the owner", async function () {
//       const ownerBalance = await oceanToken.balanceOf(owner.address);
//       expect(await oceanToken.totalSupply()).to.equal(ownerBalance);
//     });

//     it("Should set the max capped supply to the argument provided during deployment", async function () {
//       const cap = await oceanToken.cap();
//       expect(Number(hre.ethers.utils.formatEther(cap))).to.equal(tokenCap);
//     });

//     it("Should set the blockReward to the argument provided during deployment", async function () {
//       const blockReward = await oceanToken.blockReward();
//       expect(Number(hre.ethers.utils.formatEther(blockReward))).to.equal(tokenBlockReward);
//     });
//   });

//   describe("Transactions", function () {
//     it("Should transfer tokens between accounts", async function () {
      
//       await oceanToken.transfer(addr1.address, 50);
//       const addr1Balance = await oceanToken.balanceOf(addr1.address);
//       expect(addr1Balance).to.equal(50);

     
//       await oceanToken.connect(addr1).transfer(addr2.address, 50);
//       const addr2Balance = await oceanToken.balanceOf(addr2.address);
//       expect(addr2Balance).to.equal(50);
//     });

//     it("Should fail if sender doesn't have enough tokens", async function () {
//       const initialOwnerBalance = await oceanToken.balanceOf(owner.address);
      
//       await expect(
//         oceanToken.connect(addr1).transfer(owner.address, 1)
//       ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      
//       expect(await oceanToken.balanceOf(owner.address)).to.equal(
//         initialOwnerBalance
//       );
//     });

//     it("Should update balances after transfers", async function () {
//       const initialOwnerBalance = await oceanToken.balanceOf(owner.address);

//       await oceanToken.transfer(addr1.address, 100);

//       await oceanToken.transfer(addr2.address, 50);


//       const finalOwnerBalance = await oceanToken.balanceOf(owner.address);
//       expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(150));

//       const addr1Balance = await oceanToken.balanceOf(addr1.address);
//       expect(addr1Balance).to.equal(100);

//       const addr2Balance = await oceanToken.balanceOf(addr2.address);
//       expect(addr2Balance).to.equal(50);
//     });
//   });
  
// });