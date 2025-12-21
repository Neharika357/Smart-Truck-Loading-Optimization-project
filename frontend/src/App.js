import React from 'react';
import { BrowserRouter,Routes, Route } from "react-router-dom";
import TruckDashboard from './pages/trucks';
import Profile from './pages/profile-trucks';
import WarehouseDashboard from './pages/shipments';
import WarehouseProfile from './pages/profile-warehouse';
import ForgotPassword from './pages/ForgotPassword';
import Login from './pages/Login';
import Signup from './pages/SignUp';
import ResetPassword from './pages/ResetPassword'

function App() {
  return (
    <BrowserRouter>
        <Routes>
            <Route path='/dealer/:username' element= {<TruckDashboard/>}/>
            <Route path='/profile/:username' element= {<Profile/>}/>
            <Route path ='/warehouse/:username' element ={<WarehouseDashboard />} />
            <Route path ='/user/:username' element ={<WarehouseProfile />} />
            <Route path ='/' element={<Signup />} />
            <Route path ='/login' element={<Login />} />
            <Route path ='/ForgotPassword' element={<ForgotPassword />} />
            <Route path ='/ResetPassword' element={<ResetPassword />} />
        </Routes>

    </BrowserRouter>
  );
}

export default App;
