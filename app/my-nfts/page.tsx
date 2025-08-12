import { Navigation } from "@/components/navigation"
import { NFTGallery } from "@/components/nft-gallery"
import { WalletGuard } from "@/components/wallet-guard"

export default function MyNFTsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">My NFTs</h1>
            <p className="mt-4 text-lg text-gray-600">View and manage your cross-chain NFT collection</p>
          </div>

          <WalletGuard>
            <NFTGallery />
          </WalletGuard>
        </div>
      </main>
    </div>
  )
}
