import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-100 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-white font-semibold text-lg mb-4 tracking-tight">
              MacTech Solutions
            </h3>
            <p className="text-body-sm text-neutral-400 max-w-md leading-relaxed">
              Veteran-owned consulting firm specializing in DoD cybersecurity, 
              infrastructure engineering, and compliance for federal programs and defense contractors.
            </p>
            <p className="mt-6 text-body-sm text-neutral-500">
              SDVOSB (Pending) | Veteran-Owned
            </p>
          </div>
          
          {/* Services */}
          <div>
            <h4 className="text-white font-medium text-body-sm mb-4 tracking-wide uppercase">
              Services
            </h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/services" 
                  className="text-body-sm text-neutral-400 hover:text-neutral-200 transition-colors duration-gentle"
                >
                  Cybersecurity & RMF
                </Link>
              </li>
              <li>
                <Link 
                  href="/services" 
                  className="text-body-sm text-neutral-400 hover:text-neutral-200 transition-colors duration-gentle"
                >
                  Infrastructure Engineering
                </Link>
              </li>
              <li>
                <Link 
                  href="/services" 
                  className="text-body-sm text-neutral-400 hover:text-neutral-200 transition-colors duration-gentle"
                >
                  Quality & Compliance
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h4 className="text-white font-medium text-body-sm mb-4 tracking-wide uppercase">
              Company
            </h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/leadership" 
                  className="text-body-sm text-neutral-400 hover:text-neutral-200 transition-colors duration-gentle"
                >
                  Leadership
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-body-sm text-neutral-400 hover:text-neutral-200 transition-colors duration-gentle"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  href="/readiness" 
                  className="text-body-sm text-neutral-400 hover:text-neutral-200 transition-colors duration-gentle"
                >
                  Readiness Assessment
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Copyright - minimal, restrained */}
        <div className="border-t border-neutral-800 mt-16 pt-8">
          <p className="text-body-sm text-neutral-500 text-center">
            &copy; {new Date().getFullYear()} MacTech Solutions LLC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
