import { SignoutBtn } from "./SignoutBtn";
import { useRecoilState } from "recoil";
import { jwtDecode } from "jwt-decode";
import { nameAtom } from "../atoms/atom";
import { useEffect } from "react";
import axios from "axios";

export const Appbar = () =>{
    const token = localStorage.getItem("token");
    const userId = token ? jwtDecode(token).userId : null;

    const [user,setUser]=useRecoilState(nameAtom);
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get("http://localhost:3000/api/v1/user/bulk/", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const filteredUser = response.data.user.find(user => user._id === userId);
                setUser(filteredUser.firstName);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, [userId, token]);



    return<div className="shadow h-14 flex justify-between">
        <div className="flex flex-col justify-center h-full ml-4">
        Payments Appication    
        </div> 
        <div className="flex">
            <div className="flex flex-col justify-center h-full mr-4 font-bold text-lg">
                Hello, {user}
            </div>
            {/* <div  className="rounded-full h-12 w-12 bg-slate-200 flex justify-center mt-1 mr-2">
                <div className="flex flex-col justify-center h-full text-xl">
                    {user}
                </div>
                
            </div> */}
            <div className="flex flex-col justify-center h-ful px-2">
                    <SignoutBtn/>
            </div>
        </div>        
    </div>
}