import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import tw from 'twrnc';

export default function Home() {
  const navigation = useNavigation();

  return (
    <View style={tw`flex-1 items-center justify-center bg-gray-100 p-6`}>
      {/* App Title */}
      <Text style={tw`text-4xl font-bold text-blue-800 mb-6`}>Ankur Press</Text>

      {/* Navigation Buttons */}
      <TouchableOpacity
        style={tw`w-full p-5 bg-white rounded-lg shadow-md mb-4`}
        onPress={() => navigation.navigate('JobList')}
      >
        <Text style={tw`text-xl font-semibold text-blue-700 text-center`}>Current Jobs</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={tw`w-full p-5 bg-white rounded-lg shadow-md mb-4`}
        onPress={() => navigation.navigate('PendingPayments')}
      >
        <Text style={tw`text-xl font-semibold text-red-500 text-center`}>Pending Payments</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={tw`w-full p-5 bg-white rounded-lg shadow-md mb-4`}
        onPress={() => navigation.navigate('CompletedJobs')}
      >
        <Text style={tw`text-xl font-semibold text-green-500 text-center`}>Completed Jobs</Text>
      </TouchableOpacity>

      {/* Profile Button */}
      <TouchableOpacity
        style={tw`w-full p-5 bg-white rounded-lg shadow-md`}
        onPress={() => navigation.navigate('Profile')}
      >
        <Text style={tw`text-xl font-semibold text-purple-600 text-center`}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
}
