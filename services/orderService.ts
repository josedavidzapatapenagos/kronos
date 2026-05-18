import { db } from './firebaseConfig';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';

export const createOrder = async (userId: string, userName: string, items: any[], total: number) => {
  try {
    const orderData = {
      userId,
      userName,
      items,
      total,
      status: 'completado',
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, "orders"), orderData);
    return docRef.id;
  } catch (error) {
    console.error("Error al crear pedido:", error);
    throw error;
  }
};

export const getUserOrders = async (userId: string) => {
  const q = query(
    collection(db, "orders"), 
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};