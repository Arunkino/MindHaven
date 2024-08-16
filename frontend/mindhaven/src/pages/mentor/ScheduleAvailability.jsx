import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import axiosInstance from '../../utils/axiosConfig';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const ScheduleAvailability = () => {
  const { currentUser } = useSelector(state => state.user);
  const [availabilities, setAvailabilities] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [expandedDates, setExpandedDates] = useState({});
  const [repeatFor4Weeks, setRepeatFor4Weeks] = useState(false);

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchAvailabilities();
    fetchSlots();
    
    // Set the selectedDate to the start of the current day in the user's local timezone
    const now = new Date();
    setSelectedDate(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
    console.log("selectedDate:", selectedDate);
  }, []);

  const fetchAvailabilities = async () => {
    try {
      const response = await axiosInstance.get('/api/availabilities/');
      setAvailabilities(response.data);
      console.log(" availabilities:", response.data);
    } catch (error) {
      console.error('Error fetching availabilities:', error);
      toast.error('Failed to fetch availabilities');
    }
  };

  const fetchSlots = async () => {
    try {
      const response = await axiosInstance.get('/api/slots/');
      const sortedSlots = response.data.sort((a, b) => {
        if (a.date !== b.date) {
          return new Date(a.date) - new Date(b.date);
        }
        return a.start_time.localeCompare(b.start_time);
      });
      setSlots(sortedSlots);
      console.log(" slots:", sortedSlots);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error('Failed to fetch slots');
    }
  };

  const handleDayClick = (day) => {
    setSelectedDay(day);
    const now = new Date();
    const currentDay = daysOfWeek[now.getDay()];
    
    if (day === currentDay) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const roundedMinute = Math.ceil(currentMinute / 30) * 30;
      const startHour = roundedMinute === 60 ? currentHour + 1 : currentHour;
      const startMinute = roundedMinute === 60 ? 0 : roundedMinute;
      
      setStartTime(`${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`);
      setEndTime(`${(startHour + 1).toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`);
    } else {
      setStartTime('09:00');
      setEndTime('17:00');
    }
    
    setIsCreating(true);
    setRepeatFor4Weeks(false);
  };

  const generateTimeOptions = (start = '00:00', end = '23:30', interval = 30) => {
    const options = [];
    let currentTime = new Date(`2000-01-01T${start}`);
    const endTime = new Date(`2000-01-01T${end}`);
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
    while (currentTime <= endTime) {
      const timeString = currentTime.toTimeString().slice(0, 5);
      const [hours, minutes] = timeString.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes;
  
      if (selectedDay === daysOfWeek[now.getDay()] && totalMinutes <= currentMinutes) {
        currentTime.setMinutes(currentTime.getMinutes() + interval);
        continue;
      }
  
      options.push(timeString);
      currentTime.setMinutes(currentTime.getMinutes() + interval);
    }
  
    return options;
  };
  // 4. Add a new function to check for existing availabilities:
