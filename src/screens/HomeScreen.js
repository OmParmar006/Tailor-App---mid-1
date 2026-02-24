// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Alert,
//   Animated,
//   Image,
//   Linking,
//   Modal,
//   Pressable,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
//   Dimensions,
//   StatusBar,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
// import { useNavigation } from "@react-navigation/native";
// import { onAuthStateChanged } from "firebase/auth";
// import { collection, onSnapshot, query, where, getDocs } from "firebase/firestore";
// import { auth, db } from "../firebaseConfig";
// import { useLanguage } from "../context/LanguageContext"; // ← ADDED
// import { LanguageToggle } from "../context/LanguageToggle"; // ← ADDED

// const { width, height } = Dimensions.get("window");

// const PIPELINE = ["Measurement", "Cutting", "Stitching", "Trial", "Delivery"];

// const COMPLEXITY_WEIGHT = {
//   Suit: 5,
//   Blazer: 4,
//   Safari: 3,
//   Kurta: 2,
//   Shirt: 2,
//   Pant: 2,
// };

// const GARMENT_ICONS = {
//   Shirt: "shirt-outline",
//   Pant: "fitness-outline",
//   Kurta: "body-outline",
//   Safari: "briefcase-outline",
//   Coti: "layers-outline",
//   Blazer: "diamond-outline",
//   Suit: "ribbon-outline",
// };

// const GARMENT_COLORS = {
//   Shirt: "#3B82F6",
//   Pant: "#8B5CF6",
//   Kurta: "#EC4899",
//   Safari: "#F59E0B",
//   Coti: "#10B981",
//   Blazer: "#EF4444",
//   Suit: "#6366F1",
// };

// const parseDeliveryDate = (value) => {
//   if (!value || typeof value !== "string") return null;
//   const parts = value.split("/");
//   if (parts.length !== 3) return null;

//   const day = Number(parts[0]);
//   const month = Number(parts[1]) - 1;
//   const year = Number(parts[2]);

//   const date = new Date(year, month, day);
//   return Number.isNaN(date.getTime()) ? null : date;
// };

// const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// const getDateBucket = (deliveryDateStr) => {
//   const parsed = parseDeliveryDate(deliveryDateStr);
//   if (!parsed) return "No Date";

//   const today = startOfDay(new Date());
//   const target = startOfDay(parsed);
//   const diff = Math.round((target - today) / 86400000);

//   if (diff < 0) return "Overdue";
//   if (diff === 0) return "Today";
//   if (diff === 1) return "Tomorrow";
//   if (diff <= 7) return "This Week";
//   return "Later";
// };

// const normalizeStage = (rawStatus) => {
//   const v = String(rawStatus || "").toLowerCase().trim();
//   if (["measurement", "pending", "new"].includes(v)) return "Measurement";
//   if (["cutting"].includes(v)) return "Cutting";
//   if (["stitching", "progress", "in progress", "in_progress"].includes(v)) return "Stitching";
//   if (["trial", "qc"].includes(v)) return "Trial";
//   if (["delivery", "ready", "delivered", "complete", "completed"].includes(v)) return "Delivery";
//   return "Measurement";
// };

// const stageToBadge = (stage) => {
//   if (stage === "Measurement") return "Pending";
//   if (stage === "Stitching" || stage === "Cutting") return "Progress";
//   return "Ready";
// };

// const toDateSafe = (raw) => {
//   if (!raw) return null;
//   if (typeof raw?.toDate === "function") return raw.toDate();
//   const d = new Date(raw);
//   return Number.isNaN(d.getTime()) ? null : d;
// };

// const formatDateForCard = (deliveryDate, createdAt) => {
//   if (deliveryDate) return deliveryDate;
//   if (!createdAt) return "--";
//   return createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
// };

// const urgencyLevelFromBucket = (bucket) => {
//   if (bucket === "Overdue" || bucket === "Today") return "High";
//   if (bucket === "Tomorrow" || bucket === "This Week") return "Medium";
//   return "Low";
// };

// const riskScore = (order) => {
//   const urgencyScore = {
//     Overdue: 100,
//     Today: 80,
//     Tomorrow: 55,
//     "This Week": 35,
//     Later: 15,
//     "No Date": 5,
//   }[order.dateBucket] || 0;

//   const stagePenalty = {
//     Measurement: 20,
//     Cutting: 15,
//     Stitching: 10,
//     Trial: 5,
//     Delivery: 0,
//   }[order.stage] || 0;

//   const complexity = COMPLEXITY_WEIGHT[order.item] || 1;
//   const paymentPenalty = order.paymentStatus === "Unpaid" ? 8 : 0;

//   return urgencyScore + stagePenalty + complexity + paymentPenalty;
// };

// export default function HomeScreen() {
//   const navigation = useNavigation();
//   const { t } = useLanguage(); // ← ADDED: Get translations from context

//   const [customers, setCustomers] = useState([]);
//   const [measurements, setMeasurements] = useState([]);
//   const [loadingOrders, setLoadingOrders] = useState(true);

//   const [activeTab, setActiveTab] = useState("today");
//   const [searchText, setSearchText] = useState("");
//   const [searchFocused, setSearchFocused] = useState(false);

//   const [filters, setFilters] = useState({
//     status: "All Status",
//     payment: "All Payment",
//   });

//   const [activeFilterKey, setActiveFilterKey] = useState(null);
//   const [filterModalVisible, setFilterModalVisible] = useState(false);

//   const [selectedOrderId, setSelectedOrderId] = useState(null);
//   const [localOverrides, setLocalOverrides] = useState({});

//   const [showFinancials, setShowFinancials] = useState(true);

//   // Measurement Modal States
//   const [measurementModalVisible, setMeasurementModalVisible] = useState(false);
//   const [selectedCustomer, setSelectedCustomer] = useState(null);
//   const [customerMeasurements, setCustomerMeasurements] = useState([]);
//   const [selectedGarment, setSelectedGarment] = useState(null);
//   const [loadingMeasurements, setLoadingMeasurements] = useState(false);
//   const [scaleAnim] = useState(new Animated.Value(0));

//   useEffect(() => {
//     let unsubscribeCustomers = () => {};
//     let unsubscribeMeasurements = () => {};

//     const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
//       unsubscribeCustomers();
//       unsubscribeMeasurements();

//       if (!user) {
//         setCustomers([]);
//         setMeasurements([]);
//         setLoadingOrders(false);
//         return;
//       }

//       setLoadingOrders(true);

//       const qCustomers = query(collection(db, "customers"), where("ownerId", "==", user.uid));
//       unsubscribeCustomers = onSnapshot(
//         qCustomers,
//         (snap) => {
//           setCustomers(
//             snap.docs.map((doc) => ({
//               id: doc.id,
//               ...doc.data(),
//             }))
//           );
//           setLoadingOrders(false);
//         },
//         () => {
//           setCustomers([]);
//           setLoadingOrders(false);
//         }
//       );

//       unsubscribeMeasurements = onSnapshot(
//         collection(db, "measurements"),
//         (snap) => {
//           setMeasurements(
//             snap.docs.map((doc) => ({
//               id: doc.id,
//               ...doc.data(),
//             }))
//           );
//         },
//         () => {
//           setMeasurements([]);
//         }
//       );
//     });

//     return () => {
//       unsubscribeCustomers();
//       unsubscribeMeasurements();
//       unsubscribeAuth();
//     };
//   }, []);

//   useEffect(() => {
//     if (measurementModalVisible && selectedCustomer) {
//       loadCustomerMeasurements();
//       animateModalIn();
//     } else {
//       animateModalOut();
//     }
//   }, [measurementModalVisible, selectedCustomer]);

//   const animateModalIn = () => {
//     Animated.spring(scaleAnim, {
//       toValue: 1,
//       tension: 50,
//       friction: 7,
//       useNativeDriver: true,
//     }).start();
//   };

//   const animateModalOut = () => {
//     Animated.timing(scaleAnim, {
//       toValue: 0,
//       duration: 200,
//       useNativeDriver: true,
//     }).start();
//   };

//   const loadCustomerMeasurements = async () => {
//     if (!selectedCustomer?.id) return;

//     setLoadingMeasurements(true);
//     try {
//       const q = query(
//         collection(db, "measurements"),
//         where("customerId", "==", selectedCustomer.id)
//       );
//       const snapshot = await getDocs(q);
      
//       const measurementData = snapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data(),
//       }));

//       setCustomerMeasurements(measurementData);
      
//       if (measurementData.length > 0) {
//         setSelectedGarment(measurementData[0]);
//       }
//     } catch (error) {
//       console.error("Error loading measurements:", error);
//     } finally {
//       setLoadingMeasurements(false);
//     }
//   };

//   const orders = useMemo(() => {
//     const customerIds = new Set(customers.map((c) => c.id));

//     const latestMeasurementByCustomer = {};
//     for (const m of measurements) {
//       if (!customerIds.has(m.customerId)) continue;
//       const created = toDateSafe(m.createdAt);
//       const createdMs = created ? created.getTime() : 0;
//       const prev = latestMeasurementByCustomer[m.customerId];
//       if (!prev || createdMs > prev.createdMs) {
//         latestMeasurementByCustomer[m.customerId] = {
//           garment: m.garment || "-",
//           createdMs,
//         };
//       }
//     }

//     return customers.map((c) => {
//       const createdAt = toDateSafe(c.createdAt);
//       const createdAtMs = createdAt ? createdAt.getTime() : 0;

//       const override = localOverrides[c.id] || {};

//       const stage = override.stage || normalizeStage(c.stage || c.status);
//       const paymentStatus = override.paymentStatus || c.paymentStatus || "Unpaid";
//       const item =
//         latestMeasurementByCustomer[c.id]?.garment ||
//         c.itemType ||
//         c.garment ||
//         "-";
//       const date = formatDateForCard(c.deliveryDate, createdAt);
//       const dateBucket = getDateBucket(c.deliveryDate);
//       const urgency = urgencyLevelFromBucket(dateBucket);

//       return {
//         id: c.id,
//         name: c.name || "Unknown",
//         phone: c.phone || "",
//         city: c.city || "",
//         orderId: c.orderId || "-",
//         item,
//         stage,
//         paymentStatus,
//         badgeStatus: stageToBadge(stage),
//         date,
//         dateBucket,
//         urgency,
//         rawDeliveryDate: c.deliveryDate || "",
//         createdAtMs,
//       };
//     });
//   }, [customers, measurements, localOverrides]);

//   const statusOptions = useMemo(
//     () => ["All Status", ...Array.from(new Set(orders.map((o) => o.stage)))],
//     [orders]
//   );
//   const paymentOptions = ["All Payment", "Paid", "Unpaid"];

//   const filteredOrders = useMemo(() => {
//     const q = searchText.trim().toLowerCase();

//     let filtered = orders.filter((o) => {
//       const searchBlob = [o.name, o.phone, o.orderId, o.item, o.stage].join(" ").toLowerCase();
//       const searchMatch = !q || searchBlob.includes(q);

//       const statusMatch = filters.status === "All Status" || o.stage === filters.status;
//       const paymentMatch = filters.payment === "All Payment" || o.paymentStatus === filters.payment;

//       return searchMatch && statusMatch && paymentMatch;
//     });

//     if (activeTab === "today") {
//       filtered = filtered.filter(o => ["Overdue", "Today"].includes(o.dateBucket));
//     } else if (activeTab === "upcoming") {
//       filtered = filtered.filter(o => ["Tomorrow", "This Week"].includes(o.dateBucket));
//     }

//     return [...filtered].sort((a, b) => {
//       const order = ["Overdue", "Today", "Tomorrow", "This Week", "Later", "No Date"];
//       const d = order.indexOf(a.dateBucket) - order.indexOf(b.dateBucket);
//       if (d !== 0) return d;
//       return b.createdAtMs - a.createdAtMs;
//     });
//   }, [orders, searchText, filters, activeTab]);

//   const analytics = useMemo(() => {
//     const overdue = orders.filter((o) => o.dateBucket === "Overdue").length;
//     const today = orders.filter((o) => o.dateBucket === "Today").length;
//     const thisWeek = orders.filter((o) => o.dateBucket === "This Week").length;
//     const inProgress = orders.filter((o) => ["Cutting", "Stitching"].includes(o.stage)).length;
//     const trial = orders.filter((o) => o.stage === "Trial").length;
//     const ready = orders.filter((o) => o.stage === "Delivery").length;
//     const unpaid = orders.filter((o) => o.paymentStatus === "Unpaid").length;
    
//     const cashReceived = 98500;
//     const outstanding = 93020;
//     const profit = 125000;
    
//     return { 
//       overdue, 
//       today, 
//       thisWeek,
//       inProgress, 
//       trial,
//       ready, 
//       unpaid, 
//       total: orders.length,
//       cashReceived,
//       outstanding,
//       profit,
//     };
//   }, [orders]);

//   const hasActiveFilters = filters.status !== "All Status" || filters.payment !== "All Payment";

