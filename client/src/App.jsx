import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import { ToastContainer } from 'react-toastify'
import CitizenDash from './pages/dashboards/CitizenDash'
import EmployeeDash from './pages/dashboards/EmployeeDash'
import AdminDash from './pages/dashboards/AdminDash'
import Register from './pages/Register'
import Profile from './pages/Profile'


const App = () => {
  return (
    <>
    <ToastContainer/>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/citizen-dashboard' element={<CitizenDash />} />
        <Route path='/employee-dashboard' element={< EmployeeDash />} />
        <Route path='/admin-dashboard' element={<AdminDash />} />
        <Route path='/profile' element={<Profile />} />
      </Routes>
   </>
  )
}

export default App