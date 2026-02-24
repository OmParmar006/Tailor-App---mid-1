import React, { useContext, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Animated,
  StatusBar,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../context/AuthContext";

const { width, height } = Dimensions.get("window");

export default function LoginScreen({ navigation }) {
  const { login, loading } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [toast, setToast] = useState({ msg: "", success: false });

  const toastAnim = useRef(new Animated.Value(0)).current;

  // Staggered entry animations
  const anim0 = useRef(new Animated.Value(0)).current; // logo
  const anim1 = useRef(new Animated.Value(0)).current; // subtitle
  const anim2 = useRef(new Animated.Value(0)).current; // email field
  const anim3 = useRef(new Animated.Value(0)).current; // password field
  const anim4 = useRef(new Animated.Value(0)).current; // forgot
  const anim5 = useRef(new Animated.Value(0)).current; // button
  const anim6 = useRef(new Animated.Value(0)).current; // signup link

  // Button press scale
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const items = [anim0, anim1, anim2, anim3, anim4, anim5, anim6];
    const anims = items.map((a, i) =>
      Animated.timing(a, {
        toValue: 1,
        duration: 420,
        delay: i * 80,
        useNativeDriver: true,
      })
    );
    Animated.stagger(80, anims).start();
  }, []);

  const makeSlide = (anim) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [22, 0],
        }),
      },
    ],
  });

  const showToast = (msg, success = false) => {
    setToast({ msg, success });
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(2400),
      Animated.timing(toastAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => setToast({ msg: "", success: false }));
  };

  const handleLogin = async () => {
    if (!email.includes("@")) return showToast("Enter a valid email address");
    if (password.length < 6) return showToast("Password must be at least 6 characters");

    // Button press feedback
    Animated.sequence([
      Animated.timing(btnScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(btnScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();

    try {
      await login({ email, password });
      navigation.replace("Home");
    } catch (err) {
      if (err.code === "auth/too-many-requests") showToast("Too many attempts. Try later");
      else showToast("Invalid email or password");
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0F1623" />

      {/* Subtle background accent */}
      <View style={styles.bgAccentTop} />
      <View style={styles.bgAccentBottom} />

      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scroll}
            bounces={false}
          >
            {/* ── Logo Area ── */}
            <Animated.View style={[styles.logoArea, makeSlide(anim0)]}>
              <View style={styles.logoIconWrap}>
                <View style={styles.logoIconInner}>
                  <Text style={styles.logoIconText}>✦</Text>
                </View>
              </View>
            </Animated.View>

            <Animated.View style={makeSlide(anim1)}>
              <Text style={styles.heading}>Welcome back</Text>
              <Text style={styles.subheading}>Sign in to your account to continue</Text>
            </Animated.View>

            {/* ── Form ── */}
            <View style={styles.formCard}>
              {/* EMAIL */}
              <Animated.View style={makeSlide(anim2)}>
                <Text style={styles.label}>Email address</Text>
                <View style={[styles.inputWrap, focusedField === "email" && styles.inputFocused]}>
                  <TextInput
                    placeholder="you@example.com"
                    placeholderTextColor="#3C4A5E"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={styles.textInput}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </Animated.View>

              {/* PASSWORD */}
              <Animated.View style={makeSlide(anim3)}>
                <Text style={styles.label}>Password</Text>
                <View style={[styles.inputWrap, focusedField === "password" && styles.inputFocused]}>
                  <TextInput
                    placeholder="Enter your password"
                    placeholderTextColor="#3C4A5E"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    style={[styles.textInput, { flex: 1 }]}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.eyeIcon}>{showPassword ? "○" : "●"}</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>

              {/* FORGOT */}
              <Animated.View style={[makeSlide(anim4), styles.forgotRow]}>
                <TouchableOpacity hitSlop={{ top: 6, bottom: 6 }}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
              </Animated.View>

              {/* BUTTON */}
              <Animated.View style={[makeSlide(anim5), { transform: [{ scale: btnScale }] }]}>
                <TouchableOpacity
                  style={[styles.btn, loading && styles.btnLoading]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={1}
                >
                  {loading ? (
                    <View style={styles.btnLoadingRow}>
                      <View style={styles.loadingDot} />
                      <View style={[styles.loadingDot, { marginHorizontal: 5 }]} />
                      <View style={styles.loadingDot} />
                    </View>
                  ) : (
                    <Text style={styles.btnText}>Sign in</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* ── Divider ── */}
            <Animated.View style={[makeSlide(anim6), styles.dividerRow]}>
              <View style={styles.divLine} />
              <Text style={styles.divText}>or</Text>
              <View style={styles.divLine} />
            </Animated.View>

            {/* ── Signup Link ── */}
            <Animated.View style={[makeSlide(anim6), styles.signupRow]}>
              <Text style={styles.signupPrompt}>Don't have an account?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Signup")}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <Text style={styles.signupLink}>  Create one</Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* ── Toast ── */}
      {toast.msg !== "" && (
        <Animated.View
          style={[
            styles.toast,
            toast.success && styles.toastSuccess,
            {
              opacity: toastAnim,
              transform: [
                {
                  translateY: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={[styles.toastDot, toast.success && styles.toastDotSuccess]} />
          <Text style={styles.toastText}>{toast.msg}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0F1623",
  },

  // Background accents
  bgAccentTop: {
    position: "absolute",
    top: -120,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(56, 139, 253, 0.07)",
  },
  bgAccentBottom: {
    position: "absolute",
    bottom: -100,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(56, 139, 253, 0.05)",
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: height * 0.07,
    paddingBottom: 40,
  },

  // Logo
  logoArea: {
    marginBottom: 28,
  },
  logoIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(56,139,253,0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(56,139,253,0.2)",
  },
  logoIconInner: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#388BFD",
    alignItems: "center",
    justifyContent: "center",
  },
  logoIconText: {
    color: "#fff",
    fontSize: 18,
  },

  // Headings
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: "#E8EDF5",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subheading: {
    fontSize: 15,
    color: "#4A5A72",
    marginBottom: 36,
    letterSpacing: 0.1,
  },

  // Form
  formCard: {
    width: "100%",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8A9BB5",
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161E2E",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#1E2C42",
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 20,
  },
  inputFocused: {
    borderColor: "#388BFD",
    backgroundColor: "#172035",
  },
  textInput: {
    flex: 1,
    color: "#E8EDF5",
    fontSize: 15,
    paddingVertical: 0,
  },
  eyeBtn: {
    paddingLeft: 10,
  },
  eyeIcon: {
    color: "#3C4A5E",
    fontSize: 13,
  },

  // Forgot
  forgotRow: {
    alignItems: "flex-end",
    marginTop: -10,
    marginBottom: 24,
  },
  forgotText: {
    color: "#388BFD",
    fontSize: 13,
    fontWeight: "500",
  },

  // Button
  btn: {
    backgroundColor: "#388BFD",
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#388BFD",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  btnLoading: {
    backgroundColor: "#2A6ECF",
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  btnLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.6)",
  },

  // Divider
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 32,
    marginBottom: 24,
  },
  divLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#1A2438",
  },
  divText: {
    color: "#3C4A5E",
    fontSize: 13,
    paddingHorizontal: 14,
  },

  // Signup
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupPrompt: {
    color: "#4A5A72",
    fontSize: 14,
  },
  signupLink: {
    color: "#388BFD",
    fontSize: 14,
    fontWeight: "700",
  },

  // Toast
  toast: {
    position: "absolute",
    bottom: 36,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161E2E",
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 12,
    maxWidth: width - 48,
    borderWidth: 1,
    borderColor: "#1E2C42",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  toastSuccess: {
    borderColor: "#238636",
  },
  toastDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#CF6679",
    marginRight: 10,
  },
  toastDotSuccess: {
    backgroundColor: "#3FB950",
  },
  toastText: {
    color: "#C8D3E0",
    fontSize: 13,
    fontWeight: "500",
    flexShrink: 1,
  },
});