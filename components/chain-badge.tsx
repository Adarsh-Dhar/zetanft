import { Badge } from "@/components/ui/badge"

interface ChainBadgeProps {
  chain: "solana" | "ethereum" | "polygon"
}

export function ChainBadge({ chain }: ChainBadgeProps) {
  const getChainConfig = (chain: string) => {
    switch (chain) {
      case "solana":
        return {
          label: "Solana",
          className: "bg-purple-100 text-purple-800 hover:bg-purple-100",
          icon: <div className="w-3 h-3 mr-1 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"></div>,
        }
      case "ethereum":
        return {
          label: "Ethereum",
          className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
          icon: <div className="w-3 h-3 mr-1 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400"></div>,
        }
      case "polygon":
        return {
          label: "Polygon",
          className: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
          icon: <div className="w-3 h-3 mr-1 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400"></div>,
        }
      default:
        return {
          label: "Unknown",
          className: "bg-gray-100 text-gray-600",
          icon: <div className="w-3 h-3 mr-1 rounded-full bg-gray-400"></div>,
        }
    }
  }

  const config = getChainConfig(chain)

  return (
    <Badge variant="secondary" className={`text-xs flex items-center ${config.className}`}>
      {config.icon}
      {config.label}
    </Badge>
  )
}
