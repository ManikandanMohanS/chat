import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import Login from "./components/login";
import ChatRoom from "./components/ChatRoom"; // You'll create this next

function App() {
  const [user] = useAuthState(auth);

  return <div className="App">{user ? <ChatRoom /> : <Login />}</div>;
}

export default App;
