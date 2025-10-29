import { Building2 } from "lucide-react"

export default function PartnersPage() {
  // Define priority partners (first two)
  const priorityPartners = [
    { name: "SISCOM", logo: "/assets/partners/PARTNER-SISCOM.png" },
    { name: "ANZA", logo: "/assets/partners/PARTNER-ANZA.png" },
  ]

  // Define all other partners
  const otherPartners = [
    { name: "TASEC", logo: "/assets/partners/PARTNER-TASEC.png" },
    { name: "ACE", logo: "/assets/partners/PARTNER-ACE.png" },
    { name: "IHUB", logo: "/assets/partners/PARTNER-IHUB.png" },
    { name: "JHUB", logo: "/assets/partners/PARTNER-JHUB.png" },
    { name: "LITTLE", logo: "/assets/partners/PARTNER-LITTLE.png" },
    { name: "SISULE", logo: "/assets/partners/PARTNER-SISULE.png" },
    { name: "TTW", logo: "/assets/partners/PARTNER-TTW.png" },
    { name: "WOJO", logo: "/assets/partners/PARTNER-WOJO.png" },
    { name: "AIDUCATION", logo: "/assets/partners/PARTNER-AIDUCATION.png" },
    { name: "Close The Gap", logo: "/assets/partners/PARTNER-CLOSETHEGAP.png" },
    { name: "Grid Nai", logo: "/assets/partners/PARTNER-GRID-NAI.png" },
    { name: "Nafasi", logo: "/assets/partners/PARTNER-NAFASI.png" },
    { name: "Heva", logo: "/assets/partners/partner-heva.png" },
    { name: "Zindua School", logo: "/assets/partners/Zindua-Transparent-Logo.png" },
    { name: "Bebba Beggie", logo: "/assets/partners/Bebba_Beggie_Logo.png" },
    { name: "Founder Hub", logo: "/assets/partners/Foubder-Hub.png" },
    { name: "The Cube", logo: "/assets/partners/the-cube.png" },
    { name: "Vabu", logo: "/assets/partners/Vabu-3.png" },
    { name: "SwahiliPot Hub", logo: "/assets/partners/SwahiliPot-logo-png-1-1.png" },
    { name: "Riara University", logo: "/assets/partners/riara-uni-partners.png" },
    { name: "Unicaf", logo: "/assets/partners/unicaf-logo.png" },
    { name: "Anza Grow", logo: "/assets/partners/anza-grow.png" },
    { name: "AUG", logo: "/assets/partners/aug.png" },
    { name: "Beta", logo: "/assets/partners/Beta-Logo.jpg" },
    { name: "Blockchain Centre", logo: "/assets/partners/Blockchain_Centre_Logo.png" },
    { name: "Drice", logo: "/assets/partners/drice.png" },
    { name: "Eldoret Grind", logo: "/assets/partners/eldoret-grind.png" },
    { name: "KDF", logo: "/assets/partners/KDF-logo.png" },
    { name: "Modua", logo: "/assets/partners/modua.png" },
    { name: "TechRift", logo: "/assets/partners/techrift-logo.png" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-10 w-10 md:h-12 md:w-12 text-[#FF6B35]" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1A1A1A] mb-4">
            Our Partners
          </h1>
          <p className="text-base md:text-lg text-[#666666] max-w-2xl mx-auto">
            We're proud to collaborate with these amazing organizations that share our vision for innovation and growth.
          </p>
        </div>

        {/* Priority Partners Section */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] text-center mb-8">
            Key Partners
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {priorityPartners.map((partner) => (
              <div
                key={partner.name}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 flex items-center justify-center border-2 border-[#FF6B35]/10 hover:border-[#FF6B35]/30 group"
              >
                <div className="w-full h-32 flex items-center justify-center">
                  <img
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const fallback = document.createElement('div')
                      fallback.className = 'text-[#666666] text-center text-sm font-medium'
                      fallback.textContent = partner.name
                      target.parentElement?.appendChild(fallback)
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Other Partners Section */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] text-center mb-8">
            All Partners
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {otherPartners.map((partner) => (
              <div
                key={partner.name}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 flex items-center justify-center border border-gray-200 hover:border-[#FF6B35]/30 group"
              >
                <div className="w-full h-20 flex items-center justify-center">
                  <img
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const fallback = document.createElement('div')
                      fallback.className = 'text-[#666666] text-center text-xs font-medium'
                      fallback.textContent = partner.name
                      target.parentElement?.appendChild(fallback)
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Text */}
        <div className="mt-16 text-center">
          <p className="text-sm text-[#666666]">
            Interested in partnering with us?{" "}
            <a href="https://afrinovationfestival.com/our-patners/" target="_blank" rel="noopener noreferrer" className="text-[#FF6B35] hover:underline font-medium">
              Get in touch
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
