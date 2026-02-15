// import React, { useContext, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { AuthContext } from "../context/AuthContext";

// export default function LoginScreen({ navigation }) {
//   const { login, loading } = useContext(AuthContext);

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");

//   const handleLogin = async () => {
//     setError("");

//     if (!email.includes("@")) {
//       setError("Enter a valid email");
//       return;
//     }

//     if (password.length < 4) {
//       setError("Password must be at least 4 characters");
//       return;
//     }

//     try {
//       await login({ email, password });

//       // ✅ REDIRECT TO HOME AFTER SUCCESSFUL LOGIN
//       navigation.replace("Home");

//     } catch (err) {
//       setError("Invalid email or password");
//     }
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor: "#F4F5F7" }}>
//       <SafeAreaView style={{ flex: 1 }}>
//         <KeyboardAvoidingView
//           style={{ flex: 1 }}
//           behavior={Platform.OS === "ios" ? "padding" : "height"}
//         >
//           {/* TOP SPACE */}
//           <View style={{ flex: 0.3 }} />

//           {/* FORM CARD */}
//           <View
//             style={{
//               flex: 0.7,
//               backgroundColor: "#FFFFFF",
//               borderTopLeftRadius: 40,
//               borderTopRightRadius: 40,
//             }}
//           >
//             <ScrollView
//               contentContainerStyle={{ padding: 24 }}
//               keyboardShouldPersistTaps="handled"
//             >
//               <Text style={styles.title}>Welcome Back</Text>
//               <Text style={styles.subtitle}>
//                 Login to manage your tailor shop
//               </Text>

//               <Text style={styles.label}>Email</Text>
//               <TextInput
//                 placeholder="Enter your email"
//                 value={email}
//                 onChangeText={setEmail}
//                 autoCapitalize="none"
//                 keyboardType="email-address"
//                 style={styles.input}
//               />

//               <Text style={styles.label}>Password</Text>
//               <TextInput
//                 placeholder="Enter your password"
//                 secureTextEntry
//                 value={password}
//                 onChangeText={setPassword}
//                 style={styles.input}
//               />

//               {error !== "" && (
//                 <Text style={styles.error}>{error}</Text>
//               )}

//               <TouchableOpacity
//                 style={styles.button}
//                 onPress={handleLogin}
//                 disabled={loading}
//               >
//                 <Text style={styles.buttonText}>
//                   {loading ? "Logging in..." : "Login"}
//                 </Text>
//               </TouchableOpacity>

//               <View style={styles.bottomText}>
//                 <Text>Don’t have an account?</Text>
//                 <TouchableOpacity
//                   onPress={() => navigation.navigate("Signup")}
//                 >
//                   <Text style={styles.link}> Sign up</Text>
//                 </TouchableOpacity>
//               </View>
//             </ScrollView>
//           </View>
//         </KeyboardAvoidingView>
//       </SafeAreaView>
//     </View>
//   );
// }

// const styles = {
//   title: {
//     fontSize: 26,
//     fontWeight: "700",
//     textAlign: "center",
//     marginBottom: 6,
//   },
//   subtitle: {
//     textAlign: "center",
//     color: "#6B7280",
//     marginBottom: 24,
//   },
//   label: {
//     fontWeight: "600",
//     marginBottom: 6,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     borderRadius: 12,
//     padding: 14,
//     marginBottom: 12,
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
//   error: {
//     color: "red",
//     marginBottom: 12,
//     textAlign: "center",
//   },
//   bottomText: {
//     flexDirection: "row",
//     justifyContent: "center",
//     marginTop: 20,
//   },
//   link: {
//     fontWeight: "700",
//     color: "#0F172A",
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

export default function LoginScreen({ navigation }) {
  const { login, loading } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔔 Toast state
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

  const handleLogin = async () => {
    if (!email.includes("@"))
      return showToast("Enter a valid email");

    if (password.length < 6)
      return showToast("Password must be at least 6 characters");

    try {
      await login({ email, password });
      navigation.replace("Home");
    } catch {
      showToast("Invalid email or password");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F4F5F7" }}>
      {/* 🔼 TOP IMAGE */}
      <SafeAreaView edges={["top"]}>
        <ImageBackground
          source={require("../../assets/loginimg.png")}
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
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Login to manage your tailor shop
            </Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="Enter your email"
              placeholderTextColor="#6B7280"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              placeholder="Enter your password"
              placeholderTextColor="#6B7280"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.input}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Logging in..." : "Login"}
              </Text>
            </TouchableOpacity>

            <View style={styles.bottomText}>
              <Text>Don’t have an account?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Signup")}
              >
                <Text style={styles.link}> Sign up</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* 🔔 WHATSAPP-STYLE TOAST */}
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
    marginBottom: 6,
  },
  subtitle: {
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 28,
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    color: "#111827",
  },
  button: {
    backgroundColor: "#0F172A",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  bottomText: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 26,
  },
  link: {
    fontWeight: "700",
    color: "#0F172A",
  },

  /* 🔔 TOAST */
  toast: {
  position: "absolute",
  bottom: 20,
  alignSelf: "center",   // ⭐ centers auto-width toast
  backgroundColor: "#111827",
  paddingVertical: 12,
  paddingHorizontal: 18,
  borderRadius: 30,     // WhatsApp pill
  maxWidth: "90%",      // safety for long text
  alignItems: "center",
},
toastText: {
  color: "#FFFFFF",
  fontWeight: "600",
  textAlign: "center",
},

};
