import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Dimensions, 
  Image, 
  TouchableOpacity,
  ActivityIndicator,
  ScrollView 
} from 'react-native';
import { db } from '../../services/firebaseConfig';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext'; // Usamos tu nuevo contexto
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function CatalogScreen() {
  const { user, loading: authLoading } = useAuth();
  const [shoes, setShoes] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();

  // Banners del carrusel
  const bannerImages = [
    { id: '1', color: '#1a1a1a', title: 'NUEVA COLECCIÓN' },
    { id: '2', color: '#220000', title: 'EDICIÓN LIMITADA' },
    { id: '3', color: '#111', title: 'KRONNOS EXCLUSIVE' },
  ];

  useEffect(() => {
    // Escucha en tiempo real de la colección 'shoes'
    const q = query(collection(db, "shoes"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const shoesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setShoes(shoesList);
      setFetching(false);
    });

    return () => unsubscribe();
  }, []);

  const renderHeader = () => (
    <View>
      <ScrollView 
        horizontal 
        pagingEnabled 
        showsHorizontalScrollIndicator={false}
        style={styles.carouselContainer}
      >
        {bannerImages.map((banner) => (
          <View key={banner.id} style={[styles.bannerCard, { backgroundColor: banner.color }]}>
            <Text style={styles.bannerText}>{banner.title}</Text>
            <View style={styles.bannerOverlay} />
          </View>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>PRODUCTOS DISPONIBLES</Text>
    </View>
  );

  const renderShoeItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push({
        pathname: "/(detail)/[id]",
        params: { id: item.id }
      })}
    >
      <View style={styles.imagePlaceholder}>
        <Text style={styles.brandBadge}>{item.brand || 'KRONNOS'}</Text>
        {/* Aquí podrías poner una imagen si la subes, o un icono 3D */}
        <Text style={{color: '#333', fontSize: 10, marginTop: 10}}>MODELO 3D CARGADO</Text>
      </View>
      
      <Text style={styles.shoeName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.shoePrice}>${item.price}</Text>
      
      <TouchableOpacity 
        style={styles.fakeButton}
        onPress={() => router.push(`/(detail)/${item.id}`)}
      >
        <Text style={styles.buttonText}>VER EN 3D</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* HEADER FIJO */}
      <View style={styles.header}>
        <Image 
          source={require('../../assets/images/kronoslogo.png')} 
          style={styles.smallLogo} 
          resizeMode="contain" 
        />
        
        <TouchableOpacity 
          onPress={() => router.push('/(tabs)/profile')}
          style={styles.userIcon}
        >
          {authLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.userInitial}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* LISTA DINÁMICA */}
      {fetching ? (
        <View style={{flex: 1, justifyContent: 'center'}}>
          <ActivityIndicator size="large" color="#bb0000" />
        </View>
      ) : (
        <FlatList
          ListHeaderComponent={renderHeader}
          data={shoes}
          numColumns={2}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={renderShoeItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay productos en el catálogo.</Text>
              {user?.rol === 'admin' && (
                <Text style={{color: '#bb0000', marginTop: 10}}>Usa el panel de admin para subir uno.</Text>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: 50 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  smallLogo: { width: 100, height: 40 },
  userIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#bb0000', justifyContent: 'center',
    alignItems: 'center', borderWidth: 1, borderColor: '#fff'
  },
  userInitial: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  
  carouselContainer: { height: 180, marginVertical: 10 },
  bannerCard: {
    width: width - 40, height: 160, marginHorizontal: 20,
    borderRadius: 15, justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden', borderWidth: 1, borderColor: '#333'
  },
  bannerText: { color: '#fff', fontSize: 20, fontWeight: 'bold', letterSpacing: 2, zIndex: 2 },
  bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },

  sectionTitle: {
    color: '#fff', fontSize: 18, fontWeight: 'bold', marginHorizontal: 20,
    marginTop: 10, marginBottom: 15, letterSpacing: 2,
    borderLeftWidth: 3, borderLeftColor: '#bb0000', paddingLeft: 10
  },
  listContent: { paddingBottom: 20, paddingHorizontal: 5 },
  card: {
    flex: 1, backgroundColor: '#0a0a0a', margin: 10,
    borderRadius: 15, padding: 12, borderWidth: 1, borderColor: '#1a1a1a',
    maxWidth: (width / 2) - 20
  },
  imagePlaceholder: {
    width: '100%', height: 100, backgroundColor: '#111',
    borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10
  },
  brandBadge: { color: '#bb0000', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  shoeName: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  shoePrice: { color: '#666', fontSize: 13, marginBottom: 10 },
  fakeButton: {
    backgroundColor: '#bb0000', paddingVertical: 8, borderRadius: 5, alignItems: 'center'
  },
  buttonText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#666' }
});