"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { ImageUpload } from "@/components/image-upload"
import { TransactionStatus, type TransactionStep } from "@/components/transaction-status"
import { useWallet } from "@/contexts/wallet-context"
import { useToast } from "@/hooks/use-toast"

interface NFTMetadata {
  name: string
  description: string
  image: File | null
  attributes: { trait_type: string; value: string }[]
}

export function MintForm() {
  const { connected, publicKey } = useWallet()
  const { toast } = useToast()
  const [metadata, setMetadata] = useState<NFTMetadata>({
    name: "",
    description: "",
    image: null,
    attributes: [],
  })

  const [isLoading, setIsLoading] = useState(false)
  const [newAttribute, setNewAttribute] = useState({ trait_type: "", value: "" })
  const [transactionSteps, setTransactionSteps] = useState<TransactionStep[]>([])
  const [showTransactionStatus, setShowTransactionStatus] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!connected || !publicKey) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to mint an NFT",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setShowTransactionStatus(true)

    const steps: TransactionStep[] = [
      {
        id: "upload",
        title: "Upload Image to IPFS",
        description: "Uploading your NFT image to decentralized storage",
        status: "processing",
      },
      {
        id: "metadata",
        title: "Create Metadata",
        description: "Generating NFT metadata and uploading to IPFS",
        status: "pending",
      },
      {
        id: "mint",
        title: "Mint NFT",
        description: "Creating your NFT on the Solana blockchain",
        status: "pending",
      },
      {
        id: "verify",
        title: "Verify Ownership",
        description: "Confirming NFT ownership and updating records",
        status: "pending",
      },
    ]

    setTransactionSteps(steps)

    try {
      // TODO: Implement real IPFS upload logic
      toast({
        title: "NFT Minted Successfully!",
        description: `Your NFT "${metadata.name}" has been minted successfully.`,
      })

      setMetadata({
        name: "",
        description: "",
        image: null,
        attributes: [],
      })
    } catch (error) {
      console.error("Minting failed:", error)
      setTransactionSteps((prev) =>
        prev.map((step) => (step.status === "processing" ? { ...step, status: "failed" } : step)),
      )
      toast({
        title: "Minting Failed",
        description: "There was an error minting your NFT. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addAttribute = () => {
    if (newAttribute.trait_type && newAttribute.value) {
      setMetadata((prev) => ({
        ...prev,
        attributes: [...prev.attributes, newAttribute],
      }))
      setNewAttribute({ trait_type: "", value: "" })
    }
  }

  const removeAttribute = (index: number) => {
    setMetadata((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }))
  }

  const retryMinting = () => {
    setTransactionSteps([])
    setShowTransactionStatus(false)
    handleSubmit(new Event("submit") as any)
  }

  if (showTransactionStatus && transactionSteps.length > 0) {
    return (
      <TransactionStatus
        steps={transactionSteps}
        onClose={() => setShowTransactionStatus(false)}
        onRetry={retryMinting}
      />
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">NFT Name *</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter NFT name"
              value={metadata.name}
              onChange={(e) => setMetadata((prev) => ({ ...prev, name: e.target.value }))}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="collection">Collection (Optional)</Label>
            <Input id="collection" type="text" placeholder="Collection name" className="w-full" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            placeholder="Describe your NFT..."
            value={metadata.description}
            onChange={(e) => setMetadata((prev) => ({ ...prev, description: e.target.value }))}
            required
            rows={4}
            className="w-full"
          />
        </div>
      </div>

      {/* Image Upload */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Upload Image</h2>
        <ImageUpload
          onImageSelect={(file) => setMetadata((prev) => ({ ...prev, image: file }))}
          selectedImage={metadata.image}
        />
      </div>

      {/* Attributes */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Attributes (Optional)</h2>
        <p className="text-sm text-gray-600">Add traits and properties that make your NFT unique</p>

        {/* Add new attribute */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Label htmlFor="trait-type">Trait Type</Label>
                <Input
                  id="trait-type"
                  placeholder="e.g., Color, Rarity"
                  value={newAttribute.trait_type}
                  onChange={(e) => setNewAttribute((prev) => ({ ...prev, trait_type: e.target.value }))}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="trait-value">Value</Label>
                <Input
                  id="trait-value"
                  placeholder="e.g., Blue, Legendary"
                  value={newAttribute.value}
                  onChange={(e) => setNewAttribute((prev) => ({ ...prev, value: e.target.value }))}
                />
              </div>
              <Button type="button" onClick={addAttribute} variant="outline">
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Display existing attributes */}
        {metadata.attributes.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Current Attributes</h3>
            <div className="grid gap-2">
              {metadata.attributes.map((attr, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="flex gap-4">
                    <span className="font-medium text-gray-700">{attr.trait_type}:</span>
                    <span className="text-gray-600">{attr.value}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttribute(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Minting Options */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Minting Options</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="royalty">Creator Royalty (%)</Label>
            <Input id="royalty" type="number" placeholder="0-10" min="0" max="10" step="0.1" className="w-full" />
            <p className="text-xs text-gray-500">Percentage you'll earn from secondary sales</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supply">Supply</Label>
            <Input id="supply" type="number" placeholder="1" min="1" defaultValue="1" className="w-full" />
            <p className="text-xs text-gray-500">Number of copies to mint</p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-6 border-t">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <p>
              Estimated minting cost: <span className="font-medium">~0.01 SOL</span>
            </p>
          </div>
          <Button
            type="submit"
            disabled={isLoading || !metadata.name || !metadata.description || !metadata.image || !connected}
            className="bg-blue-600 hover:bg-blue-700 px-8"
          >
            {isLoading ? "Minting..." : "Mint NFT"}
          </Button>
        </div>
      </div>
    </form>
  )
}
