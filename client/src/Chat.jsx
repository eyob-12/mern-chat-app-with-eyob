import { useContext, useEffect, useState, useRef } from "react";
import Avatar from "./Avatar";
import {UserContext} from "./UserContext.jsx";
import Logo from "./Logo.jsx";
import { uniqBy } from "lodash";
import axios from "axios";

export default function Chat() {

    const [ws, setWs] = useState(null);
    const [onlinePeople, setOnlinePeople] = useState({});
    const [offlinePeople, setOfflinePeople] = useState({});
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [newMessageText, setNewMessageText] = useState('');
    const [messages, setMessages] = useState([]);
    const { username, id, setId, setUsername } = useContext(UserContext);
    const divUnderMessages = useRef();

    useEffect(() => {
        connectToWs();
    }, []);

    function connectToWs() {
        const ws = new WebSocket('ws://localhost:5050');
        setWs(ws);
        ws.addEventListener('message', handelMessage)
        ws.addEventListener('close', () => {
            setTimeout(() => {
                console.log('Got disconnected. Trying to reconnect');
                connectToWs();
            }, 1000);
        });
    }
    function showOnlinePeople(peopleArray) {
        const people = {};
        peopleArray.forEach(({ userId, username }) => {
            people[userId] = username;
        });
        setOnlinePeople(people);
    }

    function handelMessage(event) {
        const messageData = JSON.parse(event.data);

        console.log({ event, messageData });

        if ('online' in messageData) {
            showOnlinePeople(messageData.online);
        } else if ('text' in messageData) {
            if (messageData.sender === selectedUserId) {
                setMessages(prev => ([...prev, { ...messageData }]));
            }
        }
    }

    function sendMessage(event, file = null) {
       if(event) event.preventDefault();
        ws.send(JSON.stringify({
                recipient: selectedUserId,
            text: newMessageText,
            file,
        }));
        
        if (file) {
            axios.get('/messages/'+selectedUserId).then(res => {
                setMessages(res.data);
            });
        } else {
            setNewMessageText('');
        setMessages(prev => ([...prev, {
            text: newMessageText,
            sender: id,
            recipient:selectedUserId,
            _id: Date.now(),
        }]));
        }
    }

    function uploadFile(event) {
        const reader = new FileReader();
        reader.readAsDataURL(event.target.files[0]);
        reader.onload = () => {
            sendMessage(null, {
                name: event.target.files[0].name,
                data: reader.result,
            });
        }
    }

    function logout() {
        axios.post('/logout').then(() => {
            setWs(null);
            setId(null);
            setUsername(null);
        })
    }

    useEffect(() => {
        const div = divUnderMessages.current;
        if (div) {
          div.scrollIntoView({behavior:'smooth', block:'end'});
        }
    }, [messages]);
    
    // this statement run every time online people changes
    useEffect(() => {
        axios.get('/people')//this end point grab all peoples
            .then(res => {
                const offlinePeopleArray = res.data
                    .filter(p => p._id !== id)
                    .filter(p => !Object.keys(onlinePeople).includes(p._id));
                const offlinePeoples = {};
                offlinePeopleArray.forEach(p => {
                    offlinePeoples[p._id] = p;
                });
                setOfflinePeople(offlinePeople);
            });
    }, [onlinePeople]);

    useEffect(() => {
     if(selectedUserId) {
        axios.get('/messages/'+selectedUserId).then(res => {
            setMessages(res.data);
        });
    }
    }, [selectedUserId])

    const onlinePeopleExclOurUser = {...onlinePeople};
    delete onlinePeopleExclOurUser[id];

    const messagesWithoutDuplication = uniqBy(messages, '_id');

    return (
        <div className="flex h-screen">
            <div className="w-1/3 bg-gray-800 pl-6 pt-6 flex flex-col"> 
            <div className="flex-grow">
                <Logo />
                {Object.keys(onlinePeople).map(userId => (
                    <div key={userId} onClick={() => setSelectedUserId(userId)}
                        className={"border-b border-gray-500 py-2 flex items-center gap-2 cursor-pointer"
                        + (userId === selectedUserId ? 'bg-gray-300 border-l-4 border-sky-500 rounded-xl' : '')}>
                     
                        {userId === selectedUserId && (
                        <div className="w-1 bg-blue-500 h-12 rounded-r-md"></div>
                      )}
                        <div className="flex gap-2 py-2 pl-4 items-center">
                        <Avatar online={true} username={onlinePeople[userId]} userId={ userId} />
                        <span className=" text-gray-300 font-serif font-bold">
                            {onlinePeople[userId]}
                        </span>
                        </div>
                   </div> 
             ))}
            </div>
            <div className="p-2 text-center flex items-center justify-center">
               <div>
                        <span className="mr-2 text-md text-teal-600 flex items-center">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                           {username} &rarr;
                        </span> 
               </div>
               <div>
                  <button className=" text-teal-400 border border-sky-500 rounded-md cursor-pointer w-28" onClick={logout}>logout</button>
               </div>
           </div>
            </div>
            
            <div className="flex flex-col bg-gray-800 w-2/3 p-2">
                <div className="flex-grow text-white">
                    {!selectedUserId && (
                        <div className="flex h-full flex-grow items-center justify-center">
                            <div className="text-gray-500 text-xl"> &larr; Select the person to talk ....</div>
                        </div>
                        
                    )}
                     {!!selectedUserId && (
                        <div className="relative h-full">
                            <div className="overflow-y-scroll absolute inset-0">
                               {messagesWithoutDuplication.map(message => (
                               <div key={message._id} className={(message.sender === id ? 'text-right': 'text-left')}>
                                  <div className={"inline-block p-2 m-4 rounded-xl text-md w-full max-w-80 " +(message.sender === id ? 'bg-yellow-200 text-gray-900':'bg-green-300 text-gray-900')}>
                                    {message.text}
                                    {message.file && (
                                    <div>
                                       <a  target="blank" className="flex items-center gap-1 border-b" href={axios.defaults.baseURL + '/uploads/' + message.file}>
                                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                         <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                                         </svg>
                                         {message.file}
                                       </a>    
                                    </div>     
                                    )}       
                                           
                                  </div>
                               </div>        
                               ))}
                                <div ref = {divUnderMessages}></div>
                           </div> 
                        </div>
                     )}
                </div>

                {!!selectedUserId && (
                    <form className="flex gap-2" onSubmit={sendMessage}>
                
                   <input value={newMessageText}
                          onChange={event => setNewMessageText(event.target.value)}
                          type="text"
                          placeholder="type the message"
                          className="flex-grow border border-gray-600 rounded-xl p-2 bg-none"
                        />
                    <label className="border border-sky-500 p-2 rounded-xl text-teal-500 cursor-pointer">
                       <input type="file" onChange={uploadFile} className="hidden" />
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                       <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                       </svg>
                   </label>
                    <button type="submit" className="bg-blue-500 p-2 rounded-xl text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                      </svg>
                    </button>
                </form>
                )}
                
            </div>
        </div>
    );
}

