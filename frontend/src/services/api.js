import axios from 'axios';

const API_BASE = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const analyzeVehicleImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  
  const response = await api.post('/analyze-vehicle', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  
  return response.data;
};

export const analyzeBridgeSign = async (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  
  const response = await api.post('/analyze-bridge-sign', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  
  return response.data;
};

export const checkClearance = async (data) => {
  const response = await api.post('/check-clearance', data);
  return response.data;
};

export const planRoute = async (data) => {
  const response = await api.post('/plan-route', data);
  return response.data;
};

export const analyzeIncident = async (imageFile, vehicleHeight, bridgeClearance) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('vehicle_height', vehicleHeight);
  formData.append('bridge_clearance', bridgeClearance);
  
  const response = await api.post('/analyze-incident', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  
  return response.data;
};

export default api;