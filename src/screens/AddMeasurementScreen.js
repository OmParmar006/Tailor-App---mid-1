// // // import React, { useState } from "react";
// // // import { db } from "../firebaseConfig";
// // // import { addDoc, collection, serverTimestamp } from "firebase/firestore";
// // // import {
// // //   View,
// // //   Text,
// // //   StyleSheet,
// // //   TouchableOpacity,
// // //   ScrollView,
// // //   TextInput,
// // //   Modal,
// // //   Alert,
// // // } from "react-native";
// // // import { SafeAreaView } from "react-native-safe-area-context";
// // // import { Ionicons } from "@expo/vector-icons";
// // // import { TabRouter } from "@react-navigation/native";

// // // /* ---------------- DATA ---------------- */

// // // const GARMENTS = [
// // //   "Shirt",
// // //   "Pant",
// // //   "Kurta",
// // //   "Safari",
// // //   "Coti",
// // //   "Blazer",
// // //   "Suit",
// // // ];

// // // const FIT_PRESETS = {
// // //   Slim: -0.5,
// // //   Regular: 0,
// // //   Loose: 0.5,
// // // };

// // // const MEASUREMENTS = {
// // //   Shirt: {
// // //     "Body Size": [
// // //       "Chest",
// // //       "Stomach (Pet)",
// // //       "Seat (Hip)",
// // //       "Shoulder",
// // //       "Back",
// // //     ],
// // //     Sleeves: [
// // //       "Sleeve Length",
// // //       "Sleeve Round",
// // //       "Sleeve End",
// // //     ],
// // //     Neck: [
// // //       "Collar",
// // //       "Front Neck",
// // //       "Back Neck",
// // //     ],
// // //     Length: ["Shirt Length"],
// // //   },

// // //   Pant: {
// // //     "Upper Part": ["Waist", "Seat (Hip)"],
// // //     Legs: ["Thigh", "Knee", "Calf", "Bottom"],
// // //     Length: ["Full Length", "Inside Length", "Seat Length"],
// // //   },

// // //   Kurta: {
// // //     "Body Size": [
// // //       "Chest",
// // //       "Stomach (Pet)",
// // //       "Seat (Hip)",
// // //       "Shoulder",
// // //     ],
// // //     Sleeves: ["Sleeve Length", "Sleeve End"],
// // //     Length: ["Kurta Length"],
// // //   },

// // //   Safari: {
// // //     "Body Size": [
// // //       "Chest",
// // //       "Stomach (Pet)",
// // //       "Seat (Hip)",
// // //       "Shoulder",
// // //     ],
// // //     Sleeves: ["Sleeve Length", "Armhole"],
// // //     Length: ["Safari Length"],
// // //   },

// // //   Coti: {
// // //     "Body Size": [
// // //       "Chest",
// // //       "Stomach (Pet)",
// // //       "Seat (Hip)",
// // //       "Shoulder",
// // //     ],
// // //     Length: ["Coti Length"],
// // //   },

// // //   Blazer: {
// // //     "Body Size": [
// // //       "Chest",
// // //       "Stomach (Pet)",
// // //       "Seat (Hip)",
// // //       "Shoulder",
// // //       "Back",
// // //     ],
// // //     Sleeves: ["Sleeve Length", "Armhole"],
// // //     Length: ["Blazer Length"],
// // //   },

// // //   Suit: {
// // //     "Jacket Size": [
// // //       "Chest",
// // //       "Stomach (Pet)",
// // //       "Seat (Hip)",
// // //       "Shoulder",
// // //       "Sleeve Length",
// // //       "Back",
// // //     ],
// // //     "Pant Size": [
// // //       "Waist",
// // //       "Seat (Hip)",
// // //       "Thigh",
// // //       "Bottom",
// // //       "Full Length",
// // //     ],
// // //   },
// // // };

// // // /* ---------------- SCREEN ---------------- */

// // // export default function AddMeasurementScreen({ navigation,route }) {
// // //   const {customerId} = route.params;
// // //   const [activeGarment, setActiveGarment] = useState("Shirt");
// // //   const [data, setData] = useState({});
// // //   const [pickerOpen, setPickerOpen] = useState(false);
// // //   const [fitType, setFitType] = useState("Regular");

// // //   const updateValue = (field, value) => {
// // //     setData((prev) => ({
// // //       ...prev,
// // //       [activeGarment]: {
// // //         ...(prev[activeGarment] || {}),
// // //         [field]: value,
// // //       },
// // //     }));
// // //   };

// // //   const applyFitPreset = (type) => {
// // //     const offset = FIT_PRESETS[type];
// // //     const updated = {};

// // //     Object.values(MEASUREMENTS[activeGarment])
// // //       .flat()
// // //       .forEach((f) => {
// // //         const base = parseFloat(data?.[activeGarment]?.[f] || 0);
// // //         if (!isNaN(base)) {
// // //           updated[f] = (base + offset).toFixed(1);
// // //         }
// // //       });

// // //     setData((prev) => ({
// // //       ...prev,
// // //       [activeGarment]: {
// // //         ...(prev[activeGarment] || {}),
// // //         ...updated,
// // //       },
// // //     }));

// // //     setFitType(type);
// // //   };

// // //   const handleSave = async () => {
// // //   try {
// // //     await addDoc(collection(db, "measurements"), {
// // //       customerId,                     // comes from route.params
// // //       garment: activeGarment,
// // //       fitType,
// // //       values: data[activeGarment] || {},
// // //       createdAt: serverTimestamp(),
// // //     });

// // //     Alert.alert(
// // //       "Saved",
// // //       `${activeGarment} measurements saved (${fitType} fit)`
// // //     );

// // //     navigation.navigate("Home");
// // //   } catch (error) {
// // //     Alert.alert("Error", "Failed to save measurements");
// // //   }
// // // };


// // //   return (
// // //     <SafeAreaView style={styles.safe}>
// // //       {/* HEADER */}
// // //       <View style={styles.header}>
// // //         <TouchableOpacity onPress={() => navigation.goBack()}>
// // //           <Ionicons name="arrow-back" size={22} color="#E5E7EB" />
// // //         </TouchableOpacity>
// // //         <Text style={styles.headerTitle}>Take Measurements</Text>
// // //         <View style={{ width: 22 }} />
// // //       </View>

// // //       {/* GARMENT PICKER */}
// // //       <TouchableOpacity
// // //         style={styles.garmentPicker}
// // //         onPress={() => setPickerOpen(true)}
// // //       >
// // //         <Text style={styles.smallLabel}>Garment</Text>
// // //         <View style={styles.rowBetween}>
// // //           <Text style={styles.valueText}>{activeGarment}</Text>
// // //           <Ionicons name="chevron-down" size={18} color="#94A3B8" />
// // //         </View>
// // //       </TouchableOpacity>

// // //       {/* FIT PRESET */}
// // //       <View style={styles.fitRow}>
// // //         {Object.keys(FIT_PRESETS).map((f) => (
// // //           <TouchableOpacity
// // //             key={f}
// // //             style={[
// // //               styles.fitChip,
// // //               fitType === f && styles.fitChipActive,
// // //             ]}
// // //             onPress={() => applyFitPreset(f)}
// // //           >
// // //             <Text
// // //               style={[
// // //                 styles.fitText,
// // //                 fitType === f && styles.fitTextActive,
// // //               ]}
// // //             >
// // //               {f}
// // //             </Text>
// // //           </TouchableOpacity>
// // //         ))}
// // //       </View>

// // //       {/* FORM */}
// // //       <ScrollView contentContainerStyle={styles.form}>
// // //         {Object.entries(MEASUREMENTS[activeGarment]).map(
// // //           ([section, fields]) => (
// // //             <View key={section} style={styles.card}>
// // //               <Text style={styles.cardTitle}>{section}</Text>
// // //               <View style={styles.divider} />

// // //               {fields.map((field) => (
// // //                 <View key={field} style={styles.measureRow}>
// // //                   <Text style={styles.measureLabel}>{field}</Text>

// // //                   <View style={styles.measureInputWrap}>
// // //                     <TextInput
// // //                       style={styles.measureInput}
// // //                       keyboardType="numeric"
// // //                       placeholder="0"
// // //                       placeholderTextColor="#64748B"
// // //                       value={data?.[activeGarment]?.[field] || ""}
// // //                       onChangeText={(v) => updateValue(field, v)}
// // //                     />
// // //                     <Text style={styles.unit}>in</Text>
// // //                   </View>
// // //                 </View>
// // //               ))}
// // //             </View>
// // //           )
// // //         )}
// // //       </ScrollView>

// // //       {/* SAVE */}
// // //       <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
// // //         <Text style={styles.saveText}>Save Measurements</Text>
// // //       </TouchableOpacity>

// // //       {/* GARMENT MODAL */}
// // //       <Modal transparent visible={pickerOpen} animationType="slide">
// // //         <View style={styles.modalBg}>
// // //           <View style={styles.modalCard}>
// // //             <Text style={styles.modalTitle}>Select Garment</Text>
// // //             {GARMENTS.map((g) => (
// // //               <TouchableOpacity
// // //                 key={g}
// // //                 style={styles.modalItem}
// // //                 onPress={() => {
// // //                   setActiveGarment(g);
// // //                   setPickerOpen(false);
// // //                 }}
// // //               >
// // //                 <Text style={styles.modalText}>{g}</Text>
// // //               </TouchableOpacity>
// // //             ))}
// // //           </View>
// // //         </View>
// // //       </Modal>
// // //     </SafeAreaView>
// // //   );
// // // }

