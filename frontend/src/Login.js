import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import tw from 'twrnc';
import API_BASE_URL from './Config';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';

export default function Login() {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
  if (!username || !password) {
    Alert.alert("Error", "Username and password are required.");
    return;
  }
  const lowerUsername = username.toLowerCase();
  console.log("Attempting login with username:", username);

  try {
    const response = await axios.post(
      `${API_BASE_URL}/signin/`,
      { username: lowerUsername, password }
    );

    console.log("Response from server:", response.data);

    if (!response.data.access) {
      Alert.alert("Login Failed", "No access token received.");
      return;
    }

    await AsyncStorage.setItem('token', response.data.access);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user || {}));

    Alert.alert("Success", "Login successful");
    navigation.navigate('Home');
  } catch (error) {
    console.error("Login error:", error);
    Alert.alert(
      "Login Failed",
      error?.response?.data?.error ||
      error?.message ||
      "Unknown error occurred"
    );
  }
};



  return (
  <KeyboardAvoidingView
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    style={tw`flex-1`}
  >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        contentContainerStyle={tw`flex-grow justify-center items-center bg-gray-100 p-6`}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={tw`text-3xl font-bold text-blue-500 mb-6`}>Login</Text>

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

        <TouchableOpacity
          style={tw`w-full bg-blue-500 p-4 rounded-lg`}
          onPress={handleLogin}
        >
          <Text style={tw`text-white text-center font-semibold`}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Signup')}
          style={tw`mt-4`}
        >
          <Text style={tw`text-blue-500`}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </ScrollView>
    </TouchableWithoutFeedback>
  </KeyboardAvoidingView>
);
}
