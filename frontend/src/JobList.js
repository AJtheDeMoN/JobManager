import React, { useState, useEffect, useCallback} from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';
import { fetchJobs } from './utils/JobService';

export default function JobList() {
  const navigation = useNavigation();
  const [jobs, setJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortedJobs, setSortedJobs] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const loadJobs = async () => {
        const jobData = await fetchJobs();
        const incompleteJobs = jobData.filter(job => job.completed === false); // ✅ filter
        setJobs(incompleteJobs);
        setSortedJobs(incompleteJobs);
      };
      loadJobs();
    }, [])
  );

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = jobs.filter(job =>
      job.job_name.toLowerCase().includes(text.toLowerCase()) ||
      job.customer_name.toLowerCase().includes(text.toLowerCase())
    );
    setSortedJobs(filtered);
  };

  const handleSort = (key) => {
    const sorted = [...sortedJobs].sort((b, a) => {
      if (key === 'created_at') {
        return new Date(a.created_at) - new Date(b.created_at);
      }
      if (key === 'delivery_date') {
        const getDate = job => {
          const delivery = job.time_stamps.find(ts => ts.label.toLowerCase().includes('delivery'));
          return delivery ? new Date(delivery.date) : new Date(0);
        };
        return getDate(a) - getDate(b);
      }
    });
    setSortedJobs(sorted);
  };

  const handleJobPress = (job) => {
    navigation.navigate('JobInfo', { job });
  };

  const formatDate = date => new Date(date).toLocaleString();

  const getTimestampLabelDate = (time_stamps, label) => {
    const found = time_stamps.find(ts => ts.label.toLowerCase().includes(label));
    return found ? formatDate(found.date) : 'N/A';
  };

  return (
    <View style={tw`flex-1 bg-gray-100 mt-12`}>
      <Text style={tw`text-4xl font-bold text-blue-800 text-center mb-2`}>Ankur Press</Text>

      <TextInput
        style={tw`p-4 bg-white rounded-lg mx-4 border border-gray-300`}
        placeholder="Search by Job Name or Customer"
        value={searchQuery}
        onChangeText={handleSearch}
      />

      <View style={tw`flex-row justify-between mx-4 mt-2 mb-4`}>
        <TouchableOpacity onPress={() => handleSort('created_at')} style={tw`p-2 bg-blue-800 rounded`}>
          <Text style={tw`text-white`}>Sort by Creation Date</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleSort('delivery_date')} style={tw`p-2 bg-green-500 rounded`}>
          <Text style={tw`text-white`}>Sort by Delivery Date</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortedJobs}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={tw`bg-white p-4 mb-4 mx-4 rounded-lg shadow-md`}
            onPress={() => handleJobPress(item)}
          >
            <Text style={tw`text-xl font-semibold text-blue-800`}>{item.job_name}</Text>
            <Text style={tw`text-sm text-gray-600`}>Customer: {item.customer_name}</Text>
            <Text style={tw`text-sm text-gray-500`}>Created: {formatDate(item.created_at)}</Text>
            <Text style={tw`text-sm text-gray-500`}>Proof: {getTimestampLabelDate(item.time_stamps, 'proof')}</Text>
            <Text style={tw`text-sm text-gray-500`}>Delivery: {getTimestampLabelDate(item.time_stamps, 'delivery')}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id.toString()}
      />

      <TouchableOpacity
        style={tw`absolute bottom-6 right-6 bg-blue-800 w-16 h-16 rounded-full flex items-center justify-center shadow-lg`}
        onPress={() => navigation.navigate('AddJob')}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}
