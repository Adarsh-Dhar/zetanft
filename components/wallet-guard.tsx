"use client"

import type { ReactNode } from "react"
import { useWallet } from "@/contexts/wallet-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface WalletGuardProps {
  children: ReactNode
  fallback?: ReactNode
}

export function WalletGuard({ children, fallback }: WalletGuardProps) {
  const { connected, connect, connecting } = useWallet()

  if (connected) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Connect Your Wallet</CardTitle>
          <CardDescription>You need to connect your Solana wallet to access this feature</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={connect} disabled={connecting} className="w-full bg-purple-600 hover:bg-purple-700">
            {connecting ? "Connecting..." : "Connect Wallet"}
          </Button>
          <p className="text-xs text-gray-500 mt-4">We recommend using Phantom wallet for the best experience</p>
        </CardContent>
      </Card>
    </div>
  )
}
