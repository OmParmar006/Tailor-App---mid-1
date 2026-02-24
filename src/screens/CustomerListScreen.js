import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Modal,
  Alert,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const CustomerListScreen = ({ navigation }) => {
  // State Management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    city: '',
    minSpent: '',
    maxSpent: '',
  });

  // Mock Customer Data
  const [customers, setCustomers] = useState([
    {
      id: '1',
      name: 'Saksham Sharma',
      phone: '9876543210',
      email: 'saksham@example.com',
      city: 'Delhi',
      totalOrders: 15,
      totalSpent: 45250,
      status: 'Active',
      lastOrder: '23 Feb 2026',
      joinDate: '10 Jan 2026',
      measurements: [
        { id: 'm1', garment: 'Shirt', chest: 40, waist: 34, length: 28, date: '23 Feb 2026' },
        { id: 'm2', garment: 'Pants', waist: 34, length: 32, inseam: 30, date: '15 Feb 2026' },
      ],
    },
    {
      id: '2',
      name: 'Priya Patel',
      phone: '9123456789',
      email: 'priya@example.com',
      city: 'Mumbai',
      totalOrders: 8,
      totalSpent: 28900,
      status: 'Active',
      lastOrder: '20 Feb 2026',
      joinDate: '05 Dec 2025',
      measurements: [
        { id: 'm1', garment: 'Saree Blouse', bust: 36, waist: 28, length: 24, date: '20 Feb 2026' },
      ],
    },
    {
      id: '3',
      name: 'Rajesh Kumar',
      phone: '9876123456',
      email: 'rajesh@example.com',
      city: 'Bangalore',
      totalOrders: 3,
      totalSpent: 12500,
      status: 'Inactive',
      lastOrder: '10 Jan 2026',
      joinDate: '20 Nov 2025',
      measurements: [],
    },
    {
      id: '4',
      name: 'Ananya Gupta',
      phone: '9999888777',
      email: 'ananya@example.com',
      city: 'Pune',
      totalOrders: 22,
      totalSpent: 67800,
      status: 'Active',
      lastOrder: '25 Feb 2026',
      joinDate: '01 Oct 2025',
      measurements: [
        { id: 'm1', garment: 'Kurta', bust: 38, waist: 30, length: 26, date: '25 Feb 2026' },
        { id: 'm2', garment: 'Jacket', chest: 40, waist: 35, length: 26, date: '10 Feb 2026' },
      ],
    },
    {
      id: '5',
      name: 'Vikram Singh',
      phone: '8765432109',
      email: 'vikram@example.com',
      city: 'Hyderabad',
      totalOrders: 5,
      totalSpent: 18600,
      status: 'Pending',
      lastOrder: '15 Feb 2026',
      joinDate: '25 Jan 2026',
      measurements: [],
    },
  ]);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editFormData, setEditFormData] = useState(null);

  // Filter customers based on search and filters
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      // Basic search
      const matchesSearch =
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus =
        selectedStatus === 'All' || customer.status === selectedStatus;

      // Advanced filters
      let matchesAdvanced = true;
      if (advancedFilters.city) {
        matchesAdvanced =
          matchesAdvanced &&
          customer.city.toLowerCase().includes(advancedFilters.city.toLowerCase());
      }
      if (advancedFilters.minSpent) {
        matchesAdvanced =
          matchesAdvanced && customer.totalSpent >= parseInt(advancedFilters.minSpent);
      }
      if (advancedFilters.maxSpent) {
        matchesAdvanced =
          matchesAdvanced && customer.totalSpent <= parseInt(advancedFilters.maxSpent);
      }

      return matchesSearch && matchesStatus && matchesAdvanced;
    });
  }, [searchQuery, selectedStatus, advancedFilters, customers]);

  // Statistics
  const statistics = useMemo(() => {
    return {
      totalCustomers: customers.length,
      activeCustomers: customers.filter((c) => c.status === 'Active').length,
      totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
      averageOrderValue: Math.floor(
        customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length
      ),
    };
  }, [customers]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  // Handle delete customer
  const handleDeleteCustomer = (customerId) => {
    Alert.alert(
      'Delete Customer',
      'Are you sure you want to delete this customer? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setCustomers(customers.filter((c) => c.id !== customerId));
            setModalVisible(false);
            Alert.alert('Success', 'Customer deleted successfully');
          },
        },
      ]
    );
  };

  // Handle edit customer
  const handleEditCustomer = (customer) => {
    setEditFormData({ ...customer });
    setEditModalVisible(true);
  };

  // Save edited customer
  const handleSaveEdit = () => {
    setCustomers(
      customers.map((c) => (c.id === editFormData.id ? editFormData : c))
    );
    setEditModalVisible(false);
    setModalVisible(false);
    Alert.alert('Success', 'Customer updated successfully');
  };

  // Format currency
  const formatCurrency = (amount) => {
    return '₹' + amount.toLocaleString('en-IN');
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return { bg: '#ECFDF5', text: '#059669', icon: 'check-circle' };
      case 'Inactive':
        return { bg: '#FEF2F2', text: '#DC2626', icon: 'close-circle' };
      case 'Pending':
        return { bg: '#FFFBEB', text: '#D97706', icon: 'clock' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280', icon: 'help-circle' };
    }
  };

  // Render Statistics
  const renderStatistics = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <MaterialCommunityIcons name="account-multiple" size={20} color="#3B82F6" />
        <Text style={styles.statValue}>{statistics.totalCustomers}</Text>
        <Text style={styles.statLabel}>Total</Text>
      </View>
      <View style={styles.statCard}>
        <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
        <Text style={styles.statValue}>{statistics.activeCustomers}</Text>
        <Text style={styles.statLabel}>Active</Text>
      </View>
      <View style={styles.statCard}>
        <MaterialCommunityIcons name="currency-inr" size={20} color="#F59E0B" />
        <Text style={styles.statValue}>{Math.floor(statistics.totalRevenue / 100000)}L</Text>
        <Text style={styles.statLabel}>Revenue</Text>
      </View>
      <View style={styles.statCard}>
        <MaterialCommunityIcons name="chart-line" size={20} color="#8B5CF6" />
        <Text style={styles.statValue}>{formatCurrency(statistics.averageOrderValue)}</Text>
        <Text style={styles.statLabel}>Avg Order</Text>
      </View>
    </View>
  );

  // Render Search Bar
  const renderSearchBar = () => (
    <View style={styles.searchSection}>
      <View style={styles.searchInputWrapper}>
        <Ionicons name="search" size={18} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, phone, email..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={styles.advancedSearchBtn}
        onPress={() => setShowAdvancedSearch(!showAdvancedSearch)}
      >
        <MaterialCommunityIcons
          name={showAdvancedSearch ? 'filter-off' : 'filter'}
          size={18}
          color="#3B82F6"
        />
        <Text style={styles.advancedSearchBtnText}>
          {showAdvancedSearch ? 'Clear Filters' : 'Advanced Search'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render Advanced Search
  const renderAdvancedSearch = () => {
    if (!showAdvancedSearch) return null;

    return (
      <View style={styles.advancedSearchContainer}>
        <Text style={styles.advancedSearchTitle}>Advanced Filters</Text>

        <View style={styles.filterInputGroup}>
          <Text style={styles.filterLabel}>City</Text>
          <TextInput
            style={styles.filterInput}
            placeholder="Enter city"
            placeholderTextColor="#9CA3AF"
            value={advancedFilters.city}
            onChangeText={(text) =>
              setAdvancedFilters({ ...advancedFilters, city: text })
            }
          />
        </View>

        <View style={styles.filterRow}>
          <View style={[styles.filterInputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.filterLabel}>Min Amount (₹)</Text>
            <TextInput
              style={styles.filterInput}
              placeholder="Min"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={advancedFilters.minSpent}
              onChangeText={(text) =>
                setAdvancedFilters({ ...advancedFilters, minSpent: text })
              }
            />
          </View>
          <View style={[styles.filterInputGroup, { flex: 1 }]}>
            <Text style={styles.filterLabel}>Max Amount (₹)</Text>
            <TextInput
              style={styles.filterInput}
              placeholder="Max"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={advancedFilters.maxSpent}
              onChangeText={(text) =>
                setAdvancedFilters({ ...advancedFilters, maxSpent: text })
              }
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.resetFiltersBtn}
          onPress={() => {
            setAdvancedFilters({ city: '', minSpent: '', maxSpent: '' });
            setSearchQuery('');
          }}
        >
          <MaterialCommunityIcons name="refresh" size={16} color="#6B7280" />
          <Text style={styles.resetFiltersBtnText}>Reset All Filters</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render Status Filter
  const renderStatusFilter = () => (
    <View style={styles.filterContainer}>
      {['All', 'Active', 'Inactive', 'Pending'].map((status) => (
        <TouchableOpacity
          key={status}
          style={[
            styles.filterButton,
            selectedStatus === status && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedStatus(status)}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedStatus === status && styles.filterButtonTextActive,
            ]}
          >
            {status}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Render Customer Card
  const renderCustomerCard = ({ item }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity
        style={styles.customerCard}
        onPress={() => {
          setSelectedCustomer(item);
          setModalVisible(true);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.customerBasicInfo}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
            <View style={styles.customerTextInfo}>
              <Text style={styles.customerName}>{item.name}</Text>
              <Text style={styles.customerCity}>{item.city}</Text>
              <Text style={styles.customerPhone}>{item.phone}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
            <MaterialCommunityIcons name={statusColor.icon} size={14} color={statusColor.text} />
            <Text style={[styles.statusText, { color: statusColor.text }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardStats}>
          <View style={styles.statItem}>
            <Text style={styles.statItemLabel}>Orders</Text>
            <Text style={styles.statItemValue}>{item.totalOrders}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statItemLabel}>Spent</Text>
            <Text style={styles.statItemValue}>{formatCurrency(item.totalSpent)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statItemLabel}>Measurements</Text>
            <Text style={styles.statItemValue}>{item.measurements.length}</Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setSelectedCustomer(item);
              setModalVisible(true);
            }}
          >
            <MaterialCommunityIcons name="eye" size={16} color="#3B82F6" />
            <Text style={styles.actionButtonText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditCustomer(item)}
          >
            <MaterialCommunityIcons name="pencil" size={16} color="#F59E0B" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteCustomer(item.id)}
          >
            <MaterialCommunityIcons name="trash-can" size={16} color="#EF4444" />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Render Empty State
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="account-search-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No Customers Found</Text>
      <Text style={styles.emptyText}>
        {searchQuery || selectedStatus !== 'All' || Object.values(advancedFilters).some(v => v)
          ? 'Try adjusting your filters'
          : 'No customers yet'}
      </Text>
    </View>
  );

  // Render Customer Details Modal
  const renderCustomerModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <AntDesign name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Customer Details</Text>
            <View style={{ width: 40 }} />
          </View>

          {selectedCustomer && (
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Customer Info */}
              <View style={styles.modalSection}>
                <View style={styles.modalCustomerCard}>
                  <View style={styles.modalAvatarContainer}>
                    <Text style={styles.modalAvatarText}>
                      {selectedCustomer.name.charAt(0)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalCustomerName}>{selectedCustomer.name}</Text>
                    <Text style={styles.modalCustomerCity}>{selectedCustomer.city}</Text>
                  </View>
                </View>
              </View>

              {/* Contact Info */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Contact Information</Text>
                <View style={styles.infoRow}>
                  <Ionicons name="call" size={18} color="#3B82F6" />
                  <Text style={styles.infoText}>{selectedCustomer.phone}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="mail" size={18} color="#3B82F6" />
                  <Text style={styles.infoText}>{selectedCustomer.email}</Text>
                </View>
              </View>

              {/* Statistics */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Order Statistics</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statsGridItem}>
                    <Text style={styles.statsGridLabel}>Total Orders</Text>
                    <Text style={styles.statsGridValue}>{selectedCustomer.totalOrders}</Text>
                  </View>
                  <View style={styles.statsGridItem}>
                    <Text style={styles.statsGridLabel}>Total Spent</Text>
                    <Text style={styles.statsGridValue}>
                      {formatCurrency(selectedCustomer.totalSpent)}
                    </Text>
                  </View>
                  <View style={styles.statsGridItem}>
                    <Text style={styles.statsGridLabel}>Joined</Text>
                    <Text style={styles.statsGridValue}>{selectedCustomer.joinDate}</Text>
                  </View>
                </View>
              </View>

              {/* Measurements */}
              <View style={styles.modalSection}>
                <View style={styles.measurementHeader}>
                  <Text style={styles.modalSectionTitle}>Measurements</Text>
                  <Text style={styles.measurementCount}>{selectedCustomer.measurements.length}</Text>
                </View>
                {selectedCustomer.measurements.length > 0 ? (
                  selectedCustomer.measurements.map((measurement) => (
                    <View key={measurement.id} style={styles.measurementItem}>
                      <View style={styles.measurementTop}>
                        <Text style={styles.measurementGarment}>{measurement.garment}</Text>
                        <Text style={styles.measurementDate}>{measurement.date}</Text>
                      </View>
                      <View style={styles.measurementDetails}>
                        {Object.entries(measurement).map(([key, value]) => {
                          if (key === 'id' || key === 'garment' || key === 'date') return null;
                          return (
                            <Text key={key} style={styles.measurementDetail}>
                              {key.charAt(0).toUpperCase() + key.slice(1)}: {value}"
                            </Text>
                          );
                        })}
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noMeasurements}>No measurements recorded yet</Text>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleEditCustomer(selectedCustomer)}
                >
                  <MaterialCommunityIcons name="pencil" size={20} color="#F59E0B" />
                  <Text style={styles.actionBtnText}>Edit Customer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => handleDeleteCustomer(selectedCustomer.id)}
                >
                  <MaterialCommunityIcons name="trash-can" size={20} color="#EF4444" />
                  <Text style={[styles.actionBtnText, { color: '#EF4444' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  // Render Edit Modal
  const renderEditModal = () => (
    <Modal
      visible={editModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setEditModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setEditModalVisible(false)}
            >
              <AntDesign name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Customer</Text>
            <View style={{ width: 40 }} />
          </View>

          {editFormData && (
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Full Name</Text>
                <TextInput
                  style={styles.formInput}
                  value={editFormData.name}
                  onChangeText={(text) => setEditFormData({ ...editFormData, name: text })}
                  placeholder="Customer name"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Phone</Text>
                <TextInput
                  style={styles.formInput}
                  value={editFormData.phone}
                  onChangeText={(text) => setEditFormData({ ...editFormData, phone: text })}
                  placeholder="Phone number"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email</Text>
                <TextInput
                  style={styles.formInput}
                  value={editFormData.email}
                  onChangeText={(text) => setEditFormData({ ...editFormData, email: text })}
                  placeholder="Email address"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>City</Text>
                <TextInput
                  style={styles.formInput}
                  value={editFormData.city}
                  onChangeText={(text) => setEditFormData({ ...editFormData, city: text })}
                  placeholder="City"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Status</Text>
                <View style={styles.statusSelectContainer}>
                  {['Active', 'Inactive', 'Pending'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusSelectBtn,
                        editFormData.status === status && styles.statusSelectBtnActive,
                      ]}
                      onPress={() => setEditFormData({ ...editFormData, status })}
                    >
                      <Text
                        style={[
                          styles.statusSelectBtnText,
                          editFormData.status === status && styles.statusSelectBtnTextActive,
                        ]}
                      >
                        {status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.saveButtonContainer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
                  <MaterialCommunityIcons name="check" size={20} color="#FFF" />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Customers</Text>
        <Text style={styles.headerSubtitle}>
          {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={filteredCustomers}
        renderItem={renderCustomerCard}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <>
            {renderStatistics()}
            {renderSearchBar()}
            {renderAdvancedSearch()}
            {renderStatusFilter()}
          </>
        }
        ListEmptyComponent={renderEmptyState()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddCustomer')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* Modals */}
      {renderCustomerModal()}
      {renderEditModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 16,
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    marginVertical: 8,
    borderRadius: 12,
    marginHorizontal: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
  searchSection: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    marginVertical: 4,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 14,
    color: '#1F2937',
  },
  advancedSearchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  advancedSearchBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 6,
  },
  advancedSearchContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    marginVertical: 4,
    borderRadius: 8,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  advancedSearchTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  filterInputGroup: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  filterInput: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: '#1F2937',
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  resetFiltersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  resetFiltersBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 6,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    marginVertical: 4,
  },
  filterButton: {
    marginHorizontal: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterButtonActive: {
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#3B82F6',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 100,
  },
  customerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginVertical: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  customerBasicInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  customerTextInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  customerCity: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  customerPhone: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 10,
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statItemLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  statItemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginHorizontal: 4,
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 32,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalCloseButton: {
    padding: 8,
    width: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  modalBody: {
    paddingHorizontal: 16,
  },
  modalSection: {
    marginVertical: 16,
  },
  modalCustomerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  modalAvatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalCustomerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalCustomerCity: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1F2937',
    marginLeft: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsGridItem: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statsGridLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  statsGridValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
  measurementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  measurementCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B82F6',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  measurementItem: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottomText: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  measurementTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  measurementGarment: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  measurementDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  measurementDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  measurementDetail: {
    fontSize: 11,
    color: '#6B7280',
    marginRight: 12,
    marginBottom: 4,
  },
  noMeasurements: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  modalActions: {
    flexDirection: 'row',
    marginVertical: 16,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    marginHorizontal: 6,
  },
  deleteBtn: {
    backgroundColor: '#FEF2F2',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 8,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1F2937',
  },
  statusSelectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusSelectBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    alignItems: 'center',
  },
  statusSelectBtnActive: {
    backgroundColor: '#DBEAFE',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  statusSelectBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  statusSelectBtnTextActive: {
    color: '#3B82F6',
  },
  saveButtonContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});

export default CustomerListScreen;