// // // /* ---------------- STYLES ---------------- */

// // // const styles = StyleSheet.create({
// // //   safe: { flex: 1, backgroundColor: "#0B1121" },

// // //   header: {
// // //     flexDirection: "row",
// // //     justifyContent: "space-between",
// // //     padding: 20,
// // //   },
// // //   headerTitle: {
// // //     color: "#FFFFFF",
// // //     fontSize: 18,
// // //     fontWeight: "700",
// // //   },

// // //   garmentPicker: {
// // //     marginHorizontal: 16,
// // //     marginBottom: 10,
// // //     padding: 14,
// // //     borderRadius: 16,
// // //     backgroundColor: "#151E32",
// // //     borderWidth: 1,
// // //     borderColor: "#1E293B",
// // //   },
// // //   smallLabel: { color: "#94A3B8", fontSize: 11 },
// // //   rowBetween: {
// // //     flexDirection: "row",
// // //     justifyContent: "space-between",
// // //     alignItems: "center",
// // //   },
// // //   valueText: { color: "#E2E8F0", fontSize: 16 },

// // //   fitRow: {
// // //     flexDirection: "row",
// // //     justifyContent: "space-around",
// // //     marginBottom: 10,
// // //   },
// // //   fitChip: {
// // //     paddingHorizontal: 18,
// // //     paddingVertical: 10,
// // //     borderRadius: 20,
// // //     backgroundColor: "#1E293B",
// // //   },
// // //   fitChipActive: {
// // //     backgroundColor: "#2563EB",
// // //   },
// // //   fitText: { color: "#CBD5E1", fontWeight: "600" },
// // //   fitTextActive: { color: "#FFFFFF" },

// // //   form: { padding: 16, paddingBottom: 120 },

// // //   card: {
// // //     backgroundColor: "#151E32",
// // //     borderRadius: 18,
// // //     padding: 16,
// // //     marginBottom: 16,
// // //     borderWidth: 1,
// // //     borderColor: "#1E293B",
// // //   },
// // //   cardTitle: {
// // //     color: "#E2E8F0",
// // //     fontSize: 15,
// // //     fontWeight: "700",
// // //   },
// // //   divider: {
// // //     height: 1,
// // //     backgroundColor: "#1E293B",
// // //     marginVertical: 10,
// // //   },

// // //   /* ---- ALIGNED MEASUREMENT ROW ---- */
// // //   measureRow: {
// // //     flexDirection: "row",
// // //     alignItems: "center",
// // //     marginBottom: 12,
// // //   },
// // //   measureLabel: {
// // //     flex: 1,
// // //     color: "#CBD5E1",
// // //     fontSize: 14,
// // //     paddingRight: 8,
// // //   },
// // //   measureInputWrap: {
// // //     flexDirection: "row",
// // //     alignItems: "center",
// // //     backgroundColor: "#0F172A",
// // //     borderRadius: 12,
// // //     borderWidth: 1,
// // //     borderColor: "#1E293B",
// // //     paddingHorizontal: 10,
// // //     width: 120,
// // //     height: 42,
// // //   },
// // //   measureInput: {
// // //     flex: 1,
// // //     color: "#FFFFFF",
// // //     fontSize: 15,
// // //     textAlign: "center",
// // //   },
// // //   unit: {
// // //     color: "#94A3B8",
// // //     fontSize: 12,
// // //     marginLeft: 4,
// // //   },

// // //   saveBtn: {
// // //     position: "absolute",
// // //     bottom: 20,
// // //     left: 20,
// // //     right: 20,
// // //     backgroundColor: "#2563EB",
// // //     paddingVertical: 16,
// // //     borderRadius: 16,
// // //     alignItems: "center",
// // //   },
// // //   saveText: {
// // //     color: "#FFFFFF",
// // //     fontSize: 16,
// // //     fontWeight: "700",
// // //   },

// // //   modalBg: {
// // //     flex: 1,
// // //     backgroundColor: "rgba(0,0,0,0.6)",
// // //     justifyContent: "flex-end",
// // //   },
// // //   modalCard: {
// // //     backgroundColor: "#0F172A",
// // //     padding: 20,
// // //     borderTopLeftRadius: 20,
// // //     borderTopRightRadius: 20,
// // //   },
// // //   modalTitle: {
// // //     color: "#FFFFFF",
// // //     fontSize: 16,
// // //     fontWeight: "700",
// // //     marginBottom: 10,
// // //   },
// // //   modalItem: {
// // //     paddingVertical: 14,
// // //     borderBottomWidth: 1,
// // //     borderBottomColor: "#1E293B",
// // //   },
// // //   modalText: {
// // //     color: "#CBD5E1",
// // //     fontSize: 15,
// // //   },
// // // });



// // import React, { useState, useRef } from "react";
// // import { db } from "../firebaseConfig";
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   TouchableOpacity,
// //   ScrollView,
// //   TextInput,
// //   Modal,
// //   Alert,
// //   Animated,
// // } from "react-native";
// // import { SafeAreaView } from "react-native-safe-area-context";
// // import { Ionicons } from "@expo/vector-icons";
// // import { addDoc, collection, serverTimestamp } from "firebase/firestore";

// // /* ---------------- DATA ---------------- */

// // const GARMENTS = [
// //   "Shirt",
// //   "Pant",
// //   "Kurta",
// //   "Safari",
// //   "Coti",
// //   "Blazer",
// //   "Suit",
// // ];

// // const FIT_PRESETS = {
// //   Slim: -0.5,
// //   Regular: 0,
// //   Loose: 0.5,
// // };

// // const MEASUREMENTS = {
// //   Shirt: {
// //     "Body Size": [
// //       "Chest",
// //       "Stomach (Pet)",
// //       "Seat (Hip)",
// //       "Shoulder",
// //       "Back",
// //     ],
// //     Sleeves: [
// //       "Sleeve Length",
// //       "Sleeve Round",
// //       "Sleeve End",
// //     ],
// //     Neck: [
// //       "Collar",
// //       "Front Neck",
// //       "Back Neck",
// //     ],
// //     Length: ["Shirt Length"],
// //   },

// //   Pant: {
// //     "Upper Part": ["Waist", "Seat (Hip)"],
// //     Legs: ["Thigh", "Knee", "Calf", "Bottom"],
// //     Length: ["Full Length", "Inside Length", "Seat Length"],
// //   },

// //   Kurta: {
// //     "Body Size": [
// //       "Chest",
// //       "Stomach (Pet)",
// //       "Seat (Hip)",
// //       "Shoulder",
// //     ],
// //     Sleeves: ["Sleeve Length", "Sleeve End"],
// //     Length: ["Kurta Length"],
// //   },

// //   Safari: {
// //     "Body Size": [
// //       "Chest",
// //       "Stomach (Pet)",
// //       "Seat (Hip)",
// //       "Shoulder",
// //     ],
// //     Sleeves: ["Sleeve Length", "Armhole"],
// //     Length: ["Safari Length"],
// //   },

// //   Coti: {
// //     "Body Size": [
// //       "Chest",
// //       "Stomach (Pet)",
// //       "Seat (Hip)",
// //       "Shoulder",
// //     ],
// //     Length: ["Coti Length"],
// //   },

// //   Blazer: {
// //     "Body Size": [
// //       "Chest",
// //       "Stomach (Pet)",
// //       "Seat (Hip)",
// //       "Shoulder",
// //       "Back",
// //     ],
// //     Sleeves: ["Sleeve Length", "Armhole"],
// //     Length: ["Blazer Length"],
// //   },

// //   Suit: {
// //     "Jacket Size": [
// //       "Chest",
// //       "Stomach (Pet)",
// //       "Seat (Hip)",
// //       "Shoulder",
// //       "Sleeve Length",
// //       "Back",
// //     ],
// //     "Pant Size": [
// //       "Waist",
// //       "Seat (Hip)",
// //       "Thigh",
// //       "Bottom",
// //       "Full Length",
// //     ],
// //   },
// // };

// // /* ---------------- SCREEN ---------------- */

// // export default function AddMeasurementScreen({ navigation, route }) {
// //   const { customerId } = route?.params || {};

// //   const [activeGarment, setActiveGarment] = useState("Shirt");
// //   const [data, setData] = useState({});
// //   const [pickerOpen, setPickerOpen] = useState(false);
// //   const [fitType, setFitType] = useState("Regular");

// //   /* 🔔 TOAST STATE (OVERLAY ONLY) */
// //   const [toastMsg, setToastMsg] = useState("");
// //   const toastAnim = useRef(new Animated.Value(300)).current;

// //   const showToast = (message) => {
// //     setToastMsg(message);

// //     Animated.timing(toastAnim, {
// //       toValue: 0,
// //       duration: 300,
// //       useNativeDriver: true,
// //     }).start();

// //     setTimeout(() => {
// //       Animated.timing(toastAnim, {
// //         toValue: 300,
// //         duration: 300,
// //         useNativeDriver: true,
// //       }).start(() => setToastMsg(""));
// //     }, 2000);
// //   };

// //   const updateValue = (field, value) => {
// //     setData((prev) => ({
// //       ...prev,
// //       [activeGarment]: {
// //         ...(prev[activeGarment] || {}),
// //         [field]: value,
// //       },
// //     }));
// //   };

// //   const applyFitPreset = (type) => {
// //     const offset = FIT_PRESETS[type];
// //     const updated = {};

// //     Object.values(MEASUREMENTS[activeGarment])
// //       .flat()
// //       .forEach((f) => {
// //         const base = parseFloat(data?.[activeGarment]?.[f] || 0);
// //         if (!isNaN(base)) {
// //           updated[f] = (base + offset).toFixed(1);
// //         }
// //       });

