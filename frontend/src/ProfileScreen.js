import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import tw from 'twrnc';
import axios from 'axios';
import { fetchJobs } from './utils/JobService';
import API_BASE_URL from './Config';
import { downloadJobsAsPdf } from './utils/pdfDownloader';

export default function ProfileScreen() {
  const navigation = useNavigation();

  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalDealsThisMonth: 0,
    totalPendingPayments: 0,
    pendingPaymentsThisMonth: 0,
    totalMonthyPayments: 0,
  });

  const calculateStats = async () => {
    const jobs = await fetchJobs();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const customerSet = new Set();
    let totalPending = 0;
    let monthPending = 0;
    let monthDeals = 0;
    let monthPayments = 0;

    for (const job of jobs) {
      // Unique customers
      customerSet.add(`${job.customer_name}-${job.contact_number}`);

      const total = parseFloat(job.total_amount || 0);
      const advanced = parseFloat(job.advanced_amount || 0);
      const pending = total - advanced;
      totalPending += pending;

      // Check timestamps
      const timestamps = job.time_stamps || [];
      const hasThisMonthTimestamp = timestamps.some(ts => {
        const tsDate = new Date(ts.date);
        return tsDate.getMonth() === currentMonth && tsDate.getFullYear() === currentYear;
      });

      if (hasThisMonthTimestamp) {
        monthDeals++;
        monthPending += pending;
        monthPayments += total;
      }
    }

    setStats({
      totalCustomers: customerSet.size,
      totalDealsThisMonth: monthDeals,
      totalPendingPayments: totalPending,
      pendingPaymentsThisMonth: monthPending,
      totalMonthyPayments: monthPayments,
    });
  };

  useEffect(() => {
    calculateStats();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    navigation.replace('Login');
  };

  const handleDeleteOldJobs = async () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete old paid jobs?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              await axios.delete(`${API_BASE_URL}/jobs/delete/`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              Alert.alert('Success', 'Old jobs deleted.');
              calculateStats();  // Refresh stats
            } catch (err) {
              console.error(err);
              Alert.alert('Error', 'Failed to delete old jobs.');
            }
          }
        }
      ]
    );
  };


  return (
    <View style={tw`flex-1 bg-gray-100 p-6 pt-12`}>
      <Text style={tw`text-3xl font-bold text-blue-800 mb-8 text-center`}>Profile</Text>

      <View style={tw`bg-white p-4 rounded-lg shadow mb-4`}>
        <Text style={tw`text-lg font-semibold`}>Total Customers:</Text>
        <Text style={tw`text-xl text-blue-600`}>{stats.totalCustomers}</Text>
      </View>

      <View style={tw`bg-white p-4 rounded-lg shadow mb-4`}>
        <Text style={tw`text-lg font-semibold`}>Total Deals (This Month):</Text>
        <Text style={tw`text-xl text-green-600`}>{stats.totalDealsThisMonth}</Text>
      </View>

      <View style={tw`bg-white p-4 rounded-lg shadow mb-4`}>
        <Text style={tw`text-lg font-semibold`}>Total Pending Payments:</Text>
        <Text style={tw`text-xl text-red-600`}>₹{stats.totalPendingPayments}</Text>
      </View>

      <View style={tw`bg-white p-4 rounded-lg shadow mb-4`}>
        <Text style={tw`text-lg font-semibold`}>Pending Payments (This Month):</Text>
        <Text style={tw`text-xl text-orange-500`}>₹{stats.pendingPaymentsThisMonth}</Text>
      </View>

      <View style={tw`bg-white p-4 rounded-lg shadow mb-8`}>
        <Text style={tw`text-lg font-semibold`}>Total Job Bills (This Month):</Text>
        <Text style={tw`text-xl text-green-500`}>₹{stats.totalMonthyPayments}</Text>
      </View>

      <TouchableOpacity
        onPress={downloadJobsAsPdf}
        style={tw`bg-blue-500 p-4 rounded-lg mb-4`}
      >
        <Text style={tw`text-white text-center text-lg font-semibold`}>Download Jobs PDF</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleDeleteOldJobs}
        style={tw`bg-red-500 p-4 rounded-lg mb-4`}
      >
        <Text style={tw`text-white text-center text-lg font-semibold`}>Delete Old Jobs</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleLogout}
        style={tw`bg-gray-800 p-4 rounded-lg`}
      >
        <Text style={tw`text-white text-center text-lg font-semibold`}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
