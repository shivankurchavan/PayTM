import { useEffect, useState } from "react";
import {Button} from "./Button";
import  axios  from "axios";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

export const Users = () => {
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState("");

    // Retrieve and decode token if available
    const token = localStorage.getItem("token");
    const userId = token ? jwtDecode(token).userId : null;


    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get("http://localhost:3000/api/v1/user/bulk/?filter=" + filter, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const filteredUsers = response.data.user.filter(user => user._id !== userId);
                setUsers(filteredUsers);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, [filter, userId, token]);
    return <>
        <div className="font-bold mt-6 text-lg" >
            Users
        </div>
        <div className="my-2 ">
            <input onChange={e=>{
                setFilter(e.target.value);
            }} type="text" placeholder="Search users...." className="w-full px-2 py-1 border rounded border-slate-700"/>
        </div>
        <div>
            {users.map(user=><User key={user._id} user={user}/>)}
        </div>
    </>
}


function User({user}){
    const navigate = useNavigate();

    return <div className="flex justify-between">
        <div className="flex">
            <div className="rounded-full h-12 w-12 bg-slate-200 flex justify-center mt-1 mr-2">
                <div className="flex flex-col justify-center h-full text-xl">
                    {user.firstName[0].toUpperCase()}
                </div>
            </div>
            <div className="flex flex-col justify-center h-full">
                <div>
                    {user.firstName} {user.lastName}
                </div>
            </div>
        </div>
        <div className="flex justify-center space-x-4">
            <div className="flex flex-col justify-center h-ful" >
                <Button onClick={e=>{
                    navigate("/request?id=" + user._id + "&name=" + user.firstName); 
                }} label={"Request Money"}/>
            </div>
            <div className="flex flex-col justify-center h-ful" >
                <Button onClick={e=>{
                    navigate("/send?id=" + user._id + "&name=" + user.firstName); 
                }} label={"Send Money"}/>
            </div>
        </div>
    </div>
}