// //     setData((prev) => ({
// //       ...prev,
// //       [activeGarment]: {
// //         ...(prev[activeGarment] || {}),
// //         ...updated,
// //       },
// //     }));

// //     setFitType(type);
// //   };

// //   /* ✅ VALIDATION (LOGIC ONLY) */
// //   const allMeasurementsFilled = () => {
// //     const fields = Object.values(MEASUREMENTS[activeGarment]).flat();
// //     return fields.every(
// //       (f) =>
// //         data?.[activeGarment]?.[f] &&
// //         data[activeGarment][f].toString().trim() !== ""
// //     );
// //   };

// //   const handleSave = async () => {
// //     if (!allMeasurementsFilled()) {
// //       Alert.alert(
// //         "Incomplete",
// //         "Please fill all measurement fields"
// //       );
// //       return;
// //     }

// //     try {
// //       await addDoc(collection(db, "measurements"), {
// //         customerId,
// //         garment: activeGarment,
// //         fitType,
// //         values: data[activeGarment],
// //         createdAt: serverTimestamp(),
// //       });

// //       showToast("All measurements saved successfully");

// //       setTimeout(() => {
// //         navigation.navigate("Home");
// //       }, 800);
// //     } catch (error) {
// //       Alert.alert("Error", "Failed to save measurements");
// //     }
// //   };

// //   return (
// //     <SafeAreaView style={styles.safe}>
// //       {/* HEADER */}
// //       <View style={styles.header}>
// //         <TouchableOpacity onPress={() => navigation.goBack()}>
// //           <Ionicons name="arrow-back" size={22} color="#E5E7EB" />
// //         </TouchableOpacity>
// //         <Text style={styles.headerTitle}>Take Measurements</Text>
// //         <View style={{ width: 22 }} />
// //       </View>

// //       {/* GARMENT PICKER */}
// //       <TouchableOpacity
// //         style={styles.garmentPicker}
// //         onPress={() => setPickerOpen(true)}
// //       >
// //         <Text style={styles.smallLabel}>Garment</Text>
// //         <View style={styles.rowBetween}>
// //           <Text style={styles.valueText}>{activeGarment}</Text>
// //           <Ionicons name="chevron-down" size={18} color="#94A3B8" />
// //         </View>
// //       </TouchableOpacity>

// //       {/* FIT PRESET */}
// //       <View style={styles.fitRow}>
// //         {Object.keys(FIT_PRESETS).map((f) => (
// //           <TouchableOpacity
// //             key={f}
// //             style={[
// //               styles.fitChip,
// //               fitType === f && styles.fitChipActive,
// //             ]}
// //             onPress={() => applyFitPreset(f)}
// //           >
// //             <Text
// //               style={[
// //                 styles.fitText,
// //                 fitType === f && styles.fitTextActive,
// //               ]}
// //             >
// //               {f}
// //             </Text>
// //           </TouchableOpacity>
// //         ))}
// //       </View>

// //       {/* FORM */}
// //       <ScrollView contentContainerStyle={styles.form}>
// //         {Object.entries(MEASUREMENTS[activeGarment]).map(
// //           ([section, fields]) => (
// //             <View key={section} style={styles.card}>
// //               <Text style={styles.cardTitle}>{section}</Text>
// //               <View style={styles.divider} />

// //               {fields.map((field) => (
// //                 <View key={field} style={styles.measureRow}>
// //                   <Text style={styles.measureLabel}>{field}</Text>

// //                   <View style={styles.measureInputWrap}>
// //                     <TextInput
// //                       style={styles.measureInput}
// //                       keyboardType="numeric"
// //                       placeholder="0"
// //                       placeholderTextColor="#64748B"
// //                       value={data?.[activeGarment]?.[field] || ""}
// //                       onChangeText={(v) => updateValue(field, v)}
// //                     />
// //                     <Text style={styles.unit}>in</Text>
// //                   </View>
// //                 </View>
// //               ))}
// //             </View>
// //           )
// //         )}
// //       </ScrollView>

// //       {/* SAVE */}
// //       <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
// //         <Text style={styles.saveText}>Save Measurements</Text>
// //       </TouchableOpacity>

// //       {/* GARMENT MODAL */}
// //       <Modal transparent visible={pickerOpen} animationType="slide">
// //         <View style={styles.modalBg}>
// //           <View style={styles.modalCard}>
// //             <Text style={styles.modalTitle}>Select Garment</Text>
// //             {GARMENTS.map((g) => (
// //               <TouchableOpacity
// //                 key={g}
// //                 style={styles.modalItem}
// //                 onPress={() => {
// //                   setActiveGarment(g);
// //                   setPickerOpen(false);
// //                 }}
// //               >
// //                 <Text style={styles.modalText}>{g}</Text>
// //               </TouchableOpacity>
// //             ))}
// //           </View>
// //         </View>
// //       </Modal>

// //       {/* 🔔 SLIDING TOAST (OVERLAY, NOT UI CHANGE) */}
// //       {toastMsg !== "" && (
// //         <Animated.View
// //           style={{
// //             position: "absolute",
// //             top: 50,
// //             right: 20,
// //             backgroundColor: "#111827",
// //             paddingVertical: 12,
// //             paddingHorizontal: 18,
// //             borderRadius: 20,
// //             transform: [{ translateX: toastAnim }],
// //           }}
// //         >
// //           <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>
// //             {toastMsg}
// //           </Text>
// //         </Animated.View>
// //       )}
// //     </SafeAreaView>
// //   );
// // }

// // /* ---------------- STYLES ---------------- */

// // const styles = StyleSheet.create({
// //   safe: { flex: 1, backgroundColor: "#0B1121" },

// //   header: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     padding: 20,
// //   },
// //   headerTitle: {
// //     color: "#FFFFFF",
// //     fontSize: 18,
// //     fontWeight: "700",
// //   },

// //   garmentPicker: {
// //     marginHorizontal: 16,
// //     marginBottom: 10,
// //     padding: 14,
// //     borderRadius: 16,
// //     backgroundColor: "#151E32",
// //     borderWidth: 1,
// //     borderColor: "#1E293B",
// //   },
// //   smallLabel: { color: "#94A3B8", fontSize: 11 },
// //   rowBetween: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //   },
// //   valueText: { color: "#E2E8F0", fontSize: 16 },

// //   fitRow: {
// //     flexDirection: "row",
// //     justifyContent: "space-around",
// //     marginBottom: 10,
// //   },
// //   fitChip: {
// //     paddingHorizontal: 18,
// //     paddingVertical: 10,
// //     borderRadius: 20,
// //     backgroundColor: "#1E293B",
// //   },
// //   fitChipActive: {
// //     backgroundColor: "#2563EB",
// //   },
// //   fitText: { color: "#CBD5E1", fontWeight: "600" },
// //   fitTextActive: { color: "#FFFFFF" },

// //   form: { padding: 16, paddingBottom: 120 },

// //   card: {
// //     backgroundColor: "#151E32",
// //     borderRadius: 18,
// //     padding: 16,
// //     marginBottom: 16,
// //     borderWidth: 1,
// //     borderColor: "#1E293B",
// //   },
// //   cardTitle: {
// //     color: "#E2E8F0",
// //     fontSize: 15,
// //     fontWeight: "700",
// //   },
// //   divider: {
// //     height: 1,
// //     backgroundColor: "#1E293B",
// //     marginVertical: 10,
// //   },

// //   measureRow: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     marginBottom: 12,
// //   },
// //   measureLabel: {
// //     flex: 1,
// //     color: "#CBD5E1",
// //     fontSize: 14,
// //     paddingRight: 8,
// //   },
// //   measureInputWrap: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     backgroundColor: "#0F172A",
// //     borderRadius: 12,
// //     borderWidth: 1,
// //     borderColor: "#1E293B",
// //     paddingHorizontal: 10,
// //     width: 120,
// //     height: 42,
// //   },
// //   measureInput: {
// //     flex: 1,
// //     color: "#FFFFFF",
// //     fontSize: 15,
// //     textAlign: "center",
// //   },
// //   unit: {
// //     color: "#94A3B8",
// //     fontSize: 12,
// //     marginLeft: 4,
// //   },

// //   saveBtn: {
// //     position: "absolute",
// //     bottom: 20,
// //     left: 20,
// //     right: 20,
// //     backgroundColor: "#2563EB",
// //     paddingVertical: 16,
// //     borderRadius: 16,
// //     alignItems: "center",
// //   },
// //   saveText: {
// //     color: "#FFFFFF",
// //     fontSize: 16,
// //     fontWeight: "700",
// //   },

// //   modalBg: {
// //     flex: 1,
// //     backgroundColor: "rgba(0,0,0,0.6)",
// //     justifyContent: "flex-end",
// //   },
// //   modalCard: {
// //     backgroundColor: "#0F172A",
// //     padding: 20,
// //     borderTopLeftRadius: 20,
// //     borderTopRightRadius: 20,
// //   },
// //   modalTitle: {
// //     color: "#FFFFFF",
// //     fontSize: 16,
// //     fontWeight: "700",
// //     marginBottom: 10,
// //   },
// //   modalItem: {
// //     paddingVertical: 14,
// //     borderBottomWidth: 1,
// //     borderBottomColor: "#1E293B",
// //   },
// //   modalText: {
// //     color: "#CBD5E1",
// //     fontSize: 15,
// //   },
// // });

// import React, { useState, useRef, useEffect } from "react";
// import { db } from "../firebaseConfig";

// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   TextInput,
//   Modal,
//   Alert,
//   Animated,
//   Dimensions,
//   Vibration,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import { addDoc, collection, serverTimestamp, query, where, getDocs, orderBy, limit } from "firebase/firestore";

// const { width } = Dimensions.get("window");

// /* ---------------- DATA ---------------- */

// const GARMENTS = [
//   { name: "Shirt", icon: "shirt-outline", color: "#3B82F6" },
//   { name: "Pant", icon: "fitness-outline", color: "#8B5CF6" },
//   { name: "Kurta", icon: "body-outline", color: "#EC4899" },
//   { name: "Safari", icon: "briefcase-outline", color: "#F59E0B" },
//   { name: "Coti", icon: "layers-outline", color: "#10B981" },
//   { name: "Blazer", icon: "diamond-outline", color: "#EF4444" },
//   { name: "Suit", icon: "ribbon-outline", color: "#6366F1" },
// ];

// const FIT_PRESETS = {
//   Slim: { offset: -0.5, icon: "remove-circle-outline", color: "#EF4444" },
//   Regular: { offset: 0, icon: "checkmark-circle-outline", color: "#10B981" },
//   Loose: { offset: 0.5, icon: "add-circle-outline", color: "#3B82F6" },
// };

// const MEASUREMENTS = {
//   Shirt: {
//     "Body Size": ["Chest", "Stomach (Pet)", "Seat (Hip)", "Shoulder", "Back"],
//     Sleeves: ["Sleeve Length", "Sleeve Round", "Sleeve End"],
//     Neck: ["Collar", "Front Neck", "Back Neck"],
//     Length: ["Shirt Length"],
//   },
//   Pant: {
//     "Upper Part": ["Waist", "Seat (Hip)"],
//     Legs: ["Thigh", "Knee", "Calf", "Bottom"],
//     Length: ["Full Length", "Inside Length", "Seat Length"],
//   },
//   Kurta: {
//     "Body Size": ["Chest", "Stomach (Pet)", "Seat (Hip)", "Shoulder"],
//     Sleeves: ["Sleeve Length", "Sleeve End"],
//     Length: ["Kurta Length"],
//   },
//   Safari: {
//     "Body Size": ["Chest", "Stomach (Pet)", "Seat (Hip)", "Shoulder"],
//     Sleeves: ["Sleeve Length", "Armhole"],
//     Length: ["Safari Length"],
//   },
//   Coti: {
//     "Body Size": ["Chest", "Stomach (Pet)", "Seat (Hip)", "Shoulder"],
//     Length: ["Coti Length"],
//   },
//   Blazer: {
//     "Body Size": ["Chest", "Stomach (Pet)", "Seat (Hip)", "Shoulder", "Back"],
//     Sleeves: ["Sleeve Length", "Armhole"],
//     Length: ["Blazer Length"],
//   },
//   Suit: {
//     "Jacket Size": ["Chest", "Stomach (Pet)", "Seat (Hip)", "Shoulder", "Sleeve Length", "Back"],
//     "Pant Size": ["Waist", "Seat (Hip)", "Thigh", "Bottom", "Full Length"],
//   },
// };

// // Validation ranges (min-max in inches)
// const VALIDATION_RANGES = {
//   Chest: [30, 60],
//   "Stomach (Pet)": [28, 58],
//   "Seat (Hip)": [32, 62],
//   Shoulder: [14, 24],
//   Back: [15, 22],
//   "Sleeve Length": [20, 36],
//   "Sleeve Round": [12, 20],
//   "Sleeve End": [8, 14],
//   Collar: [13, 20],
//   "Front Neck": [6, 12],
//   "Back Neck": [6, 12],
//   "Shirt Length": [26, 36],
//   Waist: [26, 50],
//   Thigh: [18, 32],
//   Knee: [14, 22],
//   Calf: [12, 20],
//   Bottom: [10, 18],
//   "Full Length": [36, 48],
//   "Inside Length": [28, 40],
//   "Seat Length": [10, 18],
//   "Kurta Length": [36, 48],
//   Armhole: [16, 24],
//   "Safari Length": [28, 36],
//   "Coti Length": [36, 48],
//   "Blazer Length": [26, 34],
// };

// /* ---------------- COMPONENT ---------------- */

// export default function AddMeasurementScreen({ navigation, route }) {
//   const { customerId } = route?.params || {};

//   const [activeGarment, setActiveGarment] = useState("Shirt");
//   const [data, setData] = useState({});
//   const [pickerOpen, setPickerOpen] = useState(false);
//   const [fitType, setFitType] = useState("Regular");
//   const [notes, setNotes] = useState("");
//   const [focusedField, setFocusedField] = useState(null);
//   const [previousMeasurements, setPreviousMeasurements] = useState(null);
//   const [showPreviousModal, setShowPreviousModal] = useState(false);

//   // Animations
//   const [toastMsg, setToastMsg] = useState("");
//   const toastAnim = useRef(new Animated.Value(300)).current;
//   const garmentAnim = useRef(new Animated.Value(0)).current;
//   const progressAnim = useRef(new Animated.Value(0)).current;

//   // Load previous measurements
//   useEffect(() => {
//     loadPreviousMeasurements();
//   }, [customerId, activeGarment]);

//   // Update progress animation
//   useEffect(() => {
//     const progress = calculateProgress();
//     Animated.timing(progressAnim, {
//       toValue: progress,
//       duration: 300,
//       useNativeDriver: false,
//     }).start();
//   }, [data, activeGarment]);

//   const loadPreviousMeasurements = async () => {
//     if (!customerId) return;
    
//     try {
//       const q = query(
//         collection(db, "measurements"),
//         where("customerId", "==", customerId),
//         where("garment", "==", activeGarment),
//         orderBy("createdAt", "desc"),
//         limit(1)
//       );
      
//       const snapshot = await getDocs(q);
//       if (!snapshot.empty) {
//         setPreviousMeasurements(snapshot.docs[0].data());
//       } else {
//         setPreviousMeasurements(null);
//       }
//     } catch (error) {
//       console.log("No previous measurements found");
//     }
//   };

//   const calculateProgress = () => {
//     const fields = Object.values(MEASUREMENTS[activeGarment]).flat();
//     const filled = fields.filter(
//       (f) => data?.[activeGarment]?.[f] && data[activeGarment][f].toString().trim() !== ""
//     ).length;
//     return (filled / fields.length) * 100;
//   };

//   const showToast = (message, isError = false) => {
//     Vibration.vibrate(50);
//     setToastMsg({ text: message, isError });

//     Animated.sequence([
//       Animated.timing(toastAnim, {
//         toValue: 0,
//         duration: 300,
//         useNativeDriver: true,
//       }),
//       Animated.delay(2000),
//       Animated.timing(toastAnim, {
//         toValue: 300,
//         duration: 300,
//         useNativeDriver: true,
//       }),
//     ]).start(() => setToastMsg(""));
//   };

//   const updateValue = (field, value) => {
//     // Validate input
//     if (value && !/^\d*\.?\d*$/.test(value)) return;

//     setData((prev) => ({
//       ...prev,
//       [activeGarment]: {
//         ...(prev[activeGarment] || {}),
//         [field]: value,
//       },
//     }));

//     // Validate range
//     if (value && VALIDATION_RANGES[field]) {
//       const numValue = parseFloat(value);
//       const [min, max] = VALIDATION_RANGES[field];
//       if (numValue < min || numValue > max) {
//         showToast(`${field}: Expected ${min}-${max} inches`, true);
//       }
//     }
//   };

//   const incrementValue = (field, amount) => {
//     Vibration.vibrate(30);
//     const current = parseFloat(data?.[activeGarment]?.[field] || 0);
//     const newValue = Math.max(0, current + amount).toFixed(1);
//     updateValue(field, newValue);
//   };

//   const applyFitPreset = (type) => {
//     Vibration.vibrate(50);
//     const offset = FIT_PRESETS[type].offset;
//     const updated = {};

//     Object.values(MEASUREMENTS[activeGarment])
//       .flat()
//       .forEach((f) => {
//         const base = parseFloat(data?.[activeGarment]?.[f] || 0);
//         if (!isNaN(base) && base > 0) {
//           updated[f] = (base + offset).toFixed(1);
//         }
//       });

//     setData((prev) => ({
//       ...prev,
//       [activeGarment]: {
//         ...(prev[activeGarment] || {}),
//         ...updated,
//       },
//     }));

//     setFitType(type);
//     showToast(`${type} fit applied`);
//   };

//   const loadPreviousData = () => {
//     if (previousMeasurements) {
//       setData((prev) => ({
//         ...prev,
//         [activeGarment]: previousMeasurements.values,
//       }));
//       setFitType(previousMeasurements.fitType || "Regular");
//       setShowPreviousModal(false);
//       showToast("Previous measurements loaded");
//     }
//   };

//   const changeGarment = (garmentName) => {
//     Animated.sequence([
//       Animated.timing(garmentAnim, {
//         toValue: 1,
//         duration: 150,
//         useNativeDriver: true,
//       }),
//       Animated.timing(garmentAnim, {
//         toValue: 0,
//         duration: 150,
//         useNativeDriver: true,
//       }),
//     ]).start();

//     setActiveGarment(garmentName);
//     setPickerOpen(false);
//     Vibration.vibrate(40);
//   };

//   const allMeasurementsFilled = () => {
//     const fields = Object.values(MEASUREMENTS[activeGarment]).flat();
//     return fields.every(
//       (f) =>
//         data?.[activeGarment]?.[f] &&
//         data[activeGarment][f].toString().trim() !== ""
//     );
//   };

