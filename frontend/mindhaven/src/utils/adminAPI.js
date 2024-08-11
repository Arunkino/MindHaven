import axiosInstance from "./axiosConfig";


// Fetch pending mentors
const fetchPendingMentors = async () => {
  try {
    const response = await axiosInstance.get('/api/admin/pending_mentors/');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending mentors:', error);
    throw error;
  }
};

// Fetch approved mentors
const fetchApprovedMentors = async () => {
  try {
    const response = await axiosInstance.get('/api/admin/approved_mentors/');
    return response.data;
  } catch (error) {
    console.error('Error fetching approved mentors:', error);
    throw error;
  }
};

// Fetch users
const fetchUsers = async () => {
  try {
    const response = await axiosInstance.get('/api/admin/users/');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Approve mentor
const approveMentor = async (mentorId) => {
  try {
    const response = await axiosInstance.post(`/api/admin/${mentorId}/approve_mentor/`);
    return response.data;
  } catch (error) {
    console.error('Error approving mentor:', error);
    throw error;
  }
};

// Reject mentor
const rejectMentor = async (mentorId) => {
  try {
    await axiosInstance.post(`/api/admin/${mentorId}/reject_mentor/`);
  } catch (error) {
    console.error('Error rejecting mentor:', error);
    throw error;
  }
};

// Block user
const blockUser = async (userId) => {
  try {
    const response = await axiosInstance.post(`/api/admin/${userId}/block_user/`);
    return response.data;
  } catch (error) {
    console.error('Error blocking user:', error);
    throw error;
  }
};

// Unblock user
const unblockUser = async (userId) => {
  try {
    const response = await axiosInstance.post(`/api/admin/${userId}/unblock_user/`);
    return response.data;
  } catch (error) {
    console.error('Error unblocking user:', error);
    throw error;
  }
};

export { 
  fetchPendingMentors, 
  fetchApprovedMentors, 
  fetchUsers, 
  approveMentor, 
  rejectMentor, 
  blockUser, 
  unblockUser 
};