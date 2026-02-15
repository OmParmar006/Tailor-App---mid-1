// // import React, { useState, useRef } from "react";
// // import { db, auth } from "../firebaseConfig";
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   TouchableOpacity,
// //   ScrollView,
// //   TextInput,
// //   KeyboardAvoidingView,
// //   Platform,
// // } from "react-native";
// // import { SafeAreaView } from "react-native-safe-area-context";
// // import { Ionicons } from "@expo/vector-icons";
// // import DateTimePicker from "@react-native-community/datetimepicker";
// // import { addDoc, collection, serverTimestamp } from "firebase/firestore";

// // /* ---------- SIMPLE ORDER ID ---------- */
// // const generateOrderId = () => {
// //   const random = Math.floor(100 + Math.random() * 900);
// //   return `ORD-${random}`;
// // };

// // const todayDate = new Date().toLocaleDateString("en-GB");

// // export default function AddCustomerScreen({ navigation }) {
// //   const [orderId] = useState(generateOrderId());
// //   const [today] = useState(todayDate);

// //   const [name, setName] = useState("");
// //   const [phone, setPhone] = useState("");
// //   const [city, setCity] = useState("");
// //   const [deliveryDate, setDeliveryDate] = useState("");
// //   const [notes, setNotes] = useState("");

// //   const [errors, setErrors] = useState({});
// //   const [showDatePicker, setShowDatePicker] = useState(false);

// //   /* ---------- VALIDATION ---------- */
// //   const validateField = (field, value) => {
// //     let message = "";

// //     if (field === "name" && !value.trim())
// //       message = "Enter customer name";

// //     if (field === "phone" && value.length !== 10)
// //       message = "Enter 10 digit mobile";

// //     if (field === "city" && !value.trim())
// //       message = "Enter city";

// //     if (field === "deliveryDate" && !value)
// //       message = "Select delivery date";

// //     setErrors((prev) => ({ ...prev, [field]: message }));
// //     return message === "";
// //   };

// //   const handlePhoneChange = (text) => {
// //     const cleaned = text.replace(/[^0-9]/g, "").slice(0, 10);
// //     setPhone(cleaned);
// //     validateField("phone", cleaned);
// //   };

// //   /* ---------- SAVE ---------- */
// //   const handleContinue = async () => {
// //     const valid =
// //       validateField("name", name) &
// //       validateField("phone", phone) &
// //       validateField("city", city) &
// //       validateField("deliveryDate", deliveryDate);

// //     if (!valid) return;

// //     const docRef = await addDoc(collection(db, "customers"), {
// //       ownerId: auth.currentUser.uid,
// //       orderId,
// //       name,
// //       phone,
// //       city,
// //       deliveryDate,
// //       notes,
// //       status: "pending",
// //       createdAt: serverTimestamp(),
// //     });

// //     navigation.navigate("AddMeasurement", {
// //       customerId: docRef.id,
// //     });
// //   };

// //   return (
// //     <SafeAreaView style={styles.safe}>
// //       <KeyboardAvoidingView
// //         behavior={Platform.OS === "ios" ? "padding" : "height"}
// //         style={{ flex: 1 }}
// //       >
// //         {/* HEADER */}
// //         <View style={styles.header}>
// //           <TouchableOpacity onPress={() => navigation.goBack()}>
// //             <Ionicons name="arrow-back" size={24} color="#FFF" />
// //           </TouchableOpacity>
// //           <Text style={styles.headerTitle}>Add Customer</Text>
// //           <View style={{ width: 24 }} />
// //         </View>

// //         <ScrollView contentContainerStyle={styles.form}>
// //           {/* ORDER INFO */}
// //           <View style={styles.orderBox}>
// //             <Info label="Order ID" value={orderId} />
// //             <Info label="Today" value={today} />
// //           </View>

// //           <Field
// //             label="Customer Name"
// //             value={name}
// //             error={errors.name}
// //             onChangeText={(t) => {
// //               setName(t);
// //               validateField("name", t);
// //             }}
// //           />

// //           <Field
// //             label="Mobile Number"
// //             value={phone}
// //             error={errors.phone}
// //             keyboardType="number-pad"
// //             onChangeText={handlePhoneChange}
// //           />

// //           <Field
// //             label="City"
// //             value={city}
// //             error={errors.city}
// //             onChangeText={(t) => {
// //               setCity(t);
// //               validateField("city", t);
// //             }}
// //           />

// //           <TouchableOpacity onPress={() => setShowDatePicker(true)}>
// //             <Field
// //               label="Delivery Date"
// //               value={deliveryDate}
// //               error={errors.deliveryDate}
// //               editable={false}
// //             />
// //           </TouchableOpacity>

// //           <Field
// //             label="Notes (Optional)"
// //             value={notes}
// //             onChangeText={setNotes}
// //             multiline
// //           />

// //           <View style={{ height: 100 }} />
// //         </ScrollView>

// //         {/* BUTTON */}
// //         <View style={styles.footer}>
// //           <TouchableOpacity style={styles.saveBtn} onPress={handleContinue}>
// //             <Text style={styles.saveText}>CONTINUE TO MEASUREMENTS</Text>
// //           </TouchableOpacity>
// //         </View>
// //       </KeyboardAvoidingView>

// //       {showDatePicker && (
// //         <DateTimePicker
// //           value={new Date()}
// //           mode="date"
// //           minimumDate={new Date()}
// //           onChange={(e, date) => {
// //             setShowDatePicker(false);
// //             if (date) {
// //               const formatted = date.toLocaleDateString("en-GB");
// //               setDeliveryDate(formatted);
// //               validateField("deliveryDate", formatted);
// //             }
// //           }}
// //         />
// //       )}
// //     </SafeAreaView>
// //   );
// // }

// // /* ---------- INPUT COMPONENT ---------- */
// // const Field = ({ label, error, ...props }) => (
// //   <View style={{ marginBottom: 18 }}>
// //     <Text style={styles.label}>{label}</Text>
// //     <TextInput
// //       {...props}
// //       style={[styles.input, error ? styles.errorBorder : styles.normalBorder]}
// //       placeholderTextColor="#64748B"
// //     />
// //     {error && <Text style={styles.errorText}>{error}</Text>}
// //   </View>
// // );

// // /* ---------- INFO BOX ---------- */
// // const Info = ({ label, value }) => (
// //   <View>
// //     <Text style={styles.infoLabel}>{label}</Text>
// //     <Text style={styles.infoValue}>{value}</Text>
// //   </View>
// // );

// // /* ---------- STYLES ---------- */
// // const styles = StyleSheet.create({
// //   safe: { flex: 1, backgroundColor: "#0B1121" },

// //   header: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     padding: 20,
// //   },
// //   headerTitle: { color: "#FFF", fontSize: 20, fontWeight: "700" },

// //   form: { padding: 20 },

// //   orderBox: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     backgroundColor: "#151E32",
// //     padding: 16,
// //     borderRadius: 14,
// //     marginBottom: 25,
// //   },

// //   infoLabel: { color: "#94A3B8", fontSize: 11 },
// //   infoValue: { color: "#FFF", fontSize: 16, fontWeight: "700" },

// //   label: { color: "#94A3B8", fontSize: 12, marginBottom: 6 },

// //   input: {
// //     backgroundColor: "#151E32",
// //     borderRadius: 12,
// //     padding: 15,
// //     color: "#FFF",
// //     fontSize: 15,
// //     borderWidth: 1.2,
// //   },

// //   normalBorder: { borderColor: "#1E293B" },
// //   errorBorder: { borderColor: "#EF4444" },

// //   errorText: { color: "#EF4444", fontSize: 12, marginTop: 4 },

// //   footer: { padding: 20 },

// //   saveBtn: {
// //     backgroundColor: "#2563EB",
// //     padding: 18,
// //     borderRadius: 14,
// //     alignItems: "center",
// //   },
// //   saveText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
// // });

