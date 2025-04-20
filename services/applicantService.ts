import axios from 'axios';

const API_BASE_URL = '/api';

export const fetchApplicants = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/applicants`, { 
      params,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching applicants:', error);
    throw error;
  }
};

export const fetchApplicantDetails = async (_id: string) => {
  try {
    const response = await axios.get(`http://localhost:3000/api/applicants/${_id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching applicant details:', error);
    throw error;
  }
};

export const updateApplicantStatus = async (id: string, status: string) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/applicants/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating applicant status:', error);
    throw error;
  }
};

export const exportApplicants = async (format = 'csv') => {
  try {
    const response = await axios.get(`${API_BASE_URL}/applicants/export`, {
      params: { format },
      responseType: format === 'pdf' ? 'blob' : 'arraybuffer'
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting applicants:', error);
    throw error;
  }
};