import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Switch } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import tw from 'twrnc';
import { updateJob } from './utils/JobService';
import {
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

export default function JobInfo() {
  const navigation = useNavigation();
  const route = useRoute();
  const passedJob = route.params?.job;

  const [job, setJob] = useState(passedJob);
  const [editMode, setEditMode] = useState(false);
  const [editedJob, setEditedJob] = useState(passedJob);
  const [showPickerIndex, setShowPickerIndex] = useState(null);

  const handleDateChange = (event, selectedDate, index) => {
    if (selectedDate) {
      const updatedStamps = [...editedJob.time_stamps];
      updatedStamps[index].date = selectedDate.toISOString();
      setEditedJob({ ...editedJob, time_stamps: updatedStamps });
    }
    setShowPickerIndex(null);
  };

  const handleSave = async () => {
    if (parseFloat(editedJob.advanced_amount) > parseFloat(editedJob.total_amount)) {
      Alert.alert(
        "Invalid Entry",
        "Advance amount cannot be greater than total amount."
      );
      return; // ❌ Prevent saving
    }

    const result = await updateJob(job.id, editedJob);
    if (result) {
      setJob(editedJob);
      setEditMode(false);
      Alert.alert("Success", "Job updated successfully.");
    } else {
      Alert.alert("Saved Offline", "Changes saved locally and will sync later.");
    }
  };

  return (
    <KeyboardAvoidingView
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    style={tw`flex-1`}
  >
    <ScrollView style={tw`flex-1 bg-gray-100 p-4 mt-12`}>
      <Text style={tw`text-3xl font-bold text-blue-800 mb-2`}>{job.job_name}</Text>
      <Text style={tw`text-lg text-gray-700 mb-4`}>Customer: {job.customer_name}</Text>

      {/* Contact and Payment Info */}
      <View style={tw`bg-white p-4 rounded-lg shadow-md mb-4`}>
        <Text style={tw`text-lg`}>Contact: {job.contact_number}</Text>
        <Text style={tw`text-lg text-green-700`}>Total: ₹{job.total_amount}</Text>
        <Text style={tw`text-lg text-red-500`}>Advance: ₹{job.advanced_amount}</Text>
        <Text style={tw`text-lg text-gray-800`}>Completed: {job.completed ? '✅ Yes' : '❌ No'}</Text>
      </View>

      {/* Job Details */}
      <View style={tw`bg-white p-4 rounded-lg shadow-md mb-4`}>
        <Text style={tw`text-lg font-semibold`}>Details:</Text>
        <Text>{job.job_details}</Text>
      </View>

      {/* Timestamps */}
      <View style={tw`bg-white p-4 rounded-lg shadow-md mb-4`}>
        <Text style={tw`text-lg font-semibold mb-2`}>Timestamps</Text>
        {job.time_stamps.map((ts, index) => (
          <View key={index} style={tw`mb-2`}>
            <Text style={tw`text-blue-800 font-bold`}>{ts.label}</Text>
            <Text>{new Date(ts.date).toLocaleString()}</Text>
            {editMode && (
              <>
                <TouchableOpacity
                  onPress={() => setShowPickerIndex(index)}
                  style={tw`mt-1 p-2 bg-blue-600 rounded`}
                >
                  <Text style={tw`text-white text-center`}>Edit Date</Text>
                </TouchableOpacity>
                {showPickerIndex === index && (
                  <DateTimePicker
                    value={new Date(ts.date)}
                    mode="datetime"
                    display="default"
                    onChange={(e, date) => handleDateChange(e, date, index)}
                  />
                )}
              </>
            )}
          </View>
        ))}
      </View>

      {/* Edit Mode Fields */}
      {editMode ? (
        <View>
          <TextInput
            style={tw`p-2 border rounded mb-2`}
            value={editedJob.job_name}
            onChangeText={text => setEditedJob({ ...editedJob, job_name: text })}
          />
          <TextInput
            style={tw`p-2 border rounded mb-2`}
            value={editedJob.customer_name}
            onChangeText={text => setEditedJob({ ...editedJob, customer_name: text })}
          />
          <TextInput
            style={tw`p-2 border rounded mb-2`}
            value={editedJob.contact_number}
            onChangeText={text => setEditedJob({ ...editedJob, contact_number: text })}
          />
          <TextInput
            style={tw`p-2 border rounded mb-2`}
            value={editedJob.total_amount.toString()}
            keyboardType="numeric"
            onChangeText={text => setEditedJob({ ...editedJob, total_amount: parseFloat(text) || 0 })}
          />
          <TextInput
            style={tw`p-2 border rounded mb-2`}
            value={editedJob.advanced_amount.toString()}
            keyboardType="numeric"
            onChangeText={text => setEditedJob({ ...editedJob, advanced_amount: parseFloat(text) || 0 })}
          />
          <TextInput
            style={tw`p-2 border rounded mb-2`}
            value={editedJob.job_details}
            onChangeText={text => setEditedJob({ ...editedJob, job_details: text })}
          />
          {/* Completed Toggle */}
          <View style={tw`flex-row items-center mb-4`}>
            <Text style={tw`text-lg mr-4`}>Completed:</Text>
            <Switch
              value={editedJob.completed}
              onValueChange={(val) => setEditedJob({ ...editedJob, completed: val })}
            />
          </View>

          <TouchableOpacity
            style={tw`p-3 bg-blue-700 rounded mb-4`}
            onPress={handleSave}
          >
            <Text style={tw`text-white text-center`}>Save</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={tw`p-3 bg-yellow-500 rounded mb-4`}
          onPress={() => setEditMode(true)}
        >
          <Text style={tw`text-white text-center`}>Edit</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={tw`p-3 bg-gray-400 rounded-lg mb-48`}
      >
        <Text style={tw`text-white text-center font-bold`}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}