// import React, { useState, useEffect, useRef } from "react";
// import { db, auth } from "../firebaseConfig";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   TextInput,
//   KeyboardAvoidingView,
//   Platform,
//   Animated,
//   Alert,
//   Keyboard,
//   Vibration,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
// import { addDoc, collection, serverTimestamp, query, where, getDocs, limit } from "firebase/firestore";

// /* ---------- HELPERS ---------- */
// const generateOrderId = () => {
//   const prefix = "ORD";
//   const timestamp = Date.now().toString().slice(-6);
//   const random = Math.floor(Math.random() * 100).toString().padStart(2, "0");
//   return `${prefix}-${timestamp}${random}`;
// };

// const formatDate = (date) => {
//   return date.toLocaleDateString("en-GB", { 
//     day: "2-digit", 
//     month: "short", 
//     year: "numeric" 
//   });
// };

// // Quick date options
// const getQuickDates = () => {
//   const today = new Date();
//   return [
//     { label: "Tomorrow", days: 1 },
//     { label: "3 Days", days: 3 },
//     { label: "1 Week", days: 7 },
//     { label: "2 Weeks", days: 14 },
//   ].map(({ label, days }) => {
//     const date = new Date(today);
//     date.setDate(date.getDate() + days);
//     return { label, date, formatted: formatDate(date) };
//   });
// };

// // Generate calendar days
// const getCalendarDays = (month, year) => {
//   const firstDay = new Date(year, month, 1);
//   const lastDay = new Date(year, month + 1, 0);
//   const daysInMonth = lastDay.getDate();
//   const startingDayOfWeek = firstDay.getDay();
  
//   const days = [];
//   for (let i = 0; i < startingDayOfWeek; i++) {
//     days.push(null);
//   }
//   for (let i = 1; i <= daysInMonth; i++) {
//     days.push(new Date(year, month, i));
//   }
//   return days;
// };

// // Common cities
// const POPULAR_CITIES = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Ahmedabad", "Pune", "Surat", "Jaipur"];

// export default function AddCustomerScreen({ navigation }) {
//   const [orderId] = useState(generateOrderId());
//   const [today] = useState(formatDate(new Date()));

//   // Form State
//   const [name, setName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [city, setCity] = useState("");
//   const [address, setAddress] = useState("");
//   const [deliveryDate, setDeliveryDate] = useState(null);
//   const [deliveryDateString, setDeliveryDateString] = useState("");
//   const [notes, setNotes] = useState("");

//   // UI State
//   const [errors, setErrors] = useState({});
//   const [touched, setTouched] = useState({});
//   const [saving, setSaving] = useState(false);
//   const [currentStep, setCurrentStep] = useState(0);

//   // Smart Features
//   const [recentCustomers, setRecentCustomers] = useState([]);
//   const [showCitySuggestions, setShowCitySuggestions] = useState(false);
//   const [showCalendar, setShowCalendar] = useState(false);
//   const [customerFound, setCustomerFound] = useState(null);
//   const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
//   const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

//   // Refs
//   const nameRef = useRef(null);
//   const phoneRef = useRef(null);
//   const cityRef = useRef(null);
//   const addressRef = useRef(null);
//   const notesRef = useRef(null);

//   // Animations
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const slideAnim = useRef(new Animated.Value(30)).current;
//   const scaleAnim = useRef(new Animated.Value(0.95)).current;
//   const buttonScale = useRef(new Animated.Value(1)).current;
//   const calendarAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     // Entry animation
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 300,
//         useNativeDriver: true,
//       }),
//       Animated.spring(slideAnim, {
//         toValue: 0,
//         tension: 50,
//         friction: 7,
//         useNativeDriver: true,
//       }),
//       Animated.spring(scaleAnim, {
//         toValue: 1,
//         tension: 50,
//         friction: 7,
//         useNativeDriver: true,
//       }),
//     ]).start();

//     setTimeout(() => nameRef.current?.focus(), 400);
//     loadRecentCustomers();
//   }, []);

//   // Calendar animation
//   useEffect(() => {
//     Animated.spring(calendarAnim, {
//       toValue: showCalendar ? 1 : 0,
//       tension: 50,
//       friction: 7,
//       useNativeDriver: true,
//     }).start();
//   }, [showCalendar]);

//   const loadRecentCustomers = async () => {
//     try {
//       const q = query(
//         collection(db, "customers"),
//         where("ownerId", "==", auth.currentUser.uid),
//         limit(50)
//       );
//       const snapshot = await getDocs(q);
//       const customers = snapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data()
//       }));
//       setRecentCustomers(customers);
//     } catch (error) {
//       console.error("Error loading customers:", error);
//     }
//   };

//   useEffect(() => {
//     if (phone.length === 10) {
//       const existing = recentCustomers.find(c => c.phone === phone);
//       if (existing) {
//         setCustomerFound(existing);
//         Vibration.vibrate(50);
//       } else {
//         setCustomerFound(null);
//       }
//     } else {
//       setCustomerFound(null);
//     }
//   }, [phone, recentCustomers]);

//   /* ---------- SMART AUTO-ADVANCE ---------- */
//   const handleNameSubmit = () => {
//     if (name.trim().length >= 2) {
//       phoneRef.current?.focus();
//       setCurrentStep(1);
//     }
//   };

//   const handlePhoneSubmit = () => {
//     if (phone.length === 10) {
//       cityRef.current?.focus();
//       setCurrentStep(2);
//     }
//   };

//   const handleCitySubmit = () => {
//     if (city.trim()) {
//       setCurrentStep(3);
//       Keyboard.dismiss();
//     }
//   };

//   /* ---------- QUICK FILL ---------- */
//   const quickFillCustomer = (customer) => {
//     setName(customer.name || "");
//     setCity(customer.city || "");
//     setAddress(customer.address || "");
//     setCustomerFound(null);
//     Vibration.vibrate([50, 100, 50]);
//     Alert.alert("Customer Found! 🎉", `Auto-filled details for ${customer.name}`);
//   };

//   /* ---------- VALIDATION ---------- */
//   const validateField = (field, value) => {
//     let message = "";

//     switch (field) {
//       case "name":
//         if (!value.trim()) message = "Name required";
//         else if (value.trim().length < 2) message = "Too short";
//         break;
//       case "phone":
//         if (!value) message = "Phone required";
//         else if (value.length !== 10) message = "Must be 10 digits";
//         else if (!/^[6-9]\d{9}$/.test(value)) message = "Invalid number";
//         break;
//       case "city":
//         if (!value.trim()) message = "City required";
//         break;
//       case "deliveryDate":
//         if (!value) message = "Date required";
//         break;
//     }

//     setErrors((prev) => ({ ...prev, [field]: message }));
//     return message === "";
//   };

//   const handlePhoneChange = (text) => {
//     const cleaned = text.replace(/[^0-9]/g, "").slice(0, 10);
//     setPhone(cleaned);
//     if (cleaned.length >= 1) {
//       setTouched(prev => ({ ...prev, phone: true }));
//       validateField("phone", cleaned);
//     }
//   };

//   /* ---------- DATE SELECTION ---------- */
//   const selectQuickDate = (dateOption) => {
//     setDeliveryDate(dateOption.date);
//     setDeliveryDateString(dateOption.formatted);
//     setShowCalendar(false);
//     setTouched((prev) => ({ ...prev, deliveryDate: true }));
//     validateField("deliveryDate", dateOption.formatted);
//     Vibration.vibrate(30);
    
//     Animated.sequence([
//       Animated.timing(buttonScale, {
//         toValue: 0.95,
//         duration: 100,
//         useNativeDriver: true,
//       }),
//       Animated.timing(buttonScale, {
//         toValue: 1,
//         duration: 100,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   };

//   const selectCalendarDate = (date) => {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     if (date < today) return;
    
//     setDeliveryDate(date);
//     setDeliveryDateString(formatDate(date));
//     setShowCalendar(false);
//     setTouched((prev) => ({ ...prev, deliveryDate: true }));
//     validateField("deliveryDate", formatDate(date));
//     Vibration.vibrate(30);
//   };

