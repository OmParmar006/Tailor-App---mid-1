import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

// ─────────────────────────────────────────────
// Sewing Machine — drawn purely with Views
// ─────────────────────────────────────────────
function SewingMachine({ size = 80 }) {
  const u = size / 80; // unit scale

  return (
    <View style={{ width: size, height: size * 0.75 }}>

      {/* ── Top arm (C-shape body) ── */}
      <View style={{
        position: "absolute",
        top: 0, left: size * 0.1,
        width: size * 0.72,
        height: size * 0.38,
        borderTopLeftRadius: size * 0.19,
        borderTopRightRadius: size * 0.14,
        borderWidth: 5 * u,
        borderBottomWidth: 0,
        borderColor: "#1C1C1E",
      }} />

      {/* ── Bobbin wheel (right side of arm) ── */}
      <View style={{
        position: "absolute",
        top: size * 0.04,
        right: size * 0.06,
        width: size * 0.2,
        height: size * 0.2,
        borderRadius: size * 0.1,
        borderWidth: 3.5 * u,
        borderColor: "#3B82F6",
      }} />
      {/* Bobbin center */}
      <View style={{
        position: "absolute",
        top: size * 0.105,
        right: size * 0.135,
        width: size * 0.05,
        height: size * 0.05,
        borderRadius: size * 0.025,
        backgroundColor: "#A3E635",
      }} />

      {/* ── Needle bar (vertical column) ── */}
      <View style={{
        position: "absolute",
        top: size * 0.3,
        left: size * 0.175,
        width: 4 * u,
        height: size * 0.26,
        backgroundColor: "#1C1C1E",
        borderRadius: 2,
      }} />

      {/* ── Needle tip ── */}
      <View style={{
        position: "absolute",
        top: size * 0.53,
        left: size * 0.145,
        width: size * 0.065,
        height: size * 0.065,
        borderRadius: size * 0.032,
        backgroundColor: "#3B82F6",
      }} />

      {/* ── Thread line from needle to spool ── */}
      {/* (simulated as a thin angled view - just a hint) */}
      <View style={{
        position: "absolute",
        top: size * 0.08,
        left: size * 0.195,
        width: 2 * u,
        height: size * 0.26,
        backgroundColor: "#A3E635",
        opacity: 0.7,
        borderRadius: 1,
        transform: [{ rotate: "8deg" }],
      }} />

      {/* ── Base body ── */}
      <View style={{
        position: "absolute",
        bottom: 0, left: 0,
        width: size,
        height: size * 0.24,
        backgroundColor: "#1C1C1E",
        borderRadius: 10 * u,
      }} />

      {/* ── Feed slots on base ── */}
      {[0.2, 0.34, 0.48].map((x, i) => (
        <View key={i} style={{
          position: "absolute",
          bottom: size * 0.07,
          left: size * x,
          width: size * 0.09,
          height: size * 0.045,
          backgroundColor: "#F2F3F7",
          borderRadius: 2,
          opacity: 0.6,
        }} />
      ))}

      {/* ── Presser foot ── */}
      <View style={{
        position: "absolute",
        bottom: size * 0.24,
        left: size * 0.115,
        width: size * 0.12,
        height: size * 0.04,
        backgroundColor: "#3B82F6",
        borderRadius: 3,
      }} />
    </View>
  );
}

// ─────────────────────────────────────────────
// Needle animation — bobs up and down
// ─────────────────────────────────────────────
function AnimatedMachine({ size = 80 }) {
  const needleBob = useRef(new Animated.Value(0)).current;
  const scaleIn   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleIn, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(needleBob, { toValue: 1, duration: 350, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(needleBob, { toValue: 0, duration: 350, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.delay(600),
      ])
    ).start();
  }, []);

  const needleY = needleBob.interpolate({ inputRange: [0, 1], outputRange: [0, size * 0.08] });

  return (
    <Animated.View style={{
      transform: [{ scale: scaleIn }],
      opacity: scaleIn,
    }}>
      {/* Machine body is static, only needle group moves */}
      <SewingMachine size={size} />
      {/* Animated needle overlay — moves down over the static one */}
      <Animated.View style={{
        position: "absolute",
        top: size * 0.3,
        left: size * 0.175,
        transform: [{ translateY: needleY }],
      }}>
        <View style={{
          width: 4,
          height: size * 0.26,
          backgroundColor: "#3B82F6",
          borderRadius: 2,
          opacity: 0.85,
        }} />
      </Animated.View>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────
// Orbiting dashed ring
// ─────────────────────────────────────────────
function OrbitRing({ size, delay, duration = 9000 }) {
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
      width: size, height: size,
      borderRadius: size / 2,
      borderWidth: 1.2,
      borderColor: "rgba(59,130,246,0.15)",
      borderStyle: "dashed",
      transform: [{ rotate: spin }, { scale: appear }],
      opacity: appear,
    }}>
      <View style={{
        position: "absolute", top: -5,
        alignSelf: "center",
        width: 10, height: 10, borderRadius: 5,
        backgroundColor: "#3B82F6",
        opacity: 0.5,
      }} />
    </Animated.View>
  );
}

