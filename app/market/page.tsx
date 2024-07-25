import TradesTable from "@/components/TradesTable";
import { defaultFilterValues, defaultSort } from "@/lib/types/types";
import { useNearWallet } from "@/providers/wallet";

function Page() {
  // const { viewMethod, callMethod, accountId, callMethods, status } =
  //   useNearWallet();
  // const auth = status === "authenticated";
  return (
    <div>
      {/* {auth ? (
        <TradesTable
          typeOfOrders="open"
          heading=""
          // showCompletedToggle={false}
          showOrderStatus={false}
          initialSort={defaultSort}
          initialFilterValues={{
            ...defaultFilterValues,
            // showCompleted: false,
          }}
          showStatusDropdown={false}
          showMultipleToggle={true}
        />
      ) : (
        <TradesTable
          typeOfOrders="open"
          heading=""
          // showCompletedToggle={false}
          showOrderStatus={false}
          initialSort={defaultSort}
          initialFilterValues={{
            ...defaultFilterValues,
            // showCompleted: false,
          }}
          showStatusDropdown={false}
          showMultipleToggle={false}
        />
      )} */}
      <TradesTable
        typeOfOrders="open"
        heading=""
        // showCompletedToggle={false}
        showOrderStatus={false}
        initialSort={defaultSort}
        initialFilterValues={{
          ...defaultFilterValues,
          // showCompleted: false,
        }}
        marketView={true}
        showStatusDropdown={false}
        showMultipleToggle={true}
      />
    </div>
  );
}

export default Page;