//   const handleSave = async () => {
//     if (!allMeasurementsFilled()) {
//       Alert.alert("Incomplete", "Please fill all measurement fields");
//       return;
//     }

//     Vibration.vibrate([50, 100, 50]);

//     try {
//       await addDoc(collection(db, "measurements"), {
//         customerId,
//         garment: activeGarment,
//         fitType,
//         values: data[activeGarment],
//         notes: notes || "",
//         createdAt: serverTimestamp(),
//       });

//       showToast("✓ Measurements saved successfully");

//       setTimeout(() => {
//         navigation.goBack();
//       }, 1000);
//     } catch (error) {
//       showToast("Failed to save measurements", true);
//     }
//   };

//   const currentGarment = GARMENTS.find((g) => g.name === activeGarment);
//   const progress = calculateProgress();

//   return (
//     <SafeAreaView style={styles.safe}>
//       {/* HEADER */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
//           <Ionicons name="arrow-back" size={22} color="#E5E7EB" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Measurements</Text>
//         <TouchableOpacity
//           onPress={() => previousMeasurements && setShowPreviousModal(true)}
//           style={styles.historyBtn}
//         >
//           <Ionicons
//             name="time-outline"
//             size={22}
//             color={previousMeasurements ? "#3B82F6" : "#475569"}
//           />
//         </TouchableOpacity>
//       </View>

//       {/* PROGRESS BAR */}
//       <View style={styles.progressContainer}>
//         <View style={styles.progressBar}>
//           <Animated.View
//             style={[
//               styles.progressFill,
//               {
//                 width: progressAnim.interpolate({
//                   inputRange: [0, 100],
//                   outputRange: ["0%", "100%"],
//                 }),
//                 backgroundColor:
//                   progress === 100 ? "#10B981" : progress > 50 ? "#3B82F6" : "#F59E0B",
//               },
//             ]}
//           />
//         </View>
//         <Text style={styles.progressText}>
//           {Math.round(progress)}% Complete • {Object.values(MEASUREMENTS[activeGarment]).flat().length} fields
//         </Text>
//       </View>

//       {/* GARMENT PICKER */}
//       <TouchableOpacity
//         style={[styles.garmentPicker, { borderColor: currentGarment?.color }]}
//         onPress={() => setPickerOpen(true)}
//         activeOpacity={0.7}
//       >
//         <View style={styles.garmentPickerContent}>
//           <View style={[styles.iconCircle, { backgroundColor: currentGarment?.color + "20" }]}>
//             <Ionicons name={currentGarment?.icon} size={24} color={currentGarment?.color} />
//           </View>
//           <View style={styles.garmentInfo}>
//             <Text style={styles.smallLabel}>Selected Garment</Text>
//             <Text style={styles.valueText}>{activeGarment}</Text>
//           </View>
//           <Ionicons name="chevron-down" size={20} color="#94A3B8" />
//         </View>
//       </TouchableOpacity>

//       {/* FIT PRESET */}
//       <View style={styles.fitRow}>
//         {Object.entries(FIT_PRESETS).map(([type, config]) => (
//           <TouchableOpacity
//             key={type}
//             style={[
//               styles.fitChip,
//               fitType === type && [styles.fitChipActive, { backgroundColor: config.color }],
//             ]}
//             onPress={() => applyFitPreset(type)}
//             activeOpacity={0.7}
//           >
//             <Ionicons
//               name={config.icon}
//               size={18}
//               color={fitType === type ? "#FFFFFF" : "#94A3B8"}
//             />
//             <Text style={[styles.fitText, fitType === type && styles.fitTextActive]}>
//               {type}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* FORM */}
//       <Animated.View
//         style={[
//           styles.formContainer,
//           {
//             opacity: garmentAnim.interpolate({
//               inputRange: [0, 1],
//               outputRange: [1, 0.3],
//             }),
//           },
//         ]}
//       >
//         <ScrollView
//           contentContainerStyle={styles.form}
//           showsVerticalScrollIndicator={false}
//         >
//           {Object.entries(MEASUREMENTS[activeGarment]).map(([section, fields]) => (
//             <View key={section} style={styles.card}>
//               <View style={styles.cardHeader}>
//                 <Text style={styles.cardTitle}>{section}</Text>
//                 <View style={styles.badge}>
//                   <Text style={styles.badgeText}>
//                     {fields.filter((f) => data?.[activeGarment]?.[f]).length}/{fields.length}
//                   </Text>
//                 </View>
//               </View>
//               <View style={styles.divider} />

//               {fields.map((field, idx) => {
//                 const value = data?.[activeGarment]?.[field] || "";
//                 const isFilled = value && value.toString().trim() !== "";
//                 const isFocused = focusedField === field;

//                 return (
//                   <View
//                     key={field}
//                     style={[
//                       styles.measureRow,
//                       isFocused && styles.measureRowFocused,
//                     ]}
//                   >
//                     <View style={styles.measureLabelContainer}>
//                       <View
//                         style={[
//                           styles.measureDot,
//                           isFilled && styles.measureDotFilled,
//                         ]}
//                       />
//                       <Text style={styles.measureLabel}>{field}</Text>
//                     </View>

//                     <View style={styles.measureControls}>
//                       <TouchableOpacity
//                         style={styles.incrementBtn}
//                         onPress={() => incrementValue(field, -0.5)}
//                         activeOpacity={0.7}
//                       >
//                         <Ionicons name="remove" size={16} color="#64748B" />
//                       </TouchableOpacity>

//                       <View
//                         style={[
//                           styles.measureInputWrap,
//                           isFocused && styles.measureInputWrapFocused,
//                         ]}
//                       >
//                         <TextInput
//                           style={styles.measureInput}
//                           keyboardType="decimal-pad"
//                           placeholder="0.0"
//                           placeholderTextColor="#475569"
//                           value={value}
//                           onChangeText={(v) => updateValue(field, v)}
//                           onFocus={() => setFocusedField(field)}
//                           onBlur={() => setFocusedField(null)}
//                         />
//                         <Text style={styles.unit}>in</Text>
//                       </View>

//                       <TouchableOpacity
//                         style={styles.incrementBtn}
//                         onPress={() => incrementValue(field, 0.5)}
//                         activeOpacity={0.7}
//                       >
//                         <Ionicons name="add" size={16} color="#64748B" />
//                       </TouchableOpacity>
//                     </View>
//                   </View>
//                 );
//               })}
//             </View>
//           ))}

//           {/* NOTES SECTION */}
//           <View style={styles.card}>
//             <Text style={styles.cardTitle}>Additional Notes</Text>
//             <View style={styles.divider} />
//             <TextInput
//               style={styles.notesInput}
//               placeholder="Add any special instructions or remarks..."
//               placeholderTextColor="#64748B"
//               multiline
//               numberOfLines={3}
//               value={notes}
//               onChangeText={setNotes}
//               textAlignVertical="top"
//             />
//           </View>

//           <View style={{ height: 100 }} />
//         </ScrollView>
//       </Animated.View>

//       {/* SAVE BUTTON */}
//       <View style={styles.saveContainer}>
//         <TouchableOpacity
//           style={[
//             styles.saveBtn,
//             progress === 100 && styles.saveBtnReady,
//           ]}
//           onPress={handleSave}
//           activeOpacity={0.8}
//         >
//           <Ionicons
//             name={progress === 100 ? "checkmark-circle" : "save-outline"}
//             size={22}
//             color="#FFFFFF"
//           />
//           <Text style={styles.saveText}>
//             {progress === 100 ? "Save & Continue" : "Save Measurements"}
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* GARMENT MODAL */}
//       <Modal
//         transparent
//         visible={pickerOpen}
//         animationType="slide"
//         onRequestClose={() => setPickerOpen(false)}
//       >
//         <TouchableOpacity
//           style={styles.modalBg}
//           activeOpacity={1}
//           onPress={() => setPickerOpen(false)}
//         >
//           <View style={styles.modalCard}>
//             <View style={styles.modalHandle} />
//             <Text style={styles.modalTitle}>Select Garment Type</Text>

//             <ScrollView showsVerticalScrollIndicator={false}>
//               {GARMENTS.map((garment) => (
//                 <TouchableOpacity
//                   key={garment.name}
//                   style={[
//                     styles.modalItem,
//                     activeGarment === garment.name && styles.modalItemActive,
//                   ]}
//                   onPress={() => changeGarment(garment.name)}
//                   activeOpacity={0.7}
//                 >
//                   <View style={[styles.modalIconCircle, { backgroundColor: garment.color + "20" }]}>
//                     <Ionicons name={garment.icon} size={22} color={garment.color} />
//                   </View>
//                   <Text
//                     style={[
//                       styles.modalText,
//                       activeGarment === garment.name && styles.modalTextActive,
//                     ]}
//                   >
//                     {garment.name}
//                   </Text>
//                   {activeGarment === garment.name && (
//                     <Ionicons name="checkmark-circle" size={22} color={garment.color} />
//                   )}
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           </View>
//         </TouchableOpacity>
//       </Modal>

//       {/* PREVIOUS MEASUREMENTS MODAL */}
//       <Modal
//         transparent
//         visible={showPreviousModal}
//         animationType="fade"
//         onRequestClose={() => setShowPreviousModal(false)}
//       >
//         <TouchableOpacity
//           style={styles.modalBg}
//           activeOpacity={1}
//           onPress={() => setShowPreviousModal(false)}
//         >
//           <View style={styles.previousModal}>
//             <Ionicons name="time-outline" size={32} color="#3B82F6" />
//             <Text style={styles.previousTitle}>Load Previous Measurements?</Text>
//             <Text style={styles.previousSubtitle}>
//               Found saved {activeGarment} measurements for this customer
//             </Text>

