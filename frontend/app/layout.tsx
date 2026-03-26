import type { Metadata } from "next"
import { Geist } from "next/font/google"
import Link from "next/link"
import "./globals.css"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Taskflow",
  description: "Task manager + crypto",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${geist.className} bg-gray-950 text-white`}>
        <nav className="border-b border-gray-800 px-8 py-4">
          <div className="max-w-xl mx-auto flex gap-6">
            <Link
              href="/"
              className="text-gray-400 hover:text-white transition font-medium"
            >
              ✅ Tareas
            </Link>
            <Link
              href="/crypto"
              className="text-gray-400 hover:text-white transition font-medium"
            >
              ₿ Crypto
            </Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}