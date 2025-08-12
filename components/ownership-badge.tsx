import { Badge } from "@/components/ui/badge"

interface OwnershipBadgeProps {
  status: "verified" | "pending" | "unverified"
}

export function OwnershipBadge({ status }: OwnershipBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "verified":
        return {
          label: "Verified",
          variant: "default" as const,
          className: "bg-green-100 text-green-800 hover:bg-green-100",
          icon: (
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ),
        }
      case "pending":
        return {
          label: "Pending",
          variant: "secondary" as const,
          className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
          icon: (
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
          ),
        }
      case "unverified":
        return {
          label: "Unverified",
          variant: "outline" as const,
          className: "bg-gray-100 text-gray-600 hover:bg-gray-100",
          icon: (
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ),
        }
      default:
        return {
          label: "Unknown",
          variant: "outline" as const,
          className: "bg-gray-100 text-gray-600",
          icon: null,
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <Badge variant={config.variant} className={`text-xs flex items-center ${config.className}`}>
      {config.icon}
      {config.label}
    </Badge>
  )
}
