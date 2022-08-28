import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ethers } from 'ethers';
import config from '../config.json';
import TOKEN_abi from '../abis/Token.json';

import { loadProvider,
  loadNetwork,
  loadAccount,
  loadToken
} from '../store/interactions';

function App() {
  const dispatch = useDispatch()

  const loadBlockchainData = async () => { 
    const account = await loadAccount(dispatch)
   
    const provider = loadProvider(dispatch)
    const chainId = await loadNetwork(provider, dispatch)

    await loadToken(provider, config[chainId].Btx.address, dispatch)
  }

 useEffect(() => {
  loadBlockchainData()
 })

  return (
    <div>

      {/* Navbar */}

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;
