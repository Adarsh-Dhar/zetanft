"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/contexts/wallet-context"
import { useToast } from "@/hooks/use-toast"
import { SolanaClient } from "@/lib/solana-client"
import { PublicKey } from "@solana/web3.js"

export default function SolZetaPage() {
  const { connected, publicKey } = useWallet()
  const { toast } = useToast()
  const [solanaClient, setSolanaClient] = useState<SolanaClient | null>(null)
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [transactions, setTransactions] = useState<any[]>([])

  // Form states
  const [depositForm, setDepositForm] = useState({
    recipientAddress: "",
    metadataUri: "",
    amount: "0.01",
    tokenType: "SOL"
  })

  const [withdrawForm, setWithdrawForm] = useState({
    recipient: "",
    amount: "",
    message: ""
  })

  const [splForm, setSplForm] = useState({
    mint: "",
    recipientAddress: "",
    metadataUri: "",
    amount: ""
  })

  useEffect(() => {
    if (connected && publicKey) {
      initializeSolanaClient()
    }
  }, [connected, publicKey])

  const initializeSolanaClient = async () => {
    try {
      // Create a mock wallet object that matches what SolanaClient expects
      const mockWallet = {
        publicKey: new PublicKey(publicKey!),
        signTransaction: async (tx: any) => {
          // This would be handled by the actual wallet
          return tx
        },
        signAllTransactions: async (txs: any[]) => {
          return txs
        }
      }

      const client = new SolanaClient(mockWallet, 'devnet')
      setSolanaClient(client)
      
      // Get initial balance
      const bal = await client.getBalance()
      setBalance(bal)
    } catch (error) {
      console.error("Failed to initialize Solana client:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      toast({
        title: "Initialization Failed",
        description: `Failed to initialize Solana client: ${errorMessage}`,
        variant: "destructive"
      })
      // Set a flag to prevent further operations
      setSolanaClient(null)
    }
  }

  const handleDepositSol = async () => {
    console.log("solana client", solanaClient)
    if (!solanaClient) return

    setLoading(true)
    try {
      const result = await solanaClient.depositSolForNFT(
        depositForm.recipientAddress,
        depositForm.metadataUri,
        parseFloat(depositForm.amount)
      )

      toast({
        title: "Deposit Successful",
        description: `Transaction: ${result.txHash}`,
      })

      // Refresh balance
      const newBalance = await solanaClient.getBalance()
      setBalance(newBalance)

      // Add to transaction history
      setTransactions(prev => [{
        type: "SOL Deposit",
        amount: depositForm.amount,
        recipient: depositForm.recipientAddress,
        txHash: result.txHash,
        timestamp: new Date().toISOString()
      }, ...prev])

      // Reset form
      setDepositForm({
        recipientAddress: "",
        metadataUri: "",
        amount: "0.01",
        tokenType: "SOL"
      })
    } catch (error) {
      toast({
        title: "Deposit Failed",
        description: error instanceof Error ? error.message : "Failed to deposit SOL",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDepositSpl = async () => {
    if (!solanaClient) return

    setLoading(true)
    try {
      const result = await solanaClient.depositSplTokenForNFT(
        new PublicKey(splForm.mint),
        splForm.recipientAddress,
        splForm.metadataUri,
        parseFloat(splForm.amount)
      )

      toast({
        title: "SPL Token Deposit Successful",
        description: `Transaction: ${result.txHash}`,
      })

      // Add to transaction history
      setTransactions(prev => [{
        type: "SPL Token Deposit",
        amount: splForm.amount,
        recipient: splForm.recipientAddress,
        txHash: result.txHash,
        timestamp: new Date().toISOString()
      }, ...prev])

      // Reset form
      setSplForm({
        mint: "",
        recipientAddress: "",
        metadataUri: "",
        amount: ""
      })
    } catch (error) {
      toast({
        title: "SPL Token Deposit Failed",
        description: error instanceof Error ? error.message : "Failed to deposit SPL token",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    if (!solanaClient) return

    setLoading(true)
    try {
      const result = await solanaClient.withdrawFromZetaChain(
        new PublicKey(withdrawForm.recipient),
        parseFloat(withdrawForm.amount),
        withdrawForm.message
      )

      toast({
        title: "Withdrawal Successful",
        description: `Transaction: ${result.txHash}`,
      })

      // Add to transaction history
      setTransactions(prev => [{
        type: "Withdrawal",
        amount: withdrawForm.amount,
        recipient: withdrawForm.recipient,
        txHash: result.txHash,
        timestamp: new Date().toISOString()
      }, ...prev])

      // Reset form
      setWithdrawForm({
        recipient: "",
        amount: "",
        message: ""
      })
    } catch (error) {
      toast({
        title: "Withdrawal Failed",
        description: error instanceof Error ? error.message : "Failed to withdraw",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshBalance = async () => {
    if (solanaClient) {
      try {
        const newBalance = await solanaClient.getBalance()
        setBalance(newBalance)
        toast({
          title: "Balance Updated",
          description: `Current balance: ${newBalance.toFixed(4)} SOL`,
        })
      } catch (error) {
        toast({
          title: "Failed to Update Balance",
          description: "Could not refresh balance",
          variant: "destructive"
        })
      }
    }
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Wallet Required</CardTitle>
              <CardDescription className="text-center">
                Please connect your wallet to access Solana-ZetaChain functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Solana-ZetaChain Bridge</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Bridge your NFTs between Solana and ZetaChain. Deposit SOL or SPL tokens to mint NFTs on ZetaChain, 
            or withdraw your assets back to Solana.
          </p>
        </div>

        {/* Balance and Status */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">SOL Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{balance.toFixed(4)} SOL</div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshBalance}
                className="mt-2"
              >
                Refresh
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Network</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="text-sm">Devnet</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500">Wallet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-900 font-mono">
                {publicKey?.slice(0, 4)}...{publicKey?.slice(-4)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Interface */}
        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="deposit">Deposit for NFT</TabsTrigger>
            <TabsTrigger value="spl">SPL Token Deposit</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          </TabsList>

          {/* Deposit Tab */}
          <TabsContent value="deposit" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Deposit SOL for ZetaChain NFT</CardTitle>
                <CardDescription>
                  Deposit SOL to mint an NFT on ZetaChain. The NFT will be created with the specified metadata.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipient">ZetaChain Recipient Address</Label>
                    <Input
                      id="recipient"
                      placeholder="0x..."
                      value={depositForm.recipientAddress}
                      onChange={(e) => setDepositForm(prev => ({ ...prev, recipientAddress: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">SOL Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.001"
                      placeholder="0.01"
                      value={depositForm.amount}
                      onChange={(e) => setDepositForm(prev => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metadata">Metadata URI</Label>
                  <Input
                    id="metadata"
                    placeholder="https://..."
                    value={depositForm.metadataUri}
                    onChange={(e) => setDepositForm(prev => ({ ...prev, metadataUri: e.target.value }))}
                  />
                </div>
                <Button 
                  onClick={handleDepositSol} 
                  disabled={loading || !depositForm.recipientAddress || !depositForm.metadataUri}
                  className="w-full"
                >
                  {loading ? "Processing..." : "Deposit SOL for NFT"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SPL Token Tab */}
          <TabsContent value="spl" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Deposit SPL Token for ZetaChain NFT</CardTitle>
                <CardDescription>
                  Deposit SPL tokens to mint an NFT on ZetaChain. You'll need the token mint address.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="spl-mint">Token Mint Address</Label>
                    <Input
                      id="spl-mint"
                      placeholder="Token mint address..."
                      value={splForm.mint}
                      onChange={(e) => setSplForm(prev => ({ ...prev, mint: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spl-amount">Token Amount</Label>
                    <Input
                      id="spl-amount"
                      type="number"
                      step="0.000001"
                      placeholder="1.0"
                      value={splForm.amount}
                      onChange={(e) => setSplForm(prev => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="spl-recipient">ZetaChain Recipient Address</Label>
                    <Input
                      id="spl-recipient"
                      placeholder="0x..."
                      value={splForm.recipientAddress}
                      onChange={(e) => setSplForm(prev => ({ ...prev, recipientAddress: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spl-metadata">Metadata URI</Label>
                    <Input
                      id="spl-metadata"
                      placeholder="https://..."
                      value={splForm.metadataUri}
                      onChange={(e) => setSplForm(prev => ({ ...prev, metadataUri: e.target.value }))}
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleDepositSpl} 
                  disabled={loading || !splForm.mint || !splForm.recipientAddress || !splForm.metadataUri || !splForm.amount}
                  className="w-full"
                >
                  {loading ? "Processing..." : "Deposit SPL Token for NFT"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Withdraw Tab */}
          <TabsContent value="withdraw" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Withdraw from ZetaChain</CardTitle>
                <CardDescription>
                  Withdraw your assets from ZetaChain back to Solana. Specify the recipient address and amount.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="withdraw-recipient">Solana Recipient Address</Label>
                    <Input
                      id="withdraw-recipient"
                      placeholder="Solana address..."
                      value={withdrawForm.recipient}
                      onChange={(e) => setWithdrawForm(prev => ({ ...prev, recipient: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="withdraw-amount">SOL Amount</Label>
                    <Input
                      id="withdraw-amount"
                      type="number"
                      step="0.001"
                      placeholder="0.01"
                      value={withdrawForm.amount}
                      onChange={(e) => setWithdrawForm(prev => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="withdraw-message">Message (Optional)</Label>
                  <Input
                    id="withdraw-message"
                    placeholder="Withdrawal message..."
                    value={withdrawForm.message}
                    onChange={(e) => setWithdrawForm(prev => ({ ...prev, message: e.target.value }))}
                  />
                </div>
                <Button 
                  onClick={handleWithdraw} 
                  disabled={loading || !withdrawForm.recipient || !withdrawForm.amount}
                  className="w-full"
                >
                  {loading ? "Processing..." : "Withdraw from ZetaChain"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Transaction History */}
        {transactions.length > 0 && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  History of your cross-chain transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions.slice(0, 10).map((tx, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant={tx.type.includes("Deposit") ? "default" : "secondary"}>
                          {tx.type}
                        </Badge>
                        <div>
                          <div className="font-medium">{tx.amount} {tx.type.includes("SOL") ? "SOL" : "tokens"}</div>
                          <div className="text-sm text-gray-500">
                            To: {tx.recipient.slice(0, 8)}...{tx.recipient.slice(-6)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          {tx.txHash.slice(0, 8)}...{tx.txHash.slice(-6)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">How it works</CardTitle>
            </CardHeader>
            <CardContent className="text-blue-800">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">1. Deposit</h3>
                  <p className="text-sm">Deposit SOL or SPL tokens to the Solana program</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">2. Bridge</h3>
                  <p className="text-sm">ZetaChain processes the cross-chain message</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold mb-2">3. NFT Created</h3>
                  <p className="text-sm">NFT is minted on ZetaChain with your metadata</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