//   const changeMonth = (delta) => {
//     let newMonth = calendarMonth + delta;
//     let newYear = calendarYear;
    
//     if (newMonth > 11) {
//       newMonth = 0;
//       newYear++;
//     } else if (newMonth < 0) {
//       newMonth = 11;
//       newYear--;
//     }
    
//     setCalendarMonth(newMonth);
//     setCalendarYear(newYear);
//   };

//   const selectCity = (cityName) => {
//     setCity(cityName);
//     setShowCitySuggestions(false);
//     setTouched(prev => ({ ...prev, city: true }));
//     validateField("city", cityName);
//     Vibration.vibrate(30);
//     handleCitySubmit();
//   };

//   const isFormValid = () => {
//     return (
//       name.trim().length >= 2 &&
//       /^[6-9]\d{9}$/.test(phone) &&
//       city.trim().length > 0 &&
//       deliveryDate !== null
//     );
//   };

//   const handleContinue = async () => {
//     if (!isFormValid()) {
//       Alert.alert("Incomplete Form", "Please fill all required fields");
//       return;
//     }

//     setSaving(true);
//     Vibration.vibrate(50);

//     try {
//       const docRef = await addDoc(collection(db, "customers"), {
//         ownerId: auth.currentUser.uid,
//         orderId,
//         name: name.trim(),
//         phone,
//         city: city.trim(),
//         address: address.trim(),
//         deliveryDate: deliveryDateString,
//         notes: notes.trim(),
//         status: "pending",
//         stage: "Measurement",
//         paymentStatus: "Unpaid",
//         createdAt: serverTimestamp(),
//       });

//       Animated.sequence([
//         Animated.timing(scaleAnim, {
//           toValue: 1.05,
//           duration: 150,
//           useNativeDriver: true,
//         }),
//         Animated.timing(scaleAnim, {
//           toValue: 1,
//           duration: 150,
//           useNativeDriver: true,
//         }),
//       ]).start(() => {
//         navigation.navigate("AddMeasurement", {
//           customerId: docRef.id,
//           customerName: name.trim(),
//           orderId,
//         });
//       });
//     } catch (error) {
//       Alert.alert("Error", "Failed to save");
//       console.error(error);
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safe}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         style={{ flex: 1 }}
//       >
//         {/* HEADER */}
//         <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
//           <TouchableOpacity 
//             style={styles.backButton} 
//             onPress={() => navigation.goBack()}
//             activeOpacity={0.7}
//           >
//             <Ionicons name="close" size={24} color="#F8FAFC" />
//           </TouchableOpacity>
//           <View style={styles.headerCenter}>
//             <Text style={styles.headerTitle}>New Order</Text>
//             <Text style={styles.headerSubtitle}>Customer Details</Text>
//           </View>
//           <TouchableOpacity 
//             style={styles.helpButton}
//             onPress={() => Alert.alert("Tips", "• Phone auto-fills returning customers\n• Tap city suggestions for quick select\n• Use quick dates or pick custom")}
//           >
//             <Ionicons name="help-circle-outline" size={24} color="#64748B" />
//           </TouchableOpacity>
//         </Animated.View>

//         <ScrollView 
//           contentContainerStyle={styles.scrollContent}
//           showsVerticalScrollIndicator={false}
//           keyboardShouldPersistTaps="handled"
//         >
//           <Animated.View
//             style={[
//               styles.content,
//               {
//                 opacity: fadeAnim,
//                 transform: [
//                   { translateY: slideAnim },
//                   { scale: scaleAnim }
//                 ],
//               },
//             ]}
//           >
//             {/* ORDER INFO CARD */}
//             <View style={styles.infoCard}>
//               <View style={styles.infoRow}>
//                 <View style={styles.infoItem}>
//                   <View style={styles.infoIconContainer}>
//                     <Ionicons name="receipt-outline" size={18} color="#3B82F6" />
//                   </View>
//                   <View>
//                     <Text style={styles.infoLabel}>Order ID</Text>
//                     <Text style={styles.infoValue}>{orderId}</Text>
//                   </View>
//                 </View>
//                 <View style={styles.infoItem}>
//                   <View style={styles.infoIconContainer}>
//                     <Ionicons name="calendar-outline" size={18} color="#10B981" />
//                   </View>
//                   <View>
//                     <Text style={styles.infoLabel}>Created</Text>
//                     <Text style={styles.infoValue}>{today}</Text>
//                   </View>
//                 </View>
//               </View>
//             </View>

//             {/* CUSTOMER FOUND BANNER */}
//             {customerFound && (
//               <Animated.View style={styles.customerFoundBanner}>
//                 <View style={styles.customerFoundLeft}>
//                   <Ionicons name="person-circle" size={40} color="#10B981" />
//                   <View>
//                     <Text style={styles.customerFoundTitle}>Returning Customer! 🎉</Text>
//                     <Text style={styles.customerFoundName}>{customerFound.name}</Text>
//                   </View>
//                 </View>
//                 <TouchableOpacity 
//                   style={styles.quickFillButton}
//                   onPress={() => quickFillCustomer(customerFound)}
//                 >
//                   <Text style={styles.quickFillText}>Quick Fill</Text>
//                   <Ionicons name="flash" size={16} color="#FFF" />
//                 </TouchableOpacity>
//               </Animated.View>
//             )}

//             {/* FORM SECTION */}
//             <View style={styles.formSection}>
//               <SectionHeader 
//                 icon="person-outline" 
//                 title="Customer Details" 
//               />

//               <FormField
//                 ref={nameRef}
//                 icon="person"
//                 label="Customer Name"
//                 placeholder="Enter full name"
//                 value={name}
//                 error={touched.name ? errors.name : ""}
//                 onChangeText={(text) => {
//                   setName(text);
//                   if (text.length >= 1) {
//                     setTouched(prev => ({ ...prev, name: true }));
//                     validateField("name", text);
//                   }
//                 }}
//                 onSubmitEditing={handleNameSubmit}
//                 returnKeyType="next"
//                 autoCapitalize="words"
//                 required
//                 valid={name.trim().length >= 2}
//               />

//               <FormField
//                 ref={phoneRef}
//                 icon="call"
//                 label="Mobile Number"
//                 placeholder="10-digit mobile"
//                 value={phone}
//                 error={touched.phone ? errors.phone : ""}
//                 onChangeText={handlePhoneChange}
//                 onSubmitEditing={handlePhoneSubmit}
//                 keyboardType="number-pad"
//                 maxLength={10}
//                 prefix="+91"
//                 required
//                 valid={phone.length === 10 && !errors.phone}
//               />

//               <View style={styles.fieldContainer}>
//                 <View style={styles.fieldLabelRow}>
//                   <Text style={styles.fieldLabel}>City *</Text>
//                   {city && !errors.city && (
//                     <Ionicons name="checkmark-circle" size={16} color="#10B981" />
//                   )}
//                 </View>
//                 <View style={[
//                   styles.fieldInputContainer,
//                   currentStep === 2 && styles.fieldInputContainerFocused,
//                   errors.city && touched.city && styles.fieldInputContainerError,
//                   city && !errors.city && styles.fieldInputContainerValid
//                 ]}>
//                   <Ionicons name="location" size={18} color="#64748B" />
//                   <TextInput
//                     ref={cityRef}
//                     style={styles.fieldInput}
//                     placeholder="Enter city"
//                     placeholderTextColor="#64748B"
//                     value={city}
//                     onChangeText={(text) => {
//                       setCity(text);
//                       setShowCitySuggestions(text.length >= 1);
//                       if (text.length >= 1) {
//                         setTouched(prev => ({ ...prev, city: true }));
//                         validateField("city", text);
//                       }
//                     }}
//                     onFocus={() => {
//                       setCurrentStep(2);
//                       setShowCitySuggestions(true);
//                     }}
//                     onSubmitEditing={handleCitySubmit}
//                     returnKeyType="done"
//                     autoCapitalize="words"
//                   />
//                   <TouchableOpacity onPress={() => setShowCitySuggestions(!showCitySuggestions)}>
//                     <Ionicons name="apps" size={20} color="#64748B" />
//                   </TouchableOpacity>
//                 </View>
                
