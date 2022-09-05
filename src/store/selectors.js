import { createSelector } from 'reselect'
import { get, groupBy, reject, maxBy, minBy } from 'lodash';
import moment from 'moment'
import { ethers } from 'ethers';

const GREEN = '#689C46'

const RED = '#F45353'

const account = state => get(state, 'provider.account')
const tokens = state => get(state, 'tokens.contracts')
const events = state => get(state, 'exchange.events')

const allOrders = state => get(state, 'exchange.allOrders.data', [])
const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data', [])
const filledOrders = state => get(state, 'exchange.filledOrders.data', [])

const openOrders = state => {
	const all = allOrders(state)
	const filled = filledOrders(state)
	const cancelled = cancelledOrders(state)

	const openOrders = reject(all, (order) => {
		const orderFilled = filled.some((o) => o.id.toString() === order.id.toString())
		const orderCancelled = cancelled.some((o) => o.id.toString() === order.id.toString())
		return(orderFilled || orderCancelled)
	})

	return openOrders
}

			//----------------------------------------------------------------------------------------------
			// my events

export const myEventsSelector = createSelector(
	account,
	events,
	(account, events) => {
		events = events.filter((e) => e?.args.user === account)
		return events
	}
)


			//----------------------------------------------------------------------------------------------
			// my open orders

export const myOpenOrdersSelector = createSelector(
	account,
	tokens,
	openOrders,
	(account, tokens, orders) => {
		if (!tokens[0] || !tokens[1]) { return }

				// filter orders created by current account
		orders = orders.filter((o) => o.user === account)

				// filter orders by selected tokens
		orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
		orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

				// decorate orders - add display attributes
		orders = decorateMyOpenOrders(orders, tokens)

				// sort orders by date descending
		orders = orders.sort((a, b) => b.timestamp - a.timestamp)

		return orders
	}
)

const decorateMyOpenOrders = (orders, tokens) => {
	return(
		orders.map((order) => {
			order = decorateOrder(order, tokens)
			order = decorateMyOpenOrder(order, tokens)
			return(order)
		})
	)

}

const decorateMyOpenOrder = (order, tokens) => {
	let orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'

	return({
		...order,
		orderType,
		orderTypeClass: (orderType === 'buy' ? GREEN : RED)
	})
	
}

const decorateOrder = (order, tokens) => {
	let token0Amount, token1Amount

			// note: BTX should be considered token0, ETHx is considered token1
			// example: giving ETHx in exchange for BTX
	if (order.tokenGive === tokens[1].address) {
		token0Amount = order.amountGive // the amount of BTX we are giving..
		token1Amount = order.amountGet // the amount of ETHx we want..
	} else {
		token0Amount = order.amountGet // the amount of BTX we want..
		token1Amount = order.amountGive // the amount of ETHx we are giving..
	}
			// calculate token price to 5 decimal places
	const precision = 100000
	let tokenPrice = (token1Amount / token0Amount)
	tokenPrice = Math.round(tokenPrice * precision) / precision
	 
	return ({
		...order,
		token1Amount: ethers.utils.formatUnits(token1Amount, "ether"),
		token0Amount: ethers.utils.formatUnits(token0Amount, "ether"),
		tokenPrice,
		formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ssa d MMM D')
	})
}

		//-------------------------------------------------------
		// all filled orders

export const filledOrdersSelector = createSelector(
	filledOrders,
	tokens,
	(orders, tokens) => {
		if (!tokens[0] || !tokens[1]) { return }

				// filter orders by selected tokens
		orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
		orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

				// sort orders by time ascending for price comparison
		orders = orders.sort((a, b) => a.timestamp - b.timestamp)

				// decorate the orders
		orders = decorateFilledOrders(orders, tokens)

				// sort orders by date descending for display
		orders = orders.sort((a, b) => b.timestamp - a.timestamp)

		return orders
	}
)


const decorateFilledOrders = (orders, tokens) => {
				// track previous order to compare history
	let previousOrder = orders[0]

	return(
		orders.map((order) => {
				// decorate each individual order
			order = decorateOrder(order, tokens)
			order = decorateFilledOrder(order, previousOrder)
			previousOrder = order // update the previous order once it's decorated
			return order
		})
	)
}

const decorateFilledOrder = (order, previousOrder) => {

	return({
		...order,
		tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id, previousOrder)
	})

}

