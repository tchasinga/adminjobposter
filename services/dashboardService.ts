import axios from 'axios';

const API_BASE_URL = '/api';

export const fetchDashboardStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/dashboard/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export const fetchApplicantsChartData = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/dashboard/applicants-chart`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching applicants chart data:', error);
    throw error;
  }
};

export const fetchJobsChartData = async () => {
  try {
    const response = await axios.get(`/api/dashboard/jobs-chart`);
    return response.data;
  } catch (error) {
    console.error('Error fetching jobs chart data:', error);
    throw error;
  }
};