import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import tw from 'twrnc';

export default function CustomerJobs() {
  const route = useRoute();
  const navigation = useNavigation();
  const { customer, jobs: initialJobs } = route.params;

  const [jobs] = useState(
    [...initialJobs]
      .sort((a, b) => b.id - a.id)
      .map(job => ({
        ...job,
        pending_payment: parseFloat(job.total_amount) - parseFloat(job.advanced_amount),
      }))
  );

  const totalPending = jobs.reduce((sum, job) => sum + job.pending_payment, 0);

  const handleJobPress = (job) => {
    navigation.navigate('JobInfo', { job });
  };

  return (
    <View style={tw`flex-1 bg-gray-100 pt-12`}>
      <Text style={tw`text-2xl font-bold text-center text-blue-800 mb-1`}>
        {customer}'s Jobs
      </Text>
      <Text style={tw`text-lg text-center mb-4`}>
        Total Pending: ₹{totalPending.toFixed(2)}
      </Text>

      <FlatList
        data={jobs}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={tw`bg-white p-4 mb-2 mx-4 rounded-lg shadow`}
            onPress={() => handleJobPress(item)}
          >
            <Text style={tw`text-lg font-semibold`}>{item.job_name}</Text>
            <Text style={tw`text-gray-600`}>
              Remaining Payment: ₹{item.pending_payment.toFixed(2)}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}
