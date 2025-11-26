import { Building2 } from "lucide-react"

export default function PartnersPage() {
  // Define priority partners (top partners in specific order)
  const priorityPartners = [
    { name: "Tambua", logo: "/assets/partners/Tambua.svg" },
    { name: "Platcorp", logo: "/assets/partners/platcorp.svg" },
    { name: "Vabu", logo: "/assets/partners/Vabu-3.png" },
    { name: "SISCOM", logo: "/assets/partners/PARTNER-SISCOM.png" },
    { name: "AWIT", logo: "/assets/partners/AWIT.png" },
  ]

  // Define all other partners (design partners first, then Kenya Tech Events, then rest)
  const otherPartners = [
    // Design Partners
    { name: "Kenya Designs Konversations", logo: "/assets/partners/kenyakonversations.png" },
    // Events
    { name: "Kenya Tech Events", logo: "/assets/partners/KENYA TECH EVENTS LOGO MAIN.jpeg" },
    // Other Partners
    { name: "iHub", logo: "/assets/partners/iHUB logo (1).png" },
    { name: "TTW", logo: "/assets/partners/TTW transparet.png" },
    { name: "WomenTech Network", logo: "/assets/partners/WomenTech Network Logo Regular.png" },
    { name: "Lamu", logo: "/assets/partners/lamu.png" },
    { name: "Lux", logo: "/assets/partners/luxpng.png" },

  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-10 w-10 md:h-12 md:w-12 text-[#60166b]" />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
            {priorityPartners.map((partner) => (
              <div
                key={partner.name}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 flex items-center justify-center border-2 border-[#60166b]/10 hover:border-[#60166b]/30 group"
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
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 flex items-center justify-center border border-gray-200 hover:border-[#60166b]/30 group"
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
            <a href="https://www.summit.womenintechblog.dev/" target="_blank" rel="noopener noreferrer" className="text-[#60166b] hover:underline font-medium">
              Get in touch
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
