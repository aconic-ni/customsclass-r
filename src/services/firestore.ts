'use client';

import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp, orderBy, writeBatch } from 'firebase/firestore';
import type { ResultData, HistoryItem } from '@/components/customs-classifier';

interface HistoryData {
    userId: string;
    brand: string;
    description: string;
    result: ResultData;
}

// Guarda un nuevo elemento en el historial de un usuario
export const saveHistoryItem = async (data: HistoryData) => {
    try {
        await addDoc(collection(db, 'consultasAforo'), {
            ...data,
            timestamp: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error adding document: ", error);
        throw new Error("No se pudo guardar la consulta en el historial.");
    }
};

// Obtiene el historial de consultas de un usuario
export const getHistory = async (userId: string): Promise<HistoryItem[]> => {
    try {
        const q = query(
            collection(db, 'consultasAforo'),
            where('userId', '==', userId),
            orderBy('timestamp', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const history: HistoryItem[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            history.push({
                id: doc.id,
                brand: data.brand,
                description: data.description,
                result: data.result,
            });
        });
        return history;
    } catch (error) {
        console.error("Error getting documents: ", error);
        throw new Error("No se pudo obtener el historial de consultas.");
    }
};

// Borra todo el historial de un usuario
export const clearHistoryForUser = async (userId: string): Promise<void> => {
    try {
        const q = query(collection(db, 'consultasAforo'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return;
        }

        const batch = writeBatch(db);
        querySnapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();
    } catch (error) {
        console.error("Error deleting history: ", error);
        throw new Error("No se pudo limpiar el historial.");
    }
};
