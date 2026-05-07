import { db, storage } from './firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const uploadShoe = async (shoeData: any, imageUri: string) => {
  try {
    // 1. Convertir la imagen a un formato que Storage entienda (Blob)
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    // 2. Crear referencia en Storage (ej: shoes/nombre_zapato.jpg)
    const storageRef = ref(storage, `shoes/${Date.now()}_image.jpg`);
    
    // 3. Subir el archivo
    await uploadBytes(storageRef, blob);
    
    // 4. Obtener la URL de descarga
    const imageUrl = await getDownloadURL(storageRef);

    // 5. Guardar todo en Firestore en la colección 'shoes'
    const docRef = await addDoc(collection(db, 'shoes'), {
      name: shoeData.name,
      price: shoeData.price,
      brand: shoeData.brand,
      imageUrl: imageUrl, // Aquí queda guardado el link a la foto
      createdAt: new Date()
    });

    return docRef.id;
  } catch (error) {
    console.error("Error subiendo zapato:", error);
    throw error;
  }
};