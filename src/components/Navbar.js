import { useSelector, useDispatch } from 'react-redux'
import Blockies from 'react-blockies'

import logo from '../assets/logo.png'
import logo01 from '../assets/logo01.png'
import eth from '../assets/eth.svg'

import { loadAccount } from '../store/interactions'
import config from '../config.json';

const Navbar = () => {
  const provider = useSelector(state => state.provider.connection)
  const chainId = useSelector(state => state.provider.chainId)
  const account = useSelector(state => state.provider.account)
  const balance = useSelector(state => state.provider.balance)

  const dispatch = useDispatch()

  const connectHandler = async () => {
    await loadAccount(provider, dispatch)
  }

  const networkHandler = async (e) => {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: e.target.value }]
    })
  }

  return(
    <div className='exchange__header grid'>
      <div className='exchange__header--brand flex'>
      	<img style={{ width: 60, height: 60 }} src={logo} className="logo" alt="BTX logo"></img>
        <img style={{ width: 75, height: 55 }} src={logo01} className="logo" alt="BTX logo"></img>
      	<h1>Token Exchainge</h1>
      </div>

      <div className='exchange__header--networks flex'>
        <img src={eth} alt="ETH logo" className='Eth logo' />

        {chainId && (
          <select name="networks" id="networks" value={config[chainId] ? `0x${chainId.toString(16)}` : `0`} onChange={networkHandler}>
            <option value="0" disabled>Select Network</option>
            <option value="0x7A69">Localhost</option>
            <option value="0x2a">Kovan</option>
            <option value="0x5">Goerli</option>
          </select>
        )}

      </div>

      <div className='exchange__header--account flex'>
        {balance ? (
          <p><small>My Balance</small>{Number(balance).toFixed(5)}</p>
        ) : (
          <p><small>My Balance</small>Φ ETH</p>
        )}
        {account ? (
          <a
            href={config[chainId] ? `${config[chainId].explorerURL}/address/${account}` : `#`}
            target='_blank'
            rel='noreferrer'
          >
            {account.slice(0,8) + '...' + account.slice(37,42)}
            <Blockies
              seed={account}
              size={8}
              scale={3}
              color="#689C46"
              bgColor="#EBC119"
              spotColor="#0D121D"
              className="identicon"
            />
          </a>
        ) : (
          <button className="button" onClick={connectHandler}>Connect</button>
        )}
      </div>
    </div>
  )
}

export default Navbar;
