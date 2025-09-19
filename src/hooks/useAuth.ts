"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormData } from '@/components/LoginForm';

export function useAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const register = async (data: FormData) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/v1/baseline-signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log("res ::", response.status);
      
      if(response.status === 210) {
        router.replace("/admin/results");
      }

      if (response.status === 400) {
        setError('Invalid data provided');
        return;
      }

      if(response.status === 403) {
        setError("Already submitted the exam.");
        return;
      }

      if (response.status === 409) {
        setError('User already exists');
        console.log("user already exists ::", await response.json());
        
        return;
      }

      if (!response.ok) {
        setError('Something went wrong');
        return;
      }

      if (response.status === 201 || response.status === 200) {
        // Successfully registered
        router.replace('/welcome');
        return;
      }
      setError('Unexpected error occurred');
    } catch {
      setError('Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    register,
  };
}
