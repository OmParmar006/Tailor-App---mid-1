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
  const [focusedField, setFocusedField] = useState(null);
  const [toast, setToast] = useState({ msg: "", success: false });

  const phoneRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);
  const toastAnim = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  // Staggered entry anims
  const anims = Array.from({ length: 9 }, () => useRef(new Animated.Value(0)).current);

  useEffect(() => {
    Animated.stagger(
      70,
      anims.map((a) =>
        Animated.timing(a, { toValue: 1, duration: 400, useNativeDriver: true })
      )
    ).start();
  }, []);

  const slide = (a) => ({
    opacity: a,
    transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
  });

  const showToast = (msg, success = false) => {
    setToast({ msg, success });
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(2400),
      Animated.timing(toastAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => setToast({ msg: "", success: false }));
  };

  const handleSignup = async () => {
    if (!name.trim()) return showToast("Full name is required");
    if (!phone.trim() || phone.length < 10) return showToast("Enter a valid phone number");
    if (!email.includes("@")) return showToast("Invalid email address");
    if (password.length < 6) return showToast("Password must be at least 6 characters");
    if (password !== confirmPassword) return showToast("Passwords do not match");

    Animated.sequence([
      Animated.timing(btnScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(btnScale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();

    try {
      await signup({ name, phone, email, password, role });
      showToast("Account created successfully!", true);
      setTimeout(() => navigation.replace("Home"), 1400);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") showToast("Email already in use");
      else if (err.code === "auth/weak-password") showToast("Password is too weak");
      else showToast("Signup failed. Please try again");
    }
  };

  const iw = (f) => [styles.inputWrap, focusedField === f && styles.inputFocused];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0F1623" />

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
            {/* ── Back + Header ── */}
            <Animated.View style={[styles.topRow, slide(anims[0])]}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.backArrow}>←</Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={slide(anims[1])}>
              <Text style={styles.heading}>Create account</Text>
              <Text style={styles.subheading}>Fill in your details to get started</Text>
            </Animated.View>

            {/* ── Role Toggle ── */}
            <Animated.View style={[slide(anims[2]), { marginBottom: 24 }]}>
              <Text style={styles.label}>I am a</Text>
              <View style={styles.roleWrap}>
                {["Owner", "Customer"].map((item) => (
                  <TouchableOpacity
                    key={item}
                    onPress={() => setRole(item)}
                    style={[styles.roleBtn, role === item && styles.roleBtnActive]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.roleText, role === item && styles.roleTextActive]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>

            {/* ── Fields ── */}
            <Animated.View style={slide(anims[3])}>
              <Text style={styles.label}>Full name</Text>
              <View style={iw("name")}>
                <TextInput
                  placeholder="John Doe"
                  placeholderTextColor="#3C4A5E"
                  value={name}
                  onChangeText={setName}
                  style={styles.textInput}
                  returnKeyType="next"
                  onSubmitEditing={() => phoneRef.current?.focus()}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </Animated.View>

            <Animated.View style={slide(anims[4])}>
              <Text style={styles.label}>Phone number</Text>
              <View style={iw("phone")}>
                <TextInput
                  ref={phoneRef}
                  placeholder="+91 98765 43210"
                  placeholderTextColor="#3C4A5E"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  style={styles.textInput}
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                  onFocus={() => setFocusedField("phone")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </Animated.View>

            <Animated.View style={slide(anims[5])}>
              <Text style={styles.label}>Email address</Text>
              <View style={iw("email")}>
                <TextInput
                  ref={emailRef}
                  placeholder="you@example.com"
                  placeholderTextColor="#3C4A5E"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.textInput}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </Animated.View>

            <Animated.View style={slide(anims[6])}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordRow}>
                <View style={[iw("password"), { flex: 1 }]}>
                  <TextInput
                    ref={passwordRef}
                    placeholder="Min. 6 characters"
                    placeholderTextColor="#3C4A5E"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    style={[styles.textInput, { flex: 1 }]}
                    returnKeyType="next"
                    onSubmitEditing={() => confirmRef.current?.focus()}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.eyeIcon}>{showPassword ? "○" : "●"}</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ width: 10 }} />

                <View style={[iw("confirm"), { flex: 1 }]}>
                  <TextInput
                    ref={confirmRef}
                    placeholder="Confirm"
                    placeholderTextColor="#3C4A5E"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    style={[styles.textInput, { flex: 1 }]}
                    returnKeyType="done"
                    onSubmitEditing={handleSignup}
                    onFocus={() => setFocusedField("confirm")}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.eyeIcon}>{showConfirmPassword ? "○" : "●"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>

            {/* ── Button ── */}
            <Animated.View style={[slide(anims[7]), { transform: [{ scale: btnScale }] }]}>
              <TouchableOpacity
                style={[styles.btn, loading && styles.btnLoading]}
                onPress={handleSignup}
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
                  <Text style={styles.btnText}>Create account</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* ── Login link ── */}
            <Animated.View style={[slide(anims[8]), styles.loginRow]}>
              <Text style={styles.loginPrompt}>Already have an account?</Text>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <Text style={styles.loginLink}>  Sign in</Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Toast */}
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
  bgAccentTop: {
    position: "absolute",
    top: -100,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(56, 139, 253, 0.07)",
  },
  bgAccentBottom: {
    position: "absolute",
    bottom: -80,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(56, 139, 253, 0.04)",
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: height * 0.05,
    paddingBottom: 48,
  },

  // Top row
  topRow: {
    marginBottom: 28,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#161E2E",
    borderWidth: 1,
    borderColor: "#1E2C42",
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    color: "#8A9BB5",
    fontSize: 18,
    lineHeight: 20,
  },

  // Headings
  heading: {
    fontSize: 26,
    fontWeight: "700",
    color: "#E8EDF5",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subheading: {
    fontSize: 14,
    color: "#4A5A72",
    marginBottom: 28,
  },

  // Labels
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8A9BB5",
    marginBottom: 8,
    letterSpacing: 0.1,
  },

  // Role toggle
  roleWrap: {
    flexDirection: "row",
    backgroundColor: "#161E2E",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1E2C42",
    padding: 4,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 7,
    alignItems: "center",
  },
  roleBtnActive: {
    backgroundColor: "#388BFD",
    shadowColor: "#388BFD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  roleText: {
    color: "#4A5A72",
    fontSize: 14,
    fontWeight: "600",
  },
  roleTextActive: {
    color: "#fff",
    fontWeight: "700",
  },

  // Inputs
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161E2E",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#1E2C42",
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 18,
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
  eyeIcon: {
    color: "#3C4A5E",
    fontSize: 12,
    paddingLeft: 8,
  },
  passwordRow: {
    flexDirection: "row",
    marginBottom: 2,
  },

  // Button
  btn: {
    backgroundColor: "#388BFD",
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    marginBottom: 8,
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

  // Login link
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  loginPrompt: {
    color: "#4A5A72",
    fontSize: 14,
  },
  loginLink: {
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
    flexShrink: 0,
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