//                 {showCitySuggestions && (
//                   <ScrollView 
//                     horizontal 
//                     showsHorizontalScrollIndicator={false}
//                     style={styles.suggestions}
//                     contentContainerStyle={styles.suggestionsContent}
//                   >
//                     {POPULAR_CITIES
//                       .filter(c => !city || c.toLowerCase().includes(city.toLowerCase()))
//                       .slice(0, 6)
//                       .map((cityName) => (
//                         <TouchableOpacity
//                           key={cityName}
//                           style={styles.suggestionChip}
//                           onPress={() => selectCity(cityName)}
//                         >
//                           <Text style={styles.suggestionText}>{cityName}</Text>
//                         </TouchableOpacity>
//                       ))}
//                   </ScrollView>
//                 )}
                
//                 {errors.city && touched.city && (
//                   <Text style={styles.fieldError}>{errors.city}</Text>
//                 )}
//               </View>

//               <FormField
//                 ref={addressRef}
//                 icon="home"
//                 label="Address"
//                 placeholder="Street, area (optional)"
//                 value={address}
//                 onChangeText={setAddress}
//                 autoCapitalize="sentences"
//                 multiline
//               />
//             </View>

//             {/* DELIVERY SECTION */}
//             <View style={styles.formSection}>
//               <SectionHeader 
//                 icon="time-outline" 
//                 title="Delivery Schedule" 
//               />

//               {/* Quick Dates */}
//               <View style={styles.quickDatesGrid}>
//                 {getQuickDates().map((option) => (
//                   <Animated.View 
//                     key={option.label}
//                     style={{ 
//                       transform: [{ scale: buttonScale }],
//                       flex: 1,
//                       minWidth: "47%",
//                     }}
//                   >
//                     <TouchableOpacity
//                       style={[
//                         styles.quickDateButton,
//                         deliveryDateString === option.formatted && styles.quickDateButtonActive
//                       ]}
//                       onPress={() => selectQuickDate(option)}
//                     >
//                       <Text style={[
//                         styles.quickDateLabel,
//                         deliveryDateString === option.formatted && styles.quickDateLabelActive
//                       ]}>
//                         {option.label}
//                       </Text>
//                       <Text style={[
//                         styles.quickDateValue,
//                         deliveryDateString === option.formatted && styles.quickDateValueActive
//                       ]}>
//                         {option.formatted}
//                       </Text>
//                     </TouchableOpacity>
//                   </Animated.View>
//                 ))}
//               </View>

//               {/* Custom Date Toggle */}
//               <TouchableOpacity 
//                 style={styles.customDateButton}
//                 onPress={() => setShowCalendar(!showCalendar)}
//               >
//                 <Ionicons name="calendar-outline" size={18} color="#94A3B8" />
//                 <Text style={styles.customDateText}>
//                   {deliveryDate ? deliveryDateString : "Pick custom date"}
//                 </Text>
//                 <Ionicons 
//                   name={showCalendar ? "chevron-up" : "chevron-down"} 
//                   size={18} 
//                   color="#64748B" 
//                 />
//               </TouchableOpacity>

//               {/* INLINE CALENDAR */}
//               {showCalendar && (
//                 <Animated.View 
//                   style={[
//                     styles.calendar,
//                     {
//                       opacity: calendarAnim,
//                       transform: [{
//                         scale: calendarAnim.interpolate({
//                           inputRange: [0, 1],
//                           outputRange: [0.95, 1]
//                         })
//                       }]
//                     }
//                   ]}
//                 >
//                   <View style={styles.calendarHeader}>
//                     <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.calendarNav}>
//                       <Ionicons name="chevron-back" size={20} color="#CBD5E1" />
//                     </TouchableOpacity>
//                     <Text style={styles.calendarMonth}>
//                       {new Date(calendarYear, calendarMonth).toLocaleDateString('en-US', { 
//                         month: 'long', 
//                         year: 'numeric' 
//                       })}
//                     </Text>
//                     <TouchableOpacity onPress={() => changeMonth(1)} style={styles.calendarNav}>
//                       <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
//                     </TouchableOpacity>
//                   </View>

//                   <View style={styles.calendarWeek}>
//                     {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
//                       <Text key={i} style={styles.calendarWeekDay}>{day}</Text>
//                     ))}
//                   </View>

//                   <View style={styles.calendarGrid}>
//                     {getCalendarDays(calendarMonth, calendarYear).map((date, index) => {
//                       if (!date) {
//                         return <View key={index} style={styles.calendarDay} />;
//                       }

//                       const today = new Date();
//                       today.setHours(0, 0, 0, 0);
//                       const isPast = date < today;
//                       const isSelected = deliveryDate && 
//                         date.toDateString() === deliveryDate.toDateString();
//                       const isToday = date.toDateString() === today.toDateString();

//                       return (
//                         <TouchableOpacity
//                           key={index}
//                           style={[
//                             styles.calendarDay,
//                             isSelected && styles.calendarDaySelected,
//                             isToday && !isSelected && styles.calendarDayToday,
//                             isPast && styles.calendarDayDisabled
//                           ]}
//                           onPress={() => !isPast && selectCalendarDate(date)}
//                           disabled={isPast}
//                         >
//                           <Text style={[
//                             styles.calendarDayText,
//                             isSelected && styles.calendarDayTextSelected,
//                             isToday && !isSelected && styles.calendarDayTextToday,
//                             isPast && styles.calendarDayTextDisabled
//                           ]}>
//                             {date.getDate()}
//                           </Text>
//                         </TouchableOpacity>
//                       );
//                     })}
//                   </View>
//                 </Animated.View>
//               )}
//             </View>

//             {/* NOTES SECTION */}
//             <View style={styles.formSection}>
//               <SectionHeader 
//                 icon="document-text-outline" 
//                 title="Additional Notes" 
//               />

//               <View style={styles.notesContainer}>
//                 <TextInput
//                   ref={notesRef}
//                   style={styles.notesInput}
//                   placeholder="Special instructions (optional)..."
//                   placeholderTextColor="#64748B"
//                   value={notes}
//                   onChangeText={setNotes}
//                   multiline
//                   numberOfLines={3}
//                   textAlignVertical="top"
//                 />
//               </View>
//             </View>

//             <View style={{ height: 120 }} />
//           </Animated.View>
//         </ScrollView>

//         {/* FLOATING BUTTON */}
//         <Animated.View 
//           style={[
//             styles.floatingButton,
//             { 
//               opacity: fadeAnim,
//               transform: [{ scale: buttonScale }]
//             }
//           ]}
//         >
//           <TouchableOpacity 
//             style={[
//               styles.continueButton,
//               !isFormValid() && styles.continueButtonDisabled
//             ]}
//             onPress={handleContinue}
//             disabled={!isFormValid() || saving}
//             activeOpacity={0.9}
//           >
//             <View style={styles.buttonContent}>
//               {saving ? (
//                 <>
//                   <Ionicons name="hourglass" size={20} color="#FFF" />
//                   <Text style={styles.buttonText}>Saving...</Text>
//                 </>
//               ) : (
//                 <>
//                   <Text style={styles.buttonText}>Continue to Measurements</Text>
//                   <Ionicons name="arrow-forward" size={20} color="#FFF" />
//                 </>
//               )}
//             </View>
//             {isFormValid() && (
//               <View style={styles.buttonBadge}>
//                 <Ionicons name="checkmark" size={14} color="#FFF" />
//               </View>
//             )}
//           </TouchableOpacity>
//         </Animated.View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// /* ---------- SECTION HEADER ---------- */
// const SectionHeader = ({ icon, title }) => (
//   <View style={styles.sectionHeader}>
//     <View style={styles.sectionIconContainer}>
//       <Ionicons name={icon} size={16} color="#3B82F6" />
//     </View>
//     <Text style={styles.sectionTitle}>{title}</Text>
//   </View>
// );

