export function SuccessAnimation(){
    return <div className="flex flex-col items-center p-6 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
            <span className="text-3xl text-white">✔</span>
        </div>
        <h2 className="text-2xl font-bold text-green-500 mt-4">Transfer Successful!</h2>
    </div>
}