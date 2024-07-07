export default function Page() {
    const tokenFrom = "NEAR"
    const tokenTo = "BLACKDRAGON"
    const user = "vertouser.near"
    const offerAmount = "8000000000000"
    const receiveAmount = "620"

    function formatNumber(number: number) {
        // Convert number to a string
        let formattedNumber = number.toString();

        // Check if the number contains 'e' (scientific notation)
        if (formattedNumber.includes('e')) {
            formattedNumber = number.toFixed(20); // Convert to fixed-point notation with sufficient decimal places
        }
        formattedNumber = Number(formattedNumber).toLocaleString('en-US');

        // Remove trailing zeros and the decimal point if there are no decimals
        formattedNumber = formattedNumber.replace(/(\.\d*?[1-9])0+$/g, '$1').replace(/\.0+$/, '');
        return formattedNumber;
    }

    return (
        <div className="flex justify-center">
            <div className="w-[360px]">
                <div className="border border-gray-600 rounded-md divide-y divide-gray-600 w-full my-4">
                    <div className="flex justify-between px-4 py-3 font-bold text-sm">
                        <div className="text-gray-400">Trading Pair</div>
                        <div>{tokenFrom} - {tokenTo}</div>
                    </div>
                    <div className="flex justify-between px-4 py-3 font-bold text-sm">
                        <div className="text-gray-400">Trade Type</div>
                        <div className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-lime-300">Single Fill</div>
                    </div>
                    <div className="flex justify-between px-4 py-3 font-bold text-sm">
                        <div className="text-gray-400">Order Creator</div>
                        <div>{user}</div>
                    </div>
                    <div className="flex justify-between px-4 py-3 font-bold text-sm">
                        <div className="text-gray-400">You send</div>
                        <div>{formatNumber(Number(offerAmount))}</div>
                    </div>
                    <div className="flex justify-between px-4 py-3 font-bold text-sm">
                        <div className="text-gray-400">You receive</div>
                        <div>{receiveAmount}</div>
                    </div>
                    <div className="flex justify-between px-4 py-3 font-bold text-sm">
                        <div className="text-gray-400">Price Per Token</div>
                        <div>{formatNumber(Number(offerAmount) / Number(receiveAmount))}</div>
                    </div>
                    <div className="flex justify-between px-4 py-3 font-bold text-sm">
                        <div className="text-gray-400">Fill Type</div>
                        <div className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-lime-300">Single Fill</div>
                    </div>
                    <div className="flex justify-between px-4 py-3 font-bold text-sm">
                        <div className="text-gray-400">Privacy Type</div>
                        <div className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-lime-300">Public</div>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button className="flex-grow text-sm inline-flex w-full justify-center items-center gap-x-1.5 rounded-md bg-gradient-to-r px-3.5 py-2.5 font-semibold text-white shadow-sm border-2 border-lime-300">
                            Back
                    </button>
                    <button className="flex-grow text-sm inline-flex w-full justify-center items-center gap-x-1.5 rounded-md bg-gradient-to-r from-green-400 to-lime-300 px-3.5 py-2.5 font-semibold text-black shadow-sm">
                            Buy
                    </button>
                </div>
            </div>
        </div>
    );
}