//   const openFilter = (key) => {
//     setActiveFilterKey(key);
//     setFilterModalVisible(true);
//   };

//   const currentFilterOptions = useMemo(() => {
//     if (activeFilterKey === "status") return statusOptions;
//     if (activeFilterKey === "payment") return paymentOptions;
//     return [];
//   }, [activeFilterKey, statusOptions]);

//   const setFilterValue = (value) => {
//     if (!activeFilterKey) return;
//     setFilters((prev) => ({ ...prev, [activeFilterKey]: value }));
//     setFilterModalVisible(false);
//     setActiveFilterKey(null);
//   };

//   const clearAllFilters = () => {
//     setFilters({
//       status: "All Status",
//       payment: "All Payment",
//     });
//     setSearchText("");
//   };

//   const rotateStage = (orderId) => {
//     setLocalOverrides((prev) => {
//       const current = prev[orderId]?.stage || orders.find((o) => o.id === orderId)?.stage || PIPELINE[0];
//       const idx = PIPELINE.indexOf(current);
//       const next = PIPELINE[(idx + 1) % PIPELINE.length];
//       return { ...prev, [orderId]: { ...(prev[orderId] || {}), stage: next } };
//     });
//   };

//   const markPaid = (orderId) => {
//     setLocalOverrides((prev) => ({
//       ...prev,
//       [orderId]: { ...(prev[orderId] || {}), paymentStatus: "Paid" },
//     }));
//   };

//   const callCustomer = async (phone) => {
//     if (!phone) {
//       Alert.alert("No Phone", "Customer phone number is missing.");
//       return;
//     }
//     const url = `tel:${phone}`;
//     const ok = await Linking.canOpenURL(url);
//     if (!ok) return Alert.alert("Error", "Unable to open dialer.");
//     await Linking.openURL(url);
//   };

//   const whatsappCustomer = async (phone) => {
//     if (!phone) {
//       Alert.alert("No Phone", "Customer phone number is missing.");
//       return;
//     }
//     const cleaned = phone.replace(/[^\d]/g, "");
//     const url = `https://wa.me/91${cleaned}`;
//     const ok = await Linking.canOpenURL(url);
//     if (!ok) return Alert.alert("Error", "WhatsApp is not available.");
//     await Linking.openURL(url);
//   };

//   const handleCustomerClick = (order) => {
//     setSelectedCustomer({
//       id: order.id,
//       name: order.name,
//       phone: order.phone,
//       city: order.city,
//       orderId: order.orderId,
//     });
//     setMeasurementModalVisible(true);
//   };

//   const closeMeasurementModal = () => {
//     setMeasurementModalVisible(false);
//     setTimeout(() => {
//       setSelectedCustomer(null);
//       setCustomerMeasurements([]);
//       setSelectedGarment(null);
//     }, 300);
//   };

//   return (
//     <SafeAreaView style={styles.safe}>
//       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
//         {/* HEADER */}
//         <View style={styles.header}>
//           <View>
//             <Text style={styles.greeting}>{t.greeting}</Text>
//             <Text style={styles.subGreeting}>
//               {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
//             </Text>
//           </View>
//           <View style={styles.headerActions}>
//             {/* LANGUAGE TOGGLE - NOW USING GLOBAL COMPONENT */}
//             <LanguageToggle />

//             {/* Notification Bell */}
//             <TouchableOpacity style={styles.headerBtn}>
//               <Ionicons name="notifications-outline" size={22} color="#CBD5E1" />
//               {(analytics.overdue + analytics.today) > 0 && (
//                 <View style={styles.notificationBadge}>
//                   <Text style={styles.notificationBadgeText}>
//                     {analytics.overdue + analytics.today}
//                   </Text>
//                 </View>
//               )}
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* CRITICAL URGENCY BAR */}
//         {(analytics.overdue > 0 || analytics.today > 0) && (
//           <TouchableOpacity 
//             style={styles.urgencyBanner}
//             onPress={() => setActiveTab("today")}
//             activeOpacity={0.8}
//           >
//             <View style={styles.urgencyIcon}>
//               <Ionicons name="flame" size={20} color="#FFF" />
//             </View>
//             <View style={{ flex: 1 }}>
//               <Text style={styles.urgencyTitle}>{t.actionRequired}</Text>
//               <Text style={styles.urgencyDesc}>
//                 {analytics.overdue > 0 && `${analytics.overdue} ${t.overdue}`}
//                 {analytics.overdue > 0 && analytics.today > 0 && " • "}
//                 {analytics.today > 0 && `${analytics.today} ${t.dueToday}`}
//               </Text>
//             </View>
//             <Ionicons name="chevron-forward" size={20} color="#FCA5A5" />
//           </TouchableOpacity>
//         )}

//         {/* BUSINESS SNAPSHOT */}
//         <TouchableOpacity 
//           style={styles.snapshotCard}
//           onPress={() => setShowFinancials(!showFinancials)}
//           activeOpacity={0.9}
//         >
//           <View style={styles.snapshotHeader}>
//             <Text style={styles.snapshotTitle}>{t.todaySnapshot}</Text>
//             <Ionicons 
//               name={showFinancials ? "chevron-up" : "chevron-down"} 
//               size={18} 
//               color="#64748B" 
//             />
//           </View>
          
//           <View style={styles.snapshotGrid}>
//             <SnapshotMetric 
//               icon="layers-outline" 
//               label={t.inProgress}
//               value={analytics.inProgress}
//               color="#3B82F6"
//             />
//             <SnapshotMetric 
//               icon="checkmark-done-outline" 
//               label={t.ready}
//               value={analytics.ready}
//               color="#10B981"
//             />
//             <SnapshotMetric 
//               icon="timer-outline" 
//               label={t.trial}
//               value={analytics.trial}
//               color="#F59E0B"
//             />
//             <SnapshotMetric 
//               icon="wallet-outline" 
//               label={t.unpaid}
//               value={analytics.unpaid}
//               color="#EF4444"
//             />
//           </View>

//           {showFinancials && (
//             <View style={styles.financialRow}>
//               <FinancialBadge 
//                 label={t.cashIn}
//                 value={`₹${(analytics.cashReceived / 1000).toFixed(1)}K`}
//                 type="positive"
//               />
//               <FinancialBadge 
//                 label={t.outstanding}
//                 value={`₹${(analytics.outstanding / 1000).toFixed(1)}K`}
//                 type="negative"
//               />
//               <FinancialBadge 
//                 label={t.profit}
//                 value={`₹${(analytics.profit / 1000).toFixed(1)}K`}
//                 type="positive"
//               />
//             </View>
//           )}
//         </TouchableOpacity>

//         {/* SEARCH BAR - NOW CAPSULE SHAPED */}
//         <View style={[
//           styles.searchContainer, 
//           searchFocused && styles.searchContainerFocused
//         ]}>
//           <View style={styles.searchBar}>
//             <Ionicons name="search" size={20} color={searchFocused ? "#3B82F6" : "#64748B"} />
//             <TextInput
//               placeholder={t.searchPlaceholder}
//               placeholderTextColor="#64748B"
//               style={styles.searchInput}
//               value={searchText}
//               onChangeText={setSearchText}
//               onFocus={() => setSearchFocused(true)}
//               onBlur={() => setSearchFocused(false)}
//             />
//             {(searchText || hasActiveFilters) && (
//               <TouchableOpacity onPress={clearAllFilters}>
//                 <Ionicons name="close-circle" size={20} color="#64748B" />
//               </TouchableOpacity>
//             )}
//           </View>

//           {/* QUICK FILTERS - NOW CAPSULE SHAPED */}
//           <View style={styles.quickFilters}>
//             <QuickFilterChip 
//               label={filters.status === "All Status" ? t.status : filters.status}
//               active={filters.status !== "All Status"}
//               onPress={() => openFilter("status")} 
//             />
//             <QuickFilterChip 
//               label={filters.payment === "All Payment" ? t.payment : filters.payment}
//               active={filters.payment !== "All Payment"}
//               onPress={() => openFilter("payment")} 
//             />
//           </View>
//         </View>

//         {/* TABS - NOW CAPSULE SHAPED */}
//         <View style={styles.tabsContainer}>
//           <TabButton 
//             label={t.today}
//             count={analytics.overdue + analytics.today}
//             active={activeTab === "today"}
//             urgent={analytics.overdue > 0}
//             onPress={() => setActiveTab("today")}
//           />
//           <TabButton 
//             label={t.upcoming}
//             count={analytics.thisWeek}
//             active={activeTab === "upcoming"}
//             onPress={() => setActiveTab("upcoming")}
//           />
//           <TabButton 
//             label={t.allOrders}
//             count={analytics.total}
//             active={activeTab === "all"}
//             onPress={() => setActiveTab("all")}
//           />
//         </View>

//         {/* ORDERS LIST */}
//         <View style={styles.ordersSection}>
//           {loadingOrders ? (
//             <View style={styles.emptyState}>
//               <View style={styles.loader}>
//                 <Ionicons name="hourglass-outline" size={32} color="#475569" />
//               </View>
//               <Text style={styles.emptyText}>{t.loading}</Text>
//             </View>
//           ) : filteredOrders.length === 0 ? (
//             <View style={styles.emptyState}>
//               <Ionicons name="checkmark-done-circle-outline" size={48} color="#334155" />
//               <Text style={styles.emptyText}>
//                 {activeTab === "today" ? t.allClear : 
//                  activeTab === "upcoming" ? t.noUpcoming : 
//                  t.noOrders}
//               </Text>
//               <Text style={styles.emptySubtext}>
//                 {hasActiveFilters ? t.tryClearing : t.addCustomer}
//               </Text>
//             </View>
//           ) : (
//             <>
//               <View style={styles.ordersHeader}>
//                 <Text style={styles.ordersCount}>
//                   {filteredOrders.length} {filteredOrders.length === 1 ? t.order : t.orders}
//                 </Text>
//                 {activeTab === "today" && filteredOrders.length > 0 && (
//                   <View style={styles.focusBadge}>
//                     <Text style={styles.focusBadgeText}>{t.focusMode}</Text>
//                   </View>
//                 )}
//               </View>

//               {filteredOrders.map((order, index) => (
//                 <ModernOrderCard
//                   key={order.id}
//                   order={order}
//                   isExpanded={selectedOrderId === order.id}
//                   onToggle={() => setSelectedOrderId(selectedOrderId === order.id ? null : order.id)}
//                   onCall={() => callCustomer(order.phone)}
//                   onWhatsApp={() => whatsappCustomer(order.phone)}
//                   onNextStage={() => rotateStage(order.id)}
//                   onMarkPaid={() => markPaid(order.id)}
//                   showUrgencyIndicator={activeTab === "today"}
//                   onViewDetails={handleCustomerClick}
//                   translations={t}
//                 />
//               ))}
//             </>
//           )}
//         </View>
//       </ScrollView>

//       {/* FILTER MODAL */}
//       <Modal
//         transparent
//         visible={filterModalVisible}
//         animationType="slide"
//         onRequestClose={() => setFilterModalVisible(false)}
//       >
//         <Pressable style={styles.modalBackdrop} onPress={() => setFilterModalVisible(false)}>
//           <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
//             <View style={styles.modalHandle} />
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>
//                 {activeFilterKey === "status" && t.filterByStatus}
//                 {activeFilterKey === "payment" && t.filterByPayment}
//               </Text>
//               <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
//                 <Ionicons name="close" size={24} color="#64748B" />
//               </TouchableOpacity>
//             </View>
//             <ScrollView style={styles.modalScroll}>
//               {currentFilterOptions.map((opt) => (
//                 <TouchableOpacity 
//                   key={opt} 
//                   style={styles.modalItem} 
//                   onPress={() => setFilterValue(opt)}
//                 >
//                   <Text style={styles.modalItemText}>{opt}</Text>
//                   {filters[activeFilterKey] === opt && (
//                     <Ionicons name="checkmark-circle" size={22} color="#3B82F6" />
//                   )}
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           </Pressable>
//         </Pressable>
//       </Modal>

//       {/* MEASUREMENT DETAILS MODAL */}
//       <Modal
//         transparent
//         visible={measurementModalVisible}
//         animationType="fade"
//         onRequestClose={closeMeasurementModal}
//         statusBarTranslucent
//       >
//         <StatusBar backgroundColor="rgba(0,0,0,0.8)" barStyle="light-content" />
        
//         <View style={styles.measurementModalOverlay}>
//           <TouchableOpacity 
//             style={styles.measurementBackdrop} 
//             activeOpacity={1} 
//             onPress={closeMeasurementModal}
//           />

