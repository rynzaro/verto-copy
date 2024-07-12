import TradesTable from "@/components/TradesTable";
import { defaultFilterValues } from "@/lib/types/types";

export default function Page() {
  return (
    <div>
      <TradesTable
        typeOfOrders="open"
        heading=""
        showCompletedToggle={true}
        initialFilterValues={{
          ...defaultFilterValues,
          toAccountId: true,
        }}
      />
    </div>
  );
}
