import TradesTable from "@/components/TradesTable";

export default function Page() {
  return (
    <div>
      <TradesTable typeOfOrders="all" heading="" showCompletedToggle={false} />
    </div>
  );
}
