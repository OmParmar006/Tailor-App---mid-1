import React, { useContext, useRef, useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
  Dimensions, Animated, StatusBar, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../context/AuthContext";

const { width, height } = Dimensions.get("window");

export default function LoginScreen({ navigation }) {
  const { login, loading } = useContext(AuthContext);

  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [toast, setToast]             = useState({ msg: "", success: false });

  const toastAnim = useRef(new Animated.Value(0)).current;
  const btnScale  = useRef(new Animated.Value(1)).current;

  // Staggered entry
  const a = Array.from({ length: 7 }, () => useRef(new Animated.Value(0)).current);

  useEffect(() => {
    Animated.stagger(75, a.map(x =>
      Animated.timing(x, { toValue: 1, duration: 420, useNativeDriver: true })
    )).start();
  }, []);

  const slide = (x) => ({
    opacity: x,
    transform: [{ translateY: x.interpolate({ inputRange: [0,1], outputRange: [24,0] }) }],
  });

  const showToast = (msg, success = false) => {
    setToast({ msg, success });
    Animated.sequence([
      Animated.timing(toastAnim, { toValue:1, duration:250, useNativeDriver:true }),
      Animated.delay(2400),
      Animated.timing(toastAnim, { toValue:0, duration:250, useNativeDriver:true }),
    ]).start(() => setToast({ msg:"", success:false }));
  };

  const handleLogin = async () => {
    if (!email.includes("@")) return showToast("Enter a valid email address");
    if (password.length < 6)  return showToast("Password must be at least 6 characters");

    Animated.sequence([
      Animated.timing(btnScale, { toValue:0.96, duration:80, useNativeDriver:true }),
      Animated.timing(btnScale, { toValue:1,    duration:80, useNativeDriver:true }),
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
    <View style={S.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F3F7" />

      {/* Soft background blobs */}
      <View style={S.blob1} />
      <View style={S.blob2} />

      <SafeAreaView style={{ flex:1 }} edges={["top","bottom"]}>
        <KeyboardAvoidingView
          style={{ flex:1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={S.scroll}
            bounces={false}
          >

            {/* ── Logo ── */}
            <Animated.View style={[S.logoArea, slide(a[0])]}>
              <View style={S.logoWrap}>
                <View style={S.dBlue} />
                <View style={S.dGreen} />
              </View>
              <Text style={S.logoText}>Darji Pro</Text>
            </Animated.View>

            {/* ── Heading ── */}
            <Animated.View style={slide(a[1])}>
              <Text style={S.heading}>Welcome back 👋</Text>
              <Text style={S.sub}>Sign in to continue managing your orders</Text>
            </Animated.View>

            {/* ── Card ── */}
            <View style={S.card}>

              {/* Email */}
              <Animated.View style={slide(a[2])}>
                <Text style={S.label}>Email address</Text>
                <View style={[S.inputWrap, focusedField==="email" && S.inputFocus]}>
                  <View style={S.inputIcon}>
                    {/* @ symbol */}
                    <Text style={S.inputIconTxt}>@</Text>
                  </View>
                  <TextInput
                    placeholder="you@example.com"
                    placeholderTextColor="#C4CAD4"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={S.textInput}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </Animated.View>

              {/* Password */}
              <Animated.View style={slide(a[3])}>
                <Text style={S.label}>Password</Text>
                <View style={[S.inputWrap, focusedField==="password" && S.inputFocus]}>
                  <View style={S.inputIcon}>
                    <Text style={S.inputIconTxt}>🔒</Text>
                  </View>
                  <TextInput
                    placeholder="Enter your password"
                    placeholderTextColor="#C4CAD4"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    style={[S.textInput, { flex:1 }]}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top:8,bottom:8,left:8,right:8 }}
                  >
                    <Text style={S.eyeTxt}>{showPassword ? "○" : "●"}</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>

              {/* Forgot */}
              <Animated.View style={[slide(a[4]), S.forgotRow]}>
                <TouchableOpacity hitSlop={{ top:6,bottom:6 }}>
                  <Text style={S.forgotTxt}>Forgot password?</Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Sign In Button */}
              <Animated.View style={[slide(a[5]), { transform:[{ scale:btnScale }] }]}>
                <TouchableOpacity
                  style={[S.btn, loading && S.btnDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={1}
                >
                  {loading ? (
                    <View style={S.dotsRow}>
                      <View style={S.dot}/>
                      <View style={[S.dot,{marginHorizontal:5}]}/>
                      <View style={S.dot}/>
                    </View>
                  ) : (
                    <Text style={S.btnTxt}>Sign in</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* ── Divider ── */}
            <Animated.View style={[slide(a[6]), S.divRow]}>
              <View style={S.divLine}/>
              <Text style={S.divTxt}>or</Text>
              <View style={S.divLine}/>
            </Animated.View>

            {/* ── Signup link ── */}
            <Animated.View style={[slide(a[6]), S.signupRow]}>
              <Text style={S.signupPrompt}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Signup")} hitSlop={{top:8,bottom:8,left:4,right:4}}>
                <Text style={S.signupLink}>  Create one</Text>
              </TouchableOpacity>
            </Animated.View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Toast */}
      {toast.msg !== "" && (
        <Animated.View style={[
          S.toast,
          toast.success && S.toastSuccess,
          {
            opacity: toastAnim,
            transform:[{ translateY: toastAnim.interpolate({ inputRange:[0,1], outputRange:[10,0] }) }],
          },
        ]}>
          <View style={[S.toastDot, toast.success && S.toastDotSuccess]}/>
          <Text style={S.toastTxt}>{toast.msg}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex:1, backgroundColor:"#F2F3F7" },

  // Soft background blobs matching dashboard
  blob1: {
    position:"absolute", top:-80, right:-60,
    width:220, height:220, borderRadius:110,
    backgroundColor:"rgba(59,130,246,0.07)",
  },
  blob2: {
    position:"absolute", bottom:-60, left:-40,
    width:180, height:180, borderRadius:90,
    backgroundColor:"rgba(163,230,53,0.06)",
  },

  scroll: {
    flexGrow:1,
    paddingHorizontal:24,
    paddingTop: height * 0.08,
    paddingBottom:40,
  },

  // Logo — exact same as dashboard header
  logoArea: {
    flexDirection:"row",
    alignItems:"center",
    gap:10,
    marginBottom:32,
  },
  logoWrap: { width:36, height:36, position:"relative" },
  dBlue: {
    position:"absolute", top:2, left:4,
    width:18, height:18,
    backgroundColor:"#3B82F6",
    transform:[{ rotate:"45deg" }],
    borderRadius:3,
  },
  dGreen: {
    position:"absolute", bottom:2, right:0,
    width:14, height:14,
    backgroundColor:"#A3E635",
    transform:[{ rotate:"45deg" }],
    borderRadius:2,
  },
  logoText: {
    fontSize:24,
    fontWeight:"900",
    color:"#1C1C1E",
    letterSpacing:-0.5,
  },

  // Heading
  heading: {
    fontSize:28,
    fontWeight:"900",
    color:"#1C1C1E",
    letterSpacing:-0.8,
    marginBottom:6,
  },
  sub: {
    fontSize:15,
    color:"#9CA3AF",
    fontWeight:"500",
    marginBottom:32,
    lineHeight:22,
  },

  // White card — same shadow as dashboard cards
  card: {
    backgroundColor:"#FFFFFF",
    borderRadius:22,
    padding:22,
    shadowColor:"#000",
    shadowOffset:{ width:0, height:2 },
    shadowOpacity:0.07,
    shadowRadius:12,
    elevation:4,
    marginBottom:20,
  },

  label: {
    fontSize:13,
    fontWeight:"700",
    color:"#374151",
    marginBottom:8,
    letterSpacing:0.1,
  },

  inputWrap: {
    flexDirection:"row",
    alignItems:"center",
    backgroundColor:"#F9FAFB",
    borderRadius:14,
    borderWidth:1.5,
    borderColor:"#E5E7EB",
    paddingHorizontal:14,
    height:52,
    marginBottom:18,
  },
  inputFocus: {
    borderColor:"#3B82F6",
    backgroundColor:"#EFF6FF",
  },
  inputIcon: {
    marginRight:10,
    width:22,
    alignItems:"center",
  },
  inputIconTxt: {
    fontSize:15,
    color:"#9CA3AF",
    fontWeight:"700",
  },
  textInput: {
    flex:1,
    color:"#1C1C1E",
    fontSize:15,
    fontWeight:"500",
    paddingVertical:0,
  },
  eyeTxt: {
    color:"#9CA3AF",
    fontSize:13,
    paddingLeft:8,
  },

  forgotRow: {
    alignItems:"flex-end",
    marginTop:-8,
    marginBottom:22,
  },
  forgotTxt: {
    color:"#3B82F6",
    fontSize:13,
    fontWeight:"600",
  },

  // Blue button — same as dashboard "Add Order"
  btn: {
    backgroundColor:"#3B82F6",
    borderRadius:14,
    height:52,
    alignItems:"center",
    justifyContent:"center",
    shadowColor:"#3B82F6",
    shadowOffset:{ width:0, height:6 },
    shadowOpacity:0.3,
    shadowRadius:14,
    elevation:7,
  },
  btnDisabled: { backgroundColor:"#93C5FD" },
  btnTxt: {
    color:"#FFF",
    fontSize:16,
    fontWeight:"800",
    letterSpacing:0.2,
  },
  dotsRow: { flexDirection:"row", alignItems:"center" },
  dot: { width:7, height:7, borderRadius:4, backgroundColor:"rgba(255,255,255,0.7)" },

  divRow: {
    flexDirection:"row",
    alignItems:"center",
    marginTop:4,
    marginBottom:20,
  },
  divLine: { flex:1, height:1, backgroundColor:"#E5E7EB" },
  divTxt:  { color:"#9CA3AF", fontSize:13, paddingHorizontal:14, fontWeight:"500" },

  signupRow: {
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
  },
  signupPrompt: { color:"#6B7280", fontSize:14, fontWeight:"500" },
  signupLink:   { color:"#3B82F6", fontSize:14, fontWeight:"800" },

  // Toast — white card style
  toast: {
    position:"absolute",
    bottom:36,
    alignSelf:"center",
    flexDirection:"row",
    alignItems:"center",
    backgroundColor:"#FFFFFF",
    paddingVertical:13,
    paddingHorizontal:18,
    borderRadius:14,
    maxWidth: width - 48,
    borderWidth:1,
    borderColor:"#F3F4F6",
    shadowColor:"#000",
    shadowOffset:{ width:0, height:6 },
    shadowOpacity:0.1,
    shadowRadius:14,
    elevation:10,
  },
  toastSuccess: { borderColor:"#D1FAE5" },
  toastDot: {
    width:7, height:7, borderRadius:4,
    backgroundColor:"#EF4444",
    marginRight:10,
  },
  toastDotSuccess: { backgroundColor:"#10B981" },
  toastTxt: {
    color:"#374151",
    fontSize:13,
    fontWeight:"600",
    flexShrink:1,
  },
});