const checkExistingAvailability = (day, start, end) => {
  return availabilities.some(a => 
    a.day_of_week === daysOfWeek.indexOf(day) &&
    a.start_time === start &&
    a.end_time === end
  );
};

  const handleStartTimeChange = (e) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);
    
    // Ensure end time is at least 30 minutes after start time
    const startDate = new Date(`2000-01-01T${newStartTime}`);
    startDate.setMinutes(startDate.getMinutes() + 30);
    const minEndTime = startDate.toTimeString().slice(0, 5);
    
    if (endTime <= newStartTime || endTime < minEndTime) {
      setEndTime(minEndTime);
    }
  };

  const handleSaveAvailability = async () => {
    try {
      const currentDate = new Date();
      const selectedDayIndex = daysOfWeek.indexOf(selectedDay);
      
      // Calculate the next occurrence of the selected day
      let nextOccurrence = new Date(currentDate);
      nextOccurrence.setDate(currentDate.getDate() + (selectedDayIndex + 7 - currentDate.getDay()) % 7);
      nextOccurrence.setHours(0, 0, 0, 0);
  
      const data = {
        day_of_week: selectedDayIndex,
        start_time: startTime,
        end_time: endTime,
        is_recurring: repeatFor4Weeks,
        mentor: currentUser.mentor_id,
        current_date: currentDate.toISOString(),
      };
  
      // Check for overlapping availabilities
      const overlappingAvailability = availabilities.find(a => 
        a.day_of_week === selectedDayIndex &&
        ((a.start_time <= startTime && startTime < a.end_time) ||
         (a.start_time < endTime && endTime <= a.end_time) ||
         (startTime <= a.start_time && a.end_time <= endTime))
      );
  
      if (overlappingAvailability) {
        toast.warn('This availability overlaps with an existing one. Please choose a different time slot.');
        return;
      }
  
      await axiosInstance.post('/api/availabilities/', data);
      toast.success('Availability saved successfully');
      fetchAvailabilities();
      fetchSlots();
      setIsCreating(false);
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error('Failed to save availability');
    }
  };
  


  const handleDeleteAvailability = async (availabilityId) => {
    try {
      await axiosInstance.delete(`/api/availabilities/${availabilityId}/`);
      toast.success('Availability deleted successfully');
      fetchAvailabilities();
      fetchSlots();
    } catch (error) {
      console.error('Error deleting availability:', error);
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
        console.log(error.response.data.error);
      } else {
        toast.error('Failed to delete availability. Please try again.');
      }
    }
  };

  const handleBlockSlot = async (slotId) => {
    try {
      await axiosInstance.post(`/api/slots/${slotId}/block/`);
      fetchSlots();
      toast.success('Slot blocked successfully');
    } catch (error) {
      console.error('Error blocking slot:', error);
      toast.error('Failed to block slot');
    }
  };

  const handleUnblockSlot = async (slotId) => {
    try {
      await axiosInstance.post(`/api/slots/${slotId}/unblock/`);
      fetchSlots();
      toast.success('Slot unblocked successfully');
    } catch (error) {
      console.error('Error unblocking slot:', error);
      toast.error('Failed to unblock slot');
    }
  };

  const groupSlotsByDate = (slots) => {
    return slots.reduce((acc, slot) => {
      const date = new Date(slot.date).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(slot);
      return acc;
    }, {});
  };

  const groupedSlots = groupSlotsByDate(slots);

  const toggleDateExpansion = (date) => {
    setExpandedDates(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  const filteredDates = Object.keys(groupedSlots).filter(date => 
    new Date(date) >= new Date(selectedDate).setHours(0,0,0,0)
  ).sort((a, b) => new Date(a) - new Date(b));

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Availability Management</h1>

        {/* Day selection buttons */}
        <div className="grid grid-cols-7 gap-4 mb-8">
          {daysOfWeek.map((day) => (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              className={`flex flex-col items-center py-4 px-2 rounded-lg transition-colors ${
                selectedDay === day
                  ? 'bg-blue-500 text-white'
                  : availabilities.some(a => a.day_of_week === daysOfWeek.indexOf(day))
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              <Calendar className={`mb-2 ${availabilities.some(a => a.day_of_week === daysOfWeek.indexOf(day)) ? 'text-green-500' : ''}`} />
              <span className="text-sm">{day.slice(0, 3)}</span>
              {availabilities.some(a => a.day_of_week === daysOfWeek.indexOf(day)) && (
                <CheckCircle className="text-green-500 mt-1" size={16} />
              )}
            </button>
          ))}
        </div>

        {/* Time slot input form */}
        {isCreating && (
          <div className="mb-8 bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">
              Add availability for {selectedDay}
            </h2>
            {checkExistingAvailability(selectedDay, startTime, endTime) && (
      <p className="text-yellow-600 mt-2">
        Warning: An availability for this day and time already exists.
      </p>
    )}
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center">
                <Clock className="mr-2 text-blue-500" />
                <select
                  value={startTime}
                  onChange={handleStartTimeChange}
                  className="border rounded p-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                >
                  {generateTimeOptions().map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              <span className="text-gray-500">to</span>
              <div className="flex items-center">
                <Clock className="mr-2 text-blue-500" />
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="border rounded p-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                >
                  {generateTimeOptions(startTime).filter(time => time > startTime).map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="repeatFor4Weeks"
                checked={repeatFor4Weeks}
                onChange={(e) => setRepeatFor4Weeks(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="repeatFor4Weeks" className="text-sm text-gray-700">
                Repeat for the next 4 weeks
              </label>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleSaveAvailability}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Display existing availability */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Your Availability</h2>
          {availabilities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availabilities.map((availability) => (
                <div key={availability.id} className="bg-white rounded-lg shadow-md p-4">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">{daysOfWeek[availability.day_of_week]}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="text-green-500 mr-2" />
                      <span className="text-gray-600">{availability.start_time.slice(0, 5)} - {availability.end_time.slice(0, 5)}</span>
                    </div>
                    <div>
                      <button
                        onClick={() => handleDeleteAvailability(availability.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    No availability set. Please select days and set your available hours for online consultations.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Display slots */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Upcoming Slots</h2>
          <div className="mb-4">
            <DatePicker
              selected={selectedDate}
              onChange={date => setSelectedDate(date)}
              dateFormat="MMMM d, yyyy"
              className="p-2 border rounded"
            />
          </div>
          {filteredDates.length > 0 ? (
            filteredDates.map(date => (
              <div key={date} className="mb-4 border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleDateExpansion(date)}
                  className="w-full bg-gray-200 p-4 text-left font-semibold flex justify-between items-center"
                >
                  <span>{new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  {expandedDates[date] ? <ChevronUp /> : <ChevronDown />}
                </button>
                {expandedDates[date] && (
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {groupedSlots[date].map((slot) => (
                      <div key={slot.id} className={`p-2 rounded-lg ${
                        slot.status === 'available' ? 'bg-green-50' :
                        slot.status === 'booked' ? 'bg-blue-50' : 'bg-red-50'
                      }`}>
                        <div className="flex flex-col items-center justify-between h-full">
                          <span className="text-sm font-medium">{slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}</span>
                          <span className="capitalize text-xs mt-1">{slot.status}</span>
                          {slot.status === 'available' && (
                            <button
                              onClick={() => handleBlockSlot(slot.id)}
                              className="bg-red-500 text-white px-2 py-1 rounded text-xs mt-2 w-full"
                            >
                              Block
                            </button>
                          )}
                          {slot.status === 'blocked' && (
                            <button
                              onClick={() => handleUnblockSlot(slot.id)}
                              className="bg-green-500 text-white px-2 py-1 rounded text-xs mt-2 w-full"
                            >
                              Unblock
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No upcoming slots available for the selected date.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleAvailability;