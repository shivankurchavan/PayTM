import {useNavigate} from "react-router-dom";
import { Button } from "./Button";
export function SignoutBtn(){
    const nav = useNavigate();

    const signout=()=>{
        localStorage.removeItem("token");
        nav("/signin");
    }
    
    return <Button label={"Sign out"} onClick={signout} />
}