// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Alert,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { signOut } from 'firebase/auth';
// import { auth } from '../firebaseConfig';

// export default function ProfileScreen() {
//   const navigation = useNavigation();
//   const user = auth.currentUser;

//   const handleLogout = () => {
//     Alert.alert(
//       'Logout',
//       'Are you sure you want to logout?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Logout',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               await signOut(auth);
//               navigation.reset({
//                 index: 0,
//                 routes: [{ name: 'Welcome' }],
//               });
//             } catch (error) {
//               Alert.alert('Error', 'Failed to logout');
//             }
//           },
//         },
//       ]
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView showsVerticalScrollIndicator={false}>
        
//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => navigation.goBack()}>
//             <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Profile</Text>
//           <View style={{ width: 24 }} />
//         </View>

//         {/* Profile Card (Essential) */}
//         <View style={styles.profileCard}>
//           <View style={styles.avatarLarge}>
//             <Text style={styles.avatarLargeText}>
//               {user?.email?.charAt(0).toUpperCase() || 'Y'}
//             </Text>
//           </View>
//           <Text style={styles.userName}>Yogi's Tailoring</Text>
//           <Text style={styles.userEmail}>
//             {user?.email || 'user@example.com'}
//           </Text>
//         </View>

//         {/* Business Information (Essential for Tailor App) */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Business Information</Text>

//           <MenuItem
//             icon="business-outline"
//             label="Business Name"
//             value="Yogi's Tailoring"
//           />

//           <MenuItem
//             icon="call-outline"
//             label="Phone Number"
//             value="+91 98765 43210"
//           />

//           <MenuItem
//             icon="location-outline"
//             label="Location"
//             value="Anand, Gujarat"
//           />
//         </View>

//         {/* Logout (MOST IMPORTANT) */}
//         <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
//           <Ionicons name="log-out-outline" size={22} color="#EF4444" />
//           <Text style={styles.logoutText}>Logout</Text>
//         </TouchableOpacity>

//         <View style={{ height: 40 }} />
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// /* Simple Menu Item */
// const MenuItem = ({ icon, label, value }) => (
//   <View style={styles.menuItem}>
//     <View style={styles.menuLeft}>
//       <View style={styles.menuIconContainer}>
//         <Ionicons name={icon} size={20} color="#3B82F6" />
//       </View>
//       <Text style={styles.menuLabel}>{label}</Text>
//     </View>
//     <Text style={styles.menuValue}>{value}</Text>
//   </View>
// );

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#0A0E1A',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: '800',
//     color: '#F8FAFC',
//   },
//   profileCard: {
//     alignItems: 'center',
//     backgroundColor: '#1E293B',
//     marginHorizontal: 20,
//     marginBottom: 24,
//     padding: 24,
//     borderRadius: 20,
//   },
//   avatarLarge: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: '#3B82F6',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   avatarLargeText: {
//     color: '#FFFFFF',
//     fontSize: 36,
//     fontWeight: '800',
//   },
//   userName: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: '#F8FAFC',
//     marginBottom: 4,
//   },
//   userEmail: {
//     fontSize: 14,
//     color: '#94A3B8',
//   },
//   section: {
//     marginBottom: 24,
//     paddingHorizontal: 20,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#94A3B8',
//     marginBottom: 12,
//   },
//   menuItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: '#1E293B',
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 10,
//   },
//   menuLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   menuIconContainer: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: 'rgba(59, 130, 246, 0.1)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   menuLabel: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#E2E8F0',
//   },
//   menuValue: {
//     fontSize: 14,
//     color: '#64748B',
//     fontWeight: '500',
//   },
//   logoutBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#450A0A',
//     marginHorizontal: 20,
//     padding: 16,
//     borderRadius: 12,
//     gap: 8,
//     borderWidth: 1,
//     borderColor: '#7F1D1D',
//   },
//   logoutText: {
//     color: '#EF4444',
//     fontSize: 16,
//     fontWeight: '700',
//   },
// });


import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from '../context/LanguageToggle';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const user = auth.currentUser;

  const handleLogout = () => {
    Alert.alert(
      t.logout || 'Logout',
      t.logoutConfirm || 'Are you sure you want to logout?',
      [
        { text: t.cancel || 'Cancel', style: 'cancel' },
        {
          text: t.logout || 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            } catch (error) {
              Alert.alert(t.error || 'Error', t.logoutFailed || 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.profile}</Text>
          <LanguageToggle />
        </View>

        {/* Profile Card (Essential) */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {user?.email?.charAt(0).toUpperCase() || 'Y'}
            </Text>
          </View>
          <Text style={styles.userName}>Yogi's Tailoring</Text>
          <Text style={styles.userEmail}>
            {user?.email || 'user@example.com'}
          </Text>
        </View>

        {/* Business Information (Essential for Tailor App) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.businessInfo || 'Business Information'}</Text>

          <MenuItem
            icon="business-outline"
            label={t.businessName || 'Business Name'}
            value="Yogi's Tailoring"
          />

          <MenuItem
            icon="call-outline"
            label={t.phoneNumber || 'Phone Number'}
            value="+91 98765 43210"
          />

          <MenuItem
            icon="location-outline"
            label={t.location || 'Location'}
            value="Anand, Gujarat"
          />
        </View>

        {/* Logout (MOST IMPORTANT) */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>{t.logout || 'Logout'}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* Simple Menu Item */
const MenuItem = ({ icon, label, value }) => (
  <View style={styles.menuItem}>
    <View style={styles.menuLeft}>
      <View style={styles.menuIconContainer}>
        <Ionicons name={icon} size={20} color="#3B82F6" />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
    </View>
    <Text style={styles.menuValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#1E293B',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    borderRadius: 20,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarLargeText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '800',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#94A3B8',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  menuValue: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#450A0A',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#7F1D1D',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700',
  },
});