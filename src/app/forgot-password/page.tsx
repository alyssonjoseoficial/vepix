import { ForgotPasswordClient } from "./client";

export const metadata = {
  title: "Esqueci Minha Senha - VePix",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <ForgotPasswordClient />
    </div>
  );
}
