import React, { useEffect, useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, ActivityIndicator, 
  Image, TouchableOpacity, ScrollView, Dimensions, Alert 
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { db } from '../../services/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { Canvas, useFrame } from '@react-three/fiber/native';
import { useGLTF, OrbitControls, Stage } from '@react-three/drei/native';
import { useCart } from '../../context/CartContext'; 
import * as THREE from 'three';

const { width } = Dimensions.get('window');

const SIZES = ['38', '39', '40', '41', '42', '43'];

const SHOE_COLORS = [
  { name: 'Original', color: null },
  { name: 'Rojo', color: '#ff0000' },
  { name: 'Azul', color: '#0000ff' },
  { name: 'Verde', color: '#00ff00' },
  { name: 'Negro', color: '#111111' },
  { name: 'Blanco', color: '#ffffff' },
];

// --- MODELO 3D OPTIMIZADO (Solución definitiva WeakMap) ---
function AnimatedModel({ url, selectedColor }: { url: string, selectedColor: string | null }) {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);

  // Limpieza de memoria al desmontar
  useEffect(() => {
    return () => {
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.geometry.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(m => m.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      });
    };
  }, [scene]);

  // Aplicación de color
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (selectedColor) {
          (mesh.material as THREE.MeshStandardMaterial).color.set(selectedColor);
        }
      }
    });
  }, [scene, selectedColor]);

  useFrame((state, delta) => {
    if (modelRef.current) modelRef.current.rotation.y += delta * 0.4;
  });

  return <primitive key={url} ref={modelRef} object={scene} scale={1.6} />;
}

export default function DetailScreen() {
  const { id } = useLocalSearchParams();
  const { addToCart } = useCart();
  
  const [shoe, setShoe] = useState<any>(null);
  const [view3D, setView3D] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentColor, setCurrentColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState('40');

  useEffect(() => {
    const fetchShoe = async () => {
      try {
        const docSnap = await getDoc(doc(db, "shoes", id as string));
        if (docSnap.exists()) {
          setShoe({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error al cargar producto:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchShoe();
  }, [id]);

  const handleAddToCart = () => {
    if (!shoe) return;
    
    // Pasamos el objeto del zapato con el color y talla seleccionados
    addToCart({ 
      ...shoe, 
      customColor: currentColor 
    }, selectedSize);
    
    Alert.alert("Añadido", `${shoe.name} (Talla ${selectedSize}) se agregó al carrito.`);
  };

  if (loading) return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color="#bb0000" />
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* VISOR 3D ESTABLE */}
      <View style={styles.viewerContainer}>
        {view3D ? (
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }} shadows={false}>
            <ambientLight intensity={1.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            
            <Stage 
              intensity={0.4} 
              environment="city" 
              adjustCamera={1.2} 
              shadows={false} 
            >
              {shoe?.modelUrl && (
                <AnimatedModel url={shoe.modelUrl} selectedColor={currentColor} />
              )}
            </Stage>
            <OrbitControls enablePan={false} makeDefault />
          </Canvas>
        ) : (
          <Image 
            source={{ uri: shoe?.imageUrls?.[0] }} 
            style={styles.mainImage} 
            resizeMode="contain" 
          />
        )}

        <TouchableOpacity style={styles.toggleBtn} onPress={() => setView3D(!view3D)}>
          <Text style={styles.toggleText}>
            {view3D ? "VER FOTO" : "PERSONALIZAR 3D"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.brand}>{shoe?.brand?.toUpperCase()}</Text>
        <Text style={styles.name}>{shoe?.name}</Text>
        
        {view3D && (
          <View style={styles.optionsContainer}>
            <Text style={styles.sectionTitle}>Color personalizado:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {SHOE_COLORS.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorCircle, 
                    { backgroundColor: item.color || '#333' },
                    currentColor === item.color && styles.activeColorCircle
                  ]}
                  onPress={() => setCurrentColor(item.color)}
                >
                  {!item.color && <Text style={{fontSize: 8, color: '#fff'}}>Orig</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.optionsContainer}>
          <Text style={styles.sectionTitle}>Talla (US):</Text>
          <View style={styles.sizeGrid}>
            {SIZES.map((size) => (
              <TouchableOpacity 
                key={size} 
                style={[styles.sizeCard, selectedSize === size && styles.activeSizeCard]}
                onPress={() => setSelectedSize(size)}
              >
                <Text style={[styles.sizeText, selectedSize === size && styles.activeSizeText]}>{size}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Precio de lista</Text>
          <Text style={styles.price}>${shoe?.price?.toLocaleString()}</Text>
        </View>

        <TouchableOpacity style={styles.buyBtn} onPress={handleAddToCart}>
          <Text style={styles.buyBtnText}>AÑADIR AL CARRITO</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loader: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  viewerContainer: { height: width, backgroundColor: '#0a0a0a', overflow: 'hidden' },
  mainImage: { width: '100%', height: '100%' },
  toggleBtn: { 
    position: 'absolute', 
    bottom: 20, 
    right: 20, 
    backgroundColor: '#bb0000', 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 25,
    elevation: 5
  },
  toggleText: { color: '#fff', fontWeight: 'bold', fontSize: 11, letterSpacing: 1 },
  infoSection: { 
    padding: 25, 
    backgroundColor: '#000', 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    marginTop: -25 
  },
  brand: { color: '#bb0000', fontWeight: 'bold', letterSpacing: 2, fontSize: 12 },
  name: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginVertical: 5 },
  optionsContainer: { marginVertical: 15 },
  sectionTitle: { color: '#555', fontSize: 13, marginBottom: 12, fontWeight: 'bold' },
  colorCircle: { 
    width: 42, 
    height: 42, 
    borderRadius: 21, 
    marginRight: 15, 
    borderWidth: 2, 
    borderColor: '#222', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  activeColorCircle: { borderColor: '#fff', transform: [{ scale: 1.1 }] },
  sizeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sizeCard: { 
    width: 55, 
    height: 45, 
    borderRadius: 10, 
    backgroundColor: '#111', 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#222' 
  },
  activeSizeCard: { backgroundColor: '#bb0000', borderColor: '#bb0000' },
  sizeText: { color: '#fff', fontWeight: 'bold' },
  activeSizeText: { color: '#fff' },
  priceContainer: { marginVertical: 25 },
  priceLabel: { color: '#555', fontSize: 14 },
  price: { color: '#fff', fontSize: 34, fontWeight: 'bold' },
  buyBtn: { 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginBottom: 40,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8
  },
  buyBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 }
});