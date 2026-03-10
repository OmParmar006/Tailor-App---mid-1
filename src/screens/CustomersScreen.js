import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../firebaseConfig";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Animated, StatusBar, Dimensions, Alert,
  Vibration, RefreshControl, Modal, TouchableWithoutFeedback,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  collection, query, where, getDocs,
  deleteDoc, doc,
} from "firebase/firestore";

const { width, height } = Dimensions.get("window");

const C = {
  bg:        "#F0F2F8",
  card:      "#FFFFFF",
  cardSub:   "#F7F8FC",
  primary:   "#3B82F6",
  priLight:  "#EFF6FF",
  priMid:    "#BFDBFE",
  text:      "#0F172A",
  sub:       "#64748B",
  border:    "#E2E8F0",
  borderSoft:"#F1F5F9",
  danger:    "#EF4444",
  dangerBg:  "#FFF5F5",
  green:     "#22C55E",
  greenBg:   "#F0FDF4",
  amber:     "#F59E0B",
  amberBg:   "#FFFBEB",
  purple:    "#8B5CF6",
  purpleBg:  "#F5F3FF",
  pink:      "#EC4899",
  pinkBg:    "#FDF2F8",
};

const AVATAR_PALETTES = [
  ["#3B82F6","#DBEAFE"],["#8B5CF6","#EDE9FE"],["#EC4899","#FCE7F3"],
  ["#10B981","#D1FAE5"],["#F59E0B","#FEF3C7"],["#EF4444","#FEE2E2"],
  ["#06B6D4","#CFFAFE"],["#6366F1","#E0E7FF"],["#F97316","#FFEDD5"],
];
const avatarColor = (name = "") =>
  AVATAR_PALETTES[(name.charCodeAt(0) || 0) % AVATAR_PALETTES.length];

const initials = (name = "") =>
  name.trim().split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

const STAGE = {
  Measurement:{ color: C.primary, bg: C.priLight,  icon: "pencil-outline"           },
  Cutting:    { color: C.amber,   bg: C.amberBg,   icon: "cut-outline"              },
  Stitching:  { color: C.purple,  bg: C.purpleBg,  icon: "construct-outline"        },
  Trial:      { color: C.green,   bg: C.greenBg,   icon: "checkmark-circle-outline" },
  Delivery:   { color: C.pink,    bg: C.pinkBg,    icon: "bag-handle-outline"       },
};

const GARMENT_CFG = {
  Shirt:  { icon: "shirt-outline",     color: "#3B82F6" },
  Pant:   { icon: "fitness-outline",   color: "#8B5CF6" },
  Kurta:  { icon: "body-outline",      color: "#EC4899" },
  Safari: { icon: "briefcase-outline", color: "#F59E0B" },
  Coti:   { icon: "layers-outline",    color: "#10B981" },
  Blazer: { icon: "diamond-outline",   color: "#EF4444" },
  Suit:   { icon: "ribbon-outline",    color: "#6366F1" },
};

const MEASURE_ORDER = {
  Shirt:  ["Chest","Stomach (Pet)","Seat (Hip)","Shoulder","Back","Sleeve Length","Sleeve Round","Sleeve End","Collar","Front Neck","Back Neck","Shirt Length"],
  Pant:   ["Waist","Seat (Hip)","Thigh","Knee","Calf","Bottom","Full Length","Inside Length","Seat Length"],
  Kurta:  ["Chest","Stomach (Pet)","Seat (Hip)","Shoulder","Sleeve Length","Sleeve End","Kurta Length"],
  Safari: ["Chest","Stomach (Pet)","Seat (Hip)","Shoulder","Sleeve Length","Armhole","Safari Length"],
  Coti:   ["Chest","Stomach (Pet)","Seat (Hip)","Shoulder","Coti Length"],
  Blazer: ["Chest","Stomach (Pet)","Seat (Hip)","Shoulder","Back","Sleeve Length","Armhole","Blazer Length"],
  Suit:   ["Chest","Stomach (Pet)","Seat (Hip)","Shoulder","Sleeve Length","Back","Waist","Thigh","Bottom","Full Length"],
};

// ─────────────────────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────────────────────
export default function CustomersScreen({ navigation }) {
  const [customers,            setCustomers]            = useState([]);
  const [orders,               setOrders]               = useState([]);
  const [measures,             setMeasures]             = useState([]);
  const [search,               setSearch]               = useState("");
  const [loading,              setLoading]              = useState(true);
  const [refreshing,           setRefreshing]           = useState(false);
  const [selected,             setSelected]             = useState(null);
  const [editPopupCustomer,    setEditPopupCustomer]    = useState(null);
  const [editPopupMeasurements,setEditPopupMeasurements]= useState([]);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    loadData();
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
    ]).start();
  }, []);

  const loadData = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const cSnap = await getDocs(query(collection(db, "customers"), where("ownerId", "==", uid)));
      const custList = cSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const seen = new Set();
      const unique = custList.filter((c) => { if (seen.has(c.phone)) return false; seen.add(c.phone); return true; });

      const oSnap = await getDocs(query(collection(db, "orders"), where("ownerId", "==", uid)));
      const orderList = oSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      let measureList = [];

