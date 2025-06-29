import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google"
import "./globals.css";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Carrinhos",
  description: "Sistema inteligente de listas de compras",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" style={{ backgroundColor: "black", colorScheme: "dark" }}>
      <head>
        <meta name="color-scheme" content="dark" />
        <meta name="theme-color" content="#000000" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
            html, body { 
              background-color: black !important; 
              color: white !important; 
            }
          `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-black text-white`} style={{ backgroundColor: "black", color: "white" }}>
        {children}
      </body>
    </html>
  )
}
