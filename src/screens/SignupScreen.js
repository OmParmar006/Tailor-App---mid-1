
// import React, { useContext, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   Animated,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { AuthContext } from "../context/AuthContext";

// export default function SignupScreen({ navigation }) {
//   const { signup, loading } = useContext(AuthContext);

//   const [role, setRole] = useState("Owner");
//   const [name, setName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");

//   // 🔔 Toast state
//   const [toast, setToast] = useState("");
//   const [toastType, setToastType] = useState("success");
//   const toastAnim = useState(new Animated.Value(300))[0];

//   // 🔔 Toast function (TOP-RIGHT, AUTO SIZE)
//   const showToast = (message, type = "success") => {
//     setToast(message);
//     setToastType(type);

//     Animated.timing(toastAnim, {
//       toValue: 0,
//       duration: 300,
//       useNativeDriver: true,
//     }).start();

//     setTimeout(() => {
//       Animated.timing(toastAnim, {
//         toValue: 300,
//         duration: 300,
//         useNativeDriver: true,
//       }).start(() => setToast(""));
//     }, 2500);
//   };

//   // ✅ SIGNUP HANDLER
//   const handleSignup = async () => {
//     if (!name.trim())
//       return showToast("Name is required", "error");

//     if (!phone.trim() || phone.length < 10)
//       return showToast("Enter a valid phone number", "error");

//     if (!email.includes("@"))
//       return showToast("Invalid email address", "error");

//     if (password.length < 6)
//       return showToast("Password must be at least 6 characters", "error");

//     if (password !== confirmPassword)
//       return showToast("Passwords do not match", "error");

//     try {
//       await signup({ name, phone, email, password, role });

//       showToast(
//         "Account created successfully"
//       );

//       setTimeout(() => {
//         navigation.navigate("Login");
//       }, 2000);
//     } catch (err) {
//       const code = err.code;

//       if (code === "auth/email-already-in-use") {
//         showToast("Email already in use", "error");
//       } else if (code === "auth/invalid-email") {
//         showToast("Invalid email address", "error");
//       } else if (code === "auth/weak-password") {
//         showToast("Password must be at least 6 characters", "error");
//       } else {
//         showToast("Signup failed. Please try again.", "error");
//       }
//     }
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor: "#F4F5F7" }}>
//       <SafeAreaView style={{ flex: 1 }}>
//         <KeyboardAvoidingView
//           style={{ flex: 1 }}
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//         >
//           <View style={{ flex: 0.25 }} />

//           <View style={styles.card}>
//             <ScrollView
//               contentContainerStyle={{ padding: 24 }}
//               keyboardShouldPersistTaps="handled"
//             >
//               <Text style={styles.title}>Create Account</Text>

//               {/* ROLE TOGGLE */}
//               <View style={styles.toggle}>
//                 {["Owner", "Customer"].map((item) => (
//                   <TouchableOpacity
//                     key={item}
//                     onPress={() => setRole(item)}
//                     style={[
//                       styles.toggleBtn,
//                       role === item && styles.toggleActive,
//                     ]}
//                   >
//                     <Text
//                       style={{
//                         color: role === item ? "#fff" : "#374151",
//                         fontWeight: "700",
//                       }}
//                     >
//                       {item}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>

//               {/* INPUTS */}
//               <TextInput
//                 placeholder="Full Name"
//                 value={name}
//                 onChangeText={setName}
//                 style={styles.input}
//               />

//               <TextInput
//                 placeholder="Phone Number"
//                 value={phone}
//                 onChangeText={setPhone}
//                 keyboardType="phone-pad"
//                 style={styles.input}
//               />

//               <TextInput
//                 placeholder="Email"
//                 value={email}
//                 onChangeText={setEmail}
//                 autoCapitalize="none"
//                 keyboardType="email-address"
//                 style={styles.input}
//               />

//               <TextInput
//                 placeholder="Password"
//                 secureTextEntry
//                 value={password}
//                 onChangeText={setPassword}
//                 style={styles.input}
//               />

//               <TextInput
//                 placeholder="Confirm Password"
//                 secureTextEntry
//                 value={confirmPassword}
//                 onChangeText={setConfirmPassword}
//                 style={styles.input}
//               />

//               <TouchableOpacity
//                 style={styles.button}
//                 onPress={handleSignup}
//                 disabled={loading}
//               >
//                 <Text style={styles.buttonText  }>
//                   {loading ? "Creating..." : `Sign up as ${role}`}
//                 </Text>
//               </TouchableOpacity>

//               <TouchableOpacity onPress={() => navigation.goBack()}>
//                 <Text style={styles.link}>
//                   Already have an account? Login
//                 </Text>
//               </TouchableOpacity>
//             </ScrollView>
//           </View>
//         </KeyboardAvoidingView>

//         {/* 🔔 TOAST (AUTO WIDTH, TOP-RIGHT) */}
//         {toast !== "" && (
//           <Animated.View
//             style={{
//               position: "absolute",
//               top: 50,
//               right: 20,
//               maxWidth: "85%",
//               alignSelf: "flex-end",
//               backgroundColor:
//                 toastType === "success" ? "#ECFDF5" : "#FEF2F2",
//               borderLeftWidth: 5,
//               borderLeftColor:
//                 toastType === "success" ? "#10B981" : "#EF4444",
//               paddingVertical: 12,
//               paddingHorizontal: 16,
//               borderRadius: 14,
//               transform: [{ translateX: toastAnim }],
//             }}
//           >
//             <Text
//               style={{
//                 color:
//                   toastType === "success" ? "#065F46" : "#7F1D1D",
//                 fontWeight: "600",
//               }}
//             >
//               {toast}
//             </Text>
//           </Animated.View>
//         )}
//       </SafeAreaView>
//     </View>
//   );
// }

