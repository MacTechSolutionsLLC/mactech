'use client'

import { useState } from 'react'
import Link from 'next/link'
import UserNavigation from '@/components/user/UserNavigation'

export default function UserPage() {
  const userTools = [
    {
      href: '/user/capture',
      title: 'Federal Capture Dashboard',
      description: 'Discover opportunities, analyze incumbents, and prepare to bid on federal contracts',
      icon: '📊',
      color: 'bg-blue-50 border-blue-200 hover:border-blue-300',
      iconBg: 'bg-blue-100',
    },
    {
      href: '/user/contract-discovery',
      title: 'Contract Discovery',
      description: 'Search for VetCert-eligible contract opportunities on SAM.gov using keywords and filters',
      icon: '🔍',
      color: 'bg-green-50 border-green-200 hover:border-green-300',
      iconBg: 'bg-green-100',
    },
    {
      href: '/user/contract-discovery/dashboard',
      title: 'Contract Dashboard',
      description: 'Unified dashboard for all contract opportunities with scoring, filtering, and management',
      icon: '📋',
      color: 'bg-purple-50 border-purple-200 hover:border-purple-300',
      iconBg: 'bg-purple-100',
    },
  ]

  return (
    <div className="bg-neutral-50 min-h-screen">
      <UserNavigation />
      
      {/* Header */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-bold text-neutral-900 mb-4">User Portal</h1>
            <p className="text-lg text-neutral-700 leading-relaxed">
              Manage contract opportunities and analyze federal contract data.
            </p>
          </div>
        </div>
      </section>

      {/* Contract Management Tools Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Contract Management Tools</h2>
          <p className="text-neutral-600">Tools for discovering, analyzing, and bidding on federal contracts</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userTools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className={`group block p-6 rounded-xl border-2 transition-all duration-200 ${tool.color}`}
            >
              <div className="flex items-start gap-4">
                <div className={`${tool.iconBg} p-3 rounded-lg text-2xl flex-shrink-0`}>
                  {tool.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2 group-hover:text-accent-700 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    {tool.description}
                  </p>
                  <div className="mt-4 flex items-center text-sm font-medium text-accent-700 group-hover:text-accent-800">
                    Open →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
