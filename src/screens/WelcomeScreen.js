import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* BACKGROUND IMAGE WITH OVERLAY */}
      <ImageBackground
        source={require("../../assets/machine.png")} // Use your tailor image
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(15, 23, 42, 0.7)', 'rgba(15, 23, 42, 0.95)']}
          style={StyleSheet.absoluteFill}
        />

        <SafeAreaView style={styles.safe}>
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* LOGO/BRAND */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="cut" size={50} color="#FFF" />
              </View>
              <Text style={styles.brandName}>TailorPro</Text>
            </View>

            {/* HERO TEXT */}
            <View style={styles.heroText}>
              <Text style={styles.title}>Control Everything</Text>
              <Text style={styles.title}>in One Place</Text>
              <Text style={styles.subtitle}>
                Manage your tailoring business with ease
              </Text>
            </View>

            {/* BOTTOM ACTIONS */}
            <View style={styles.bottomActions}>
              {/* GET STARTED BUTTON */}
              <TouchableOpacity
                style={styles.getStartedBtn}
                onPress={() => navigation.navigate("Signup")}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#3B82F6', '#8B5CF6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <Text style={styles.getStartedText}>Get Started</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>

              {/* LOGIN LINK */}
              <View style={styles.loginRow}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                  <Text style={styles.loginLink}>Login</Text>
                </TouchableOpacity>
              </View>

              {/* PAGINATION DOTS */}
              <View style={styles.pagination}>
                <View style={[styles.dot, styles.dotActive]} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
            </View>
          </Animated.View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 50,
  },

  // Logo
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 1,
  },

  // Hero text
  heroText: {
    flex: 1,
    justifyContent: 'center',
    marginTop: -50,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFF',
    lineHeight: 50,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 16,
    lineHeight: 26,
  },

  // Bottom actions
  bottomActions: {
    gap: 20,
  },
  getStartedBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  gradientButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  getStartedText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },

  // Login row
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 15,
  },
  loginLink: {
    color: '#3B82F6',
    fontSize: 15,
    fontWeight: '700',
  },

  // Pagination
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#3B82F6',
  },
});