// /* ---------- FORM FIELD ---------- */
// const FormField = React.forwardRef(({ 
//   icon, 
//   label, 
//   placeholder, 
//   value, 
//   error,
//   required,
//   valid,
//   prefix,
//   ...props 
// }, ref) => (
//   <View style={styles.fieldContainer}>
//     <View style={styles.fieldLabelRow}>
//       <Text style={styles.fieldLabel}>
//         {label}
//         {required && <Text style={styles.requiredStar}> *</Text>}
//       </Text>
//       {valid && (
//         <Ionicons name="checkmark-circle" size={16} color="#10B981" />
//       )}
//     </View>
//     <View style={[
//       styles.fieldInputContainer,
//       error && styles.fieldInputContainerError,
//       valid && styles.fieldInputContainerValid
//     ]}>
//       <Ionicons name={icon} size={18} color={error ? "#EF4444" : "#64748B"} />
//       {prefix && <Text style={styles.phonePrefix}>{prefix}</Text>}
//       <TextInput
//         {...props}
//         ref={ref}
//         style={styles.fieldInput}
//         placeholder={placeholder}
//         placeholderTextColor="#64748B"
//         value={value}
//       />
//     </View>
//     {error && <Text style={styles.fieldError}>{error}</Text>}
//   </View>
// ));

// /* ---------- STYLES ---------- */
// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: "#0A0E1A" },

//   // Header
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//   },
//   backButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: "#1E293B",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   headerCenter: {
//     flex: 1,
//     alignItems: "center",
//   },
//   headerTitle: { 
//     color: "#F8FAFC", 
//     fontSize: 18, 
//     fontWeight: "700" 
//   },
//   headerSubtitle: {
//     color: "#64748B",
//     fontSize: 12,
//     fontWeight: "500",
//     marginTop: 2,
//   },
//   helpButton: {
//     width: 44,
//     height: 44,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   // Content
//   scrollContent: { flexGrow: 1 },
//   content: { padding: 20 },

//   // Info Card
//   infoCard: {
//     backgroundColor: "#1E293B",
//     borderRadius: 16,
//     padding: 14,
//     marginBottom: 20,
//   },
//   infoRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     gap: 16,
//   },
//   infoItem: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//   },
//   infoIconContainer: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: "#0F172A",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   infoLabel: { 
//     color: "#64748B", 
//     fontSize: 10,
//     fontWeight: "500",
//     marginBottom: 2,
//   },
//   infoValue: { 
//     color: "#F8FAFC", 
//     fontSize: 13, 
//     fontWeight: "700" 
//   },

//   // Customer Found
//   customerFoundBanner: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     backgroundColor: "#064E3B",
//     borderRadius: 14,
//     padding: 14,
//     marginBottom: 20,
//     borderWidth: 2,
//     borderColor: "#10B981",
//   },
//   customerFoundLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//     flex: 1,
//   },
//   customerFoundTitle: {
//     color: "#6EE7B7",
//     fontSize: 11,
//     fontWeight: "600",
//   },
//   customerFoundName: {
//     color: "#FFF",
//     fontSize: 15,
//     fontWeight: "700",
//   },
//   quickFillButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#10B981",
//     paddingHorizontal: 12,
//     paddingVertical: 7,
//     borderRadius: 10,
//     gap: 4,
//   },
//   quickFillText: {
//     color: "#FFF",
//     fontSize: 12,
//     fontWeight: "700",
//   },

//   // Form Section
//   formSection: { marginBottom: 24 },
//   sectionHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 14,
//     gap: 8,
//   },
//   sectionIconContainer: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     backgroundColor: "#1E3A8A",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   sectionTitle: {
//     color: "#F1F5F9",
//     fontSize: 15,
//     fontWeight: "700",
//   },

//   // Form Field - COMPACT HEIGHT
//   fieldContainer: { marginBottom: 16 },
//   fieldLabelRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 7,
//   },
//   fieldLabel: {
//     color: "#94A3B8",
//     fontSize: 13,
//     fontWeight: "600",
//   },
//   requiredStar: { color: "#EF4444" },
//   fieldInputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#1E293B",
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     paddingVertical: 10, // ✅ COMPACT: was 14-16
//     gap: 10,
//     borderWidth: 1.5,
//     borderColor: "transparent",
//   },
//   fieldInputContainerFocused: {
//     borderColor: "#3B82F6",
//     shadowColor: "#3B82F6",
//     shadowOffset: { width: 0, height: 0 },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   fieldInputContainerError: { borderColor: "#EF4444" },
//   fieldInputContainerValid: { borderColor: "#10B98120" },
//   fieldInput: {
//     flex: 1,
//     color: "#F1F5F9",
//     fontSize: 15,
//     fontWeight: "500",
//   },
//   phonePrefix: {
//     color: "#64748B",
//     fontSize: 15,
//     fontWeight: "600",
//     marginRight: -4,
//   },
//   fieldError: {
//     color: "#EF4444",
//     fontSize: 12,
//     marginTop: 5,
//     marginLeft: 4,
//   },

//   // Suggestions
//   suggestions: { marginTop: 8 },
//   suggestionsContent: {
//     gap: 8,
//     paddingRight: 20,
//   },
//   suggestionChip: {
//     backgroundColor: "#1E3A8A",
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     borderRadius: 10,
//   },
//   suggestionText: {
//     color: "#93C5FD",
//     fontSize: 13,
//     fontWeight: "600",
//   },

//   // Quick Dates
//   quickDatesGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 8,
//     marginBottom: 10,
//   },
//   quickDateButton: {
//     backgroundColor: "#1E293B",
//     borderRadius: 10,
//     padding: 10, // ✅ COMPACT: was 14
//     borderWidth: 1.5,
//     borderColor: "transparent",
//   },
//   quickDateButtonActive: {
//     borderColor: "#EC4899",
//     backgroundColor: "#831843",
//   },
//   quickDateLabel: {
//     color: "#94A3B8",
//     fontSize: 11,
//     fontWeight: "600",
//     marginBottom: 3,
//   },
//   quickDateLabelActive: { color: "#F9A8D4" },
//   quickDateValue: {
//     color: "#E2E8F0",
//     fontSize: 12,
//     fontWeight: "700",
//   },
//   quickDateValueActive: { color: "#FFF" },

//   customDateButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#1E293B",
//     paddingVertical: 10, // ✅ COMPACT: was 14
//     borderRadius: 10,
//     gap: 8,
//     marginBottom: 10,
//   },
//   customDateText: {
//     color: "#94A3B8",
//     fontSize: 13,
//     fontWeight: "600",
//   },

//   // Calendar - MODERN INLINE
//   calendar: {
//     backgroundColor: "#1E293B",
//     borderRadius: 14,
//     padding: 12,
//     marginTop: 4,
//   },
//   calendarHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   calendarNav: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: "#0F172A",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   calendarMonth: {
//     color: "#F1F5F9",
//     fontSize: 14,
//     fontWeight: "700",
//   },
//   calendarWeek: {
//     flexDirection: "row",
//     marginBottom: 6,
//   },
//   calendarWeekDay: {
//     flex: 1,
//     color: "#64748B",
//     fontSize: 11,
//     fontWeight: "600",
//     textAlign: "center",
//   },
//   calendarGrid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//   },
//   calendarDay: {
//     width: '14.28%',
//     aspectRatio: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 8,
//     marginVertical: 1,
//   },
//   calendarDaySelected: { backgroundColor: "#3B82F6" },
//   calendarDayToday: { backgroundColor: "#1E3A8A" },
//   calendarDayDisabled: { opacity: 0.3 },
//   calendarDayText: {
//     color: "#E2E8F0",
//     fontSize: 13,
//     fontWeight: "600",
//   },
//   calendarDayTextSelected: {
//     color: "#FFF",
//     fontWeight: "700",
//   },
//   calendarDayTextToday: { color: "#93C5FD" },
//   calendarDayTextDisabled: { color: "#475569" },

