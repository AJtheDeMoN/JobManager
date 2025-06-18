import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import tw from 'twrnc';
import axios from 'axios';
import API_BASE_URL from './Config'; // adjust if needed

export default function Signup() {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = async () => {
    if (!username || !password || !confirmPassword) {
      return Alert.alert("Error", "All fields are required.");
    }
    if (password !== confirmPassword) {
      return Alert.alert("Error", "Passwords do not match.");
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/signup/`, {
        username,
        password,
      });

      Alert.alert("Success", "Account created. Please log in.");
      navigation.navigate('Login');
    } catch (err) {
      const msg = err.response?.data?.error || "Signup failed. Try again.";
      Alert.alert("Error", msg);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={tw`flex-1`}>
      <View style={tw`flex-1 justify-center items-center bg-gray-100 p-6`}>
        <Text style={tw`text-3xl font-bold text-blue-500 mb-6`}>Sign Up</Text>

        <TextInput
          style={tw`w-full bg-white p-4 rounded-lg mb-4 border border-gray-300`}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
        
        <TextInput
          style={tw`w-full bg-white p-4 rounded-lg mb-4 border border-gray-300`}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          style={tw`w-full bg-white p-4 rounded-lg mb-4 border border-gray-300`}
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity style={tw`w-full bg-blue-500 p-4 rounded-lg`} onPress={handleSignup}>
          <Text style={tw`text-white text-center font-semibold`}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={tw`mt-4`}>
          <Text style={tw`text-blue-500`}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
