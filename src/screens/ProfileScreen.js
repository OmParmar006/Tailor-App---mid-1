import React, { useRef, useEffect, useState, useContext } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, StatusBar, Modal, Easing,
  ScrollView, Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../context/AuthContext";

const { width, height } = Dimensions.get("window");

// ─────────────────────────────────────────
// Sewing Machine — same as rest of app
// ─────────────────────────────────────────
function SewingMachine({ size = 80, color = "#1C1C1E" }) {
  const u = size / 80;
  return (
    <View style={{ width: size, height: size * 0.75 }}>
      {/* Arm */}
      <View style={{
        position: "absolute", top: 0, left: size * 0.1,
        width: size * 0.72, height: size * 0.38,
        borderTopLeftRadius: size * 0.19, borderTopRightRadius: size * 0.14,
        borderWidth: Math.max(2, 5 * u), borderBottomWidth: 0,
        borderColor: color,
      }} />
      {/* Bobbin wheel */}
      <View style={{
        position: "absolute", top: size * 0.04, right: size * 0.06,
        width: size * 0.2, height: size * 0.2,
        borderRadius: size * 0.1,
        borderWidth: Math.max(1.5, 3.5 * u), borderColor: "#3B82F6",
      }} />
      {/* Bobbin centre */}
      <View style={{
        position: "absolute", top: size * 0.105, right: size * 0.135,
        width: size * 0.05, height: size * 0.05,
        borderRadius: size * 0.025, backgroundColor: "#A3E635",
      }} />
      {/* Needle bar */}
      <View style={{
        position: "absolute", top: size * 0.3, left: size * 0.175,
        width: Math.max(2, 4 * u), height: size * 0.26,
        backgroundColor: color, borderRadius: 2,
      }} />
      {/* Needle tip */}
      <View style={{
        position: "absolute", top: size * 0.53, left: size * 0.145,
        width: size * 0.065, height: size * 0.065,
        borderRadius: size * 0.032, backgroundColor: "#3B82F6",
      }} />
      {/* Thread */}
      <View style={{
        position: "absolute", top: size * 0.08, left: size * 0.195,
        width: Math.max(1, 2 * u), height: size * 0.26,
        backgroundColor: "#A3E635", opacity: 0.7, borderRadius: 1,
        transform: [{ rotate: "8deg" }],
      }} />
      {/* Base */}
      <View style={{
        position: "absolute", bottom: 0, left: 0,
        width: size, height: size * 0.24,
        backgroundColor: color, borderRadius: Math.max(4, 10 * u),
      }} />
      {/* Feed slots */}
      {[0.2, 0.34, 0.48].map((x, i) => (
        <View key={i} style={{
          position: "absolute", bottom: size * 0.07, left: size * x,
          width: size * 0.09, height: size * 0.045,
          backgroundColor: "#F2F3F7", borderRadius: 2, opacity: 0.6,
        }} />
      ))}
      {/* Presser foot */}
      <View style={{
        position: "absolute", bottom: size * 0.24, left: size * 0.115,
        width: size * 0.12, height: size * 0.04,
        backgroundColor: "#3B82F6", borderRadius: 3,
      }} />
    </View>
  );
}

