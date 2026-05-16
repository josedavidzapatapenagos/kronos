import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { uploadFullShoe } from '../../services/shoeService';

export default function AdminPanel() {
  const [form, setForm] = useState({ name: '', price: '', brand: '' });
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
    if (!result.canceled) {
      setFile(result.assets[0]);
      Alert.alert("Archivo cargado", "Modelo 3D listo para subir");
    }
  };

  const handlePublish = async () => {
    if (!form.name || !form.price || !file) {
      Alert.alert("Error", "Por favor llena todos los campos y selecciona un modelo 3D");
      return;
    }

    setLoading(true);
    try {
      await uploadFullShoe(form, file.uri);
      Alert.alert("¡Éxito!", "El zapato ya está disponible en el catálogo.");
      setForm({ name: '', price: '', brand: '' });
      setFile(null);
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al subir el producto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>NUEVO PRODUCTO</Text>
      
      <View style={styles.form}>
        <TextInput 
          style={styles.input} 
          placeholder="Nombre del Zapato" 
          placeholderTextColor="#666"
          value={form.name}
          onChangeText={(val) => setForm({...form, name: val})}
        />
        <TextInput 
          style={styles.input} 
          placeholder="Marca (ej: Nike, Adidas)" 
          placeholderTextColor="#666"
          value={form.brand}
          onChangeText={(val) => setForm({...form, brand: val})}
        />
        <TextInput 
          style={styles.input} 
          placeholder="Precio" 
          placeholderTextColor="#666"
          keyboardType="numeric"
          value={form.price}
          onChangeText={(val) => setForm({...form, price: val})}
        />

        <TouchableOpacity style={styles.fileBtn} onPress={handlePickDocument}>
          <Text style={styles.fileBtnText}>
            {file ? "MODELO CARGADO" : "SELECCIONAR .GLB"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.publishBtn} onPress={handlePublish} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.publishBtnText}>PUBLICAR EN TIENDA</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginVertical: 20, textAlign: 'center' },
  form: { gap: 15 },
  input: { backgroundColor: '#111', padding: 18, borderRadius: 10, color: '#fff', borderWidth: 1, borderColor: '#333' },
  fileBtn: { backgroundColor: '#333', padding: 15, borderRadius: 10, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#666' },
  fileBtnText: { color: '#fff', fontWeight: 'bold' },
  publishBtn: { backgroundColor: '#bb0000', padding: 20, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  publishBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});