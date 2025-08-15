'use client'

import React, { useState } from 'react'
import { useWallet } from '@/contexts/wallet-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { SolanaClient } from '@/lib/solana-client'

interface CrossChainNftMintProps {
  className?: string
}

export function CrossChainNftMint({ className }: CrossChainNftMintProps) {
  const { wallet, connected } = useWallet()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [recipientAddress, setRecipientAddress] = useState('')
  const [metadataUri, setMetadataUri] = useState('')
  const [amount, setAmount] = useState('0.01')
  const [uniqueId, setUniqueId] = useState('')
  const [lastTxHash, setLastTxHash] = useState('')

  const generateUniqueId = () => {
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substring(2, 15)
    const newId = (timestamp + random).slice(0, 64) // Ensure 32 bytes (64 hex chars)
    setUniqueId(newId)
  }

  const handleMintNftOnly = async () => {
    if (!connected || !wallet) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first.',
        variant: 'destructive',
      })
      return
    }

    if (!recipientAddress || !metadataUri || !uniqueId) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const solanaClient = new SolanaClient(wallet)
      await solanaClient.initialize()
      
      const txHash = await solanaClient.mintNftOnZetaChain(
        recipientAddress,
        metadataUri,
        uniqueId
      )
      
      setLastTxHash(txHash)
      toast({
        title: 'NFT Mint Requested',
        description: `Transaction submitted: ${txHash.slice(0, 8)}...${txHash.slice(-8)}`,
      })
    } catch (error) {
      console.error('Error minting NFT:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to mint NFT',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDepositAndMint = async () => {
    if (!connected || !wallet) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first.',
        variant: 'destructive',
      })
      return
    }

    if (!recipientAddress || !metadataUri || !uniqueId || !amount) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const solanaClient = new SolanaClient(wallet)
      await solanaClient.initialize()
      
      const txHash = await solanaClient.depositAndMintNft(
        recipientAddress,
        metadataUri,
        uniqueId,
        parseFloat(amount)
      )
      
      setLastTxHash(txHash)
      toast({
        title: 'SOL Deposited & NFT Mint Requested',
        description: `Transaction submitted: ${txHash.slice(0, 8)}...${txHash.slice(-8)}`,
      })
    } catch (error) {
      console.error('Error depositing and minting NFT:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to deposit and mint NFT',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="secondary">Solana → ZetaChain</Badge>
            Cross-Chain NFT Minting
          </CardTitle>
          <CardDescription>
            Mint NFTs on ZetaChain by calling the Solana program. This demonstrates the cross-chain
            integration between Solana and ZetaChain.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Address (Ethereum)</Label>
              <Input
                id="recipient"
                placeholder="0x..."
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metadata">Metadata URI</Label>
              <Input
                id="metadata"
                placeholder="https://..."
                value={metadataUri}
                onChange={(e) => setMetadataUri(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="uniqueId">Unique ID (32 bytes)</Label>
              <div className="flex gap-2">
                <Input
                  id="uniqueId"
                  placeholder="Enter or generate unique ID"
                  value={uniqueId}
                  onChange={(e) => setUniqueId(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateUniqueId}
                  disabled={loading}
                >
                  Generate
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">SOL Amount (optional)</Label>
              <Input
                id="amount"
                type="number"
                step="0.001"
                min="0"
                placeholder="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <Alert>
            <AlertDescription>
              <strong>How it works:</strong> When you call the Solana program, it will:
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Transfer SOL to the program (if amount specified)</li>
                <li>Create a cross-chain message with NFT minting data</li>
                <li>Send the message to ZetaChain via the gateway</li>
                <li>Trigger NFT minting on ZetaChain</li>
              </ol>
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button
              onClick={handleMintNftOnly}
              disabled={loading || !connected}
              className="flex-1"
            >
              {loading ? 'Processing...' : 'Mint NFT Only'}
            </Button>
            <Button
              onClick={handleDepositAndMint}
              disabled={loading || !connected}
              className="flex-1"
              variant="default"
            >
              {loading ? 'Processing...' : 'Deposit SOL + Mint NFT'}
            </Button>
          </div>

          {lastTxHash && (
            <Alert>
              <AlertDescription>
                <strong>Last Transaction:</strong>{' '}
                <code className="bg-muted px-1 py-0.5 rounded text-sm">
                  {lastTxHash.slice(0, 8)}...{lastTxHash.slice(-8)}
                </code>
                <br />
                <small className="text-muted-foreground">
                  Check Solana Explorer for transaction details
                </small>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
