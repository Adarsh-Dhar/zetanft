"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { WalletButton } from "@/components/wallet-button"

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              ZetaNFT
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link
                href="/"
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === "/" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-blue-600"
                }`}
              >
                Home
              </Link>
              <Link
                href="/mint"
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === "/mint"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                Mint
              </Link>
              <Link
                href="/my-nfts"
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === "/my-nfts"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                My NFTs
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <WalletButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
