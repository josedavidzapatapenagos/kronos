import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      {/* StatusBar controla el color de los iconos de la batería/hora en el cel */}
      <StatusBar style="light" />
      
      <Stack screenOptions={{ headerShown: false }}>
        {/* Grupo de Autenticación (Login/Registro) */}
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        
        {/* Grupo de la Tienda (Tabs principales) */}
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        
        {/* Pantalla de Detalle de Producto */}
        <Stack.Screen 
          name="(detail)/[id]" 
          options={{ 
            headerShown: true, 
            title: "Detalle del Calzado",
            headerStyle: { backgroundColor: '#1a1a1a' },
            headerTintColor: '#fff',
            headerBackTitle: "Atrás"
          }} 
        />
      </Stack>
    </>
  );
}