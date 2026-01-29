import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Deployable CUI Vault | MacTech Solutions',
  description:
    'FIPS-controlled CUI boundary, C3PAO-ready evidence, and easy HTTPS integration into your website or enclave for federal programs and defense contractors.',
}

export default function VaultPage() {
  return (
    <div className="bg-white">
      {/* Hero — editorial, confident */}
      <section className="section-container bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="fade-in">
            <h1 className="heading-hero mb-6 text-neutral-900">
              Deployable CUI Vault — FIPS Boundary You Control
            </h1>
            <p className="text-body-lg text-neutral-700 max-w-2xl leading-relaxed mb-4">
              A FIPS-controlled CUI boundary with C3PAO-ready evidence and easy HTTPS integration into your website or enclave—so you reduce scope, meet DFARS, and keep CUI out of your main application.
            </p>
            <p className="text-body-sm text-neutral-500 max-w-2xl mb-10">
              FIPS 140-3 · CMMC Level 2 · C3PAO-ready evidence
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact" className="btn-primary inline-flex items-center justify-center">
                Contact Us
              </Link>
              <Link
                href="/cmmc"
                className="btn-secondary inline-flex items-center justify-center"
              >
                CMMC Offerings
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="section-container bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="heading-2 mb-4">Who It&apos;s For</h2>
          <p className="text-body text-neutral-700 max-w-3xl leading-relaxed">
            The Deployable CUI Vault is for federal programs, defense contractors, and private organizations that need a defensible CUI boundary for CMMC compliance. Deploy it in your enclave or cloud—CUI stays inside the vault; your main app never handles CUI file bytes.
          </p>
        </div>
      </section>

      {/* FIPS boundary */}
      <section className="section-container bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-4 mb-6">
            <div className="h-px w-12 bg-accent-700 shrink-0 mt-2" aria-hidden />
            <div>
              <h2 className="heading-2 mb-2">FIPS Boundary</h2>
              <p className="text-body text-neutral-600 max-w-2xl mb-6 leading-relaxed">
                All CUI decryption and cryptographic protection occur only inside the vault. Your main application issues tokens only—no CUI bytes through your app.
              </p>
            </div>
          </div>
          <div className="card p-6 bg-neutral-50 border border-neutral-200 max-w-3xl">
            <ul className="space-y-3 text-body text-neutral-700">
              <li><strong className="text-neutral-900">Platform:</strong> Ubuntu 22.04 LTS with FIPS mode enabled (kernel + OpenSSL FIPS provider). Canonical Ltd. Ubuntu 22.04 OpenSSL Cryptographic Module — NIST CMVP Certificate #4794 (FIPS 140-3 Level 1, active through 2026-09-10).</li>
              <li><strong className="text-neutral-900">CUI in transit:</strong> TLS 1.3 (AES-256-GCM-SHA384) terminated on the vault host.</li>
              <li><strong className="text-neutral-900">CUI at rest:</strong> AES-256-GCM application-level encryption using the FIPS-validated module per Certificate #4794.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* What's in the box */}
      <section className="section-container bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="heading-2 mb-4">What&apos;s in the Box</h2>
          <p className="text-body text-neutral-700 max-w-2xl mb-8 leading-relaxed">
            The deployable unit (VM image or container) includes everything needed for a defensible CUI boundary and C3PAO handoff.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <ul className="space-y-3 text-body text-neutral-700">
              <li><strong className="text-neutral-900">OS:</strong> Ubuntu 22.04 LTS, FIPS mode (kernel + OpenSSL FIPS provider per CMVP #4794)</li>
              <li><strong className="text-neutral-900">CUI Vault Service:</strong> POST/GET/DELETE /v1/files/*; JWT validation; API key for server-side delete; AES-256-GCM encrypt/decrypt</li>
              <li><strong className="text-neutral-900">TLS:</strong> nginx — TLS 1.3 termination, security headers, reverse proxy to vault service</li>
              <li><strong className="text-neutral-900">Database:</strong> Local PostgreSQL bound to localhost; encrypted CUI (ciphertext, nonce, tag, metadata)</li>
            </ul>
            <ul className="space-y-3 text-body text-neutral-700">
              <li><strong className="text-neutral-900">Hardening:</strong> harden_ubuntu_cmmc.py (and optionally harden_ubuntu_stig.py); evidence in /opt/compliance/hardening-evidence</li>
              <li><strong className="text-neutral-900">Validation:</strong> cmmc_hardening_validation_evidence.py; evidence in /opt/compliance/validation-evidence</li>
              <li><strong className="text-neutral-900">Policy bundle:</strong> Vault-boundary subset of CMMC policies/procedures under /opt/compliance/policies</li>
              <li><strong className="text-neutral-900">Evidence export:</strong> Script to produce tarball of hardening + validation evidence + policies for C3PAO</li>
            </ul>
          </div>
        </div>
      </section>

      {/* C3PAO evidence */}
      <section className="section-container bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="heading-2 mb-4">C3PAO Evidence</h2>
          <p className="text-body text-neutral-700 max-w-3xl mb-6 leading-relaxed">
            Hardening and validation evidence are produced by our automation and stored on the vault. An export script collects hardening evidence, validation evidence, and (optionally) the policy bundle into a single tarball for C3PAO handoff. Reference evidence (MAC-RPT-*, FIPS documentation) is available in the repo and can be shipped or linked from the deployable image.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-body text-neutral-700 max-w-3xl">
            <li>Hardening evidence: harden_ubuntu_cmmc.py (cloud-safe CMMC Level 2) → /opt/compliance/hardening-evidence</li>
            <li>Validation evidence: cmmc_hardening_validation_evidence.py → /opt/compliance/validation-evidence</li>
            <li>Evidence package: export script builds tarball for C3PAO</li>
          </ul>
        </div>
      </section>

      {/* HTTPS / API integration */}
      <section className="section-container bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="heading-2 mb-4">HTTPS &amp; API Integration</h2>
          <p className="text-body text-neutral-700 max-w-3xl mb-4 leading-relaxed">
            Your app authenticates users and issues short-lived JWTs for upload and view. The browser uploads and downloads CUI directly to and from the vault over HTTPS—your application never handles CUI file bytes. API: POST /v1/files/upload, GET /v1/files/:id, DELETE /v1/files/:id.
          </p>
          <p className="text-body-sm text-neutral-600">
            Contact us for integration support and environment configuration.
          </p>
        </div>
      </section>

      {/* Artifact formats */}
      <section className="section-container bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="heading-2 mb-4">Artifact Formats</h2>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <h3 className="heading-3 mb-2">VM image</h3>
              <p className="text-body text-neutral-700 leading-relaxed">
                Packer-built image (e.g. GCE, AWS AMI, Azure VHD) for DoD and federal environments where VM hardening and a FIPS kernel are required.
              </p>
            </div>
            <div className="flex-1">
              <h3 className="heading-3 mb-2">Container</h3>
              <p className="text-body text-neutral-700 leading-relaxed">
                Dockerfile/OCI image for cloud deployments—same vault service and tooling, with FIPS and hardening applied as documented for the container build.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="section-narrow bg-white border-t border-neutral-200">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-body-lg text-neutral-700 mb-8 leading-relaxed">
            Ready to deploy a FIPS-controlled CUI boundary?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-primary inline-flex items-center justify-center">
              Contact Us
            </Link>
            <Link
              href="/cmmc"
              className="btn-secondary inline-flex items-center justify-center"
            >
              CMMC Offerings
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
