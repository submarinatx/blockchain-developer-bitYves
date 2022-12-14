import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import config from '../config.json';

import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
  loadExchange,
  loadAllOrders,
  subscribeToEvents
} from '../store/interactions';

import Navbar from './Navbar'
import Markets from './Markets'
import Balance from './Balance'
import Order from './Order'
import PriceChart from './PriceChart'
import Transactions from './Transactions'
import Trades from './Trades'
import OrderBook from './OrderBook'
import Alert from './Alert'

function App() {
  const dispatch = useDispatch()

  const loadBlockchainData = async () => { 
       // connect ethers to blockchain
    const provider = loadProvider(dispatch)

       // fetch current network's chainId (eg. Hardhat: 31337, kova:42, goerli:5)    
    const chainId = await loadNetwork(provider, dispatch)

        // reload page when network changes
    window.ethereum.on('chainChanged', () => {
      window.location.reload()
    })

        // fetch current account & balance from Metamask when changed
    window.ethereum.on('accountsChanged', () => {
      loadAccount(provider, dispatch)
    })

        // load token smart contracts
    const Btx = config[chainId].Btx
    const ETHx = config[chainId].ETHx
    await loadTokens(provider, [Btx.address, ETHx.address], dispatch)
     
       // load exchange smart contract
    const exchangeConfig = config[chainId].exchange
    const exchange = await loadExchange(provider, exchangeConfig.address, dispatch)

      // fetch all orders: open, filled, cancelled
    loadAllOrders(provider, exchange, dispatch)

      // Listen to events
    subscribeToEvents(exchange, dispatch)
  }

  useEffect(() => {
    loadBlockchainData()
  })

  return (
    <div>

      <Navbar />

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          <Markets />

          <Balance />

          <Order />

        </section>
        <section className='exchange__section--right grid'>

          <PriceChart />

          <Transactions />

          <Trades />

          <OrderBook />

        </section>
      </main>

      <Alert />

    </div>
  );
}

export default App;
