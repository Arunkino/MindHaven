import React, { useEffect, useState } from "react";
import { LoadingSpinner } from "../LoadingSpinner";
import axiosInstance from "../../utils/axiosConfig";
import { toast } from 'react-toastify';
import { Calendar, Clock, Filter, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/user/userSlice';

const UpcomingSessions = () => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    date: '',
    specialization: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [bookedSlot, setBookedSlot] = useState(null);
  const [expandedMentors, setExpandedMentors] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [expandedSlot, setExpandedSlot] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    fetchAvailableSlots();
  }, [filters]);

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/available-slots/', {
        params: filters,
      });
      setAvailableSlots(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching slots:', err);
      setError('Failed to fetch upcoming available slots');
      toast.error('Failed to fetch upcoming available slots');
      if (err.response && err.response.status === 401) {
        dispatch(logout());
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = async () => {
    if (!selectedSlot) return;
    try {
      const response = await axiosInstance.post(`/api/slots/${selectedSlot.id}/book/`);
      setBookedSlot(selectedSlot);
      setShowModal(true);
      fetchAvailableSlots();
    } catch (err) {
      console.error('Error booking session:', err);
      toast.error('Failed to book session');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setBookedSlot(null);
    setSelectedSlot(null);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  const formatTime = (timeString) => {
    if (!timeString || typeof timeString !== 'string') {
      return 'N/A';
    }
    return timeString.slice(0, 5);
  };

  const groupSlotsByDateAndMentor = (slots) => {
    return slots.reduce((acc, slot) => {
      const date = new Date(slot.date).toLocaleDateString('en-GB');
      if (!acc[date]) {
        acc[date] = {};
      }
      if (!acc[date][slot.mentor_name]) {
        acc[date][slot.mentor_name] = [];
      }
      acc[date][slot.mentor_name].push(slot);
      return acc;
    }, {});
  };

  const toggleMentorExpansion = (date, mentorName) => {
    setExpandedMentors(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        [mentorName]: !prev[date]?.[mentorName]
      }
    }));
  };

  const groupedSlots = groupSlotsByDateAndMentor(availableSlots);

  const formatDate = (dateString) => {
    // Parse the date string assuming it's in DD/MM/YYYY format
    const [day, month, year] = dateString.split('/').map(num => parseInt(num, 10));
    
    // Create a new Date object (months are 0-indexed in JavaScript)
    const date = new Date(year, month - 1, day);
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return 'Invalid Date';
    }

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      // Use toLocaleDateString with options to format the date
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
         
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const handleSlotHover = (slotId) => {
    setExpandedSlot(slotId);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <p>Error: {error}</p>
        <button 
          onClick={fetchAvailableSlots} 
          className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-400 text-white">
        <h3 className="text-2xl font-semibold">Upcoming Available Slots</h3>
      </div>
      
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <Calendar className="mr-2 text-blue-600" size={20} />
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
          </div>
          <div className="flex items-center">
            <Filter className="mr-2 text-blue-600" size={20} />
            <input
              type="text"
              name="specialization"
              value={filters.specialization}
              onChange={handleFilterChange}
              placeholder="Specialization"
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {Object.entries(groupedSlots).length === 0 ? (
          <p className="p-6 text-gray-500 text-center">No upcoming available slots.</p>
        ) : (
          Object.entries(groupedSlots).map(([date, mentors]) => (
            <div key={date} className="p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">{formatDate(date)}</h4>
              <div className="space-y-4">
                {Object.entries(mentors).map(([mentorName, mentorSlots]) => (
                  <div key={mentorName} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div 
                      className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 transition duration-300"
                      onClick={() => toggleMentorExpansion(date, mentorName)}
                    >
                      <div>
                        <p className="font-semibold text-gray-800">Dr. {mentorName}</p>
                        <p className="text-sm text-gray-600">Specialization: {mentorSlots[0].specialization}</p>
                      </div>
                      {expandedMentors[date]?.[mentorName] ? (
                        <ChevronUp className="text-blue-600" size={24} />
                      ) : (
                        <ChevronDown className="text-blue-600" size={24} />
                      )}
                    </div>
                    <AnimatePresence>
                      {expandedMentors[date]?.[mentorName] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="p-4 bg-gray-50"
                        >
                          <div className="grid grid-cols-3 gap-2">
                            {mentorSlots.map((slot) => (
                              <motion.div
                                key={slot.id}
                                className="relative"
                                onMouseEnter={() => handleSlotHover(slot.id)}
                                onMouseLeave={() => handleSlotHover(null)}
                              >
                                <motion.div
                                  className={`p-2 bg-white rounded-md shadow-sm cursor-pointer transition-all duration-300 ${
                                    selectedSlot?.id === slot.id ? 'bg-blue-100 border-2 border-blue-500' : 'hover:bg-gray-100'
                                  }`}
                                  onClick={() => setSelectedSlot(slot)}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <div className="flex items-center justify-center">
                                    <Clock className="mr-2 text-blue-600" size={16} />
                                    <span className="text-sm font-medium text-gray-700">
                                      {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                    </span>
                                  </div>
                                </motion.div>
                                <AnimatePresence>
                                  {expandedSlot === slot.id && (
                                    <motion.div
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -10 }}
                                      className="absolute z-10 mt-2 p-2 bg-white rounded-md shadow-lg"
                                    >
                                      <p className="text-sm text-gray-600">Duration: 30 minutes</p>
                                      <p className="text-sm text-gray-600">Available: Yes</p>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            ))}
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`mt-4 w-full py-2 px-4 rounded-md transition duration-300 ${
                              selectedSlot ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                            onClick={handleBookSession}
                            disabled={!selectedSlot}
                          >
                            Book Now
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.1, opacity: 0 }}
              className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center text-2xl font-semibold text-green-600 mb-4">
                <CheckCircle className="mr-2" size={28} />
                Booking Confirmed!
              </div>
              {bookedSlot && (
                <div>
                  <p className="text-lg font-medium text-gray-800 mb-4">
                    Your session with Dr. {bookedSlot.mentor_name || 'Unknown'} has been booked.
                  </p>
                  <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                    <p className="flex items-center text-blue-800 mb-2">
                      <Calendar className="mr-2" size={18} />
                      Date: {bookedSlot.date ? bookedSlot.date : 'N/A'}
                    </p>
                    <p className="flex items-center text-blue-800">
                      <Clock className="mr-2" size={18} />
                      Time: {formatTime(bookedSlot.start_time)} - {formatTime(bookedSlot.end_time)}
                    </p>
                  </div>
                  <p className="mt-4 text-sm text-gray-600">
                    Please be available at the scheduled time. If you need to reschedule or cancel, please do so at least 24 hours in advance.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300"
                    onClick={handleCloseModal}
                  >
                    Close
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UpcomingSessions;