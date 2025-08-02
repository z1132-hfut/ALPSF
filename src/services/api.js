import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

export const listL1Graphs = async () => {
  const response = await axios.get(`${API_BASE_URL}/list_11`);
  return response.data;
};

export const getL1Graph = async (keyword) => {
  const response = await axios.get(`${API_BASE_URL}/get_graph_11`, {
    params: { keyword }
  });
  return response.data;
};

export const createL1Graph = async (keyword) => {
  const response = await axios.get(`${API_BASE_URL}/create_graph_11`, {
    params: { keyword }
  });
  return response.data;
};

export const getL2Graph = async (keyword) => {
  const response = await axios.get(`${API_BASE_URL}/get_graph_12`, {
    params: { keyword }
  });
  return response.data;
};

export const createL2Graph = async (keyword, parentId) => {
  const response = await axios.get(`${API_BASE_URL}/create_graph_12`, {
    params: { keyword, parent_id: parentId }
  });
  return response.data;
};

export const getTaskStatus = async (taskId) => {
  const response = await axios.get(`${API_BASE_URL}/task_status`, {
    params: { task_id: taskId }
  });
  return response.data;
};

export const streamChat = async (prompt, level, contextId = null) => {
  if (!['level1', 'level2'].includes(level)) {
    throw new Error('Level must be either "level1" or "level2"');
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/stream_chat`, {
      prompt_request: prompt,
      level
    }, {
      params: contextId ? { context_id: contextId } : {},
      responseType: 'stream'
    });
    return response.data;
  } catch (error) {
    console.error('Stream chat error:', error);
    throw error;
  }
};

export const pollTaskStatus = async (taskId) => {
  return new Promise((resolve) => {
    const interval = setInterval(async () => {
      const status = await getTaskStatus(taskId);
      if (status.completed || status.error) {
        clearInterval(interval);
        resolve(status);
      }
    }, 5000);
  });
};