
import { SignInButton , SignedOut, SignedIn, SignOutButton, UserButton} from '@clerk/clerk-react';
import './App.css'

function App() {
  return (
    <>
      <h1>Welcome to the App</h1>

      <SignedOut>
      <SignInButton mode='modal'/>
      </SignedOut>

      <SignedIn>
        <SignOutButton />
      </SignedIn>

      <UserButton/>
    </>
  )
}

export default App