//             <View style={styles.previousButtons}>
//               <TouchableOpacity
//                 style={styles.previousBtnCancel}
//                 onPress={() => setShowPreviousModal(false)}
//               >
//                 <Text style={styles.previousBtnTextCancel}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.previousBtnLoad}
//                 onPress={loadPreviousData}
//               >
//                 <Text style={styles.previousBtnTextLoad}>Load Data</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </TouchableOpacity>
//       </Modal>

//       {/* TOAST */}
//       {toastMsg && (
//         <Animated.View
//           style={[
//             styles.toast,
//             {
//               backgroundColor: toastMsg.isError ? "#DC2626" : "#059669",
//               transform: [{ translateX: toastAnim }],
//             },
//           ]}
//         >
//           <Ionicons
//             name={toastMsg.isError ? "alert-circle" : "checkmark-circle"}
//             size={20}
//             color="#FFFFFF"
//           />
//           <Text style={styles.toastText}>{toastMsg.text}</Text>
//         </Animated.View>
//       )}
//     </SafeAreaView>
//   );
// }

// /* ---------------- STYLES ---------------- */

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: "#0B0F1A" },

//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//   },
//   backBtn: {
//     width: 40,
//     height: 40,
//     borderRadius: 12,
//     backgroundColor: "#1E293B",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   historyBtn: {
//     width: 40,
//     height: 40,
//     borderRadius: 12,
//     backgroundColor: "#1E293B",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   headerTitle: {
//     color: "#FFFFFF",
//     fontSize: 20,
//     fontWeight: "700",
//     letterSpacing: 0.3,
//   },

//   progressContainer: {
//     paddingHorizontal: 20,
//     marginBottom: 16,
//   },
//   progressBar: {
//     height: 6,
//     backgroundColor: "#1E293B",
//     borderRadius: 10,
//     overflow: "hidden",
//     marginBottom: 8,
//   },
//   progressFill: {
//     height: "100%",
//     borderRadius: 10,
//   },
//   progressText: {
//     color: "#94A3B8",
//     fontSize: 12,
//     fontWeight: "600",
//   },

//   garmentPicker: {
//     marginHorizontal: 16,
//     marginBottom: 12,
//     padding: 16,
//     borderRadius: 18,
//     backgroundColor: "#151E32",
//     borderWidth: 2,
//   },
//   garmentPickerContent: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   iconCircle: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 12,
//   },
//   garmentInfo: {
//     flex: 1,
//   },
//   smallLabel: {
//     color: "#64748B",
//     fontSize: 11,
//     fontWeight: "600",
//     marginBottom: 2,
//     textTransform: "uppercase",
//     letterSpacing: 0.5,
//   },
//   valueText: {
//     color: "#E2E8F0",
//     fontSize: 18,
//     fontWeight: "700",
//   },

//   fitRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     marginBottom: 16,
//     gap: 8,
//   },
//   fitChip: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 12,
//     borderRadius: 14,
//     backgroundColor: "#1E293B",
//     gap: 6,
//   },
//   fitChipActive: {
//     backgroundColor: "#2563EB",
//     transform: [{ scale: 1.02 }],
//   },
//   fitText: {
//     color: "#94A3B8",
//     fontWeight: "700",
//     fontSize: 13,
//   },
//   fitTextActive: {
//     color: "#FFFFFF",
//   },

//   formContainer: {
//     flex: 1,
//   },
//   form: {
//     padding: 16,
//     paddingBottom: 120,
//   },

