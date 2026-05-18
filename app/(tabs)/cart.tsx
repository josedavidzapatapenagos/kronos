import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useCart } from '../../context/CartContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function CartScreen() {
  const { cart, total, removeFromCart, processCheckout } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleConfirmPurchase = async () => {
    if (cart.length === 0) return;

    Alert.alert(
      "Confirmar Compra",
      "¿Deseas finalizar tu pedido de Kronos?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "COMPRAR", 
          onPress: async () => {
            setIsProcessing(true);
            const orderId = await processCheckout(); // AQUÍ SE CREA LA CONEXIÓN
            setIsProcessing(false);

            if (orderId) {
              Alert.alert("¡Éxito!", "Tu pedido ha sido procesado.");
              // Te lleva directo a la pantalla que antes estaba vacía
              router.push('/(tabs)/order-summary');
            } else {
              Alert.alert("Error", "No se pudo procesar la compra.");
            }
          } 
        }
      ]
    );
  };

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={100} color="#111" />
        <Text style={styles.emptyText}>TU CARRITO ESTÁ VACÍO</Text>
        <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/(tabs)')}>
          <Text style={styles.shopButtonText}>VER PRODUCTOS</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TU CARRITO</Text>

      <FlatList
        data={cart}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Image 
              source={{ uri: item.image || (item.imageUrls && item.imageUrls[0]) }} 
              style={styles.itemImage} 
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemSize}>Talla: {item.size}</Text>
              <Text style={styles.itemPrice}>${item.price.toLocaleString()}</Text>
            </View>
            <TouchableOpacity onPress={() => removeFromCart(item.id, item.size)}>
              <Ionicons name="trash-outline" size={24} color="#bb0000" />
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>TOTAL:</Text>
          <Text style={styles.totalAmount}>${total.toLocaleString()}</Text>
        </View>

        <TouchableOpacity 
          style={[styles.checkoutButton, isProcessing && { opacity: 0.7 }]} 
          onPress={handleConfirmPurchase}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.checkoutText}>CONFIRMAR PEDIDO</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20, paddingTop: 60 },
  title: { color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  cartItem: { 
    flexDirection: 'row', 
    backgroundColor: '#0a0a0a', 
    padding: 15, 
    borderRadius: 15, 
    alignItems: 'center', 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#1a1a1a'
  },
  itemImage: { width: 70, height: 70, borderRadius: 10 },
  itemInfo: { flex: 1, marginLeft: 15 },
  itemName: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  itemSize: { color: '#666', fontSize: 13 },
  itemPrice: { color: '#bb0000', fontWeight: 'bold', marginTop: 5 },
  footer: { borderTopWidth: 1, borderTopColor: '#111', paddingTop: 20, marginBottom: 20 },
  totalContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  totalLabel: { color: '#666', fontSize: 18 },
  totalAmount: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  checkoutButton: { backgroundColor: '#bb0000', padding: 20, borderRadius: 15, alignItems: 'center' },
  checkoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  emptyContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#222', fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  shopButton: { marginTop: 20, padding: 15, backgroundColor: '#111', borderRadius: 10 },
  shopButtonText: { color: '#bb0000', fontWeight: 'bold' }
});