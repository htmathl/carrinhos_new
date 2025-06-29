import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google"
import "./globals.css";
import { AuthProvider } from "@/app/hooks/useAuthCustom"
import AuthGuard from "@/app/components/AuthGuard"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Carrinhos",
  description: "Sistema inteligente de listas de compras",
  icons: {
    icon: [
      { url: '/icon.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" style={{ backgroundColor: "black", colorScheme: "dark" }}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="color-scheme" content="dark" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={`${inter.className} bg-black text-white`} style={{ backgroundColor: "black", color: "white" }}>
        <AuthProvider>
          <AuthGuard>
            {children}
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  )
}
