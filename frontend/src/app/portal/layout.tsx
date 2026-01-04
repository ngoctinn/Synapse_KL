
export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <div className="flex flex-col">
      <header className="border p-4">
        <span>Synapse Spa</span>
      </header>
      <main className="flex-1 p-4">{children}</main>
    </div>
  )
}
