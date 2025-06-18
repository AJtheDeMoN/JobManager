import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import tw from 'twrnc';
import { addJob, fetchJobs } from './utils/JobService';

export default function AddJob() {
  const navigation = useNavigation();

  const [jobName, setJobName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [jobDetails, setJobDetails] = useState('');

  const [timestamps, setTimestamps] = useState([
    { id: 'proof', label: 'Proof', date: new Date(), showPicker: false },
    { id: 'delivery', label: 'Delivery', date: new Date(), showPicker: false }
  ]);

  const [allCustomers, setAllCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    const load = async () => {
      const jobs = await fetchJobs();
      const pairs = new Map();
      jobs.forEach(j => {
        const key = `${j.customer_name}-${j.contact_number}`;
        if (!pairs.has(key)) {
          pairs.set(key, { name: j.customer_name, number: j.contact_number });
        }
      });
      setAllCustomers(Array.from(pairs.values()));
    };
    load();
  }, []);

  const filteredCustomers = allCustomers.filter(
    c => c.name.toLowerCase().includes(search.toLowerCase()) || c.number.includes(search)
  );

  const handleSelectCustomer = (c) => {
    setCustomerName(c.name);
    setContactNumber(c.number);
    setSelectedCustomer(c);
    setShowDropdown(false);
  };

  const showDatePicker = (id) => {
    setTimestamps(timestamps.map(ts => ts.id === id ? { ...ts, showPicker: true } : ts));
  };

  const onDateChange = (event, selectedDate, id) => {
    setTimestamps(timestamps.map(ts =>
      ts.id === id ? { ...ts, date: selectedDate || ts.date, showPicker: false } : ts
    ));
  };

  const submitJob = async () => {
    if (!timestamps.length) {
      Alert.alert('Error', 'Please add at least one progress timestamp.');
      return;
    }
    if (!jobName || !customerName || !contactNumber || !totalAmount || !advanceAmount || !jobDetails) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    if (parseFloat(advanceAmount) > parseFloat(totalAmount)) {
      Alert.alert('Error', 'Advance cannot exceed total.');
      return;
    }

    const newJob = {
      job_name: jobName,
      customer_name: customerName,
      contact_number: contactNumber,
      total_amount: parseFloat(totalAmount),
      advanced_amount: parseFloat(advanceAmount),
      job_details: jobDetails,
      time_stamps: timestamps.map(ts => ({
        label: ts.label,
        date: ts.date.toISOString()
      }))
    };

    await addJob(newJob);
    Alert.alert('Success', 'Job submitted.');
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={tw`flex-1 bg-gray-100 mt-12`}>
      <ScrollView contentContainerStyle={tw`p-4`}>
        <Text style={tw`text-2xl font-bold text-blue-800 text-center mb-4`}>Add Job</Text>

        {/* Dropdown Search */}
        <TouchableOpacity
          onPress={() => setShowDropdown(true)}
          style={tw`bg-blue-100 p-3 rounded-lg mb-2`}
        >
          <Text style={tw`text-blue-800 text-lg text-center`}>
            {selectedCustomer ? `${selectedCustomer.name}\n📞 ${selectedCustomer.number}` : 'Select Existing Customer'}
          </Text>
        </TouchableOpacity>

        <Modal visible={showDropdown} transparent animationType="slide">
          <View style={tw`flex-1 bg-white p-4`}>
            <TextInput
              style={tw`bg-gray-100 rounded-lg mb-2 text-lg mt-12 px-3 py-3`}
              placeholder="Search name or number"
              value={search}
              onChangeText={setSearch}
            />
            <TouchableOpacity onPress={() => setShowDropdown(false)} style={tw`mb-2`}>
              <Text style={tw`text-red-600 text-center text-lg`}>✖ Close</Text>
            </TouchableOpacity>
            <FlatList
              data={filteredCustomers}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelectCustomer(item)}
                  style={tw`p-4 border-b border-gray-300`}
                >
                  <Text style={tw`text-lg font-semibold`}>{item.name}</Text>
                  <Text style={tw`text-base text-gray-600`}>{item.number}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Modal>

        <TextInput
          style={tw`p-3 bg-white rounded-lg border border-gray-300 mb-2`}
          placeholder="Customer Name"
          value={customerName}
          onChangeText={setCustomerName}
          editable={!selectedCustomer}
        />

        <TextInput
          style={tw`p-3 bg-white rounded-lg border border-gray-300 mb-2`}
          placeholder="Contact Number"
          keyboardType="phone-pad"
          value={contactNumber}
          onChangeText={setContactNumber}
          editable={!selectedCustomer}
        />

        <TextInput
          style={tw`p-3 bg-white rounded-lg border border-gray-300 mb-2`}
          placeholder="Job Name"
          value={jobName}
          onChangeText={setJobName}
        />

        <TextInput
          style={tw`p-3 bg-white rounded-lg border border-gray-300 mb-2`}
          placeholder="Total Amount"
          keyboardType="numeric"
          value={totalAmount}
          onChangeText={setTotalAmount}
        />

        <TextInput
          style={tw`p-3 bg-white rounded-lg border border-gray-300 mb-2`}
          placeholder="Advance Amount"
          keyboardType="numeric"
          value={advanceAmount}
          onChangeText={setAdvanceAmount}
        />

        <TextInput
          style={tw`p-3 bg-white rounded-lg border border-gray-300 mb-2 h-20`}
          placeholder="Job Details"
          multiline
          value={jobDetails}
          onChangeText={setJobDetails}
        />

        <Text style={tw`text-lg font-semibold text-blue-800 mt-2 mb-2`}>Timestamps</Text>
        {timestamps.map((item) => (
          <View key={item.id} style={tw`bg-white p-3 rounded-lg border border-gray-300 mb-2`}>
            <Text style={tw`mb-2 font-semibold`}>{item.label}</Text>
            <TouchableOpacity
              onPress={() => showDatePicker(item.id)}
              style={tw`p-2 bg-blue-500 rounded-md`}
            >
              <Text style={tw`text-white text-center`}>{item.date.toLocaleString()}</Text>
            </TouchableOpacity>
            {item.showPicker && (
              <DateTimePicker
                value={item.date}
                mode="datetime"
                display="default"
                onChange={(event, selectedDate) => onDateChange(event, selectedDate, item.id)}
              />
            )}
          </View>
        ))}
      </ScrollView>

      <View style={tw`flex-row justify-between items-center px-4 mb-4`}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-3 bg-red-500 rounded-lg w-[48%]`}>
          <Text style={tw`text-white text-center text-lg`}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={submitJob} style={tw`p-3 bg-blue-600 rounded-lg w-[48%]`}>
          <Text style={tw`text-white text-center text-lg`}>Submit</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
