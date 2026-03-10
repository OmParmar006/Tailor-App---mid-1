import React, { useContext, useRef, useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
  Dimensions, Animated, StatusBar, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../context/AuthContext";

const { width, height } = Dimensions.get("window");

export default function SignupScreen({ navigation }) {
  const { signup, loading } = useContext(AuthContext);

  const [role, setRole]                         = useState("Owner");
  const [name, setName]                         = useState("");
  const [phone, setPhone]                       = useState("");
  const [email, setEmail]                       = useState("");
  const [password, setPassword]                 = useState("");
  const [confirmPassword, setConfirmPassword]   = useState("");
  const [showPassword, setShowPassword]         = useState(false);
  const [showConfirmPw, setShowConfirmPw]       = useState(false);
  const [focusedField, setFocusedField]         = useState(null);
  const [toast, setToast]                       = useState({ msg:"", success:false });

  const phoneRef   = useRef(null);
  const emailRef   = useRef(null);
  const pwRef      = useRef(null);
  const confirmRef = useRef(null);
  const toastAnim  = useRef(new Animated.Value(0)).current;
  const btnScale   = useRef(new Animated.Value(1)).current;

  const a = Array.from({ length: 9 }, () => useRef(new Animated.Value(0)).current);

  useEffect(() => {
    Animated.stagger(65, a.map(x =>
      Animated.timing(x, { toValue:1, duration:400, useNativeDriver:true })
    )).start();
  }, []);

  const slide = (x) => ({
    opacity: x,
    transform:[{ translateY: x.interpolate({ inputRange:[0,1], outputRange:[22,0] }) }],
  });

  const showToast = (msg, success = false) => {
    setToast({ msg, success });
    Animated.sequence([
      Animated.timing(toastAnim, { toValue:1, duration:250, useNativeDriver:true }),
      Animated.delay(2400),
      Animated.timing(toastAnim, { toValue:0, duration:250, useNativeDriver:true }),
    ]).start(() => setToast({ msg:"", success:false }));
  };

  const handleSignup = async () => {
    if (!name.trim())                   return showToast("Full name is required");
    if (!phone.trim() || phone.length < 10) return showToast("Enter a valid phone number");
    if (!email.includes("@"))           return showToast("Invalid email address");
    if (password.length < 6)            return showToast("Password must be at least 6 characters");
    if (password !== confirmPassword)   return showToast("Passwords do not match");

    Animated.sequence([
      Animated.timing(btnScale, { toValue:0.96, duration:80, useNativeDriver:true }),
      Animated.timing(btnScale, { toValue:1,    duration:80, useNativeDriver:true }),
    ]).start();

    try {
      await signup({ name, phone, email, password, role });
      showToast("Account created successfully!", true);
      setTimeout(() => navigation.replace("Home"), 1400);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") showToast("Email already in use");
      else if (err.code === "auth/weak-password")   showToast("Password is too weak");
      else showToast("Signup failed. Please try again");
    }
  };

  const iw = (f) => [S.inputWrap, focusedField === f && S.inputFocus];

  return (
    <View style={S.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F3F7" />

      {/* Background blobs */}
      <View style={S.blob1}/>
      <View style={S.blob2}/>

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

            {/* ── Back + Logo ── */}
            <Animated.View style={[S.topRow, slide(a[0])]}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={S.backBtn}
                hitSlop={{ top:10,bottom:10,left:10,right:10 }}
              >
                <Text style={S.backArrow}>←</Text>
              </TouchableOpacity>
              {/* Logo inline */}
              <View style={S.logoRow}>
                <View style={S.logoWrap}>
                  <View style={S.dBlue}/>
                  <View style={S.dGreen}/>
                </View>
                <Text style={S.logoTxt}>Darji Pro</Text>
              </View>
            </Animated.View>

            {/* ── Heading ── */}
            <Animated.View style={slide(a[1])}>
              <Text style={S.heading}>Create account ✦</Text>
              <Text style={S.sub}>Fill in your details to get started</Text>
            </Animated.View>

            {/* ── Role toggle — styled like dashboard tab bar ── */}
            <Animated.View style={[slide(a[2]), S.roleSection]}>
              <Text style={S.label}>I am a</Text>
              <View style={S.roleWrap}>
                {["Owner","Customer"].map(item => (
                  <TouchableOpacity
                    key={item}
                    onPress={() => setRole(item)}
                    style={[S.roleBtn, role===item && S.roleBtnActive]}
                    activeOpacity={0.85}
                  >
                    <Text style={[S.roleTxt, role===item && S.roleTxtActive]}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>

            {/* ── Card 1: Personal info ── */}
            <Animated.View style={[slide(a[3]), S.card]}>
              <Text style={S.cardSectionTitle}>Personal Info</Text>

              <Text style={S.label}>Full name</Text>
              <View style={iw("name")}>
                <View style={S.inputIcon}><Text style={S.inputIconTxt}>👤</Text></View>
                <TextInput
                  placeholder="John Doe"
                  placeholderTextColor="#C4CAD4"
                  value={name}
                  onChangeText={setName}
                  style={S.textInput}
                  returnKeyType="next"
                  onSubmitEditing={() => phoneRef.current?.focus()}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              <Text style={S.label}>Phone number</Text>
              <View style={iw("phone")}>
                <View style={S.inputIcon}><Text style={S.inputIconTxt}>📞</Text></View>
                <TextInput
                  ref={phoneRef}
                  placeholder="+91 98765 43210"
                  placeholderTextColor="#C4CAD4"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  style={S.textInput}
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                  onFocus={() => setFocusedField("phone")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              <Text style={S.label}>Email address</Text>
              <View style={[iw("email"), { marginBottom:0 }]}>
                <View style={S.inputIcon}><Text style={[S.inputIconTxt,{fontSize:14,fontWeight:"700"}]}>@</Text></View>
                <TextInput
                  ref={emailRef}
                  placeholder="you@example.com"
                  placeholderTextColor="#C4CAD4"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={S.textInput}
                  returnKeyType="next"
                  onSubmitEditing={() => pwRef.current?.focus()}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </Animated.View>

            {/* ── Card 2: Password ── */}
            <Animated.View style={[slide(a[4]), S.card]}>
              <Text style={S.cardSectionTitle}>Set Password</Text>

              <Text style={S.label}>Password</Text>
              <View style={iw("password")}>
                <View style={S.inputIcon}><Text style={S.inputIconTxt}>🔒</Text></View>
                <TextInput
                  ref={pwRef}
                  placeholder="Min. 6 characters"
                  placeholderTextColor="#C4CAD4"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  style={[S.textInput,{flex:1}]}
                  returnKeyType="next"
                  onSubmitEditing={() => confirmRef.current?.focus()}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{top:8,bottom:8,left:8,right:8}}>
                  <Text style={S.eyeTxt}>{showPassword ? "○" : "●"}</Text>
                </TouchableOpacity>
              </View>

              <Text style={S.label}>Confirm password</Text>
              <View style={[iw("confirm"),{marginBottom:0}]}>
                <View style={S.inputIcon}><Text style={S.inputIconTxt}>🔒</Text></View>
                <TextInput
                  ref={confirmRef}
                  placeholder="Re-enter password"
                  placeholderTextColor="#C4CAD4"
                  secureTextEntry={!showConfirmPw}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  style={[S.textInput,{flex:1}]}
                  returnKeyType="done"
                  onSubmitEditing={handleSignup}
                  onFocus={() => setFocusedField("confirm")}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity onPress={() => setShowConfirmPw(!showConfirmPw)} hitSlop={{top:8,bottom:8,left:8,right:8}}>
                  <Text style={S.eyeTxt}>{showConfirmPw ? "○" : "●"}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Password strength hint */}
            <Animated.View style={[slide(a[5]), S.hintRow]}>
              {["6+ chars","One number","Secure"].map((h,i) => (
                <View key={i} style={[S.hintChip, password.length >= [6,8,12][i] && S.hintChipActive]}>
                  <Text style={[S.hintTxt, password.length >= [6,8,12][i] && S.hintTxtActive]}>✓ {h}</Text>
                </View>
              ))}
            </Animated.View>

            {/* ── Create Account Button ── */}
            <Animated.View style={[slide(a[6]), { transform:[{scale:btnScale}] }]}>
              <TouchableOpacity
                style={[S.btn, loading && S.btnDisabled]}
                onPress={handleSignup}
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
                  <Text style={S.btnTxt}>Create account</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* ── Terms note ── */}
            <Animated.View style={[slide(a[7]), { alignItems:"center", marginTop:14 }]}>
              <Text style={S.terms}>
                By signing up you agree to our{" "}
                <Text style={{ color:"#3B82F6", fontWeight:"600" }}>Terms</Text>
                {" & "}
                <Text style={{ color:"#3B82F6", fontWeight:"600" }}>Privacy Policy</Text>
              </Text>
            </Animated.View>

            {/* ── Login link ── */}
            <Animated.View style={[slide(a[8]), S.loginRow]}>
              <Text style={S.loginPrompt}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{top:8,bottom:8,left:4,right:4}}>
                <Text style={S.loginLink}>  Sign in</Text>
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
    paddingHorizontal:20,
    paddingTop: height * 0.05,
    paddingBottom:48,
  },

  // Top row: back + logo
  topRow: {
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    marginBottom:28,
  },
  backBtn: {
    width:42, height:42, borderRadius:13,
    backgroundColor:"#FFFFFF",
    borderWidth:1, borderColor:"#E5E7EB",
    alignItems:"center", justifyContent:"center",
    shadowColor:"#000", shadowOffset:{width:0,height:1},
    shadowOpacity:0.06, shadowRadius:4, elevation:2,
  },
  backArrow: { color:"#374151", fontSize:20, lineHeight:22 },

  // Logo row — same as dashboard
  logoRow:  { flexDirection:"row", alignItems:"center", gap:8 },
  logoWrap: { width:30, height:30, position:"relative" },
  dBlue: {
    position:"absolute", top:1, left:3,
    width:15, height:15,
    backgroundColor:"#3B82F6",
    transform:[{rotate:"45deg"}], borderRadius:3,
  },
  dGreen: {
    position:"absolute", bottom:1, right:0,
    width:12, height:12,
    backgroundColor:"#A3E635",
    transform:[{rotate:"45deg"}], borderRadius:2,
  },
  logoTxt: { fontSize:18, fontWeight:"900", color:"#1C1C1E", letterSpacing:-0.4 },

  heading: {
    fontSize:26,
    fontWeight:"900",
    color:"#1C1C1E",
    letterSpacing:-0.8,
    marginBottom:6,
  },
  sub: {
    fontSize:14,
    color:"#9CA3AF",
    fontWeight:"500",
    marginBottom:24,
    lineHeight:20,
  },

  // Role toggle — same pattern as tab bar in dashboard
  roleSection: { marginBottom:16 },
  label: {
    fontSize:13,
    fontWeight:"700",
    color:"#374151",
    marginBottom:8,
    letterSpacing:0.1,
  },
  roleWrap: {
    flexDirection:"row",
    backgroundColor:"#E9EAEC",
    borderRadius:14,
    padding:4,
    gap:4,
  },
  roleBtn: {
    flex:1, paddingVertical:10,
    borderRadius:10, alignItems:"center",
  },
  roleBtnActive: {
    backgroundColor:"#1C1C1E",
    shadowColor:"#000",
    shadowOffset:{width:0,height:3},
    shadowOpacity:0.12,
    shadowRadius:6,
    elevation:3,
  },
  roleTxt:       { color:"#9CA3AF", fontSize:14, fontWeight:"600" },
  roleTxtActive: { color:"#FFF", fontWeight:"800" },

  // Card — same shadow as dashboard
  card: {
    backgroundColor:"#FFFFFF",
    borderRadius:22,
    padding:20,
    marginBottom:14,
    shadowColor:"#000",
    shadowOffset:{ width:0, height:2 },
    shadowOpacity:0.06,
    shadowRadius:10,
    elevation:3,
  },
  cardSectionTitle: {
    fontSize:13,
    fontWeight:"800",
    color:"#9CA3AF",
    letterSpacing:0.6,
    textTransform:"uppercase",
    marginBottom:16,
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
    marginBottom:16,
  },
  inputFocus: {
    borderColor:"#3B82F6",
    backgroundColor:"#EFF6FF",
  },
  inputIcon: {
    marginRight:10, width:22, alignItems:"center",
  },
  inputIconTxt: {
    fontSize:16, color:"#9CA3AF",
  },
  textInput: {
    flex:1, color:"#1C1C1E",
    fontSize:15, fontWeight:"500",
    paddingVertical:0,
  },
  eyeTxt: { color:"#9CA3AF", fontSize:13, paddingLeft:8 },

  // Password strength hints
  hintRow: {
    flexDirection:"row",
    gap:8,
    marginBottom:20,
    marginTop:-4,
  },
  hintChip: {
    paddingHorizontal:10, paddingVertical:5,
    borderRadius:20,
    backgroundColor:"#F3F4F6",
    borderWidth:1, borderColor:"#E5E7EB",
  },
  hintChipActive: {
    backgroundColor:"#D1FAE5",
    borderColor:"#10B981",
  },
  hintTxt:       { color:"#9CA3AF", fontSize:11, fontWeight:"600" },
  hintTxtActive: { color:"#059669", fontWeight:"700" },

  // Button — matches dashboard "Add Order" button
  btn: {
    backgroundColor:"#1C1C1E",
    borderRadius:14,
    height:54,
    alignItems:"center",
    justifyContent:"center",
    shadowColor:"#1C1C1E",
    shadowOffset:{width:0,height:6},
    shadowOpacity:0.2,
    shadowRadius:14,
    elevation:7,
    marginBottom:8,
  },
  btnDisabled: { backgroundColor:"#6B7280" },
  btnTxt: {
    color:"#FFF",
    fontSize:16,
    fontWeight:"800",
    letterSpacing:0.2,
  },
  dotsRow: { flexDirection:"row", alignItems:"center" },
  dot: { width:7, height:7, borderRadius:4, backgroundColor:"rgba(255,255,255,0.7)" },

  terms: {
    color:"#9CA3AF",
    fontSize:12,
    textAlign:"center",
    lineHeight:18,
  },

  loginRow: {
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
    marginTop:18,
  },
  loginPrompt: { color:"#6B7280", fontSize:14, fontWeight:"500" },
  loginLink:   { color:"#3B82F6", fontSize:14, fontWeight:"800" },

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
    borderWidth:1, borderColor:"#F3F4F6",
    shadowColor:"#000",
    shadowOffset:{width:0,height:6},
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