//           <Animated.View
//             style={[
//               styles.measurementModalContainer,
//               {
//                 transform: [
//                   { scale: scaleAnim },
//                   {
//                     translateY: scaleAnim.interpolate({
//                       inputRange: [0, 1],
//                       outputRange: [height, 0],
//                     }),
//                   },
//                 ],
//                 opacity: scaleAnim,
//               },
//             ]}
//           >
//             {/* UPDATED Header with back arrow (WhatsApp style) */}
//             <View style={styles.measurementHeader}>
//               <View style={styles.measurementHeaderRow}>
//                 {/* Back arrow on left */}
//                 <TouchableOpacity 
//                   style={styles.backBtn} 
//                   onPress={closeMeasurementModal}
//                 >
//                   <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
//                 </TouchableOpacity>

//                 <View style={styles.customerInfo}>
//                   <View style={styles.avatarCircle}>
//                     <Text style={styles.avatarText}>
//                       {selectedCustomer?.name?.charAt(0).toUpperCase()}
//                     </Text>
//                   </View>
//                   <View style={styles.customerDetails}>
//                     <Text style={styles.customerName}>{selectedCustomer?.name}</Text>
//                     <Text style={styles.customerMeta}>{selectedCustomer?.phone}</Text>
//                   </View>
//                 </View>

//                 {/* Call and WhatsApp on right */}
//                 {/* Language Toggle + Call and WhatsApp on right */}
//                 <View style={styles.headerActionsRow}>
//                   <LanguageToggle />

//                   <TouchableOpacity
//                     style={styles.headerActionBtn}
//                     onPress={() => callCustomer(selectedCustomer?.phone)}
//                   >
//                     <Ionicons name="call" size={20} color="#3B82F6" />
//                   </TouchableOpacity>

//                   <TouchableOpacity
//                     style={styles.headerActionBtn}
//                     onPress={() => whatsappCustomer(selectedCustomer?.phone)}
//                   >
//                     <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             </View>

//             {/* Garment Tabs - Compact */}
//             {customerMeasurements.length > 0 ? (
//               <>
//                 <View style={styles.garmentTabsContainer}>
//                   <ScrollView 
//                     horizontal 
//                     showsHorizontalScrollIndicator={false}
//                     contentContainerStyle={styles.garmentTabs}
//                   >
//                     {customerMeasurements.map((measurement) => (
//                       <GarmentTab
//                         key={measurement.id}
//                         garment={measurement.garment}
//                         fitType={measurement.fitType}
//                         active={selectedGarment?.id === measurement.id}
//                         onPress={() => setSelectedGarment(measurement)}
//                       />
//                     ))}
//                   </ScrollView>
//                 </View>

//                 {/* Measurements Display - Maximum Space */}
//                 {selectedGarment && (
//                   <ScrollView 
//                     style={styles.measurementsScroll}
//                     showsVerticalScrollIndicator={false}
//                   >
//                     <View style={styles.measurementsContainer}>
//                       <View style={styles.fitTypeCard}>
//                         <Ionicons 
//                           name="resize-outline" 
//                           size={18} 
//                           color={GARMENT_COLORS[selectedGarment.garment]} 
//                         />
//                         <Text style={styles.fitTypeLabel}>{t.fit}:</Text>
//                         <Text style={[
//                           styles.fitTypeValue,
//                           { color: GARMENT_COLORS[selectedGarment.garment] }
//                         ]}>
//                           {selectedGarment.fitType || "Regular"}
//                         </Text>
//                       </View>

//                       {selectedGarment.notes && (
//                         <View style={styles.notesCard}>
//                           <Ionicons name="document-text-outline" size={16} color="#64748B" />
//                           <Text style={styles.notesText}>{selectedGarment.notes}</Text>
//                         </View>
//                       )}

//                       {Object.entries(selectedGarment.values || {}).map(([key, value], index) => (
//                         <MeasurementRow 
//                           key={`${key}-${index}`}
//                           label={key}
//                           value={value}
//                           color={GARMENT_COLORS[selectedGarment.garment]}
//                         />
//                       ))}
//                     </View>
//                   </ScrollView>
//                 )}
//               </>
//             ) : (
//               <View style={styles.emptyMeasurementState}>
//                 <Ionicons name="clipboard-outline" size={64} color="#334155" />
//                 <Text style={styles.emptyMeasurementTitle}>{t.noMeasurements}</Text>
//                 <Text style={styles.emptyMeasurementSubtitle}>
//                   {t.startMeasurements}
//                 </Text>
//               </View>
//             )}

//             {/* Action Buttons - Compact */}
//             {customerMeasurements.length > 0 && (
//               <View style={styles.measurementActionBar}>
//                 <TouchableOpacity style={styles.measurementActionBtnSecondary}>
//                   <Ionicons name="share-outline" size={18} color="#3B82F6" />
//                   <Text style={styles.measurementActionBtnText}>{t.share}</Text>
//                 </TouchableOpacity>
                
//                 <TouchableOpacity style={styles.measurementActionBtnSecondary}>
//                   <Ionicons name="print-outline" size={18} color="#8B5CF6" />
//                   <Text style={styles.measurementActionBtnText}>{t.print}</Text>
//                 </TouchableOpacity>
                
//                 <TouchableOpacity 
//                   style={styles.measurementActionBtnPrimary}
//                   onPress={() => {
//                     closeMeasurementModal();
//                     navigation.navigate("AddMeasurement", { customerId: selectedCustomer.id });
//                   }}
//                 >
//                   <Ionicons name="add-circle-outline" size={18} color="#FFF" />
//                   <Text style={styles.measurementActionBtnPrimaryText}>{t.add}</Text>
//                 </TouchableOpacity>
//               </View>
//             )}
//           </Animated.View>
//         </View>
//       </Modal>

//       {/* FLOATING ACTION BUTTON */}
//       <TouchableOpacity 
//         style={styles.fab} 
//         onPress={() => navigation.navigate("AddCustomer")}
//         activeOpacity={0.9}
//       >
//         <Ionicons name="add" size={28} color="#FFF" />
//       </TouchableOpacity>

//       {/* BOTTOM NAV */}
//       <View style={styles.bottomNav}>
//         <NavButton icon="home" label={t.home} active />
//         <NavButton icon="people-outline" label={t.customers} />
//         <NavButton icon="shirt" label={t.tryOn} special disabled />
//         <NavButton icon="receipt-outline" label={t.bills} />
//         <NavButton icon="person-outline" label={t.profile} onPress={() => navigation.navigate('Profile')} />
//       </View>
//     </SafeAreaView>
//   );
// }

// /* ==================== SUB COMPONENTS ==================== */

// const SnapshotMetric = ({ icon, label, value, color }) => (
//   <View style={styles.snapshotMetric}>
//     <View style={[styles.snapshotIcon, { backgroundColor: color + "15" }]}>
//       <Ionicons name={icon} size={18} color={color} />
//     </View>
//     <Text style={styles.snapshotValue}>{value}</Text>
//     <Text style={styles.snapshotLabel}>{label}</Text>
//   </View>
// );

// const FinancialBadge = ({ label, value, type }) => (
//   <View style={styles.financialBadge}>
//     <Text style={styles.financialLabel}>{label}</Text>
//     <Text style={[
//       styles.financialValue,
//       type === "positive" && styles.financialPositive,
//       type === "negative" && styles.financialNegative
//     ]}>
//       {value}
//     </Text>
//   </View>
// );

// const QuickFilterChip = ({ label, active, onPress }) => (
//   <TouchableOpacity 
//     style={[styles.quickFilterChip, active && styles.quickFilterChipActive]} 
//     onPress={onPress}
//   >
//     <Text style={[styles.quickFilterText, active && styles.quickFilterTextActive]}>
//       {label}
//     </Text>
//     <Ionicons 
//       name="chevron-down" 
//       size={14} 
//       color={active ? "#3B82F6" : "#64748B"} 
//     />
//   </TouchableOpacity>
// );

// import { Easing } from "react-native";

// const TabButton = ({ label, count, active, urgent, onPress }) => {
//   const [anim] = useState(new Animated.Value(active ? 1 : 0));

//   useEffect(() => {
//     Animated.timing(anim, {
//       toValue: active ? 1 : 0,
//       duration: 300,
//       easing: Easing.out(Easing.cubic),
//       useNativeDriver: false,
//     }).start();
//   }, [active]);

//   const backgroundColor = anim.interpolate({
//     inputRange: [0, 1],
//     outputRange: ["transparent", "#3B82F6"],
//   });

//   const scale = anim.interpolate({
//     inputRange: [0, 1],
//     outputRange: [1, 1.05],
//   });

//   return (
//     <Animated.View
//       style={[
//         styles.tab,
//         {
//           backgroundColor,
//           transform: [{ scale }],
//         },
//       ]}
//     >
//       <TouchableOpacity
//         onPress={onPress}
//         activeOpacity={0.9}
//         style={styles.tabTouchable}
//       >
//         <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
//           {label}
//         </Text>

//         {count > 0 && (
//           <View
//             style={[
//               styles.tabBadge,
//               active && styles.tabBadgeActive,
//               urgent && styles.tabBadgeUrgent,
//             ]}
//           >
//             <Text
//               style={[
//                 styles.tabBadgeText,
//                 active && styles.tabBadgeTextActive,
//                 urgent && styles.tabBadgeTextUrgent,
//               ]}
//             >
//               {count}
//             </Text>
//           </View>
//         )}
//       </TouchableOpacity>
//     </Animated.View>
//   );
// };

// const ModernOrderCard = ({ 
//   order, 
//   isExpanded, 
//   onToggle, 
//   onCall, 
//   onWhatsApp, 
//   onNextStage, 
//   onMarkPaid,
//   showUrgencyIndicator,
//   onViewDetails,
//   translations
// }) => {
//   const stageIndex = PIPELINE.indexOf(order.stage);
//   const progressPercentage = ((stageIndex + 1) / PIPELINE.length) * 100;

//   const urgencyColors = {
//     High: { bg: "#FEE2E2", text: "#DC2626", border: "#FCA5A5" },
//     Medium: { bg: "#FEF3C7", text: "#D97706", border: "#FCD34D" },
//     Low: { bg: "#D1FAE5", text: "#059669", border: "#6EE7B7" },
//   };

//   const urgencyStyle = urgencyColors[order.urgency] || urgencyColors.Low;
  
//   const getUrgencyText = (urgency) => {
//     if (urgency === "High") return translations.high;
//     if (urgency === "Medium") return translations.medium;
//     return translations.low;
//   };

//   return (
//     <TouchableOpacity 
//       style={[
//         styles.modernCard,
//         order.dateBucket === "Overdue" && styles.modernCardOverdue
//       ]}
//       onLongPress={onToggle}
//       onPress={() => onViewDetails(order)}
//       activeOpacity={0.7}
//     >
//       {showUrgencyIndicator && order.urgency === "High" && (
//         <View style={styles.urgencyStripe} />
//       )}

//       <View style={styles.cardMain}>
//         <View style={styles.cardHeader}>
//           <View style={styles.cardLeft}>
//             <Text style={styles.cardName}>{order.name}</Text>
//             <View style={styles.cardMetaRow}>
//               <Text style={styles.cardMeta}>#{order.orderId}</Text>
//               <View style={styles.cardDot} />
//               <Text style={styles.cardMeta}>{order.item}</Text>
//             </View>
//           </View>
//           <View style={styles.cardRight}>
//             <Text style={styles.cardDate}>{order.date}</Text>
//             <View style={[styles.cardUrgency, { 
//               backgroundColor: urgencyStyle.bg,
//               borderColor: urgencyStyle.border 
//             }]}>
//               <Text style={[styles.cardUrgencyText, { color: urgencyStyle.text }]}>
//                 {getUrgencyText(order.urgency)}
//               </Text>
//             </View>
//           </View>
//         </View>

//         <View style={styles.cardProgress}>
//           <View style={styles.cardProgressBg}>
//             <View style={[styles.cardProgressFill, { width: `${progressPercentage}%` }]} />
//           </View>
//           <View style={styles.cardStageRow}>
//             <Text style={styles.cardStageText}>{order.stage}</Text>
//             <Text style={styles.cardStagePercent}>{Math.round(progressPercentage)}%</Text>
//           </View>
//         </View>

//         <View style={styles.cardFooter}>
//           <View style={styles.cardBadges}>
//             <StatusChip status={order.badgeStatus} translations={translations} />
//             <PaymentChip status={order.paymentStatus} translations={translations} />
//           </View>
//           <TouchableOpacity onPress={() => onViewDetails(order)}>
//             <Ionicons 
//               name="eye-outline"
//               size={24} 
//               color="#3B82F6" 
//             />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {isExpanded && (
//         <View style={styles.cardActions}>
//           <QuickAction 
//             icon="call" 
//             label={translations.call}
//             color="#3B82F6" 
//             onPress={onCall} 
//           />
//           <QuickAction 
//             icon="logo-whatsapp" 
//             label={translations.whatsapp}
//             color="#25D366" 
//             onPress={onWhatsApp} 
//           />
//           <QuickAction 
//             icon="play-forward" 
//             label={translations.nextStage}
//             color="#8B5CF6" 
//             onPress={onNextStage} 
//           />
//           <QuickAction 
//             icon="cash" 
//             label={translations.markPaid}
//             color="#10B981" 
//             onPress={onMarkPaid} 
//           />
//         </View>
//       )}
//     </TouchableOpacity>
//   );
// };

