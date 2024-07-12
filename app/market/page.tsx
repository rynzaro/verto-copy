import TradesTable from "@/components/TradesTable";
import { defaultFilterValues, defaultSort } from "@/lib/types/types";

export default function Page() {
  return (
    <div>
      <TradesTable
        typeOfOrders="open"
        heading=""
        showCompletedToggle={false}
        showOrderStatus={false}
        initialSort={defaultSort}
        initialFilterValues={{
          ...defaultFilterValues,
          showCompleted: false,
        }}
      />
    </div>
  );
}
