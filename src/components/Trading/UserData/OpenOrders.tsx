import { useHyperLiquid } from "@/context/HyperLiquid";
import { Order, WsOrder } from "@/utils/hyperLiquidTypes";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

const OpenOrders = () => {
  const { address } = useAccount()
  const { sdk } = useHyperLiquid()
  const { data: openOrders, isLoading } = useQuery({
    queryKey: ['openOrders', address],
    queryFn: async () => {
      const response = await sdk.info.getUserOpenOrders(address)
      return response as Order[]
    },
    enabled: !!address && !!sdk
  })

  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (openOrders) {
      setOrders(openOrders);
    }
  }, [openOrders]);

  useEffect(() => {
    if (!sdk) return;
    sdk.subscriptions.subscribeToOrderUpdates(address, (data: WsOrder[]) => {
      console.log("Order updates", data);
      setOrders((prevOrders) => {
        const newOrders = [...prevOrders];
        data.forEach((order) => {
          const index = newOrders.findIndex((o) => o.oid === order.order.oid);
          if(order.status !== 'open') {
            newOrders.splice(index, 1);
            return;
          }
          newOrders[index] = {
            coin: order.order.coin,
            limitPx: Number(order.order.limitPx),
            oid: order.order.oid,
            origSz: Number(order.order.origSz),
            side: order.order.side === 'b' ? 'buy' : 'sell',
            sz: Number(order.order.sz),
            timestamp: order.statusTimestamp,
          }
        });
        return newOrders
      })
    });
    return () => {
      sdk.subscriptions.unsubscribeFromOrderUpdates();
    };
  }, [sdk, address]);

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-4 bg-gray-900 text-white">
      <h2 className="text-xl font-bold mb-4">Open Orders</h2>
      <table className="min-w-full bg-gray-800 text-left">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-gray-700">Coin</th>
            <th className="py-2 px-4 border-b border-gray-700">Side</th>
            <th className="py-2 px-4 border-b border-gray-700">Limit Price</th>
            <th className="py-2 px-4 border-b border-gray-700">Size</th>
            <th className="py-2 px-4 border-b border-gray-700">Order ID</th>
            <th className="py-2 px-4 border-b border-gray-700">Timestamp</th>
            <th className="py-2 px-4 border-b border-gray-700">Original Size</th>
            <th className="py-2 px-4 border-b border-gray-700">
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                onClick={async () => {
                  const res = await sdk.custom.cancelAllOrders();
                  console.log(res);
                }}
              >
                Cancel All
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {orders?.map((order) => (
            <tr key={order.oid}>
              <td className="py-2 px-4 border-b border-gray-700">{order.coin}</td>
              <td
                className={`py-2 px-4 border-b border-gray-700 ${order.side === 'buy' ? 'text-green-500' : 'text-red-500'}`}
              >
                {order.side}
              </td>
              <td className="py-2 px-4 border-b border-gray-700">{order.limitPx}</td>
              <td className="py-2 px-4 border-b border-gray-700">{order.sz}</td>
              <td className="py-2 px-4 border-b border-gray-700">{order.oid}</td>
              <td className="py-2 px-4 border-b border-gray-700">
                {new Date(order.timestamp).toLocaleString()}
              </td>
              <td className="py-2 px-4 border-b border-gray-700">{order.origSz}</td>
              <td className="py-2 px-4 border-b border-gray-700">
                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                  onClick={async () => {
                    const res = await sdk.exchange.cancelOrder();
                    console.log(res);
                  }}
                >
                  Cancel
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div >
  );
}

export default OpenOrders
