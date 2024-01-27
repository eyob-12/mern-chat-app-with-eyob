import {useContext, useState} from "react";
import axios from "axios";
import {UserContext} from "./UserContext.jsx";

export default function RegisterAndLoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginOrRegister, setIsLoginOrRegister] = useState('login');
  const {setUsername:setLoggedInUsername, setId} = useContext(UserContext);
  
  async function registerMembers(ev) {
    ev.preventDefault();
    const url = isLoginOrRegister === 'register' ? 'register' : 'login';
    const {data} = await axios.post(url, {username,password});
    setLoggedInUsername(username);
    setId(data.id);
    }
    
    return (
        <div className="bg-gray-800 h-screen flex items-center">
           <form className="w-64 mx-auto" onSubmit={registerMembers}>
                <input type="text"
                       placeholder="username"
                       className="block w-full rounded-lg bg-gray-700 mt-2 p-2 focus:border-white focus:bg-teal-800 focus:outline-none dark:text-white font-bold"
                       value={username}
                       onChange={event => setUsername(event.target.value)}
                />
                <input type="password"
                       placeholder="password"
                       className="block w-full rounded-lg bg-gray-700 mt-2 p-2 focus:border-white focus:bg-teal-800 focus:outline-none dark:text-white font-bold"
                       value={password}
                       onChange={event => setPassword(event.target.value)}
                />
                <button className="w-full py-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg mt-2">
                    {isLoginOrRegister === 'register' ? 'SIGN UP':'SIGN IN'}
                </button>
                <div className="text-center mt-2 ">
                    {isLoginOrRegister === 'register' && (
                       <div className="flex text-sm">
                           <p className="mt-0 p-2 text-white font-bold"> Already hava an account?</p>
                           <button className="text-sky-500 border-b-4 border-sky-500" onClick={() => setIsLoginOrRegister('login')}>
                                SIGN IN 
                           </button>
                       </div>
                    )}
                    {isLoginOrRegister === 'login' && (
                       <div className="flex text-sm">
                           <p className="mt-0 p-2 text-white font-bold"> Dont hava an account ?</p>
                           <button className="text-sky-500 border-b-4 border-sky-500" onClick={() => setIsLoginOrRegister('register')}>
                                SIGN UP
                           </button>
                       </div>
                    )}
                    
                </div>
           </form>
            
                
        </div>
    );
}