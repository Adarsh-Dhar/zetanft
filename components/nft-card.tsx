"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { OwnershipBadge } from "@/components/ownership-badge"
import { ChainBadge } from "@/components/chain-badge"

interface NFT {
  id: string
  name: string
  description: string
  image: string
  collection?: string
  attributes: { trait_type: string; value: string }[]
  mintAddress: string
  chain: "solana" | "ethereum" | "polygon"
  verificationStatus: "verified" | "pending" | "unverified"
  crossChainHistory: {
    fromChain: string
    toChain: string
    timestamp: string
    txHash: string
  }[]
  lastUpdated: string
}

interface NFTCardProps {
  nft: NFT
}

export function NFTCard({ nft }: NFTCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-gray-300">
      <div className="aspect-square relative overflow-hidden rounded-t-lg bg-gray-100">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        <img
          src={nft.image || "/placeholder.svg"}
          alt={nft.name}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <ChainBadge chain={nft.chain} />
          <OwnershipBadge status={nft.verificationStatus} />
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900 truncate">{nft.name}</h3>
            {nft.collection && <p className="text-sm text-gray-600 truncate">{nft.collection}</p>}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              <p>Mint: {formatAddress(nft.mintAddress)}</p>
              <p>Updated: {formatDate(nft.lastUpdated)}</p>
            </div>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full bg-transparent">
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{nft.name}</DialogTitle>
                <DialogDescription>{nft.collection}</DialogDescription>
              </DialogHeader>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <img src={nft.image || "/placeholder.svg"} alt={nft.name} className="w-full rounded-lg" />
                  <div className="flex gap-2">
                    <ChainBadge chain={nft.chain} />
                    <OwnershipBadge status={nft.verificationStatus} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-sm text-gray-600">{nft.description}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Details</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-gray-600">Mint Address:</span> {nft.mintAddress}
                      </p>
                      <p>
                        <span className="text-gray-600">Chain:</span> {nft.chain}
                      </p>
                      <p>
                        <span className="text-gray-600">Last Updated:</span> {formatDate(nft.lastUpdated)}
                      </p>
                    </div>
                  </div>

                  {nft.attributes.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Attributes</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {nft.attributes.map((attr, index) => (
                          <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                            <p className="font-medium text-gray-700">{attr.trait_type}</p>
                            <p className="text-gray-600">{attr.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {nft.crossChainHistory.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Cross-Chain History</h4>
                      <div className="space-y-2">
                        {nft.crossChainHistory.map((transfer, index) => (
                          <div key={index} className="bg-blue-50 p-3 rounded text-sm">
                            <p className="font-medium">
                              {transfer.fromChain} → {transfer.toChain}
                            </p>
                            <p className="text-gray-600">{formatDate(transfer.timestamp)}</p>
                            <p className="text-xs text-gray-500 truncate">TX: {transfer.txHash}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
