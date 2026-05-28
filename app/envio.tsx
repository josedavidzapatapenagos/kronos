import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator 
} from 'react-native';

export default function EnvioScreen() {
  // 📍 Estados del Formulario de Envío
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [telefono, setTelefono] = useState('');

  // 🏷️ Estados para el Control del Cupón y la API
  const [cupónTexto, setCupónTexto] = useState('');
  const [descuentoAplicado, setDescuentoAplicado] = useState(0); // Guarda el porcentaje (ej: 20)
  const [cargandoCupón, setCargandoCupón] = useState(false);

  // 💰 Simulación del valor inicial del carrito (hardcoded para pruebas)
  const total = 150000; 

  // 🧮 Cálculos automáticos basados en el estado del descuento
  const valorDescontado = (total * descuentoAplicado) / 100;
  const totalFinal = total - valorDescontado;

  // 🌐 Función para validar el cupón con la API local (kronos-api)
  const manejarAplicarCupon = async () => {
    if (!cupónTexto.trim()) {
      Alert.alert('Atención', 'Por favor ingresa un código de cupón.');
      return;
    }

    setCargandoCupón(true);
    try {
      // Reemplaza con tu IP local si estás probando en un dispositivo físico
      const respuesta = await fetch(`http://localhost:3000/api/cupones/${cupónTexto.trim().toUpperCase()}`);
      const data = await respuesta.json();

      if (respuesta.ok && data.valido) {
        setDescuentoAplicado(data.porcentaje);
        Alert.alert('¡Éxito!', `Cupón aplicado. Obtienes un ${data.porcentaje}% de descuento.`);
      } else {
        setDescuentoAplicado(0);
        Alert.alert('Cupón Inválido', data.mensaje || 'El cupón ingresado no existe o expiró.');
      }
    } catch (error) {
      console.error('Error validando cupón:', error);
      Alert.alert('Error de Conexión', 'No se pudo conectar con el servidor de Kronos.');
    } finally {
      setCargandoCupón(false);
    }
  };

  // 🛒 Procesar el envío final
  const manejarFormularioEnvio = () => {
    if (!direccion || !ciudad || !telefono) {
      Alert.alert('Campos incompletos', 'Por favor llena todos los datos de envío.');
      return;
    }
    
    Alert.alert(
      'Pedido Confirmado', 
      `Tu pedido por un total de $${totalFinal.toLocaleString()} será enviado a ${ciudad}.`
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Datos de Envío</Text>

      {/* Formulario */}
      <View style={styles.form}>
        <Text style={styles.label}>Dirección de entrega</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Calle 45 #12-34"
          placeholderTextColor="#666"
          value={direccion}
          onChangeText={setDireccion}
        />

        <Text style={styles.label}>Ciudad</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Medellín"
          placeholderTextColor="#666"
          value={ciudad}
          onChangeText={setCiudad}
        />

        <Text style={styles.label}>Teléfono de contacto</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 3001234567"
          placeholderTextColor="#666"
          keyboardType="phone-pad"
          value={telefono}
          onChangeText={setTelefono}
        />
      </View>

      {/* Módulo de Cupones */}
      <Text style={styles.label}>¿Tienes un cupón de descuento?</Text>
      <View style={styles.couponContainer}>
        <TextInput
          style={styles.couponInput}
          placeholder="Código del cupón (ej: ALIANZA20)"
          placeholderTextColor="#666"
          autoCapitalize="characters"
          value={cupónTexto}
          onChangeText={setCupónTexto}
          editable={!cargandoCupón}
        />
        <TouchableOpacity 
          style={styles.couponButton} 
          onPress={manejarAplicarCupon}
          disabled={cargandoCupón}
        >
          {cargandoCupón ? (
            <ActivityIndicator color="#000" size="small" />
          ) : (
            <Text style={styles.couponButtonText}>Aplicar</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Resumen del cobro final recalculado dinámicamente */}
      <View style={styles.summaryBox}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal:</Text>
          <Text style={styles.summarySubValue}>${total.toLocaleString()}</Text>
        </View>
        
        {/* Renderizado condicional del descuento */}
        {descuentoAplicado > 0 && (
          <View style={[styles.summaryRow, { marginTop: 8 }]}>
            <Text style={[styles.summaryLabel, { color: '#00FF66' }]}>Descuento ({descuentoAplicado}%):</Text>
            <Text style={[styles.summarySubValue, { color: '#00FF66' }]}>-${valorDescontado.toLocaleString()}</Text>
          </View>
        )}

        <View style={[styles.summaryRow, { marginTop: 12, borderTopWidth: 1, borderColor: '#222', paddingTop: 12 }]}>
          <Text style={styles.summaryLabelFinal}>Total a pagar:</Text>
          <Text style={styles.summaryValue}>${totalFinal.toLocaleString()}</Text>
        </View>
        <Text style={styles.paymentMethod}>Método: Pago contra entrega / Confirmación manual</Text>
      </View>

      {/* Botón de Acción Principal */}
      <TouchableOpacity style={styles.submitButton} onPress={manejarFormularioEnvio}>
        <Text style={styles.submitButtonText}>Finalizar Pedido</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
    marginTop: 10,
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#AAA',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 8,
    padding: 12,
    color: '#FFF',
    fontSize: 16,
    marginBottom: 12,
  },
  couponContainer: {
    flexDirection: 'row',
    marginBottom: 25,
  },
  couponInput: {
    flex: 1,
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#222',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    padding: 12,
    color: '#FFF',
    fontSize: 16,
  },
  couponButton: {
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  couponButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  summaryBox: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 8,
    padding: 16,
    marginBottom: 25,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#888',
    fontSize: 14,
  },
  summarySubValue: {
    color: '#AAA',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryLabelFinal: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryValue: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  paymentMethod: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: '#00FF66',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});