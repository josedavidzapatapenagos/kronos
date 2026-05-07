import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { auth, db } from '../../services/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { logOut } from '../../services/authService';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        // Buscamos el documento en la colección 'users' que viste en la consola
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await logOut();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <ActivityIndicator style={{flex: 1, backgroundColor: '#000'}} color="#bb0000" />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Ícono de usuario basado en la sesión */}
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        
        <Text style={styles.userName}>{userData?.name || 'Usuario Kronnos'}</Text>
        <Text style={styles.userEmail}>{userData?.email}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>CERRAR SESIÓN</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20 },
  header: { alignItems: 'center', marginTop: 50, marginBottom: 40 },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#bb0000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#fff'
  },
  avatarText: { color: '#fff', fontSize: 40, fontWeight: 'bold' },
  userName: { color: '#fff', fontSize: 22, fontWeight: 'bold', letterSpacing: 1 },
  userEmail: { color: '#666', fontSize: 14, marginTop: 5 },
  logoutButton: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bb0000',
    alignItems: 'center'
  },
  logoutText: { color: '#bb0000', fontWeight: 'bold', letterSpacing: 1 }
});