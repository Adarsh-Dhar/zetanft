"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChainBadge } from "@/components/chain-badge"

interface CrossChainTransfer {
  id: string
  nftName: string
  fromChain: "solana" | "ethereum" | "polygon"
  toChain: "solana" | "ethereum" | "polygon"
  status: "initiated" | "bridging" | "confirming" | "completed" | "failed"
  steps: {
    id: string
    title: string
    status: "pending" | "processing" | "completed" | "failed"
    txHash?: string
    timestamp?: string
  }[]
  estimatedTime: number
  startTime: string
}

interface CrossChainStatusProps {
  transfer: CrossChainTransfer
  onClose?: () => void
}

export function CrossChainStatus({ transfer, onClose }: CrossChainStatusProps) {
  const [timeElapsed, setTimeElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - new Date(transfer.startTime).getTime()) / 1000)
      setTimeElapsed(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [transfer.startTime])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getStatusColor = (status: CrossChainTransfer["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "failed":
        return "bg-red-500"
      case "bridging":
      case "confirming":
        return "bg-blue-500"
      default:
        return "bg-yellow-500"
    }
  }

  const completedSteps = transfer.steps.filter((step) => step.status === "completed").length
  const progress = (completedSteps / transfer.steps.length) * 100

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(transfer.status)} animate-pulse`}></div>
            <span>Cross-Chain Transfer</span>
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">{transfer.nftName}</span>
            <Badge variant="outline" className="text-xs">
              {transfer.status.toUpperCase()}
            </Badge>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <ChainBadge chain={transfer.fromChain} />
              <span className="text-sm text-gray-600">From</span>
            </div>
            <div className="flex-1 relative">
              <div className="h-0.5 bg-gray-200 rounded-full">
                <div
                  className="h-0.5 bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white border-2 border-blue-500 rounded-full p-1">
                  <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">To</span>
              <ChainBadge chain={transfer.toChain} />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Time elapsed: {formatTime(timeElapsed)}</span>
            <span>Est. total: {formatTime(transfer.estimatedTime)}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {transfer.steps.map((step, index) => (
          <div key={step.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              {step.status === "completed" ? (
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              ) : step.status === "processing" ? (
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              ) : step.status === "failed" ? (
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              ) : (
                <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900">{step.title}</h4>
              {step.txHash && (
                <div className="mt-1 flex items-center space-x-2">
                  <span className="text-xs text-gray-500">TX:</span>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {step.txHash.slice(0, 6)}...{step.txHash.slice(-6)}
                  </code>
                </div>
              )}
              {step.timestamp && (
                <p className="text-xs text-gray-500 mt-1">{new Date(step.timestamp).toLocaleString()}</p>
              )}
            </div>
          </div>
        ))}

        {transfer.status === "completed" && (
          <div className="pt-4 border-t bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium text-green-800">
                Cross-chain transfer completed successfully! Your NFT is now available on {transfer.toChain}.
              </span>
            </div>
          </div>
        )}

        {transfer.status === "failed" && (
          <div className="pt-4 border-t bg-red-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium text-red-800">
                Transfer failed. Please try again or contact support if the issue persists.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
