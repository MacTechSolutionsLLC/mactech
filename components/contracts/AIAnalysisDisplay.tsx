'use client'

import { useState } from 'react'

interface AIAnalysis {
  analyzed_at?: string
  strategic_insights?: {
    competitive_positioning?: string
    win_probability?: number
    win_probability_reasoning?: string
    pricing_recommendation?: string
    key_differentiators?: string[]
    market_opportunity?: string
  }
  competitive_intelligence?: {
    past_winners_analysis?: string
    competitor_patterns?: string[]
    agency_preferences?: string
    market_dynamics?: string
    competitive_landscape?: string
  }
  deliverables?: {
    executive_summary?: string
    competitive_brief?: string
    pricing_strategy?: string
    proposal_guidance?: string
    risk_assessment?: string
  }
  comparative_analysis?: {
    similarity_score?: number
    similarity_explanation?: string
    deviations?: string[]
    opportunity_sizing?: string
    feasibility_assessment?: string
  }
}

interface AIAnalysisDisplayProps {
  aiAnalysis: AIAnalysis
  contractTitle?: string
}

export default function AIAnalysisDisplay({ aiAnalysis, contractTitle }: AIAnalysisDisplayProps) {
  const [activeTab, setActiveTab] = useState<'strategic' | 'competitive' | 'deliverables' | 'comparative'>('strategic')

  const strategic = aiAnalysis.strategic_insights
  const competitive = aiAnalysis.competitive_intelligence
  const deliverables = aiAnalysis.deliverables
  const comparative = aiAnalysis.comparative_analysis

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">AI Analysis & Insights</h3>
        {aiAnalysis.analyzed_at && (
          <span className="text-xs text-gray-500">
            Analyzed: {new Date(aiAnalysis.analyzed_at).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-4">
          {strategic && (
            <button
              onClick={() => setActiveTab('strategic')}
              className={`py-2 px-4 text-sm font-medium border-b-2 ${
                activeTab === 'strategic'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Strategic Insights
            </button>
          )}
          {competitive && (
            <button
              onClick={() => setActiveTab('competitive')}
              className={`py-2 px-4 text-sm font-medium border-b-2 ${
                activeTab === 'competitive'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Competitive Intelligence
            </button>
          )}
          {deliverables && (
            <button
              onClick={() => setActiveTab('deliverables')}
              className={`py-2 px-4 text-sm font-medium border-b-2 ${
                activeTab === 'deliverables'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Deliverables
            </button>
          )}
          {comparative && (
            <button
              onClick={() => setActiveTab('comparative')}
              className={`py-2 px-4 text-sm font-medium border-b-2 ${
                activeTab === 'comparative'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Comparative Analysis
            </button>
          )}
        </nav>
      </div>

      {/* Strategic Insights Tab */}
      {activeTab === 'strategic' && strategic && (
        <div className="space-y-6">
          {strategic.win_probability !== undefined && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-700">Win Probability</h4>
                <span className="text-lg font-bold text-blue-600">{strategic.win_probability}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className={`h-3 rounded-full transition-all ${
                    strategic.win_probability >= 70
                      ? 'bg-green-600'
                      : strategic.win_probability >= 50
                      ? 'bg-yellow-600'
                      : 'bg-red-600'
                  }`}
                  style={{ width: `${strategic.win_probability}%` }}
                />
              </div>
              {strategic.win_probability_reasoning && (
                <p className="text-sm text-gray-600">{strategic.win_probability_reasoning}</p>
              )}
            </div>
          )}

          {strategic.competitive_positioning && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Competitive Positioning</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{strategic.competitive_positioning}</p>
            </div>
          )}

          {strategic.pricing_recommendation && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Pricing Recommendation</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{strategic.pricing_recommendation}</p>
            </div>
          )}

          {strategic.key_differentiators && strategic.key_differentiators.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Differentiators</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {strategic.key_differentiators.map((diff, idx) => (
                  <li key={idx}>{diff}</li>
                ))}
              </ul>
            </div>
          )}

          {strategic.market_opportunity && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Market Opportunity</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{strategic.market_opportunity}</p>
            </div>
          )}
        </div>
      )}

      {/* Competitive Intelligence Tab */}
      {activeTab === 'competitive' && competitive && (
        <div className="space-y-6">
          {competitive.past_winners_analysis && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Past Winners Analysis</h4>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {competitive.past_winners_analysis}
              </p>
            </div>
          )}

          {competitive.competitor_patterns && competitive.competitor_patterns.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Competitor Patterns</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {competitive.competitor_patterns.map((pattern, idx) => (
                  <li key={idx}>{pattern}</li>
                ))}
              </ul>
            </div>
          )}

          {competitive.agency_preferences && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Agency Preferences</h4>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {competitive.agency_preferences}
              </p>
            </div>
          )}

          {competitive.market_dynamics && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Market Dynamics</h4>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {competitive.market_dynamics}
              </p>
            </div>
          )}

          {competitive.competitive_landscape && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Competitive Landscape</h4>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {competitive.competitive_landscape}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Deliverables Tab */}
      {activeTab === 'deliverables' && deliverables && (
        <div className="space-y-6">
          {deliverables.executive_summary && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Executive Summary</h4>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {deliverables.executive_summary}
                </p>
              </div>
            </div>
          )}

          {deliverables.competitive_brief && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Competitive Intelligence Brief</h4>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {deliverables.competitive_brief}
                </p>
              </div>
            </div>
          )}

          {deliverables.pricing_strategy && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Pricing Strategy</h4>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {deliverables.pricing_strategy}
                </p>
              </div>
            </div>
          )}

          {deliverables.proposal_guidance && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Proposal Guidance</h4>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {deliverables.proposal_guidance}
                </p>
              </div>
            </div>
          )}

          {deliverables.risk_assessment && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Risk Assessment</h4>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {deliverables.risk_assessment}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Comparative Analysis Tab */}
      {activeTab === 'comparative' && comparative && (
        <div className="space-y-6">
          {comparative.similarity_score !== undefined && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-700">Similarity Score</h4>
                <span className="text-lg font-bold text-blue-600">{comparative.similarity_score}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${comparative.similarity_score}%` }}
                />
              </div>
              {comparative.similarity_explanation && (
                <p className="text-sm text-gray-600">{comparative.similarity_explanation}</p>
              )}
            </div>
          )}

          {comparative.deviations && comparative.deviations.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Deviations</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {comparative.deviations.map((deviation, idx) => (
                  <li key={idx}>{deviation}</li>
                ))}
              </ul>
            </div>
          )}

          {comparative.opportunity_sizing && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Opportunity Sizing</h4>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {comparative.opportunity_sizing}
              </p>
            </div>
          )}

          {comparative.feasibility_assessment && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Feasibility Assessment</h4>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {comparative.feasibility_assessment}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


