import LoginForm from "@/components/login-form";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4">
      <div className="flex flex-col items-center gap-6 w-full">
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold mb-2">Financer</h1>
          <p className="text-default-500">Loan Management System</p>
        </div>
        <LoginForm />
      </div>
    </section>
  );
}
