export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Admin routes will use the main layout wrapper which includes RouteGuard
  // The RouteGuard will handle role-based access control
  return <>{children}</>
}