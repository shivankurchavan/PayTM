export function InputBox({onChange,label,placeholder}){
    return<div>
        <div className="text-sm font-semibold text-left py-2">
        {label}
        </div> 
        <input onChange={onChange} placeholder={placeholder} className="w-full px-2 py-1 border rounded vorder-slate-200"/>       
    </div>
}