import { ethers } from 'ethers'
import TOKEN_abi from '../abis/Token.json'

export const loadProvider = (dispatch) => {
    const connection = new ethers.providers.Web3Provider(window.ethereum)
    dispatch({ type: 'PROVIDER_LOADED', connection })

    return connection
}

export const loadNetwork = async (provider, dispatch) => {
	const { chainId } = await provider.getNetwork()
	dispatch({ type: 'NETWORK_LOADED', chainID })

	return chainId
}

export const loadAccount = async (dispatch) => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = ethers.utils.getAddress(account[0])

    dispatch({ type: 'ACCOUNT_LOADED', account })

    return account
}

export const loadToken = async (provider, address, dispatch) => {
    const token = new ethers.Contract(address, TOKEN_abi, provider)
    const symbol = await token.symbol()

    dispatch({ type: 'TOKEN_LOADED', token, symbol })

    return account
}

