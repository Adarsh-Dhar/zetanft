import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-b from-blue-50 to-white py-20 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Cross-Chain NFTs
            <span className="block text-blue-600">Made Simple</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Mint NFTs on Solana and seamlessly transfer them across chains with ZetaChain. Experience the future of
            decentralized digital ownership.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/mint">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Mint NFT
              </Button>
            </Link>
            <Link href="/my-nfts">
              <Button variant="outline" size="lg">
                View My NFTs
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative background elements */}
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-blue-200 to-purple-200 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
      </div>
    </section>
  )
}
