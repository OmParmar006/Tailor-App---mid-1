import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { LanguageProvider } from './src/context/LanguageContext'; // ADD THIS LINE
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/firebaseConfig';
import { View, ActivityIndicator } from 'react-native';

// Import your screens
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import AddCustomerScreen from './src/screens/AddCustomerScreen';
import AddMeasurementScreen from './src/screens/AddMeasurementScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import MeasurementScreen from './src/screens/MeasurementScreen';
import ProfileScreen from './src/screens/ProfileScreen';
// import GarmentSelectScreen from './src/screens/GarmentSelectScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, []);

  if (initializing) {
    // Show loading screen while checking auth state
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0E1A' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? "Home" : "Welcome"}
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="AddCustomer" component={AddCustomerScreen} />
        <Stack.Screen name="AddMeasurement" component={AddMeasurementScreen} />
        <Stack.Screen name="Measurement" component={MeasurementScreen} />
        {/* <Stack.Screen name="GarmentSelect" component={GarmentSelectScreen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        {/* Wrap with LanguageProvider to make language available globally */}
        <LanguageProvider>
          <AppNavigator />
        </LanguageProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}