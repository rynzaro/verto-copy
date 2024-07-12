import TradesTable from "@/components/TradesTable";
import { defaultFilterValues, defaultSort } from "@/lib/types/types";

export default function Page() {
  return (
    <div>
      <TradesTable
        typeOfOrders="open"
        heading=""
        showCompletedToggle={true}
        showOrderStatus={true}
        initialSort={{
          value: "id",
          order: "desc",
        }}
        initialFilterValues={{
          ...defaultFilterValues,
          fromAccountId: true,
        }}
      />
    </div>
  );
}