const mSnap = await getDocs(
  query(collection(db, "measurements"), where("ownerId", "==", uid))
);

measureList = mSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCustomers(unique);
      setOrders(orderList);
      setMeasures(measureList);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const customerOrders = (id) =>
    orders.filter((o) => o.customerId === id)
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

  const customerMeasures = (id) => {
    const all = measures.filter((m) => m.customerId === id);
    const byGarment = {};
    all.forEach((m) => {
      if (!byGarment[m.garment] || (m.createdAt?.seconds || 0) > (byGarment[m.garment].createdAt?.seconds || 0))
        byGarment[m.garment] = m;
    });
    return Object.values(byGarment);
  };

  const filtered = customers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name?.toLowerCase().includes(q) || c.phone?.includes(q) || c.city?.toLowerCase().includes(q);
  });

  const handleDelete = (customer) => {
    Alert.alert("Delete Customer", `Remove ${customer.name} and all their data?\nThis cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "customers", customer.id));
            const cOrders = customerOrders(customer.id);
            await Promise.all(cOrders.map((o) => deleteDoc(doc(db, "orders", o.id))));
            setCustomers((p) => p.filter((c) => c.id !== customer.id));
            setOrders((p) => p.filter((o) => o.customerId !== customer.id));
            setMeasures((p) => p.filter((m) => m.customerId !== customer.id));
            if (selected?.id === customer.id) setSelected(null);
            Vibration.vibrate(40);
          } catch { Alert.alert("Error", "Could not delete customer"); }
        },
      },
    ]);
  };

  // Tap edit button → show choice popup
  const handleEditTap = (customer) => {
    Vibration.vibrate(28);
    setEditPopupMeasurements(customerMeasures(customer.id));
    setEditPopupCustomer(customer);
  };

  return (
    <View style={S.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <View style={S.orb1} /><View style={S.orb2} />

      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <Animated.View style={[S.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View>
            <Text style={S.headerSup}>Manage your</Text>
            <Text style={S.headerTitle}>Customers</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            <View style={S.countBubble}><Text style={S.countBubbleTxt}>{customers.length}</Text></View>
            <TouchableOpacity style={S.addBtn} onPress={() => navigation.navigate("AddCustomer")} activeOpacity={0.85}>
              <Ionicons name="add" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View style={[S.searchWrap, { opacity: fadeAnim }]}>
          <Ionicons name="search-outline" size={17} color={C.sub} />
          <TextInput style={S.searchInput} placeholder="Search by name, phone or city..."
            placeholderTextColor="#94A3B8" value={search} onChangeText={setSearch} autoCapitalize="none" />
          {!!search && <TouchableOpacity onPress={() => setSearch("")}><Ionicons name="close-circle" size={17} color={C.sub} /></TouchableOpacity>}
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}>
          {loading ? (
            <View style={S.emptyWrap}><Text style={S.emptyTxt}>Loading...</Text></View>
          ) : filtered.length === 0 ? (
            <View style={S.emptyWrap}>
              <View style={S.emptyIcon}><Ionicons name="people-outline" size={34} color={C.sub} /></View>
              <Text style={S.emptyTxt}>{search ? "No results found" : "No customers yet"}</Text>
              <Text style={S.emptyHint}>{search ? "Try a different search" : "Tap + to add your first customer"}</Text>
            </View>
          ) : (
            filtered.map((customer, index) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                latestOrder={customerOrders(customer.id)[0]}
                orderCount={customerOrders(customer.id).length}
                measureCount={customerMeasures(customer.id).length}
                index={index}
                onPress={() => { Vibration.vibrate(28); setSelected(customer); }}
                onEdit={() => handleEditTap(customer)}
                onDelete={() => handleDelete(customer)}
              />
            ))
          )}
          <View style={{ height: 110 }} />
        </ScrollView>
      </SafeAreaView>

      {selected && (
        <CustomerDetailModal
          customer={selected}
          orders={customerOrders(selected.id)}
          measurements={customerMeasures(selected.id)}
          onClose={() => setSelected(null)}
          onDelete={() => handleDelete(selected)}
          navigation={navigation}
        />
      )}

      {editPopupCustomer && (
        <EditChoicePopup
          customer={editPopupCustomer}
          measurements={editPopupMeasurements}
          onClose={() => { setEditPopupCustomer(null); setEditPopupMeasurements([]); }}
          onEditDetails={() => {
            setEditPopupCustomer(null);
            navigation.navigate("AddCustomer", {
              editMode: true,
              customer: {
                id:      editPopupCustomer.id,
                name:    editPopupCustomer.name,
                phone:   editPopupCustomer.phone,
                city:    editPopupCustomer.city,
                address: editPopupCustomer.address || "",
              },
            });
          }}
          onEditMeasurement={(measure) => {
            setEditPopupCustomer(null);
            navigation.navigate("AddMeasurement", {
              customerId:      editPopupCustomer.id,
              customerName:    editPopupCustomer.name,
              editMode:        true,
              measurementId:   measure.id,
              measurementData: {
                garment: measure.garment,
                fitType: measure.fitType,
                values:  measure.values,
                notes:   measure.notes || "",
              },
            });
          }}
        />
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// EDIT CHOICE POPUP
// ─────────────────────────────────────────────────────────────
function EditChoicePopup({ customer, measurements, onClose, onEditDetails, onEditMeasurement }) {
  const backdropAnim     = useRef(new Animated.Value(0)).current;
  const scaleAnim        = useRef(new Animated.Value(0.82)).current;
  const fadeAnim         = useRef(new Animated.Value(0)).current;
  const translateY       = useRef(new Animated.Value(18)).current;
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(backdropAnim, { toValue: 1, duration: 240, useNativeDriver: true }),
      Animated.spring(scaleAnim,    { toValue: 1, tension: 90, friction: 10, useNativeDriver: true }),
      Animated.timing(fadeAnim,     { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(translateY,   { toValue: 0, tension: 90, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const close = () => {
    Animated.parallel([
      Animated.timing(backdropAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.spring(scaleAnim,    { toValue: 0.84, tension: 120, friction: 10, useNativeDriver: true }),
      Animated.timing(fadeAnim,     { toValue: 0, duration: 160, useNativeDriver: true }),
    ]).start(onClose);
  };

  const handleMeasureTap = () => {
    if (measurements.length === 0) {
      Alert.alert("No Measurements", "This customer has no saved measurements yet."); return;
    }
    if (measurements.length === 1) { onEditMeasurement(measurements[0]); return; }
    setShowPicker(true);
  };

  const [fg, bg] = avatarColor(customer.name);

  return (
    <Modal transparent visible animationType="none" onRequestClose={close}>
      <Animated.View style={[EP.backdrop, { opacity: backdropAnim }]} />
      <TouchableWithoutFeedback onPress={close}>
        <View style={StyleSheet.absoluteFill} />
      </TouchableWithoutFeedback>

      <View style={EP.centerer} pointerEvents="box-none">
        <Animated.View style={[EP.card, { opacity: fadeAnim, transform: [{ scale: scaleAnim }, { translateY }] }]}>

          <TouchableOpacity style={EP.closeBtn} onPress={close}>
            <Ionicons name="close" size={15} color={C.sub} />
          </TouchableOpacity>

          {/* Identity */}
          <View style={EP.identity}>
            <View style={[EP.avatar, { backgroundColor: bg }]}>
              <Text style={[EP.avatarTxt, { color: fg }]}>{initials(customer.name)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={EP.custName}>{customer.name}</Text>
              <Text style={EP.custSub}>What would you like to edit?</Text>
            </View>
          </View>

          <View style={EP.divider} />

          {/* Edit Details */}
          <TouchableOpacity style={EP.option} onPress={onEditDetails} activeOpacity={0.8}>
            <View style={[EP.optionIcon, { backgroundColor: C.priLight }]}>
              <Ionicons name="person-outline" size={22} color={C.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={EP.optionTitle}>Edit Details</Text>
              <Text style={EP.optionSub}>Name, phone, city, address</Text>
            </View>
            <View style={[EP.optionArrow, { backgroundColor: C.priLight }]}>
              <Ionicons name="chevron-forward" size={15} color={C.primary} />
            </View>
          </TouchableOpacity>

          {/* Edit Measurements */}
          <TouchableOpacity style={[EP.option, { marginBottom: 0 }]} onPress={handleMeasureTap} activeOpacity={0.8}>
            <View style={[EP.optionIcon, { backgroundColor: "#F5F3FF" }]}>
              <Ionicons name="resize-outline" size={22} color={C.purple} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={EP.optionTitle}>Edit Measurements</Text>
              <Text style={EP.optionSub}>
                {measurements.length === 0
                  ? "No measurements saved yet"
                  : measurements.length === 1
                    ? `${measurements[0].garment} · ${measurements[0].fitType || "Regular"}`
                    : `${measurements.length} garments — tap to choose`}
              </Text>
            </View>
            <View style={[EP.optionArrow, { backgroundColor: "#F5F3FF" }]}>
              <Ionicons name="chevron-forward" size={15} color={C.purple} />
            </View>
          </TouchableOpacity>

          {/* Inline garment picker (appears when multiple measurements) */}
          {showPicker && measurements.length > 1 && (
            <View style={EP.garmentList}>
              <View style={EP.garmentListHeader}>
                <Ionicons name="layers-outline" size={13} color={C.sub} />
                <Text style={EP.garmentListTitle}>Select garment to edit</Text>
              </View>
              {measurements.map((m, i) => {
                const cfg = GARMENT_CFG[m.garment] || { icon: "shirt-outline", color: C.primary };
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[EP.garmentRow, i === measurements.length - 1 && { borderBottomWidth: 0 }]}
                    onPress={() => onEditMeasurement(m)}
                    activeOpacity={0.8}
                  >
                    <View style={[EP.garmentRowIcon, { backgroundColor: cfg.color + "18" }]}>
                      <Ionicons name={cfg.icon} size={16} color={cfg.color} />
                    </View>
                    <Text style={EP.garmentRowName}>{m.garment}</Text>
                    <View style={[EP.garmentRowFit, { backgroundColor: cfg.color + "15" }]}>
                      <Text style={[EP.garmentRowFitTxt, { color: cfg.color }]}>{m.fitType || "Regular"}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={13} color={C.sub} />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// CUSTOMER CARD
// ─────────────────────────────────────────────────────────────
function CustomerCard({ customer, latestOrder, orderCount, measureCount, index, onPress, onEdit, onDelete }) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    const delay = Math.min(index * 60, 360);
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 260, delay, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 10, delay, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 70, friction: 10, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  const [fg, bg] = avatarColor(customer.name);
  const stage = latestOrder?.stage;
  const stageCfg = STAGE[stage];

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }}>
      <TouchableOpacity style={S.card} onPress={onPress} activeOpacity={0.8}>
        <View style={[S.avatar, { backgroundColor: bg }]}>
          <Text style={[S.avatarTxt, { color: fg }]}>{initials(customer.name)}</Text>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={S.cardName} numberOfLines={1}>{customer.name}</Text>
            {orderCount > 1 && (
              <View style={S.retBadge}>
                <Ionicons name="repeat" size={9} color={C.green} />
                <Text style={S.retBadgeTxt}>{orderCount}x</Text>
              </View>
            )}
          </View>
          <Text style={S.cardPhone}>+91 {customer.phone}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 1, flexWrap: "wrap" }}>
            {customer.city ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                <Ionicons name="location-outline" size={10} color={C.sub} />
                <Text style={S.cardMeta}>{customer.city}</Text>
              </View>
            ) : null}
            {measureCount > 0 && (
              <>
                <Text style={S.metaDot}>·</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                  <Ionicons name="resize-outline" size={10} color={C.primary} />
                  <Text style={[S.cardMeta, { color: C.primary, fontWeight: "700" }]}>
                    {measureCount} garment{measureCount > 1 ? "s" : ""}
                  </Text>
                </View>
              </>
            )}
            {stageCfg && (
              <>
                <Text style={S.metaDot}>·</Text>
                <View style={[S.stageInline, { backgroundColor: stageCfg.bg }]}>
                  <View style={[S.stageDotInline, { backgroundColor: stageCfg.color }]} />
                  <Text style={[S.stageInlineTxt, { color: stageCfg.color }]}>{stage}</Text>
                </View>
              </>
            )}
          </View>
        </View>
        <View style={S.cardActions}>
          <TouchableOpacity style={S.editBtn} onPress={(e) => { e.stopPropagation(); onEdit(); }}
            hitSlop={{ top: 10, bottom: 10, left: 8, right: 4 }}>
            <Ionicons name="create-outline" size={15} color={C.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={S.delBtn} onPress={(e) => { e.stopPropagation(); onDelete(); }}
            hitSlop={{ top: 10, bottom: 10, left: 4, right: 8 }}>
            <Ionicons name="trash-outline" size={14} color={C.danger} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────
// CUSTOMER DETAIL MODAL
// ─────────────────────────────────────────────────────────────
function CustomerDetailModal({ customer, orders, measurements, onClose, onDelete, navigation }) {
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim    = useRef(new Animated.Value(0.78)).current;
  const fadeAnim     = useRef(new Animated.Value(0)).current;
  const translateY   = useRef(new Animated.Value(24)).current;

  const [activeTab,     setActiveTab]     = useState("measurements");
  const [activeGarment, setActiveGarment] = useState(measurements[0]?.garment || null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(backdropAnim, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.spring(scaleAnim,    { toValue: 1, tension: 80, friction: 10, useNativeDriver: true }),
      Animated.timing(fadeAnim,     { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(translateY,   { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const close = () => {
    Animated.parallel([
      Animated.timing(backdropAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.spring(scaleAnim,    { toValue: 0.82, tension: 100, friction: 10, useNativeDriver: true }),
      Animated.timing(fadeAnim,     { toValue: 0, duration: 160, useNativeDriver: true }),
    ]).start(onClose);
  };

  const [fg, bg] = avatarColor(customer.name);
  const totalOrders = orders.length;
  const totalSpent  = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const pendingAmt  = orders.reduce((s, o) =>
    o.paymentStatus !== "Paid" ? s + Math.max(0, (o.totalAmount || 0) - (o.advanceAmount || 0)) : s, 0);

  const activeMeasure = measurements.find((m) => m.garment === activeGarment);
  const gcfg = GARMENT_CFG[activeGarment] || { icon: "shirt-outline", color: C.primary };
  const orderedKeys = activeMeasure
    ? (MEASURE_ORDER[activeGarment] || Object.keys(activeMeasure.values || {}))
        .filter((k) => activeMeasure.values?.[k] != null && activeMeasure.values[k] !== "")
    : [];
  const fmtMoney = (n) => n >= 1000 ? `₹${(n / 1000).toFixed(1)}k` : `₹${n}`;

  return (
    <Modal transparent visible animationType="none" onRequestClose={close}>
      <Animated.View style={[DM.backdrop, { opacity: backdropAnim }]} />
      <TouchableWithoutFeedback onPress={close}>
        <View style={StyleSheet.absoluteFill} />
      </TouchableWithoutFeedback>

      <View style={DM.centerer} pointerEvents="box-none">
        <Animated.View style={[DM.card, { opacity: fadeAnim, transform: [{ scale: scaleAnim }, { translateY }] }]}>

          <TouchableOpacity style={DM.closeBtn} onPress={close}>
            <Ionicons name="close" size={16} color={C.sub} />
          </TouchableOpacity>

          {/* ── Profile strip ── */}
          <View style={DM.profileStrip}>
            {/* Row 1: avatar + name/phone/city */}
            <View style={DM.profileTop}>
              <View style={[DM.bigAvatar, { backgroundColor: bg }]}>
                <Text style={[DM.bigAvatarTxt, { color: fg }]}>{initials(customer.name)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={DM.name} numberOfLines={1}>{customer.name}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 }}>
                  <Ionicons name="call-outline" size={11} color={C.sub} />
                  <Text style={DM.metaTxt}>+91 {customer.phone}</Text>
                </View>
                {customer.city ? (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 }}>
                    <Ionicons name="location-outline" size={11} color={C.sub} />
                    <Text style={DM.metaTxt}>{customer.city}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* Row 2: Call + WhatsApp side by side */}
            <View style={DM.contactRow}>
              <TouchableOpacity style={DM.contactBtn} onPress={() => Linking.openURL(`tel:${customer.phone}`)} activeOpacity={0.8}>
                <Ionicons name="call" size={14} color={C.primary} />
                <Text style={[DM.contactBtnTxt, { color: C.primary }]}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[DM.contactBtn, { backgroundColor: C.greenBg, borderColor: "#BBF7D0" }]}
                onPress={() => Linking.openURL(`https://wa.me/91${customer.phone}`)}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-whatsapp" size={14} color={C.green} />
                <Text style={[DM.contactBtnTxt, { color: C.green }]}>WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Stats ── */}
          <View style={DM.statsRow}>
            {[
              { label: "Orders",  val: totalOrders,                                  color: C.primary },
              { label: "Spent",   val: totalSpent > 0 ? fmtMoney(totalSpent) : "—", color: C.green   },
              { label: "Pending", val: pendingAmt > 0 ? fmtMoney(pendingAmt) : "✓", color: pendingAmt > 0 ? C.danger : C.green },
            ].map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && <View style={DM.statDiv} />}
                <View style={DM.statItem}>
                  <Text style={[DM.statVal, { color: s.color }]}>{s.val}</Text>
                  <Text style={DM.statLabel}>{s.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>

          {/* ── Tabs ── */}
          <View style={DM.tabRow}>
            {[
              { key: "measurements", label: "Measurements", icon: "resize-outline"  },
              { key: "orders",       label: "Orders",       icon: "receipt-outline" },
            ].map((tab) => (
              <TouchableOpacity key={tab.key} style={[DM.tab, activeTab === tab.key && DM.tabActive]} onPress={() => setActiveTab(tab.key)}>
                <Ionicons name={tab.icon} size={13} color={activeTab === tab.key ? C.primary : C.sub} />
                <Text style={[DM.tabTxt, activeTab === tab.key && DM.tabTxtActive]}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Measurements tab ── */}
          {activeTab === "measurements" && (
            <View style={{ flex: 1 }}>
              {measurements.length === 0 ? (
                <View style={DM.emptyTab}>
                  <View style={DM.emptyTabIcon}><Ionicons name="resize-outline" size={28} color={C.sub} /></View>
                  <Text style={DM.emptyTabTxt}>No measurements saved yet</Text>
                  <Text style={DM.emptyTabHint}>Add an order to capture measurements</Text>
                </View>
              ) : (
                <>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={DM.garmentPills}>
                    {measurements.map((m) => {
                      const cfg = GARMENT_CFG[m.garment] || { icon: "shirt-outline", color: C.primary };
                      const active = m.garment === activeGarment;
                      return (
                        <TouchableOpacity key={m.id}
                          style={[DM.garmentPill, active && { backgroundColor: cfg.color, borderColor: cfg.color }]}
                          onPress={() => { setActiveGarment(m.garment); Vibration.vibrate(18); }}>
                          <View style={[DM.garmentPillIconWrap, { backgroundColor: active ? "rgba(255,255,255,0.22)" : cfg.color + "15" }]}>
                            <Ionicons name={cfg.icon} size={12} color={active ? "#FFF" : cfg.color} />
                          </View>
                          <Text style={[DM.garmentPillTxt, active && { color: "#FFF" }]}>{m.garment}</Text>
                          <View style={[DM.fitTag, active && { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                            <Text style={[DM.fitTagTxt, active && { color: "#FFF" }]}>{m.fitType || "Regular"}</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                  {activeMeasure && (
                    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                      <View style={DM.garmentTitleBar}>
                        <View style={[DM.garmentTitleIcon, { backgroundColor: gcfg.color + "18" }]}>
                          <Ionicons name={gcfg.icon} size={18} color={gcfg.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={DM.garmentTitleName}>{activeGarment}</Text>
                          <Text style={DM.garmentTitleSub}>{orderedKeys.length} measurements · {activeMeasure.fitType || "Regular"} fit</Text>
                        </View>
                        {activeMeasure.createdAt?.toDate && (
                          <Text style={DM.garmentTitleDate}>
                            {activeMeasure.createdAt.toDate().toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                          </Text>
                        )}
                      </View>
                      <View style={DM.measureGrid}>
                        {orderedKeys.map((key, i) => (
                          <MeasureCell key={key} label={key} value={activeMeasure.values[key]} index={i} color={gcfg.color} />
                        ))}
                      </View>
                      {!!activeMeasure.notes && (
                        <View style={DM.notesBox}>
                          <Ionicons name="document-text-outline" size={13} color={C.amber} />
                          <Text style={DM.notesTxt}>{activeMeasure.notes}</Text>
                        </View>
                      )}
                      <View style={{ height: 10 }} />
                    </ScrollView>
                  )}
                </>
              )}
            </View>
          )}

          {/* ── Orders tab ── */}
          {activeTab === "orders" && (
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ padding: 14 }}>
              {orders.length === 0 ? (
                <View style={DM.emptyTab}>
                  <View style={DM.emptyTabIcon}><Ionicons name="receipt-outline" size={28} color={C.sub} /></View>
                  <Text style={DM.emptyTabTxt}>No orders yet</Text>
                </View>
              ) : (
                orders.map((order) => <OrderRow key={order.id} order={order} />)
              )}
            </ScrollView>
          )}

          {/* ── Footer ── */}
          <View style={DM.footer}>
            <TouchableOpacity style={DM.footerPrimary}
              onPress={() => { close(); setTimeout(() => navigation.navigate("AddCustomer"), 280); }}>
              <Ionicons name="add-circle-outline" size={16} color="#FFF" />
              <Text style={DM.footerPrimaryTxt}>New Order</Text>
            </TouchableOpacity>
            <TouchableOpacity style={DM.footerDanger} onPress={() => { close(); setTimeout(() => onDelete(), 200); }}>
              <Ionicons name="trash-outline" size={16} color={C.danger} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ── Animated measurement cell ────────────────────────────────
function MeasureCell({ label, value, index, color }) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  useEffect(() => {
    const delay = index * 30;
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 200, delay, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 90, friction: 10, delay, useNativeDriver: true }),
    ]).start();
  }, [index]);
  return (
    <Animated.View style={[DM.measureCell, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <Text style={DM.measureCellLabel} numberOfLines={2}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 2, marginTop: 4 }}>
        <Text style={[DM.measureCellValue, { color }]}>{value}</Text>
        <Text style={DM.measureCellUnit}>in</Text>
      </View>
    </Animated.View>
  );
}

// ── Order row ────────────────────────────────────────────────
function OrderRow({ order }) {
  const stageCfg = STAGE[order.stage] || { color: C.sub, bg: C.cardSub, icon: "ellipse-outline" };
  const paid     = order.paymentStatus === "Paid";
  return (
    <View style={OR.row}>
      <View style={[OR.leftBar, { backgroundColor: stageCfg.color }]} />
      <View style={{ flex: 1 }}>
        <View style={OR.topRow}>
          <Text style={OR.orderId}>{order.orderId || "—"}</Text>
          <View style={[OR.stagePill, { backgroundColor: stageCfg.bg }]}>
            <Ionicons name={stageCfg.icon} size={9} color={stageCfg.color} />
            <Text style={[OR.stageTxt, { color: stageCfg.color }]}>{order.stage}</Text>
          </View>
        </View>
        <View style={OR.midRow}>
          {order.garment && (
            <View style={OR.chip}>
              <Ionicons name={GARMENT_CFG[order.garment]?.icon || "shirt-outline"} size={10} color={C.primary} />
              <Text style={[OR.chipTxt, { color: C.primary }]}>{order.garment}</Text>
            </View>
          )}
          {order.deliveryDate && (
            <View style={[OR.chip, { backgroundColor: C.amberBg }]}>
              <Ionicons name="calendar-outline" size={10} color={C.amber} />
              <Text style={[OR.chipTxt, { color: C.amber }]}>{order.deliveryDate}</Text>
            </View>
          )}
        </View>
        <View style={OR.bottomRow}>
          <View style={[OR.payBadge, { backgroundColor: paid ? C.greenBg : C.dangerBg }]}>
            <View style={[OR.payDot, { backgroundColor: paid ? C.green : C.danger }]} />
            <Text style={[OR.payTxt, { color: paid ? C.green : C.danger }]}>{paid ? "Paid" : "Unpaid"}</Text>
          </View>
          {order.totalAmount > 0 && <Text style={OR.amount}>₹{order.totalAmount}</Text>}
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  root:           { flex: 1, backgroundColor: C.bg },
  orb1:           { position: "absolute", top: -80, right: -60, width: 260, height: 260, borderRadius: 130, backgroundColor: "rgba(59,130,246,0.06)" },
  orb2:           { position: "absolute", bottom: -60, left: -50, width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(34,197,94,0.04)" },
  header:         { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  headerSup:      { fontSize: 12, fontWeight: "600", color: C.sub, letterSpacing: 0.3 },
  headerTitle:    { fontSize: 28, fontWeight: "900", color: C.text, letterSpacing: -0.8 },
  countBubble:    { backgroundColor: C.priLight, borderWidth: 1, borderColor: C.priMid, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, marginTop: 8 },
  countBubbleTxt: { fontSize: 13, fontWeight: "800", color: C.primary },
  addBtn:         { width: 44, height: 44, borderRadius: 14, backgroundColor: C.primary, justifyContent: "center", alignItems: "center", marginTop: 6, shadowColor: C.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.32, shadowRadius: 12, elevation: 8 },
  searchWrap:     { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.card, marginHorizontal: 18, marginBottom: 14, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1, borderColor: C.border, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  searchInput:    { flex: 1, fontSize: 14, color: C.text, fontWeight: "500" },
  list:           { paddingHorizontal: 18, paddingTop: 2 },
  card:           { flexDirection: "row", alignItems: "center", gap: 11, backgroundColor: C.card, borderRadius: 16, paddingVertical: 11, paddingHorizontal: 13, marginBottom: 9, borderWidth: 1, borderColor: C.borderSoft, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  avatar:         { width: 42, height: 42, borderRadius: 13, justifyContent: "center", alignItems: "center" },
  avatarTxt:      { fontSize: 14, fontWeight: "900" },
  cardName:       { fontSize: 14, fontWeight: "800", color: C.text, flex: 1 },
  cardPhone:      { fontSize: 12, color: C.sub, fontWeight: "500" },
  cardMeta:       { fontSize: 11, color: C.sub },
  metaDot:        { fontSize: 10, color: C.border },
  retBadge:       { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: C.greenBg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 7 },
  retBadgeTxt:    { fontSize: 10, fontWeight: "800", color: C.green },
  stageInline:    { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 7 },
  stageDotInline: { width: 5, height: 5, borderRadius: 3 },
  stageInlineTxt: { fontSize: 10, fontWeight: "700" },
  cardActions:    { flexDirection: "row", gap: 5, alignItems: "center" },
  editBtn:        { width: 30, height: 30, borderRadius: 9, backgroundColor: C.priLight, justifyContent: "center", alignItems: "center" },
  delBtn:         { width: 30, height: 30, borderRadius: 9, backgroundColor: C.dangerBg, justifyContent: "center", alignItems: "center" },
  emptyWrap:      { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyIcon:      { width: 70, height: 70, borderRadius: 22, backgroundColor: C.card, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: C.border },
  emptyTxt:       { fontSize: 16, fontWeight: "700", color: C.sub },
  emptyHint:      { fontSize: 13, color: "#94A3B8", textAlign: "center" },
});

const CELL_W = (width - 32 - 28 - 16) / 3;

const DM = StyleSheet.create({
  backdrop:        { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(5,10,30,0.52)" },
  centerer:        { ...StyleSheet.absoluteFillObject, justifyContent: "center", alignItems: "center", paddingHorizontal: 14 },
  card:            { width: "100%", maxHeight: height * 0.82, backgroundColor: C.bg, borderRadius: 26, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 22 }, shadowOpacity: 0.3, shadowRadius: 44, elevation: 28 },
  closeBtn:        { position: "absolute", top: 12, right: 12, zIndex: 20, width: 28, height: 28, borderRadius: 9, backgroundColor: C.card, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: C.border },
  // Profile
  profileStrip:    { backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.borderSoft, paddingTop: 18, paddingBottom: 12, paddingHorizontal: 16 },
  profileTop:      { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 12 },
  bigAvatar:       { width: 52, height: 52, borderRadius: 17, justifyContent: "center", alignItems: "center" },
  bigAvatarTxt:    { fontSize: 19, fontWeight: "900" },
  name:            { fontSize: 17, fontWeight: "900", color: C.text, letterSpacing: -0.4, marginBottom: 3, paddingRight: 36 },
  metaTxt:         { fontSize: 12, color: C.sub, fontWeight: "500" },
  // Contact buttons — side by side
  contactRow:      { flexDirection: "row", gap: 10 },
  contactBtn:      { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, backgroundColor: C.priLight, borderWidth: 1, borderColor: C.priMid, paddingVertical: 9, borderRadius: 12 },
  contactBtnTxt:   { fontSize: 13, fontWeight: "800" },
  // Stats
  statsRow:        { flexDirection: "row", backgroundColor: C.card, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: C.borderSoft },
  statItem:        { flex: 1, alignItems: "center", gap: 2 },
  statVal:         { fontSize: 16, fontWeight: "900" },
  statLabel:       { fontSize: 10, color: C.sub, fontWeight: "600" },
  statDiv:         { width: 1, backgroundColor: C.border, marginVertical: 6 },
  // Tabs
  tabRow:          { flexDirection: "row", backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border, paddingHorizontal: 16 },
  tab:             { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderBottomWidth: 2.5, borderBottomColor: "transparent" },
  tabActive:       { borderBottomColor: C.primary },
  tabTxt:          { fontSize: 12, fontWeight: "700", color: C.sub },
  tabTxtActive:    { color: C.primary },
  // Garment pills
  garmentPills:     { paddingHorizontal: 14, paddingVertical: 12, gap: 8 },
  garmentPill:      { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 12 },
  garmentPillIconWrap:{ width: 22, height: 22, borderRadius: 7, justifyContent: "center", alignItems: "center" },
  garmentPillTxt:   { fontSize: 12, fontWeight: "800", color: C.text },
  fitTag:           { backgroundColor: C.bg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  fitTagTxt:        { fontSize: 9, fontWeight: "700", color: C.sub },
  // Garment title
  garmentTitleBar:  { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingBottom: 10 },
  garmentTitleIcon: { width: 36, height: 36, borderRadius: 11, justifyContent: "center", alignItems: "center" },
  garmentTitleName: { fontSize: 14, fontWeight: "900", color: C.text },
  garmentTitleSub:  { fontSize: 11, color: C.sub, fontWeight: "500" },
  garmentTitleDate: { marginLeft: "auto", fontSize: 10, color: C.sub, fontWeight: "600" },
  // Measure grid
  measureGrid:      { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, gap: 7, paddingBottom: 8 },
  measureCell:      { width: CELL_W, backgroundColor: C.card, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: C.borderSoft },
  measureCellLabel: { fontSize: 10, color: C.sub, fontWeight: "600", lineHeight: 13 },
  measureCellValue: { fontSize: 17, fontWeight: "900" },
  measureCellUnit:  { fontSize: 10, color: C.sub, fontWeight: "600" },
  // Notes
  notesBox:         { flexDirection: "row", alignItems: "flex-start", gap: 8, marginHorizontal: 14, backgroundColor: C.amberBg, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: "#FDE68A", marginBottom: 4 },
  notesTxt:         { flex: 1, fontSize: 12, color: C.text, fontWeight: "500", lineHeight: 17 },
  // Empty
  emptyTab:         { alignItems: "center", paddingVertical: 32, gap: 8 },
  emptyTabIcon:     { width: 60, height: 60, borderRadius: 18, backgroundColor: C.card, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: C.border },
  emptyTabTxt:      { fontSize: 14, fontWeight: "700", color: C.sub },
  emptyTabHint:     { fontSize: 12, color: "#94A3B8" },
  // Footer
  footer:           { flexDirection: "row", gap: 10, padding: 13, backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.borderSoft },
  footerPrimary:    { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, backgroundColor: C.primary, paddingVertical: 12, borderRadius: 14, shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 10, elevation: 6 },
  footerPrimaryTxt: { color: "#FFF", fontSize: 14, fontWeight: "900" },
  footerDanger:     { width: 44, height: 44, borderRadius: 13, backgroundColor: C.dangerBg, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#FECACA" },
});

const EP = StyleSheet.create({
  backdrop:        { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(5,10,30,0.48)" },
  centerer:        { ...StyleSheet.absoluteFillObject, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  card:            { width: "100%", backgroundColor: C.card, borderRadius: 24, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.22, shadowRadius: 36, elevation: 22 },
  closeBtn:        { position: "absolute", top: 14, right: 14, zIndex: 10, width: 26, height: 26, borderRadius: 8, backgroundColor: C.bg, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: C.border },
  identity:        { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18, paddingRight: 30 },
  avatar:          { width: 46, height: 46, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  avatarTxt:       { fontSize: 17, fontWeight: "900" },
  custName:        { fontSize: 16, fontWeight: "900", color: C.text, letterSpacing: -0.3, marginBottom: 2 },
  custSub:         { fontSize: 12, color: C.sub, fontWeight: "500" },
  divider:         { height: 1, backgroundColor: C.borderSoft, marginBottom: 16 },
  option:          { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: C.bg, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  optionIcon:      { width: 46, height: 46, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  optionTitle:     { fontSize: 14, fontWeight: "900", color: C.text, marginBottom: 2 },
  optionSub:       { fontSize: 11, color: C.sub, fontWeight: "500" },
  optionArrow:     { width: 28, height: 28, borderRadius: 9, justifyContent: "center", alignItems: "center" },
  garmentList:     { marginTop: 14, backgroundColor: C.bg, borderRadius: 14, borderWidth: 1, borderColor: C.border, overflow: "hidden" },
  garmentListHeader:{ flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.borderSoft },
  garmentListTitle: { fontSize: 11, fontWeight: "700", color: C.sub, letterSpacing: 0.3, textTransform: "uppercase" },
  garmentRow:      { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.borderSoft },
  garmentRowIcon:  { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  garmentRowName:  { fontSize: 14, fontWeight: "800", color: C.text, flex: 1 },
  garmentRowFit:   { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  garmentRowFitTxt:{ fontSize: 10, fontWeight: "700" },
});

const OR = StyleSheet.create({
  row:      { flexDirection: "row", gap: 10, backgroundColor: C.card, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: C.borderSoft, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  leftBar:  { width: 3, borderRadius: 2 },
  topRow:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 5 },
  orderId:  { fontSize: 13, fontWeight: "800", color: C.text },
  stagePill:{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  stageTxt: { fontSize: 10, fontWeight: "800" },
  midRow:   { flexDirection: "row", gap: 6, marginBottom: 5 },
  chip:     { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: C.priLight, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7 },
  chipTxt:  { fontSize: 10, fontWeight: "700" },
  bottomRow:{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  payBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7 },
  payDot:   { width: 5, height: 5, borderRadius: 3 },
  payTxt:   { fontSize: 10, fontWeight: "700" },
  amount:   { fontSize: 13, fontWeight: "900", color: C.text },
});