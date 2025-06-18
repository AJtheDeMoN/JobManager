import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Switch } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import tw from 'twrnc';
import { fetchJobs } from './utils/JobService';
import { deleteJob } from './utils/JobService';

export default function CompletedJobs() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [completedJobs, setCompletedJobs] = useState([]);
  const [isListView, setIsListView] = useState(false);
  const [filteredData, setFilteredData] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const loadJobs = async () => {
        try {
          const jobs = await fetchJobs();
          const completedWithPending = jobs.filter(
            job =>
              job.completed === true &&
              parseFloat(job.total_amount) - parseFloat(job.advanced_amount) === 0
          );
          setCompletedJobs(completedWithPending);
          setFilteredData(groupByCustomer(completedWithPending));
        } catch (error) {
          console.error('Failed to fetch jobs:', error);
        }
      };
      loadJobs();
    }, [])
  );

  useEffect(() => {
    if (isListView) {
      const filtered = completedJobs.filter(job =>
        job.job_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      const filteredCustomers = completedJobs
        .filter(job => job.customer_name.toLowerCase().includes(searchQuery.toLowerCase()))
        .map(job => job.customer_name);
      const uniqueCustomers = [...new Set(filteredCustomers)];
      setFilteredData(uniqueCustomers);
    }
  }, [searchQuery, isListView, completedJobs]);

  const groupByCustomer = (jobs) => {
    return [...new Set(jobs.map(job => job.customer_name))];
  };

  const formatDate = date => new Date(date).toLocaleString();

  const getTimestampLabelDate = (time_stamps, label) => {
    const found = time_stamps?.find(ts => ts.label.toLowerCase().includes(label));
    return found ? formatDate(found.date) : 'N/A';
  };

  return (
    <View style={tw`flex-1 bg-gray-100 pt-12`}>
      <Text style={tw`text-4xl font-bold text-blue-800 text-center mb-2`}>Ankur Press</Text>

      {/* Toggle View */}
      <View style={tw`flex-row justify-between items-center px-4 mb-2`}>
        <Text style={tw`text-lg font-semibold`}>Group by Customer</Text>
        <Switch value={isListView} onValueChange={setIsListView} />
        <Text style={tw`text-lg font-semibold`}>Show Jobs</Text>
      </View>

      {/* Search Bar */}
      <TextInput
        style={tw`p-4 bg-white rounded-lg mx-4 border border-gray-300 mb-2`}
        placeholder={isListView ? 'Search Job or Customer' : 'Search Customer'}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* List Rendering */}
      <FlatList
        data={filteredData}
        keyExtractor={(item, index) =>
          isListView ? item?.id?.toString() ?? index.toString() : item?.toString() ?? index.toString()
        }
        renderItem={({ item }) => {
          if (isListView) {
            return (
              <View style={tw`bg-white mb-4 mx-4 rounded-lg shadow-md`}>
                <TouchableOpacity
                  style={tw`p-4`}
                  onPress={() => navigation.navigate('JobInfo', { job: item })}
                >
                  <Text style={tw`text-xl font-semibold text-blue-800`}>
                    {item?.job_name ?? 'Untitled Job'}
                  </Text>
                  <Text style={tw`text-sm text-gray-600`}>
                    Customer: {item?.customer_name ?? 'Unknown'}
                  </Text>
                  <Text style={tw`text-sm text-gray-500`}>
                    Created: {formatDate(item?.created_at)}
                  </Text>
                  <Text style={tw`text-sm text-gray-500`}>
                    Delivery: {getTimestampLabelDate(item?.time_stamps ?? [], 'delivery')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={tw`absolute top-2 right-2 bg-red-100 px-2 py-1 rounded`}
                  onPress={async () => {
                    const deleted = await deleteJob(item.id);
                    if (deleted) {
                      await loadJobs();  // refresh job list
                    }
                  }}
                >
                  <Text style={tw`text-red-600 font-bold`}>✖</Text>
                </TouchableOpacity>
              </View>
            );
          } else {
            const customerName = typeof item === 'string' ? item : item?.customer_name;
            return (
              <TouchableOpacity
                style={tw`bg-white p-4 mb-4 mx-4 rounded-lg shadow-md`}
                onPress={() => {
                  const customerJobs = completedJobs.filter(job => job.customer_name === customerName);
                  navigation.navigate('CustomerJobs', {
                    customer: customerName,
                    jobs: customerJobs,
                  });
                }}
              >
                <Text style={tw`text-xl font-semibold text-blue-800`}>
                  {customerName ?? 'Unknown Customer'}
                </Text>
              </TouchableOpacity>
            );
          }
        }}
      />
    </View>

  );
}