const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
			// show green price if only one order exists
	if (previousOrder.id === orderId) {
		return GREEN
	}
			// show green price if order price higher than previous order
			// show other color price if order price lower than previous order
	if (previousOrder.tokenPrice <= tokenPrice) {
		return GREEN // success
	} else {
		return RED // danger
	}
}

		//----------------------------------------------------------
		// my filled orders 

export const myFilledOrdersSelector = createSelector(
	account,
	tokens,
	filledOrders,
	(account, tokens, orders) => {
		if (!tokens[0] || !tokens[1]) { return }

				// find our orders
		orders = orders.filter((o) => o.user === account || o.creator === account)

				// filter orders for current trading pair
		orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
		orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

				// sort orders by date descending
		orders = orders.sort((a, b) => b.timestamp - a.timestamp)

				// decorate orders - add display attributes
		orders = decorateMyFilledOrders(orders, account, tokens)

		return orders
	}
)

const decorateMyFilledOrders = (orders, account, tokens) => {
	return(
		orders.map((order) => {
			order = decorateOrder(order, tokens)
			order = decorateMyFilledOrder(order, account, tokens)
			return(order)
		})
	)
}

const decorateMyFilledOrder = (order, account, tokens) => {
	const myOrder = order.creator === account

	let orderType
	if(myOrder) {
		orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'
	} else {
		orderType = order.tokenGive === tokens[1].address ? 'sell' : 'buy'	
	}

	return({
		...order,
		orderType,
		orderClass: (orderType === 'buy' ? GREEN : RED),
		orderSign: (orderType === 'buy' ? '+' : '-')
	})
}

		// order book

export const orderBookSelector = createSelector(
	openOrders,
	tokens,
	(orders, tokens) => {
		if (!tokens[0] || !tokens[1]) { return }
				// filter orders by selected tokens
		orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
		orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)
				// decorate orders
		orders = decorateOrderBookOrders(orders, tokens)
				// group orders by "orderType"
		orders = groupBy(orders, 'orderType')
				// fetch buy orders
		const buyOrders = get(orders, 'buy', [])
				// sort buy orders by token price
		orders = {
			...orders,
			buyOrders: buyOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
		}
				// fetch sell orders
		const sellOrders = get(orders, 'sell', [])
				// sort sell orders by token price
		orders = {
			...orders,
			sellOrders: sellOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
		}

		return orders
	}
)

const decorateOrderBookOrders = (orders, tokens) => {
	return(
		orders.map((order) => {
			order = decorateOrder(order, tokens)
			order = decorateOrderBookOrder(order, tokens)
			return(order)
		})
	)
}

const decorateOrderBookOrder = (order, tokens) => {
	const orderType = order.tokenGive === tokens[1].address ? 'buy' : 'sell'

	return ({
		...order,
		orderType,
		orderTypeClass: (orderType === 'buy' ? GREEN : RED),
		orderFillAction: (orderType === 'buy' ? 'sell' : 'buy')
	})
}

			// price chart

export const priceChartSelector = createSelector(
	filledOrders,
	tokens,
	(orders, tokens) => {
		if (!tokens[0] || !tokens[1]) { return }

			// filter orders by selected tokens
		orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
		orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)
		
			// sort orders by date ascending to compare history
		orders = orders.sort((a, b) => a.timestamp - b.timestamp)

			// decorate orders - add display attributes
		orders = orders.map((o) => decorateOrder(o, tokens))

			// get last 2 orders for final price & price change
		let secondLastOrder, lastOrder
		[secondLastOrder, lastOrder] = orders.slice(orders.length - 2, orders.length)
			// get last order price
		const lastPrice = get(lastOrder, 'tokenPrice', 0)
			// get second last order price
		const secondLastPrice = get(secondLastOrder, 'tokenPrice', 0)

		return({
			lastPrice,
			lastPriceChange: (lastPrice >= secondLastPrice ? '+' : '-'),
			series:[{
				data: buildGraphData(orders)
			}]
		})
	}
)

const buildGraphData = (orders) => {
			// group the orders by hour for the graph
	orders = groupBy(orders, (o) => moment.unix(o.timestamp).startOf('hour').format())

			// fetch all orders from current hour
	const hours = Object.keys(orders)

			// build the graph series
	const graphData = hours.map((hour) => {
			// fetch all orders from current hour
		const group = orders[hour]
			// calculate price values: open, high, low, close
		const open = group[0] // first order
		const high = maxBy(group, 'tokenPrice') // higher price
		const low = minBy(group, 'tokenPrice') //lower price
		const close = group[group.length - 1] // last order

		return({
			x: new Date(hour),
			y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice]
		})
	})

	return graphData
}
