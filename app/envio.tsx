// 📂 Archivo: app/envio.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useCart } from '../context/CartContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

export default function EnvioScreen() {
  const { total, processCheckout } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Estados locales para capturar los datos de la entrega
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [telefono, setTelefono] = useState('');
  const [notas, setNotas] = useState('');

  const handleConfirmarPedido = async () => {
    if (!direccion.trim() || !ciudad.trim() || !telefono.trim()) {
      Alert.alert("Datos incompletos", "Por favor llena los campos obligatorios para el despacho.");
      return;
    }

    try {
      setLoading(true);

      const datosEnvio = {
        direccion: direccion.trim(),
        ciudad: ciudad.trim(),
        telefono: telefono.trim(),
        notas: notas.trim()
      };

      const newOrderId = await processCheckout(datosEnvio);

      if (newOrderId) {
        router.replace({
          pathname: '/(tabs)/order-summary',
          params: { orderId: newOrderId }
        });
      } else {
        Alert.alert("Error", "No se pudo procesar tu orden. Inténtalo de nuevo.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error crítico", "Ocurrió un problema de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1, backgroundColor: '#000' }}
    >
      <View style={styles.container}>
        {/* Cabecera fijo */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>DATOS DE ENVÍO</Text>
        </View>

        {/* 🌟 Contenedor del Buscador de Google (Debe estar arriba del ScrollView para que flote) */}
        <View style={styles.autocompleteContainer}>
          <Text style={styles.sectionLabel}>BUSCAR DIRECCIÓN DE ENTREGA *</Text>
          <GooglePlacesAutocomplete
            placeholder="Escribe tu dirección (Ej: Calle 10...)"
            fetchDetails={true}
            onPress={(data, details = null) => {
              // Seteamos la dirección completa seleccionada
              setDireccion(data.description);
              
              // Extraemos la ciudad de los componentes de dirección de Google
              if (details) {
                const cityComponent = details.address_components.find(component =>
                  component.types.includes('locality')
                );
                if (cityComponent) {
                  setCiudad(cityComponent.long_name);
                }
              }
            }}
            query={{
              key: 'AIzaSyANmXoxSoLsFUi_PIM0548ihUW2-bsECUY', // 🔑 Tu API Key inyectada
              language: 'es',
              components: 'country:co', // Filtra para que solo busque en Colombia 🇨🇴
            }}
            styles={{
              textInput: styles.input,
              listView: styles.googleListView,
              row: styles.googleRow,
              description: styles.googleDescription,
              predefinedPlacesDescription: { color: '#666' },
            }}
            nearbyPlacesAPI="GooglePlacesSearch"
            debounce={400}
          />
        </View>

        {/* ScrollView para el resto de campos secundarios del formulario */}
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionLabel}>DIRECCIÓN DE ENTREGA CONFIRMADA</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            placeholder="Se completará automáticamente al buscar arriba"
            placeholderTextColor="#444"
            value={direccion}
            onChangeText={setDireccion}
            editable={true} // Permite retocarla manualmente si falta el número de apto/casa
          />

          <Text style={styles.sectionLabel}>CIUDAD / MUNICIPIO *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Medellín"
            placeholderTextColor="#444"
            value={ciudad}
            onChangeText={setCiudad}
          />

          <Text style={styles.sectionLabel}>TELÉFONO DE CONTACTO *</Text>
          <TextInput
            style={styles.input}
            placeholder="Número de celular"
            placeholderTextColor="#444"
            keyboardType="phone-pad"
            value={telefono}
            onChangeText={setTelefono}
          />

          <Text style={styles.sectionLabel}>INDICACIONES ADICIONALES (OPCIONAL)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ej: Dejar en portería, color de la fachada..."
            placeholderTextColor="#444"
            multiline
            numberOfLines={3}
            value={notas}
            onChangeText={setNotas}
          />

          {/* Resumen del cobro final */}
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total a pagar:</Text>
              <Text style={styles.summaryValue}>${total.toLocaleString()}</Text>
            </View>
            <Text style={styles.paymentMethod}>Método: Pago contra entrega / Confirmación manual</Text>
          </View>
        </ScrollView>

        {/* Botón estático final de Compra */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.confirmBtn} 
            onPress={handleConfirmarPedido}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <Text style={styles.confirmBtnText}>CONFIRMAR Y COLOCAR PEDIDO</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  backBtn: { marginRight: 15, padding: 5 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', letterSpacing: 0.5 },
  
  // Contenedor especial con zIndex alto para que el dropDown de Google maps flote encima de todo
  autocompleteContainer: {
    paddingHorizontal: 20,
    zIndex: 5,
    backgroundColor: '#000',
    marginBottom: 10
  },
  
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, zIndex: 1 },
  sectionLabel: { color: '#666', fontSize: 11, fontWeight: 'bold', marginBottom: 8, marginTop: 15, letterSpacing: 0.5 },
  
  input: { 
    backgroundColor: '#0a0a0a', 
    borderColor: '#1a1a1a', 
    borderWidth: 1, 
    borderRadius: 12, 
    padding: 15, 
    color: '#fff', 
    fontSize: 14 
  },
  disabledInput: { borderColor: '#222', color: '#ccc' },
  textArea: { height: 80, textAlignVertical: 'top' },
  
  // Estilos específicos premium para el menú de sugerencias de Google
  googleListView: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    maxHeight: 200,
  },
  googleRow: {
    backgroundColor: '#0a0a0a',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#161616',
  },
  googleDescription: {
    color: '#fff',
    fontSize: 13,
  },

  summaryBox: { backgroundColor: '#0a0a0a', borderRadius: 15, padding: 20, marginTop: 30, borderWidth: 1, borderColor: '#1a1a1a' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { color: '#666', fontWeight: 'bold', fontSize: 13 },
  summaryValue: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  paymentMethod: { color: '#bb0000', fontSize: 11, fontWeight: 'bold', marginTop: 10, textAlign: 'center' },
  footer: { padding: 20, backgroundColor: '#000' },
  confirmBtn: { backgroundColor: '#fff', padding: 18, borderRadius: 12, alignItems: 'center' },
  confirmBtnText: { color: '#000', fontWeight: 'bold', fontSize: 14, letterSpacing: 0.5 }
});