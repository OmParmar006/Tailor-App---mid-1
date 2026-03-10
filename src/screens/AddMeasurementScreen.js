import React, { useState, useRef, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Modal, Alert, Animated, Dimensions,
  Vibration, StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  addDoc, collection, serverTimestamp,
  query, where, getDocs, orderBy, limit,
  updateDoc, doc,
} from "firebase/firestore";
import { useLanguage } from "../context/LanguageContext";
import { LanguageToggle } from "../context/LanguageToggle";

const { width } = Dimensions.get("window");

const C = {
  bg: "#F2F3F7", card: "#FFFFFF", primary: "#3B82F6",
  green: "#A3E635", text: "#1C1C1E", sub: "#6B7280",
  border: "#E5E7EB", inputBg: "#F8F9FB", danger: "#EF4444",
  success: "#22C55E", amber: "#F59E0B",
};

const GARMENTS = [
  { name:"Shirt",  icon:"shirt-outline",     color:"#3B82F6" },
  { name:"Pant",   icon:"fitness-outline",   color:"#8B5CF6" },
  { name:"Kurta",  icon:"body-outline",      color:"#EC4899" },
  { name:"Safari", icon:"briefcase-outline", color:"#F59E0B" },
  { name:"Coti",   icon:"layers-outline",    color:"#10B981" },
  { name:"Blazer", icon:"diamond-outline",   color:"#EF4444" },
  { name:"Suit",   icon:"ribbon-outline",    color:"#6366F1" },
];

const FIT_PRESETS = {
  Slim:    { offset:-0.5, icon:"remove-circle-outline",    color:"#EF4444" },
  Regular: { offset:0,    icon:"checkmark-circle-outline", color:"#10B981" },
  Loose:   { offset:0.5,  icon:"add-circle-outline",       color:"#3B82F6" },
};

const MEASUREMENTS = {
  Shirt: {
    "Body Size": ["Chest","Stomach (Pet)","Seat (Hip)","Shoulder","Back"],
    Sleeves:     ["Sleeve Length","Sleeve Round","Sleeve End"],
    Neck:        ["Collar","Front Neck","Back Neck"],
    Length:      ["Shirt Length"],
  },
  Pant: {
    "Upper Part": ["Waist","Seat (Hip)"],
    Legs:         ["Thigh","Knee","Calf","Bottom"],
    Length:       ["Full Length","Inside Length","Seat Length"],
  },
  Kurta: {
    "Body Size": ["Chest","Stomach (Pet)","Seat (Hip)","Shoulder"],
    Sleeves:     ["Sleeve Length","Sleeve End"],
    Length:      ["Kurta Length"],
  },
  Safari: {
    "Body Size": ["Chest","Stomach (Pet)","Seat (Hip)","Shoulder"],
    Sleeves:     ["Sleeve Length","Armhole"],
    Length:      ["Safari Length"],
  },
  Coti: {
    "Body Size": ["Chest","Stomach (Pet)","Seat (Hip)","Shoulder"],
    Length:      ["Coti Length"],
  },
  Blazer: {
    "Body Size": ["Chest","Stomach (Pet)","Seat (Hip)","Shoulder","Back"],
    Sleeves:     ["Sleeve Length","Armhole"],
    Length:      ["Blazer Length"],
  },
  Suit: {
    "Jacket Size": ["Chest","Stomach (Pet)","Seat (Hip)","Shoulder","Sleeve Length","Back"],
    "Pant Size":   ["Waist","Seat (Hip)","Thigh","Bottom","Full Length"],
  },
};

const VALIDATION_RANGES = {
  Chest:[30,60],"Stomach (Pet)":[28,58],"Seat (Hip)":[32,62],
  Shoulder:[14,24],Back:[15,22],"Sleeve Length":[20,36],
  "Sleeve Round":[12,20],"Sleeve End":[8,14],Collar:[13,20],
  "Front Neck":[6,12],"Back Neck":[6,12],"Shirt Length":[26,36],
  Waist:[26,50],Thigh:[18,32],Knee:[14,22],Calf:[12,20],
  Bottom:[10,18],"Full Length":[36,48],"Inside Length":[28,40],
  "Seat Length":[10,18],"Kurta Length":[36,48],Armhole:[16,24],
  "Safari Length":[28,36],"Coti Length":[36,48],"Blazer Length":[26,34],
};

