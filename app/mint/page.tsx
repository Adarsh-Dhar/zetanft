import { Navigation } from "@/components/navigation"
import { MintForm } from "@/components/mint-form"
import { WalletGuard } from "@/components/wallet-guard"

export default function MintPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Mint Your NFT</h1>
            <p className="mt-4 text-lg text-gray-600">Create and mint your unique digital asset on Solana</p>
          </div>

          <WalletGuard>
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <MintForm />
            </div>
          </WalletGuard>
        </div>
      </main>
    </div>
  )
}
