import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../services/firebaseConfig';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  writeBatch 
} from 'firebase/firestore';
import { useAuth } from './AuthContext';

// Interfaz actualizada con la propiedad 'image' para evitar errores de TypeScript
interface CartItem {
  id: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image?: string; // Propiedad necesaria para la URL de imagen directa
  imageUrls?: string[];
  customColor?: string | null;
}

interface CartContextData {
  cart: CartItem[];
  total: number;
  addToCart: (product: any, size: string) => Promise<void>;
  removeFromCart: (productId: string, size: string) => Promise<void>;
  clearCart: () => void;
  processCheckout: () => Promise<string | null>;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);

  // Recalcular el total cada vez que el carrito local cambie
  useEffect(() => {
    const newTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    setTotal(newTotal);
  }, [cart]);

  // FUNCIÓN: Añadir al carrito (Sincroniza Local + Firestore)
  const addToCart = async (product: any, size: string) => {
    // 1. Actualizar estado local (UI inmediata)
    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item.id === product.id && item.size === size);
      
      if (existingItem) {
        return prevCart.map(item => 
          (item.id === product.id && item.size === size) 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      
      // Aseguramos que el objeto local tenga la propiedad 'image' para el renderizado
      return [...prevCart, { 
        ...product, 
        size, 
        quantity: 1, 
        image: product.imageUrls?.[0] || '' 
      }];
    });

    // 2. Persistir en Firestore si hay sesión iniciada
    if (user?.uid) {
      try {
        await addDoc(collection(db, "cart"), {
          userId: user.uid,
          shoeId: product.id,
          name: product.name,
          price: product.price,
          image: product.imageUrls?.[0] || '', // Campo clave para la interfaz de órdenes
          size: size,
          customColor: product.customColor || null,
          quantity: 1,
          createdAt: serverTimestamp()
        });
      } catch (e) {
        console.error("Error al guardar en Firestore (Carrito):", e);
      }
    }
  };

  // FUNCIÓN: Eliminar item del carrito
  const removeFromCart = async (productId: string, size: string) => {
    // Actualización local
    setCart((prevCart) => prevCart.filter(item => !(item.id === productId && item.size === size)));
    
    // Eliminación en Firebase
    if (user?.uid) {
      try {
        const q = query(
          collection(db, "cart"), 
          where("userId", "==", user.uid), 
          where("shoeId", "==", productId),
          where("size", "==", size)
        );
        const snapshot = await getDocs(q);
        snapshot.forEach(async (document) => {
          await deleteDoc(doc(db, "cart", document.id));
        });
      } catch (e) {
        console.error("Error al eliminar de Firestore:", e);
      }
    }
  };

  const clearCart = () => setCart([]);

  // FUNCIÓN MAESTRA: Convierte el carrito en una Orden
  const processCheckout = async () => {
    if (!user?.uid || cart.length === 0) return null;

    try {
      // 1. Crear el documento en la colección 'orders'
      // Usamos los nombres de campos que coinciden con tus índices (userId, createdAt)
      const orderRef = await addDoc(collection(db, "orders"), {
        userId: user.uid,
        userName: user.name || 'Cliente Kronos',
        items: cart, // El array de productos actual
        total: total,
        status: 'pending',
        createdAt: serverTimestamp() // Importante para el orden del historial
      });

      // 2. Limpiar el carrito en Firestore para este usuario (Batch Delete)
      const q = query(collection(db, "cart"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // 3. Limpiar el estado local de la aplicación
      clearCart();

      return orderRef.id; // Retorna el ID para confirmar el éxito
    } catch (e) {
      console.error("Error crítico en el Checkout:", e);
      return null;
    }
  };

  return (
    <CartContext.Provider value={{ cart, total, addToCart, removeFromCart, clearCart, processCheckout }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);