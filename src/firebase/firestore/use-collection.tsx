
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  endBefore,
  limitToLast,
  getDocs,
  Query,
  DocumentData,
  Firestore,
} from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { useFirestore } from '../provider';


export function useCollection<T>(
  path: string | null,
  options: { listen?: boolean, queryConstraints?: any[] } = { listen: true }
): { data: T[] | null; loading: boolean, error: Error | null } {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user, loading: authLoading } = useAuth();
  const firestore = useFirestore();

  const memoizedConstraints = useMemo(() => options.queryConstraints || [], [JSON.stringify(options.queryConstraints)]);

  useEffect(() => {
    if (authLoading || !path) {
      if (!authLoading) {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    let q: Query;
    try {
        q = query(collection(firestore, path), ...memoizedConstraints);
    } catch(e) {
        console.error("Failed to create query:", e);
        setError(e as Error);
        setLoading(false);
        return;
    }

    if (options.listen) {
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const result: T[] = [];
          snapshot.forEach((doc) => {
            result.push({ id: doc.id, ...doc.data() } as T);
          });
          setData(result);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error(`useCollection error for path "${path}":`, err);
          setError(err);
          setLoading(false);
          // Re-throwing the error can be useful for higher-level error boundaries
          // throw err;
        }
      );
      return () => unsubscribe();
    } else {
      getDocs(q)
        .then((snapshot) => {
          const result: T[] = [];
          snapshot.forEach((doc) => {
            result.push({ id: doc.id, ...doc.data() } as T);
          });
          setData(result);
          setLoading(false);
          setError(null);
        })
        .catch((err) => {
          console.error(`useCollection error for path "${path}" (getDocs):`, err);
          setError(err);
          setLoading(false);
          // Re-throwing the error can be useful for higher-level error boundaries
          // throw err;
        });
    }
  }, [path, memoizedConstraints, options.listen, authLoading, firestore]);

  return { data, loading, error };
}


// Hook for a single document
export function useDoc<T>(path: string | null): { data: T | null; loading: boolean, error: Error | null } {
  const firestore = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!path) {
      setLoading(false);
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);

    const docRef = doc(firestore, path);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setData({ id: docSnap.id, ...docSnap.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error(`useDoc error for path "${path}":`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [path, firestore]);

  return { data, loading, error };
}