//   card: {
//     backgroundColor: "#151E32",
//     borderRadius: 20,
//     padding: 18,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: "#1E293B",
//   },
//   cardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   cardTitle: {
//     color: "#E2E8F0",
//     fontSize: 16,
//     fontWeight: "700",
//   },
//   badge: {
//     backgroundColor: "#1E293B",
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   badgeText: {
//     color: "#3B82F6",
//     fontSize: 12,
//     fontWeight: "700",
//   },
//   divider: {
//     height: 1,
//     backgroundColor: "#1E293B",
//     marginVertical: 12,
//   },

//   measureRow: {
//     marginBottom: 14,
//     padding: 12,
//     borderRadius: 12,
//     backgroundColor: "#0F1A2A",
//   },
//   measureRowFocused: {
//     backgroundColor: "#1E293B",
//     borderWidth: 1,
//     borderColor: "#3B82F6",
//   },
//   measureLabelContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   measureDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: "#334155",
//     marginRight: 10,
//   },
//   measureDotFilled: {
//     backgroundColor: "#10B981",
//   },
//   measureLabel: {
//     flex: 1,
//     color: "#CBD5E1",
//     fontSize: 14,
//     fontWeight: "600",
//   },

//   measureControls: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   incrementBtn: {
//     width: 36,
//     height: 36,
//     borderRadius: 10,
//     backgroundColor: "#1E293B",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   measureInputWrap: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#0B0F1A",
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#1E293B",
//     paddingHorizontal: 12,
//     height: 44,
//     flex: 1,
//     marginHorizontal: 8,
//   },
//   measureInputWrapFocused: {
//     borderColor: "#3B82F6",
//     backgroundColor: "#0F172A",
//   },
//   measureInput: {
//     flex: 1,
//     color: "#FFFFFF",
//     fontSize: 16,
//     fontWeight: "700",
//     textAlign: "center",
//   },
//   unit: {
//     color: "#64748B",
//     fontSize: 12,
//     fontWeight: "600",
//     marginLeft: 4,
//   },

//   notesInput: {
//     color: "#CBD5E1",
//     fontSize: 14,
//     minHeight: 80,
//     padding: 12,
//     backgroundColor: "#0F1A2A",
//     borderRadius: 12,
//   },

//   saveContainer: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     padding: 20,
//     paddingBottom: 30,
//     backgroundColor: "#0B0F1A",
//     borderTopWidth: 1,
//     borderTopColor: "#1E293B",
//   },
//   saveBtn: {
//     flexDirection: "row",
//     backgroundColor: "#2563EB",
//     paddingVertical: 18,
//     borderRadius: 16,
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 10,
//   },
//   saveBtnReady: {
//     backgroundColor: "#10B981",
//   },
//   saveText: {
//     color: "#FFFFFF",
//     fontSize: 16,
//     fontWeight: "700",
//   },

//   modalBg: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.7)",
//     justifyContent: "flex-end",
//   },
//   modalCard: {
//     backgroundColor: "#0F172A",
//     paddingTop: 10,
//     paddingBottom: 30,
//     paddingHorizontal: 20,
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//     maxHeight: "70%",
//   },
//   modalHandle: {
//     width: 40,
//     height: 4,
//     backgroundColor: "#334155",
//     borderRadius: 2,
//     alignSelf: "center",
//     marginBottom: 20,
//   },
//   modalTitle: {
//     color: "#FFFFFF",
//     fontSize: 18,
//     fontWeight: "700",
//     marginBottom: 16,
//   },
//   modalItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 16,
//     paddingHorizontal: 16,
//     borderRadius: 14,
//     marginBottom: 8,
//     backgroundColor: "#1E293B",
//   },
//   modalItemActive: {
//     backgroundColor: "#1E3A5F",
//   },
//   modalIconCircle: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 12,
//   },
//   modalText: {
//     flex: 1,
//     color: "#CBD5E1",
//     fontSize: 15,
//     fontWeight: "600",
//   },
//   modalTextActive: {
//     color: "#FFFFFF",
//     fontWeight: "700",
//   },

//   previousModal: {
//     backgroundColor: "#0F172A",
//     marginHorizontal: 30,
//     padding: 24,
//     borderRadius: 24,
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#1E293B",
//   },
//   previousTitle: {
//     color: "#FFFFFF",
//     fontSize: 18,
//     fontWeight: "700",
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   previousSubtitle: {
//     color: "#94A3B8",
//     fontSize: 14,
//     textAlign: "center",
//     marginBottom: 24,
//   },
//   previousButtons: {
//     flexDirection: "row",
//     gap: 12,
//     width: "100%",
//   },
//   previousBtnCancel: {
//     flex: 1,
//     paddingVertical: 14,
//     borderRadius: 14,
//     backgroundColor: "#1E293B",
//     alignItems: "center",
//   },
//   previousBtnLoad: {
//     flex: 1,
//     paddingVertical: 14,
//     borderRadius: 14,
//     backgroundColor: "#3B82F6",
//     alignItems: "center",
//   },
//   previousBtnTextCancel: {
//     color: "#CBD5E1",
//     fontSize: 15,
//     fontWeight: "700",
//   },
//   previousBtnTextLoad: {
//     color: "#FFFFFF",
//     fontSize: 15,
//     fontWeight: "700",
//   },

//   toast: {
//     position: "absolute",
//     top: 60,
//     right: 20,
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 14,
//     paddingHorizontal: 18,
//     borderRadius: 16,
//     gap: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   toastText: {
//     color: "#FFFFFF",
//     fontWeight: "700",
//     fontSize: 14,
//   },
// });

import React, { useState, useRef, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  Animated,
  Dimensions,
  Vibration,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { addDoc, collection, serverTimestamp, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { useLanguage } from "../context/LanguageContext";
import { LanguageToggle } from "../context/LanguageToggle";

const { width } = Dimensions.get("window");

/* ---------------- DATA ---------------- */

const GARMENTS = [
  { name: "Shirt", icon: "shirt-outline", color: "#3B82F6" },
  { name: "Pant", icon: "fitness-outline", color: "#8B5CF6" },
  { name: "Kurta", icon: "body-outline", color: "#EC4899" },
  { name: "Safari", icon: "briefcase-outline", color: "#F59E0B" },
  { name: "Coti", icon: "layers-outline", color: "#10B981" },
  { name: "Blazer", icon: "diamond-outline", color: "#EF4444" },
  { name: "Suit", icon: "ribbon-outline", color: "#6366F1" },
];

const FIT_PRESETS = {
  Slim: { offset: -0.5, icon: "remove-circle-outline", color: "#EF4444" },
  Regular: { offset: 0, icon: "checkmark-circle-outline", color: "#10B981" },
  Loose: { offset: 0.5, icon: "add-circle-outline", color: "#3B82F6" },
};

const MEASUREMENTS = {
  Shirt: {
    "Body Size": ["Chest", "Stomach (Pet)", "Seat (Hip)", "Shoulder", "Back"],
    Sleeves: ["Sleeve Length", "Sleeve Round", "Sleeve End"],
    Neck: ["Collar", "Front Neck", "Back Neck"],
    Length: ["Shirt Length"],
  },
  Pant: {
    "Upper Part": ["Waist", "Seat (Hip)"],
    Legs: ["Thigh", "Knee", "Calf", "Bottom"],
    Length: ["Full Length", "Inside Length", "Seat Length"],
  },
  Kurta: {
    "Body Size": ["Chest", "Stomach (Pet)", "Seat (Hip)", "Shoulder"],
    Sleeves: ["Sleeve Length", "Sleeve End"],
    Length: ["Kurta Length"],
  },
  Safari: {
    "Body Size": ["Chest", "Stomach (Pet)", "Seat (Hip)", "Shoulder"],
    Sleeves: ["Sleeve Length", "Armhole"],
    Length: ["Safari Length"],
  },
  Coti: {
    "Body Size": ["Chest", "Stomach (Pet)", "Seat (Hip)", "Shoulder"],
    Length: ["Coti Length"],
  },
  Blazer: {
    "Body Size": ["Chest", "Stomach (Pet)", "Seat (Hip)", "Shoulder", "Back"],
    Sleeves: ["Sleeve Length", "Armhole"],
    Length: ["Blazer Length"],
  },
  Suit: {
    "Jacket Size": ["Chest", "Stomach (Pet)", "Seat (Hip)", "Shoulder", "Sleeve Length", "Back"],
    "Pant Size": ["Waist", "Seat (Hip)", "Thigh", "Bottom", "Full Length"],
  },
};

// Validation ranges (min-max in inches)
const VALIDATION_RANGES = {
  Chest: [30, 60],
  "Stomach (Pet)": [28, 58],
  "Seat (Hip)": [32, 62],
  Shoulder: [14, 24],
  Back: [15, 22],
  "Sleeve Length": [20, 36],
  "Sleeve Round": [12, 20],
  "Sleeve End": [8, 14],
  Collar: [13, 20],
  "Front Neck": [6, 12],
  "Back Neck": [6, 12],
  "Shirt Length": [26, 36],
  Waist: [26, 50],
  Thigh: [18, 32],
  Knee: [14, 22],
  Calf: [12, 20],
  Bottom: [10, 18],
  "Full Length": [36, 48],
  "Inside Length": [28, 40],
  "Seat Length": [10, 18],
  "Kurta Length": [36, 48],
  Armhole: [16, 24],
  "Safari Length": [28, 36],
  "Coti Length": [36, 48],
  "Blazer Length": [26, 34],
};

/* ---------------- COMPONENT ---------------- */

export default function AddMeasurementScreen({ navigation, route }) {
  const { customerId } = route?.params || {};
  const { t } = useLanguage();

  const [activeGarment, setActiveGarment] = useState("Shirt");
  const [data, setData] = useState({});
  const [pickerOpen, setPickerOpen] = useState(false);
  const [fitType, setFitType] = useState("Regular");
  const [notes, setNotes] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  const [previousMeasurements, setPreviousMeasurements] = useState(null);
  const [showPreviousModal, setShowPreviousModal] = useState(false);

  // Animations
  const [toastMsg, setToastMsg] = useState("");
  const toastAnim = useRef(new Animated.Value(300)).current;
  const garmentAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Load previous measurements
  useEffect(() => {
    loadPreviousMeasurements();
  }, [customerId, activeGarment]);

  // Update progress animation
  useEffect(() => {
    const progress = calculateProgress();
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [data, activeGarment]);

  const loadPreviousMeasurements = async () => {
    if (!customerId) return;
    
    try {
      const q = query(
        collection(db, "measurements"),
        where("customerId", "==", customerId),
        where("garment", "==", activeGarment),
        orderBy("createdAt", "desc"),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setPreviousMeasurements(snapshot.docs[0].data());
      } else {
        setPreviousMeasurements(null);
      }
    } catch (error) {
      console.log("No previous measurements found");
    }
  };

  const calculateProgress = () => {
    const fields = Object.values(MEASUREMENTS[activeGarment]).flat();
    const filled = fields.filter(
      (f) => data?.[activeGarment]?.[f] && data[activeGarment][f].toString().trim() !== ""
    ).length;
    return (filled / fields.length) * 100;
  };

  const showToast = (message, isError = false) => {
    Vibration.vibrate(50);
    setToastMsg({ text: message, isError });

    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(toastAnim, {
        toValue: 300,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setToastMsg(""));
  };

  const updateValue = (field, value) => {
    // Validate input
    if (value && !/^\d*\.?\d*$/.test(value)) return;

    setData((prev) => ({
      ...prev,
      [activeGarment]: {
        ...(prev[activeGarment] || {}),
        [field]: value,
      },
    }));

    // Validate range
    if (value && VALIDATION_RANGES[field]) {
      const numValue = parseFloat(value);
      const [min, max] = VALIDATION_RANGES[field];
      if (numValue < min || numValue > max) {
        showToast(`${field}: Expected ${min}-${max} inches`, true);
      }
    }
  };

  const incrementValue = (field, amount) => {
    Vibration.vibrate(30);
    const current = parseFloat(data?.[activeGarment]?.[field] || 0);
    const newValue = Math.max(0, current + amount).toFixed(1);
    updateValue(field, newValue);
  };

  const applyFitPreset = (type) => {
    Vibration.vibrate(50);
    const offset = FIT_PRESETS[type].offset;
    const updated = {};

    Object.values(MEASUREMENTS[activeGarment])
      .flat()
      .forEach((f) => {
        const base = parseFloat(data?.[activeGarment]?.[f] || 0);
        if (!isNaN(base) && base > 0) {
          updated[f] = (base + offset).toFixed(1);
        }
      });

    setData((prev) => ({
      ...prev,
      [activeGarment]: {
        ...(prev[activeGarment] || {}),
        ...updated,
      },
    }));

    setFitType(type);
    showToast(`${type} ${t.fitApplied}`);
  };

  const loadPreviousData = () => {
    if (previousMeasurements) {
      setData((prev) => ({
        ...prev,
        [activeGarment]: previousMeasurements.values,
      }));
      setFitType(previousMeasurements.fitType || "Regular");
      setShowPreviousModal(false);
      showToast(t.previousLoaded);
    }
  };

  const changeGarment = (garmentName) => {
    Animated.sequence([
      Animated.timing(garmentAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(garmentAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setActiveGarment(garmentName);
    setPickerOpen(false);
    Vibration.vibrate(40);
  };

  const allMeasurementsFilled = () => {
    const fields = Object.values(MEASUREMENTS[activeGarment]).flat();
    return fields.every(
      (f) =>
        data?.[activeGarment]?.[f] &&
        data[activeGarment][f].toString().trim() !== ""
    );
  };

  const handleSave = async () => {
    if (!allMeasurementsFilled()) {
      Alert.alert(t.incomplete, t.fillAllFields);
      return;
    }

    Vibration.vibrate([50, 100, 50]);

    try {
      await addDoc(collection(db, "measurements"), {
        customerId,
        garment: activeGarment,
        fitType,
        values: data[activeGarment],
        notes: notes || "",
        createdAt: serverTimestamp(),
      });

      showToast("✓ " + t.savedSuccessfully);

      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error) {
      showToast(t.failedToSave, true);
    }
  };

  const currentGarment = GARMENTS.find((g) => g.name === activeGarment);
  const progress = calculateProgress();

  // Get translated fit type names
  const getFitTypeName = (type) => {
    if (type === "Slim") return t.slim;
    if (type === "Loose") return t.loose;
    return t.regular;
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#E5E7EB" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.measurements}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <LanguageToggle />
          <TouchableOpacity
            onPress={() => previousMeasurements && setShowPreviousModal(true)}
            style={styles.historyBtn}
          >
            <Ionicons
              name="time-outline"
              size={22}
              color={previousMeasurements ? "#3B82F6" : "#475569"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* PROGRESS BAR */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ["0%", "100%"],
                }),
                backgroundColor:
                  progress === 100 ? "#10B981" : progress > 50 ? "#3B82F6" : "#F59E0B",
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round(progress)}% Complete • {Object.values(MEASUREMENTS[activeGarment]).flat().length} fields
        </Text>
      </View>

      {/* GARMENT PICKER */}
      <TouchableOpacity
        style={[styles.garmentPicker, { borderColor: currentGarment?.color }]}
        onPress={() => setPickerOpen(true)}
        activeOpacity={0.7}
      >
        <View style={styles.garmentPickerContent}>
          <View style={[styles.iconCircle, { backgroundColor: currentGarment?.color + "20" }]}>
            <Ionicons name={currentGarment?.icon} size={24} color={currentGarment?.color} />
          </View>
          <View style={styles.garmentInfo}>
            <Text style={styles.smallLabel}>{t.selectedGarment}</Text>
            <Text style={styles.valueText}>{activeGarment}</Text>
          </View>
          <Ionicons name="chevron-down" size={20} color="#94A3B8" />
        </View>
      </TouchableOpacity>

      {/* FIT PRESET */}
      <View style={styles.fitRow}>
        {Object.entries(FIT_PRESETS).map(([type, config]) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.fitChip,
              fitType === type && [styles.fitChipActive, { backgroundColor: config.color }],
            ]}
            onPress={() => applyFitPreset(type)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={config.icon}
              size={18}
              color={fitType === type ? "#FFFFFF" : "#94A3B8"}
            />
            <Text style={[styles.fitText, fitType === type && styles.fitTextActive]}>
              {getFitTypeName(type)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* FORM */}
      <Animated.View
        style={[
          styles.formContainer,
          {
            opacity: garmentAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0.3],
            }),
          },
        ]}
      >
        <ScrollView
          contentContainerStyle={styles.form}
          showsVerticalScrollIndicator={false}
        >
          {Object.entries(MEASUREMENTS[activeGarment]).map(([section, fields]) => (
            <View key={section} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{section}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {fields.filter((f) => data?.[activeGarment]?.[f]).length}/{fields.length}
                  </Text>
                </View>
              </View>
              <View style={styles.divider} />

              {fields.map((field, idx) => {
                const value = data?.[activeGarment]?.[field] || "";
                const isFilled = value && value.toString().trim() !== "";
                const isFocused = focusedField === field;

                return (
                  <View
                    key={field}
                    style={[
                      styles.measureRow,
                      isFocused && styles.measureRowFocused,
                    ]}
                  >
                    <View style={styles.measureLabelContainer}>
                      <View
                        style={[
                          styles.measureDot,
                          isFilled && styles.measureDotFilled,
                        ]}
                      />
                      <Text style={styles.measureLabel}>{field}</Text>
                    </View>

                    <View style={styles.measureControls}>
                      <TouchableOpacity
                        style={styles.incrementBtn}
                        onPress={() => incrementValue(field, -0.5)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="remove" size={16} color="#64748B" />
                      </TouchableOpacity>

                      <View
                        style={[
                          styles.measureInputWrap,
                          isFocused && styles.measureInputWrapFocused,
                        ]}
                      >
                        <TextInput
                          style={styles.measureInput}
                          keyboardType="decimal-pad"
                          placeholder="0.0"
                          placeholderTextColor="#475569"
                          value={value}
                          onChangeText={(v) => updateValue(field, v)}
                          onFocus={() => setFocusedField(field)}
                          onBlur={() => setFocusedField(null)}
                        />
                        <Text style={styles.unit}>in</Text>
                      </View>

                      <TouchableOpacity
                        style={styles.incrementBtn}
                        onPress={() => incrementValue(field, 0.5)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="add" size={16} color="#64748B" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}

          {/* NOTES SECTION */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t.additionalNotes}</Text>
            <View style={styles.divider} />
            <TextInput
              style={styles.notesInput}
              placeholder={t.addNotesPlaceholder}
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
              textAlignVertical="top"
            />
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

      {/* SAVE BUTTON */}
      <View style={styles.saveContainer}>
        <TouchableOpacity
          style={[
            styles.saveBtn,
            progress === 100 && styles.saveBtnReady,
          ]}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Ionicons
            name={progress === 100 ? "checkmark-circle" : "save-outline"}
            size={22}
            color="#FFFFFF"
          />
          <Text style={styles.saveText}>
            {progress === 100 ? t.saveAndContinue : t.saveMeasurements}
          </Text>
        </TouchableOpacity>
      </View>

      {/* GARMENT MODAL */}
      <Modal
        transparent
        visible={pickerOpen}
        animationType="slide"
        onRequestClose={() => setPickerOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalBg}
          activeOpacity={1}
          onPress={() => setPickerOpen(false)}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Garment Type</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {GARMENTS.map((garment) => (
                <TouchableOpacity
                  key={garment.name}
                  style={[
                    styles.modalItem,
                    activeGarment === garment.name && styles.modalItemActive,
                  ]}
                  onPress={() => changeGarment(garment.name)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.modalIconCircle, { backgroundColor: garment.color + "20" }]}>
                    <Ionicons name={garment.icon} size={22} color={garment.color} />
                  </View>
                  <Text
                    style={[
                      styles.modalText,
                      activeGarment === garment.name && styles.modalTextActive,
                    ]}
                  >
                    {garment.name}
                  </Text>
                  {activeGarment === garment.name && (
                    <Ionicons name="checkmark-circle" size={22} color={garment.color} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* PREVIOUS MEASUREMENTS MODAL */}
      <Modal
        transparent
        visible={showPreviousModal}
        animationType="fade"
        onRequestClose={() => setShowPreviousModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBg}
          activeOpacity={1}
          onPress={() => setShowPreviousModal(false)}
        >
          <View style={styles.previousModal}>
            <Ionicons name="time-outline" size={32} color="#3B82F6" />
            <Text style={styles.previousTitle}>{t.loadPrevious}</Text>
            <Text style={styles.previousSubtitle}>
              {t.foundSaved} {activeGarment}
            </Text>

            <View style={styles.previousButtons}>
              <TouchableOpacity
                style={styles.previousBtnCancel}
                onPress={() => setShowPreviousModal(false)}
              >
                <Text style={styles.previousBtnTextCancel}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.previousBtnLoad}
                onPress={loadPreviousData}
              >
                <Text style={styles.previousBtnTextLoad}>{t.loadData}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* TOAST */}
      {toastMsg && (
        <Animated.View
          style={[
            styles.toast,
            {
              backgroundColor: toastMsg.isError ? "#DC2626" : "#059669",
              transform: [{ translateX: toastAnim }],
            },
          ]}
        >
          <Ionicons
            name={toastMsg.isError ? "alert-circle" : "checkmark-circle"}
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.toastText}>{toastMsg.text}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

/* ---------------- STYLES (ALL YOUR ORIGINAL STYLES) ---------------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B0F1A" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
  },
  historyBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#1E293B",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 10,
  },
  progressText: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
  },

  garmentPicker: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#151E32",
    borderWidth: 2,
  },
  garmentPickerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  garmentInfo: {
    flex: 1,
  },
  smallLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  valueText: {
    color: "#E2E8F0",
    fontSize: 18,
    fontWeight: "700",
  },

  fitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  fitChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#1E293B",
    gap: 6,
  },
  fitChipActive: {
    backgroundColor: "#2563EB",
    transform: [{ scale: 1.02 }],
  },
  fitText: {
    color: "#94A3B8",
    fontWeight: "700",
    fontSize: 13,
  },
  fitTextActive: {
    color: "#FFFFFF",
  },

  formContainer: {
    flex: 1,
  },
  form: {
    padding: 16,
    paddingBottom: 120,
  },

  card: {
    backgroundColor: "#151E32",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    color: "#E2E8F0",
    fontSize: 16,
    fontWeight: "700",
  },
  badge: {
    backgroundColor: "#1E293B",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#3B82F6",
    fontSize: 12,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#1E293B",
    marginVertical: 12,
  },

  measureRow: {
    marginBottom: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#0F1A2A",
  },
  measureRowFocused: {
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "#3B82F6",
  },
  measureLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  measureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#334155",
    marginRight: 10,
  },
  measureDotFilled: {
    backgroundColor: "#10B981",
  },
  measureLabel: {
    flex: 1,
    color: "#CBD5E1",
    fontSize: 14,
    fontWeight: "600",
  },

  measureControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  incrementBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
  },
  measureInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0B0F1A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1E293B",
    paddingHorizontal: 12,
    height: 44,
    flex: 1,
    marginHorizontal: 8,
  },
  measureInputWrapFocused: {
    borderColor: "#3B82F6",
    backgroundColor: "#0F172A",
  },
  measureInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  unit: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },

  notesInput: {
    color: "#CBD5E1",
    fontSize: 14,
    minHeight: 80,
    padding: 12,
    backgroundColor: "#0F1A2A",
    borderRadius: 12,
  },

  saveContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 30,
    backgroundColor: "#0B0F1A",
    borderTopWidth: 1,
    borderTopColor: "#1E293B",
  },
  saveBtn: {
    flexDirection: "row",
    backgroundColor: "#2563EB",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  saveBtnReady: {
    backgroundColor: "#10B981",
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#0F172A",
    paddingTop: 10,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: "70%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#334155",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 8,
    backgroundColor: "#1E293B",
  },
  modalItemActive: {
    backgroundColor: "#1E3A5F",
  },
  modalIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  modalText: {
    flex: 1,
    color: "#CBD5E1",
    fontSize: 15,
    fontWeight: "600",
  },
  modalTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  previousModal: {
    backgroundColor: "#0F172A",
    marginHorizontal: 30,
    padding: 24,
    borderRadius: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  previousTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  previousSubtitle: {
    color: "#94A3B8",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  previousButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  previousBtnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#1E293B",
    alignItems: "center",
  },
  previousBtnLoad: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#3B82F6",
    alignItems: "center",
  },
  previousBtnTextCancel: {
    color: "#CBD5E1",
    fontSize: 15,
    fontWeight: "700",
  },
  previousBtnTextLoad: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  toast: {
    position: "absolute",
    top: 60,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
});