// Needle bobs up and down
function AnimatedMachine({ size = 80 }) {
  const needleBob = useRef(new Animated.Value(0)).current;
  const scaleIn   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleIn, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(needleBob, { toValue: 1, duration: 350, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(needleBob, { toValue: 0, duration: 350, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.delay(700),
      ])
    ).start();
  }, []);

  const needleY = needleBob.interpolate({ inputRange: [0, 1], outputRange: [0, size * 0.08] });

  return (
    <Animated.View style={{ transform: [{ scale: scaleIn }], opacity: scaleIn }}>
      <View style={{ position: "relative" }}>
        <SewingMachine size={size} />
        <Animated.View style={{
          position: "absolute", top: size * 0.3, left: size * 0.175,
          transform: [{ translateY: needleY }],
        }}>
          <View style={{
            width: Math.max(2, size * 0.05), height: size * 0.26,
            backgroundColor: "#3B82F6", borderRadius: 2, opacity: 0.85,
          }} />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

// ─────────────────────────────────────────
// Orbit ring — same as WelcomeScreen
// ─────────────────────────────────────────
function OrbitRing({ size, delay = 0, duration = 9000, dotColor = "#3B82F6" }) {
  const rotate = useRef(new Animated.Value(0)).current;
  const appear = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.spring(appear, { toValue: 1, tension: 40, friction: 9, useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.timing(rotate, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <Animated.View style={{
      position: "absolute",
      width: size, height: size, borderRadius: size / 2,
      borderWidth: 1.2,
      borderColor: "rgba(59,130,246,0.15)",
      borderStyle: "dashed",
      transform: [{ rotate: spin }, { scale: appear }],
      opacity: appear,
    }}>
      <View style={{
        position: "absolute", top: -5, alignSelf: "center",
        width: 9, height: 9, borderRadius: 4.5,
        backgroundColor: dotColor, opacity: 0.55,
      }} />
    </Animated.View>
  );
}

// ─────────────────────────────────────────
// Info row — matches dashboard card style
// ─────────────────────────────────────────
function InfoRow({ icon, label, value, delay }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.spring(anim, { toValue: 1, tension: 55, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[IR.row, {
      opacity: anim,
      transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
    }]}>
      <View style={IR.iconBox}>
        <Text style={IR.iconTxt}>{icon}</Text>
      </View>
      <View style={IR.textGroup}>
        <Text style={IR.label}>{label}</Text>
        <Text style={IR.value}>{value}</Text>
      </View>
    </Animated.View>
  );
}

const IR = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16, padding: 14,
    marginBottom: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    borderWidth: 1, borderColor: "#F3F4F6",
  },
  iconBox: {
    width: 42, height: 42, borderRadius: 13,
    backgroundColor: "#EFF6FF",
    alignItems: "center", justifyContent: "center",
    marginRight: 14,
  },
  iconTxt: { fontSize: 18 },
  textGroup: { flex: 1 },
  label: { fontSize: 11, color: "#9CA3AF", fontWeight: "600", marginBottom: 3, letterSpacing: 0.3 },
  value: { fontSize: 15, color: "#1C1C1E", fontWeight: "700" },
});

