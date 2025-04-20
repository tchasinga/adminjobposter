/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

const API_BASE_URL = '/api';

export const fetchJobs = async (poll = false) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/jobs`, { 
      params: { poll },
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
};

export const createJob = async (jobData: any) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/jobs`, jobData);
    return response.data;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
};

export const updateJob = async (id: string, jobData: any) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/jobs/${id}`, jobData);
    return response.data;
  } catch (error) {
    console.error('Error updating job:', error);
    throw error;
  }
};



export const closeOrDeleteJob = async (id: string, action: 'close' | 'delete') => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/jobs/${id}`, { 
      params: { action } 
    });
    return response.data;
  } catch (error) {
    console.error(`Error ${action}ing job:`, error);
    throw error;
  }
};