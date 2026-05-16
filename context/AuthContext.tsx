import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../services/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface UserType {
  uid: string;
  email: string | null;
  name?: string;
  rol?: string;
}

interface AuthContextData {
  user: UserType | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Mapeamos los datos: priorizamos la raíz, pero buscamos en cart si es necesario
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: userData.name || userData.cart?.name || 'Usuario',
              rol: userData.rol || 'user', // Aquí lee el "admin" que pusiste en la raíz
            });
          } else {
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email, rol: 'user' });
          }
        } catch (error) {
          console.error("Error al obtener datos del usuario:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);