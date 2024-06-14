import { Order } from "@/lib/types/types";

export default function OrderOverview({ order }: { order: Order }) {
  return (
    <div key={order.id}>
      ID - {order.id} | From - {order.from_contract_id}: {order.from_amount} |
      To - {order.to_contract_id}: {order.to_amount} | Status - {order.status}
      <br />
    </div>
  );
}
