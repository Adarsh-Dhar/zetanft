"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface WalletContextType {
  connected: boolean
  connecting: boolean
  publicKey: string | null
  walletName: string | null
  connect: () => Promise<void>
  disconnect: () => void
  signTransaction: (transaction: any) => Promise<any>
  signMessage: (message: string) => Promise<string>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [walletName, setWalletName] = useState<string | null>(null)

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    try {
      // Check for Phantom wallet
      if (typeof window !== "undefined" && window.solana?.isPhantom) {
        const response = await window.solana.connect({ onlyIfTrusted: true })
        if (response.publicKey) {
          setConnected(true)
          setPublicKey(response.publicKey.toString())
          setWalletName("Phantom")
        }
      }
    } catch (error) {
      console.log("No wallet found or connection failed:", error)
    }
  }

  const connect = async () => {
    if (connecting) return

    setConnecting(true)
    try {
      // Try Phantom first
      if (typeof window !== "undefined" && window.solana?.isPhantom) {
        const response = await window.solana.connect()
        setConnected(true)
        setPublicKey(response.publicKey.toString())
        setWalletName("Phantom")
      } else {
        // Redirect to Phantom installation if not found
        window.open("https://phantom.app/", "_blank")
        throw new Error("Phantom wallet not found. Please install Phantom wallet.")
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      throw error
    } finally {
      setConnecting(false)
    }
  }

  const disconnect = () => {
    if (typeof window !== "undefined" && window.solana) {
      window.solana.disconnect()
    }
    setConnected(false)
    setPublicKey(null)
    setWalletName(null)
  }

  const signTransaction = async (transaction: any) => {
    if (!connected || !window.solana) {
      throw new Error("Wallet not connected")
    }
    return await window.solana.signTransaction(transaction)
  }

  const signMessage = async (message: string) => {
    if (!connected || !window.solana) {
      throw new Error("Wallet not connected")
    }
    const encodedMessage = new TextEncoder().encode(message)
    const signedMessage = await window.solana.signMessage(encodedMessage, "utf8")
    return signedMessage.signature
  }

  const value: WalletContextType = {
    connected,
    connecting,
    publicKey,
    walletName,
    connect,
    disconnect,
    signTransaction,
    signMessage,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

// Extend Window interface for Solana wallet
declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean
      connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>
      disconnect: () => void
      signTransaction: (transaction: any) => Promise<any>
      signMessage: (message: Uint8Array, encoding: string) => Promise<{ signature: string }>
    }
  }
}
