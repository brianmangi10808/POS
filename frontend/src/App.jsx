import Login from './signup/Login'
import { Route, Routes, Navigate } from 'react-router-dom';
import './App.css'
import Home from './homepage/Home.jsx';
import Admin from './adminpage/Admin.jsx';
import Register from './signup/Register';
import { UserProvider } from './signup/UserContext.jsx'; 

function App() {
  

  return (
    < >
     <UserProvider>
     <Routes>
    <Route path='/' element={<Login />} />
    <Route path='/register' element={<Register />} />
    <Route path='/home' element={<Home/>} />
    <Route path='/admin' element={<Admin/>} />
      </Routes>

     </UserProvider>
    
     
    </>
  )
}

export default App
