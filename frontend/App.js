import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Login from './src/Login';
import Signup from './src/Signup';
import JobList from './src/JobList';
import Home from './src/HomePage';
import PendingPayments from './src/PendingPayments';
import CompletedJobs from './src/CompletedJobs';
import AddJob from './src/AddJob';
import JobInfo from './src/JobInfo';
import CustomerJobs from './src/CustomerJobs';
import ProfileScreen from './src/ProfileScreen';

import { syncPendingJobs } from './src/utils/JobService';
import { syncPendingUpdates } from './src/utils/JobService'; // new import for updates
import { useNavigationContainerRef } from '@react-navigation/native';

const Stack = createStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);
  const navRef = useNavigationContainerRef();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const userToken = await AsyncStorage.getItem('token'); // Get stored token
        setInitialRoute(userToken ? 'Home' : 'Login'); // If token exists, go to Home; else Login
      } catch (error) {
        console.error('Error checking user authentication:', error);
        setInitialRoute('Login'); // Default to login if an error occurs
      }
    };
    
    checkUser();
  }, []);

  useEffect(() => {
    // Sync both jobs and updates
    syncPendingJobs(); // already defined elsewhere
    syncPendingUpdates(); // new one

    console.log("Syncing jobs and updates on app start");

    const interval = setInterval(() => {
      syncPendingJobs();
      syncPendingUpdates();
    }, 60000); // every minute

    return () => clearInterval(interval); // cleanup on unmount
  }, []);


  if (initialRoute === null) return null; // Prevent rendering until authentication check is done

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        <Stack.Screen name="JobList" component={JobList} options={{ headerShown: false }} />
        <Stack.Screen name="PendingPayments" component={PendingPayments} options={{ headerShown: false }} />
        <Stack.Screen name="CompletedJobs" component={CompletedJobs} options={{ headerShown: false }} />
        <Stack.Screen name="AddJob" component={AddJob} options={{ headerShown: false }} />
        <Stack.Screen name="JobInfo" component={JobInfo} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="CustomerJobs" component={CustomerJobs} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={Signup} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
