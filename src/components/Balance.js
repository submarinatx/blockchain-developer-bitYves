import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import bityves from '../assets/bityves.svg';
import eth from '../assets/eth.svg';

import {
  loadBalances,
  transferTokens
} from '../store/interactions';

const Balance = () => {
  const [isDeposit, setIsDeposit] = useState(true)
  const [token01TransferAmount, setToken01TransferAmount] = useState(0)
  const [token02TransferAmount, setToken02TransferAmount] = useState(0)

  const dispatch = useDispatch()

  const provider = useSelector(state => state.provider.connection)
  const account = useSelector(state => state.provider.account)

  const exchange = useSelector(state => state.exchange.contract)
  const exchangeBalances = useSelector(state => state.exchange.balances)
  const transferInProgress = useSelector(state => state.exchange.transferInProgress)
 
  const tokens = useSelector(state => state.tokens.contracts)
  const symbols = useSelector(state => state.tokens.symbols)
  const tokenBalances = useSelector(state => state.tokens.balances)

  const depositRef = useRef(null)
  const withdrawRef = useRef(null)

  const tabHandler = (e) => {
    if(e.target.className !== depositRef.current.className) {
      e.target.className = 'tab tab--active'
      depositRef.current.className = 'tab'
      setIsDeposit(false)
    } else {
      e.target.className = 'tab tab--active'
      withdrawRef.current.className = 'tab'
      setIsDeposit(true)
    }
  }
 
  const amountHandler = (e, token) => {
    if (token.address === tokens[0].address) {
      setToken01TransferAmount(e.target.value)
    } else {
      setToken02TransferAmount(e.target.value)
    }
  }

  const depositHandler = (e, token) => {
    e.preventDefault()

    if (token.address === tokens[0].address) {
      transferTokens(provider, exchange, 'Deposit', token, token01TransferAmount, dispatch)
      setToken01TransferAmount(0)
    } else {
      transferTokens(provider, exchange, 'Deposit', token, token02TransferAmount, dispatch)
      setToken02TransferAmount(0)
    }
  }

    const withdrawHandler = (e, token) => {
    e.preventDefault()

    if (token.address === tokens[0].address) {
      transferTokens(provider, exchange, 'Withdraw', token, token01TransferAmount, dispatch)
      setToken01TransferAmount(0)
    } else {
      transferTokens(provider, exchange, 'Withdraw', token, token02TransferAmount, dispatch)
      setToken02TransferAmount(0)
    }
    console.log("Withdrawing Tokens..")
  }

  useEffect(() => {
    if(exchange && tokens[0] && tokens[1] && account) {
      loadBalances(exchange, tokens, account, dispatch)
    }
  }, [exchange, tokens, account, transferInProgress])

  return (
    <div className='component exchange__transfers'>
      <div className='component__header flex-between'>
        <h2>Balance</h2>
        <div className='tabs'>
          <button onClick={tabHandler} ref={depositRef} className='tab tab--active'>Deposit</button>
          <button onClick={tabHandler} ref={withdrawRef} className='tab'>Withdraw</button>
        </div>
      </div>

      {/* Deposit/Withdraw Component 1 (Btx) */}

      <div className='exchange__transfers--form'>
        <div className='flex-between'>
          <p><small>Token</small><br /><img src={bityves} alt="Token logo" />{symbols && symbols[0]}</p>
          <p><small>Wallet</small><br />{tokenBalances && tokenBalances[0]}</p>
          <p><small>Exchange</small><br />{exchangeBalances && exchangeBalances[0]}</p>
        </div>

        <form onSubmit={isDeposit ? (e) => depositHandler(e, tokens[0]) : (e) => withdrawHandler(e, tokens[0])}>
          <label htmlFor="token0">{symbols && symbols[0]} Amount</label>
          <input
            type="text"
            id='token0'
            placeholder='0.0000'
            value={token01TransferAmount === 0 ? '' : token01TransferAmount}
            onChange={(e) => amountHandler(e, tokens[0])}/>

          <button className='button' type='submit'>
            {isDeposit ? (
                <span>Deposit</span>
            ) : (
                <span>Withdraw</span>
            )}
          </button>
        </form>
      </div>

      <hr />

      {/* Deposit/Withdraw Component 2 (ETHx) */}

      <div className='exchange__transfers--form'>
        <div className='flex-between'>
          <p><small>Token</small><br /><img src={eth} alt="Token logo" />{symbols && symbols[1]}</p>
          <p><small>Wallet</small><br />{tokenBalances && tokenBalances[1]}</p>
          <p><small>Exchange</small><br />{exchangeBalances && exchangeBalances[1]}</p>
        </div>

        <form onSubmit={isDeposit ? (e) => depositHandler(e, tokens[1]) : (e) => withdrawHandler(e, tokens[1])}>
          <label htmlFor="token1"></label>
          <input
            type="text"
            id='token1'
            placeholder='0.0000'
            value={token02TransferAmount === 0 ? '' : token02TransferAmount}
            onChange={(e) => amountHandler(e, tokens[1])}/>

          <button className='button' type='submit'>
            {isDeposit ? (
                <span>Deposit</span>
            ) : (
                <span>Withdraw</span>
            )}
          </button>
        </form>
      </div>

      <hr />
    </div>
  );
}

export default Balance;
