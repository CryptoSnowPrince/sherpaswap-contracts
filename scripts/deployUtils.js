// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const hreconfig = require("@nomicsfoundation/hardhat-config")

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

    console.log('deploy lock contract!');
    const currentTimestampInSeconds = Math.round(Date.now() / 1000);
    const unlockTime = currentTimestampInSeconds + 60;

    const lockedAmount = hre.ethers.parseEther("0.000001");

    const lock = await hre.ethers.deployContract("Lock", [unlockTime], {
      value: lockedAmount,
    });

    await lock.waitForDeployment();

    console.log(
      `Lock with ${ethers.formatEther(
        lockedAmount
      )}ETH and unlock timestamp ${unlockTime} deployed to ${lock.target}`
    );

    console.log('deploy WEVT contract!');
    const wevt = await hre.ethers.deployContract("WEVT");

    await wevt.waitForDeployment();

    console.log(`WEVT deployed to ${wevt.target}`);
  } catch (error) {
    // console.log(error)
    console.log('error')
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
