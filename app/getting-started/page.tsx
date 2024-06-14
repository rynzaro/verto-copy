import OrderTable from "@/components/OrderTable";
import CreateOrderForm from "@/components/forms/CreateOrderForm";
import GetMakeOrdersForm from "@/components/forms/GetMakeOrdersForm";
import GetOrderForm from "@/components/forms/GetOrderForm";
import TransferTokensForm from "@/components/forms/TransferTokensForm";
// import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col space-y-4 mt-20">
      <GetOrderForm />
      <GetMakeOrdersForm />
      <TransferTokensForm />
      <CreateOrderForm />
      <OrderTable type_of_orders="all" />
      <div></div>
    </main>
  );
}