// BUG 9 FIX: robust updateDoc with retry
const updateOrderWithRetry = async (orderId, data, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await updateDoc(doc(db, "orders", orderId), data);
      return true;
    } catch (e) {
      console.warn(`updateOrder attempt ${attempt}/${retries} failed:`, e.message);
      if (attempt === retries) {
        console.error("updateOrder permanently failed after retries:", e);
        return false;
      }
      await new Promise((res) => setTimeout(res, 400 * attempt));
    }
  }
  return false;
};

export default function AddMeasurementScreen({ navigation, route }) {
  const { customerId, orderId, orderRefId, customerName } = route?.params || {};
  const { t } = useLanguage();

  const editMode        = route?.params?.editMode || false;
  const measurementId   = route?.params?.measurementId;
  const measurementData = route?.params?.measurementData;

  const [activeGarment,       setActiveGarment]       = useState("Shirt");
  const [data,                setData]                = useState({});
  const [pickerOpen,          setPickerOpen]          = useState(false);
  const [fitType,             setFitType]             = useState("Regular");
  const [notes,               setNotes]               = useState("");
  const [focusedField,        setFocusedField]        = useState(null);
  const [previousMeasurements,setPreviousMeasurements]= useState(null);
  const [showPreviousModal,   setShowPreviousModal]   = useState(false);
  const [toastMsg,            setToastMsg]            = useState("");

  const toastAnim    = useRef(new Animated.Value(300)).current;
  const garmentAnim  = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue:1, duration:260, useNativeDriver:true }).start();
  }, []);

  useEffect(() => {
    if (editMode && measurementData) {
      setActiveGarment(measurementData.garment);
      setFitType(measurementData.fitType || "Regular");
      setNotes(measurementData.notes || "");
      if (measurementData.values) setData({ [measurementData.garment]: measurementData.values });
    }
  }, [editMode, measurementData]);

  useEffect(() => {
    if (!editMode) loadPreviousMeasurements();
  }, [customerId, activeGarment, editMode]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: calculateProgress(), duration:300, useNativeDriver:false,
    }).start();
  }, [data, activeGarment]);

  const loadPreviousMeasurements = async () => {
    if (!customerId) return;
    try {
      const q    = query(
        collection(db, "measurements"),
        where("customerId","==",customerId),
        where("garment","==",activeGarment),
        orderBy("createdAt","desc"), limit(1)
      );
      const snap = await getDocs(q);
      setPreviousMeasurements(snap.empty ? null : snap.docs[0].data());
    } catch (e) { console.log(e); }
  };

  const calculateProgress = () => {
    const fields = Object.values(MEASUREMENTS[activeGarment]).flat();
    const filled = fields.filter(
      (f) => data?.[activeGarment]?.[f] && data[activeGarment][f].toString().trim() !== ""
    ).length;
    return (filled / fields.length) * 100;
  };

  const showToast = (msg, isError = false) => {
    Vibration.vibrate(40);
    setToastMsg({ text: msg, isError });
    Animated.sequence([
      Animated.timing(toastAnim, { toValue:0,   duration:280, useNativeDriver:true }),
      Animated.delay(2000),
      Animated.timing(toastAnim, { toValue:300, duration:280, useNativeDriver:true }),
    ]).start(() => setToastMsg(""));
  };

  const updateValue = (field, value) => {
    if (value && !/^\d*\.?\d*$/.test(value)) return;
    setData((p) => ({
      ...p, [activeGarment]: { ...(p[activeGarment]||{}), [field]: value },
    }));
    if (value && VALIDATION_RANGES[field]) {
      const num = parseFloat(value);
      const [min, max] = VALIDATION_RANGES[field];
      if (num < min || num > max) showToast(`${field}: Expected ${min}–${max} in`, true);
    }
  };

  const incrementValue = (field, amt) => {
    Vibration.vibrate(25);
    const cur = parseFloat(data?.[activeGarment]?.[field] || 0);
    updateValue(field, Math.max(0, cur + amt).toFixed(1));
  };

  const applyFitPreset = (type) => {
    Vibration.vibrate(40);
    const offset  = FIT_PRESETS[type].offset;
    const updated = {};
    Object.values(MEASUREMENTS[activeGarment]).flat().forEach((f) => {
      const b = parseFloat(data?.[activeGarment]?.[f] || 0);
      if (!isNaN(b) && b > 0) updated[f] = (b + offset).toFixed(1);
    });
    setData((p) => ({ ...p, [activeGarment]: { ...(p[activeGarment]||{}), ...updated } }));
    setFitType(type);
    showToast(`${type} fit applied`);
  };

  const loadPreviousData = () => {
    if (previousMeasurements) {
      setData((p) => ({ ...p, [activeGarment]: previousMeasurements.values }));
      setFitType(previousMeasurements.fitType || "Regular");
      setShowPreviousModal(false);
      showToast("Previous measurements loaded");
    }
  };

  const changeGarment = (name) => {
    Animated.sequence([
      Animated.timing(garmentAnim, { toValue:1, duration:130, useNativeDriver:true }),
      Animated.timing(garmentAnim, { toValue:0, duration:130, useNativeDriver:true }),
    ]).start();
    setActiveGarment(name); setPickerOpen(false); Vibration.vibrate(35);
  };

  const allFilled = () =>
    Object.values(MEASUREMENTS[activeGarment]).flat().every(
      (f) => data?.[activeGarment]?.[f] && data[activeGarment][f].toString().trim() !== ""
    );

  // BUG 9 FIX: robust save with proper error handling and stage update
  const handleSave = async () => {
    if (!allFilled()) {
      Alert.alert("Incomplete", "Please fill all measurement fields"); return;
    }
    Vibration.vibrate([40, 80, 40]);
    try {
      if (editMode) {
        await updateDoc(doc(db, "measurements", measurementId), {
          garment:   activeGarment,
          fitType,
          values:    data[activeGarment],
          notes:     notes || "",
          updatedAt: serverTimestamp(),
        });
        showToast("✓ Measurement updated");
      } else {
        // Save measurement
        await addDoc(collection(db, "measurements"), {
          customerId,
          orderId:    orderId || null,
          orderRefId: orderRefId || null,
          garment:    activeGarment,
          fitType,
          values:     data[activeGarment],
          notes:      notes || "",
          createdAt:  serverTimestamp(),
        });

        // BUG 9 FIX: update order stage with retry, log failure clearly
        if (orderId) {
          const updated = await updateOrderWithRetry(orderId, {
            stage:   "Stitching",
            garment: activeGarment,
          });
          if (!updated) {
            // Non-blocking warning — measurement is already saved
            console.warn(`Order ${orderId} stage update failed — measurement saved successfully`);
          }
        }

        showToast("✓ Measurements saved");
      }
      setTimeout(() => navigation.navigate("Home"), 900);
    } catch (e) {
      console.error("handleSave failed:", e);
      showToast("Failed to save", true);
    }
  };

  const currentGarment = GARMENTS.find((g) => g.name === activeGarment);
  const progress       = calculateProgress();

  return (
    <View style={S.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <View style={S.blob1} /><View style={S.blob2} />

      <SafeAreaView style={{ flex: 1 }} edges={["top","bottom"]}>

        {/* ── Header ── */}
        <Animated.View style={[S.header, { opacity: fadeAnim }]}>
          <TouchableOpacity style={S.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={21} color={C.text} />
          </TouchableOpacity>
          <View style={{ flex:1, alignItems:"center" }}>
            <Text style={S.headerTitle}>
              {editMode ? "Edit Measurement" : t?.measurements || "Measurements"}
            </Text>
            {(customerName || orderRefId) && (
              <View style={{ flexDirection:"row", gap:6, marginTop:3 }}>
                {customerName && (
                  <View style={S.headerBadge}>
                    <Ionicons name="person-outline" size={10} color={C.sub} />
                    <Text style={S.headerBadgeTxt}>{customerName}</Text>
                  </View>
                )}
                {orderRefId && (
                  <View style={[S.headerBadge, { backgroundColor:C.primary+"12" }]}>
                    <Text style={[S.headerBadgeTxt, { color:C.primary }]}>{orderRefId}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
          <View style={{ flexDirection:"row", gap:8, alignItems:"center" }}>
            <LanguageToggle />
            {!editMode && (
              <TouchableOpacity
                style={[S.iconBtn, previousMeasurements && { borderColor:C.primary }]}
                onPress={() => previousMeasurements && setShowPreviousModal(true)}>
                <Ionicons name="time-outline" size={20} color={previousMeasurements ? C.primary : C.sub} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* ── Progress bar ── */}
        <Animated.View style={[S.progressWrap, { opacity:fadeAnim }]}>
          <View style={{ flexDirection:"row", justifyContent:"space-between", marginBottom:6 }}>
            <Text style={S.progressTxt}>
              {Math.round(progress)}% Complete
              <Text style={{ color:C.sub }}> · {Object.values(MEASUREMENTS[activeGarment]).flat().length} fields</Text>
            </Text>
            {progress === 100 && (
              <View style={S.progressDoneBadge}>
                <Ionicons name="checkmark" size={10} color="#FFF" />
                <Text style={{ color:"#FFF", fontSize:10, fontWeight:"800" }}>All Filled</Text>
              </View>
            )}
          </View>
          <View style={S.progressTrack}>
            <Animated.View style={[S.progressFill, {
              width: progressAnim.interpolate({ inputRange:[0,100], outputRange:["0%","100%"] }),
              backgroundColor: progress===100 ? C.success : progress>50 ? C.primary : C.amber,
            }]}/>
          </View>
        </Animated.View>

        {/* ── Garment picker ── */}
        <Animated.View style={{ opacity:fadeAnim }}>
          <TouchableOpacity
            style={[S.garmentPicker, { borderColor:currentGarment?.color+"60" }]}
            onPress={() => !editMode && setPickerOpen(true)}
            activeOpacity={editMode ? 1 : 0.75}>
            <View style={[S.garmentIcon, { backgroundColor:currentGarment?.color+"18" }]}>
              <Ionicons name={currentGarment?.icon} size={24} color={currentGarment?.color} />
            </View>
            <View style={{ flex:1 }}>
              <Text style={S.garmentLabel}>{editMode ? "Garment (locked)" : t?.selectedGarment || "Selected Garment"}</Text>
              <Text style={S.garmentName}>{activeGarment}</Text>
            </View>
            {!editMode && (
              <View style={[S.garmentChangeBtn, { backgroundColor:currentGarment?.color+"15" }]}>
                <Ionicons name="chevron-down" size={16} color={currentGarment?.color} />
                <Text style={[S.garmentChangeTxt, { color:currentGarment?.color }]}>Change</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* ── Fit presets ── */}
        <Animated.View style={[S.fitRow, { opacity:fadeAnim }]}>
          <Text style={S.fitLabel}>Fit Type:</Text>
          {Object.entries(FIT_PRESETS).map(([type, cfg]) => {
            const active = fitType === type;
            return (
              <TouchableOpacity key={type}
                style={[S.fitChip, active && { backgroundColor:cfg.color, borderColor:cfg.color }]}
                onPress={() => applyFitPreset(type)} activeOpacity={0.75}>
                <Ionicons name={cfg.icon} size={15} color={active?"#FFF":C.sub}/>
                <Text style={[S.fitTxt, active && { color:"#FFF" }]}>{type}</Text>
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        {/* ── Measurement form ── */}
        <Animated.View style={[{ flex:1 }, {
          opacity: garmentAnim.interpolate({ inputRange:[0,1], outputRange:[1,0.25] }),
        }]}>
          <ScrollView contentContainerStyle={S.form} showsVerticalScrollIndicator={false}>
            {Object.entries(MEASUREMENTS[activeGarment]).map(([section, fields]) => (
              <View key={section} style={S.card}>
                <View style={S.cardHeader}>
                  <Text style={S.cardTitle}>{section}</Text>
                  <View style={[S.badge, {
                    backgroundColor: fields.filter((f)=>data?.[activeGarment]?.[f]).length===fields.length
                      ? C.success+"15" : "#EFF6FF"
                  }]}>
                    <Text style={[S.badgeTxt, {
                      color: fields.filter((f)=>data?.[activeGarment]?.[f]).length===fields.length
                        ? C.success : C.primary
                    }]}>
                      {fields.filter((f)=>data?.[activeGarment]?.[f]).length}/{fields.length}
                    </Text>
                  </View>
                </View>
                <View style={S.divider}/>
                {fields.map((field) => {
                  const value    = data?.[activeGarment]?.[field] || "";
                  const isFilled = value && value.toString().trim() !== "";
                  const isFocused= focusedField === field;
                  return (
                    <View key={field} style={[S.measureRow, isFocused&&S.measureRowFocused, isFilled&&S.measureRowFilled]}>
                      <View style={S.measureLabelRow}>
                        <View style={[S.dot, isFilled&&S.dotFilled]}/>
                        <Text style={[S.measureLabel, isFilled&&S.measureLabelFilled]}>{field}</Text>
                        {isFilled && <Text style={S.measureValuePreview}>{value} in</Text>}
                      </View>
                      <View style={S.controls}>
                        <TouchableOpacity style={S.incBtn} onPress={() => incrementValue(field,-0.5)}>
                          <Ionicons name="remove" size={16} color={C.sub}/>
                        </TouchableOpacity>
                        <View style={[S.inputWrap, isFocused&&S.inputWrapFocused]}>
                          <TextInput style={S.measureInput} keyboardType="decimal-pad"
                            placeholder="0.0" placeholderTextColor="#C4C9D4"
                            value={value} onChangeText={(v) => updateValue(field,v)}
                            onFocus={() => setFocusedField(field)}
                            onBlur={()  => setFocusedField(null)}/>
                          <Text style={S.unit}>in</Text>
                        </View>
                        <TouchableOpacity style={S.incBtn} onPress={() => incrementValue(field,0.5)}>
                          <Ionicons name="add" size={16} color={C.sub}/>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}

            {/* Notes */}
            <View style={S.card}>
              <Text style={S.cardTitle}>{t?.additionalNotes || "Additional Notes"}</Text>
              <View style={S.divider}/>
              <TextInput style={S.notesInput}
                placeholder={t?.addNotesPlaceholder || "Add special instructions..."}
                placeholderTextColor="#9CA3AF" multiline numberOfLines={3}
                value={notes} onChangeText={setNotes} textAlignVertical="top"/>
            </View>
            <View style={{ height:110 }}/>
          </ScrollView>
        </Animated.View>

        {/* ── Save button ── */}
        <View style={S.footer}>
          {!allFilled() && (
            <View style={S.fillHint}>
              <Ionicons name="information-circle-outline" size={14} color={C.sub}/>
              <Text style={S.fillHintTxt}>
                {Object.values(MEASUREMENTS[activeGarment]).flat().filter(
                  (f) => !data?.[activeGarment]?.[f]
                ).length} fields remaining
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={[S.saveBtn, progress===100 && S.saveBtnReady]}
            onPress={handleSave} activeOpacity={0.9}>
            <Ionicons name={progress===100?"checkmark-circle":"save-outline"} size={21} color="#FFF"/>
            <Text style={S.saveTxt}>
              {editMode
                ? (progress===100 ? "Update Measurement" : "Fill all fields")
                : (progress===100 ? t?.saveAndContinue||"Save & Continue" : t?.saveMeasurements||"Save Measurements")}
            </Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>

      {/* ── Garment picker modal ── */}
      <Modal transparent visible={pickerOpen && !editMode} animationType="slide"
        onRequestClose={() => setPickerOpen(false)}>
        <TouchableOpacity style={S.modalBg} activeOpacity={1} onPress={() => setPickerOpen(false)}>
          <View style={S.modalCard}>
            <View style={S.modalHandle}/>
            <Text style={S.modalTitle}>Select Garment Type</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {GARMENTS.map((g) => (
                <TouchableOpacity key={g.name}
                  style={[S.modalItem, activeGarment===g.name && S.modalItemActive]}
                  onPress={() => changeGarment(g.name)} activeOpacity={0.7}>
                  <View style={[S.modalIconCircle, { backgroundColor:g.color+"18" }]}>
                    <Ionicons name={g.icon} size={21} color={g.color}/>
                  </View>
                  <Text style={[S.modalItemTxt, activeGarment===g.name && S.modalItemTxtActive]}>
                    {g.name}
                  </Text>
                  {activeGarment===g.name && <Ionicons name="checkmark-circle" size={20} color={g.color}/>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Previous measurements modal ── */}
      {!editMode && (
        <Modal transparent visible={showPreviousModal} animationType="fade"
          onRequestClose={() => setShowPreviousModal(false)}>
          <TouchableOpacity style={S.modalBg} activeOpacity={1} onPress={() => setShowPreviousModal(false)}>
            <View style={S.prevModal}>
              <View style={S.prevIconWrap}>
                <Ionicons name="time-outline" size={28} color={C.primary}/>
              </View>
              <Text style={S.prevTitle}>Load Previous Measurements?</Text>
              <Text style={S.prevSub}>Found saved {activeGarment} data for this customer</Text>
              {previousMeasurements?.fitType && (
                <View style={S.prevFitBadge}>
                  <Text style={S.prevFitBadgeTxt}>Fit: {previousMeasurements.fitType}</Text>
                </View>
              )}
              <View style={S.prevBtns}>
                <TouchableOpacity style={S.prevBtnCancel} onPress={() => setShowPreviousModal(false)}>
                  <Text style={S.prevBtnCancelTxt}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={S.prevBtnLoad} onPress={loadPreviousData}>
                  <Ionicons name="download-outline" size={16} color="#FFF"/>
                  <Text style={S.prevBtnLoadTxt}>Load Data</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* ── Toast ── */}
      {!!toastMsg && (
        <Animated.View style={[S.toast, {
          backgroundColor: toastMsg.isError ? C.danger : C.success,
          transform: [{ translateX: toastAnim }],
        }]}>
          <Ionicons name={toastMsg.isError?"alert-circle":"checkmark-circle"} size={18} color="#FFF"/>
          <Text style={S.toastTxt}>{toastMsg.text}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const S = StyleSheet.create({
  root:     {flex:1,backgroundColor:C.bg},
  blob1:    {position:"absolute",top:-60,right:-40,width:200,height:200,borderRadius:100,backgroundColor:"rgba(59,130,246,0.06)"},
  blob2:    {position:"absolute",bottom:-40,left:-30,width:160,height:160,borderRadius:80,backgroundColor:"rgba(163,230,53,0.05)"},

  header:   {flexDirection:"row",alignItems:"center",justifyContent:"space-between",paddingHorizontal:18,paddingVertical:12},
  iconBtn:  {width:40,height:40,borderRadius:12,backgroundColor:C.card,borderWidth:1,borderColor:C.border,justifyContent:"center",alignItems:"center",shadowColor:"#000",shadowOffset:{width:0,height:1},shadowOpacity:0.05,shadowRadius:4,elevation:2},
  headerTitle:{fontSize:17,fontWeight:"900",color:C.text,letterSpacing:-0.4},
  headerBadge:{flexDirection:"row",alignItems:"center",gap:4,backgroundColor:C.border,paddingHorizontal:8,paddingVertical:3,borderRadius:20},
  headerBadgeTxt:{fontSize:10,fontWeight:"700",color:C.sub},

  progressWrap:{paddingHorizontal:18,marginBottom:12},
  progressTrack:{height:7,backgroundColor:"#E5E7EB",borderRadius:10,overflow:"hidden"},
  progressFill:{height:"100%",borderRadius:10},
  progressTxt:{fontSize:12,color:C.text,fontWeight:"700"},
  progressDoneBadge:{flexDirection:"row",alignItems:"center",gap:4,backgroundColor:C.success,paddingHorizontal:8,paddingVertical:3,borderRadius:20},

  garmentPicker:{flexDirection:"row",alignItems:"center",marginHorizontal:18,marginBottom:12,backgroundColor:C.card,borderRadius:16,padding:14,borderWidth:1.5,shadowColor:"#000",shadowOffset:{width:0,height:2},shadowOpacity:0.04,shadowRadius:8,elevation:2,gap:12},
  garmentIcon:{width:46,height:46,borderRadius:14,justifyContent:"center",alignItems:"center"},
  garmentLabel:{fontSize:10,color:C.sub,fontWeight:"700",textTransform:"uppercase",letterSpacing:0.5,marginBottom:2},
  garmentName:{fontSize:17,fontWeight:"800",color:C.text},
  garmentChangeBtn:{flexDirection:"row",alignItems:"center",gap:4,paddingHorizontal:10,paddingVertical:7,borderRadius:10},
  garmentChangeTxt:{fontSize:12,fontWeight:"700"},

  fitRow:   {flexDirection:"row",paddingHorizontal:18,marginBottom:14,gap:8,alignItems:"center"},
  fitLabel: {fontSize:11,fontWeight:"700",color:C.sub,textTransform:"uppercase",letterSpacing:0.4},
  fitChip:  {flex:1,flexDirection:"row",alignItems:"center",justifyContent:"center",paddingVertical:10,borderRadius:12,backgroundColor:C.card,borderWidth:1.5,borderColor:C.border,gap:5,shadowColor:"#000",shadowOffset:{width:0,height:1},shadowOpacity:0.03,shadowRadius:4,elevation:1},
  fitTxt:   {color:C.sub,fontWeight:"700",fontSize:12},

  form:     {paddingHorizontal:18,paddingTop:4,paddingBottom:20},
  card:     {backgroundColor:C.card,borderRadius:18,padding:16,marginBottom:14,borderWidth:1,borderColor:C.border,shadowColor:"#000",shadowOffset:{width:0,height:2},shadowOpacity:0.04,shadowRadius:8,elevation:2},
  cardHeader:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},
  cardTitle:{fontSize:15,fontWeight:"800",color:C.text},
  badge:    {paddingHorizontal:10,paddingVertical:4,borderRadius:20},
  badgeTxt: {fontSize:12,fontWeight:"800"},
  divider:  {height:1,backgroundColor:C.border,marginVertical:12},

  measureRow:{marginBottom:10,padding:11,borderRadius:12,backgroundColor:C.inputBg,borderWidth:1,borderColor:"transparent"},
  measureRowFocused:{borderColor:C.primary,backgroundColor:"#EFF6FF"},
  measureRowFilled:{borderColor:C.success+"30"},
  measureLabelRow:{flexDirection:"row",alignItems:"center",marginBottom:9,gap:8},
  dot:      {width:7,height:7,borderRadius:3.5,backgroundColor:C.border},
  dotFilled:{backgroundColor:C.success},
  measureLabel:{flex:1,fontSize:13,color:C.sub,fontWeight:"600"},
  measureLabelFilled:{color:C.text},
  measureValuePreview:{fontSize:11,color:C.primary,fontWeight:"700"},

  controls: {flexDirection:"row",alignItems:"center"},
  incBtn:   {width:36,height:36,borderRadius:11,backgroundColor:C.card,borderWidth:1,borderColor:C.border,justifyContent:"center",alignItems:"center",shadowColor:"#000",shadowOffset:{width:0,height:1},shadowOpacity:0.04,shadowRadius:3,elevation:1},
  inputWrap:{flexDirection:"row",alignItems:"center",backgroundColor:C.card,borderRadius:11,borderWidth:1.5,borderColor:C.border,paddingHorizontal:10,height:42,flex:1,marginHorizontal:8},
  inputWrapFocused:{borderColor:C.primary},
  measureInput:{flex:1,color:C.text,fontSize:15,fontWeight:"700",textAlign:"center"},
  unit:     {color:C.sub,fontSize:12,fontWeight:"600",marginLeft:4},

  notesInput:{color:C.text,fontSize:14,fontWeight:"500",minHeight:72,backgroundColor:C.inputBg,padding:10,borderRadius:10},

  footer:   {position:"absolute",bottom:0,left:0,right:0,padding:16,paddingBottom:20,backgroundColor:C.bg,borderTopWidth:1,borderTopColor:C.border},
  fillHint: {flexDirection:"row",alignItems:"center",gap:6,backgroundColor:C.inputBg,borderRadius:10,paddingHorizontal:12,paddingVertical:7,marginBottom:10,borderWidth:1,borderColor:C.border},
  fillHintTxt:{fontSize:12,color:C.sub,fontWeight:"500"},
  saveBtn:  {flexDirection:"row",backgroundColor:C.primary,paddingVertical:15,borderRadius:14,alignItems:"center",justifyContent:"center",gap:9,shadowColor:C.primary,shadowOffset:{width:0,height:6},shadowOpacity:0.25,shadowRadius:12,elevation:6},
  saveBtnReady:{backgroundColor:C.success,shadowColor:C.success},
  saveTxt:  {color:"#FFF",fontSize:15,fontWeight:"800"},

  modalBg:  {flex:1,backgroundColor:"rgba(0,0,0,0.25)",justifyContent:"flex-end"},
  modalCard:{backgroundColor:C.card,paddingTop:10,paddingBottom:34,paddingHorizontal:20,borderTopLeftRadius:28,borderTopRightRadius:28,maxHeight:"70%",shadowColor:"#000",shadowOffset:{width:0,height:-4},shadowOpacity:0.08,shadowRadius:16,elevation:12},
  modalHandle:{width:36,height:4,backgroundColor:C.border,borderRadius:2,alignSelf:"center",marginBottom:18},
  modalTitle:{fontSize:17,fontWeight:"900",color:C.text,marginBottom:14},
  modalItem:{flexDirection:"row",alignItems:"center",paddingVertical:13,paddingHorizontal:14,borderRadius:14,marginBottom:8,backgroundColor:C.inputBg,borderWidth:1,borderColor:C.border},
  modalItemActive:{backgroundColor:"#EFF6FF",borderColor:C.primary+"40"},
  modalIconCircle:{width:38,height:38,borderRadius:12,justifyContent:"center",alignItems:"center",marginRight:12},
  modalItemTxt:{flex:1,color:C.sub,fontSize:15,fontWeight:"600"},
  modalItemTxtActive:{color:C.text,fontWeight:"800"},

  prevModal:{backgroundColor:C.card,marginHorizontal:28,padding:24,borderRadius:22,alignItems:"center",borderWidth:1,borderColor:C.border,shadowColor:"#000",shadowOffset:{width:0,height:8},shadowOpacity:0.12,shadowRadius:24,elevation:14},
  prevIconWrap:{width:56,height:56,borderRadius:18,backgroundColor:"#EFF6FF",justifyContent:"center",alignItems:"center",marginBottom:14},
  prevTitle:{fontSize:17,fontWeight:"900",color:C.text,marginBottom:8,textAlign:"center"},
  prevSub:  {fontSize:13,color:C.sub,textAlign:"center",marginBottom:12,lineHeight:19},
  prevFitBadge:{backgroundColor:C.primary+"15",paddingHorizontal:14,paddingVertical:5,borderRadius:20,marginBottom:18},
  prevFitBadgeTxt:{fontSize:12,fontWeight:"700",color:C.primary},
  prevBtns: {flexDirection:"row",gap:10,width:"100%"},
  prevBtnCancel:{flex:1,paddingVertical:13,borderRadius:12,backgroundColor:C.inputBg,alignItems:"center",borderWidth:1,borderColor:C.border},
  prevBtnCancelTxt:{color:C.sub,fontSize:14,fontWeight:"700"},
  prevBtnLoad:{flex:1,flexDirection:"row",paddingVertical:13,borderRadius:12,backgroundColor:C.primary,alignItems:"center",justifyContent:"center",gap:6},
  prevBtnLoadTxt:{color:"#FFF",fontSize:14,fontWeight:"800"},

  toast:    {position:"absolute",top:54,right:18,flexDirection:"row",alignItems:"center",paddingVertical:12,paddingHorizontal:16,borderRadius:14,gap:8,shadowColor:"#000",shadowOffset:{width:0,height:4},shadowOpacity:0.15,shadowRadius:10,elevation:8},
  toastTxt: {color:"#FFF",fontWeight:"700",fontSize:13},
});