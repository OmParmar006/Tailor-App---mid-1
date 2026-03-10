import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../firebaseConfig";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, KeyboardAvoidingView, Platform, Animated,
  Alert, Keyboard, Vibration, Image, StatusBar, Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  addDoc, collection, serverTimestamp,
  query, where, getDocs, limit, orderBy, updateDoc, doc,
} from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { useLanguage } from "../context/LanguageContext";
import { LanguageToggle } from "../context/LanguageToggle";

const { width } = Dimensions.get("window");

const C = {
  bg: "#F0F2F8", card: "#FFFFFF", primary: "#3B82F6", accent: "#6366F1",
  green: "#22C55E", lime: "#A3E635", text: "#0F172A", sub: "#64748B",
  border: "#E2E8F0", inputBg: "#F8FAFC", danger: "#EF4444",
  amber: "#F59E0B", pink: "#EC4899",
};

const generateOrderId = () => {
  const ts  = Date.now().toString().slice(-6);
  const rnd = Math.floor(Math.random() * 100).toString().padStart(2, "0");
  return `ORD-${ts}${rnd}`;
};
const formatDate = (date) =>
  date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const getCalendarDays = (month, year) => {
  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);
  const days  = [];
  for (let i = 0; i < first.getDay(); i++) days.push(null);
  for (let i = 1; i <= last.getDate(); i++) days.push(new Date(year, month, i));
  return days;
};
const POPULAR_CITIES = [
  "Ahmedabad","Vadodara","Surat","Anand","Rajkot",
  "Mumbai","Delhi","Pune","Chennai","Jaipur",
];

// ── Pill badge ──────────────────────────────────────────────────
function Pill({ label, color = C.primary }) {
  return (
    <View style={{ backgroundColor: color + "18", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
      <Text style={{ fontSize: 11, fontWeight: "800", color, letterSpacing: 0.3 }}>{label}</Text>
    </View>
  );
}

// ── Section header ──────────────────────────────────────────────
function SectionLabel({ number, title, subtitle, color = C.primary }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 2 }}>
        <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: color,
          justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "900" }}>{number}</Text>
        </View>
        <Text style={{ fontSize: 15, fontWeight: "900", color: C.text, letterSpacing: -0.3 }}>{title}</Text>
      </View>
      {subtitle && <Text style={{ fontSize: 11, color: C.sub, marginLeft: 36 }}>{subtitle}</Text>}
    </View>
  );
}

// ── Elevated input ──────────────────────────────────────────────
function ElevatedInput({ icon, iconColor, label, required, valid, error, prefix, children, style }) {
  return (
    <View style={[{ marginBottom: 13 }, style]}>
      <View style={{ flexDirection: "row", justifyContent: "space-between",
        alignItems: "center", marginBottom: 6 }}>
        <Text style={{ fontSize: 11, fontWeight: "700", color: C.sub,
          letterSpacing: 0.4, textTransform: "uppercase" }}>
          {label}{required && <Text style={{ color: C.danger }}> *</Text>}
        </Text>
        {valid && <Ionicons name="checkmark-circle" size={15} color={C.green} />}
        {error && <Text style={{ fontSize: 10, color: C.danger, fontWeight: "600" }}>{error}</Text>}
      </View>
      <View style={[EI.wrap, error ? EI.wrapError : valid ? EI.wrapValid : null]}>
        <View style={[EI.iconBox, { backgroundColor: (iconColor || C.primary) + "15" }]}>
          <Ionicons name={icon} size={16} color={iconColor || C.primary} />
        </View>
        {prefix && <Text style={EI.prefix}>{prefix}</Text>}
        {children}
      </View>
    </View>
  );
}

const EI = StyleSheet.create({
  wrap: {
    flexDirection: "row", alignItems: "center", backgroundColor: C.card,
    borderRadius: 14, paddingRight: 14, borderWidth: 1.5, borderColor: C.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2, overflow: "hidden",
  },
  wrapError: { borderColor: C.danger + "80", backgroundColor: "#FFF5F5" },
  wrapValid: { borderColor: C.green + "60" },
  iconBox: { width: 46, height: 46, justifyContent: "center", alignItems: "center", marginRight: 2 },
  prefix: { fontSize: 14, fontWeight: "700", color: C.sub, marginRight: 4 },
});
const EI2 = StyleSheet.create({
  input: { flex: 1, color: C.text, fontSize: 14, fontWeight: "600", paddingVertical: 13 },
});

