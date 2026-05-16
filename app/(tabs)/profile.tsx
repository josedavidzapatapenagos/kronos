import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { logOut } from '../../services/authService';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logOut();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error(error);
    }
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
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        
        {/* Badge de Admin */}
        {user?.rol === 'admin' && (
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>CUENTA DE ADMINISTRADOR</Text>
          </View>
        )}
      </View>

      <View style={styles.menu}>
        {/* BOTÓN EXCLUSIVO PARA ADMINS */}
        {user?.rol === 'admin' && (
          <TouchableOpacity 
            style={styles.adminButton} 
            onPress={() => router.push('/admin/panel')}
          >
            <Text style={styles.adminButtonText}>AGREGAR MODELO</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Mis Compras</Text>
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
    borderWidth: 2, borderColor: '#bb0000'
  },
  avatarText: { color: '#fff', fontSize: 35, fontWeight: 'bold' },
  userName: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  userEmail: { color: '#666', fontSize: 14 },
  adminBadge: {
    backgroundColor: '#bb000022', paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 20, marginTop: 10, borderWidth: 1, borderColor: '#bb0000'
  },
  adminBadgeText: { color: '#bb0000', fontSize: 10, fontWeight: 'bold' },
  menu: { gap: 15 },
  menuItem: {
    backgroundColor: '#1a1a1a', padding: 18, borderRadius: 10,
    borderWidth: 1, borderColor: '#333'
  },
  menuItemText: { color: '#fff', fontWeight: '500' },
  adminButton: {
    backgroundColor: '#bb0000', padding: 20, borderRadius: 10,
    alignItems: 'center', marginBottom: 10
  },
  adminButtonText: { color: '#fff', fontWeight: 'bold', letterSpacing: 1 },
  logoutButton: { marginTop: 20, padding: 15, alignItems: 'center' },
  logoutText: { color: '#666', fontWeight: 'bold', textDecorationLine: 'underline' }
});