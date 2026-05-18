import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, Dimensions } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebaseConfig';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function OrderSummaryScreen() {
  const { user } = useAuth();
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLastOrder = async () => {
      if (!user?.uid) return;
      try {
        // Esta consulta requiere el índice compuesto (userId ASC, createdAt DESC)
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(1)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          setLastOrder({ 
            id: querySnapshot.docs[0].id, 
            ...docData 
          });
        }
      } catch (error) { 
        console.error("Error al obtener el pedido:", error); 
      } finally { 
        setLoading(false); 
      }
    };

    fetchLastOrder();
  }, [user]);

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator color="#bb0000" size="large" />
    </View>
  );

  if (!lastOrder) return (
    <View style={styles.center}>
      <Ionicons name="receipt-outline" size={80} color="#1a1a1a" />
      <Text style={styles.noOrderText}>NO TIENES PEDIDOS RECIENTES</Text>
      <Text style={styles.subNoOrder}>Tus compras aparecerán aquí una vez confirmadas.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerTitle}>
        <Text style={styles.title}>RESUMEN DE PEDIDO</Text>
        <Text style={styles.orderId}>ORDEN: #{lastOrder.id.toUpperCase()}</Text>
      </View>

      <FlatList
        data={lastOrder.items}
        keyExtractor={(_, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          // CORRECCIÓN: Buscamos 'image' (singular) que es lo que envías en el CartContext
          const imgUri = item.image || (item.imageUrls && item.imageUrls[0]);

          return (
            <View style={styles.itemRow}>
              <View style={styles.imageBg}>
                <Image 
                  source={{ uri: imgUri }} 
                  style={styles.itemImage} 
                  resizeMode="contain" 
                />
              </View>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemSub}>Talla: {item.size} | Cant: {item.quantity}</Text>
                {item.customColor && (
                   <View style={styles.colorRow}>
                      <Text style={styles.itemSub}>Color: </Text>
                      <View style={[styles.colorDot, { backgroundColor: item.customColor }]} />
                   </View>
                )}
                <Text style={styles.itemPrice}>
                  ${item.price ? item.price.toLocaleString() : '0'}
                </Text>
              </View>
            </View>
          );
        }}
        ListFooterComponent={
          <View style={styles.footer}>
            <View style={styles.divider} />
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL PAGADO</Text>
              <Text style={styles.totalValue}>
                ${lastOrder.total ? lastOrder.total.toLocaleString() : '0'}
              </Text>
            </View>

            <View style={styles.statusBox}>
              <Ionicons name="cube-outline" size={20} color="#fff" />
              <View>
                <Text style={styles.statusText}>ESTADO: EN PREPARACIÓN</Text>
                <Text style={styles.statusSub}>Estamos alistando tus Kronos</Text>
              </View>
            </View>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingHorizontal: 20 },
  center: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 20 },
  headerTitle: { marginTop: 60, marginBottom: 20 },
  title: { color: '#fff', fontSize: 26, fontWeight: 'bold', letterSpacing: 1 },
  orderId: { color: '#bb0000', fontSize: 11, fontWeight: 'bold', marginTop: 5 },
  itemRow: { 
    flexDirection: 'row', 
    marginBottom: 15, 
    backgroundColor: '#0a0a0a', 
    padding: 15, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1a1a1a'
  },
  imageBg: { 
    width: 70, 
    height: 70, 
    backgroundColor: '#111', 
    borderRadius: 15, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  itemImage: { width: 60, height: 60 },
  itemDetails: { marginLeft: 15, flex: 1, justifyContent: 'center' },
  itemName: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  itemSub: { color: '#666', fontSize: 12, marginTop: 2 },
  colorRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  colorDot: { width: 10, height: 10, borderRadius: 5, marginLeft: 5 },
  itemPrice: { color: '#fff', fontWeight: 'bold', marginTop: 5, fontSize: 15 },
  footer: { marginTop: 10, marginBottom: 40 },
  divider: { height: 1, backgroundColor: '#1a1a1a', marginVertical: 20 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: '#666', fontWeight: 'bold', fontSize: 12 },
  totalValue: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  statusBox: { 
    flexDirection: 'row', 
    backgroundColor: '#bb0000', 
    padding: 20, 
    borderRadius: 15, 
    marginTop: 30, 
    alignItems: 'center', 
    gap: 15 
  },
  statusText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  statusSub: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  noOrderText: { color: '#fff', fontWeight: 'bold', marginTop: 15, fontSize: 16 },
  subNoOrder: { color: '#444', textAlign: 'center', marginTop: 10, fontSize: 13 }
});