// ── Main ────────────────────────────────────────────────────────
export default function AddCustomerScreen({ navigation }) {
  const { t } = useLanguage();
  const [orderId] = useState(generateOrderId());
  const [today]   = useState(formatDate(new Date()));

  const [mode, setMode]                   = useState("select");
  const [allCustomers, setAllCustomers]   = useState([]);
  const [searchQuery, setSearchQuery]     = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerMeasurements, setCustomerMeasurements] = useState([]);

  // New customer fields
  const [name, setName]             = useState("");
  const [phone, setPhone]           = useState("");
  const [city, setCity]             = useState("");
  const [address, setAddress]       = useState("");
  const [deliveryDate, setDeliveryDate]         = useState(null);
  const [deliveryDateString, setDeliveryDateString] = useState("");
  const [notes, setNotes]           = useState("");
  const [clothPhotos, setClothPhotos] = useState([]);
  // BUG 2 & 6 FIX: payment fields for new customer
  const [totalAmount, setTotalAmount]     = useState("");
  const [advanceAmount, setAdvanceAmount] = useState("");

  // Returning customer fields
  const [retDeliveryDate, setRetDeliveryDate]         = useState(null);
  const [retDeliveryDateString, setRetDeliveryDateString] = useState("");
  const [retNotes, setRetNotes]           = useState("");
  const [retOrderType, setRetOrderType]   = useState("same");
  const [retClothPhotos, setRetClothPhotos] = useState([]);
  // BUG 2 & 6 FIX: payment fields for returning customer
  const [retTotalAmount, setRetTotalAmount]     = useState("");
  const [retAdvanceAmount, setRetAdvanceAmount] = useState("");

  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});
  const [saving, setSaving]   = useState(false);
  const [showCitySugg, setShowCitySugg] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear]   = useState(new Date().getFullYear());

  const nameRef   = useRef(null);
  const phoneRef  = useRef(null);
  const cityRef   = useRef(null);
  const searchRef = useRef(null);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const modeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();
    loadAllCustomers();
  }, []);

  const animateToMode = (newMode) => {
    Animated.timing(modeAnim, { toValue: 0, duration: 160, useNativeDriver: true }).start(() => {
      setMode(newMode);
      Animated.spring(modeAnim, { toValue: 1, tension: 55, friction: 9, useNativeDriver: true }).start();
      if (newMode === "new")       setTimeout(() => nameRef.current?.focus(), 300);
      if (newMode === "returning") setTimeout(() => searchRef.current?.focus(), 300);
    });
  };

  const loadAllCustomers = async () => {
    try {
      const q    = query(collection(db, "customers"), where("ownerId", "==", auth.currentUser.uid));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const seen = new Set();
      const unique = list.filter((c) => {
        if (seen.has(c.phone)) return false;
        seen.add(c.phone); return true;
      });
      setAllCustomers(unique);
    } catch (e) { console.error(e); }
  };

  const loadCustomerMeasurements = async (customerId) => {
    try {
      const q    = query(
        collection(db, "measurements"),
        where("customerId", "==", customerId),
        orderBy("createdAt", "desc"),
        limit(10),
      );
      const snap = await getDocs(q);
      setCustomerMeasurements(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (e) { setCustomerMeasurements([]); }
  };

  const selectReturningCustomer = (c) => {
    setSelectedCustomer(c);
    loadCustomerMeasurements(c.id);
    Vibration.vibrate(40);
  };

  const filteredCustomers = allCustomers.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.name?.toLowerCase().includes(q) || c.phone?.includes(q) || c.city?.toLowerCase().includes(q);
  });

  // ── Validation ──────────────────────────────────────────────
  const validateField = (field, value) => {
    let msg = "";
    if (field === "name"  && (!value.trim() || value.trim().length < 2)) msg = "Enter valid name";
    if (field === "phone" && !/^[6-9]\d{9}$/.test(value)) msg = "Invalid number";
    if (field === "city"  && !value.trim()) msg = "Required";
    if (field === "totalAmount" && value && isNaN(Number(value))) msg = "Must be a number";
    setErrors((p) => ({ ...p, [field]: msg }));
    return msg === "";
  };

  const handlePhoneChange = (text) => {
    const v = text.replace(/[^0-9]/g, "").slice(0, 10);
    setPhone(v);
    if (v.length >= 1) { setTouched((p) => ({ ...p, phone: true })); validateField("phone", v); }
  };

  const isNewFormValid = () =>
    name.trim().length >= 2 &&
    /^[6-9]\d{9}$/.test(phone) &&
    city.trim().length > 0 &&
    deliveryDate !== null;

  const isRetFormValid = () => selectedCustomer && retDeliveryDate !== null;

  // ── Date helpers ────────────────────────────────────────────
  const quickDates = () => {
    const base = new Date();
    return [
      { label: "Tomorrow", days: 1 },
      { label: "3 Days",   days: 3 },
      { label: "1 Week",   days: 7 },
      { label: "2 Weeks",  days: 14 },
    ].map(({ label, days }) => {
      const d = new Date(base); d.setDate(d.getDate() + days);
      return { label, date: d, formatted: formatDate(d) };
    });
  };

  const selectDate = (opt, isReturning = false) => {
    if (isReturning) { setRetDeliveryDate(opt.date); setRetDeliveryDateString(opt.formatted); }
    else { setDeliveryDate(opt.date); setDeliveryDateString(opt.formatted); setTouched((p) => ({ ...p, deliveryDate: true })); }
    setShowCalendar(false); Vibration.vibrate(25);
  };
  const selectCalDate = (date, isReturning = false) => {
    const now = new Date(); now.setHours(0,0,0,0);
    if (date < now) return;
    const f = formatDate(date);
    if (isReturning) { setRetDeliveryDate(date); setRetDeliveryDateString(f); }
    else { setDeliveryDate(date); setDeliveryDateString(f); }
    setShowCalendar(false); Vibration.vibrate(25);
  };
  const changeMonth = (d) => {
    let m = calMonth + d, y = calYear;
    if (m > 11) { m = 0; y++; } if (m < 0) { m = 11; y--; }
    setCalMonth(m); setCalYear(y);
  };

  // ── Photo helpers ───────────────────────────────────────────
  const showPhotoOptions = (isReturning = false) => {
    Alert.alert("Add Cloth Photo", "How would you like to add a photo?", [
      {
        text: "📷 Camera", onPress: async () => {
          const p = await ImagePicker.requestCameraPermissionsAsync();
          if (!p.granted) return;
          const r = await ImagePicker.launchCameraAsync({ quality: 0.75 });
          if (!r.canceled) {
            if (isReturning) setRetClothPhotos((prev) => [...prev, r.assets[0].uri].slice(0, 4));
            else             setClothPhotos((prev)    => [...prev, r.assets[0].uri].slice(0, 4));
          }
        }
      },
      {
        text: "🖼️ Gallery", onPress: async () => {
          const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!p.granted) return;
          const r = await ImagePicker.launchImageLibraryAsync({ quality: 0.75, allowsMultipleSelection: true });
          if (!r.canceled) {
            const uris = r.assets.map((a) => a.uri);
            if (isReturning) setRetClothPhotos((prev) => [...prev, ...uris].slice(0, 4));
            else             setClothPhotos((prev)    => [...prev, ...uris].slice(0, 4));
          }
        }
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  // ── Save NEW customer ────────────────────────────────────────
  const handleSaveNew = async () => {
    if (!isNewFormValid()) { Alert.alert("Incomplete", "Fill all required fields"); return; }
    setSaving(true);
    try {
      // 1. Find or create customer record
      let customerId;
      const existingQ    = query(
        collection(db, "customers"),
        where("ownerId", "==", auth.currentUser.uid),
        where("phone", "==", phone),
        limit(1)
      );
      const existingSnap = await getDocs(existingQ);

      if (!existingSnap.empty) {
        customerId = existingSnap.docs[0].id;
      } else {
        const customerRef = await addDoc(collection(db, "customers"), {
          ownerId: auth.currentUser.uid,
          name: name.trim(), phone, city: city.trim(),
          address: address.trim(),
          hasReturningOrder: false,   // BUG 4 FIX: track returning flag on customer
          createdAt: serverTimestamp(),
        });
        customerId = customerRef.id;
      }

      // 2. Create order with payment fields (BUG 5 FIX)
      const orderRef = await addDoc(collection(db, "orders"), {
        ownerId: auth.currentUser.uid,
        orderId,
        customerId,
        customerName:  name.trim(),
        customerPhone: phone,
        customerCity:  city.trim(),
        deliveryDate:  deliveryDateString,
        notes:         notes.trim(),
        clothPhotos,
        // BUG 5 FIX: always save payment fields
        totalAmount:   Number(totalAmount)   || 0,
        advanceAmount: Number(advanceAmount) || 0,
        paymentStatus: Number(totalAmount) > 0 && Number(advanceAmount) >= Number(totalAmount)
          ? "Paid" : "Unpaid",
        status:        "pending",
        stage:         "Measurement",
        isReturning:   false,
        createdAt:     serverTimestamp(),
      });

      navigation.navigate("AddMeasurement", {
        customerId, orderId: orderRef.id, orderRefId: orderId, customerName: name.trim(),
      });
    } catch (e) {
      Alert.alert("Error", "Failed to save");
    } finally { setSaving(false); }
  };

  // ── Save RETURNING customer order ────────────────────────────
  const handleSaveReturning = async () => {
    if (!isRetFormValid()) { Alert.alert("Select delivery date", "Please pick a delivery date"); return; }
    setSaving(true);
    try {
      const newOrderId = generateOrderId();

      // BUG 4 FIX: mark customer as having a returning order
      try {
        await updateDoc(doc(db, "customers", selectedCustomer.id), { hasReturningOrder: true });
      } catch (e) { console.warn("Could not update customer returning flag:", e); }

      // BUG 3 FIX: copy ALL measurements, not just the first one
      const stage = retOrderType === "same" ? "Stitching" : "Measurement";

      const orderRef = await addDoc(collection(db, "orders"), {
        ownerId:       auth.currentUser.uid,
        orderId:       newOrderId,
        customerId:    selectedCustomer.id,
        customerName:  selectedCustomer.name,
        customerPhone: selectedCustomer.phone,
        customerCity:  selectedCustomer.city,
        deliveryDate:  retDeliveryDateString,
        notes:         retNotes.trim(),
        clothPhotos:   retClothPhotos,       // BUG 7 FIX: returning customer cloth photos
        // BUG 5 FIX: save payment fields
        totalAmount:   Number(retTotalAmount)   || 0,
        advanceAmount: Number(retAdvanceAmount) || 0,
        paymentStatus: Number(retTotalAmount) > 0 && Number(retAdvanceAmount) >= Number(retTotalAmount)
          ? "Paid" : "Unpaid",
        status:        "pending",
        stage,
        isReturning:   true,
        orderType:     retOrderType,
        createdAt:     serverTimestamp(),
      });

      if (retOrderType === "new_garment") {
        navigation.navigate("AddMeasurement", {
          customerId:   selectedCustomer.id,
          orderId:      orderRef.id,
          orderRefId:   newOrderId,
          customerName: selectedCustomer.name,
        });
      } else {
        // BUG 3 FIX: copy ALL measurements for this customer, not just [0]
        const copiedGarments = [];
        if (customerMeasurements.length > 0) {
          // Group by garment — keep only the latest per garment type
          const latestByGarment = {};
          for (const m of customerMeasurements) {
            const ms = m.createdAt?.toDate?.()?.getTime() || 0;
            if (!latestByGarment[m.garment] || ms > latestByGarment[m.garment].ms)
              latestByGarment[m.garment] = { ...m, ms };
          }

          for (const m of Object.values(latestByGarment)) {
            await addDoc(collection(db, "measurements"), {
              customerId:          selectedCustomer.id,
              orderId:             orderRef.id,
              garment:             m.garment,
              fitType:             m.fitType || "Regular",
              values:              m.values,
              notes:               m.notes || "",
              copiedFromOrderId:   m.orderId || null,
              createdAt:           serverTimestamp(),
            });
            copiedGarments.push(m.garment);
          }
        }

        // BUG 8 FIX: show exactly which garments were copied
        const copiedSummary = copiedGarments.length > 0
          ? `Garments copied: ${copiedGarments.join(", ")}`
          : "No previous measurements found — please add measurements manually.";

        Alert.alert(
          "✅ Order Created!",
          `Order ${newOrderId} for ${selectedCustomer.name}.\n\n${copiedSummary}`,
          [{ text: "Go Home", onPress: () => navigation.navigate("Home") }]
        );
      }
    } catch (e) {
      console.error("handleSaveReturning:", e);
      Alert.alert("Error", "Failed to create order");
    } finally { setSaving(false); }
  };

  // BUG 4 FIX: count customers with hasReturningOrder flag
  const returningCount = allCustomers.filter((c) => c.hasReturningOrder).length;

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <View style={S.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <View style={S.orb1} /><View style={S.orb2} /><View style={S.orb3} />

      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>

          {/* ── Header ── */}
          <Animated.View style={[S.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <TouchableOpacity style={S.backBtn}
              onPress={() => mode === "select" ? navigation.goBack() : animateToMode("select")}>
              <Ionicons name={mode === "select" ? "close" : "arrow-back"} size={20} color={C.text} />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={S.headerTitle}>
                {mode === "select" ? "New Order" : mode === "new" ? "New Customer" : "Returning Customer"}
              </Text>
              <View style={{ flexDirection: "row", gap: 6, marginTop: 3 }}>
                <Pill label={orderId} color={C.sub} />
              </View>
            </View>
            <LanguageToggle />
          </Animated.View>

          {/* ════════════════════ MODE: SELECT ════════════════════ */}
          {mode === "select" && (
            <Animated.View style={[S.selectWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <Text style={S.selectTitle}>Who is this order for?</Text>
              <Text style={S.selectSub}>Choose wisely — we'll skip unnecessary steps</Text>

              <TouchableOpacity style={S.modeCard} onPress={() => animateToMode("new")} activeOpacity={0.85}>
                <View style={[S.modeCardIcon, { backgroundColor: C.primary + "15" }]}>
                  <Ionicons name="person-add-outline" size={28} color={C.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={S.modeCardTitle}>New Customer</Text>
                  <Text style={S.modeCardSub}>First visit? Add their details & take measurements</Text>
                </View>
                <View style={[S.modeCardArrow, { backgroundColor: C.primary + "15" }]}>
                  <Ionicons name="arrow-forward" size={16} color={C.primary} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={[S.modeCard, { shadowColor: C.green }]}
                onPress={() => animateToMode("returning")} activeOpacity={0.85}>
                <View style={[S.modeCardIcon, { backgroundColor: C.green + "15" }]}>
                  <Ionicons name="people-outline" size={28} color={C.green} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={S.modeCardTitle}>Returning Customer</Text>
                  <Text style={S.modeCardSub}>Already visited? Use saved measurements & skip steps</Text>
                </View>
                <View style={[S.modeCardArrow, { backgroundColor: C.green + "15" }]}>
                  <Ionicons name="arrow-forward" size={16} color={C.green} />
                </View>
              </TouchableOpacity>

              <View style={S.infoStrip}>
                <View style={S.infoItem}>
                  <Ionicons name="people" size={18} color={C.primary} />
                  <Text style={[S.infoNum, { color: C.primary }]}>{allCustomers.length}</Text>
                  <Text style={S.infoLabel}>Customers</Text>
                </View>
                <View style={S.infoDivider} />
                {/* BUG 4 FIX: use hasReturningOrder flag */}
                <View style={S.infoItem}>
                  <Ionicons name="repeat" size={18} color={C.green} />
                  <Text style={[S.infoNum, { color: C.green }]}>{returningCount}</Text>
                  <Text style={S.infoLabel}>Returning</Text>
                </View>
                <View style={S.infoDivider} />
                <View style={S.infoItem}>
                  <Ionicons name="calendar" size={18} color={C.amber} />
                  <Text style={[S.infoNum, { color: C.amber, fontSize: 11 }]}>{today}</Text>
                  <Text style={S.infoLabel}>Today</Text>
                </View>
              </View>
            </Animated.View>
          )}

          {/* ════════════════════ MODE: RETURNING ════════════════════ */}
          {mode === "returning" && (
            <ScrollView showsVerticalScrollIndicator={false}
              contentContainerStyle={S.scrollContent} keyboardShouldPersistTaps="handled">
              <Animated.View style={{
                opacity: modeAnim,
                transform: [{ translateY: modeAnim.interpolate({ inputRange:[0,1], outputRange:[20,0] }) }],
              }}>
                <View style={S.searchCard}>
                  <View style={S.searchRow}>
                    <Ionicons name="search" size={18} color={C.primary} />
                    <TextInput ref={searchRef} style={S.searchInput}
                      placeholder="Search by name, phone or city..."
                      placeholderTextColor="#94A3B8" value={searchQuery}
                      onChangeText={setSearchQuery} autoCapitalize="none" />
                    {!!searchQuery && (
                      <TouchableOpacity onPress={() => setSearchQuery("")}>
                        <Ionicons name="close-circle" size={18} color={C.sub} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {selectedCustomer ? (
                  <View>
                    {/* Selected customer card */}
                    <View style={S.selectedCard}>
                      <View style={S.selectedHeader}>
                        <View style={S.selectedAvatar}>
                          <Text style={S.selectedAvatarTxt}>{selectedCustomer.name?.[0]?.toUpperCase()}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={S.selectedName}>{selectedCustomer.name}</Text>
                          <Text style={S.selectedMeta}>📞 {selectedCustomer.phone} · 📍 {selectedCustomer.city}</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => { setSelectedCustomer(null); setCustomerMeasurements([]); }}
                          style={S.changeBtn}>
                          <Ionicons name="create-outline" size={14} color={C.sub} />
                          <Text style={S.changeBtnTxt}>Change</Text>
                        </TouchableOpacity>
                      </View>
                      {customerMeasurements.length > 0 && (
                        <View style={S.prevMeasureWrap}>
                          <Text style={S.prevMeasureTitle}>📐 Saved Measurements</Text>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                            {customerMeasurements.map((m) => (
                              <View key={m.id} style={S.measureChip}>
                                <Text style={S.measureChipGarment}>{m.garment}</Text>
                                <Text style={S.measureChipFit}>{m.fitType}</Text>
                                <Text style={S.measureChipDate}>
                                  {m.createdAt?.toDate?.()?.toLocaleDateString("en-GB",{day:"2-digit",month:"short"})||"Saved"}
                                </Text>
                              </View>
                            ))}
                          </ScrollView>
                        </View>
                      )}
                    </View>

                    {/* Order type */}
                    <View style={S.section}>
                      <SectionLabel number="1" title="Order Type" subtitle="Same garment or a new design?" />
                      <View style={{ flexDirection: "row", gap: 10 }}>
                        {[
                          {key:"same",        label:"Same Garment", sub:"Use saved measurements", icon:"copy-outline",       color:C.primary},
                          {key:"new_garment", label:"New Garment",  sub:"New measurements",       icon:"add-circle-outline", color:C.pink},
                        ].map((opt) => (
                          <TouchableOpacity key={opt.key}
                            style={[S.orderTypeBtn, retOrderType===opt.key && {borderColor:opt.color, backgroundColor:opt.color+"10"}]}
                            onPress={() => { setRetOrderType(opt.key); Vibration.vibrate(25); }}>
                            <View style={[S.orderTypeIconWrap, {backgroundColor:(retOrderType===opt.key?opt.color:C.sub)+"15"}]}>
                              <Ionicons name={opt.icon} size={22} color={retOrderType===opt.key?opt.color:C.sub}/>
                            </View>
                            <Text style={[S.orderTypeTxt, retOrderType===opt.key&&{color:opt.color,fontWeight:"800"}]}>{opt.label}</Text>
                            <Text style={{fontSize:10,color:C.sub,textAlign:"center"}}>{opt.sub}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Delivery date */}
                    <View style={S.section}>
                      <SectionLabel number="2" title="Delivery Date" color={C.accent} />
                      <View style={S.quickDatesGrid}>
                        {quickDates().map((opt) => {
                          const active = retDeliveryDateString === opt.formatted;
                          return (
                            <TouchableOpacity key={opt.label}
                              style={[S.quickDateBtn, active && S.quickDateBtnActive]}
                              onPress={() => selectDate(opt, true)}>
                              <Text style={[S.quickDateLabel, active&&{color:C.accent}]}>{opt.label}</Text>
                              <Text style={[S.quickDateValue, active&&{color:C.accent}]}>{opt.formatted}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                      <TouchableOpacity style={S.customDateBtn} onPress={() => setShowCalendar((p) => !p)}>
                        <Ionicons name="calendar-outline" size={16} color={retDeliveryDate?C.accent:C.sub}/>
                        <Text style={[S.customDateTxt, retDeliveryDate&&{color:C.accent,fontWeight:"700"}]}>
                          {retDeliveryDate ? retDeliveryDateString : "Pick custom date"}
                        </Text>
                        <Ionicons name={showCalendar?"chevron-up":"chevron-down"} size={15} color={C.sub}/>
                      </TouchableOpacity>
                      {showCalendar && (
                        <CalendarView month={calMonth} year={calYear} selected={retDeliveryDate}
                          onSelect={(d) => selectCalDate(d, true)} onChangeMonth={changeMonth}/>
                      )}
                    </View>

                    {/* BUG 6 FIX: Payment fields for returning customer */}
                    <View style={S.section}>
                      <SectionLabel number="3" title="Payment Details" subtitle="Enter order amount" color="#10B981" />
                      <ElevatedInput icon="cash" iconColor="#10B981" label="Total Amount" prefix="₹">
                        <TextInput style={EI2.input} placeholder="0" placeholderTextColor="#94A3B8"
                          value={retTotalAmount} keyboardType="numeric"
                          onChangeText={(v) => setRetTotalAmount(v.replace(/[^0-9]/g,""))}/>
                      </ElevatedInput>
                      <ElevatedInput icon="card" iconColor={C.primary} label="Advance Received" prefix="₹">
                        <TextInput style={EI2.input} placeholder="0" placeholderTextColor="#94A3B8"
                          value={retAdvanceAmount} keyboardType="numeric"
                          onChangeText={(v) => setRetAdvanceAmount(v.replace(/[^0-9]/g,""))}/>
                      </ElevatedInput>
                      {retTotalAmount !== "" && (
                        <View style={{ backgroundColor: "#F0FDF4", borderRadius: 10, padding: 10,
                          borderWidth:1, borderColor:"#BBF7D0" }}>
                          <Text style={{ color:"#059669", fontSize:12, fontWeight:"700" }}>
                            Balance: ₹{Math.max(0, Number(retTotalAmount) - Number(retAdvanceAmount || 0))}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* BUG 7 FIX: Cloth photos for returning customer */}
                    <View style={S.section}>
                      <SectionLabel number="4" title="Cloth Photos" subtitle="Attach fabric / design reference (max 4)" color={C.amber} />
                      <View style={S.photoGrid}>
                        {retClothPhotos.map((uri, i) => (
                          <View key={i} style={S.photoThumb}>
                            <Image source={{ uri }} style={S.photoImg} />
                            <TouchableOpacity style={S.photoRemove}
                              onPress={() => setRetClothPhotos((p) => p.filter((_,j)=>j!==i))}>
                              <Ionicons name="close-circle" size={20} color="#FFF" />
                            </TouchableOpacity>
                          </View>
                        ))}
                        {retClothPhotos.length < 4 && (
                          <TouchableOpacity style={S.photoAdd} onPress={() => showPhotoOptions(true)}>
                            <View style={S.photoAddIcon}>
                              <Ionicons name="camera-outline" size={22} color={C.amber} />
                            </View>
                            <Text style={[S.photoAddTxt, { color: C.amber }]}>Add Photo</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>

                    {/* Notes */}
                    <View style={S.section}>
                      <SectionLabel number="5" title="Notes (Optional)" color={C.sub} />
                      <View style={S.notesBox}>
                        <TextInput style={S.notesInput}
                          placeholder="Any special instructions for this order..."
                          placeholderTextColor="#94A3B8" value={retNotes}
                          onChangeText={setRetNotes} multiline numberOfLines={3} textAlignVertical="top"/>
                      </View>
                    </View>
                    <View style={{ height: 100 }} />
                  </View>
                ) : (
                  <View>
                    {filteredCustomers.length === 0 ? (
                      <View style={S.emptyWrap}>
                        <View style={S.emptyIconWrap}>
                          <Ionicons name="people-outline" size={40} color={C.sub} />
                        </View>
                        <Text style={S.emptyTxt}>{searchQuery ? "No customers found" : "No customers yet"}</Text>
                        <Text style={{ color:C.sub, fontSize:13, textAlign:"center" }}>
                          {searchQuery ? "Try a different name or phone" : "Add your first customer above"}
                        </Text>
                      </View>
                    ) : (
                      filteredCustomers.map((c) => (
                        <TouchableOpacity key={c.id} style={S.customerRow}
                          onPress={() => selectReturningCustomer(c)} activeOpacity={0.8}>
                          <View style={S.custAvatar}>
                            <Text style={S.custAvatarTxt}>{c.name?.[0]?.toUpperCase()}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={S.custName}>{c.name}</Text>
                            <Text style={S.custMeta}>{c.phone} · {c.city}</Text>
                          </View>
                          <View style={S.custArrow}>
                            <Ionicons name="chevron-forward" size={16} color={C.primary} />
                          </View>
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                )}
              </Animated.View>
            </ScrollView>
          )}

          {/* ════════════════════ MODE: NEW CUSTOMER ════════════════════ */}
          {mode === "new" && (
            <ScrollView showsVerticalScrollIndicator={false}
              contentContainerStyle={S.scrollContent} keyboardShouldPersistTaps="handled">
              <Animated.View style={{
                opacity: modeAnim,
                transform: [{ translateY: modeAnim.interpolate({ inputRange:[0,1], outputRange:[20,0] }) }],
              }}>
                <View style={S.orderStrip}>
                  <View style={S.orderStripItem}>
                    <Ionicons name="receipt-outline" size={14} color={C.primary} />
                    <Text style={S.orderStripLabel}>Order</Text>
                    <Text style={S.orderStripValue}>{orderId}</Text>
                  </View>
                  <View style={S.orderStripDot} />
                  <View style={S.orderStripItem}>
                    <Ionicons name="calendar-outline" size={14} color={C.green} />
                    <Text style={S.orderStripLabel}>Date</Text>
                    <Text style={S.orderStripValue}>{today}</Text>
                  </View>
                </View>

                {/* Customer details */}
                <View style={S.section}>
                  <SectionLabel number="1" title="Customer Details" subtitle="Personal information for this order" />
                  <ElevatedInput icon="person" iconColor={C.primary} label="Full Name" required
                    valid={name.trim().length >= 2} error={touched.name ? errors.name : ""}>
                    <TextInput ref={nameRef} style={EI2.input} placeholder="Enter customer's name"
                      placeholderTextColor="#94A3B8" value={name} autoCapitalize="words"
                      returnKeyType="next"
                      onChangeText={(v) => { setName(v); if (v.length>=1){setTouched(p=>({...p,name:true}));validateField("name",v);} }}
                      onSubmitEditing={() => { if (name.trim().length>=2) phoneRef.current?.focus(); }}/>
                  </ElevatedInput>

                  <ElevatedInput icon="call" iconColor={C.green} label="Mobile Number" required
                    valid={phone.length===10 && !errors.phone} error={touched.phone ? errors.phone : ""} prefix="+91">
                    <TextInput ref={phoneRef} style={EI2.input} placeholder="10-digit number"
                      placeholderTextColor="#94A3B8" value={phone} keyboardType="number-pad" maxLength={10}
                      onChangeText={handlePhoneChange}
                      onSubmitEditing={() => { if (phone.length===10) cityRef.current?.focus(); }}/>
                  </ElevatedInput>

                  <ElevatedInput icon="location" iconColor={C.pink} label="City" required
                    valid={city.length>0 && !errors.city} error={touched.city ? errors.city : ""}>
                    <TextInput ref={cityRef} style={[EI2.input,{flex:1}]} placeholder="Enter city"
                      placeholderTextColor="#94A3B8" value={city} autoCapitalize="words"
                      onChangeText={(v) => { setCity(v); setShowCitySugg(v.length>=1); if (v.length>=1){setTouched(p=>({...p,city:true}));validateField("city",v);} }}
                      onFocus={() => setShowCitySugg(true)}
                      onSubmitEditing={() => { setShowCitySugg(false); Keyboard.dismiss(); }}/>
                  </ElevatedInput>

                  {showCitySugg && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}
                      style={{ marginTop:-6, marginBottom:8 }} contentContainerStyle={{ gap:7, paddingRight:12 }}>
                      {POPULAR_CITIES.filter((c)=>!city||c.toLowerCase().includes(city.toLowerCase())).slice(0,8).map((cn)=>(
                        <TouchableOpacity key={cn} style={S.cityChip}
                          onPress={() => { setCity(cn); setShowCitySugg(false); validateField("city",cn); Vibration.vibrate(20); }}>
                          <Text style={S.cityChipTxt}>{cn}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}

                  <ElevatedInput icon="home" iconColor={C.amber} label="Address (Optional)">
                    <TextInput style={EI2.input} placeholder="Street, area, landmark"
                      placeholderTextColor="#94A3B8" value={address}
                      autoCapitalize="sentences" multiline onChangeText={setAddress}/>
                  </ElevatedInput>
                </View>

                {/* Delivery date */}
                <View style={S.section}>
                  <SectionLabel number="2" title="Delivery Date" subtitle="When should this order be ready?" color={C.accent} />
                  <View style={S.quickDatesGrid}>
                    {quickDates().map((opt) => {
                      const active = deliveryDateString === opt.formatted;
                      return (
                        <TouchableOpacity key={opt.label}
                          style={[S.quickDateBtn, active && S.quickDateBtnActive]}
                          onPress={() => selectDate(opt, false)}>
                          <Text style={[S.quickDateLabel, active&&{color:C.accent}]}>{opt.label}</Text>
                          <Text style={[S.quickDateValue, active&&{color:C.accent}]}>{opt.formatted}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <TouchableOpacity style={S.customDateBtn} onPress={() => setShowCalendar((p) => !p)}>
                    <Ionicons name="calendar-outline" size={16} color={deliveryDate?C.accent:C.sub}/>
                    <Text style={[S.customDateTxt, deliveryDate&&{color:C.accent,fontWeight:"700"}]}>
                      {deliveryDate ? deliveryDateString : "Pick custom date"}
                    </Text>
                    <Ionicons name={showCalendar?"chevron-up":"chevron-down"} size={15} color={C.sub}/>
                  </TouchableOpacity>
                  {showCalendar && (
                    <CalendarView month={calMonth} year={calYear} selected={deliveryDate}
                      onSelect={(d) => selectCalDate(d, false)} onChangeMonth={changeMonth}/>
                  )}
                </View>

                {/* BUG 6 FIX: Payment fields for new customer */}
                <View style={S.section}>
                  <SectionLabel number="3" title="Payment Details" subtitle="Enter order amount" color="#10B981" />
                  <ElevatedInput icon="cash" iconColor="#10B981" label="Total Amount" prefix="₹">
                    <TextInput style={EI2.input} placeholder="0" placeholderTextColor="#94A3B8"
                      value={totalAmount} keyboardType="numeric"
                      onChangeText={(v) => setTotalAmount(v.replace(/[^0-9]/g,""))}/>
                  </ElevatedInput>
                  <ElevatedInput icon="card" iconColor={C.primary} label="Advance Received" prefix="₹">
                    <TextInput style={EI2.input} placeholder="0" placeholderTextColor="#94A3B8"
                      value={advanceAmount} keyboardType="numeric"
                      onChangeText={(v) => setAdvanceAmount(v.replace(/[^0-9]/g,""))}/>
                  </ElevatedInput>
                  {totalAmount !== "" && (
                    <View style={{ backgroundColor:"#F0FDF4", borderRadius:10, padding:10,
                      borderWidth:1, borderColor:"#BBF7D0" }}>
                      <Text style={{ color:"#059669", fontSize:12, fontWeight:"700" }}>
                        Balance: ₹{Math.max(0, Number(totalAmount) - Number(advanceAmount || 0))}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Cloth photos */}
                <View style={S.section}>
                  <SectionLabel number="4" title="Cloth Photos" subtitle="Attach fabric / design reference (max 4)" color={C.amber} />
                  <View style={S.photoGrid}>
                    {clothPhotos.map((uri, i) => (
                      <View key={i} style={S.photoThumb}>
                        <Image source={{ uri }} style={S.photoImg} />
                        <TouchableOpacity style={S.photoRemove}
                          onPress={() => setClothPhotos((p) => p.filter((_,j)=>j!==i))}>
                          <Ionicons name="close-circle" size={20} color="#FFF" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    {clothPhotos.length < 4 && (
                      <TouchableOpacity style={S.photoAdd} onPress={() => showPhotoOptions(false)}>
                        <View style={S.photoAddIcon}>
                          <Ionicons name="camera-outline" size={22} color={C.amber} />
                        </View>
                        <Text style={[S.photoAddTxt, { color: C.amber }]}>Add Photo</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Notes */}
                <View style={S.section}>
                  <SectionLabel number="5" title="Notes" subtitle="Special instructions (optional)" color={C.sub} />
                  <View style={S.notesBox}>
                    <TextInput style={S.notesInput}
                      placeholder="Eg: Collar type, pocket style, rush order..."
                      placeholderTextColor="#94A3B8" value={notes} onChangeText={setNotes}
                      multiline numberOfLines={3} textAlignVertical="top"/>
                  </View>
                </View>
                <View style={{ height: 110 }} />
              </Animated.View>
            </ScrollView>
          )}

          {/* ── Footer button ── */}
          {mode !== "select" && (
            <View style={S.footer}>
              {mode==="new" && !isNewFormValid() && (
                <View style={S.hintStrip}>
                  <Ionicons name="information-circle-outline" size={14} color={C.sub}/>
                  <Text style={S.hintTxt}>Fill name, phone, city & delivery date to continue</Text>
                </View>
              )}
              {mode==="returning" && selectedCustomer && !isRetFormValid() && (
                <View style={S.hintStrip}>
                  <Ionicons name="information-circle-outline" size={14} color={C.sub}/>
                  <Text style={S.hintTxt}>Select a delivery date to continue</Text>
                </View>
              )}
              <TouchableOpacity
                style={[
                  S.cta,
                  mode==="returning" && S.ctaGreen,
                  ((mode==="new" && !isNewFormValid())||(mode==="returning" && !isRetFormValid())) && S.ctaDisabled,
                ]}
                onPress={mode==="new" ? handleSaveNew : handleSaveReturning}
                disabled={(mode==="new"&&(!isNewFormValid()||saving))||(mode==="returning"&&(!isRetFormValid()||saving))}
                activeOpacity={0.88}>
                {saving ? (
                  <Text style={S.ctaTxt}>Saving...</Text>
                ) : mode==="returning" ? (
                  <>
                    <Ionicons name={retOrderType==="same"?"checkmark-circle":"arrow-forward"} size={20} color="#FFF"/>
                    <Text style={S.ctaTxt}>{retOrderType==="same"?"Create Order":"Continue to Measurements"}</Text>
                  </>
                ) : (
                  <>
                    <Text style={S.ctaTxt}>Continue to Measurements</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFF"/>
                  </>
                )}
                {((mode==="new"&&isNewFormValid())||(mode==="returning"&&isRetFormValid())) && (
                  <View style={S.ctaBadge}>
                    <Ionicons name="checkmark" size={11} color="#FFF"/>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}

        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ── Inline calendar ─────────────────────────────────────────────
function CalendarView({ month, year, selected, onSelect, onChangeMonth }) {
  const now = new Date(); now.setHours(0,0,0,0);
  return (
    <View style={CAL.wrap}>
      <View style={CAL.header}>
        <TouchableOpacity onPress={() => onChangeMonth(-1)} style={CAL.nav}>
          <Ionicons name="chevron-back" size={17} color={C.text}/>
        </TouchableOpacity>
        <Text style={CAL.month}>
          {new Date(year, month).toLocaleDateString("en-US",{month:"long",year:"numeric"})}
        </Text>
        <TouchableOpacity onPress={() => onChangeMonth(1)} style={CAL.nav}>
          <Ionicons name="chevron-forward" size={17} color={C.text}/>
        </TouchableOpacity>
      </View>
      <View style={CAL.weekRow}>
        {["S","M","T","W","T","F","S"].map((d,i)=>(
          <Text key={i} style={CAL.weekDay}>{d}</Text>
        ))}
      </View>
      <View style={CAL.grid}>
        {getCalendarDays(month, year).map((date, i) => {
          if (!date) return <View key={i} style={CAL.day}/>;
          const past = date < now;
          const sel  = selected && date.toDateString()===selected.toDateString();
          const tod  = date.toDateString()===now.toDateString();
          return (
            <TouchableOpacity key={i}
              style={[CAL.day, sel&&CAL.daySel, tod&&!sel&&CAL.dayToday, past&&CAL.dayPast]}
              onPress={() => !past && onSelect(date)} disabled={past}>
              <Text style={[CAL.dayTxt, sel&&CAL.dayTxtSel, tod&&!sel&&CAL.dayTxtToday, past&&CAL.dayTxtPast]}>
                {date.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const CAL = StyleSheet.create({
  wrap:      {backgroundColor:C.inputBg,borderRadius:16,padding:12,marginTop:6,borderWidth:1,borderColor:C.border},
  header:    {flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:10},
  nav:       {width:32,height:32,borderRadius:10,backgroundColor:C.card,justifyContent:"center",alignItems:"center",borderWidth:1,borderColor:C.border},
  month:     {fontSize:14,fontWeight:"800",color:C.text},
  weekRow:   {flexDirection:"row",marginBottom:4},
  weekDay:   {flex:1,color:C.sub,fontSize:11,fontWeight:"700",textAlign:"center"},
  grid:      {flexDirection:"row",flexWrap:"wrap"},
  day:       {width:"14.28%",aspectRatio:1,justifyContent:"center",alignItems:"center",borderRadius:8,marginVertical:1},
  daySel:    {backgroundColor:C.accent},
  dayToday:  {backgroundColor:C.accent+"20",borderWidth:1,borderColor:C.accent},
  dayPast:   {opacity:0.28},
  dayTxt:    {color:C.text,fontSize:13,fontWeight:"600"},
  dayTxtSel: {color:"#FFF",fontWeight:"800"},
  dayTxtToday:{color:C.accent,fontWeight:"800"},
  dayTxtPast:{color:C.sub},
});

const S = StyleSheet.create({
  root:      {flex:1,backgroundColor:C.bg},
  orb1:      {position:"absolute",top:-80,right:-60,width:260,height:260,borderRadius:130,backgroundColor:"rgba(59,130,246,0.07)"},
  orb2:      {position:"absolute",bottom:-60,left:-50,width:220,height:220,borderRadius:110,backgroundColor:"rgba(163,230,53,0.06)"},
  orb3:      {position:"absolute",top:"40%",right:-80,width:160,height:160,borderRadius:80,backgroundColor:"rgba(236,72,153,0.04)"},

  header:    {flexDirection:"row",alignItems:"center",justifyContent:"space-between",paddingHorizontal:18,paddingVertical:12},
  backBtn:   {width:40,height:40,borderRadius:12,backgroundColor:C.card,justifyContent:"center",alignItems:"center",borderWidth:1,borderColor:C.border,shadowColor:"#000",shadowOffset:{width:0,height:1},shadowOpacity:0.05,shadowRadius:4,elevation:2},
  headerTitle:{fontSize:17,fontWeight:"900",color:C.text,letterSpacing:-0.5},
  scrollContent:{paddingHorizontal:18,paddingTop:4,paddingBottom:20},

  selectWrap:{flex:1,paddingHorizontal:18,paddingTop:24},
  selectTitle:{fontSize:26,fontWeight:"900",color:C.text,letterSpacing:-0.8,marginBottom:6},
  selectSub: {fontSize:14,color:C.sub,marginBottom:28,lineHeight:20},
  modeCard:  {flexDirection:"row",alignItems:"center",gap:14,backgroundColor:C.card,borderRadius:20,padding:18,marginBottom:14,borderWidth:1.5,borderColor:C.border,shadowColor:C.primary,shadowOffset:{width:0,height:4},shadowOpacity:0.06,shadowRadius:16,elevation:4},
  modeCardIcon:{width:56,height:56,borderRadius:18,justifyContent:"center",alignItems:"center"},
  modeCardTitle:{fontSize:16,fontWeight:"900",color:C.text,marginBottom:4},
  modeCardSub:{fontSize:12,color:C.sub,lineHeight:17},
  modeCardArrow:{width:34,height:34,borderRadius:11,justifyContent:"center",alignItems:"center"},

  infoStrip: {flexDirection:"row",backgroundColor:C.card,borderRadius:18,padding:16,marginTop:8,borderWidth:1,borderColor:C.border,shadowColor:"#000",shadowOffset:{width:0,height:2},shadowOpacity:0.04,shadowRadius:8,elevation:2},
  infoItem:  {flex:1,alignItems:"center",gap:3},
  infoNum:   {fontSize:18,fontWeight:"900"},
  infoLabel: {fontSize:10,color:C.sub,fontWeight:"600"},
  infoDivider:{width:1,backgroundColor:C.border,marginHorizontal:4},

  searchCard:{backgroundColor:C.card,borderRadius:16,padding:4,marginBottom:14,borderWidth:1,borderColor:C.border,shadowColor:"#000",shadowOffset:{width:0,height:2},shadowOpacity:0.04,shadowRadius:8,elevation:2},
  searchRow: {flexDirection:"row",alignItems:"center",paddingHorizontal:14,paddingVertical:10,gap:10},
  searchInput:{flex:1,fontSize:14,color:C.text,fontWeight:"600"},

  selectedCard:{backgroundColor:C.card,borderRadius:20,padding:16,marginBottom:14,borderWidth:1.5,borderColor:C.primary+"40",shadowColor:C.primary,shadowOffset:{width:0,height:4},shadowOpacity:0.08,shadowRadius:14,elevation:4},
  selectedHeader:{flexDirection:"row",alignItems:"center",gap:12,marginBottom:12},
  selectedAvatar:{width:48,height:48,borderRadius:24,backgroundColor:C.primary,justifyContent:"center",alignItems:"center"},
  selectedAvatarTxt:{color:"#FFF",fontSize:20,fontWeight:"900"},
  selectedName:{fontSize:17,fontWeight:"900",color:C.text,marginBottom:3},
  selectedMeta:{fontSize:12,color:C.sub,fontWeight:"500"},
  changeBtn: {flexDirection:"row",alignItems:"center",gap:4,backgroundColor:C.bg,paddingHorizontal:12,paddingVertical:7,borderRadius:10,borderWidth:1,borderColor:C.border},
  changeBtnTxt:{fontSize:12,fontWeight:"700",color:C.sub},

  prevMeasureWrap:{backgroundColor:C.bg,borderRadius:12,padding:10},
  prevMeasureTitle:{fontSize:11,fontWeight:"800",color:C.sub,marginBottom:8,letterSpacing:0.3,textTransform:"uppercase"},
  measureChip:{backgroundColor:C.card,borderRadius:12,padding:10,borderWidth:1,borderColor:C.border,alignItems:"center",minWidth:80},
  measureChipGarment:{fontSize:13,fontWeight:"800",color:C.text,marginBottom:2},
  measureChipFit:{fontSize:10,color:C.primary,fontWeight:"700"},
  measureChipDate:{fontSize:9,color:C.sub,marginTop:2},

  orderTypeBtn:{flex:1,backgroundColor:C.card,borderRadius:16,padding:14,alignItems:"center",gap:8,borderWidth:1.5,borderColor:C.border,shadowColor:"#000",shadowOffset:{width:0,height:2},shadowOpacity:0.03,shadowRadius:6,elevation:1},
  orderTypeIconWrap:{width:44,height:44,borderRadius:14,justifyContent:"center",alignItems:"center"},
  orderTypeTxt:{fontSize:13,fontWeight:"700",color:C.sub,textAlign:"center"},

  customerRow:{flexDirection:"row",alignItems:"center",gap:12,backgroundColor:C.card,borderRadius:16,padding:14,marginBottom:8,borderWidth:1,borderColor:C.border,shadowColor:"#000",shadowOffset:{width:0,height:1},shadowOpacity:0.03,shadowRadius:6,elevation:1},
  custAvatar:{width:44,height:44,borderRadius:22,backgroundColor:C.primary+"15",justifyContent:"center",alignItems:"center"},
  custAvatarTxt:{fontSize:18,fontWeight:"900",color:C.primary},
  custName:  {fontSize:15,fontWeight:"800",color:C.text,marginBottom:2},
  custMeta:  {fontSize:12,color:C.sub},
  custArrow: {width:32,height:32,borderRadius:10,backgroundColor:C.primary+"10",justifyContent:"center",alignItems:"center"},

  emptyWrap: {alignItems:"center",paddingVertical:48,gap:12},
  emptyIconWrap:{width:80,height:80,borderRadius:24,backgroundColor:C.card,justifyContent:"center",alignItems:"center",borderWidth:1,borderColor:C.border},
  emptyTxt:  {fontSize:16,fontWeight:"700",color:C.sub},

  section:   {backgroundColor:C.card,borderRadius:20,padding:18,marginBottom:14,borderWidth:1,borderColor:C.border,shadowColor:"#000",shadowOffset:{width:0,height:2},shadowOpacity:0.04,shadowRadius:10,elevation:2},
  orderStrip:{flexDirection:"row",alignItems:"center",justifyContent:"center",backgroundColor:C.card,borderRadius:16,padding:12,marginBottom:14,gap:16,borderWidth:1,borderColor:C.border},
  orderStripItem:{alignItems:"center",gap:2},
  orderStripLabel:{fontSize:9,color:C.sub,fontWeight:"700",textTransform:"uppercase",letterSpacing:0.4},
  orderStripValue:{fontSize:13,color:C.text,fontWeight:"800"},
  orderStripDot:{width:4,height:4,borderRadius:2,backgroundColor:C.border},

  cityChip:  {backgroundColor:"#EFF6FF",paddingHorizontal:12,paddingVertical:7,borderRadius:20,borderWidth:1,borderColor:"#BFDBFE"},
  cityChipTxt:{color:C.primary,fontSize:12,fontWeight:"700"},

  quickDatesGrid:{flexDirection:"row",flexWrap:"wrap",gap:8,marginBottom:10},
  quickDateBtn:{flex:1,minWidth:"47%",backgroundColor:C.inputBg,borderRadius:12,padding:11,borderWidth:1.5,borderColor:C.border},
  quickDateBtnActive:{borderColor:C.accent,backgroundColor:C.accent+"10"},
  quickDateLabel:{fontSize:11,color:C.sub,fontWeight:"600",marginBottom:3},
  quickDateValue:{fontSize:12,color:C.text,fontWeight:"700"},
  customDateBtn:{flexDirection:"row",alignItems:"center",justifyContent:"center",backgroundColor:C.inputBg,paddingVertical:10,borderRadius:12,gap:8,borderWidth:1,borderColor:C.border},
  customDateTxt:{color:C.sub,fontSize:13,fontWeight:"600",flex:1,textAlign:"center"},

  photoGrid: {flexDirection:"row",flexWrap:"wrap",gap:10},
  photoThumb:{width:76,height:76,borderRadius:14,overflow:"hidden",position:"relative",borderWidth:1,borderColor:C.border},
  photoImg:  {width:"100%",height:"100%"},
  photoRemove:{position:"absolute",top:3,right:3,backgroundColor:"rgba(0,0,0,0.5)",borderRadius:10},
  photoAdd:  {width:76,height:76,borderRadius:14,borderWidth:1.5,borderColor:C.amber,borderStyle:"dashed",backgroundColor:"#FFFBEB",justifyContent:"center",alignItems:"center",gap:4},
  photoAddIcon:{width:36,height:36,borderRadius:10,backgroundColor:C.amber+"20",justifyContent:"center",alignItems:"center"},
  photoAddTxt:{fontSize:9,fontWeight:"800"},

  notesBox:  {backgroundColor:C.inputBg,borderRadius:14,padding:12,borderWidth:1,borderColor:C.border,minHeight:80},
  notesInput:{color:C.text,fontSize:13,fontWeight:"500",minHeight:60},

  footer:    {position:"absolute",bottom:0,left:0,right:0,padding:16,paddingBottom:22,backgroundColor:C.bg,borderTopWidth:1,borderTopColor:C.border},
  hintStrip: {flexDirection:"row",alignItems:"center",gap:6,backgroundColor:C.inputBg,borderRadius:10,paddingHorizontal:12,paddingVertical:7,marginBottom:10,borderWidth:1,borderColor:C.border},
  hintTxt:   {fontSize:12,color:C.sub,fontWeight:"500",flex:1},
  cta:       {backgroundColor:C.primary,borderRadius:16,paddingVertical:15,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:9,shadowColor:C.primary,shadowOffset:{width:0,height:8},shadowOpacity:0.28,shadowRadius:14,elevation:8,position:"relative"},
  ctaGreen:  {backgroundColor:C.green,shadowColor:C.green},
  ctaDisabled:{backgroundColor:"#CBD5E1",shadowOpacity:0,elevation:0},
  ctaTxt:    {color:"#FFF",fontSize:15,fontWeight:"900",letterSpacing:-0.2},
  ctaBadge:  {position:"absolute",top:-7,right:-4,width:22,height:22,borderRadius:11,backgroundColor:C.text,justifyContent:"center",alignItems:"center",borderWidth:2.5,borderColor:C.bg},
});