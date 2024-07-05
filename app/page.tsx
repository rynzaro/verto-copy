import PageHeading from "@/components/PageHeading";
import CreateTradeForm from "@/components/forms/CreateTradeForm";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "VERTO",
};

export default function Page() {
  return (
    <div className="mt-20">
      <div className="mx-auto max-w-7xl my-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <PageHeading title="Trade now" /> <CreateTradeForm />
        </div>
      </div>
    </div>
  );
}
