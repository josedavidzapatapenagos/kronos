import { db, storage } from './firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const uploadFullShoe = async (shoeData: any, fileUri: string) => {
  try {
    // 1. Convertir la URI del archivo a un formato que Firebase entienda
    const response = await fetch(fileUri);
    const blob = await response.blob();

    // 2. Subir el modelo 3D a Storage
    const storageRef = ref(storage, `models/${shoeData.name}_${Date.now()}.glb`);
    await uploadBytes(storageRef, blob);
    const modelUrl = await getDownloadURL(storageRef);

    // 3. Guardar toda la información en Firestore
    const docRef = await addDoc(collection(db, "shoes"), {
      name: shoeData.name,
      brand: shoeData.brand,
      price: parseFloat(shoeData.price),
      modelUrl: modelUrl, // El link al archivo 3D
      createdAt: new Date()
    });

    return docRef.id;
  } catch (error) {
    console.error("Error al subir el producto:", error);
    throw error;
  }
};