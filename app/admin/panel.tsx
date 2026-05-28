import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image
} from 'react-native';

import * as DocumentPicker from 'expo-document-picker';
import { uploadFullShoe, uploadBanner } from '../../services/shoeService';

export default function AdminPanel() {
  // --- ESTADOS PARA PRODUCTOS ---
  const [form, setForm] = useState({
    name: '',
    price: '',
    brand: ''
  });
  const [file, setFile] = useState<any>(null); 
  const [images, setImages] = useState<any[]>([]); 
  const [loading, setLoading] = useState(false);

  // --- ESTADOS PARA BANNERS ---
  const [bannerLoading, setBannerLoading] = useState(false);

  // --- 🏷️ NUEVOS ESTADOS PARA CREACIÓN DE CUPONES ---
  const [cuponForm, setCuponForm] = useState({
    codigo: '',
    descuento: '',
  });
  const [cuponLoading, setCuponLoading] = useState(false);

  // Seleccionar modelo 3D
  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setFile(result.assets[0]);
        Alert.alert("Modelo 3D", "Archivo .glb listo");
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo seleccionar el modelo");
    }
  };

  // Seleccionar Imágenes del Producto
  const handlePickImages = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
        multiple: true 
      });

      if (!result.canceled) {
        setImages([...images, ...result.assets]);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudieron seleccionar las imágenes");
    }
  };

  // Lógica para publicar producto
  const handlePublish = async () => {
    if (!form.name || !form.price || !form.brand || !file || images.length === 0) {
      Alert.alert("Error", "Llena todos los campos y sube al menos una foto.");
      return;
    }

    setLoading(true);
    try {
      await uploadFullShoe(form, file, images);
      Alert.alert("¡Éxito!", "Producto y multimedia subidos correctamente.");
      setForm({ name: '', price: '', brand: '' });
      setFile(null);
      setImages([]);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Hubo un problema al subir el producto.");
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA PARA SUBIR BANNER AL CARRUSEL ---
  const handleUploadBanner = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      setBannerLoading(true);
      await uploadBanner(result.assets[0].uri);
      
      Alert.alert("¡Éxito!", "Imagen añadida al carrusel correctamente.");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo subir el banner.");
    } finally {
      setBannerLoading(false);
    }
  };

  // --- 🚀 NUEVA LÓGICA: CREAR CUPÓN EN LA API LOCAL ---
  const handleCreateCupon = async () => {
    const { codigo, descuento } = cuponForm;

    if (!codigo.trim() || !descuento.trim()) {
      Alert.alert("Campos Vacíos", "Por favor ingresa el código y el porcentaje de descuento.");
      return;
    }

    const porcentajeNum = parseInt(descuento);
    if (isNaN(porcentajeNum) || porcentajeNum <= 0 || porcentajeNum > 100) {
      Alert.alert("Descuento Inválido", "El descuento debe ser un número entero entre 1 y 100.");
      return;
    }

    setCuponLoading(true);
    try {
      // Usamos tu IP local fija de desarrollo (192.168.1.99) en el puerto 3000
      const response = await fetch('http://192.168.1.99:3000/api/cupones/crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codigo: codigo.trim().toUpperCase(),
          descuento: porcentajeNum,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("¡Éxito!", `Cupón ${codigo.toUpperCase()} (${porcentajeNum}%) creado correctamente.`);
        setCuponForm({ codigo: '', descuento: '' }); // Limpiar formulario
      } else {
        Alert.alert("Error de API", data.mensaje || "No se pudo guardar el cupón.");
      }
    } catch (error) {
      console.error("Error al crear el cupón:", error);
      Alert.alert("Error de Red", "No se pudo establecer conexión con kronos-api.");
    } finally {
      setCuponLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      {/* SECCIÓN DE PRODUCTOS */}
      <Text style={styles.title}>NUEVO PRODUCTO</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nombre del Zapato"
          placeholderTextColor="#666"
          value={form.name}
          onChangeText={(val) => setForm({ ...form, name: val })}
        />

        <TextInput
          style={styles.input}
          placeholder="Marca"
          placeholderTextColor="#666"
          value={form.brand}
          onChangeText={(val) => setForm({ ...form, brand: val })}
        />

        <TextInput
          style={styles.input}
          placeholder="Precio"
          placeholderTextColor="#666"
          keyboardType="numeric"
          value={form.price}
          onChangeText={(val) => setForm({ ...form, price: val })}
        />

        <TouchableOpacity style={[styles.fileBtn, file && styles.successBtn]} onPress={handlePickDocument}>
          <Text style={styles.fileBtnText}>
            {file ? "✓ MODELO 3D CARGADO" : "SELECCIONAR .GLB"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.fileBtn, images.length > 0 && styles.successBtn]} onPress={handlePickImages}>
          <Text style={styles.fileBtnText}>
            {images.length > 0 ? `✓ ${images.length} FOTOS CARGADAS` : "SELECCIONAR FOTOS"}
          </Text>
        </TouchableOpacity>

        <ScrollView horizontal style={styles.previewContainer}>
          {images.map((img, index) => (
            <Image key={index} source={{ uri: img.uri }} style={styles.previewImg} />
          ))}
        </ScrollView>

        <TouchableOpacity 
          style={styles.publishBtn} 
          onPress={handlePublish} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.publishBtnText}>PUBLICAR EN TIENDA</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* SEPARADOR VISUAL */}
      <View style={styles.separator} />

      {/* SECCIÓN DE BANNERS */}
      <Text style={styles.title}>CARRUSEL</Text>
      <View style={styles.bannerBox}>
        <Text style={styles.bannerSubtitle}>añadir imagen</Text>
        
        <TouchableOpacity 
          style={[styles.bannerBtn, bannerLoading && { opacity: 0.6 }]} 
          onPress={handleUploadBanner}
          disabled={bannerLoading}
        >
          {bannerLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.bannerBtnText}>+ SUBIR NUEVO BANNER</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* SEPARADOR VISUAL */}
      <View style={styles.separator} />

      {/* 🏷️ NUEVA SECCIÓN: GESTIÓN DE DESCUENTOS (CUPONES) */}
      <Text style={styles.title}>CUPONES DE DESCUENTO</Text>
      <View style={styles.cuponBox}>
        <TextInput
          style={styles.input}
          placeholder="Código del Cupón (Ej: PROMO20)"
          placeholderTextColor="#666"
          autoCapitalize="characters"
          value={cuponForm.codigo}
          onChangeText={(val) => setCuponForm({ ...cuponForm, codigo: val })}
        />

        <TextInput
          style={[styles.input, { marginTop: 12 }]}
          placeholder="Porcentaje Descuento (Ej: 15)"
          placeholderTextColor="#666"
          keyboardType="numeric"
          maxLength={3}
          value={cuponForm.descuento}
          onChangeText={(val) => setCuponForm({ ...cuponForm, descuento: val })}
        />

        <TouchableOpacity 
          style={[styles.cuponSubmitBtn, cuponLoading && { opacity: 0.7 }]} 
          onPress={handleCreateCupon}
          disabled={cuponLoading}
        >
          {cuponLoading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.cuponSubmitBtnText}>CREAR CUPÓN ACTIVO</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 20, marginBottom: 15, textAlign: 'left', letterSpacing: 1 },
  form: { gap: 15 },
  input: { backgroundColor: '#111', padding: 18, borderRadius: 10, color: '#fff', borderWidth: 1, borderColor: '#333' },
  fileBtn: { backgroundColor: '#1a1a1a', padding: 15, borderRadius: 10, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#444' },
  successBtn: { borderColor: '#00bb00', backgroundColor: '#001a00' },
  fileBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  previewContainer: { flexDirection: 'row', marginVertical: 5 },
  previewImg: { width: 60, height: 60, borderRadius: 8, marginRight: 10, borderWidth: 1, borderColor: '#333' },
  publishBtn: { backgroundColor: '#bb0000', padding: 20, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  publishBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  separator: { height: 1, backgroundColor: '#222', marginVertical: 30 },
  bannerBox: { backgroundColor: '#111', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#222' },
  bannerSubtitle: { color: '#888', fontSize: 13, marginBottom: 20 },
  bannerBtn: { backgroundColor: '#333', padding: 15, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#444' },
  bannerBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

  // Estilos agregados para la sección de cupones
  cuponBox: { backgroundColor: '#111', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#222' },
  cuponSubmitBtn: { backgroundColor: '#fff', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  cuponSubmitBtnText: { color: '#000', fontWeight: 'bold', fontSize: 14, letterSpacing: 0.5 }
});