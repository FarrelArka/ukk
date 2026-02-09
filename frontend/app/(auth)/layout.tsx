export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      {children}
    </main>
  );
}
