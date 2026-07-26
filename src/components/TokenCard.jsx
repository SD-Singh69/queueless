import { useQueue } from "../context/QueueContext";

function TokenCard() {

  const { currentCustomer, queue } = useQueue();

  if (!currentCustomer)
    return null;

  const position =
    queue.findIndex(c => c.id === currentCustomer.id) + 1;

  return (

    <div className="token-card">

      <h2>Your Token</h2>

      <h1>#{currentCustomer.token}</h1>

      <p>People Ahead : {position - 1}</p>

      <p>Estimated Wait : {(position - 1) * 5} min</p>

    </div>

  );

}

export default TokenCard;