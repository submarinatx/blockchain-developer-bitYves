const config = require('../src/config.json')

const tokens = (n) => {
	return ethers.utils.parseUnits(n.toString(), 'ether')
}

const wait = (seconds) => {
	const milliseconds = seconds * 1000
	return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function main() {
	// fetch accounts from wallet (unlocked)
	const accounts = await ethers.getSigners()
	// fetch network
	const { chainId } = await ethers.provider.getNetwork()
	console.log('Using chainId:', chainId)
	// fetch deployed tokens
	const Btx = await ethers.getContractAt('Token', config[chainId].Btx.address)
	console.log(`BTX Token fetched: ${Btx.address}\n`)

	const ETHx = await ethers.getContractAt('Token', config[chainId].ETHx.address)
	console.log(`ETHx Token fetched: ${ETHx.address}\n`)

	const DAIx = await ethers.getContractAt('Token', config[chainId].DAIx.address)
	console.log(`DAIx Token fetched: ${DAIx.address}\n`)
	// Fetch the deployed exchange
	const exchange = await ethers.getContractAt('Exchange', config[chainId].exchange.address)
	console.log(`Exchange Token fetched: ${exchange.address}\n`)
	// Firs account gives tokens to second accound
	const sender = accounts[0]
	const receiver = accounts[1]
	let amount = tokens(10000)
	// user1 transfers 10,000ETHx
	let transaction, result
	transaction = await ETHx.connect(sender).transfer(receiver.address, amount)
	console.log(`Transferred ${amount} tokens from ${sender.address} to ${receiver.address}\n`)
	// setup exchange users
	const user1 = accounts[0]
	const user2 = accounts[1]
	amount = tokens(10000)
	// user1 approves 10,000 Btx
	transaction = await Btx.connect(user1).approve(exchange.address, amount)
	await transaction.wait()
	console.log(`Approved ${amount} tokens from ${user1.address}`)
	// user1 deposits 10,000 Btx
	transaction = await exchange.connect(user1).depositToken(Btx.address, amount)
	await transaction.wait()
	console.log(`Deposited ${amount} Etherx to ${user1.address}\n`)
	// user2 approves ETHx
	transaction = await ETHx.connect(user2).approve(exchange.address, amount)
	await transaction.wait()
	console.log(`Approved ${amount} Etherx from ${user2.address}`)
	// user2 deposits ETHx
	transaction = await exchange.connect(user2).depositToken(ETHx.address, amount)
	await transaction.wait()
	console.log(`Deposited ${amount} Etherx to ${user2.address}\n`)

	////////////////////////////////////////////////////////////
	// Seed a Cancelled Order
	//
	// user1 makes order to get tokens
	let orderId
	transaction = await exchange.connect(user1).makeOrder(ETHx.address, tokens(100), Btx.address, tokens(5))
	result = await transaction.wait()
	console.log(`Made order from ${user1.address}`)
	// user1 cancels order
	orderId = result.events[0].args.id
	transaction = await exchange.connect(user1).cancelOrder(orderId)
	result = await transaction.wait()
	console.log(`Cancelled order from ${user1.address}\n`)
	// wait 1 sec..
	await wait(1)

	//////////////////////////////////////////////////////////////7
	// Seed Filled Orders
	//
	// user1 makes order
	transaction = await exchange.connect(user1).makeOrder(ETHx.address, tokens(100), Btx.address, tokens(10))
	result = await transaction.wait()
	console.log(`Made order from ${user1.address}`)
	// user2 fills order
	orderId = result.events[0].args.id
	transaction = await exchange.connect(user2).fillOrder(orderId)
	result = await transaction.wait()
	console.log(`Filled order from ${user2.address}\n`)
	// wait 1 sec..
	await wait(1)
	// user1 makes another order
	transaction = await exchange.makeOrder(ETHx.address, tokens(50), Btx.address, tokens(15))
	result = await transaction.wait()
	console.log(`Another order from ${user1.address}`)
	// user2 fills another order
	orderId = result.events[0].args.id
	transaction = await exchange.connect(user2).fillOrder(orderId)
	result = await transaction.wait()
	console.log(`Another filled order from ${user2.address}\n`)
	// wait 1 sec..
	await wait(1)
	// user1 makes final order
	transaction = await exchange.connect(user1).makeOrder(ETHx.address, tokens(200), Btx.address, tokens(20))
	result = await transaction.wait()
	console.log(`Final order from ${user1.address}`)
	// user2 fills final order
	orderId = result.events[0].args.id
	transaction = await exchange.connect(user2).fillOrder(orderId)
	result = await transaction.wait()
	console.log(`Filled order from ${user1.address}\n`)
	// wait 1 sec..
	await wait(1)

	///////////////////////////////////////////////////////////////////////////////////
	// Seed Open Orders
	//
	// user1 makes 10 orders
	for(let i = 1; i <= 10; i++) {

		transaction = await exchange.connect(user1).makeOrder(ETHx.address, tokens(10 * i), Btx.address, tokens(10))
		result = await transaction.wait()
		console.log(`Made order from ${user1.address}`)

		await wait(1)
	}
	// user2 makes 10
	for(let i = 1; i <= 10; i ++) {
		transaction = await exchange.connect(user2).makeOrder(Btx.address, tokens(10), ETHx.address, tokens(10 * i))
		result = await transaction.wait()
		console.log(`Made order from ${user2.address}`)
|// wait 1 sec..
		await wait(1)
	}
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
