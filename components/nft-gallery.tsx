"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/contexts/wallet-context"
import { NFTCard } from "@/components/nft-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

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

// Mock NFT data - in a real app, this would come from blockchain APIs
const mockNFTs: NFT[] = [
  {
    id: "1",
    name: "Cosmic Explorer #1234",
    description:
      "A rare cosmic explorer from the depths of space, featuring unique stellar patterns and cosmic energy.",
    image: "/placeholder.svg?height=400&width=400",
    collection: "Cosmic Explorers",
    attributes: [
      { trait_type: "Rarity", value: "Legendary" },
      { trait_type: "Background", value: "Nebula" },
      { trait_type: "Eyes", value: "Cosmic Blue" },
      { trait_type: "Accessory", value: "Star Crown" },
    ],
    mintAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    chain: "solana",
    verificationStatus: "verified",
    crossChainHistory: [
      {
        fromChain: "solana",
        toChain: "ethereum",
        timestamp: "2024-01-15T10:30:00Z",
        txHash: "0x1234...abcd",
      },
    ],
    lastUpdated: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Digital Dreamscape #567",
    description: "An abstract digital artwork representing the intersection of dreams and reality in the metaverse.",
    image: "/placeholder.svg?height=400&width=400",
    collection: "Digital Dreams",
    attributes: [
      { trait_type: "Style", value: "Abstract" },
      { trait_type: "Color Palette", value: "Vibrant" },
      { trait_type: "Mood", value: "Ethereal" },
    ],
    mintAddress: "9yKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    chain: "solana",
    verificationStatus: "verified",
    crossChainHistory: [],
    lastUpdated: "2024-01-10T14:20:00Z",
  },
  {
    id: "3",
    name: "Cyber Punk Avatar #890",
    description: "A futuristic cyberpunk character with neon enhancements and digital augmentations.",
    image: "/placeholder.svg?height=400&width=400",
    collection: "Cyber Punks",
    attributes: [
      { trait_type: "Type", value: "Avatar" },
      { trait_type: "Enhancement", value: "Neon" },
      { trait_type: "Rarity", value: "Rare" },
      { trait_type: "Generation", value: "Gen 2" },
    ],
    mintAddress: "5xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    chain: "ethereum",
    verificationStatus: "pending",
    crossChainHistory: [
      {
        fromChain: "solana",
        toChain: "ethereum",
        timestamp: "2024-01-12T16:45:00Z",
        txHash: "0x5678...efgh",
      },
    ],
    lastUpdated: "2024-01-12T16:45:00Z",
  },
]

export function NFTGallery() {
  const { publicKey } = useWallet()
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterChain, setFilterChain] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("recent")

  useEffect(() => {
    // Simulate loading NFTs from blockchain
    const loadNFTs = async () => {
      setLoading(true)
      // In a real app, you would fetch NFTs from Solana/other chains here
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setNfts(mockNFTs)
      setLoading(false)
    }

    if (publicKey) {
      loadNFTs()
    }
  }, [publicKey])

  const filteredAndSortedNFTs = nfts
    .filter((nft) => {
      const matchesSearch =
        nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nft.collection?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesChain = filterChain === "all" || nft.chain === filterChain
      const matchesStatus = filterStatus === "all" || nft.verificationStatus === filterStatus
      return matchesSearch && matchesChain && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        case "name":
          return a.name.localeCompare(b.name)
        case "collection":
          return (a.collection || "").localeCompare(b.collection || "")
        default:
          return 0
      }
    })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading your NFTs...</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="flex space-x-2">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-sm">
              {filteredAndSortedNFTs.length} NFTs
            </Badge>
            <Badge variant="outline" className="text-sm">
              {nfts.filter((nft) => nft.verificationStatus === "verified").length} Verified
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Input
              placeholder="Search NFTs or collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64"
            />

            <Select value={filterChain} onValueChange={setFilterChain}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Chain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chains</SelectItem>
                <SelectItem value="solana">Solana</SelectItem>
                <SelectItem value="ethereum">Ethereum</SelectItem>
                <SelectItem value="polygon">Polygon</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="collection">Collection</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* NFT Grid */}
      {filteredAndSortedNFTs.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No NFTs found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterChain !== "all" || filterStatus !== "all"
              ? "Try adjusting your filters or search terms"
              : "You don't have any NFTs yet. Start by minting your first NFT!"}
          </p>
          <Button asChild>
            <a href="/mint">Mint Your First NFT</a>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedNFTs.map((nft) => (
            <NFTCard key={nft.id} nft={nft} />
          ))}
        </div>
      )}
    </div>
  )
}
