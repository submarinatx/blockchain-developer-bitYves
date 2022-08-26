async function main() {
  console.log(`Preparing deployment...\n`)
  // Fecth contract to deplot
  const Token = await ethers.getContractFactory('Token');
  const Exchange = await ethers.getContractFactory('Exchange');

  const accounts = await ethers.getSigners()

  console.log(`Accounts fetched:\n${accounts[0].address}\n${accounts[1].address}\n`)

  // Deploy contract
  const btx = await Token.deploy('bitYves', 'BTX', '1000000')
  await btx.deployed()
  console.log(`BTX Deployed to: ${btx.address}`)

  const ETHx = await Token.deploy('ETHx', 'ETHx', '1000000')
  await ETHx.deployed()
  console.log(`ETHx Deployed to: ${ETHx.address}`)

  const DAIx = await Token.deploy('DAIx', 'DAIx', '1000000')
  await DAIx.deployed()
  console.log(`DAIx Deployed to: ${DAIx.address}`)

  const exchange = await Exchange.deploy(accounts[1].address, 10) // fees
  await exchange.deployed()
  console.log(`Exchange Deployed to: ${exchange.address}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
