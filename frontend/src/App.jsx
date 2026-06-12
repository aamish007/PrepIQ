
import { SignInButton , SignedOut, SignedIn, SignOutButton, UserButton, useUser} from '@clerk/clerk-react';
import HomePage from './pages/HomePage';
import ProblemsPage from './pages/ProblemsPage';
import DashboardPage from './pages/DashboardPage';
import {Route,Routes, Navigate} from "react-router"
import { Toaster } from 'react-hot-toast';

function App() {
  const {isSignedIn, isLoaded} = useUser();
  if(!isLoaded) return null; // or a loading spinner
  return (
    <>
    <Routes>
      <Route path="/" element={!isSignedIn ? <HomePage /> : <Navigate to={"/dashboard"}/>} />
      <Route path="/dashboard" element={isSignedIn ? <DashboardPage /> : <Navigate to={"/"}/>} />
      <Route path="/problems" element={ isSignedIn ? <ProblemsPage /> : <Navigate to={"/"}/> } />
    </Routes>
    <Toaster toastOptions={{ duration: 3000 }} />
    </>
  )
}

export default App
