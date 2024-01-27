import Routes from "./Routes";
//import Register from "./register";
import axios from "axios";
import { UserContextProvider } from "./UserContext";


function App() {
  axios.defaults.baseURL = 'http://localhost:5050';
  axios.defaults.withCredentials = true;// set cookies for our api
  return (
    <UserContextProvider>
      <Routes />
    </UserContextProvider>
  )
}

export default App
