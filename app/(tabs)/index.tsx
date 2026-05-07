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
import { auth, db } from '../../services/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function CatalogScreen() {
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const skeletonCards = [1, 2, 3, 4, 5, 6];
  
  // Datos para el carrusel (Banners de promociones o lanzamientos)
  const bannerImages = [
    { id: '1', color: '#1a1a1a', title: 'NUEVA COLECCIÓN' },
    { id: '2', color: '#220000', title: 'ARTISTAS' },
    { id: '3', color: '#111', title: 'KRONNOS PARA TODOS' },
  ];

  useEffect(() => {
    const getUserInfo = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserName(docSnap.data().name);
          }
        } catch (error) {
          console.error("Error al obtener nombre:", error);
        }
      }
      setLoading(false);
    };
    getUserInfo();
  }, []);

  // Componente del Carrusel
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
            {/* Aquí luego pondrás: <Image source={{uri: 'URL'}} style={styles.bannerImage} /> */}
            <View style={styles.bannerOverlay} />
          </View>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>PRODUCTOS</Text>
    </View>
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
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.userInitial}>
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* LISTA PRINCIPAL CON CARRUSEL COMO HEADER */}
      <FlatList
        ListHeaderComponent={renderHeader}
        data={skeletonCards}
        numColumns={2}
        keyExtractor={(item) => item.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={() => (
          <View style={styles.card}>
            <View style={styles.imagePlaceholder}>
              <View style={styles.innerSkeleton} />
            </View>
            <View style={styles.textSkeleton} />
            <View style={[styles.textSkeleton, { width: '40%' }]} />
            <TouchableOpacity style={styles.fakeButton}>
              <Text style={styles.buttonText}>DETALLES</Text>
            </TouchableOpacity>
          </View>
        )}
      />
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#bb0000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff'
  },
  userInitial: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  
  // Estilos del Carrusel
  carouselContainer: {
    height: 180,
    marginVertical: 10,
  },
  bannerCard: {
    width: width - 40,
    height: 160,
    marginHorizontal: 20,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333'
  },
  bannerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
    zIndex: 2
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)'
  },

  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
    letterSpacing: 2,
    borderLeftWidth: 3,
    borderLeftColor: '#bb0000',
    paddingLeft: 10
  },
  listContent: { paddingBottom: 20 },
  card: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    margin: 8,
    marginHorizontal: 15,
    borderRadius: 15,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  imagePlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: '#111',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  innerSkeleton: { width: '50%', height: '50%', backgroundColor: '#1a1a1a', borderRadius: 5 },
  textSkeleton: { height: 8, backgroundColor: '#1a1a1a', borderRadius: 4, marginBottom: 6, width: '90%' },
  fakeButton: {
    marginTop: 5,
    backgroundColor: '#bb0000',
    paddingVertical: 6,
    borderRadius: 5,
    alignItems: 'center'
  },
  buttonText: { color: '#fff', fontSize: 10, fontWeight: 'bold' }
});