// const styles = {
//   card: {
//     flex: 0.75,
//     backgroundColor: "#FFFFFF",
//     borderTopLeftRadius: 40,
//     borderTopRightRadius: 40,
//   },
//   title: {
//     fontSize: 26,
//     fontWeight: "700",
//     textAlign: "center",
//     marginBottom: 20,
//   },
//   toggle: {
//     flexDirection: "row",
//     backgroundColor: "#E5E7EB",
//     borderRadius: 14,
//     padding: 4,
//     marginBottom: 20,
//   },
//   toggleBtn: {
//     flex: 1,
//     paddingVertical: 10,
//     borderRadius: 12,
//     alignItems: "center",
//   },
//   toggleActive: {
//     backgroundColor: "#0F172A",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     borderRadius: 12,
//     padding: 14,
//     marginBottom: 12,
//     color: "#111827",
//   },
//   button: {
//     backgroundColor: "#0F172A",
//     paddingVertical: 16,
//     borderRadius: 16,
//     alignItems: "center",
//     marginTop: 10,
//   },
//   buttonText: {
//     color: "#FFFFFF",
//     fontSize: 18,
//     fontWeight: "700",
//   },
//   link: {
//     textAlign: "center",
//     marginTop: 20,
//     color: "#0F172A",
//     fontWeight: "700",
//   },
// };



import React, { useContext, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
  Dimensions,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../context/AuthContext";

const { height } = Dimensions.get("window");

export default function SignupScreen({ navigation }) {
  const { signup, loading } = useContext(AuthContext);

  const [role, setRole] = useState("Owner");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 🔔 Toast
  const [toast, setToast] = useState("");
  const toastAnim = useRef(new Animated.Value(0)).current;

  const showToast = (message) => {
    setToast(message);

    Animated.timing(toastAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setToast(""));
    }, 2500);
  };

  const handleSignup = async () => {
    if (!name.trim())
      return showToast("Name is required");

    if (!phone.trim() || phone.length < 10)
      return showToast("Enter valid phone number");

    if (!email.includes("@"))
      return showToast("Invalid email address");

    if (password.length < 6)
      return showToast("Password must be at least 6 characters");

    if (password !== confirmPassword)
      return showToast("Passwords do not match");

    try {
      await signup({ name, phone, email, password, role });
      showToast("Account created successfully");

      setTimeout(() => navigation.navigate("Login"), 1800);
    } catch (err) {
      if (err.code === "auth/email-already-in-use")
        showToast("Email already in use");
      else
        showToast("Signup failed. Try again");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F4F5F7" }}>
      {/* 🔼 TOP IMAGE */}
      <SafeAreaView edges={["top"]}>
        <ImageBackground
          source={require("../../assets/signupimg.png")}
          style={styles.topImage}
          resizeMode="contain"
        />
      </SafeAreaView>

      {/* ⚪ CARD */}
      <SafeAreaView style={styles.cardWrapper}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.title}>Create Account</Text>

            {/* ROLE */}
            <View style={styles.toggle}>
              {["Owner", "Customer"].map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => setRole(item)}
                  style={[
                    styles.toggleBtn,
                    role === item && styles.toggleActive,
                  ]}
                >
                  <Text
                    style={{
                      color: role === item ? "#fff" : "#374151",
                      fontWeight: "700",
                    }}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#6B7280"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />

            <TextInput
              placeholder="Phone Number"
              placeholderTextColor="#6B7280"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={styles.input}
            />

            <TextInput
              placeholder="Email"
              placeholderTextColor="#6B7280"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />

            {/* 🔐 PASSWORD ROW */}
            <View style={styles.passwordRow}>
              <View style={styles.passwordBox}>
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#6B7280"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  style={styles.passwordInput}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eye}>
                    {showPassword ? "🙈" : "👁️"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.passwordBox}>
                <TextInput
                  placeholder="Confirm"
                  placeholderTextColor="#6B7280"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  style={styles.passwordInput}
                />
                <TouchableOpacity
                  onPress={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  <Text style={styles.eye}>
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Creating..." : `Sign up as ${role}`}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.link}>
                Already have an account? Login
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* 🔔 WHATSAPP-STYLE AUTO-WIDTH TOAST */}
          {toast !== "" && (
            <Animated.View
              style={[
                styles.toast,
                {
                  opacity: toastAnim,
                  transform: [
                    {
                      translateY: toastAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.toastText}>{toast}</Text>
            </Animated.View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = {
  topImage: {
    height: height * 0.34,
    width: "100%",
  },
  cardWrapper: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -10,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 80,
    paddingTop: 0,   
    minHeight: height * 0.66,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },

  toggle: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 14,
    padding: 4,
    marginBottom: 22,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  toggleActive: {
    backgroundColor: "#0F172A",
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    color: "#111827",
  },

  passwordRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  passwordBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
  },
  eye: {
    fontSize: 16,
  },

  button: {
    backgroundColor: "#0F172A",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  link: {
    textAlign: "center",
    marginTop: 22,
    fontWeight: "700",
    color: "#0F172A",
  },

  /* 🔔 AUTO-WIDTH WHATSAPP STYLE TOAST */
  toast: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "#111827",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 30,
    maxWidth: "90%",
  },
  toastText: {
    color: "#FFFFFF",
    fontWeight: "600",
    textAlign: "center",
  },
};
