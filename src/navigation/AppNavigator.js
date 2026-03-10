import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// ONBOARDING
import WelcomeScreen from "../screens/WelcomeScreen";

// AUTH
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";

// MAIN SCREENS
import HomeScreen from "../screens/HomeScreen";
import CustomersScreen from "../screens/CustomersScreen";
import AddCustomerScreen from "../screens/AddCustomerScreen";
import AddMeasurementScreen from "../screens/AddMeasurementScreen";
import ProfileScreen from "../screens/ProfileScreen";

// NEW SCREENS
import TryOnScreen from "../screens/TryonScreen";
import BillsScreen from "../screens/BillsScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator({ initialUser }) {
  return (
    <Stack.Navigator
      initialRouteName={initialUser ? "Home" : "Welcome"}
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      {/* ───────── ONBOARDING ───────── */}
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ animation: "fade" }}
      />

      {/* ───────── AUTH ───────── */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />

      {/* ───────── MAIN APP ───────── */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ animation: "fade" }}
      />

      {/* CUSTOMERS */}
      <Stack.Screen
        name="Customers"
        component={CustomersScreen}
        options={{ animation: "slide_from_right" }}
      />

      {/* CUSTOMER FLOW */}
      <Stack.Screen
        name="AddCustomer"
        component={AddCustomerScreen}
      />

      <Stack.Screen
        name="AddMeasurement"
        component={AddMeasurementScreen}
      />

      {/* TRY ON */}
      <Stack.Screen
        name="TryOn"
        component={TryOnScreen}
      />

      {/* BILLS */}
      <Stack.Screen
        name="Bills"
        component={BillsScreen}
      />

      {/* PROFILE */}
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ animation: "slide_from_right" }}
      />
    </Stack.Navigator>
  );
}