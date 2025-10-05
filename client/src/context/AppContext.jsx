import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const AppContext = createContext()

export const AppContextProvider = (props)=>{

    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [isLoggedIn,setIsLoggedIn] = useState(false)
    const [userData,setUserData] = useState(false)

    const getUserData = async (req,res)=>{
        try {
            const {data} = await axios.get(backendUrl+'/api/auth/is-auth')
            if(data.success){
                setIsLoggedIn(true)
                getUserData()
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getAuthState = async (req,res)=>{
        try {
            const {data} = await axios.get(backendUrl+'/api/user/data')
            data.success?setUserData(data.userData):toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(()=>{
        getAuthState()
    },[])
    
    const value={
        backendUrl,
        isLoggedIn,setIsLoggedIn,
        userData,setUserData,
        getUserData
    }
    return (
        <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
    )
}