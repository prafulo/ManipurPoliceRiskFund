'use client';
import { useState, useEffect } from 'react';
import type { CollectionReference, Query, DocumentData } from 'firebase/firestore';
import { onSnapshot, getDocs } from 'firebase/firestore';

export function useCollection<T extends DocumentData>(
  ref: CollectionReference<T> | Query<T> | null
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ref) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        const docs = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as unknown as T)
        );
        setData(docs);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ref]);

  return { data, loading, error };
}

export async function getCollection<T extends DocumentData>(
  ref: CollectionReference<T> | Query<T>
) {
    const snapshot = await getDocs(ref);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as T));
}