// const StatusChip = ({ status, translations }) => {
//   const colors = {
//     Pending: { bg: "#FEF2F2", text: "#DC2626" },
//     Progress: { bg: "#FEF3C7", text: "#D97706" },
//     Ready: { bg: "#D1FAE5", text: "#059669" },
//   };
//   const style = colors[status] || colors.Pending;
  
//   const getStatusText = (status) => {
//     if (status === "Pending") return translations.pending;
//     if (status === "Progress") return translations.progress;
//     return translations.ready;
//   };

//   return (
//     <View style={[styles.statusChip, { backgroundColor: style.bg }]}>
//       <Text style={[styles.statusChipText, { color: style.text }]}>
//         {getStatusText(status)}
//       </Text>
//     </View>
//   );
// };

// const PaymentChip = ({ status, translations }) => (
//   <View style={[
//     styles.paymentChip,
//     status === "Paid" ? styles.paymentChipPaid : styles.paymentChipUnpaid
//   ]}>
//     <Ionicons 
//       name={status === "Paid" ? "checkmark-circle" : "time"} 
//       size={12} 
//       color={status === "Paid" ? "#059669" : "#D97706"} 
//     />
//     <Text style={[
//       styles.paymentChipText,
//       status === "Paid" ? styles.paymentChipTextPaid : styles.paymentChipTextUnpaid
//     ]}>
//       {status === "Paid" ? translations.paid : translations.unpaid}
//     </Text>
//   </View>
// );

// const QuickAction = ({ icon, label, color, onPress }) => (
//   <TouchableOpacity style={styles.quickAction} onPress={onPress}>
//     <View style={[styles.quickActionIcon, { backgroundColor: color + "15" }]}>
//       <Ionicons name={icon} size={20} color={color} />
//     </View>
//     <Text style={styles.quickActionLabel}>{label}</Text>
//   </TouchableOpacity>
// );

// const NavButton = ({ icon, label, active, disabled, special, onPress }) => {
//   const [scaleValue] = useState(new Animated.Value(1));

//   const handlePressIn = () => {
//     if (!disabled) {
//       Animated.spring(scaleValue, {
//         toValue: 0.9,
//         useNativeDriver: true,
//       }).start();
//     }
//   };

//   const handlePressOut = () => {
//     Animated.spring(scaleValue, {
//       toValue: 1,
//       friction: 3,
//       useNativeDriver: true,
//     }).start();
//   };

//   return (
//     <TouchableOpacity 
//       style={[
//         styles.navButton,
//         active && styles.navButtonActive,
//         special && styles.navButtonSpecial
//       ]}
//       disabled={disabled}
//       activeOpacity={1}
//       onPressIn={handlePressIn}
//       onPressOut={handlePressOut}
//       onPress={onPress}
//     >
//       <Animated.View style={{ transform: [{ scale: scaleValue }], alignItems: 'center' }}>
//         <Ionicons 
//           name={icon} 
//           size={22} 
//           color={active ? "#FFFFFF" : "#94A3B8"}
//         />
//         <Text style={[
//           styles.navButtonLabel, 
//           active && styles.navButtonLabelActive
//         ]}>
//           {label}
//         </Text>
//       </Animated.View>
//     </TouchableOpacity>
//   );
// };

// const GarmentTab = ({ garment, fitType, active, onPress }) => {
//   const color = GARMENT_COLORS[garment] || "#3B82F6";
//   const icon = GARMENT_ICONS[garment] || "shirt-outline";

//   return (
//     <TouchableOpacity
//       style={[
//         styles.garmentTab,
//         active && [styles.garmentTabActive, { borderColor: color }],
//       ]}
//       onPress={onPress}
//       activeOpacity={0.7}
//     >
//       <View style={[styles.garmentIcon, { backgroundColor: color + "20" }]}>
//         <Ionicons name={icon} size={20} color={color} />
//       </View>
//       <Text style={[styles.garmentTabName, active && styles.garmentTabNameActive]}>
//         {garment}
//       </Text>
//       {fitType && (
//         <Text style={styles.garmentTabFit}>{fitType}</Text>
//       )}
//     </TouchableOpacity>
//   );
// };

// const MeasurementRow = ({ label, value, color }) => {
//   const { t } = useLanguage();
  
//   return (
//     <View style={styles.measurementRow}>
//       <View style={styles.measurementLeft}>
//         <View style={[styles.measurementDot, { backgroundColor: color }]} />
//         <Text style={styles.measurementLabel}>{t[label] || label}</Text>
//       </View>
//       <View style={styles.measurementRight}>
//         <Text style={styles.measurementValue}>{value}</Text>
//         <Text style={styles.measurementUnit}>{t.in}</Text>
//       </View>
//     </View>
//   );
// };

// /* ==================== STYLES (KEPT EXACTLY AS YOURS) ==================== */

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: "#0A0E1A" },

//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingTop: 12,
//     paddingBottom: 20,
//   },
//   greeting: { 
//     fontSize: 28, 
//     fontWeight: "800", 
//     color: "#F8FAFC",
//     letterSpacing: -0.5,
//   },
//   subGreeting: { 
//     fontSize: 14, 
//     color: "#64748B", 
//     marginTop: 4,
//     fontWeight: "500",
//   },
//   headerActions: { flexDirection: "row", gap: 12 },
//   headerBtn: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: "#1E293B",
//     justifyContent: "center",
//     alignItems: "center",
//     position: "relative",
//   },
  
//   notificationBadge: {
//     position: "absolute",
//     top: -2,
//     right: -2,
//     backgroundColor: "#EF4444",
//     borderRadius: 10,
//     minWidth: 20,
//     height: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 2,
//     borderColor: "#0A0E1A",
//   },
//   notificationBadgeText: {
//     color: "#FFF",
//     fontSize: 11,
//     fontWeight: "700",
//   },

//   urgencyBanner: {
//     marginHorizontal: 20,
//     marginBottom: 20,
//     backgroundColor: "#991B1B",
//     borderRadius: 16,
//     padding: 16,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//     shadowColor: "#DC2626",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   urgencyIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "#DC2626",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   urgencyTitle: {
//     color: "#FFF",
//     fontSize: 16,
//     fontWeight: "700",
//     marginBottom: 2,
//   },
//   urgencyDesc: {
//     color: "#FCA5A5",
//     fontSize: 13,
//     fontWeight: "500",
//   },

//   snapshotCard: {
//     marginHorizontal: 20,
//     marginBottom: 20,
//     backgroundColor: "#1E293B",
//     borderRadius: 20,
//     padding: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   snapshotHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   snapshotTitle: {
//     color: "#F1F5F9",
//     fontSize: 16,
//     fontWeight: "700",
//   },
//   snapshotGrid: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 12,
//   },
//   snapshotMetric: {
//     flex: 1,
//     alignItems: "center",
//   },
//   snapshotIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 8,
//   },
//   snapshotValue: {
//     color: "#F8FAFC",
//     fontSize: 22,
//     fontWeight: "800",
//     marginBottom: 2,
//   },
//   snapshotLabel: {
//     color: "#64748B",
//     fontSize: 11,
//     fontWeight: "500",
//   },
//   financialRow: {
//     flexDirection: "row",
//     marginTop: 12,
//     paddingTop: 12,
//     borderTopWidth: 1,
//     borderTopColor: "#334155",
//     gap: 8,
//   },
//   financialBadge: {
//     flex: 1,
//     backgroundColor: "#0F172A",
//     borderRadius: 10,
//     padding: 10,
//     alignItems: "center",
//   },
//   financialLabel: {
//     color: "#64748B",
//     fontSize: 10,
//     fontWeight: "600",
//     marginBottom: 4,
//   },
//   financialValue: {
//     fontSize: 14,
//     fontWeight: "700",
//   },
//   financialPositive: { color: "#10B981" },
//   financialNegative: { color: "#EF4444" },

//   searchContainer: {
//     marginHorizontal: 20,
//     marginBottom: 16,
//   },
//   searchContainerFocused: {
//     transform: [{ scale: 1.01 }],
//   },
//   searchBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#1E293B",
//     borderRadius: 50,
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     gap: 12,
//     borderWidth: 2,
//     borderColor: "transparent",
//   },
//   searchInput: {
//     flex: 1,
//     color: "#F1F5F9",
//     fontSize: 15,
//     fontWeight: "500",
//   },
//   quickFilters: {
//     flexDirection: "row",
//     marginTop: 10,
//     gap: 8,
//   },
//   quickFilterChip: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#1E293B",
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     borderRadius: 50,
//     gap: 6,
//     borderWidth: 1,
//     borderColor: "transparent",
//   },
//   quickFilterChipActive: {
//     backgroundColor: "#1E3A8A",
//     borderColor: "#3B82F6",
//   },
//   quickFilterText: {
//     color: "#64748B",
//     fontSize: 13,
//     fontWeight: "600",
//   },
//   quickFilterTextActive: {
//     color: "#93C5FD",
//   },

//   tabsContainer: {
//     flexDirection: "row",
//     marginHorizontal: 20,
//     marginBottom: 20,
//     backgroundColor: "#1E293B",
//     borderRadius: 50,
//     padding: 4,
//     gap: 4,
//     overflow: "hidden",
//   },

