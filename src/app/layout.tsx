import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google"
import "./globals.css";
import { AuthProvider } from "@/app/hooks/useAuthCustom"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Carrinhos - Lista de Compras",
  description: "Sistema inteligente de listas de compras",
  manifest: "/manifest.json",
  keywords: ["lista de compras", "carrinho", "supermercado", "organização"],
  authors: [{ name: "Carrinhos App" }],
  creator: "Carrinhos App",
  publisher: "Carrinhos App",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/car-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/car-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/car-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Carrinhos",
    startupImage: [
      {
        url: '/car-512x512.png',
        media: '(device-width: 768px) and (device-height: 1024px)',
      },
    ],
  },
  openGraph: {
    type: 'website',
    siteName: 'Carrinhos',
    title: 'Carrinhos - Lista de Compras',
    description: 'Sistema inteligente de listas de compras',
  },
  twitter: {
    card: 'summary',
    title: 'Carrinhos - Lista de Compras',
    description: 'Sistema inteligente de listas de compras',
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
        <meta name="theme-color" content="#9333ea" />
        <meta name="background-color" content="#000000" />
        
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Carrinhos" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Carrinhos" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#9333ea" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Viewport */}
        <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=5,user-scalable=yes,viewport-fit=cover" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/car-192x192.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/car-192x192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/car-512x512.png" />
        
        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="192x192" href="/car-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/car-512x512.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
        {/* Splash Screens */}
        <link rel="apple-touch-startup-image" href="/car-512x512.png" />
      </head>
      <body className={`${inter.className} bg-black text-white`} style={{ backgroundColor: "black", color: "white" }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