// ─────────────────────────────────────────────
// Letter-by-letter drop in
// ─────────────────────────────────────────────
function DroppingWord({ text, textStyle, color }) {
  const anims = useRef(text.split("").map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(40,
      anims.map(a => Animated.spring(a, { toValue: 1, tension: 80, friction: 9, useNativeDriver: true }))
    ).start();
  }, []);

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
      {text.split("").map((char, i) => (
        <Animated.Text key={i} style={[
          textStyle,
          { color },
          {
            opacity: anims[i],
            transform: [{ translateY: anims[i].interpolate({ inputRange: [0, 1], outputRange: [-24, 0] }) }],
          },
        ]}>
          {char === " " ? "\u00A0" : char}
        </Animated.Text>
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────
// Stitch line — draws itself left to right
// ─────────────────────────────────────────────
function StitchLine({ delay = 600 }) {
  const w = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(w, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
    ]).start();
  }, []);

  return (
    <View style={{ height: 18, justifyContent: "center", marginVertical: 8 }}>
      <Animated.View style={{ width: w.interpolate({ inputRange: [0, 1], outputRange: [0, width - 56] }), height: 2, overflow: "hidden" }}>
        <View style={{ flexDirection: "row", gap: 6 }}>
          {Array.from({ length: 36 }).map((_, i) => (
            <View key={i} style={{
              width: 8, height: 2, borderRadius: 1,
              backgroundColor: i % 2 === 0 ? "#3B82F6" : "#A3E635",
              opacity: 0.45,
            }} />
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

// ─────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────
export default function WelcomeScreen({ navigation }) {
  const logoAnim   = useRef(new Animated.Value(0)).current;
  const tagAnim    = useRef(new Animated.Value(0)).current;
  const heroAnim   = useRef(new Animated.Value(0)).current;
  const ctaAnim    = useRef(new Animated.Value(0)).current;
  const btnScale   = useRef(new Animated.Value(1)).current;
  const logoFloat  = useRef(new Animated.Value(0)).current;
  const blob1      = useRef(new Animated.Value(0)).current;
  const blob2      = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(blob1, { toValue: 1, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(blob2, { toValue: 1, duration: 1100, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();

    Animated.sequence([
      Animated.spring(logoAnim, { toValue: 1, tension: 48, friction: 8, useNativeDriver: true }),
      Animated.delay(200),
      Animated.spring(tagAnim,  { toValue: 1, tension: 50, friction: 10, useNativeDriver: true }),
      Animated.spring(heroAnim, { toValue: 1, tension: 48, friction: 10, useNativeDriver: true }),
      Animated.spring(ctaAnim,  { toValue: 1, tension: 55, friction: 9,  useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, { toValue: 1, duration: 3200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(logoFloat, { toValue: 0, duration: 3200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const floatY = logoFloat.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });

  const up = (anim, y = 26) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [y, 0] }) }],
  });

  const pressBtn = (cb) => {
    Animated.sequence([
      Animated.timing(btnScale, { toValue: 0.94, duration: 90, useNativeDriver: true }),
      Animated.spring(btnScale, { toValue: 1, tension: 220, friction: 7, useNativeDriver: true }),
    ]).start(cb);
  };

  return (
    <View style={S.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F3F7" />

      {/* Blobs */}
      <Animated.View style={[S.blob1, { opacity: blob1, transform: [{ scale: blob1.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }] }]} />
      <Animated.View style={[S.blob2, { opacity: blob2, transform: [{ scale: blob2.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }] }]} />
      <Animated.View style={[S.blob3, { opacity: blob2 }]} />

      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <View style={S.content}>

          {/* ── Logo section ── */}
          <Animated.View style={[S.logoSection, up(logoAnim, -20)]}>
            <Animated.View style={[S.orbitWrap, { transform: [{ translateY: floatY }] }]}>
              <OrbitRing size={160} delay={500} duration={10000} />
              <OrbitRing size={120} delay={700} duration={7000} />
              <View style={S.logoCard}>
                <AnimatedMachine size={68} />
              </View>
            </Animated.View>

            <Animated.Text style={[S.brand, up(tagAnim, 12)]}>Darji Pro</Animated.Text>
            <Animated.Text style={[S.brandSub, up(tagAnim, 16)]}>Tailor Management System</Animated.Text>
          </Animated.View>

          {/* ── Hero ── */}
          <Animated.View style={[S.heroSection, up(heroAnim, 32)]}>
            <StitchLine delay={900} />
            <View style={S.heroLines}>
              <DroppingWord text="Run your shop" textStyle={S.heroWord} color="#1C1C1E" />
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <DroppingWord text="smarter." textStyle={S.heroAccent} color="#3B82F6" />
                <Animated.View style={[S.greenDot, { opacity: heroAnim }]} />
              </View>
            </View>
            <StitchLine delay={1400} />
          </Animated.View>

          {/* ── CTA ── */}
          <Animated.View style={[S.ctaSection, up(ctaAnim, 30)]}>
            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
              <TouchableOpacity
                activeOpacity={1}
                style={S.btn}
                onPress={() => pressBtn(() => navigation.navigate("Signup"))}
              >
                <Text style={S.btnTxt}>Get Started</Text>
                <View style={S.btnPill}>
                  <Text style={S.btnArrow}>→</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            <View style={S.loginRow}>
              <Text style={S.loginTxt}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")} hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}>
                <Text style={S.loginLink}> Sign in</Text>
              </TouchableOpacity>
            </View>

            <View style={S.dotsRow}>
              <View style={[S.dot, S.dotActive]} />
              <View style={S.dot} />
              <View style={S.dot} />
            </View>
          </Animated.View>

        </View>
      </SafeAreaView>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F2F3F7" },

  blob1: {
    position: "absolute", top: -100, right: -80,
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: "rgba(59,130,246,0.07)",
  },
  blob2: {
    position: "absolute", bottom: -80, left: -60,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: "rgba(163,230,53,0.07)",
  },
  blob3: {
    position: "absolute", top: height * 0.38, right: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: "rgba(59,130,246,0.04)",
  },

  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: height * 0.03,
    paddingBottom: 36,
    justifyContent: "space-between",
  },

  // Logo
  logoSection: { alignItems: "center", paddingTop: 16 },
  orbitWrap: {
    width: 180, height: 180,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  logoCard: {
    width: 110, height: 110,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09,
    shadowRadius: 20,
    elevation: 8,
  },
  brand: {
    fontSize: 28,
    fontWeight: "900",
    color: "#1C1C1E",
    letterSpacing: -0.8,
    marginBottom: 4,
  },
  brandSub: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
    letterSpacing: 0.4,
  },

  // Hero
  heroSection: { paddingVertical: 4 },
  heroLines: { gap: 0, paddingHorizontal: 2 },
  heroWord: {
    fontSize: 44,
    fontWeight: "900",
    letterSpacing: -1.6,
    lineHeight: 54,
  },
  heroAccent: {
    fontSize: 44,
    fontWeight: "900",
    letterSpacing: -1.6,
    lineHeight: 54,
  },
  greenDot: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: "#A3E635",
    marginBottom: 6,
  },

  // CTA
  ctaSection: { gap: 16 },
  btn: {
    backgroundColor: "#1C1C1E",
    borderRadius: 18,
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    shadowColor: "#1C1C1E",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 10,
  },
  btnTxt: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  btnPill: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    width: 38, height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  btnArrow: { color: "#FFF", fontSize: 16, fontWeight: "800" },

  loginRow: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  loginTxt: { color: "#6B7280", fontSize: 14, fontWeight: "500" },
  loginLink: { color: "#3B82F6", fontSize: 14, fontWeight: "800" },

  dotsRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#E5E7EB" },
  dotActive: { width: 26, backgroundColor: "#1C1C1E" },
});