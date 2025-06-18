// src/utils/jobService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import API_BASE_URL from '../Config';
import { Alert } from 'react-native';

export const fetchJobs = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/jobs/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 1000 // fail fast if server is asleep
    });

    const jobs = response.data;
    await AsyncStorage.setItem('cached_jobs', JSON.stringify(jobs)); // cache it
    return jobs;

  } catch (error) {
    console.warn("Using cached job data:", error?.message);
    const cached = await AsyncStorage.getItem('cached_jobs');
    return cached ? JSON.parse(cached) : [];
  }
};

export const updateJob = async (jobId, jobData) => {
  const PENDING_KEY = 'pending_updates';

  try {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.put(`${API_BASE_URL}/jobs/${jobId}/update/`, jobData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log("Job updated successfully:", response.data);

    // ✅ Update cached_jobs entry
    const cached = await AsyncStorage.getItem('cached_jobs');
    let jobs = cached ? JSON.parse(cached) : [];

    jobs = jobs.map(job => job.id === jobId ? response.data : job);
    await AsyncStorage.setItem('cached_jobs', JSON.stringify(jobs));

    return true;

  } catch (err) {
    console.warn("Job update failed, storing locally. Reason:", err?.response?.data || err.message);

    try {
      const existing = await AsyncStorage.getItem(PENDING_KEY);
      const pending = existing ? JSON.parse(existing) : [];
      pending.push({ jobId, jobData });
      await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(pending));

      // Update in cached_jobs optimistically
      const cached = await AsyncStorage.getItem('cached_jobs');
      let jobs = cached ? JSON.parse(cached) : [];

      jobs = jobs.map(job => job.id === jobId ? { ...job, ...jobData } : job);
      await AsyncStorage.setItem('cached_jobs', JSON.stringify(jobs));

    } catch (e) {
      console.error("Failed to store update locally:", e);
    }

    return false;
  }
};

export const syncPendingUpdates = async () => {
  const PENDING_KEY = 'pending_updates';
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      console.warn("No token found, skipping update sync.");
      return;
    }

    const storedUpdates = await AsyncStorage.getItem(PENDING_KEY);
    const pendingUpdates = storedUpdates ? JSON.parse(storedUpdates) : [];
    if (pendingUpdates.length === 0) return;

    const successfullySynced = [];

    for (let update of pendingUpdates) {
      try {
        const { jobId, jobData } = update;
        await axios.put(`${API_BASE_URL}/jobs/${jobId}/update/`, jobData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        console.log("Synced job update:", jobId);
        successfullySynced.push(update);
        // Update in cached_jobs
        const cached = await AsyncStorage.getItem('cached_jobs');
        let jobs = cached ? JSON.parse(cached) : [];
        jobs = jobs.map(j => j.id === jobId ? { ...j, ...jobData } : j);
        await AsyncStorage.setItem('cached_jobs', JSON.stringify(jobs));
      } catch (err) {
        console.warn("Failed to sync job update:", update, err?.response?.data || err.message);
      }
    }

    // Remove successfully synced updates
    const remaining = pendingUpdates.filter(u => !successfullySynced.includes(u));
    await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(remaining));

  } catch (err) {
    console.error("Error syncing pending updates:", err.message || err);
  }
};

const PENDING_KEY = 'pending_jobs';

export const addJob = async (jobData) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.post(`${API_BASE_URL}/add-job/`, jobData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    console.log("Job synced successfully:", response.data);

    // Append new job to cached_jobs
    const cached = await AsyncStorage.getItem('cached_jobs');
    const jobs = cached ? JSON.parse(cached) : [];
    jobs.push(response.data); // use response from backend
    await AsyncStorage.setItem('cached_jobs', JSON.stringify(jobs));

  } catch (err) {
    console.warn("Job save failed, saving locally. Reason:", err?.response?.data || err.message);

    try {
      const existing = await AsyncStorage.getItem(PENDING_KEY);
      const pendingJobs = existing ? JSON.parse(existing) : [];
      const cached = await AsyncStorage.getItem('cached_jobs');
      const jobs = cached ? JSON.parse(cached) : [];

      // ⏱️ Add created_at
      const now = new Date().toISOString();

      // 🔢 Calculate new temp id (max id in cached + 1)
      const maxId = jobs.reduce((max, job) => Math.max(max, job.id || 0), 0);
      const tempId = maxId + 1;

      const localJob = {
        ...jobData,
        id: tempId,
        created_at: now
      };

      // Store to pending_jobs
      pendingJobs.push(localJob);
      await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(pendingJobs));

      // Append to cached_jobs
      jobs.push(localJob);
      await AsyncStorage.setItem('cached_jobs', JSON.stringify(jobs));

    } catch (e) {
      console.error("Failed to store job locally:", e);
    }
  }
};


export const syncPendingJobs = async () => {
  console.log("here2");

//    // 🧹 Clear stored pending jobs (for dev/testing)
//   await AsyncStorage.removeItem(PENDING_KEY);
//   console.log("Cleared all pending jobs from AsyncStorage.");
//   return;

  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      console.warn("No token found, cannot sync");
      return;
    }

    const storedJobs = await AsyncStorage.getItem(PENDING_KEY);
    const pendingJobs = storedJobs ? JSON.parse(storedJobs) : [];
    console.log("Pending jobs to sync:", pendingJobs);
    if (pendingJobs.length === 0) {
      console.log("No pending jobs to sync.");
      return;
    }

    const successfullySynced = [];

    for (let job of pendingJobs) {
      try {
        const response = await axios.post(`${API_BASE_URL}/add-job/`, job, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        console.log("Synced one job:", response.data);
        successfullySynced.push(job);
        // Add to cached_jobs
        const cached = await AsyncStorage.getItem('cached_jobs');
        const jobs = cached ? JSON.parse(cached) : [];
        jobs.push(response.data);
        await AsyncStorage.setItem('cached_jobs', JSON.stringify(jobs));

      } catch (err) {
        console.warn("Sync failed for job:", job, "Reason:", err?.response?.data || err.message);
      }
    }

    // Remove synced jobs from pending
    const remainingJobs = pendingJobs.filter(job => !successfullySynced.includes(job));
    await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(remainingJobs));

  } catch (err) {
    console.error("Global sync failed. Reason:", err.message || err);
  }
};

export const deleteJob = async (jobId) => {
  return new Promise((resolve) => {
    Alert.alert(
      'Delete Job',
      'Are you sure you want to delete this job?',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');

              // DELETE from backend
              await axios.delete(`${API_BASE_URL}/jobs/${jobId}/delete/`, {
                headers: { Authorization: `Bearer ${token}` }
              });

              // Update cached_jobs
              const cached = await AsyncStorage.getItem('cached_jobs');
              let jobs = cached ? JSON.parse(cached) : [];

              jobs = jobs.filter(job => job.id !== jobId);
              await AsyncStorage.setItem('cached_jobs', JSON.stringify(jobs));

              Alert.alert('Success', 'Job deleted successfully.');
              resolve(true);

            } catch (error) {
              console.error("Failed to delete job:", error?.response?.data || error.message);
              Alert.alert('Error', 'Failed to delete job.');
              resolve(false);
            }
          },
        },
      ]
    );
  });
};