//   tab: {
//     flex: 1,
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     paddingVertical: 10,
//     borderRadius: 50,
//     gap: 6,
//   },
//   tabTouchable: {
//     flex: 1,
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 6,
//   },
//   tabActive: {
//     backgroundColor: "#3B82F6",
//     shadowColor: "#3B82F6",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.4,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   tabLabel: {
//     color: "#64748B",
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   tabLabelActive: {
//     color: "#FFF",
//   },
//   tabBadge: {
//     backgroundColor: "#334155",
//     borderRadius: 10,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     minWidth: 24,
//     alignItems: "center",
//   },
//   tabBadgeActive: {
//     backgroundColor: "#1E3A8A",
//   },
//   tabBadgeUrgent: {
//     backgroundColor: "#DC2626",
//   },
//   tabBadgeText: {
//     color: "#94A3B8",
//     fontSize: 12,
//     fontWeight: "700",
//   },
//   tabBadgeTextActive: {
//     color: "#DBEAFE",
//   },
//   tabBadgeTextUrgent: {
//     color: "#FFF",
//   },

//   ordersSection: {
//     paddingHorizontal: 20,
//   },
//   ordersHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   ordersCount: {
//     color: "#94A3B8",
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   focusBadge: {
//     backgroundColor: "#7C2D12",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 8,
//   },
//   focusBadgeText: {
//     color: "#FDBA74",
//     fontSize: 12,
//     fontWeight: "700",
//   },

//   modernCard: {
//     backgroundColor: "#1E293B",
//     borderRadius: 16,
//     marginBottom: 12,
//     overflow: "hidden",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 2,
//     position: "relative",
//   },
//   modernCardOverdue: {
//     borderLeftWidth: 4,
//     borderLeftColor: "#DC2626",
//   },
//   urgencyStripe: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     height: 3,
//     backgroundColor: "#EF4444",
//   },
//   cardMain: {
//     padding: 16,
//   },
//   cardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 14,
//   },
//   cardLeft: {
//     flex: 1,
//   },
//   cardName: {
//     color: "#F8FAFC",
//     fontSize: 17,
//     fontWeight: "700",
//     marginBottom: 4,
//   },
//   cardMetaRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//   },
//   cardMeta: {
//     color: "#64748B",
//     fontSize: 13,
//     fontWeight: "500",
//   },
//   cardDot: {
//     width: 3,
//     height: 3,
//     borderRadius: 1.5,
//     backgroundColor: "#475569",
//   },
//   cardRight: {
//     alignItems: "flex-end",
//   },
//   cardDate: {
//     color: "#94A3B8",
//     fontSize: 13,
//     fontWeight: "600",
//     marginBottom: 6,
//   },
//   cardUrgency: {
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 6,
//     borderWidth: 1,
//   },
//   cardUrgencyText: {
//     fontSize: 11,
//     fontWeight: "700",
//   },

//   cardProgress: {
//     marginBottom: 14,
//   },
//   cardProgressBg: {
//     height: 6,
//     backgroundColor: "#334155",
//     borderRadius: 3,
//     overflow: "hidden",
//     marginBottom: 8,
//   },
//   cardProgressFill: {
//     height: "100%",
//     backgroundColor: "#3B82F6",
//     borderRadius: 3,
//   },
//   cardStageRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   cardStageText: {
//     color: "#94A3B8",
//     fontSize: 13,
//     fontWeight: "600",
//   },
//   cardStagePercent: {
//     color: "#3B82F6",
//     fontSize: 13,
//     fontWeight: "700",
//   },

//   cardFooter: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   cardBadges: {
//     flexDirection: "row",
//     gap: 8,
//   },
//   statusChip: {
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 8,
//   },
//   statusChipText: {
//     fontSize: 11,
//     fontWeight: "700",
//   },
//   paymentChip: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 8,
//     gap: 4,
//   },
//   paymentChipPaid: {
//     backgroundColor: "#D1FAE5",
//   },
//   paymentChipUnpaid: {
//     backgroundColor: "#FEF3C7",
//   },
//   paymentChipText: {
//     fontSize: 11,
//     fontWeight: "700",
//   },
//   paymentChipTextPaid: {
//     color: "#059669",
//   },
//   paymentChipTextUnpaid: {
//     color: "#D97706",
//   },

//   cardActions: {
//     flexDirection: "row",
//     borderTopWidth: 1,
//     borderTopColor: "#334155",
//     padding: 12,
//     gap: 8,
//   },
//   quickAction: {
//     flex: 1,
//     alignItems: "center",
//     gap: 6,
//   },
//   quickActionIcon: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   quickActionLabel: {
//     color: "#94A3B8",
//     fontSize: 11,
//     fontWeight: "600",
//   },

//   emptyState: {
//     alignItems: "center",
//     paddingVertical: 80,
//   },
//   loader: {
//     marginBottom: 16,
//   },
//   emptyText: {
//     color: "#CBD5E1",
//     fontSize: 17,
//     fontWeight: "600",
//     marginBottom: 8,
//   },
//   emptySubtext: {
//     color: "#64748B",
//     fontSize: 14,
//     textAlign: "center",
//   },

//   modalBackdrop: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.75)",
//     justifyContent: "flex-end",
//   },
//   modalCard: {
//     backgroundColor: "#1E293B",
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     maxHeight: "60%",
//   },
//   modalHandle: {
//     width: 40,
//     height: 4,
//     backgroundColor: "#475569",
//     borderRadius: 2,
//     alignSelf: "center",
//     marginTop: 12,
//     marginBottom: 8,
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#334155",
//   },
//   modalTitle: {
//     color: "#F1F5F9",
//     fontSize: 18,
//     fontWeight: "700",
//   },
//   modalScroll: {
//     maxHeight: 400,
//   },
//   modalItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingVertical: 16,
//     paddingHorizontal: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: "#334155",
//   },
//   modalItemText: {
//     color: "#E2E8F0",
//     fontSize: 16,
//     fontWeight: "500",
//   },

//   measurementModalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.85)",
//     justifyContent: "flex-end",
//   },
//   measurementBackdrop: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   measurementModalContainer: {
//     height: height * 0.92,
//     backgroundColor: "#0F172A",
//     borderTopLeftRadius: 32,
//     borderTopRightRadius: 32,
//     overflow: "hidden",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: -4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 16,
//     elevation: 24,
//   },

//   measurementHeader: {
//     backgroundColor: "#1E293B",
//     paddingTop: 12,
//     paddingBottom: 12,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#334155",
//   },
//   measurementHeaderRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   customerInfo: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     flex: 1,
//   },
//   avatarCircle: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "#3B82F6",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   avatarText: {
//     color: "#FFF",
//     fontSize: 18,
//     fontWeight: "800",
//   },
//   customerDetails: {
//     flex: 1,
//   },
//   customerName: {
//     color: "#F8FAFC",
//     fontSize: 16,
//     fontWeight: "700",
//     marginBottom: 2,
//   },
//   customerMeta: {
//     color: "#94A3B8",
//     fontSize: 12,
//     fontWeight: "500",
//   },
  
//   headerActionsRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//   },
//   headerActionBtn: {
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "transparent",
//     padding: 8,
//   },
//   backBtn: {
//     padding: 8,
//     marginRight: 8,
//   },

//   garmentTabsContainer: {
//     borderBottomWidth: 1,
//     borderBottomColor: "#334155",
//   },
//   garmentTabs: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     gap: 8,
//   },
//   garmentTab: {
//     backgroundColor: "#1E293B",
//     borderRadius: 12,
//     padding: 8,
//     alignItems: "center",
//     minWidth: 75,
//     borderWidth: 2,
//     borderColor: "transparent",
//   },
//   garmentTabActive: {
//     backgroundColor: "#1E3A5F",
//   },
//   garmentIcon: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 4,
//   },
//   garmentTabName: {
//     color: "#94A3B8",
//     fontSize: 12,
//     fontWeight: "700",
//     marginBottom: 2,
//   },
//   garmentTabNameActive: {
//     color: "#E2E8F0",
//   },
//   garmentTabFit: {
//     color: "#64748B",
//     fontSize: 9,
//     fontWeight: "500",
//   },

//   measurementsScroll: {
//     flex: 1,
//   },
//   measurementsContainer: {
//     padding: 16,
//     paddingBottom: 20,
//   },
//   fitTypeCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#1E293B",
//     padding: 12,
//     borderRadius: 10,
//     gap: 8,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: "#334155",
//   },
//   fitTypeLabel: {
//     color: "#94A3B8",
//     fontSize: 13,
//     fontWeight: "600",
//   },
//   fitTypeValue: {
//     fontSize: 15,
//     fontWeight: "700",
//     marginLeft: "auto",
//   },

//   notesCard: {
//     flexDirection: "row",
//     backgroundColor: "#1E293B",
//     padding: 12,
//     borderRadius: 10,
//     gap: 8,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: "#334155",
//   },
//   notesText: {
//     flex: 1,
//     color: "#CBD5E1",
//     fontSize: 12,
//     lineHeight: 16,
//   },

//   measurementRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     backgroundColor: "#1E293B",
//     padding: 14,
//     borderRadius: 10,
//     marginBottom: 8,
//     borderWidth: 1,
//     borderColor: "#334155",
//   },
//   measurementLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     flex: 1,
//   },
//   measurementDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//   },
//   measurementLabel: {
//     color: "#CBD5E1",
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   measurementRight: {
//     flexDirection: "row",
//     alignItems: "baseline",
//     gap: 4,
//   },
//   measurementValue: {
//     color: "#F8FAFC",
//     fontSize: 18,
//     fontWeight: "700",
//   },
//   measurementUnit: {
//     color: "#64748B",
//     fontSize: 11,
//     fontWeight: "500",
//   },

//   emptyMeasurementState: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingVertical: 60,
//   },
//   emptyMeasurementTitle: {
//     color: "#CBD5E1",
//     fontSize: 18,
//     fontWeight: "700",
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   emptyMeasurementSubtitle: {
//     color: "#64748B",
//     fontSize: 13,
//     textAlign: "center",
//   },

//   measurementActionBar: {
//     flexDirection: "row",
//     padding: 16,
//     paddingBottom: 24,
//     backgroundColor: "#1E293B",
//     borderTopWidth: 1,
//     borderTopColor: "#334155",
//     gap: 8,
//   },
//   measurementActionBtnSecondary: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#0F172A",
//     paddingVertical: 12,
//     borderRadius: 10,
//     gap: 6,
//     borderWidth: 1,
//     borderColor: "#334155",
//   },
//   measurementActionBtnText: {
//     color: "#94A3B8",
//     fontSize: 13,
//     fontWeight: "700",
//   },
//   measurementActionBtnPrimary: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#3B82F6",
//     paddingVertical: 12,
//     borderRadius: 10,
//     gap: 6,
//   },
//   measurementActionBtnPrimaryText: {
//     color: "#FFF",
//     fontSize: 13,
//     fontWeight: "700",
//   },

//   fab: {
//     position: "absolute",
//     bottom: 90,
//     right: 30,
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//     backgroundColor: "#3B82F6",
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: "#3B82F6",
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.4,
//     shadowRadius: 16,
//     elevation: 8,
//   },

//   bottomNav: {
//     position: "absolute",
//     bottom: 12,
//     left: 12,
//     right: 12,
//     flexDirection: "row",
//     justifyContent: "space-evenly",
//     alignItems: "center",
//     backgroundColor: "rgba(30, 41, 59, 0.7)",
//     paddingVertical: 10,
//     paddingHorizontal: 8,
//     borderRadius: 50,
//     borderWidth: 1,
//     borderColor: "rgba(148, 163, 184, 0.2)",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.4,
//     shadowRadius: 20,
//     elevation: 15,
//   },
//   navButton: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 6,
//     paddingHorizontal: 6,
//     borderRadius: 20,
//     flex: 1,
//     maxWidth: 70,
//   },
//   navButtonActive: {
//     backgroundColor: "#3B82F6",
//     shadowColor: "#3B82F6",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.6,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   navButtonSpecial: {
//     opacity: 0.5,
//   },
//   navButtonLabel: {
//     color: "#94A3B8",
//     fontSize: 10,
//     fontWeight: "600",
//     marginTop: 3,
//   },
//   navButtonLabelActive: {
//     color: "#FFFFFF",
//     fontWeight: "700",
//   },
// });

import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Alert,
  Animated,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { useLanguage } from "../context/LanguageContext"; // ← ADDED
import { LanguageToggle } from "../context/LanguageToggle"; // ← ADDED

const { width, height } = Dimensions.get("window");

const PIPELINE = ["Measurement", "Cutting", "Stitching", "Trial", "Delivery"];

const COMPLEXITY_WEIGHT = {
  Suit: 5,
  Blazer: 4,
  Safari: 3,
  Kurta: 2,
  Shirt: 2,
  Pant: 2,
};

const GARMENT_ICONS = {
  Shirt: "shirt-outline",
  Pant: "fitness-outline",
  Kurta: "body-outline",
  Safari: "briefcase-outline",
  Coti: "layers-outline",
  Blazer: "diamond-outline",
  Suit: "ribbon-outline",
};

const GARMENT_COLORS = {
  Shirt: "#3B82F6",
  Pant: "#8B5CF6",
  Kurta: "#EC4899",
  Safari: "#F59E0B",
  Coti: "#10B981",
  Blazer: "#EF4444",
  Suit: "#6366F1",
};

const parseDeliveryDate = (value) => {
  if (!value || typeof value !== "string") return null;
  const parts = value.split("/");
  if (parts.length !== 3) return null;

  const day = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const year = Number(parts[2]);

  const date = new Date(year, month, day);
  return Number.isNaN(date.getTime()) ? null : date;
};

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const getDateBucket = (deliveryDateStr) => {
  const parsed = parseDeliveryDate(deliveryDateStr);
  if (!parsed) return "No Date";

  const today = startOfDay(new Date());
  const target = startOfDay(parsed);
  const diff = Math.round((target - today) / 86400000);

  if (diff < 0) return "Overdue";
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff <= 7) return "This Week";
  return "Later";
};

const normalizeStage = (rawStatus) => {
  const v = String(rawStatus || "").toLowerCase().trim();
  if (["measurement", "pending", "new"].includes(v)) return "Measurement";
  if (["cutting"].includes(v)) return "Cutting";
  if (["stitching", "progress", "in progress", "in_progress"].includes(v)) return "Stitching";
  if (["trial", "qc"].includes(v)) return "Trial";
  if (["delivery", "ready", "delivered", "complete", "completed"].includes(v)) return "Delivery";
  return "Measurement";
};

const stageToBadge = (stage) => {
  if (stage === "Measurement") return "Pending";
  if (stage === "Stitching" || stage === "Cutting") return "Progress";
  return "Ready";
};

const toDateSafe = (raw) => {
  if (!raw) return null;
  if (typeof raw?.toDate === "function") return raw.toDate();
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatDateForCard = (deliveryDate, createdAt) => {
  if (deliveryDate) return deliveryDate;
  if (!createdAt) return "--";
  return createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

const urgencyLevelFromBucket = (bucket) => {
  if (bucket === "Overdue" || bucket === "Today") return "High";
  if (bucket === "Tomorrow" || bucket === "This Week") return "Medium";
  return "Low";
};

const riskScore = (order) => {
  const urgencyScore = {
    Overdue: 100,
    Today: 80,
    Tomorrow: 55,
    "This Week": 35,
    Later: 15,
    "No Date": 5,
  }[order.dateBucket] || 0;

  const stagePenalty = {
    Measurement: 20,
    Cutting: 15,
    Stitching: 10,
    Trial: 5,
    Delivery: 0,
  }[order.stage] || 0;

  const complexity = COMPLEXITY_WEIGHT[order.item] || 1;
  const paymentPenalty = order.paymentStatus === "Unpaid" ? 8 : 0;

  return urgencyScore + stagePenalty + complexity + paymentPenalty;
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const { t } = useLanguage(); // ← ADDED: Get translations from context

  const [customers, setCustomers] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [activeTab, setActiveTab] = useState("today");
  const [searchText, setSearchText] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const [filters, setFilters] = useState({
    status: "All Status",
    payment: "All Payment",
  });

  const [activeFilterKey, setActiveFilterKey] = useState(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [localOverrides, setLocalOverrides] = useState({});

  const [showFinancials, setShowFinancials] = useState(true);

  // Measurement Modal States
  const [measurementModalVisible, setMeasurementModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerMeasurements, setCustomerMeasurements] = useState([]);
  const [selectedGarment, setSelectedGarment] = useState(null);
  const [loadingMeasurements, setLoadingMeasurements] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0));

  // ── Scroll-hide nav ──────────────────────────────────────────────────────────
  const lastScrollY = useRef(0);
  const navTranslateY = useRef(new Animated.Value(0)).current;
  // ─────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    let unsubscribeCustomers = () => {};
    let unsubscribeMeasurements = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeCustomers();
      unsubscribeMeasurements();

      if (!user) {
        setCustomers([]);
        setMeasurements([]);
        setLoadingOrders(false);
        return;
      }

      setLoadingOrders(true);

      const qCustomers = query(collection(db, "customers"), where("ownerId", "==", user.uid));
      unsubscribeCustomers = onSnapshot(
        qCustomers,
        (snap) => {
          setCustomers(
            snap.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
          );
          setLoadingOrders(false);
        },
        () => {
          setCustomers([]);
          setLoadingOrders(false);
        }
      );

      unsubscribeMeasurements = onSnapshot(
        collection(db, "measurements"),
        (snap) => {
          setMeasurements(
            snap.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
          );
        },
        () => {
          setMeasurements([]);
        }
      );
    });

    return () => {
      unsubscribeCustomers();
      unsubscribeMeasurements();
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    if (measurementModalVisible && selectedCustomer) {
      loadCustomerMeasurements();
      animateModalIn();
    } else {
      animateModalOut();
    }
  }, [measurementModalVisible, selectedCustomer]);

  const animateModalIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const animateModalOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const loadCustomerMeasurements = async () => {
    if (!selectedCustomer?.id) return;

    setLoadingMeasurements(true);
    try {
      const q = query(
        collection(db, "measurements"),
        where("customerId", "==", selectedCustomer.id)
      );
      const snapshot = await getDocs(q);
      
      const measurementData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setCustomerMeasurements(measurementData);
      
      if (measurementData.length > 0) {
        setSelectedGarment(measurementData[0]);
      }
    } catch (error) {
      console.error("Error loading measurements:", error);
    } finally {
      setLoadingMeasurements(false);
    }
  };

  const orders = useMemo(() => {
    const customerIds = new Set(customers.map((c) => c.id));

    const latestMeasurementByCustomer = {};
    for (const m of measurements) {
      if (!customerIds.has(m.customerId)) continue;
      const created = toDateSafe(m.createdAt);
      const createdMs = created ? created.getTime() : 0;
      const prev = latestMeasurementByCustomer[m.customerId];
      if (!prev || createdMs > prev.createdMs) {
        latestMeasurementByCustomer[m.customerId] = {
          garment: m.garment || "-",
          createdMs,
        };
      }
    }

    return customers.map((c) => {
      const createdAt = toDateSafe(c.createdAt);
      const createdAtMs = createdAt ? createdAt.getTime() : 0;

      const override = localOverrides[c.id] || {};

      const stage = override.stage || normalizeStage(c.stage || c.status);
      const paymentStatus = override.paymentStatus || c.paymentStatus || "Unpaid";
      const item =
        latestMeasurementByCustomer[c.id]?.garment ||
        c.itemType ||
        c.garment ||
        "-";
      const date = formatDateForCard(c.deliveryDate, createdAt);
      const dateBucket = getDateBucket(c.deliveryDate);
      const urgency = urgencyLevelFromBucket(dateBucket);

      return {
        id: c.id,
        name: c.name || "Unknown",
        phone: c.phone || "",
        city: c.city || "",
        orderId: c.orderId || "-",
        item,
        stage,
        paymentStatus,
        badgeStatus: stageToBadge(stage),
        date,
        dateBucket,
        urgency,
        rawDeliveryDate: c.deliveryDate || "",
        createdAtMs,
      };
    });
  }, [customers, measurements, localOverrides]);

  const statusOptions = useMemo(
    () => ["All Status", ...Array.from(new Set(orders.map((o) => o.stage)))],
    [orders]
  );
  const paymentOptions = ["All Payment", "Paid", "Unpaid"];

  const filteredOrders = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    let filtered = orders.filter((o) => {
      const searchBlob = [o.name, o.phone, o.orderId, o.item, o.stage].join(" ").toLowerCase();
      const searchMatch = !q || searchBlob.includes(q);

      const statusMatch = filters.status === "All Status" || o.stage === filters.status;
      const paymentMatch = filters.payment === "All Payment" || o.paymentStatus === filters.payment;

      return searchMatch && statusMatch && paymentMatch;
    });

    if (activeTab === "today") {
      filtered = filtered.filter(o => ["Overdue", "Today"].includes(o.dateBucket));
    } else if (activeTab === "upcoming") {
      filtered = filtered.filter(o => ["Tomorrow", "This Week"].includes(o.dateBucket));
    }

    return [...filtered].sort((a, b) => {
      const order = ["Overdue", "Today", "Tomorrow", "This Week", "Later", "No Date"];
      const d = order.indexOf(a.dateBucket) - order.indexOf(b.dateBucket);
      if (d !== 0) return d;
      return b.createdAtMs - a.createdAtMs;
    });
  }, [orders, searchText, filters, activeTab]);

  const analytics = useMemo(() => {
    const overdue = orders.filter((o) => o.dateBucket === "Overdue").length;
    const today = orders.filter((o) => o.dateBucket === "Today").length;
    const thisWeek = orders.filter((o) => o.dateBucket === "This Week").length;
    const inProgress = orders.filter((o) => ["Cutting", "Stitching"].includes(o.stage)).length;
    const trial = orders.filter((o) => o.stage === "Trial").length;
    const ready = orders.filter((o) => o.stage === "Delivery").length;
    const unpaid = orders.filter((o) => o.paymentStatus === "Unpaid").length;
    
    const cashReceived = 98500;
    const outstanding = 93020;
    const profit = 125000;
    
    return { 
      overdue, 
      today, 
      thisWeek,
      inProgress, 
      trial,
      ready, 
      unpaid, 
      total: orders.length,
      cashReceived,
      outstanding,
      profit,
    };
  }, [orders]);

  const hasActiveFilters = filters.status !== "All Status" || filters.payment !== "All Payment";

  const openFilter = (key) => {
    setActiveFilterKey(key);
    setFilterModalVisible(true);
  };

  const currentFilterOptions = useMemo(() => {
    if (activeFilterKey === "status") return statusOptions;
    if (activeFilterKey === "payment") return paymentOptions;
    return [];
  }, [activeFilterKey, statusOptions]);

  const setFilterValue = (value) => {
    if (!activeFilterKey) return;
    setFilters((prev) => ({ ...prev, [activeFilterKey]: value }));
    setFilterModalVisible(false);
    setActiveFilterKey(null);
  };

  const clearAllFilters = () => {
    setFilters({
      status: "All Status",
      payment: "All Payment",
    });
    setSearchText("");
  };

  const rotateStage = (orderId) => {
    setLocalOverrides((prev) => {
      const current = prev[orderId]?.stage || orders.find((o) => o.id === orderId)?.stage || PIPELINE[0];
      const idx = PIPELINE.indexOf(current);
      const next = PIPELINE[(idx + 1) % PIPELINE.length];
      return { ...prev, [orderId]: { ...(prev[orderId] || {}), stage: next } };
    });
  };

  const markPaid = (orderId) => {
    setLocalOverrides((prev) => ({
      ...prev,
      [orderId]: { ...(prev[orderId] || {}), paymentStatus: "Paid" },
    }));
  };

  const callCustomer = async (phone) => {
    if (!phone) {
      Alert.alert("No Phone", "Customer phone number is missing.");
      return;
    }
    const url = `tel:${phone}`;
    const ok = await Linking.canOpenURL(url);
    if (!ok) return Alert.alert("Error", "Unable to open dialer.");
    await Linking.openURL(url);
  };

  const whatsappCustomer = async (phone) => {
    if (!phone) {
      Alert.alert("No Phone", "Customer phone number is missing.");
      return;
    }
    const cleaned = phone.replace(/[^\d]/g, "");
    const url = `https://wa.me/91${cleaned}`;
    const ok = await Linking.canOpenURL(url);
    if (!ok) return Alert.alert("Error", "WhatsApp is not available.");
    await Linking.openURL(url);
  };

  const handleCustomerClick = (order) => {
    setSelectedCustomer({
      id: order.id,
      name: order.name,
      phone: order.phone,
      city: order.city,
      orderId: order.orderId,
    });
    setMeasurementModalVisible(true);
  };

  const closeMeasurementModal = () => {
    setMeasurementModalVisible(false);
    setTimeout(() => {
      setSelectedCustomer(null);
      setCustomerMeasurements([]);
      setSelectedGarment(null);
    }, 300);
  };

  // ── Scroll handler for hide/show nav ─────────────────────────────────────────
  const handleScroll = (event) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;

    if (diff > 8) {
      // Scrolling DOWN — hide nav + FAB
      Animated.spring(navTranslateY, {
        toValue: 120,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
    } else if (diff < -8) {
      // Scrolling UP — show nav + FAB
      Animated.spring(navTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
    }

    lastScrollY.current = currentY;
  };
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{t.greeting}</Text>
            <Text style={styles.subGreeting}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </Text>
          </View>
          <View style={styles.headerActions}>
            {/* LANGUAGE TOGGLE - NOW USING GLOBAL COMPONENT */}
            <LanguageToggle />

            {/* Notification Bell */}
            <TouchableOpacity style={styles.headerBtn}>
              <Ionicons name="notifications-outline" size={22} color="#CBD5E1" />
              {(analytics.overdue + analytics.today) > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {analytics.overdue + analytics.today}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* CRITICAL URGENCY BAR */}
        {(analytics.overdue > 0 || analytics.today > 0) && (
          <TouchableOpacity 
            style={styles.urgencyBanner}
            onPress={() => setActiveTab("today")}
            activeOpacity={0.8}
          >
            <View style={styles.urgencyIcon}>
              <Ionicons name="flame" size={20} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.urgencyTitle}>{t.actionRequired}</Text>
              <Text style={styles.urgencyDesc}>
                {analytics.overdue > 0 && `${analytics.overdue} ${t.overdue}`}
                {analytics.overdue > 0 && analytics.today > 0 && " • "}
                {analytics.today > 0 && `${analytics.today} ${t.dueToday}`}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FCA5A5" />
          </TouchableOpacity>
        )}

        {/* BUSINESS SNAPSHOT */}
        <TouchableOpacity 
          style={styles.snapshotCard}
          onPress={() => setShowFinancials(!showFinancials)}
          activeOpacity={0.9}
        >
          <View style={styles.snapshotHeader}>
            <Text style={styles.snapshotTitle}>{t.todaySnapshot}</Text>
            <Ionicons 
              name={showFinancials ? "chevron-up" : "chevron-down"} 
              size={18} 
              color="#64748B" 
            />
          </View>
          
          <View style={styles.snapshotGrid}>
            <SnapshotMetric 
              icon="layers-outline" 
              label={t.inProgress}
              value={analytics.inProgress}
              color="#3B82F6"
            />
            <SnapshotMetric 
              icon="checkmark-done-outline" 
              label={t.ready}
              value={analytics.ready}
              color="#10B981"
            />
            <SnapshotMetric 
              icon="timer-outline" 
              label={t.trial}
              value={analytics.trial}
              color="#F59E0B"
            />
            <SnapshotMetric 
              icon="wallet-outline" 
              label={t.unpaid}
              value={analytics.unpaid}
              color="#EF4444"
            />
          </View>

          {showFinancials && (
            <View style={styles.financialRow}>
              <FinancialBadge 
                label={t.cashIn}
                value={`₹${(analytics.cashReceived / 1000).toFixed(1)}K`}
                type="positive"
              />
              <FinancialBadge 
                label={t.outstanding}
                value={`₹${(analytics.outstanding / 1000).toFixed(1)}K`}
                type="negative"
              />
              <FinancialBadge 
                label={t.profit}
                value={`₹${(analytics.profit / 1000).toFixed(1)}K`}
                type="positive"
              />
            </View>
          )}
        </TouchableOpacity>

        {/* SEARCH BAR - NOW CAPSULE SHAPED */}
        <View style={[
          styles.searchContainer, 
          searchFocused && styles.searchContainerFocused
        ]}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={searchFocused ? "#3B82F6" : "#64748B"} />
            <TextInput
              placeholder={t.searchPlaceholder}
              placeholderTextColor="#64748B"
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            {(searchText || hasActiveFilters) && (
              <TouchableOpacity onPress={clearAllFilters}>
                <Ionicons name="close-circle" size={20} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>

          {/* QUICK FILTERS - NOW CAPSULE SHAPED */}
          <View style={styles.quickFilters}>
            <QuickFilterChip 
              label={filters.status === "All Status" ? t.status : filters.status}
              active={filters.status !== "All Status"}
              onPress={() => openFilter("status")} 
            />
            <QuickFilterChip 
              label={filters.payment === "All Payment" ? t.payment : filters.payment}
              active={filters.payment !== "All Payment"}
              onPress={() => openFilter("payment")} 
            />
          </View>
        </View>

        {/* TABS - NOW CAPSULE SHAPED */}
        <View style={styles.tabsContainer}>
          <TabButton 
            label={t.today}
            count={analytics.overdue + analytics.today}
            active={activeTab === "today"}
            urgent={analytics.overdue > 0}
            onPress={() => setActiveTab("today")}
          />
          <TabButton 
            label={t.upcoming}
            count={analytics.thisWeek}
            active={activeTab === "upcoming"}
            onPress={() => setActiveTab("upcoming")}
          />
          <TabButton 
            label={t.allOrders}
            count={analytics.total}
            active={activeTab === "all"}
            onPress={() => setActiveTab("all")}
          />
        </View>

        {/* ORDERS LIST */}
        <View style={styles.ordersSection}>
          {loadingOrders ? (
            <View style={styles.emptyState}>
              <View style={styles.loader}>
                <Ionicons name="hourglass-outline" size={32} color="#475569" />
              </View>
              <Text style={styles.emptyText}>{t.loading}</Text>
            </View>
          ) : filteredOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-done-circle-outline" size={48} color="#334155" />
              <Text style={styles.emptyText}>
                {activeTab === "today" ? t.allClear : 
                 activeTab === "upcoming" ? t.noUpcoming : 
                 t.noOrders}
              </Text>
              <Text style={styles.emptySubtext}>
                {hasActiveFilters ? t.tryClearing : t.addCustomer}
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.ordersHeader}>
                <Text style={styles.ordersCount}>
                  {filteredOrders.length} {filteredOrders.length === 1 ? t.order : t.orders}
                </Text>
                {activeTab === "today" && filteredOrders.length > 0 && (
                  <View style={styles.focusBadge}>
                    <Text style={styles.focusBadgeText}>{t.focusMode}</Text>
                  </View>
                )}
              </View>

              {filteredOrders.map((order, index) => (
                <ModernOrderCard
                  key={order.id}
                  order={order}
                  isExpanded={selectedOrderId === order.id}
                  onToggle={() => setSelectedOrderId(selectedOrderId === order.id ? null : order.id)}
                  onCall={() => callCustomer(order.phone)}
                  onWhatsApp={() => whatsappCustomer(order.phone)}
                  onNextStage={() => rotateStage(order.id)}
                  onMarkPaid={() => markPaid(order.id)}
                  showUrgencyIndicator={activeTab === "today"}
                  onViewDetails={handleCustomerClick}
                  translations={t}
                />
              ))}
            </>
          )}
        </View>
      </Animated.ScrollView>

      {/* FILTER MODAL */}
      <Modal
        transparent
        visible={filterModalVisible}
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setFilterModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeFilterKey === "status" && t.filterByStatus}
                {activeFilterKey === "payment" && t.filterByPayment}
              </Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {currentFilterOptions.map((opt) => (
                <TouchableOpacity 
                  key={opt} 
                  style={styles.modalItem} 
                  onPress={() => setFilterValue(opt)}
                >
                  <Text style={styles.modalItemText}>{opt}</Text>
                  {filters[activeFilterKey] === opt && (
                    <Ionicons name="checkmark-circle" size={22} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* MEASUREMENT DETAILS MODAL */}
      <Modal
        transparent
        visible={measurementModalVisible}
        animationType="fade"
        onRequestClose={closeMeasurementModal}
        statusBarTranslucent
      >
        <StatusBar backgroundColor="rgba(0,0,0,0.8)" barStyle="light-content" />
        
        <View style={styles.measurementModalOverlay}>
          <TouchableOpacity 
            style={styles.measurementBackdrop} 
            activeOpacity={1} 
            onPress={closeMeasurementModal}
          />

          <Animated.View
            style={[
              styles.measurementModalContainer,
              {
                transform: [
                  { scale: scaleAnim },
                  {
                    translateY: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [height, 0],
                    }),
                  },
                ],
                opacity: scaleAnim,
              },
            ]}
          >
            {/* UPDATED Header with back arrow (WhatsApp style) */}
            <View style={styles.measurementHeader}>
              <View style={styles.measurementHeaderRow}>
                {/* Back arrow on left */}
                <TouchableOpacity 
                  style={styles.backBtn} 
                  onPress={closeMeasurementModal}
                >
                  <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
                </TouchableOpacity>

                <View style={styles.customerInfo}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>
                      {selectedCustomer?.name?.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.customerDetails}>
                    <Text style={styles.customerName}>{selectedCustomer?.name}</Text>
                    <Text style={styles.customerMeta}>{selectedCustomer?.phone}</Text>
                  </View>
                </View>

                {/* Call and WhatsApp on right */}
                {/* Language Toggle + Call and WhatsApp on right */}
                <View style={styles.headerActionsRow}>
                  <LanguageToggle />

                  <TouchableOpacity
                    style={styles.headerActionBtn}
                    onPress={() => callCustomer(selectedCustomer?.phone)}
                  >
                    <Ionicons name="call" size={20} color="#3B82F6" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.headerActionBtn}
                    onPress={() => whatsappCustomer(selectedCustomer?.phone)}
                  >
                    <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Garment Tabs - Compact */}
            {customerMeasurements.length > 0 ? (
              <>
                <View style={styles.garmentTabsContainer}>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.garmentTabs}
                  >
                    {customerMeasurements.map((measurement) => (
                      <GarmentTab
                        key={measurement.id}
                        garment={measurement.garment}
                        fitType={measurement.fitType}
                        active={selectedGarment?.id === measurement.id}
                        onPress={() => setSelectedGarment(measurement)}
                      />
                    ))}
                  </ScrollView>
                </View>

                {/* Measurements Display - Maximum Space */}
                {selectedGarment && (
                  <ScrollView 
                    style={styles.measurementsScroll}
                    showsVerticalScrollIndicator={false}
                  >
                    <View style={styles.measurementsContainer}>
                      <View style={styles.fitTypeCard}>
                        <Ionicons 
                          name="resize-outline" 
                          size={18} 
                          color={GARMENT_COLORS[selectedGarment.garment]} 
                        />
                        <Text style={styles.fitTypeLabel}>{t.fit}:</Text>
                        <Text style={[
                          styles.fitTypeValue,
                          { color: GARMENT_COLORS[selectedGarment.garment] }
                        ]}>
                          {selectedGarment.fitType || "Regular"}
                        </Text>
                      </View>

                      {selectedGarment.notes && (
                        <View style={styles.notesCard}>
                          <Ionicons name="document-text-outline" size={16} color="#64748B" />
                          <Text style={styles.notesText}>{selectedGarment.notes}</Text>
                        </View>
                      )}

                      {Object.entries(selectedGarment.values || {}).map(([key, value], index) => (
                        <MeasurementRow 
                          key={`${key}-${index}`}
                          label={key}
                          value={value}
                          color={GARMENT_COLORS[selectedGarment.garment]}
                        />
                      ))}
                    </View>
                  </ScrollView>
                )}
              </>
            ) : (
              <View style={styles.emptyMeasurementState}>
                <Ionicons name="clipboard-outline" size={64} color="#334155" />
                <Text style={styles.emptyMeasurementTitle}>{t.noMeasurements}</Text>
                <Text style={styles.emptyMeasurementSubtitle}>
                  {t.startMeasurements}
                </Text>
              </View>
            )}

            {/* Action Buttons - Compact */}
            {customerMeasurements.length > 0 && (
              <View style={styles.measurementActionBar}>
                <TouchableOpacity style={styles.measurementActionBtnSecondary}>
                  <Ionicons name="share-outline" size={18} color="#3B82F6" />
                  <Text style={styles.measurementActionBtnText}>{t.share}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.measurementActionBtnSecondary}>
                  <Ionicons name="print-outline" size={18} color="#8B5CF6" />
                  <Text style={styles.measurementActionBtnText}>{t.print}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.measurementActionBtnPrimary}
                  onPress={() => {
                    closeMeasurementModal();
                    navigation.navigate("AddMeasurement", { customerId: selectedCustomer.id });
                  }}
                >
                  <Ionicons name="add-circle-outline" size={18} color="#FFF" />
                  <Text style={styles.measurementActionBtnPrimaryText}>{t.add}</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>

      {/* FLOATING ACTION BUTTON — fixed, does not move */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate("AddCustomer")}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* BOTTOM NAV — animates hide/show on scroll */}
      <Animated.View style={[styles.bottomNav, { transform: [{ translateY: navTranslateY }] }]}>
        <NavButton icon="home" label={t.home} active />
        <NavButton icon="people-outline" label={t.customers} onPress={() => navigation.navigate('Customers')} />
        <NavButton icon="shirt" label={t.tryOn} special disabled />
        <NavButton icon="receipt-outline" label={t.bills} />
        <NavButton icon="person-outline" label={t.profile} onPress={() => navigation.navigate('Profile')} />
      </Animated.View>
    </SafeAreaView>
  );
}

