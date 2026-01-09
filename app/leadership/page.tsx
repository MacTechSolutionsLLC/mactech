import Link from 'next/link'
import Image from 'next/image'

type Pillar = 'Security' | 'Infrastructure' | 'Quality' | 'Governance'

const pillarInfo = {
  'Security': {
    name: 'Security',
    leader: 'Patrick Caruso',
    description: 'Cybersecurity & RMF expertise',
    color: 'bg-red-50 border-red-200 text-red-900',
    badgeColor: 'bg-red-100 text-red-800 border-red-300'
  },
  'Infrastructure': {
    name: 'Infrastructure',
    leader: 'James Adams',
    description: 'Data center, storage, networking, deployment',
    color: 'bg-blue-50 border-blue-200 text-blue-900',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  'Quality': {
    name: 'Quality',
    leader: 'Brian MacDonald',
    description: 'ISO compliance, metrology, audit readiness',
    color: 'bg-green-50 border-green-200 text-green-900',
    badgeColor: 'bg-green-100 text-green-800 border-green-300'
  },
  'Governance': {
    name: 'Governance',
    leader: 'John Milso',
    description: 'Legal, contracts, risk analysis, corporate governance',
    color: 'bg-purple-50 border-purple-200 text-purple-900',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300'
  }
}

export default function LeadershipPage() {
  return (
    <div className="bg-white">
      {/* Header - Editorial */}
      <section className="section-narrow bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto">
          <h1 className="heading-hero mb-6">Leadership</h1>
          <p className="text-body-lg text-neutral-700 max-w-2xl leading-relaxed mb-8">
            Senior practitioners with proven track records in DoD and federal programs.
          </p>
          
          {/* Pillar System Introduction */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 mb-6">
            <h2 className="heading-3 mb-4">Our Four Pillars of Expertise</h2>
            <p className="text-body-sm text-neutral-700 mb-4 leading-relaxed">
              MacTech's leadership is organized into four pillars, each representing a core domain of expertise 
              and led by a senior practitioner with deep experience in that area.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`p-4 rounded border ${pillarInfo.Security.color}`}>
                <h3 className="text-body-sm font-semibold mb-1">{pillarInfo.Security.name}</h3>
                <p className="text-body-xs text-neutral-700">{pillarInfo.Security.description}</p>
              </div>
              <div className={`p-4 rounded border ${pillarInfo.Infrastructure.color}`}>
                <h3 className="text-body-sm font-semibold mb-1">{pillarInfo.Infrastructure.name}</h3>
                <p className="text-body-xs text-neutral-700">{pillarInfo.Infrastructure.description}</p>
              </div>
              <div className={`p-4 rounded border ${pillarInfo.Quality.color}`}>
                <h3 className="text-body-sm font-semibold mb-1">{pillarInfo.Quality.name}</h3>
                <p className="text-body-xs text-neutral-700">{pillarInfo.Quality.description}</p>
              </div>
              <div className={`p-4 rounded border ${pillarInfo.Governance.color}`}>
                <h3 className="text-body-sm font-semibold mb-1">{pillarInfo.Governance.name}</h3>
                <p className="text-body-xs text-neutral-700">{pillarInfo.Governance.description}</p>
              </div>
            </div>
            <p className="text-body-sm text-neutral-600 mt-4 italic">
              Each pillar leader oversees the development and delivery of tools, platforms, and capabilities in their domain.
            </p>
          </div>
        </div>
      </section>

      {/* Leadership Profiles - Editorial layout */}
      <section className="section-container bg-white">
        <div className="max-w-5xl mx-auto space-y-20">
          {/* Brian MacDonald */}
          <div className="fade-in">
            <div className="grid md:grid-cols-12 gap-12 items-start">
              <div className="md:col-span-4">
                <div className="relative w-64 h-64 md:w-80 md:h-80 mb-6 overflow-hidden rounded-sm border border-neutral-200">
                  <Image
                    src="/images/brian-macdonald.png"
                    alt="Brian MacDonald"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 256px, 320px"
                  />
                </div>
              </div>
              <div className="md:col-span-8">
                <div className="flex items-center gap-4 mb-4 flex-wrap">
                  <h2 className="heading-2 mb-0">Brian MacDonald</h2>
                  <span className={`text-body-sm font-semibold px-4 py-1.5 rounded border ${pillarInfo.Quality.badgeColor}`}>
                    {pillarInfo.Quality.name} Pillar
                  </span>
                </div>
                <p className="text-body-sm text-accent-700 font-medium mb-2 uppercase tracking-wide">
                  Managing Member, Compliance & Operations
                </p>
                <p className="text-body-sm text-neutral-600 mb-6">
                  {pillarInfo.Quality.description}
                </p>
                <div className="prose prose-neutral max-w-none">
                  <p className="text-body text-neutral-700 mb-6 leading-relaxed">
                    Brian brings extensive experience in quality management, compliance, and operations 
                    for regulated environments. His background includes leading ISO implementation programs, 
                    laboratory accreditation efforts, and audit readiness initiatives for federal contractors.
                  </p>
                  <div className="mb-6">
                    <h4 className="text-body-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wide">
                      Areas of Expertise
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex gap-3">
                        <div className="flex-shrink-0 mt-1.5">
                          <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                        </div>
                        <span className="text-body text-neutral-700">Quality Management Systems (ISO 9001, 17025)</span>
                      </li>
                      <li className="flex gap-3">
                        <div className="flex-shrink-0 mt-1.5">
                          <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                        </div>
                        <span className="text-body text-neutral-700">Audit Readiness and Compliance</span>
                      </li>
                      <li className="flex gap-3">
                        <div className="flex-shrink-0 mt-1.5">
                          <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                        </div>
                        <span className="text-body text-neutral-700">Process Documentation and Standardization</span>
                      </li>
                      <li className="flex gap-3">
                        <div className="flex-shrink-0 mt-1.5">
                          <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                        </div>
                        <span className="text-body text-neutral-700">Operations Management</span>
                      </li>
                      <li className="flex gap-3">
                        <div className="flex-shrink-0 mt-1.5">
                          <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                        </div>
                        <span className="text-body text-neutral-700">Regulated Environment Compliance</span>
                      </li>
                    </ul>
                  </div>
                  <div className={`mt-6 p-4 rounded border ${pillarInfo.Quality.color}`}>
                    <p className="text-body-sm font-semibold mb-2">Quality Pillar Tools & Capabilities</p>
                    <p className="text-body-sm text-neutral-700 mb-3">
                      Brian leads the Quality pillar, overseeing tools and platforms for ISO compliance, metrology management, 
                      audit readiness, and process documentation.
                    </p>
                    <Link href="/showcase" className="text-body-sm font-medium text-accent-700 hover:text-accent-800">
                      View Quality Pillar Tools →
                    </Link>
                  </div>
                  <p className="text-body-sm text-neutral-600 italic mt-6">
                    Available for proposals as key personnel. Security clearance status available upon request.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-neutral-200"></div>

          {/* Patrick Caruso */}
          <div className="fade-in-delay-1">
            <div className="grid md:grid-cols-12 gap-12 items-start">
              <div className="md:col-span-4">
                <div className="relative w-64 h-64 md:w-80 md:h-80 mb-6 overflow-hidden rounded-sm border border-neutral-200">
                  <Image
                    src="/images/patrick-caruso.jpg"
                    alt="Patrick Caruso"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 256px, 320px"
                  />
                </div>
              </div>
              <div className="md:col-span-8">
                <div className="flex items-center gap-4 mb-4 flex-wrap">
                  <h2 className="heading-2 mb-0">Patrick Caruso</h2>
                  <span className={`text-body-sm font-semibold px-4 py-1.5 rounded border ${pillarInfo.Security.badgeColor}`}>
                    {pillarInfo.Security.name} Pillar
                  </span>
                </div>
                <p className="text-body-sm text-accent-700 font-medium mb-2 uppercase tracking-wide">
                  Director of Cyber Assurance (Key Personnel)
                </p>
                <p className="text-body-sm text-neutral-600 mb-6">
                  {pillarInfo.Security.description}
                </p>
                <div className="prose prose-neutral max-w-none">
                  <p className="text-body text-neutral-700 mb-6 leading-relaxed">
                    Patrick is a recognized expert in DoD cybersecurity, Risk Management Framework (RMF), 
                    and authorization processes. He has successfully led multiple ATO efforts for mission-critical 
                    systems and has deep experience with STIG compliance, continuous monitoring, and security 
                    control implementation.
                  </p>
                  <div className="mb-6">
                    <h4 className="text-body-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wide">
                      Areas of Expertise
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex gap-3">
                        <div className="flex-shrink-0 mt-1.5">
                          <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                        </div>
                        <span className="text-body text-neutral-700">Risk Management Framework (RMF) Implementation</span>
                      </li>
                      <li className="flex gap-3">
                        <div className="flex-shrink-0 mt-1.5">
                          <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                        </div>
                        <span className="text-body text-neutral-700">Authorization to Operate (ATO) Package Development</span>
                      </li>
                      <li className="flex gap-3">
                        <div className="flex-shrink-0 mt-1.5">
                          <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                        </div>
                        <span className="text-body text-neutral-700">Continuous Monitoring (ConMon) Programs</span>
                      </li>
                      <li className="flex gap-3">
                        <div className="flex-shrink-0 mt-1.5">
                          <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                        </div>
                        <span className="text-body text-neutral-700">STIG Compliance and Remediation</span>
                      </li>
                      <li className="flex gap-3">
                        <div className="flex-shrink-0 mt-1.5">
                          <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                        </div>
                        <span className="text-body text-neutral-700">Security Control Assessment (SCA)</span>
                      </li>
                      <li className="flex gap-3">
                        <div className="flex-shrink-0 mt-1.5">
                          <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                        </div>
                        <span className="text-body text-neutral-700">DoD Cybersecurity Policy and Requirements</span>
                      </li>
                    </ul>
                  </div>
                  <div className={`mt-6 p-4 rounded border ${pillarInfo.Security.color}`}>
                    <p className="text-body-sm font-semibold mb-2">Security Pillar Tools & Capabilities</p>
                    <p className="text-body-sm text-neutral-700 mb-3">
                      Patrick leads the Security pillar, overseeing tools and platforms for RMF management, STIG compliance, 
                      security architecture, vulnerability management, and authorization processes.
                    </p>
                    <Link href="/showcase" className="text-body-sm font-medium text-accent-700 hover:text-accent-800">
                      View Security Pillar Tools →
                    </Link>
                  </div>
                  <p className="text-body-sm text-neutral-600 italic mt-6">
                    Available for proposals as key personnel. Security clearance status available upon request.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-neutral-200"></div>

          {/* James Adams */}
          <div className="fade-in-delay-2">
            <div className="grid md:grid-cols-12 gap-12 items-start">
              <div className="md:col-span-4">
                <div className="relative w-64 h-64 md:w-80 md:h-80 mb-6 overflow-hidden rounded-sm border border-neutral-200">
                  <Image
                    src="/images/james-adams.png"
                    alt="James Adams"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 256px, 320px"
                  />
                </div>
              </div>
              <div className="md:col-span-8">
                <div className="flex items-center gap-4 mb-4 flex-wrap">
                  <h2 className="heading-2 mb-0">James Adams</h2>
                  <span className={`text-body-sm font-semibold px-4 py-1.5 rounded border ${pillarInfo.Infrastructure.badgeColor}`}>
                    {pillarInfo.Infrastructure.name} Pillar
                  </span>
                </div>
                <p className="text-body-sm text-accent-700 font-medium mb-2 uppercase tracking-wide">
                  Director of Infrastructure & Systems Engineering (Key Personnel)
                </p>
                <p className="text-body-sm text-neutral-600 mb-6">
                  {pillarInfo.Infrastructure.description}
                </p>
                <div className="prose prose-neutral max-w-none">
                  <p className="text-body text-neutral-700 mb-6 leading-relaxed">
                    James specializes in infrastructure architecture, systems engineering, and platform design 
                    for mission-critical federal systems. His expertise includes data center design, virtualization, 
                    cloud migration, and building infrastructure that meets authorization requirements from the ground up.
                  </p>
                  <div className="mb-6">
                    <h4 className="text-body-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wide">
                      Areas of Expertise
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex gap-3">
                        <div className="flex-shrink-0 mt-1.5">
                          <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                        </div>
                        <span className="text-body text-neutral-700">Data Center Architecture and Design</span>
                      </li>
                      <li className="flex gap-3">
                        <div className="flex-shrink-0 mt-1.5">
                          <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                        </div>
                        <span className="text-body text-neutral-700">Virtualization and Cloud Platforms</span>
                      </li>
                      <li className="flex gap-3">
                        <div className="flex-shrink-0 mt-1.5">
                          <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                        </div>
                        <span className="text-body text-neutral-700">Storage and Backup Solutions</span>
                      </li>
                      <li className="flex gap-3">
                        <div className="flex-shrink-0 mt-1.5">
                          <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                        </div>
                        <span className="text-body text-neutral-700">Network Architecture and Security</span>
                      </li>
                      <li className="flex gap-3">
                        <div className="flex-shrink-0 mt-1.5">
                          <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                        </div>
                        <span className="text-body text-neutral-700">Infrastructure as Code (IaC)</span>
                      </li>
                      <li className="flex gap-3">
                        <div className="flex-shrink-0 mt-1.5">
                          <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                        </div>
                        <span className="text-body text-neutral-700">Performance Optimization and Capacity Planning</span>
                      </li>
                    </ul>
                  </div>
                  <div className={`mt-6 p-4 rounded border ${pillarInfo.Infrastructure.color}`}>
                    <p className="text-body-sm font-semibold mb-2">Infrastructure Pillar Tools & Capabilities</p>
                    <p className="text-body-sm text-neutral-700 mb-3">
                      James leads the Infrastructure pillar, overseeing tools and platforms for data center deployment, 
                      infrastructure health monitoring, network configuration, and performance optimization.
                    </p>
                    <Link href="/showcase" className="text-body-sm font-medium text-accent-700 hover:text-accent-800">
                      View Infrastructure Pillar Tools →
                    </Link>
                  </div>
                  <p className="text-body-sm text-neutral-600 italic mt-6">
                    Available for proposals as key personnel. Security clearance status available upon request.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-neutral-200"></div>

          {/* John Milso */}
          <div className="fade-in-delay-3">
            <div className="grid md:grid-cols-12 gap-12 items-start">
              <div className="md:col-span-4">
                <div className="relative w-64 h-64 md:w-80 md:h-80 mb-6 overflow-hidden rounded-sm border border-neutral-200">
                  <Image
                    src="/images/jon.png"
                    alt="John Milso"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 256px, 320px"
                  />
                </div>
              </div>
              <div className="md:col-span-8">
                <div className="flex items-center gap-4 mb-4 flex-wrap">
                  <h2 className="heading-2 mb-0">John Milso</h2>
                  <span className={`text-body-sm font-semibold px-4 py-1.5 rounded border ${pillarInfo.Governance.badgeColor}`}>
                    {pillarInfo.Governance.name} Pillar
                  </span>
                </div>
                <p className="text-body-sm text-accent-700 font-medium mb-2 uppercase tracking-wide">
                  Director of Legal, Contracts & Risk Advisory (Key Personnel)
                </p>
                <p className="text-body-sm text-neutral-600 mb-6">
                  {pillarInfo.Governance.description}
                </p>
                <div className="prose prose-neutral max-w-none">
                  <p className="text-body text-neutral-700 mb-6 leading-relaxed">
                    John brings extensive experience as former Senior Legal Counsel at a global, publicly traded 
                    software company. His background includes commercial contracts, corporate governance, M&A due 
                    diligence, and complex litigation across regulated industries. He helps MacTech clients reduce 
                    downstream legal and contractual risk through better upfront alignment.
                  </p>
                  <div className="mb-6">
                    <h4 className="text-body-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wide">
                      Areas of Expertise
                    </h4>
                    <ul className="space-y-2">
                      <li className="flex gap-3">
                        <div className="flex-shrink-0 mt-1.5">
                          <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                        </div>
                        <span className="text-body text-neutral-700">Commercial Contracts (Software, Services, Vendors)</span>
                      </li>
                      <li className="flex gap-3">
                        <div className="flex-shrink-0 mt-1.5">
                          <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                        </div>
                        <span className="text-body text-neutral-700">Corporate Governance</span>
                      </li>
                      <li className="flex gap-3">
                        <div className="flex-shrink-0 mt-1.5">
                          <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                        </div>
                        <span className="text-body text-neutral-700">M&A Due Diligence</span>
                      </li>
                      <li className="flex gap-3">
                        <div className="flex-shrink-0 mt-1.5">
                          <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                        </div>
                        <span className="text-body text-neutral-700">Risk Identification and Mitigation</span>
                      </li>
                      <li className="flex gap-3">
                        <div className="flex-shrink-0 mt-1.5">
                          <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                        </div>
                        <span className="text-body text-neutral-700">Vendor and Subcontractor Agreement Alignment</span>
                      </li>
                      <li className="flex gap-3">
                        <div className="flex-shrink-0 mt-1.5">
                          <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                        </div>
                        <span className="text-body text-neutral-700">Contractual Readiness for Cyber and Compliance Obligations</span>
                      </li>
                    </ul>
                  </div>
                  <div className={`mt-6 p-4 rounded border ${pillarInfo.Governance.color}`}>
                    <p className="text-body-sm font-semibold mb-2">Governance Pillar Tools & Capabilities</p>
                    <p className="text-body-sm text-neutral-700 mb-3">
                      John leads the Governance pillar, overseeing tools and platforms for contract management, 
                      legal document generation, risk analysis, and corporate governance.
                    </p>
                    <Link href="/showcase" className="text-body-sm font-medium text-accent-700 hover:text-accent-800">
                      View Governance Pillar Tools →
                    </Link>
                  </div>
                  <p className="text-body-sm text-neutral-600 italic mt-6">
                    Available for proposals as key personnel. Licensed in Massachusetts and Rhode Island.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Restrained */}
      <section className="section-container bg-neutral-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="heading-2 mb-6">Ready to Work Together?</h2>
          <p className="text-body-lg mb-10 text-neutral-700 max-w-2xl mx-auto leading-relaxed">
            Our leadership team is available for proposals and can be named as key personnel. 
            Contact us to discuss your requirements.
          </p>
          <Link href="/contact" className="btn-primary">
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  )
}
