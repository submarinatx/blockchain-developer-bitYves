import { useRef, useEffect } from 'react'
import { useSelector } from 'react-redux';
import { myEventsSelector } from '../store/selectors';
import config from '../config.json';
import logo from '../assets/logo.png'

const Alert = () => {

  const alertRef = useRef(null)

  const network = useSelector(state => state.provider.network)
  const account = useSelector(state => state.provider.account)
  const isPending = useSelector(state => state.exchange.transaction.isPending)
  const isError = useSelector(state => state.exchange.transaction.isError)
  const events = useSelector(myEventsSelector)
 
  const removeHandler = async (e) => {
    alertRef.current.className = 'alert--remove'
  }

  useEffect(() => {
    if((events[0] || isPending || isError) && account) {
      alertRef.current.className = 'alert'
    }
  }, [events, isPending, isError, account])

  return (
    <div>
        {isPending ? (

          <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>
            <h3>Transaction Processing..</h3>
              <img style={{ width: 60, height: 60 }} src={logo} alt="BTX logo"></img>
              <p><small>Click to cancel</small></p>
          </div>

        ) : isError ? (

          <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>
            <img style={{ width: 60, height: 60 }} src={logo} alt="BTX logo"></img>
            <h3>Transaction Failed.</h3>
              <p><small>Click to remove</small></p>
          </div>

        ) : !isPending && events[0] ? (

          <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>
            <h3>Transaction Successful.</h3>
              <img style={{ width: 60, height: 60 }} src={logo} alt="BTX logo"></img>
              <a
                href={config[network] ? `${config[network].explorerURL}/tx/${events[0].transactionHash}` : '#'}                
                target='_blank'
                rel='noreferrer'
              >
                {events[0].transactionHash.slice(0, 13) + '...' + events[0].transactionHash.slice(58, 66)}
              </a>
              <p><small>Click to remove</small></p>
          </div>
          
        ) : (
          <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}></div>
        )}
    </div>
  );
}

export default Alert;
