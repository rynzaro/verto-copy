import TradeTableRow from "@/components/TradeTableRow";
import TradesTable from "./TradesTable";

export default function Page() {
    return (
        <div>
            <TradesTable typeOfOrders="open" heading=""/>
            <TradeTableRow></TradeTableRow>
        </div>
    );
}