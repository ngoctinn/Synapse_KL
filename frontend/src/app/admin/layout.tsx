// WHY: Auth tạm thời disabled để test routing
// TODO: Enable lại khi setup Supabase

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <div className="flex">
      <aside className="border p-4">
        <nav className="grid gap-4">
          <span>Quản lý</span>
        </nav>
      </aside>
      <main className="flex-1 p-4">{children}</main>
    </div>
  )
}