/* ==================== SUB COMPONENTS ==================== */

const SnapshotMetric = ({ icon, label, value, color }) => (
  <View style={styles.snapshotMetric}>
    <View style={[styles.snapshotIcon, { backgroundColor: color + "15" }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <Text style={styles.snapshotValue}>{value}</Text>
    <Text style={styles.snapshotLabel}>{label}</Text>
  </View>
);

const FinancialBadge = ({ label, value, type }) => (
  <View style={styles.financialBadge}>
    <Text style={styles.financialLabel}>{label}</Text>
    <Text style={[
      styles.financialValue,
      type === "positive" && styles.financialPositive,
      type === "negative" && styles.financialNegative
    ]}>
      {value}
    </Text>
  </View>
);

const QuickFilterChip = ({ label, active, onPress }) => (
  <TouchableOpacity 
    style={[styles.quickFilterChip, active && styles.quickFilterChipActive]} 
    onPress={onPress}
  >
    <Text style={[styles.quickFilterText, active && styles.quickFilterTextActive]}>
      {label}
    </Text>
    <Ionicons 
      name="chevron-down" 
      size={14} 
      color={active ? "#3B82F6" : "#64748B"} 
    />
  </TouchableOpacity>
);

import { Easing } from "react-native";

const TabButton = ({ label, count, active, urgent, onPress }) => {
  const [anim] = useState(new Animated.Value(active ? 1 : 0));

  useEffect(() => {
    Animated.timing(anim, {
      toValue: active ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [active]);

  const backgroundColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", "#3B82F6"],
  });

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  return (
    <Animated.View
      style={[
        styles.tab,
        {
          backgroundColor,
          transform: [{ scale }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={styles.tabTouchable}
      >
        <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
          {label}
        </Text>

        {count > 0 && (
          <View
            style={[
              styles.tabBadge,
              active && styles.tabBadgeActive,
              urgent && styles.tabBadgeUrgent,
            ]}
          >
            <Text
              style={[
                styles.tabBadgeText,
                active && styles.tabBadgeTextActive,
                urgent && styles.tabBadgeTextUrgent,
              ]}
            >
              {count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const ModernOrderCard = ({ 
  order, 
  isExpanded, 
  onToggle, 
  onCall, 
  onWhatsApp, 
  onNextStage, 
  onMarkPaid,
  showUrgencyIndicator,
  onViewDetails,
  translations
}) => {
  const stageIndex = PIPELINE.indexOf(order.stage);
  const progressPercentage = ((stageIndex + 1) / PIPELINE.length) * 100;

  const urgencyColors = {
    High: { bg: "#FEE2E2", text: "#DC2626", border: "#FCA5A5" },
    Medium: { bg: "#FEF3C7", text: "#D97706", border: "#FCD34D" },
    Low: { bg: "#D1FAE5", text: "#059669", border: "#6EE7B7" },
  };

  const urgencyStyle = urgencyColors[order.urgency] || urgencyColors.Low;
  
  const getUrgencyText = (urgency) => {
    if (urgency === "High") return translations.high;
    if (urgency === "Medium") return translations.medium;
    return translations.low;
  };

  return (
    <TouchableOpacity 
      style={[
        styles.modernCard,
        order.dateBucket === "Overdue" && styles.modernCardOverdue
      ]}
      onLongPress={onToggle}
      onPress={() => onViewDetails(order)}
      activeOpacity={0.7}
    >
      {showUrgencyIndicator && order.urgency === "High" && (
        <View style={styles.urgencyStripe} />
      )}

      <View style={styles.cardMain}>
        <View style={styles.cardHeader}>
          <View style={styles.cardLeft}>
            <Text style={styles.cardName}>{order.name}</Text>
            <View style={styles.cardMetaRow}>
              <Text style={styles.cardMeta}>#{order.orderId}</Text>
              <View style={styles.cardDot} />
              <Text style={styles.cardMeta}>{order.item}</Text>
            </View>
          </View>
          <View style={styles.cardRight}>
            <Text style={styles.cardDate}>{order.date}</Text>
            <View style={[styles.cardUrgency, { 
              backgroundColor: urgencyStyle.bg,
              borderColor: urgencyStyle.border 
            }]}>
              <Text style={[styles.cardUrgencyText, { color: urgencyStyle.text }]}>
                {getUrgencyText(order.urgency)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardProgress}>
          <View style={styles.cardProgressBg}>
            <View style={[styles.cardProgressFill, { width: `${progressPercentage}%` }]} />
          </View>
          <View style={styles.cardStageRow}>
            <Text style={styles.cardStageText}>{order.stage}</Text>
            <Text style={styles.cardStagePercent}>{Math.round(progressPercentage)}%</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.cardBadges}>
            <StatusChip status={order.badgeStatus} translations={translations} />
            <PaymentChip status={order.paymentStatus} translations={translations} />
          </View>
          <TouchableOpacity onPress={() => onViewDetails(order)}>
            <Ionicons 
              name="eye-outline"
              size={24} 
              color="#3B82F6" 
            />
          </TouchableOpacity>
        </View>
      </View>

      {isExpanded && (
        <View style={styles.cardActions}>
          <QuickAction 
            icon="call" 
            label={translations.call}
            color="#3B82F6" 
            onPress={onCall} 
          />
          <QuickAction 
            icon="logo-whatsapp" 
            label={translations.whatsapp}
            color="#25D366" 
            onPress={onWhatsApp} 
          />
          <QuickAction 
            icon="play-forward" 
            label={translations.nextStage}
            color="#8B5CF6" 
            onPress={onNextStage} 
          />
          <QuickAction 
            icon="cash" 
            label={translations.markPaid}
            color="#10B981" 
            onPress={onMarkPaid} 
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

const StatusChip = ({ status, translations }) => {
  const colors = {
    Pending: { bg: "#FEF2F2", text: "#DC2626" },
    Progress: { bg: "#FEF3C7", text: "#D97706" },
    Ready: { bg: "#D1FAE5", text: "#059669" },
  };
  const style = colors[status] || colors.Pending;
  
  const getStatusText = (status) => {
    if (status === "Pending") return translations.pending;
    if (status === "Progress") return translations.progress;
    return translations.ready;
  };

  return (
    <View style={[styles.statusChip, { backgroundColor: style.bg }]}>
      <Text style={[styles.statusChipText, { color: style.text }]}>
        {getStatusText(status)}
      </Text>
    </View>
  );
};

const PaymentChip = ({ status, translations }) => (
  <View style={[
    styles.paymentChip,
    status === "Paid" ? styles.paymentChipPaid : styles.paymentChipUnpaid
  ]}>
    <Ionicons 
      name={status === "Paid" ? "checkmark-circle" : "time"} 
      size={12} 
      color={status === "Paid" ? "#059669" : "#D97706"} 
    />
    <Text style={[
      styles.paymentChipText,
      status === "Paid" ? styles.paymentChipTextPaid : styles.paymentChipTextUnpaid
    ]}>
      {status === "Paid" ? translations.paid : translations.unpaid}
    </Text>
  </View>
);

const QuickAction = ({ icon, label, color, onPress }) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress}>
    <View style={[styles.quickActionIcon, { backgroundColor: color + "15" }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text style={styles.quickActionLabel}>{label}</Text>
  </TouchableOpacity>
);

const NavButton = ({ icon, label, active, disabled, special, onPress }) => {
  const [scaleValue] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    if (!disabled) {
      Animated.spring(scaleValue, {
        toValue: 0.9,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity 
      style={[
        styles.navButton,
        active && styles.navButtonActive,
        special && styles.navButtonSpecial
      ]}
      disabled={disabled}
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View style={{ transform: [{ scale: scaleValue }], alignItems: 'center' }}>
        <Ionicons 
          name={icon} 
          size={22} 
          color={active ? "#FFFFFF" : "#94A3B8"}
        />
        <Text style={[
          styles.navButtonLabel, 
          active && styles.navButtonLabelActive
        ]}>
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const GarmentTab = ({ garment, fitType, active, onPress }) => {
  const color = GARMENT_COLORS[garment] || "#3B82F6";
  const icon = GARMENT_ICONS[garment] || "shirt-outline";

  return (
    <TouchableOpacity
      style={[
        styles.garmentTab,
        active && [styles.garmentTabActive, { borderColor: color }],
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.garmentIcon, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.garmentTabName, active && styles.garmentTabNameActive]}>
        {garment}
      </Text>
      {fitType && (
        <Text style={styles.garmentTabFit}>{fitType}</Text>
      )}
    </TouchableOpacity>
  );
};

const MeasurementRow = ({ label, value, color }) => {
  const { t } = useLanguage();
  
  return (
    <View style={styles.measurementRow}>
      <View style={styles.measurementLeft}>
        <View style={[styles.measurementDot, { backgroundColor: color }]} />
        <Text style={styles.measurementLabel}>{t[label] || label}</Text>
      </View>
      <View style={styles.measurementRight}>
        <Text style={styles.measurementValue}>{value}</Text>
        <Text style={styles.measurementUnit}>{t.in}</Text>
      </View>
    </View>
  );
};

/* ==================== STYLES (KEPT EXACTLY AS YOURS) ==================== */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0A0E1A" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  greeting: { 
    fontSize: 28, 
    fontWeight: "800", 
    color: "#F8FAFC",
    letterSpacing: -0.5,
  },
  subGreeting: { 
    fontSize: 14, 
    color: "#64748B", 
    marginTop: 4,
    fontWeight: "500",
  },
  headerActions: { flexDirection: "row", gap: 12 },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0A0E1A",
  },
  notificationBadgeText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700",
  },

  urgencyBanner: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#991B1B",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  urgencyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
  },
  urgencyTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  urgencyDesc: {
    color: "#FCA5A5",
    fontSize: 13,
    fontWeight: "500",
  },

  snapshotCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#1E293B",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  snapshotHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  snapshotTitle: {
    color: "#F1F5F9",
    fontSize: 16,
    fontWeight: "700",
  },
  snapshotGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  snapshotMetric: {
    flex: 1,
    alignItems: "center",
  },
  snapshotIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  snapshotValue: {
    color: "#F8FAFC",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 2,
  },
  snapshotLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "500",
  },
  financialRow: {
    flexDirection: "row",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#334155",
    gap: 8,
  },
  financialBadge: {
    flex: 1,
    backgroundColor: "#0F172A",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  financialLabel: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "600",
    marginBottom: 4,
  },
  financialValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  financialPositive: { color: "#10B981" },
  financialNegative: { color: "#EF4444" },

  searchContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  searchContainerFocused: {
    transform: [{ scale: 1.01 }],
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  searchInput: {
    flex: 1,
    color: "#F1F5F9",
    fontSize: 15,
    fontWeight: "500",
  },
  quickFilters: {
    flexDirection: "row",
    marginTop: 10,
    gap: 8,
  },
  quickFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
    gap: 6,
    borderWidth: 1,
    borderColor: "transparent",
  },
  quickFilterChipActive: {
    backgroundColor: "#1E3A8A",
    borderColor: "#3B82F6",
  },
  quickFilterText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
  },
  quickFilterTextActive: {
    color: "#93C5FD",
  },

  tabsContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#1E293B",
    borderRadius: 50,
    padding: 4,
    gap: 4,
    overflow: "hidden",
  },

  tab: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 50,
    gap: 6,
  },
  tabTouchable: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  tabActive: {
    backgroundColor: "#3B82F6",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  tabLabel: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
  },
  tabLabelActive: {
    color: "#FFF",
  },
  tabBadge: {
    backgroundColor: "#334155",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: "center",
  },
  tabBadgeActive: {
    backgroundColor: "#1E3A8A",
  },
  tabBadgeUrgent: {
    backgroundColor: "#DC2626",
  },
  tabBadgeText: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
  },
  tabBadgeTextActive: {
    color: "#DBEAFE",
  },
  tabBadgeTextUrgent: {
    color: "#FFF",
  },

  ordersSection: {
    paddingHorizontal: 20,
  },
  ordersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  ordersCount: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "600",
  },
  focusBadge: {
    backgroundColor: "#7C2D12",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  focusBadgeText: {
    color: "#FDBA74",
    fontSize: 12,
    fontWeight: "700",
  },

  modernCard: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    position: "relative",
  },
  modernCardOverdue: {
    borderLeftWidth: 4,
    borderLeftColor: "#DC2626",
  },
  urgencyStripe: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "#EF4444",
  },
  cardMain: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  cardLeft: {
    flex: 1,
  },
  cardName: {
    color: "#F8FAFC",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
  },
  cardMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardMeta: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "500",
  },
  cardDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#475569",
  },
  cardRight: {
    alignItems: "flex-end",
  },
  cardDate: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  cardUrgency: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  cardUrgencyText: {
    fontSize: 11,
    fontWeight: "700",
  },

  cardProgress: {
    marginBottom: 14,
  },
  cardProgressBg: {
    height: 6,
    backgroundColor: "#334155",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  cardProgressFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 3,
  },
  cardStageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardStageText: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "600",
  },
  cardStagePercent: {
    color: "#3B82F6",
    fontSize: 13,
    fontWeight: "700",
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardBadges: {
    flexDirection: "row",
    gap: 8,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: "700",
  },
  paymentChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  paymentChipPaid: {
    backgroundColor: "#D1FAE5",
  },
  paymentChipUnpaid: {
    backgroundColor: "#FEF3C7",
  },
  paymentChipText: {
    fontSize: 11,
    fontWeight: "700",
  },
  paymentChipTextPaid: {
    color: "#059669",
  },
  paymentChipTextUnpaid: {
    color: "#D97706",
  },

  cardActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#334155",
    padding: 12,
    gap: 8,
  },
  quickAction: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionLabel: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 80,
  },
  loader: {
    marginBottom: 16,
  },
  emptyText: {
    color: "#CBD5E1",
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    color: "#64748B",
    fontSize: 14,
    textAlign: "center",
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#1E293B",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "60%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#475569",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  modalTitle: {
    color: "#F1F5F9",
    fontSize: 18,
    fontWeight: "700",
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  modalItemText: {
    color: "#E2E8F0",
    fontSize: 16,
    fontWeight: "500",
  },

  measurementModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "flex-end",
  },
  measurementBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  measurementModalContainer: {
    height: height * 0.92,
    backgroundColor: "#0F172A",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 24,
  },

  measurementHeader: {
    backgroundColor: "#1E293B",
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  measurementHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "800",
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  customerMeta: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "500",
  },
  
  headerActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerActionBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    padding: 8,
  },
  backBtn: {
    padding: 8,
    marginRight: 8,
  },

  garmentTabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  garmentTabs: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  garmentTab: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 8,
    alignItems: "center",
    minWidth: 75,
    borderWidth: 2,
    borderColor: "transparent",
  },
  garmentTabActive: {
    backgroundColor: "#1E3A5F",
  },
  garmentIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  garmentTabName: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 2,
  },
  garmentTabNameActive: {
    color: "#E2E8F0",
  },
  garmentTabFit: {
    color: "#64748B",
    fontSize: 9,
    fontWeight: "500",
  },

  measurementsScroll: {
    flex: 1,
  },
  measurementsContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  fitTypeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  fitTypeLabel: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "600",
  },
  fitTypeValue: {
    fontSize: 15,
    fontWeight: "700",
    marginLeft: "auto",
  },

  notesCard: {
    flexDirection: "row",
    backgroundColor: "#1E293B",
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  notesText: {
    flex: 1,
    color: "#CBD5E1",
    fontSize: 12,
    lineHeight: 16,
  },

  measurementRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1E293B",
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  measurementLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  measurementDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  measurementLabel: {
    color: "#CBD5E1",
    fontSize: 14,
    fontWeight: "600",
  },
  measurementRight: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  measurementValue: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "700",
  },
  measurementUnit: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "500",
  },

  emptyMeasurementState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyMeasurementTitle: {
    color: "#CBD5E1",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMeasurementSubtitle: {
    color: "#64748B",
    fontSize: 13,
    textAlign: "center",
  },

  measurementActionBar: {
    flexDirection: "row",
    padding: 16,
    paddingBottom: 24,
    backgroundColor: "#1E293B",
    borderTopWidth: 1,
    borderTopColor: "#334155",
    gap: 8,
  },
  measurementActionBtnSecondary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F172A",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: "#334155",
  },
  measurementActionBtnText: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "700",
  },
  measurementActionBtnPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  measurementActionBtnPrimaryText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "700",
  },

  fab: {
    position: "absolute",
    bottom: 90,
    right: 30,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },

  bottomNav: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    backgroundColor: "rgba(30, 41, 59, 0.7)",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  navButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 20,
    flex: 1,
    maxWidth: 70,
  },
  navButtonActive: {
    backgroundColor: "#3B82F6",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  navButtonSpecial: {
    opacity: 0.5,
  },
  navButtonLabel: {
    color: "#94A3B8",
    fontSize: 10,
    fontWeight: "600",
    marginTop: 3,
  },
  navButtonLabelActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});