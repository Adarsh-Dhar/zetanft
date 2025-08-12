"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChainBadge } from "@/components/chain-badge"

interface Transaction {
  id: string
  type: "mint" | "transfer" | "cross-chain"
  nftName: string
  status: "completed" | "failed" | "pending"
  txHash: string
  timestamp: string
  fromChain?: string
  toChain?: string
  cost?: string
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "mint",
    nftName: "Cosmic Explorer #1234",
    status: "completed",
    txHash: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    timestamp: "2024-01-15T10:30:00Z",
    cost: "0.01 SOL",
  },
  {
    id: "2",
    type: "cross-chain",
    nftName: "Digital Dreamscape #567",
    status: "completed",
    txHash: "0x1234567890abcdef1234567890abcdef12345678",
    timestamp: "2024-01-12T16:45:00Z",
    fromChain: "solana",
    toChain: "ethereum",
    cost: "0.05 ETH",
  },
  {
    id: "3",
    type: "mint",
    nftName: "Cyber Punk Avatar #890",
    status: "failed",
    txHash: "5xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    timestamp: "2024-01-10T14:20:00Z",
    cost: "0.01 SOL",
  },
]

export function TransactionHistory() {
  const [transactions] = useState<Transaction[]>(mockTransactions)

  const formatTxHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-6)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTypeIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "mint":
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        )
      case "transfer":
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4" />
            </svg>
          </div>
        )
      case "cross-chain":
        return (
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </div>
        )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No transactions yet</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50">
              {getTypeIcon(tx.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 truncate">{tx.nftName}</h4>
                  <Badge
                    variant={
                      tx.status === "completed" ? "default" : tx.status === "failed" ? "destructive" : "secondary"
                    }
                    className="text-xs"
                  >
                    {tx.status}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-600 capitalize">{tx.type}</span>
                  {tx.fromChain && tx.toChain && (
                    <>
                      <span className="text-gray-400">•</span>
                      <ChainBadge chain={tx.fromChain as any} />
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <ChainBadge chain={tx.toChain as any} />
                    </>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>TX: {formatTxHash(tx.txHash)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 px-1 text-xs"
                      onClick={() => navigator.clipboard.writeText(tx.txHash)}
                    >
                      Copy
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500">
                    <span>{formatDate(tx.timestamp)}</span>
                    {tx.cost && <span className="ml-2">• {tx.cost}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
