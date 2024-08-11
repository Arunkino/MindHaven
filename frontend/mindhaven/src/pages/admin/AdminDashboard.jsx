import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, User, Users, Clock } from 'lucide-react';
import { fetchApprovedMentors, fetchPendingMentors, fetchUsers, approveMentor, rejectMentor, blockUser, unblockUser } from '../../utils/adminAPI';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('pending-mentors');
  const [pendingMentors, setPendingMentors] = useState([]);
  const [approvedMentors, setApprovedMentors] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [pendingData, approvedData, usersData] = await Promise.all([
        fetchPendingMentors(),
        fetchApprovedMentors(),
        fetchUsers()
      ]);
      setPendingMentors(pendingData);
      setApprovedMentors(approvedData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setIsLoading(false);
  };

  const handleApproveMentor = async (mentor) => {
    try {
      await approveMentor(mentor.id);
      setApprovedMentors([...approvedMentors, mentor]);
      setPendingMentors(pendingMentors.filter(m => m.id !== mentor.id));
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error approving mentor:', error);
    }
  };

  const handleRejectMentor = async (mentorId) => {
    try {
      await rejectMentor(mentorId);
      setPendingMentors(pendingMentors.filter(m => m.id !== mentorId));
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error rejecting mentor:', error);
    }
  };

  const handleBlockUser = async (userId) => {
    try {
      await blockUser(userId);
      setUsers(users.map(u => u.id === userId ? {...u, is_active: false} : u));
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      await unblockUser(userId);
      setUsers(users.map(u => u.id === userId ? {...u, is_active: true} : u));
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-custom-bg"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-custom-text">Admin Dashboard</h1>
      <div className="mb-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('pending-mentors')}
            className={`px-4 py-2 rounded-md ${activeTab === 'pending-mentors' ? 'bg-custom-bg text-white' : 'bg-gray-200 text-custom-text'} hover:bg-custom-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-bg`}
          >
            <Clock className="w-4 h-4 mr-2 inline" />
            Pending Mentors
          </button>
          <button
            onClick={() => setActiveTab('approved-mentors')}
            className={`px-4 py-2 rounded-md ${activeTab === 'approved-mentors' ? 'bg-custom-bg text-white' : 'bg-gray-200 text-custom-text'} hover:bg-custom-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-bg`}
          >
            <CheckCircle className="w-4 h-4 mr-2 inline" />
            Approved Mentors
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-md ${activeTab === 'users' ? 'bg-custom-bg text-white' : 'bg-gray-200 text-custom-text'} hover:bg-custom-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-bg`}
          >
            <Users className="w-4 h-4 mr-2 inline" />
            Users
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        {activeTab === 'pending-mentors' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Pending Mentor Applications</h2>
            <p className="text-gray-600 mb-4">Review and approve mentor applications</p>
            {pendingMentors.length === 0 ? (
              <p className="text-center text-gray-500">No pending applications</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left py-2">Name</th>
                    <th className="text-left py-2">Email</th>
                    <th className="text-left py-2">Specialization</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingMentors.map((mentor) => (
                    <tr key={mentor.id}>
                      <td className="py-2">{mentor.user.first_name}</td>
                      <td className="py-2">{mentor.user.email}</td>
                      <td className="py-2">{mentor.specialization}</td>
                      <td className="py-2">
                        <button
                          onClick={() => {
                            setSelectedMentor(mentor);
                            setIsDialogOpen(true);
                          }}
                          className="bg-custom-bg text-white px-4 py-2 rounded hover:bg-custom-accent focus:outline-none focus:ring-2 focus:ring-custom-bg focus:ring-opacity-50"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'approved-mentors' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Approved Mentors</h2>
            <p className="text-gray-600 mb-4">List of all approved mentors</p>
            {approvedMentors.length === 0 ? (
              <p className="text-center text-gray-500">No approved mentors</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left py-2">Name</th>
                    <th className="text-left py-2">Email</th>
                    <th className="text-left py-2">Specialization</th>
                    <th className="text-left py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedMentors.map((mentor) => (
                    <tr key={mentor.id}>
                      <td className="py-2">{mentor.user.first_name}</td>
                      <td className="py-2">{mentor.user.email}</td>
                      <td className="py-2">{mentor.specialization}</td>
                      <td className="py-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approved
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Users</h2>
            <p className="text-gray-600 mb-4">Manage platform users</p>
            {users.length === 0 ? (
              <p className="text-center text-gray-500">No users found</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left py-2">Name</th>
                    <th className="text-left py-2">Email</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="py-2">{user.first_name}</td>
                      <td className="py-2">{user.email}</td>
                      <td className="py-2">
                        {user.is_active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="w-4 h-4 mr-1" />
                            Blocked
                          </span>
                        )}
                      </td>
                      <td className="py-2">
                        {user.is_active  ? (
                          <button
                            onClick={() => handleBlockUser(user.id)}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                          >
                            Block
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnblockUser(user.id)}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                          >
                            Unblock
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {isDialogOpen && selectedMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-2xl font-semibold mb-2">Mentor Application</h3>
            <p className="text-gray-600 mb-4">Review the mentor's application details</p>
            <div className="mt-4">
              <p><strong>Name:</strong> {selectedMentor.user.first_name}</p>
              <p><strong>Email:</strong> {selectedMentor.user.email}</p>
              <p><strong>Specialization:</strong> {selectedMentor.specialization}</p>
              <p><strong>Hourly Rate:</strong> ₹{selectedMentor.hourly_rate}</p>
              <p><strong>Qualifications:</strong> {selectedMentor.qualifications}</p>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => handleRejectMentor(selectedMentor.id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              >
                Reject
              </button>
              <button
                onClick={() => handleApproveMentor(selectedMentor)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;