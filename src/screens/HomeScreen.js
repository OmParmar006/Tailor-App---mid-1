/**
 * Darji Pro — HomeScreen (FIXED)
 *
 * Fixes applied:
 *   1. Renamed customers → rawOrders state
 *   2. Firebase listener now reads from "orders" collection
 *   3. Orders useMemo reads fields directly from order docs
 *   4. handleCustomerClick passes correct customerId (not order.id)
 *   5. Measurement modal "Add" button passes all IDs
 *   6. rotateStage + markPaid now persist to Firestore
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert, Animated, Linking, Modal, Pressable, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
  Dimensions, StatusBar, Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection, onSnapshot, query, where, getDocs,
  updateDoc, doc,
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { useLanguage } from "../context/LanguageContext";
import { LanguageToggle } from "../context/LanguageToggle";
import { PieChart, BarChart } from "react-native-gifted-charts";

const { width } = Dimensions.get("window");

// ─── constants ────────────────────────────────────────────────
const PIPELINE = ["Measurement","Cutting","Stitching","Trial","Delivery"];
const GARMENT_ICONS = {
  Shirt:"shirt-outline", Pant:"fitness-outline", Kurta:"body-outline",
  Safari:"briefcase-outline", Coti:"layers-outline",
  Blazer:"diamond-outline", Suit:"ribbon-outline",
};
const GARMENT_COLORS = {
  Shirt:"#3B82F6", Pant:"#8B5CF6", Kurta:"#EC4899",
  Safari:"#F59E0B", Coti:"#10B981", Blazer:"#EF4444", Suit:"#6366F1",
};

// ─── helpers ──────────────────────────────────────────────────
const parseDD = (v) => {
  if (!v || typeof v !== "string") return null;
  const p = v.split("/");
  if (p.length !== 3) return null;
  const d = new Date(+p[2], +p[1] - 1, +p[0]);
  return isNaN(d) ? null : d;
};
const sod = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const getBucket = (s) => {
  const p = parseDD(s);
  if (!p) return "No Date";
  const diff = Math.round((sod(p) - sod(new Date())) / 86400000);
  if (diff < 0)  return "Overdue";
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff <= 7)  return "This Week";
  return "Later";
};
const normStage = (s) => {
  const v = String(s || "").toLowerCase().trim();
  if (["measurement","pending","new"].includes(v)) return "Measurement";
  if (v === "cutting") return "Cutting";
  if (["stitching","progress","in progress","in_progress"].includes(v)) return "Stitching";
  if (["trial","qc"].includes(v)) return "Trial";
  if (["delivery","ready","delivered","complete","completed"].includes(v)) return "Delivery";
  return "Measurement";
};
const stageToBadge = (s) =>
  s === "Measurement" ? "Pending"
  : s === "Stitching" || s === "Cutting" ? "Progress" : "Ready";
const toDS = (r) => {
  if (!r) return null;
  if (typeof r?.toDate === "function") return r.toDate();
  const d = new Date(r); return isNaN(d) ? null : d;
};
const fmtDate = (dd, ca) =>
  dd || (ca ? ca.toLocaleDateString("en-GB",{day:"2-digit",month:"short"}) : "--");
const urgency = (b) =>
  b === "Overdue" || b === "Today" ? "High"
  : b === "Tomorrow" || b === "This Week" ? "Medium" : "Low";
const fmtMoney = (v) =>
  v >= 100000 ? `₹${(v/100000).toFixed(1)}L`
  : v >= 1000  ? `₹${(v/1000).toFixed(1)}K`
  : `₹${v}`;

// ═══════════════════════════════════════════════════════════════
// CARD 2 — REVENUE
// ═══════════════════════════════════════════════════════════════
const RevenueCard = ({ analytics, revenueFilter, setRevenueFilter }) => {
  const cashReceived = analytics.cashReceived || 0;
  const outstanding  = analytics.outstanding  || 0;
  const profit       = analytics.profit       || 0;
  const total        = cashReceived + outstanding + profit || 1;

  const donutData = [
    { value: cashReceived, color: "#3B82F6" },
    { value: outstanding,  color: "#F59E0B" },
    { value: profit,       color: "#10B981" },
  ];

  const rows = [
    { label:"Received",    value:cashReceived, color:"#3B82F6", pct:Math.round((cashReceived/total)*100) },
    { label:"Outstanding", value:outstanding,  color:"#F59E0B", pct:Math.round((outstanding/total)*100)  },
    { label:"Profit",      value:profit,       color:"#10B981", pct:Math.round((profit/total)*100)        },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <View style={styles.cardTitleRow}>
          <View style={[styles.cardIconBox,{backgroundColor:"#EFF6FF"}]}>
            <Ionicons name="pie-chart" size={16} color="#3B82F6"/>
          </View>
          <Text style={styles.cardTitle}>Revenue</Text>
        </View>
        <View style={{flexDirection:"row",gap:4}}>
          {["1M","6M","1Y","All"].map(f=>(
            <TouchableOpacity key={f}
              style={[styles.pill, revenueFilter===f && styles.pillActive]}
              onPress={()=>setRevenueFilter(f)}>
              <Text style={[styles.pillTxt, revenueFilter===f && styles.pillTxtActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={{flexDirection:"row",alignItems:"center",gap:18}}>
        <View>
          <PieChart
            data={donutData} donut radius={62} innerRadius={44}
            strokeWidth={0} focusOnPress
            centerLabelComponent={()=>(
              <View style={{alignItems:"center",justifyContent:"center"}}>
                <Text style={{fontSize:9,fontWeight:"700",color:"#9CA3AF",letterSpacing:0.6}}>TOTAL</Text>
                <Text style={{fontSize:15,fontWeight:"900",color:"#1C1C1E",marginTop:1}}>
                  {fmtMoney(total)}
                </Text>
              </View>
            )}
          />
        </View>
        <View style={{flex:1,gap:10}}>
          {rows.map(r=>(
            <View key={r.label}>
              <View style={{flexDirection:"row",justifyContent:"space-between",
                alignItems:"center",marginBottom:4}}>
                <View style={{flexDirection:"row",alignItems:"center",gap:7}}>
                  <View style={{width:9,height:9,borderRadius:5,backgroundColor:r.color}}/>
                  <Text style={{fontSize:12,fontWeight:"600",color:"#6B7280"}}>{r.label}</Text>
                </View>
                <View style={{flexDirection:"row",alignItems:"center",gap:8}}>
                  <Text style={{fontSize:13,fontWeight:"800",color:"#1C1C1E"}}>{fmtMoney(r.value)}</Text>
                  <Text style={{fontSize:12,fontWeight:"900",color:r.color}}>{r.pct}%</Text>
                </View>
              </View>
              <View style={{height:4,backgroundColor:"#F3F4F6",borderRadius:4,overflow:"hidden"}}>
                <View style={{height:"100%",width:`${r.pct}%`,backgroundColor:r.color,borderRadius:4}}/>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════
// CARD 3 — WEEKLY ORDERS
// ═══════════════════════════════════════════════════════════════
const WeeklyCard = ({ analytics }) => {
  const days   = analytics.weekDays || [];
  const maxVal = Math.max(...days.map(d=>d.count), 1);

  const barData = days.map((d)=>({
    value:      d.count,
    label:      d.label,
    frontColor: d.isToday ? "#3B82F6" : "#DBEAFE",
    topLabelComponent: d.isToday && d.count > 0
      ? ()=>(
          <View style={{backgroundColor:"#1C1C1E",paddingHorizontal:6,
            paddingVertical:3,borderRadius:7,marginBottom:3}}>
            <Text style={{color:"#FFF",fontSize:10,fontWeight:"900"}}>{d.count}</Text>
          </View>
        )
      : undefined,
  }));

  const summaryStats = [
    {label:"Total",       val:analytics.total,      color:"#1C1C1E"},
    {label:"In Progress", val:analytics.inProgress, color:"#F59E0B"},
    {label:"Ready",       val:analytics.ready,      color:"#10B981"},
    {label:"Overdue",     val:analytics.overdue,    color:"#EF4444"},
  ];

  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <View style={styles.cardTitleRow}>
          <View style={[styles.cardIconBox,{backgroundColor:"#ECFDF5"}]}>
            <Ionicons name="stats-chart" size={16} color="#10B981"/>
          </View>
          <Text style={styles.cardTitle}>Weekly Orders</Text>
        </View>
        <Text style={{fontSize:12,fontWeight:"500",color:"#9CA3AF"}}>Last 7 days</Text>
      </View>
      <View style={{marginLeft:-6,marginBottom:4}}>
        <BarChart
          data={barData} width={width-96} height={110}
          barWidth={26} spacing={10} roundedTop roundedBottom={false}
          hideRules={false} rulesColor="#F3F4F6" rulesType="solid"
          xAxisColor="#F3F4F6" yAxisColor="transparent"
          yAxisTextStyle={{color:"#9CA3AF",fontSize:9}}
          xAxisLabelTextStyle={{color:"#9CA3AF",fontSize:10,fontWeight:"700"}}
          noOfSections={3} maxValue={Math.max(maxVal+1,4)}
          initialSpacing={6} endSpacing={6}
          hideYAxisText={false} showFractionalValues={false}
          isAnimated animationDuration={600}
        />
      </View>
      <View style={{flexDirection:"row",gap:14,marginBottom:14,paddingLeft:2}}>
        {[["#3B82F6","Today"],["#DBEAFE","Other days"]].map(([c,l])=>(
          <View key={l} style={{flexDirection:"row",alignItems:"center",gap:5}}>
            <View style={{width:10,height:10,borderRadius:3,backgroundColor:c}}/>
            <Text style={{fontSize:10,color:"#9CA3AF",fontWeight:"600"}}>{l}</Text>
          </View>
        ))}
      </View>
      <View style={{flexDirection:"row",justifyContent:"space-around",
        paddingTop:14,borderTopWidth:1,borderTopColor:"#F3F4F6"}}>
        {summaryStats.map(s=>(
          <View key={s.label} style={{alignItems:"center"}}>
            <Text style={{fontSize:22,fontWeight:"900",color:s.color}}>{s.val}</Text>
            <Text style={{fontSize:10,fontWeight:"600",color:"#9CA3AF",marginTop:2}}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════
const FChip = ({ label, active, onPress }) => (
  <TouchableOpacity style={[styles.chip, active && styles.chipActive]} onPress={onPress}>
    <Text style={[styles.chipTxt, active && styles.chipTxtActive]}>{label}</Text>
    <Ionicons name="chevron-down" size={12} color={active ? "#3B82F6" : "#9CA3AF"}/>
  </TouchableOpacity>
);

const TBtn = ({ label, count, active, urgent, onPress }) => {
  const [anim] = useState(new Animated.Value(active ? 1 : 0));
  useEffect(()=>{
    Animated.timing(anim,{toValue:active?1:0,duration:280,
      easing:Easing.out(Easing.cubic),useNativeDriver:false}).start();
  },[active]);
  const bg = anim.interpolate({inputRange:[0,1],outputRange:["transparent","#1C1C1E"]});
  const sc = anim.interpolate({inputRange:[0,1],outputRange:[1,1.03]});
  return (
    <Animated.View style={[styles.tTab,{backgroundColor:bg,transform:[{scale:sc}]}]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.tTabInner}>
        <Text style={[styles.tTabLbl, active && styles.tTabLblA]}>{label}</Text>
        {count > 0 && (
          <View style={[styles.tBadge, active && styles.tBadgeA, urgent && styles.tBadgeU]}>
            <Text style={[styles.tBadgeTxt, active && styles.tBadgeTxtA, urgent && styles.tBadgeTxtU]}>
              {count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const TxRow = ({ order, isExpanded, onToggle, onCall, onWhatsApp,
  onNextStage, onMarkPaid, onViewDetails, translations }) => {
  const EMOJIS = {Shirt:"👔",Pant:"👖",Kurta:"🧣",Safari:"💼",Blazer:"🥼",Suit:"🤵",Coti:"🧥"};
  const PM = {
    Paid:   {bg:"#D1FAE5",text:"#059669"},
    Unpaid: {bg:"#FEF9C3",text:"#D97706"},
  };
  const pm = PM[order.paymentStatus] || PM.Unpaid;
  return (
    <TouchableOpacity
      style={[styles.txRow, order.dateBucket==="Overdue" && styles.txRowOvd]}
      onLongPress={onToggle} onPress={()=>onViewDetails(order)} activeOpacity={0.7}>
      <View style={{flex:2,flexDirection:"row",alignItems:"center",gap:10}}>
        <View style={[styles.txAvatar,{backgroundColor:(GARMENT_COLORS[order.item]||"#3B82F6")+"18"}]}>
          <Text style={{fontSize:18}}>{EMOJIS[order.item]||"🧵"}</Text>
        </View>
        <View style={{flex:1}}>
          <Text style={styles.txName} numberOfLines={1}>{order.name}</Text>
          <Text style={styles.txSub}>#{order.orderId}</Text>
        </View>
      </View>
      <View style={{flex:1,alignItems:"center"}}>
        <View style={[styles.txPmBadge,{backgroundColor:pm.bg}]}>
          <Text style={[styles.txPmTxt,{color:pm.text}]}>
            {order.paymentStatus==="Paid"?(translations.paid||"Paid"):(translations.unpaid||"Unpaid")}
          </Text>
        </View>
      </View>
      <View style={{flex:1,alignItems:"flex-end"}}>
        <Text style={styles.txDate}>{order.date}</Text>
        <Text style={[styles.txStage,{
          color:order.dateBucket==="Overdue"?"#EF4444":order.dateBucket==="Today"?"#F59E0B":"#9CA3AF",
        }]}>{order.stage}</Text>
      </View>
      {isExpanded && (
        <View style={styles.txExpanded}>
          {[
            {icon:"call",         label:translations.call||"Call",      color:"#3B82F6",fn:onCall     },
            {icon:"logo-whatsapp",label:"WA",                           color:"#25D366",fn:onWhatsApp },
            {icon:"play-forward", label:translations.nextStage||"Next", color:"#8B5CF6",fn:onNextStage},
            {icon:"cash",         label:translations.markPaid||"Paid",  color:"#10B981",fn:onMarkPaid },
          ].map(a=>(
            <TouchableOpacity key={a.label} style={{flex:1,alignItems:"center",gap:4}} onPress={a.fn}>
              <View style={{width:40,height:40,borderRadius:20,backgroundColor:`${a.color}15`,
                justifyContent:"center",alignItems:"center"}}>
                <Ionicons name={a.icon} size={18} color={a.color}/>
              </View>
              <Text style={{color:"#6B7280",fontSize:10,fontWeight:"600"}}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
};

const GTab = ({ garment, fitType, active, onPress }) => {
  const color = GARMENT_COLORS[garment] || "#3B82F6";
  return (
    <TouchableOpacity
      style={[styles.gTab, active && [styles.gTabA,{borderColor:color}]]}
      onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.gTabIcon,{backgroundColor:color+"20"}]}>
        <Ionicons name={GARMENT_ICONS[garment]||"shirt-outline"} size={18} color={color}/>
      </View>
      <Text style={[styles.gTabName, active && {color:"#1C1C1E"}]}>{garment}</Text>
      {fitType && <Text style={styles.gTabFit}>{fitType}</Text>}
    </TouchableOpacity>
  );
};

const MeasRow = ({ label, value, color }) => {
  const { t } = useLanguage();
  return (
    <View style={styles.mRow}>
      <View style={{flexDirection:"row",alignItems:"center",gap:10,flex:1}}>
        <View style={{width:6,height:6,borderRadius:3,backgroundColor:color}}/>
        <Text style={{color:"#374151",fontSize:14,fontWeight:"600"}}>{t[label]||label}</Text>
      </View>
      <View style={{flexDirection:"row",alignItems:"baseline",gap:3}}>
        <Text style={{color:"#1C1C1E",fontSize:18,fontWeight:"700"}}>{value}</Text>
        <Text style={{color:"#9CA3AF",fontSize:11,fontWeight:"500"}}>{t.in||"in"}</Text>
      </View>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════
// BOTTOM NAV
// ═══════════════════════════════════════════════════════════════
const NAV_ITEMS = [
  {key:"home",  icon:"grid",            label:"Dashboard"},
  {key:"tryon", icon:"shirt-outline",   label:"Try-On"   },
  {key:"bills", icon:"receipt-outline", label:"Bills"    },
];

const BottomNav = ({ activeKey, onPress, translateY }) => {
  const [activeIndex, setActiveIndex] = useState(
    NAV_ITEMS.findIndex(n=>n.key===activeKey) ?? 0
  );
  const [itemLayouts, setItemLayouts] = useState([]);
  const pillX = useRef(new Animated.Value(0)).current;
  const pillW = useRef(new Animated.Value(0)).current;

  useEffect(()=>{
    if (itemLayouts.length === NAV_ITEMS.length) {
      const layout = itemLayouts[activeIndex];
      if (!layout) return;
      Animated.parallel([
        Animated.spring(pillX,{toValue:layout.x,useNativeDriver:false,tension:70,friction:9}),
        Animated.spring(pillW,{toValue:layout.w,useNativeDriver:false,tension:70,friction:9}),
      ]).start();
    }
  },[activeIndex, itemLayouts]);

  const handlePress = (idx) => { setActiveIndex(idx); onPress?.(NAV_ITEMS[idx]); };
  const measureItem = (idx, e) => {
    const {x,width:w} = e.nativeEvent.layout;
    setItemLayouts(prev=>{ const n=[...prev]; n[idx]={x,w}; return n; });
  };

  return (
    <Animated.View style={[styles.navBar,{transform:[{translateY}]}]}>
      <Animated.View style={[styles.navActivePill,{left:pillX,width:pillW}]}/>
      {NAV_ITEMS.map((item,idx)=>{
        const isActive = idx===activeIndex;
        return (
          <TouchableOpacity key={item.key} style={styles.navItem}
            onPress={()=>handlePress(idx)} activeOpacity={0.85}
            onLayout={e=>measureItem(idx,e)}>
            <View style={styles.navItemInner}>
              <Ionicons name={item.icon} size={isActive?19:21}
                color={isActive?"#1C1C1E":"#9CA3AF"}/>
              {isActive && <Text style={styles.navActiveLabel}>{item.label}</Text>}
            </View>
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════
export default function HomeScreen() {
  const navigation = useNavigation();
  const { t } = useLanguage();

  // FIX 1: renamed from customers/setCustomers → rawOrders/setOrders
  const [rawOrders,               setOrders]               = useState([]);
  const [measurements,            setMeasurements]         = useState([]);
  const [loadingOrders,           setLoadingOrders]        = useState(true);
  const [activeTab,               setActiveTab]            = useState("today");
  const [searchText,              setSearchText]           = useState("");
  const [searchFocused,           setSearchFocused]        = useState(false);
  const [filters,                 setFilters]              = useState({status:"All Status",payment:"All Payment"});
  const [activeFilterKey,         setActiveFilterKey]      = useState(null);
  const [filterModalVisible,      setFilterModalVisible]   = useState(false);
  const [selectedOrderId,         setSelectedOrderId]      = useState(null);
  const [localOverrides,          setLocalOverrides]       = useState({});
  const [measurementModalVisible, setMeasurementModalVisible] = useState(false);
  const [selectedCustomer,        setSelectedCustomer]     = useState(null);
  const [customerMeasurements,    setCustomerMeasurements] = useState([]);
  const [selectedGarment,         setSelectedGarment]      = useState(null);
  const [loadingMeasurements,     setLoadingMeasurements]  = useState(false);
  const [scaleAnim]    = useState(new Animated.Value(0));
  const [revenueFilter, setRevenueFilter] = useState("1M");

  const lastScrollY   = useRef(0);
  const navTranslateY = useRef(new Animated.Value(0)).current;

  // FIX 2: Firebase now listens to "orders" collection
  useEffect(()=>{
    let unsubO=()=>{}, unsubM=()=>{};

    const unsubA = onAuthStateChanged(auth, (user)=>{
      unsubO(); unsubM();
      if (!user) {
        setOrders([]); setMeasurements([]); setLoadingOrders(false); return;
      }
      setLoadingOrders(true);

      // Listen to ORDERS collection (where AddCustomerScreen saves)
      unsubO = onSnapshot(
        query(collection(db,"orders"), where("ownerId","==",user.uid)),
        (snap)=>{ setOrders(snap.docs.map(d=>({id:d.id,...d.data()}))); setLoadingOrders(false); },
        ()=>{ setOrders([]); setLoadingOrders(false); }
      );

      // Measurements listener unchanged
      unsubM = onSnapshot(
        collection(db,"measurements"),
        (snap)=>setMeasurements(snap.docs.map(d=>({id:d.id,...d.data()}))),
        ()=>setMeasurements([])
      );
    });

    return ()=>{ unsubO(); unsubM(); unsubA(); };
  },[]);

  // Measurement modal animation
  useEffect(()=>{
    if (measurementModalVisible && selectedCustomer) {
      loadCustomerMeasurements();
      Animated.spring(scaleAnim,{toValue:1,tension:50,friction:7,useNativeDriver:true}).start();
    } else {
      Animated.timing(scaleAnim,{toValue:0,duration:200,useNativeDriver:true}).start();
    }
  },[measurementModalVisible, selectedCustomer]);

  const loadCustomerMeasurements = async ()=>{
    if (!selectedCustomer?.id) return;
    setLoadingMeasurements(true);
    try {
      const snap = await getDocs(
        query(collection(db,"measurements"), where("customerId","==",selectedCustomer.id))
      );
      const data = snap.docs.map(d=>({id:d.id,...d.data()}));
      setCustomerMeasurements(data);
      if (data.length > 0) setSelectedGarment(data[0]);
    } catch(e){ console.error(e); }
    finally { setLoadingMeasurements(false); }
  };

  // FIX 3: orders useMemo reads directly from order docs
  const orders = useMemo(()=>{
    // Build garment map from measurements
    const garmentMap = {};
    for (const m of measurements) {
      const ms = toDS(m.createdAt)?.getTime() || 0;
      if (!garmentMap[m.customerId] || ms > garmentMap[m.customerId].ms)
        garmentMap[m.customerId] = {garment:m.garment||"-",ms};
    }

    return rawOrders.map((o)=>{
      const ca            = toDS(o.createdAt);
      const ov            = localOverrides[o.id] || {};
      const stage         = ov.stage         || normStage(o.stage || o.status);
      const paymentStatus = ov.paymentStatus || o.paymentStatus || "Unpaid";
      const item          = o.garment || garmentMap[o.customerId]?.garment || o.itemType || "-";
      const bucket        = getBucket(o.deliveryDate);
      return {
        id:            o.id,
        customerId:    o.customerId,
        name:          o.customerName  || o.name  || "Unknown",
        phone:         o.customerPhone || o.phone || "",
        city:          o.customerCity  || o.city  || "",
        orderId:       o.orderId || "-",
        item, stage, paymentStatus,
        badgeStatus:   stageToBadge(stage),
        date:          fmtDate(o.deliveryDate, ca),
        dateBucket:    bucket,
        urgencyLevel:  urgency(bucket),
        createdAtMs:   ca?.getTime() || 0,
        createdAt:     ca,
        totalAmount:   Number(o.totalAmount)   || 0,
        advanceAmount: Number(o.advanceAmount) || 0,
      };
    });
  },[rawOrders, measurements, localOverrides]);

  const statusOptions  = useMemo(
    ()=>["All Status",...Array.from(new Set(orders.map(o=>o.stage)))],
    [orders]
  );
  const paymentOptions = ["All Payment","Paid","Unpaid"];

  const filteredOrders = useMemo(()=>{
    const q = searchText.trim().toLowerCase();
    let f = orders.filter(o=>
      (!q||[o.name,o.phone,o.orderId,o.item,o.stage].join(" ").toLowerCase().includes(q))&&
      (filters.status==="All Status"   || o.stage===filters.status)&&
      (filters.payment==="All Payment" || o.paymentStatus===filters.payment)
    );
    if (activeTab==="today")         f = f.filter(o=>["Overdue","Today"].includes(o.dateBucket));
    else if (activeTab==="upcoming") f = f.filter(o=>["Tomorrow","This Week"].includes(o.dateBucket));
    const bkt = ["Overdue","Today","Tomorrow","This Week","Later","No Date"];
    return [...f].sort((a,b)=>{
      const d = bkt.indexOf(a.dateBucket)-bkt.indexOf(b.dateBucket);
      return d!==0 ? d : b.createdAtMs-a.createdAtMs;
    });
  },[orders, searchText, filters, activeTab]);

  // Analytics
  const analytics = useMemo(()=>{
    const now = new Date();
    const overdue    = orders.filter(o=>o.dateBucket==="Overdue").length;
    const today      = orders.filter(o=>o.dateBucket==="Today").length;
    const thisWeek   = orders.filter(o=>o.dateBucket==="This Week").length;
    const inProgress = orders.filter(o=>["Cutting","Stitching"].includes(o.stage)).length;
    const trial      = orders.filter(o=>o.stage==="Trial").length;
    const ready      = orders.filter(o=>o.stage==="Delivery").length;
    const unpaid     = orders.filter(o=>o.paymentStatus==="Unpaid").length;
    const measurement= orders.filter(o=>o.stage==="Measurement").length;
    const todayOrders= orders.filter(o=>{
      if (!o.createdAt) return false;
      return o.createdAt.getDate()===now.getDate()&&
             o.createdAt.getMonth()===now.getMonth()&&
             o.createdAt.getFullYear()===now.getFullYear();
    });
    const co=(()=>{
      const d=new Date();
      if (revenueFilter==="1M") d.setMonth(d.getMonth()-1);
      else if (revenueFilter==="6M") d.setMonth(d.getMonth()-6);
      else if (revenueFilter==="1Y") d.setFullYear(d.getFullYear()-1);
      else return null;
      return d;
    })();
    const rev = co ? orders.filter(o=>o.createdAt&&o.createdAt>=co) : orders;
    const totalRevenue = rev.reduce((s,o)=>s+o.totalAmount,0) || 0;
    const cashReceived = rev.filter(o=>o.paymentStatus==="Paid").reduce((s,o)=>s+o.totalAmount,0) || 0;
    const outstanding  = rev.filter(o=>o.paymentStatus==="Unpaid").reduce((s,o)=>s+(o.totalAmount-o.advanceAmount),0) || 0;
    const profit       = Math.max(totalRevenue-cashReceived-outstanding,0) || 0;
    const weekDays=[];
    for (let i=6;i>=0;i--){
      const d=new Date(); d.setDate(d.getDate()-i);
      const dayOrders=orders.filter(o=>{
        if (!o.createdAt) return false;
        const od=o.createdAt;
        return od.getDate()===d.getDate()&&od.getMonth()===d.getMonth()&&od.getFullYear()===d.getFullYear();
      });
      weekDays.push({
        label:d.toLocaleString("default",{weekday:"short"}).toUpperCase().slice(0,3),
        count:dayOrders.length, isToday:i===0,
      });
    }
    return {
      overdue,today,thisWeek,inProgress,trial,ready,unpaid,measurement,
      total:orders.length,
      todayCount:todayOrders.length,
      todayMoney:todayOrders.reduce((s,o)=>s+o.totalAmount,0),
      totalRevenue,cashReceived,outstanding,profit,weekDays,
    };
  },[orders, revenueFilter]);

  const hasActiveFilters = filters.status!=="All Status"||filters.payment!=="All Payment";
  const openFilter = key=>{ setActiveFilterKey(key); setFilterModalVisible(true); };
  const currentFilterOptions = useMemo(
    ()=>activeFilterKey==="status"?statusOptions:activeFilterKey==="payment"?paymentOptions:[],
    [activeFilterKey, statusOptions]
  );
  const setFilterValue = val=>{
    setFilters(p=>({...p,[activeFilterKey]:val}));
    setFilterModalVisible(false); setActiveFilterKey(null);
  };
  const clearAllFilters = ()=>{ setFilters({status:"All Status",payment:"All Payment"}); setSearchText(""); };

  // FIX 6: rotateStage persists to Firestore
  const rotateStage = async (id)=>{
    const cur  = localOverrides[id]?.stage || rawOrders.find(o=>o.id===id)?.stage || PIPELINE[0];
    const next = PIPELINE[(PIPELINE.indexOf(normStage(cur))+1)%PIPELINE.length];
    setLocalOverrides(p=>({...p,[id]:{...(p[id]||{}),stage:next}}));
    try { await updateDoc(doc(db,"orders",id),{stage:next}); }
    catch(e){ console.error("rotateStage:",e); }
  };

  // FIX 6: markPaid persists to Firestore
  const markPaid = async (id)=>{
    setLocalOverrides(p=>({...p,[id]:{...(p[id]||{}),paymentStatus:"Paid"}}));
    try { await updateDoc(doc(db,"orders",id),{paymentStatus:"Paid"}); }
    catch(e){ console.error("markPaid:",e); }
  };

  const callCustomer = async phone=>{
    if (!phone) return Alert.alert("No Phone","Missing.");
    if (!await Linking.canOpenURL(`tel:${phone}`)) return Alert.alert("Error","Cannot open dialer.");
    await Linking.openURL(`tel:${phone}`);
  };
  const whatsappCustomer = async phone=>{
    if (!phone) return Alert.alert("No Phone","Missing.");
    const url=`https://wa.me/91${phone.replace(/[^\d]/g,"")}`;
    if (!await Linking.canOpenURL(url)) return Alert.alert("Error","WhatsApp not available.");
    await Linking.openURL(url);
  };

  // FIX 4: pass correct customerId (permanent), not order.id
  const handleCustomerClick = (order)=>{
    setSelectedCustomer({
      id:         order.customerId,  // permanent customer ID for measurements
      orderId:    order.id,          // Firestore order doc ID
      orderRefId: order.orderId,     // human-readable ORD-XXXX
      name:       order.name,
      phone:      order.phone,
      city:       order.city,
    });
    setMeasurementModalVisible(true);
  };

  const closeMeasurementModal = ()=>{
    setMeasurementModalVisible(false);
    setTimeout(()=>{ setSelectedCustomer(null); setCustomerMeasurements([]); setSelectedGarment(null); },300);
  };
  const handleScroll = e=>{
    const cur  = e.nativeEvent.contentOffset.y;
    const diff = cur-lastScrollY.current;
    if (diff>10) Animated.spring(navTranslateY,{toValue:100,useNativeDriver:true,tension:80,friction:12}).start();
    else if (diff<-10) Animated.spring(navTranslateY,{toValue:0,useNativeDriver:true,tension:80,friction:12}).start();
    lastScrollY.current = cur;
  };
  const handleNavPress = item=>{
    if (item.key==="tryon") navigation.navigate("TryOn");
    else if (item.key==="bills") navigation.navigate("Bills");
  };

  const statusPills = [
    {label:"Measuring",  value:analytics.measurement, color:"#3B82F6", bg:"#EBF3FF"},
    {label:"In Progress",value:analytics.inProgress,  color:"#F59E0B", bg:"#FFF7E6"},
    {label:"Trial",      value:analytics.trial,        color:"#8B5CF6", bg:"#F5F3FF"},
    {label:"Ready",      value:analytics.ready,        color:"#10B981", bg:"#ECFDF5"},
    {label:"Overdue",    value:analytics.overdue,      color:"#EF4444", bg:"#FFF5F5"},
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F3F7"/>

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoWrap}>
            <View style={styles.dBlue}/><View style={styles.dGreen}/>
          </View>
          <Text style={styles.logoText}>Darji Pro</Text>
        </View>
        <View style={styles.headerRight}>
          <LanguageToggle/>
          <TouchableOpacity style={styles.avatarTrigger} onPress={()=>navigation.navigate("Profile")}>
            <View style={styles.avatar}><Text style={styles.avatarTxt}>D</Text></View>
            {analytics.overdue>0 && <View style={styles.headerDot}/>}
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom:110}}
        onScroll={handleScroll} scrollEventThrottle={16}>

        {/* ══ CARD 1 — TODAY'S SNAPSHOT ══ */}
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.cardTitleRow}>
              <View style={[styles.cardIconBox,{backgroundColor:"#EBF3FF"}]}>
                <Ionicons name="wallet" size={16} color="#3B82F6"/>
              </View>
              <Text style={styles.cardTitle}>{t.todaySnapshot||"Today's Snapshot"}</Text>
            </View>
            <View style={styles.cardHeadRight}>
              <TouchableOpacity style={styles.roundBtn} onPress={()=>openFilter("status")}>
                <Ionicons name="options-outline" size={18} color="#1C1C1E"/>
                {hasActiveFilters&&<View style={styles.optDot}/>}
              </TouchableOpacity>
            </View>
          </View>
          <View style={{flexDirection:"row",alignItems:"flex-end",marginBottom:4}}>
            <Text style={styles.bigNum}>{analytics.total}</Text>
            <Text style={styles.bigNumDec}>.00</Text>
            <TouchableOpacity style={{marginLeft:8,marginBottom:8}}>
              <Ionicons name="eye-outline" size={20} color="#BDBDBD"/>
            </TouchableOpacity>
          </View>
          <Text style={styles.bigNumLabel}>{t.totalOrders||"Total Orders"}</Text>
          <View style={styles.snapDivider}/>
          <View style={{flexDirection:"row",marginBottom:16}}>
            <View style={styles.snapHalf}>
              <View style={[styles.snapIcon,{backgroundColor:"#EBF3FF"}]}>
                <Ionicons name="today-outline" size={14} color="#3B82F6"/>
              </View>
              <View>
                <Text style={styles.snapHalfNum}>{analytics.todayCount}</Text>
                <Text style={styles.snapHalfLabel}>Today's Orders</Text>
              </View>
            </View>
            <View style={styles.snapHalfDivider}/>
            <View style={styles.snapHalf}>
              <View style={[styles.snapIcon,{backgroundColor:"#D1FAE5"}]}>
                <Ionicons name="cash-outline" size={14} color="#059669"/>
              </View>
              <View>
                <Text style={[styles.snapHalfNum,{color:"#059669"}]}>
                  {analytics.todayMoney>0?fmtMoney(analytics.todayMoney):"₹0"}
                </Text>
                <Text style={styles.snapHalfLabel}>Today's Revenue</Text>
              </View>
            </View>
          </View>
          <Text style={styles.sectionLabel}>Pipeline Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{gap:8,paddingRight:4,paddingBottom:4}} style={{marginBottom:20}}>
            {statusPills.map(pill=>(
              <View key={pill.label} style={[styles.statusPill,{backgroundColor:pill.bg}]}>
                <View style={[styles.statusPillDot,{backgroundColor:pill.color}]}/>
                <View>
                  <Text style={[styles.statusPillNum,{color:pill.color}]}>{pill.value}</Text>
                  <Text style={[styles.statusPillLabel,{color:pill.color+"BB"}]}>{pill.label}</Text>
                </View>
                {pill.label==="Overdue"&&pill.value>0&&(
                  <Ionicons name="flame" size={12} color="#EF4444" style={{marginLeft:4}}/>
                )}
              </View>
            ))}
          </ScrollView>
          <View style={styles.ctaRow}>
            <TouchableOpacity style={styles.btnBlue} onPress={()=>navigation.navigate("AddCustomer")}>
              <Ionicons name="add" size={18} color="#FFF"/>
              <Text style={styles.btnBlueTxt}>{t.addOrder||"Add Order"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnDark} onPress={()=>navigation.navigate("Customers")}>
              <Ionicons name="people-outline" size={18} color="#FFF"/>
              <Text style={styles.btnDarkTxt}>{t.customers||"Customers"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ══ CARD 2 — REVENUE ══ */}
        <RevenueCard analytics={analytics} revenueFilter={revenueFilter} setRevenueFilter={setRevenueFilter}/>

        {/* ══ CARD 3 — WEEKLY ORDERS ══ */}
        <WeeklyCard analytics={analytics}/>

        {/* ══ CARD 4 — ORDERS LIST ══ */}
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.cardTitleRow}>
              <View style={[styles.cardIconBox,{backgroundColor:"#F0FDF4"}]}>
                <Ionicons name="time" size={16} color="#10B981"/>
              </View>
              <Text style={styles.cardTitle}>{t.orders||"Orders"}</Text>
            </View>
            <View style={styles.cardHeadRight}>
              <TouchableOpacity style={styles.roundBtn}>
                <Ionicons name="search-outline" size={18} color="#1C1C1E"/>
              </TouchableOpacity>
              <TouchableOpacity style={styles.roundBtn}>
                <Ionicons name="options-outline" size={18} color="#1C1C1E"/>
                {hasActiveFilters&&<View style={styles.optDot}/>}
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.searchBar,searchFocused&&styles.searchBarFocus]}>
            <Ionicons name="search" size={15} color={searchFocused?"#3B82F6":"#BDBDBD"}/>
            <TextInput placeholder={t.searchPlaceholder||"Search by name, phone, order..."}
              placeholderTextColor="#BDBDBD" style={styles.searchInput}
              value={searchText} onChangeText={setSearchText}
              onFocus={()=>setSearchFocused(true)} onBlur={()=>setSearchFocused(false)}/>
            {(searchText||hasActiveFilters)&&(
              <TouchableOpacity onPress={clearAllFilters}>
                <Ionicons name="close-circle" size={17} color="#BDBDBD"/>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.chipRow}>
            <FChip label={filters.status==="All Status"?(t.status||"Status"):filters.status}
              active={filters.status!=="All Status"} onPress={()=>openFilter("status")}/>
            <FChip label={filters.payment==="All Payment"?(t.payment||"Payment"):filters.payment}
              active={filters.payment!=="All Payment"} onPress={()=>openFilter("payment")}/>
          </View>
          <View style={styles.tabsWrap}>
            <TBtn label={t.today||"Today"} count={analytics.overdue+analytics.today}
              active={activeTab==="today"} urgent={analytics.overdue>0} onPress={()=>setActiveTab("today")}/>
            <TBtn label={t.upcoming||"Upcoming"} count={analytics.thisWeek}
              active={activeTab==="upcoming"} onPress={()=>setActiveTab("upcoming")}/>
            <TBtn label={t.allOrders||"All Orders"} count={analytics.total}
              active={activeTab==="all"} onPress={()=>setActiveTab("all")}/>
          </View>
          <View style={styles.tHead}>
            <Text style={[styles.tHeadCell,{flex:2}]}>NAME</Text>
            <Text style={[styles.tHeadCell,{flex:1,textAlign:"center"}]}>STATUS</Text>
            <Text style={[styles.tHeadCell,{flex:1,textAlign:"right"}]}>DUE DATE</Text>
          </View>
          {loadingOrders ? (
            <View style={styles.empty}>
              <Ionicons name="hourglass-outline" size={32} color="#D1D5DB"/>
              <Text style={styles.emptyTxt}>{t.loading||"Loading..."}</Text>
            </View>
          ) : filteredOrders.length===0 ? (
            <View style={styles.empty}>
              <Ionicons name="checkmark-done-circle-outline" size={44} color="#D1D5DB"/>
              <Text style={styles.emptyTxt}>
                {activeTab==="today"?(t.allClear||"All clear!")
                :activeTab==="upcoming"?(t.noUpcoming||"No upcoming")
                :(t.noOrders||"No orders")}
              </Text>
              <Text style={styles.emptySubTxt}>
                {hasActiveFilters?(t.tryClearing||"Try clearing filters")
                :(t.addCustomer||"Add a customer to start")}
              </Text>
            </View>
          ) : filteredOrders.map(order=>(
            <TxRow key={order.id} order={order}
              isExpanded={selectedOrderId===order.id}
              onToggle={()=>setSelectedOrderId(selectedOrderId===order.id?null:order.id)}
              onCall={()=>callCustomer(order.phone)}
              onWhatsApp={()=>whatsappCustomer(order.phone)}
              onNextStage={()=>rotateStage(order.id)}
              onMarkPaid={()=>markPaid(order.id)}
              onViewDetails={handleCustomerClick}
              translations={t}/>
          ))}
        </View>

      </Animated.ScrollView>

      {/* ── FILTER MODAL ── */}
      <Modal transparent visible={filterModalVisible} animationType="slide"
        onRequestClose={()=>setFilterModalVisible(false)}>
        <Pressable style={styles.modalBd} onPress={()=>setFilterModalVisible(false)}>
          <Pressable style={styles.modalSheet} onPress={e=>e.stopPropagation()}>
            <View style={styles.modalHandle}/>
            <View style={styles.modalHeadRow}>
              <Text style={styles.modalHeadTxt}>
                {activeFilterKey==="status"?(t.filterByStatus||"Filter by Status")
                :(t.filterByPayment||"Filter by Payment")}
              </Text>
              <TouchableOpacity onPress={()=>setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280"/>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {currentFilterOptions.map(opt=>(
                <TouchableOpacity key={opt} style={styles.modalOpt} onPress={()=>setFilterValue(opt)}>
                  <Text style={styles.modalOptTxt}>{opt}</Text>
                  {filters[activeFilterKey]===opt&&<Ionicons name="checkmark-circle" size={22} color="#3B82F6"/>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── MEASUREMENT MODAL ── */}
      <Modal transparent visible={measurementModalVisible} animationType="fade"
        onRequestClose={closeMeasurementModal} statusBarTranslucent>
        <View style={styles.measOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeMeasurementModal}/>
          <Animated.View style={[styles.measSheet,{
            transform:[
              {scale:scaleAnim},
              {translateY:scaleAnim.interpolate({inputRange:[0,1],outputRange:[Dimensions.get("window").height,0]})},
            ],
            opacity:scaleAnim,
          }]}>
            <View style={styles.measHead}>
              <TouchableOpacity style={{padding:8}} onPress={closeMeasurementModal}>
                <Ionicons name="arrow-back" size={24} color="#1C1C1E"/>
              </TouchableOpacity>
              <View style={{flexDirection:"row",alignItems:"center",gap:10,flex:1}}>
                <View style={styles.measAvatar}>
                  <Text style={styles.measAvatarTxt}>{selectedCustomer?.name?.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={{flex:1}}>
                  <Text style={styles.measName}>{selectedCustomer?.name}</Text>
                  <Text style={styles.measPhone}>{selectedCustomer?.phone}</Text>
                </View>
              </View>
              <View style={{flexDirection:"row",gap:8,alignItems:"center"}}>
                <LanguageToggle/>
                <TouchableOpacity style={styles.roundBtn} onPress={()=>callCustomer(selectedCustomer?.phone)}>
                  <Ionicons name="call" size={18} color="#3B82F6"/>
                </TouchableOpacity>
                <TouchableOpacity style={styles.roundBtn} onPress={()=>whatsappCustomer(selectedCustomer?.phone)}>
                  <Ionicons name="logo-whatsapp" size={18} color="#25D366"/>
                </TouchableOpacity>
              </View>
            </View>
            {customerMeasurements.length>0 ? (
              <>
                <View style={{borderBottomWidth:1,borderBottomColor:"#F3F4F6"}}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{paddingHorizontal:16,paddingVertical:10,gap:8}}>
                    {customerMeasurements.map(m=>(
                      <GTab key={m.id} garment={m.garment} fitType={m.fitType}
                        active={selectedGarment?.id===m.id} onPress={()=>setSelectedGarment(m)}/>
                    ))}
                  </ScrollView>
                </View>
                {selectedGarment&&(
                  <ScrollView style={{flex:1}} showsVerticalScrollIndicator={false}>
                    <View style={{padding:16}}>
                      <View style={[styles.measInfoCard,{flexDirection:"row",alignItems:"center",gap:8}]}>
                        <Ionicons name="resize-outline" size={16} color={GARMENT_COLORS[selectedGarment.garment]}/>
                        <Text style={{color:"#9CA3AF",fontSize:13,fontWeight:"600"}}>{t.fit||"Fit"}:</Text>
                        <Text style={{color:GARMENT_COLORS[selectedGarment.garment],
                          fontSize:14,fontWeight:"700",marginLeft:"auto"}}>
                          {selectedGarment.fitType||"Regular"}
                        </Text>
                      </View>
                      {selectedGarment.notes&&(
                        <View style={[styles.measInfoCard,{flexDirection:"row",gap:8}]}>
                          <Ionicons name="document-text-outline" size={14} color="#9CA3AF"/>
                          <Text style={{flex:1,color:"#6B7280",fontSize:12,lineHeight:16}}>
                            {selectedGarment.notes}
                          </Text>
                        </View>
                      )}
                      {Object.entries(selectedGarment.values||{}).map(([key,val],i)=>(
                        <MeasRow key={`${key}-${i}`} label={key} value={val}
                          color={GARMENT_COLORS[selectedGarment.garment]}/>
                      ))}
                    </View>
                  </ScrollView>
                )}
              </>
            ) : (
              <View style={{flex:1,justifyContent:"center",alignItems:"center",padding:40}}>
                <Ionicons name="clipboard-outline" size={60} color="#D1D5DB"/>
                <Text style={{color:"#374151",fontSize:18,fontWeight:"700",marginTop:16}}>
                  {t.noMeasurements||"No measurements yet"}
                </Text>
              </View>
            )}
            {customerMeasurements.length>0&&(
              <View style={styles.measBar}>
                <TouchableOpacity style={styles.measBtnSec}>
                  <Ionicons name="share-outline" size={16} color="#3B82F6"/>
                  <Text style={styles.measBtnSecTxt}>{t.share||"Share"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.measBtnSec}>
                  <Ionicons name="print-outline" size={16} color="#8B5CF6"/>
                  <Text style={styles.measBtnSecTxt}>{t.print||"Print"}</Text>
                </TouchableOpacity>
                {/* FIX 5: pass all IDs to AddMeasurement */}
                <TouchableOpacity style={styles.measBtnPri}
                  onPress={()=>{
                    closeMeasurementModal();
                    navigation.navigate("AddMeasurement",{
                      customerId:   selectedCustomer.id,
                      orderId:      selectedCustomer.orderId,
                      orderRefId:   selectedCustomer.orderRefId,
                      customerName: selectedCustomer.name,
                    });
                  }}>
                  <Ionicons name="add-circle-outline" size={16} color="#FFF"/>
                  <Text style={styles.measBtnPriTxt}>{t.add||"Add"}</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>

      {/* ── BOTTOM NAV ── */}
      <BottomNav activeKey="home" onPress={handleNavPress} translateY={navTranslateY}/>
    </SafeAreaView>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  safe:        {flex:1,backgroundColor:"#F2F3F7"},
  header:      {flexDirection:"row",justifyContent:"space-between",alignItems:"center",
                paddingHorizontal:20,paddingTop:14,paddingBottom:14},
  logoRow:     {flexDirection:"row",alignItems:"center",gap:8},
  logoWrap:    {width:34,height:34,position:"relative"},
  dBlue:       {position:"absolute",top:2,left:4,width:18,height:18,
                backgroundColor:"#3B82F6",transform:[{rotate:"45deg"}],borderRadius:3},
  dGreen:      {position:"absolute",bottom:2,right:0,width:14,height:14,
                backgroundColor:"#A3E635",transform:[{rotate:"45deg"}],borderRadius:2},
  logoText:    {fontSize:22,fontWeight:"900",color:"#1C1C1E",letterSpacing:-0.7},
  headerRight: {flexDirection:"row",alignItems:"center",gap:8},
  avatarTrigger:{position:"relative"},
  avatar:      {width:38,height:38,borderRadius:19,backgroundColor:"#1C1C1E",
                justifyContent:"center",alignItems:"center",borderWidth:2,borderColor:"#FFF"},
  avatarTxt:   {color:"#FFF",fontSize:14,fontWeight:"800"},
  headerDot:   {position:"absolute",top:0,right:0,width:10,height:10,borderRadius:5,
                backgroundColor:"#EF4444",borderWidth:2,borderColor:"#F2F3F7"},

  card:        {marginHorizontal:16,marginBottom:16,backgroundColor:"#FFF",borderRadius:22,
                padding:20,shadowColor:"#000",shadowOffset:{width:0,height:2},
                shadowOpacity:0.06,shadowRadius:10,elevation:3},
  cardHead:    {flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:16},
  cardTitleRow:{flexDirection:"row",alignItems:"center",gap:8},
  cardIconBox: {width:34,height:34,borderRadius:10,justifyContent:"center",alignItems:"center"},
  cardTitle:   {fontSize:16,fontWeight:"700",color:"#1C1C1E"},
  cardHeadRight:{flexDirection:"row",gap:8},

  roundBtn:    {width:34,height:34,borderRadius:17,backgroundColor:"#F3F4F6",
                justifyContent:"center",alignItems:"center",position:"relative"},
  optDot:      {position:"absolute",top:6,right:6,width:7,height:7,
                borderRadius:3.5,backgroundColor:"#EF4444"},

  bigNum:      {fontSize:52,fontWeight:"800",color:"#1C1C1E",letterSpacing:-3},
  bigNumDec:   {fontSize:26,fontWeight:"700",color:"#1C1C1E",marginBottom:8},
  bigNumLabel: {fontSize:14,fontWeight:"600",color:"#9CA3AF",marginTop:2,marginBottom:16},

  snapDivider: {height:1,backgroundColor:"#F3F4F6",marginBottom:14},
  snapHalf:    {flex:1,flexDirection:"row",alignItems:"center",gap:10},
  snapHalfDivider:{width:1,height:36,backgroundColor:"#F3F4F6",marginHorizontal:12},
  snapIcon:    {width:32,height:32,borderRadius:9,justifyContent:"center",alignItems:"center"},
  snapHalfNum: {fontSize:20,fontWeight:"800",color:"#1C1C1E"},
  snapHalfLabel:{fontSize:11,fontWeight:"600",color:"#9CA3AF",marginTop:1},

  sectionLabel:{fontSize:12,fontWeight:"700",color:"#9CA3AF",letterSpacing:0.5,
                marginBottom:10,textTransform:"uppercase"},
  statusPill:  {flexDirection:"row",alignItems:"center",paddingHorizontal:14,
                paddingVertical:10,borderRadius:14,gap:8,minWidth:100},
  statusPillDot:{width:8,height:8,borderRadius:4},
  statusPillNum:{fontSize:20,fontWeight:"900",lineHeight:24},
  statusPillLabel:{fontSize:10,fontWeight:"600",marginTop:1},

  ctaRow:      {flexDirection:"row",gap:10},
  btnBlue:     {flex:1,flexDirection:"row",alignItems:"center",justifyContent:"center",
                backgroundColor:"#3B82F6",paddingVertical:14,borderRadius:14,gap:6},
  btnBlueTxt:  {color:"#FFF",fontSize:15,fontWeight:"700"},
  btnDark:     {flex:1,flexDirection:"row",alignItems:"center",justifyContent:"center",
                backgroundColor:"#1C1C1E",paddingVertical:14,borderRadius:14,gap:6},
  btnDarkTxt:  {color:"#FFF",fontSize:15,fontWeight:"700"},

  pill:        {paddingHorizontal:10,paddingVertical:5,borderRadius:20,backgroundColor:"#F3F4F6"},
  pillActive:  {backgroundColor:"#1C1C1E"},
  pillTxt:     {fontSize:12,fontWeight:"700",color:"#6B7280"},
  pillTxtActive:{color:"#FFF"},

  searchBar:   {flexDirection:"row",alignItems:"center",backgroundColor:"#F3F4F6",
                borderRadius:12,paddingHorizontal:12,paddingVertical:10,gap:8,
                marginBottom:12,borderWidth:1.5,borderColor:"transparent"},
  searchBarFocus:{borderColor:"#3B82F6",backgroundColor:"#EFF6FF"},
  searchInput: {flex:1,color:"#1C1C1E",fontSize:14,fontWeight:"500"},

  chipRow:     {flexDirection:"row",gap:8,marginBottom:14},
  chip:        {flexDirection:"row",alignItems:"center",gap:4,backgroundColor:"#F3F4F6",
                paddingHorizontal:12,paddingVertical:7,borderRadius:20,
                borderWidth:1.5,borderColor:"transparent"},
  chipActive:  {backgroundColor:"#EFF6FF",borderColor:"#3B82F6"},
  chipTxt:     {color:"#9CA3AF",fontSize:13,fontWeight:"600"},
  chipTxtActive:{color:"#3B82F6"},

  tabsWrap:    {flexDirection:"row",backgroundColor:"#F3F4F6",borderRadius:18,
                padding:4,gap:4,marginBottom:16,overflow:"hidden"},
  tTab:        {flex:1,borderRadius:14,overflow:"hidden"},
  tTabInner:   {flexDirection:"row",justifyContent:"center",alignItems:"center",paddingVertical:8,gap:5},
  tTabLbl:     {color:"#9CA3AF",fontSize:13,fontWeight:"600"},
  tTabLblA:    {color:"#FFF"},
  tBadge:      {backgroundColor:"#E5E7EB",borderRadius:8,paddingHorizontal:6,
                paddingVertical:1,minWidth:20,alignItems:"center"},
  tBadgeA:     {backgroundColor:"#374151"},
  tBadgeU:     {backgroundColor:"#EF4444"},
  tBadgeTxt:   {color:"#9CA3AF",fontSize:11,fontWeight:"700"},
  tBadgeTxtA:  {color:"#FFF"},
  tBadgeTxtU:  {color:"#FFF"},

  tHead:       {flexDirection:"row",paddingBottom:10,
                borderBottomWidth:1,borderBottomColor:"#F3F4F6",marginBottom:2},
  tHeadCell:   {color:"#9CA3AF",fontSize:11,fontWeight:"700",letterSpacing:0.4},

  txRow:       {flexDirection:"row",alignItems:"center",paddingVertical:13,
                borderBottomWidth:1,borderBottomColor:"#F9FAFB",flexWrap:"wrap"},
  txRowOvd:    {backgroundColor:"#FFF5F5",borderRadius:12,paddingHorizontal:8,marginHorizontal:-8},
  txAvatar:    {width:40,height:40,borderRadius:12,justifyContent:"center",alignItems:"center"},
  txName:      {color:"#1C1C1E",fontSize:14,fontWeight:"700"},
  txSub:       {color:"#9CA3AF",fontSize:11,fontWeight:"500",marginTop:1},
  txPmBadge:   {paddingHorizontal:9,paddingVertical:4,borderRadius:8},
  txPmTxt:     {fontSize:11,fontWeight:"700"},
  txDate:      {color:"#1C1C1E",fontSize:13,fontWeight:"700"},
  txStage:     {fontSize:10,fontWeight:"600",marginTop:2},
  txExpanded:  {width:"100%",flexDirection:"row",paddingTop:12,marginTop:4,
                gap:8,borderTopWidth:1,borderTopColor:"#F3F4F6"},

  empty:       {alignItems:"center",paddingVertical:40},
  emptyTxt:    {color:"#9CA3AF",fontSize:15,fontWeight:"600",marginTop:12,marginBottom:4},
  emptySubTxt: {color:"#9CA3AF",fontSize:12,textAlign:"center"},

  modalBd:     {flex:1,backgroundColor:"rgba(0,0,0,0.35)",justifyContent:"flex-end"},
  modalSheet:  {backgroundColor:"#FFF",borderTopLeftRadius:24,borderTopRightRadius:24,maxHeight:"60%"},
  modalHandle: {width:40,height:4,backgroundColor:"#E5E7EB",borderRadius:2,
                alignSelf:"center",marginTop:12,marginBottom:8},
  modalHeadRow:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",
                paddingHorizontal:20,paddingVertical:16,
                borderBottomWidth:1,borderBottomColor:"#F3F4F6"},
  modalHeadTxt:{color:"#1C1C1E",fontSize:18,fontWeight:"700"},
  modalOpt:    {flexDirection:"row",justifyContent:"space-between",alignItems:"center",
                paddingVertical:16,paddingHorizontal:20,
                borderBottomWidth:1,borderBottomColor:"#F9FAFB"},
  modalOptTxt: {color:"#374151",fontSize:16,fontWeight:"500"},

  measOverlay: {flex:1,backgroundColor:"rgba(0,0,0,0.55)",justifyContent:"flex-end"},
  measSheet:   {height:Dimensions.get("window").height*0.92,backgroundColor:"#F2F3F7",
                borderTopLeftRadius:30,borderTopRightRadius:30,overflow:"hidden"},
  measHead:    {backgroundColor:"#FFF",paddingHorizontal:16,paddingVertical:12,
                borderBottomWidth:1,borderBottomColor:"#F3F4F6",
                flexDirection:"row",alignItems:"center"},
  measAvatar:  {width:40,height:40,borderRadius:20,backgroundColor:"#3B82F6",
                justifyContent:"center",alignItems:"center"},
  measAvatarTxt:{color:"#FFF",fontSize:18,fontWeight:"800"},
  measName:    {color:"#1C1C1E",fontSize:16,fontWeight:"700"},
  measPhone:   {color:"#9CA3AF",fontSize:12,fontWeight:"500"},
  measInfoCard:{backgroundColor:"#FFF",padding:12,borderRadius:10,marginBottom:12,
                borderWidth:1,borderColor:"#F3F4F6"},
  mRow:        {flexDirection:"row",justifyContent:"space-between",alignItems:"center",
                backgroundColor:"#FFF",padding:14,borderRadius:10,marginBottom:8,
                borderWidth:1,borderColor:"#F3F4F6"},
  measBar:     {flexDirection:"row",padding:16,paddingBottom:24,backgroundColor:"#FFF",
                borderTopWidth:1,borderTopColor:"#F3F4F6",gap:8},
  measBtnSec:  {flex:1,flexDirection:"row",alignItems:"center",justifyContent:"center",
                backgroundColor:"#F3F4F6",paddingVertical:12,borderRadius:10,gap:6,
                borderWidth:1,borderColor:"#E5E7EB"},
  measBtnSecTxt:{color:"#6B7280",fontSize:13,fontWeight:"700"},
  measBtnPri:  {flex:1,flexDirection:"row",alignItems:"center",justifyContent:"center",
                backgroundColor:"#1C1C1E",paddingVertical:12,borderRadius:10,gap:6},
  measBtnPriTxt:{color:"#FFF",fontSize:13,fontWeight:"700"},

  gTab:        {backgroundColor:"#FFF",borderRadius:12,padding:8,alignItems:"center",
                minWidth:70,borderWidth:2,borderColor:"transparent"},
  gTabA:       {backgroundColor:"#EFF6FF"},
  gTabIcon:    {width:28,height:28,borderRadius:14,justifyContent:"center",
                alignItems:"center",marginBottom:4},
  gTabName:    {color:"#9CA3AF",fontSize:11,fontWeight:"700",marginBottom:2},
  gTabFit:     {color:"#9CA3AF",fontSize:9},

  navBar:      {position:"absolute",bottom:14,left:14,right:14,height:64,
                backgroundColor:"#1C1C1E",borderRadius:50,flexDirection:"row",
                alignItems:"center",paddingHorizontal:6,shadowColor:"#000",
                shadowOffset:{width:0,height:8},shadowOpacity:0.22,
                shadowRadius:18,elevation:16,overflow:"hidden"},
  navActivePill:{position:"absolute",top:6,bottom:6,backgroundColor:"#FFFFFF",
                 borderRadius:44,zIndex:0,shadowColor:"#000",
                 shadowOffset:{width:0,height:2},shadowOpacity:0.08,
                 shadowRadius:6,elevation:3},
  navItem:     {flex:1,height:"100%",justifyContent:"center",alignItems:"center",zIndex:1},
  navItemInner:{flexDirection:"row",alignItems:"center",justifyContent:"center",
                gap:6,paddingHorizontal:4},
  navActiveLabel:{color:"#1C1C1E",fontSize:13,fontWeight:"700",letterSpacing:-0.2},
});