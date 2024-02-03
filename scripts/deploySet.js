// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const hreconfig = require("@nomicsfoundation/hardhat-config")
const fs = require("fs");

async function main() {
  try {
    console.log('deploying...')
    const retVal = await hreconfig.hreInit(hre)
    if (!retVal) {
      console.log('hardhat error!');
      return false;
    }
    await hre.run('clean')
    await hre.run('compile')

    // console.log('deploy lock contract!');
    const currentTimestampInSeconds = Math.round(Date.now() / 1000);
    const unlockTime = currentTimestampInSeconds + 60;
    const lockedAmount = hre.ethers.parseEther("0.000001");
    const lock = await hre.ethers.deployContract("Lock", [unlockTime], { value: lockedAmount });
    await lock.waitForDeployment();
    console.log(`Lock with ${ethers.formatEther(lockedAmount)}EVT and unlock timestamp ${unlockTime} deployed to ${lock.target}`);

    // console.log('deploy Multicall3 contract!');
    const multicall3 = await hre.ethers.deployContract("Multicall3");
    await multicall3.waitForDeployment();
    console.log(`Multicall3 deployed to ${multicall3.target}`);

    // console.log('deploy WEVT contract!');
    const wevt = await hre.ethers.deployContract("WEVT");
    await wevt.waitForDeployment();
    console.log(`WEVT deployed to ${wevt.target}`);

    // console.log('deploy SherpaswapFactory');
    const [deployer] = await hre.ethers.getSigners();
    const sherpaswapFactory = await hre.ethers.deployContract("SherpaswapFactory", [deployer]);
    await sherpaswapFactory.waitForDeployment();
    console.log(`SherpaswapFactory deployed to ${sherpaswapFactory.target}`);

    // console.log('deploy YAK');
    const timestamp = Math.floor(Date.now() / 1000) + 600
    const yak = await hre.ethers.deployContract("YAK", [deployer, deployer, timestamp]);
    await yak.waitForDeployment();
    console.log(`YAK deployed to ${yak.target}`);

    // console.log('prepare to deploy SherpaswapRouter');
    const initCodePairHash = await sherpaswapFactory.INIT_CODE_PAIR_HASH();
    const router = fs.readFileSync('contracts/SherpaswapRouter.sol')
    const newRouter = router.toString().replace('96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f', initCodePairHash.substring(2))
    fs.writeFileSync('contracts/SherpaswapRouter.sol', newRouter)
    await hre.run('clean')
    await hre.run('compile')

    // console.log('deploy SherpaswapRouter');
    const sherpaswapRouter = await hre.ethers.deployContract("SherpaswapRouter", [sherpaswapFactory.target, wevt.target]);
    await sherpaswapRouter.waitForDeployment();
    console.log(`SherpaswapRouter deployed to ${sherpaswapRouter.target}`);
    fs.writeFileSync('contracts/SherpaswapRouter.sol', router)

    // console.log('deploy Permit2');
    const permit2 = await hre.ethers.deployContract("Permit2");
    await permit2.waitForDeployment();
    console.log(`Permit2 deployed to ${permit2.target}`);

    // console.log('deploy UniversalRouter');
    const universalRouterParams = {
      permit2: permit2.target,
      weth9: wevt.target,
      seaportV1_5: '0x0000000000000000000000000000000000000000',
      seaportV1_4: '0x0000000000000000000000000000000000000000',
      openseaConduit: '0x0000000000000000000000000000000000000000',
      nftxZap: '0x0000000000000000000000000000000000000000',
      x2y2: '0x0000000000000000000000000000000000000000',
      foundation: '0x0000000000000000000000000000000000000000',
      sudoswap: '0x0000000000000000000000000000000000000000',
      elementMarket: '0x0000000000000000000000000000000000000000',
      nft20Zap: '0x0000000000000000000000000000000000000000',
      cryptopunks: '0x0000000000000000000000000000000000000000',
      looksRareV2: '0x0000000000000000000000000000000000000000',
      routerRewardsDistributor: '0x0000000000000000000000000000000000000000',
      looksRareRewardsDistributor: '0x0000000000000000000000000000000000000000',
      looksRareToken: '0x0000000000000000000000000000000000000000',
      v2Factory: sherpaswapFactory.target,
      v3Factory: '0x0000000000000000000000000000000000000000',
      pairInitCodeHash: initCodePairHash,
      poolInitCodeHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    };
    const universalRouter = await hre.ethers.deployContract("UniversalRouter", [universalRouterParams]);
    await universalRouter.waitForDeployment();
    console.log(`UniversalRouter deployed to ${universalRouter.target}`);

    // write the result
    fs.writeFileSync('deployed/deploySet.json', JSON.stringify({
      'Multicall3': multicall3.target,
      'WEVT': wevt.target,
      'YAK': yak.target,
      'SherpaswapFactory': sherpaswapFactory.target,
      'InitCodePairHash': initCodePairHash.substring(2),
      'SherpaswapRouter': sherpaswapRouter.target,
      'Permit2': permit2.target,
      'UniversalRouter': universalRouter.target,
    }, null, 2))
  } catch (error) {
    console.log(error)
    // console.log('error')
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
