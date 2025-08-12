"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export type TransactionStep = {
  id: string
  title: string
  description: string
  status: "pending" | "processing" | "completed" | "failed"
  txHash?: string
  timestamp?: string
  estimatedTime?: number
}

interface TransactionStatusProps {
  steps: TransactionStep[]
  onClose?: () => void
  onRetry?: () => void
}

export function TransactionStatus({ steps, onClose, onRetry }: TransactionStatusProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const completedSteps = steps.filter((step) => step.status === "completed").length
    const newProgress = (completedSteps / steps.length) * 100
    setProgress(newProgress)
  }, [steps])

  const currentStep = steps.find((step) => step.status === "processing") || steps[steps.length - 1]
  const hasFailedStep = steps.some((step) => step.status === "failed")
  const allCompleted = steps.every((step) => step.status === "completed")

  const getStatusIcon = (status: TransactionStep["status"]) => {
    switch (status) {
      case "completed":
        return (
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )
      case "processing":
        return (
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          </div>
        )
      case "failed":
        return (
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )
      default:
        return <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
    }
  }

  const formatTxHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-6)}`
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            {allCompleted ? (
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            ) : hasFailedStep ? (
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            ) : (
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
              </div>
            )}
            <span>
              {allCompleted ? "Transaction Complete" : hasFailedStep ? "Transaction Failed" : "Processing Transaction"}
            </span>
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          )}
        </div>
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-gray-600">
            {Math.round(progress)}% complete ({steps.filter((s) => s.status === "completed").length} of {steps.length}{" "}
            steps)
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start space-x-3">
            {getStatusIcon(step.status)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">{step.title}</h4>
                <Badge
                  variant={
                    step.status === "completed"
                      ? "default"
                      : step.status === "failed"
                        ? "destructive"
                        : step.status === "processing"
                          ? "secondary"
                          : "outline"
                  }
                  className="text-xs"
                >
                  {step.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">{step.description}</p>
              {step.txHash && (
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-xs text-gray-500">TX:</span>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">{formatTxHash(step.txHash)}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => navigator.clipboard.writeText(step.txHash!)}
                  >
                    Copy
                  </Button>
                </div>
              )}
              {step.timestamp && (
                <p className="text-xs text-gray-500 mt-1">{new Date(step.timestamp).toLocaleString()}</p>
              )}
            </div>
          </div>
        ))}

        {hasFailedStep && onRetry && (
          <div className="pt-4 border-t">
            <Button onClick={onRetry} variant="outline" className="w-full bg-transparent">
              Retry Transaction
            </Button>
          </div>
        )}

        {allCompleted && (
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
                Your NFT has been successfully minted and is now available in your wallet!
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