//   // Notes - COMPACT
//   notesContainer: {
//     backgroundColor: "#1E293B",
//     borderRadius: 10,
//     padding: 12, // ✅ COMPACT: was 14
//     minHeight: 80, // ✅ COMPACT: was 120
//   },
//   notesInput: {
//     color: "#F1F5F9",
//     fontSize: 14,
//     fontWeight: "500",
//     minHeight: 60, // ✅ COMPACT: was 90
//   },

//   // Floating Button
//   floatingButton: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     padding: 20,
//     paddingBottom: 16,
//     backgroundColor: "#0A0E1A",
//     borderTopWidth: 1,
//     borderTopColor: "#1E293B",
//   },
//   continueButton: {
//     backgroundColor: "#3B82F6",
//     borderRadius: 14,
//     paddingVertical: 15, // ✅ COMPACT: was 18
//     paddingHorizontal: 20,
//     shadowColor: "#3B82F6",
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.4,
//     shadowRadius: 16,
//     elevation: 8,
//     position: "relative",
//   },
//   continueButtonDisabled: {
//     backgroundColor: "#334155",
//     shadowOpacity: 0,
//     elevation: 0,
//   },
//   buttonContent: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 8,
//   },
//   buttonText: {
//     color: "#FFF",
//     fontSize: 16,
//     fontWeight: "700",
//   },
//   buttonBadge: {
//     position: "absolute",
//     top: -8,
//     right: -8,
//     width: 26,
//     height: 26,
//     borderRadius: 13,
//     backgroundColor: "#10B981",
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 3,
//     borderColor: "#0A0E1A",
//   },
// });


import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../firebaseConfig";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
  Keyboard,
  Vibration,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { addDoc, collection, serverTimestamp, query, where, getDocs, limit } from "firebase/firestore";
import { useLanguage } from "../context/LanguageContext";
import { LanguageToggle } from "../context/LanguageToggle";

/* ---------- HELPERS ---------- */
const generateOrderId = () => {
  const prefix = "ORD";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 100).toString().padStart(2, "0");
  return `${prefix}-${timestamp}${random}`;
};

const formatDate = (date) => {
  return date.toLocaleDateString("en-GB", { 
    day: "2-digit", 
    month: "short", 
    year: "numeric" 
  });
};

// Generate calendar days
const getCalendarDays = (month, year) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }
  return days;
};

// Common cities
const POPULAR_CITIES = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Ahmedabad", "Pune", "Surat", "Jaipur"];

