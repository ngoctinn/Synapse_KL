
export default function TechLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <div className="flex flex-col">
      <main className="flex-1 p-4">{children}</main>
      <nav className="border p-4 flex gap-4">
        <span>Lịch</span>
        <span>Lịch sử</span>
      </nav>
    </div>
  )
}
