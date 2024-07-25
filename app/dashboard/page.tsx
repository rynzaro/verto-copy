import TradesTable from "@/components/TradesTable";
import { defaultFilterValues, defaultSort } from "@/lib/types/types";

export default function Page() {
  return (
    <div>
      <TradesTable
        typeOfOrders="open"
        heading=""
        showStatusDropdown={true}
        showMultipleToggle={false}
        showOrderStatus={true}
        marketView={false}
        initialSort={{
          value: "id",
          order: "desc",
        }}
        initialFilterValues={{
          ...defaultFilterValues,
          fromAccountId: true,
        }}
      />

      {/* <TradesTable
        typeOfOrders="open"
        heading=""
        showCompletedToggle={true}
        showOrderStatus={true}
        initialSort={defaultSort}
        initialFilterValues={{
          ...defaultFilterValues,
          toAccountId: true,
        }}
      /> */}
    </div>
  );
}
