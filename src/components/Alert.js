import { useRef, useEffect } from 'react'
import { useSelector } from 'react-redux';
import { myEventsSelector } from '../store/selectors';
import config from '../config.json';

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
            <h3>Wait a moment..</h3>
          </div>

        ) : isError ? (

          <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>
            <h3>Transaction Will Fail</h3>
          </div>

        ) : !isPending && events[0] ? (

          <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}>
            <h3>Transaction Successful</h3>
              <a
                href={config[network] ? `${config[network].explorerURL}/tx/${events[0].transactionHash}` : '#'}                
                target='_blank'
                rel='noreferrer'
              >
                {events[0].transactionHash.slice(0, 5) + '...' + events[0].transactionHash.slice(58, 66)}
              </a>
          </div>
          
        ) : (
          <div className="alert alert--remove" onClick={removeHandler} ref={alertRef}></div>
        )}
    </div>
  );
}

export default Alert;
