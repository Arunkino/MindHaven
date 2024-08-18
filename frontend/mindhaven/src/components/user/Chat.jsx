import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRecentChats, fetchOnlineUsers, setCurrentChat, addMessage, setMessages, updateMessageStatus } from '../../features/user/chatSlice';
import ServiceCard from '../ServiceCard';
import BuddieImage from '../../assets/Buddies_svg.svg';
import { Search, MessageCircle, Users, Zap, X, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import { LoadingSpinner } from '../LoadingSpinner';
import axiosInstance from '../../utils/axiosConfig';
import { addNotification } from '../../features/notifications/notificationSlice';
import { sendMessage } from '../../features/websocketService';



const Chat = () => {
  const dispatch = useDispatch();
  const { recentChats = [], onlineUsers = [], currentChat = null, messages = [] } = useSelector(state => state.chat || {});
  const chatState = useSelector(state => state.chat);
  const isLoading = chatState.status === 'loading';
  const currentUser = useSelector(state => state.user.currentUser);
  
  const [message, setMessage] = useState('');

  const messagesEndRef = useRef(null);

  



  useEffect(() => {
    dispatch(fetchRecentChats()).then((action) => {
      console.log("Fetched recent chats:", action.payload);
    });
    dispatch(fetchOnlineUsers());

  }, [dispatch]);


  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && currentChat) {
      const messageData = {
        type: 'chat_message',
        message: {
          content: message,
          sender: currentUser.id,
          receiver: currentChat.id,
        }
      };
      
      sendMessage(messageData);
      setMessage('');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  
  const openChatWindow = async (user) => {
    console.log('Opening chat window with user:', user);
    dispatch(setCurrentChat(user));
    try {
      const response = await axiosInstance.get(`/messages/?other_user_id=${user.id}`);
      dispatch(setMessages(response.data));
      // Add a small delay before scrolling
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error("Failed to load chat messages. Please try again.");
    }
  };

  const findRandomChatBuddy = async () => {
    try {
      const response = await axiosInstance.get('/messages/random-online-user/');
      if (response.data && response.data.id) {
        openChatWindow(response.data);
      } else {
        toast.info("No buddies are online at the moment. Please try again later.");
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        toast.info("No buddies are online at the moment. Please try again later.");
      } else {
        console.error('Error finding random chat buddy:', error);
        toast.error("An error occurred while finding a chat buddy.");
      }
    }
  };

  const formatMessageTime = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  if(isLoading){
    return <LoadingSpinner/>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ServiceCard
        title="Connect with Buddies"
        description="Our chat is moderated by AI to ensure a positive and supportive atmosphere. Please remember not to reveal any personal information during your conversations. This helps maintain the privacy and safety of all users."
        imageUrl={BuddieImage}
        titleColor="text-custom-accent"
        accentColor="bg-yellow-400"
      />
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Recent Chats</h2>
        {recentChats.length > 0 ? (
          <div className="space-y-2">
            {recentChats.map((chat) => (
              
              <div 
                key={chat.id} 
                className="flex items-center p-2 border rounded cursor-pointer hover:bg-gray-100"
                onClick={() => openChatWindow(chat)}
              >
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                <div className="flex-grow">
                  <p className="font-semibold">{chat.name}</p>
                  <p className="text-sm text-gray-500">{chat.last_message}</p>
                </div>
                <div className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(chat.timestamp), { addSuffix: true })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No recent chats</p>
        )}
      </div>

      <div className="p-4 border-t">
        <button 
          className="w-full bg-yellow-400 text-white py-2 px-4 rounded-lg flex items-center justify-center hover:bg-yellow-500 transition-colors"
          onClick={findRandomChatBuddy}
        >
          <Zap className="mr-2" size={20} />
          Find Random Chat Buddy
        </button>
      </div>

      {currentChat && (
        <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-500 text-white p-3 flex justify-between items-center">
            <h2 className="font-semibold">{currentChat.name}</h2>
            <button onClick={() => dispatch(setCurrentChat(null))} className="text-white hover:text-gray-200">
              <X size={20} />
            </button>
          </div>
          <div className="h-64 p-3 overflow-y-auto">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender === currentUser.id ? 'text-right' : 'text-left'}`}>
                <p className={`inline-block p-2 rounded-lg ${
                  msg.sender === currentUser.id ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}>
                  {msg.content}
                </p>
                <small className="block text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                </small>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="border-t p-3 flex">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-grow px-3 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600">
              <Send size={20} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chat;