// ─────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────
export default function ProfileScreen({ navigation }) {
  const { logout, user } = useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false);

  const displayName  = user?.name || user?.displayName || "Yogi's Tailoring";
  const displayEmail = user?.email || "om@gmail.com";
  const phone        = user?.phone || "+91 98765 43210";
  const location     = user?.location || "Anand, Gujarat";
  const initial      = displayName.charAt(0).toUpperCase();

  // Entry anims
  const headerAnim  = useRef(new Animated.Value(0)).current;
  const cardAnim    = useRef(new Animated.Value(0)).current;
  const infoAnim    = useRef(new Animated.Value(0)).current;
  const btnAnim     = useRef(new Animated.Value(0)).current;
  const btnScale    = useRef(new Animated.Value(1)).current;
  const logoFloat   = useRef(new Animated.Value(0)).current;
  const modalScale  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(80, [
      Animated.spring(headerAnim, { toValue: 1, tension: 55, friction: 9, useNativeDriver: true }),
      Animated.spring(cardAnim,   { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
      Animated.spring(infoAnim,   { toValue: 1, tension: 50, friction: 9, useNativeDriver: true }),
      Animated.spring(btnAnim,    { toValue: 1, tension: 55, friction: 9, useNativeDriver: true }),
    ]).start();

    // Gentle logo float
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(logoFloat, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const up = (anim, y = 24) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [y, 0] }) }],
  });

  const floatY = logoFloat.interpolate({ inputRange: [0, 1], outputRange: [0, -7] });

  const openModal = () => {
    setModalVisible(true);
    Animated.spring(modalScale, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }).start();
  };

  const closeModal = () => {
    Animated.timing(modalScale, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => setModalVisible(false));
  };

  const handleLogout = async () => {
    closeModal();
    setTimeout(async () => {
      try { await logout(); navigation.replace("Login"); } catch (e) { console.log(e); }
    }, 200);
  };

  const pressLogout = () => {
    Animated.sequence([
      Animated.timing(btnScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.spring(btnScale, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }),
    ]).start(() => openModal());
  };

  return (
    <View style={S.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F3F7" />

      {/* Same blobs as Login/Signup/Welcome */}
      <View style={S.blob1} />
      <View style={S.blob2} />

      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>

        {/* ── Header ── */}
        <Animated.View style={[S.headerRow, up(headerAnim, -16)]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={S.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={S.backArrow}>←</Text>
          </TouchableOpacity>

          <Text style={S.headerTitle}>Profile</Text>

          {/* Language toggle matching dashboard */}
          <View style={S.langWrap}>
            <View style={S.langActive}><Text style={S.langActiveTxt}>EN</Text></View>
            <Text style={S.langOther}>ગુ</Text>
          </View>
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={S.scroll}
          bounces={false}
        >

          {/* ── Profile hero card ── */}
          <Animated.View style={[S.heroCard, up(cardAnim, 24)]}>

            {/* Orbit + machine logo — same as WelcomeScreen */}
            <Animated.View style={[S.orbitWrap, { transform: [{ translateY: floatY }] }]}>
              <OrbitRing size={170} delay={400}  duration={10000} dotColor="#3B82F6" />
              <OrbitRing size={128} delay={650}  duration={7000}  dotColor="#A3E635" />

              {/* White card behind machine */}
              <View style={S.machineCard}>
                <AnimatedMachine size={68} />
              </View>
            </Animated.View>

            {/* Name & email */}
            <Text style={S.name}>{displayName}</Text>
            <Text style={S.email}>{displayEmail}</Text>

            {/* Role badge */}
            <View style={S.roleBadge}>
              <View style={S.roleDot} />
              <Text style={S.roleTxt}>Owner · Active</Text>
            </View>

          </Animated.View>

          {/* ── Business Information ── */}
          <Animated.View style={up(infoAnim, 20)}>
            <Text style={S.sectionTitle}>Business Information</Text>
          </Animated.View>


          <InfoRow icon="📞" label="Phone Number"  value={phone}        delay={390} />
          <InfoRow icon="📍" label="Location"      value={location}     delay={480} />
          <InfoRow icon="✉️" label="Email Address" value={displayEmail} delay={570} />

          {/* ── Logout button ── */}
          <Animated.View style={[{ transform: [{ scale: btnScale }] }, up(btnAnim, 22), { marginTop: 16 }]}>
            <TouchableOpacity
              style={S.logoutBtn}
              onPress={pressLogout}
              activeOpacity={1}
            >

              <Text style={S.logoutTxt}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[up(btnAnim, 16), S.versionRow]}>
            <Text style={S.versionTxt}>Darji Pro · v1.0.0</Text>
          </Animated.View>

        </ScrollView>
      </SafeAreaView>

      {/* ── Logout confirmation modal ── */}
      <Modal transparent visible={modalVisible} animationType="none" onRequestClose={closeModal}>
        <View style={S.overlay}>
          <Animated.View style={[S.modalBox, { transform: [{ scale: modalScale }], opacity: modalScale }]}>

            {/* Modal machine icon */}
            <View style={S.modalIconWrap}>
              <SewingMachine size={44} />
            </View>

            <Text style={S.modalTitle}>Logout</Text>
            <Text style={S.modalSub}>You'll need to sign in again to access your orders and customers.</Text>

            <View style={S.modalBtns}>
              <TouchableOpacity onPress={closeModal} style={S.cancelBtn} activeOpacity={0.8}>
                <Text style={S.cancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout} style={S.confirmBtn} activeOpacity={0.8}>
                <Text style={S.confirmTxt}>Logout</Text>
              </TouchableOpacity>
            </View>

          </Animated.View>
        </View>
      </Modal>

    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F2F3F7" },

  // Blobs — identical to Login/Signup
  blob1: {
    position: "absolute", top: -80, right: -60,
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: "rgba(59,130,246,0.08)",
  },
  blob2: {
    position: "absolute", bottom: -60, left: -40,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: "rgba(163,230,53,0.07)",
  },

  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },

  // Header
  headerRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14,
  },
  backBtn: {
    width: 42, height: 42, borderRadius: 13,
    backgroundColor: "#FFFFFF",
    borderWidth: 1, borderColor: "#E5E7EB",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  backArrow: { color: "#374151", fontSize: 20, lineHeight: 22 },
  headerTitle: { fontSize: 18, fontWeight: "900", color: "#1C1C1E", letterSpacing: -0.4 },

  // Language toggle — matches dashboard exactly
  langWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#1C1C1E",
    borderRadius: 22, padding: 3, gap: 2,
  },
  langActive: {
    backgroundColor: "#3B82F6", borderRadius: 18,
    paddingHorizontal: 11, paddingVertical: 5,
  },
  langActiveTxt: { color: "#FFF", fontSize: 12, fontWeight: "700" },
  langOther: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "600", paddingHorizontal: 8 },

  // Hero card
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingTop: 28, paddingBottom: 24,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 18, elevation: 5,
    borderWidth: 1, borderColor: "#F3F4F6",
    overflow: "hidden",
  },

  // Orbit area
  orbitWrap: {
    width: 180, height: 180,
    alignItems: "center", justifyContent: "center",
    marginBottom: 18,
  },
  machineCard: {
    width: 108, height: 108,
    borderRadius: 28,
    backgroundColor: "#F8FAFF",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#3B82F6", shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12, shadowRadius: 16, elevation: 6,
    borderWidth: 1.5, borderColor: "rgba(59,130,246,0.1)",
  },

  name:  { fontSize: 22, fontWeight: "900", color: "#1C1C1E", letterSpacing: -0.5, marginBottom: 5 },
  email: { fontSize: 13, color: "#9CA3AF", fontWeight: "500", marginBottom: 14 },

  roleBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, borderColor: "#BBF7D0",
  },
  roleDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#22C55E" },
  roleTxt: { color: "#16A34A", fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },

  // Section title
  sectionTitle: {
    fontSize: 11, fontWeight: "800", color: "#9CA3AF",
    letterSpacing: 1.2, textTransform: "uppercase",
    marginBottom: 12,
  },

  // Logout button
  logoutBtn: {
    backgroundColor: "#1C1C1E",
    borderRadius: 16, height: 58,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 12, elevation: 4,
  },
  logoutIcon: { fontSize: 18 },
  logoutTxt:  { color: "#FFFFFF", fontSize: 18, fontWeight: "800", letterSpacing: 0.2 },

  versionRow: { alignItems: "center", marginTop: 18 },
  versionTxt: { fontSize: 11, color: "#D1D5DB", fontWeight: "500" },

  // Modal overlay
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.22)",
    justifyContent: "center", alignItems: "center",
  },
  modalBox: {
    width: width * 0.86,
    backgroundColor: "#FFFFFF",
    borderRadius: 26, padding: 26,
    alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.18, shadowRadius: 40, elevation: 20,
    borderWidth: 1, borderColor: "#F3F4F6",
  },
  modalIconWrap: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: "#FFF7F7",
    borderWidth: 1, borderColor: "#FECACA",
    alignItems: "center", justifyContent: "center",
    marginBottom: 18,
  },
  modalTitle: { fontSize: 20, fontWeight: "900", color: "#1C1C1E", letterSpacing: -0.5, marginBottom: 8 },
  modalSub:   { fontSize: 13, color: "#9CA3AF", textAlign: "center", lineHeight: 20, marginBottom: 24 },
  modalBtns:  { flexDirection: "row", gap: 12, width: "100%" },

  cancelBtn: {
    flex: 1, height: 48, borderRadius: 14,
    backgroundColor: "#F3F4F6",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "#E5E7EB",
  },
  cancelTxt: { color: "#6B7280", fontWeight: "700", fontSize: 15 },

  confirmBtn: {
    flex: 1, height: 48, borderRadius: 14,
    backgroundColor: "#EF4444",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#EF4444", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  confirmTxt: { color: "#FFF", fontWeight: "800", fontSize: 15 },
});