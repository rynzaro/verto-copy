import TradesTable from "@/components/TradesTable";
import { defaultFilterValues } from "@/lib/types/types";

export default function Page() {
  return (
    <div>
      <TradesTable
        typeOfOrders="open"
        heading=""
        showCompletedToggle={false}
        initialFilterValues={{
          ...defaultFilterValues,
          showCompleted: false,
        }}
      />
    </div>
  );
}
