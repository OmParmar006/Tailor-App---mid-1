import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigation } from "@react-navigation/native";

/* ================= MODERN DESIGN TOKENS (INDUSTRY STANDARD) ================= */
const COLORS = {
  bg: "#0B0F1A",
  card: "#111827",
  surface: "#0F172A",
  primary: "#6366F1",
  primarySoft: "rgba(99,102,241,0.12)",
  text: "#F1F5F9",
  subtext: "#94A3B8",
  border: "#1F2937",
  success: "#22C55E",
  danger: "#EF4444",
};

/* ================= HELPER FUNCTIONS ================= */
const getInitials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/* ================= AVATAR ================= */
const Avatar = ({ name }) => (
  <View style={styles.avatar}>
    <Text style={styles.avatarText}>{getInitials(name)}</Text>
  </View>
);

/* ================= CUSTOMER CARD ================= */
const CustomerCard = ({ item, onPress }) => {
  const unpaid = (item.unpaidAmount ?? 0) > 0;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={styles.cardInner}>
        <View style={styles.cardRow}>
          <Avatar name={item.name} />

          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.phone}>+91 {item.phone}</Text>

            <View style={styles.badgeRow}>
              {unpaid ? (
                <View style={[styles.badge, styles.unpaidBadge]}>
                  <Text style={styles.unpaidText}>Unpaid</Text>
                </View>
              ) : (
                <View style={[styles.badge, styles.paidBadge]}>
                  <Text style={styles.paidText}>Paid</Text>
                </View>
              )}
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={18}
            color={COLORS.subtext}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

/* ================= MAIN SCREEN ================= */
export default function CustomersScreen() {
  const navigation = useNavigation();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCustomers(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.phone?.includes(q)
    );
  }, [customers, search]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Customers</Text>
          <Text style={styles.headerSubtitle}>
            {customers.length} total customers
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddCustomer")}
        >
          <Ionicons name="add" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* ================= SEARCH ================= */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={COLORS.subtext} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search customers..."
          placeholderTextColor={COLORS.subtext}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons
              name="close-circle"
              size={18}
              color={COLORS.subtext}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* ================= LIST ================= */}
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading customers...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCustomers}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <CustomerCard
              item={item}
              onPress={() =>
                navigation.navigate("AddMeasurement", {
                  customerId: item.id,
                  customerName: item.name,
                  viewOnly: true,
                })
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="people-outline"
                size={60}
                color={COLORS.subtext}
              />
              <Text style={styles.emptyTitle}>No Customers Found</Text>
              <Text style={styles.emptySubtitle}>
                Add your first customer to get started
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },

  headerTitle: {
    fontSize: 24,
    color: COLORS.text,
    fontWeight: "700",
    letterSpacing: -0.5,
  },

  headerSubtitle: {
    fontSize: 13,
    color: COLORS.subtext,
    marginTop: 2,
  },

  addButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: COLORS.text,
    fontSize: 14,
  },

  card: {
    borderRadius: 20,
    backgroundColor: COLORS.card,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },

  cardInner: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
  },

  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primarySoft,
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "700",
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },

  phone: {
    fontSize: 13,
    color: COLORS.subtext,
    marginTop: 2,
  },

  badgeRow: {
    flexDirection: "row",
    marginTop: 8,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  unpaidBadge: {
    backgroundColor: "rgba(239,68,68,0.15)",
  },

  paidBadge: {
    backgroundColor: "rgba(34,197,94,0.15)",
  },

  unpaidText: {
    color: COLORS.danger,
    fontSize: 11,
    fontWeight: "600",
  },

  paidText: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: "600",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    color: COLORS.subtext,
    fontSize: 14,
  },

  emptyContainer: {
    alignItems: "center",
    marginTop: 80,
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
  },

  emptySubtitle: {
    color: COLORS.subtext,
    fontSize: 14,
    marginTop: 4,
  },
});
