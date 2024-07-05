import TradesTable from "@/components/TradesTable";

export default function Page() {
    return (
        <div>
            <TradesTable typeOfOrders="open" heading="" showCompletedToggle={false}/>
        </div>
    );
}