// // import React from "react";
// // import { createNativeStackNavigator } from "@react-navigation/native-stack";

// // import LoginScreen from "../screens/LoginScreen";
// // import SignupScreen from "../screens/SignupScreen";
// // import HomeScreen from "../screens/HomeScreen";
// // import AddCustomerScreen from "../screens/AddCustomerScreen";
// // import AddMeasurementScreen from "../screens/AddMeasurementScreen";

// // const Stack = createNativeStackNavigator();

// // export default function AppNavigator() {
// //   return (
// //     <Stack.Navigator screenOptions={{ headerShown: false }}>
// //       {/* AUTH */}
// //       <Stack.Screen name="Login" component={LoginScreen} />
// //       <Stack.Screen name="Signup" component={SignupScreen} />

// //       {/* MAIN */}
// //       <Stack.Screen name="Home" component={HomeScreen} />

// //       {/* CUSTOMER → MEASUREMENT FLOW */}
// //       <Stack.Screen name="AddCustomer" component={AddCustomerScreen} />
// //       <Stack.Screen name="AddMeasurement" component={AddMeasurementScreen} />
// //     </Stack.Navigator>
// //   );
// // }



// // import React from "react";
// // import { createNativeStackNavigator } from "@react-navigation/native-stack";

// // import WelcomeScreen from "../screens/WelcomeScreen";
// // import LoginScreen from "../screens/LoginScreen";
// // import SignupScreen from "../screens/SignupScreen";
// // import HomeScreen from "../screens/HomeScreen";
// // import AddCustomerScreen from "../screens/AddCustomerScreen";
// // import AddMeasurementScreen from "../screens/AddMeasurementScreen";

// // const Stack = createNativeStackNavigator();

// // export default function AppNavigator() {
// //   return (
// //     <Stack.Navigator 
// //       initialRouteName="Welcome"
// //       screenOptions={{ 
// //         headerShown: false,
// //         animation: 'slide_from_right', // Smooth sliding animations
// //       }}
// //     >
// //       {/* ONBOARDING */}
// //       <Stack.Screen 
// //         name="Welcome" 
// //         component={WelcomeScreen}
// //         options={{
// //           animation: 'fade',
// //         }}
// //       />

// //       {/* AUTH */}
// //       <Stack.Screen name="Login" component={LoginScreen} />
// //       <Stack.Screen name="Signup" component={SignupScreen} />

// //       {/* MAIN */}
// //       <Stack.Screen 
// //         name="Home" 
// //         component={HomeScreen}
// //         options={{
// //           animation: 'fade', // Smooth transition after login
// //         }}
// //       />

// //       {/* CUSTOMER → MEASUREMENT FLOW */}
// //       <Stack.Screen name="AddCustomer" component={AddCustomerScreen} />
// //       <Stack.Screen name="AddMeasurement" component={AddMeasurementScreen} />
// //     </Stack.Navigator>
// //   );
// // }

// import React from "react";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";

// import WelcomeScreen from "../screens/WelcomeScreen";
// import LoginScreen from "../screens/LoginScreen";
// import SignupScreen from "../screens/SignupScreen";
// import HomeScreen from "../screens/HomeScreen";
// import AddCustomerScreen from "../screens/AddCustomerScreen";
// import AddMeasurementScreen from "../screens/AddMeasurementScreen";
// import ProfileScreen from "../screens/ProfileScreen";

// const Stack = createNativeStackNavigator();

// export default function AppNavigator({ initialUser }) {
//   return (
//     <Stack.Navigator 
//       initialRouteName={initialUser ? "Home" : "Welcome"}
//       screenOptions={{ 
//         headerShown: false,
//         animation: 'slide_from_right',
//       }}
//     >
//       {/* ONBOARDING */}
//       <Stack.Screen 
//         name="Welcome" 
//         component={WelcomeScreen}
//         options={{ animation: 'fade' }}
//       />

//       {/* AUTH */}
//       <Stack.Screen name="Login" component={LoginScreen} />
//       <Stack.Screen name="Signup" component={SignupScreen} />

//       {/* MAIN */}
//       <Stack.Screen 
//         name="Home" 
//         component={HomeScreen}
//         options={{ animation: 'fade' }}
//       />

//       {/* CUSTOMER → MEASUREMENT FLOW */}
//       <Stack.Screen name="AddCustomer" component={AddCustomerScreen} />
//       <Stack.Screen name="AddMeasurement" component={AddMeasurementScreen} />

//       {/* PROFILE */}
//       <Stack.Screen 
//         name="Profile" 
//         component={ProfileScreen}
//         options={{ animation: 'slide_from_right' }}
//       />
//     </Stack.Navigator>
//   );
// }

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// ONBOARDING
import WelcomeScreen from "../screens/WelcomeScreen";

// AUTH
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";

// MAIN SCREENS
import HomeScreen from "../screens/HomeScreen";
import CustomersScreen from "../screens/CustomersScreen"; // ⭐ IMPORTANT (MISSING BEFORE)
import AddCustomerScreen from "../screens/AddCustomerScreen";
import AddMeasurementScreen from "../screens/AddMeasurementScreen";
import ProfileScreen from "../screens/ProfileScreen";

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

      {/* ⭐ THIS WAS MISSING (REQUIRED FOR BOTTOM NAV) */}
      <Stack.Screen
        name="Customers"
        component={CustomersScreen}
        options={{ animation: "slide_from_right" }}
      />

      {/* ───────── CUSTOMER FLOW ───────── */}
      <Stack.Screen
        name="AddCustomer"
        component={AddCustomerScreen}
      />

      <Stack.Screen
        name="AddMeasurement"
        component={AddMeasurementScreen}
      />

      {/* ───────── PROFILE ───────── */}
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ animation: "slide_from_right" }}
      />
    </Stack.Navigator>
  );
}