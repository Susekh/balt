"use client";

import { LoginForm } from "@/components/LoginForm";
import { useAuth } from "@/hooks/useAuth";


export default function Login() {
  const { isLoading, error, register } = useAuth();

  return (
    <div className="w-1/4 mx-auto mt-8">
      <LoginForm onSubmit={register} error={error} isLoading={isLoading} />
    </div>
  );
}
