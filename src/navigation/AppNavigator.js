// import React from "react";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";

// import LoginScreen from "../screens/LoginScreen";
// import SignupScreen from "../screens/SignupScreen";
// import HomeScreen from "../screens/HomeScreen";
// import AddCustomerScreen from "../screens/AddCustomerScreen";
// import AddMeasurementScreen from "../screens/AddMeasurementScreen";

// const Stack = createNativeStackNavigator();

// export default function AppNavigator() {
//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       {/* AUTH */}
//       <Stack.Screen name="Login" component={LoginScreen} />
//       <Stack.Screen name="Signup" component={SignupScreen} />

//       {/* MAIN */}
//       <Stack.Screen name="Home" component={HomeScreen} />

//       {/* CUSTOMER → MEASUREMENT FLOW */}
//       <Stack.Screen name="AddCustomer" component={AddCustomerScreen} />
//       <Stack.Screen name="AddMeasurement" component={AddMeasurementScreen} />
//     </Stack.Navigator>
//   );
// }



import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WelcomeScreen from "../screens/WelcomeScreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import HomeScreen from "../screens/HomeScreen";
import AddCustomerScreen from "../screens/AddCustomerScreen";
import AddMeasurementScreen from "../screens/AddMeasurementScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator 
      initialRouteName="Welcome"
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right', // Smooth sliding animations
      }}
    >
      {/* ONBOARDING */}
      <Stack.Screen 
        name="Welcome" 
        component={WelcomeScreen}
        options={{
          animation: 'fade',
        }}
      />

      {/* AUTH */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />

      {/* MAIN */}
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          animation: 'fade', // Smooth transition after login
        }}
      />

      {/* CUSTOMER → MEASUREMENT FLOW */}
      <Stack.Screen name="AddCustomer" component={AddCustomerScreen} />
      <Stack.Screen name="AddMeasurement" component={AddMeasurementScreen} />
    </Stack.Navigator>
  );
}