export default function AddCustomerScreen({ navigation }) {
  const { t } = useLanguage();
  
  const [orderId] = useState(generateOrderId());
  const [today] = useState(formatDate(new Date()));

  // Quick date options - MOVED INSIDE COMPONENT TO ACCESS t
  const getQuickDates = () => {
    const today = new Date();
    return [
      { label: t.tomorrow, days: 1 },
      { label: t.threeDays, days: 3 },
      { label: t.oneWeek, days: 7 },
      { label: t.twoWeeks, days: 14 },
    ].map(({ label, days }) => {
      const date = new Date(today);
      date.setDate(date.getDate() + days);
      return { label, date, formatted: formatDate(date) };
    });
  };

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [deliveryDateString, setDeliveryDateString] = useState("");
  const [notes, setNotes] = useState("");

  // UI State
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Smart Features
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [customerFound, setCustomerFound] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  // Refs
  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const cityRef = useRef(null);
  const addressRef = useRef(null);
  const notesRef = useRef(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const calendarAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => nameRef.current?.focus(), 400);
    loadRecentCustomers();
  }, []);

  // Calendar animation
  useEffect(() => {
    Animated.spring(calendarAnim, {
      toValue: showCalendar ? 1 : 0,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [showCalendar]);

  const loadRecentCustomers = async () => {
    try {
      const q = query(
        collection(db, "customers"),
        where("ownerId", "==", auth.currentUser.uid),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const customers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecentCustomers(customers);
    } catch (error) {
      console.error("Error loading customers:", error);
    }
  };

  useEffect(() => {
    if (phone.length === 10) {
      const existing = recentCustomers.find(c => c.phone === phone);
      if (existing) {
        setCustomerFound(existing);
        Vibration.vibrate(50);
      } else {
        setCustomerFound(null);
      }
    } else {
      setCustomerFound(null);
    }
  }, [phone, recentCustomers]);

  /* ---------- SMART AUTO-ADVANCE ---------- */
  const handleNameSubmit = () => {
    if (name.trim().length >= 2) {
      phoneRef.current?.focus();
      setCurrentStep(1);
    }
  };

  const handlePhoneSubmit = () => {
    if (phone.length === 10) {
      cityRef.current?.focus();
      setCurrentStep(2);
    }
  };

  const handleCitySubmit = () => {
    if (city.trim()) {
      setCurrentStep(3);
      Keyboard.dismiss();
    }
  };

  /* ---------- QUICK FILL ---------- */
  const quickFillCustomer = (customer) => {
    setName(customer.name || "");
    setCity(customer.city || "");
    setAddress(customer.address || "");
    setCustomerFound(null);
    Vibration.vibrate([50, 100, 50]);
    Alert.alert(t.returningCustomer, `Auto-filled details for ${customer.name}`);
  };

  /* ---------- VALIDATION ---------- */
  const validateField = (field, value) => {
    let message = "";

    switch (field) {
      case "name":
        if (!value.trim()) message = "Name required";
        else if (value.trim().length < 2) message = "Too short";
        break;
      case "phone":
        if (!value) message = "Phone required";
        else if (value.length !== 10) message = "Must be 10 digits";
        else if (!/^[6-9]\d{9}$/.test(value)) message = "Invalid number";
        break;
      case "city":
        if (!value.trim()) message = "City required";
        break;
      case "deliveryDate":
        if (!value) message = "Date required";
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: message }));
    return message === "";
  };

  const handlePhoneChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, "").slice(0, 10);
    setPhone(cleaned);
    if (cleaned.length >= 1) {
      setTouched(prev => ({ ...prev, phone: true }));
      validateField("phone", cleaned);
    }
  };

  /* ---------- DATE SELECTION ---------- */
  const selectQuickDate = (dateOption) => {
    setDeliveryDate(dateOption.date);
    setDeliveryDateString(dateOption.formatted);
    setShowCalendar(false);
    setTouched((prev) => ({ ...prev, deliveryDate: true }));
    validateField("deliveryDate", dateOption.formatted);
    Vibration.vibrate(30);
    
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const selectCalendarDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return;
    
    setDeliveryDate(date);
    setDeliveryDateString(formatDate(date));
    setShowCalendar(false);
    setTouched((prev) => ({ ...prev, deliveryDate: true }));
    validateField("deliveryDate", formatDate(date));
    Vibration.vibrate(30);
  };

  const changeMonth = (delta) => {
    let newMonth = calendarMonth + delta;
    let newYear = calendarYear;
    
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    
    setCalendarMonth(newMonth);
    setCalendarYear(newYear);
  };

  const selectCity = (cityName) => {
    setCity(cityName);
    setShowCitySuggestions(false);
    setTouched(prev => ({ ...prev, city: true }));
    validateField("city", cityName);
    Vibration.vibrate(30);
    handleCitySubmit();
  };

  const isFormValid = () => {
    return (
      name.trim().length >= 2 &&
      /^[6-9]\d{9}$/.test(phone) &&
      city.trim().length > 0 &&
      deliveryDate !== null
    );
  };

  const handleContinue = async () => {
    if (!isFormValid()) {
      Alert.alert(t.incompleteForm, t.fillRequired);
      return;
    }

    setSaving(true);
    Vibration.vibrate(50);

    try {
      const docRef = await addDoc(collection(db, "customers"), {
        ownerId: auth.currentUser.uid,
        orderId,
        name: name.trim(),
        phone,
        city: city.trim(),
        address: address.trim(),
        deliveryDate: deliveryDateString,
        notes: notes.trim(),
        status: "pending",
        stage: "Measurement",
        paymentStatus: "Unpaid",
        createdAt: serverTimestamp(),
      });

      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        navigation.navigate("AddMeasurement", {
          customerId: docRef.id,
          customerName: name.trim(),
          orderId,
        });
      });
    } catch (error) {
      Alert.alert(t.error, "Failed to save");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* HEADER */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color="#F8FAFC" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t.newOrder}</Text>
            <Text style={styles.headerSubtitle}>{t.customerDetails}</Text>
          </View>
          <LanguageToggle />
        </Animated.View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ],
              },
            ]}
          >
            {/* ORDER INFO CARD */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="receipt-outline" size={18} color="#3B82F6" />
                  </View>
                  <View>
                    <Text style={styles.infoLabel}>{t.orderId}</Text>
                    <Text style={styles.infoValue}>{orderId}</Text>
                  </View>
                </View>
                <View style={styles.infoItem}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="calendar-outline" size={18} color="#10B981" />
                  </View>
                  <View>
                    <Text style={styles.infoLabel}>{t.created}</Text>
                    <Text style={styles.infoValue}>{today}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* CUSTOMER FOUND BANNER */}
            {customerFound && (
              <Animated.View style={styles.customerFoundBanner}>
                <View style={styles.customerFoundLeft}>
                  <Ionicons name="person-circle" size={40} color="#10B981" />
                  <View>
                    <Text style={styles.customerFoundTitle}>{t.returningCustomer}</Text>
                    <Text style={styles.customerFoundName}>{customerFound.name}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.quickFillButton}
                  onPress={() => quickFillCustomer(customerFound)}
                >
                  <Text style={styles.quickFillText}>{t.quickFill}</Text>
                  <Ionicons name="flash" size={16} color="#FFF" />
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* FORM SECTION */}
            <View style={styles.formSection}>
              <SectionHeader 
                icon="person-outline" 
                title={t.customerDetails} 
              />

              <FormField
                ref={nameRef}
                icon="person"
                label={t.customerName}
                placeholder={t.enterFullName}
                value={name}
                error={touched.name ? errors.name : ""}
                onChangeText={(text) => {
                  setName(text);
                  if (text.length >= 1) {
                    setTouched(prev => ({ ...prev, name: true }));
                    validateField("name", text);
                  }
                }}
                onSubmitEditing={handleNameSubmit}
                returnKeyType="next"
                autoCapitalize="words"
                required
                valid={name.trim().length >= 2}
              />

              <FormField
                ref={phoneRef}
                icon="call"
                label={t.mobileNumber}
                placeholder={t.tenDigitMobile}
                value={phone}
                error={touched.phone ? errors.phone : ""}
                onChangeText={handlePhoneChange}
                onSubmitEditing={handlePhoneSubmit}
                keyboardType="number-pad"
                maxLength={10}
                prefix="+91"
                required
                valid={phone.length === 10 && !errors.phone}
              />

              <View style={styles.fieldContainer}>
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabel}>{t.city} *</Text>
                  {city && !errors.city && (
                    <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  )}
                </View>
                <View style={[
                  styles.fieldInputContainer,
                  currentStep === 2 && styles.fieldInputContainerFocused,
                  errors.city && touched.city && styles.fieldInputContainerError,
                  city && !errors.city && styles.fieldInputContainerValid
                ]}>
                  <Ionicons name="location" size={18} color="#64748B" />
                  <TextInput
                    ref={cityRef}
                    style={styles.fieldInput}
                    placeholder={t.enterCity}
                    placeholderTextColor="#64748B"
                    value={city}
                    onChangeText={(text) => {
                      setCity(text);
                      setShowCitySuggestions(text.length >= 1);
                      if (text.length >= 1) {
                        setTouched(prev => ({ ...prev, city: true }));
                        validateField("city", text);
                      }
                    }}
                    onFocus={() => {
                      setCurrentStep(2);
                      setShowCitySuggestions(true);
                    }}
                    onSubmitEditing={handleCitySubmit}
                    returnKeyType="done"
                    autoCapitalize="words"
                  />
                  <TouchableOpacity onPress={() => setShowCitySuggestions(!showCitySuggestions)}>
                    <Ionicons name="apps" size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>
                
                {showCitySuggestions && (
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.suggestions}
                    contentContainerStyle={styles.suggestionsContent}
                  >
                    {POPULAR_CITIES
                      .filter(c => !city || c.toLowerCase().includes(city.toLowerCase()))
                      .slice(0, 6)
                      .map((cityName) => (
                        <TouchableOpacity
                          key={cityName}
                          style={styles.suggestionChip}
                          onPress={() => selectCity(cityName)}
                        >
                          <Text style={styles.suggestionText}>{cityName}</Text>
                        </TouchableOpacity>
                      ))}
                  </ScrollView>
                )}
                
                {errors.city && touched.city && (
                  <Text style={styles.fieldError}>{errors.city}</Text>
                )}
              </View>

              <FormField
                ref={addressRef}
                icon="home"
                label={t.address}
                placeholder={t.streetArea}
                value={address}
                onChangeText={setAddress}
                autoCapitalize="sentences"
                multiline
              />
            </View>

            {/* DELIVERY SECTION */}
            <View style={styles.formSection}>
              <SectionHeader 
                icon="time-outline" 
                title={t.deliverySchedule} 
              />

              {/* Quick Dates */}
              <View style={styles.quickDatesGrid}>
                {getQuickDates().map((option) => (
                  <Animated.View 
                    key={option.label}
                    style={{ 
                      transform: [{ scale: buttonScale }],
                      flex: 1,
                      minWidth: "47%",
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.quickDateButton,
                        deliveryDateString === option.formatted && styles.quickDateButtonActive
                      ]}
                      onPress={() => selectQuickDate(option)}
                    >
                      <Text style={[
                        styles.quickDateLabel,
                        deliveryDateString === option.formatted && styles.quickDateLabelActive
                      ]}>
                        {option.label}
                      </Text>
                      <Text style={[
                        styles.quickDateValue,
                        deliveryDateString === option.formatted && styles.quickDateValueActive
                      ]}>
                        {option.formatted}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>

              {/* Custom Date Toggle */}
              <TouchableOpacity 
                style={styles.customDateButton}
                onPress={() => setShowCalendar(!showCalendar)}
              >
                <Ionicons name="calendar-outline" size={18} color="#94A3B8" />
                <Text style={styles.customDateText}>
                  {deliveryDate ? deliveryDateString : t.pickCustomDate}
                </Text>
                <Ionicons 
                  name={showCalendar ? "chevron-up" : "chevron-down"} 
                  size={18} 
                  color="#64748B" 
                />
              </TouchableOpacity>

              {/* INLINE CALENDAR */}
              {showCalendar && (
                <Animated.View 
                  style={[
                    styles.calendar,
                    {
                      opacity: calendarAnim,
                      transform: [{
                        scale: calendarAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.95, 1]
                        })
                      }]
                    }
                  ]}
                >
                  <View style={styles.calendarHeader}>
                    <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.calendarNav}>
                      <Ionicons name="chevron-back" size={20} color="#CBD5E1" />
                    </TouchableOpacity>
                    <Text style={styles.calendarMonth}>
                      {new Date(calendarYear, calendarMonth).toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </Text>
                    <TouchableOpacity onPress={() => changeMonth(1)} style={styles.calendarNav}>
                      <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.calendarWeek}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                      <Text key={i} style={styles.calendarWeekDay}>{day}</Text>
                    ))}
                  </View>

                  <View style={styles.calendarGrid}>
                    {getCalendarDays(calendarMonth, calendarYear).map((date, index) => {
                      if (!date) {
                        return <View key={index} style={styles.calendarDay} />;
                      }

                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const isPast = date < today;
                      const isSelected = deliveryDate && 
                        date.toDateString() === deliveryDate.toDateString();
                      const isToday = date.toDateString() === today.toDateString();

                      return (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.calendarDay,
                            isSelected && styles.calendarDaySelected,
                            isToday && !isSelected && styles.calendarDayToday,
                            isPast && styles.calendarDayDisabled
                          ]}
                          onPress={() => !isPast && selectCalendarDate(date)}
                          disabled={isPast}
                        >
                          <Text style={[
                            styles.calendarDayText,
                            isSelected && styles.calendarDayTextSelected,
                            isToday && !isSelected && styles.calendarDayTextToday,
                            isPast && styles.calendarDayTextDisabled
                          ]}>
                            {date.getDate()}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </Animated.View>
              )}
            </View>

            {/* NOTES SECTION */}
            <View style={styles.formSection}>
              <SectionHeader 
                icon="document-text-outline" 
                title={t.additionalNotes} 
              />

              <View style={styles.notesContainer}>
                <TextInput
                  ref={notesRef}
                  style={styles.notesInput}
                  placeholder={t.specialInstructions}
                  placeholderTextColor="#64748B"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <View style={{ height: 120 }} />
          </Animated.View>
        </ScrollView>

        {/* FLOATING BUTTON */}
        <Animated.View 
          style={[
            styles.floatingButton,
            { 
              opacity: fadeAnim,
              transform: [{ scale: buttonScale }]
            }
          ]}
        >
          <TouchableOpacity 
            style={[
              styles.continueButton,
              !isFormValid() && styles.continueButtonDisabled
            ]}
            onPress={handleContinue}
            disabled={!isFormValid() || saving}
            activeOpacity={0.9}
          >
            <View style={styles.buttonContent}>
              {saving ? (
                <>
                  <Ionicons name="hourglass" size={20} color="#FFF" />
                  <Text style={styles.buttonText}>{t.saving}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.buttonText}>{t.continueToMeasurements}</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFF" />
                </>
              )}
            </View>
            {isFormValid() && (
              <View style={styles.buttonBadge}>
                <Ionicons name="checkmark" size={14} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------- SECTION HEADER ---------- */
const SectionHeader = ({ icon, title }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionIconContainer}>
      <Ionicons name={icon} size={16} color="#3B82F6" />
    </View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

/* ---------- FORM FIELD ---------- */
const FormField = React.forwardRef(({ 
  icon, 
  label, 
  placeholder, 
  value, 
  error,
  required,
  valid,
  prefix,
  ...props 
}, ref) => (
  <View style={styles.fieldContainer}>
    <View style={styles.fieldLabelRow}>
      <Text style={styles.fieldLabel}>
        {label}
        {required && <Text style={styles.requiredStar}> *</Text>}
      </Text>
      {valid && (
        <Ionicons name="checkmark-circle" size={16} color="#10B981" />
      )}
    </View>
    <View style={[
      styles.fieldInputContainer,
      error && styles.fieldInputContainerError,
      valid && styles.fieldInputContainerValid
    ]}>
      <Ionicons name={icon} size={18} color={error ? "#EF4444" : "#64748B"} />
      {prefix && <Text style={styles.phonePrefix}>{prefix}</Text>}
      <TextInput
        {...props}
        ref={ref}
        style={styles.fieldInput}
        placeholder={placeholder}
        placeholderTextColor="#64748B"
        value={value}
      />
    </View>
    {error && <Text style={styles.fieldError}>{error}</Text>}
  </View>
));

/* ---------- STYLES (ALL YOUR ORIGINAL STYLES) ---------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0A0E1A" },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: { 
    color: "#F8FAFC", 
    fontSize: 18, 
    fontWeight: "700" 
  },
  headerSubtitle: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },

  // Content
  scrollContent: { flexGrow: 1 },
  content: { padding: 20 },

  // Info Card
  infoCard: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  infoItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
  },
  infoLabel: { 
    color: "#64748B", 
    fontSize: 10,
    fontWeight: "500",
    marginBottom: 2,
  },
  infoValue: { 
    color: "#F8FAFC", 
    fontSize: 13, 
    fontWeight: "700" 
  },

  // Customer Found
  customerFoundBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#064E3B",
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#10B981",
  },
  customerFoundLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  customerFoundTitle: {
    color: "#6EE7B7",
    fontSize: 11,
    fontWeight: "600",
  },
  customerFoundName: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
  },
  quickFillButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10B981",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 4,
  },
  quickFillText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },

  // Form Section
  formSection: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 8,
  },
  sectionIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#1E3A8A",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    color: "#F1F5F9",
    fontSize: 15,
    fontWeight: "700",
  },

  // Form Field
  fieldContainer: { marginBottom: 16 },
  fieldLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
  },
  fieldLabel: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "600",
  },
  requiredStar: { color: "#EF4444" },
  fieldInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  fieldInputContainerFocused: {
    borderColor: "#3B82F6",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  fieldInputContainerError: { borderColor: "#EF4444" },
  fieldInputContainerValid: { borderColor: "#10B98120" },
  fieldInput: {
    flex: 1,
    color: "#F1F5F9",
    fontSize: 15,
    fontWeight: "500",
  },
  phonePrefix: {
    color: "#64748B",
    fontSize: 15,
    fontWeight: "600",
    marginRight: -4,
  },
  fieldError: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 4,
  },

  // Suggestions
  suggestions: { marginTop: 8 },
  suggestionsContent: {
    gap: 8,
    paddingRight: 20,
  },
  suggestionChip: {
    backgroundColor: "#1E3A8A",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  suggestionText: {
    color: "#93C5FD",
    fontSize: 13,
    fontWeight: "600",
  },

  // Quick Dates
  quickDatesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  quickDateButton: {
    backgroundColor: "#1E293B",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  quickDateButtonActive: {
    borderColor: "#EC4899",
    backgroundColor: "#831843",
  },
  quickDateLabel: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 3,
  },
  quickDateLabelActive: { color: "#F9A8D4" },
  quickDateValue: {
    color: "#E2E8F0",
    fontSize: 12,
    fontWeight: "700",
  },
  quickDateValueActive: { color: "#FFF" },

  customDateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1E293B",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
    marginBottom: 10,
  },
  customDateText: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "600",
  },

  // Calendar
  calendar: {
    backgroundColor: "#1E293B",
    borderRadius: 14,
    padding: 12,
    marginTop: 4,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  calendarNav: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
  },
  calendarMonth: {
    color: "#F1F5F9",
    fontSize: 14,
    fontWeight: "700",
  },
  calendarWeek: {
    flexDirection: "row",
    marginBottom: 6,
  },
  calendarWeekDay: {
    flex: 1,
    color: "#64748B",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginVertical: 1,
  },
  calendarDaySelected: { backgroundColor: "#3B82F6" },
  calendarDayToday: { backgroundColor: "#1E3A8A" },
  calendarDayDisabled: { opacity: 0.3 },
  calendarDayText: {
    color: "#E2E8F0",
    fontSize: 13,
    fontWeight: "600",
  },
  calendarDayTextSelected: {
    color: "#FFF",
    fontWeight: "700",
  },
  calendarDayTextToday: { color: "#93C5FD" },
  calendarDayTextDisabled: { color: "#475569" },

  // Notes
  notesContainer: {
    backgroundColor: "#1E293B",
    borderRadius: 10,
    padding: 12,
    minHeight: 80,
  },
  notesInput: {
    color: "#F1F5F9",
    fontSize: 14,
    fontWeight: "500",
    minHeight: 60,
  },

  // Floating Button
  floatingButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 16,
    backgroundColor: "#0A0E1A",
    borderTopWidth: 1,
    borderTopColor: "#1E293B",
  },
  continueButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 20,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    position: "relative",
  },
  continueButtonDisabled: {
    backgroundColor: "#334155",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#0A0E1A",
  },
});