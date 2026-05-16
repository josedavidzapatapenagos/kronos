import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      
      <Stack screenOptions={{ headerShown: false }}>
        {/* Grupo de Autenticación */}
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        
        {/* Grupo de la Tienda */}
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        
        {/* Pantalla de Detalle */}
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

        {/* Grupo de Administrador */}
        <Stack.Screen 
          name="admin" 
          options={{ 
            headerShown: true, 
            title: "Panel de Control Admin",
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#bb0000',
            headerTitleStyle: { fontWeight: 'bold' }
          }} 
        />
      </Stack>
    </AuthProvider>
  );
}