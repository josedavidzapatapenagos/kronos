import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { logOut } from '../../services/authService';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logOut();
      router.replace('/(auth)/login');
    } catch (error) { console.error(error); }
  };

  if (loading) return (
    <View style={[styles.container, {justifyContent: 'center'}]}>
      <ActivityIndicator color="#bb0000" size="large" />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'Usuario Kronos'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        
        {user?.rol === 'admin' && (
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>MODO ADMINISTRADOR</Text>
          </View>
        )}
      </View>

      <View style={styles.menu}>
        {user?.rol === 'admin' && (
          <TouchableOpacity style={styles.adminButton} onPress={() => router.push('/admin/panel')}>
            <Text style={styles.adminButtonText}>AGREGAR PRODUCTO (+)</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => router.push('/(tabs)/order-summary')}
        >
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemText}>MIS PEDIDOS</Text>
            <Ionicons name="chevron-forward" size={18} color="#333" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/settings')}>
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemText}>CONFIGURACIÓN</Text>
            <Ionicons name="settings-outline" size={18} color="#333" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>CERRAR SESIÓN</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20 },
  header: { alignItems: 'center', marginTop: 40, marginBottom: 30 },
  avatarContainer: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: '#111',
    justifyContent: 'center', alignItems: 'center', marginBottom: 15,
    borderWidth: 1, borderColor: '#bb0000'
  },
  avatarText: { color: '#fff', fontSize: 35, fontWeight: 'bold' },
  userName: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  userEmail: { color: '#555', fontSize: 14 },
  adminBadge: { backgroundColor: '#bb0000', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, marginTop: 10 },
  adminBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  menu: { gap: 10 },
  menuItem: { backgroundColor: '#080808', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#111' },
  menuItemContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  menuItemText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  adminButton: { backgroundColor: '#fff', padding: 18, borderRadius: 15, alignItems: 'center', marginBottom: 10 },
  adminButtonText: { color: '#000', fontWeight: 'bold' },
  logoutButton: { marginTop: 40, alignItems: 'center' },
  logoutText: { color: '#bb0000', fontWeight: 'bold', textDecorationLine: 'underline' }
});