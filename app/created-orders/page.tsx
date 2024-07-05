import TradesTable from "@/components/TradesTable";

export default function Page() {
    return (
        <div>
            <TradesTable typeOfOrders="make" heading="" showCompletedToggle={true}/>
        </div>
    );
}