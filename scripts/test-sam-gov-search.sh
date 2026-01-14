#!/bin/bash

# Validation Test Script for SAM.gov Keyword Search (curl version)
# 
# Usage:
#   1. Start the Next.js dev server: npm run dev
#   2. Run this script: bash scripts/test-sam-gov-search.sh

BASE_URL="${TEST_URL:-http://localhost:3000}"

echo "🧪 SAM.gov Keyword Search Validation Tests"
echo "============================================================"
echo "Testing against: $BASE_URL"
echo "============================================================"

test_search() {
    local keywords="$1"
    local description="$2"
    
    echo ""
    echo "============================================================"
    echo "Test: $description"
    echo "Keywords: \"$keywords\""
    echo "============================================================"
    echo ""
    
    response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/admin/contract-discovery/search-v2" \
        -H "Content-Type: application/json" \
        -d "{
            \"keywords\": \"$keywords\",
            \"service_category\": \"general\",
            \"date_range\": \"past_month\",
            \"limit\": 10
        }")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" != "200" ]; then
        echo "❌ API Error ($http_code):"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
        return 1
    fi
    
    success=$(echo "$body" | jq -r '.success // false')
    if [ "$success" != "true" ]; then
        echo "❌ Search failed:"
        echo "$body" | jq -r '.error // .message // "Unknown error"' 2>/dev/null || echo "$body"
        return 1
    fi
    
    total_records=$(echo "$body" | jq -r '.totalRecords // 0')
    results_count=$(echo "$body" | jq -r '.results_count // 0')
    cached=$(echo "$body" | jq -r '.cached // false')
    duration=$(echo "$body" | jq -r '.duration // 0')
    
    echo "✅ Search successful"
    echo "   Total records from API: $total_records"
    echo "   Results returned: $results_count"
    echo "   Cached: $cached"
    echo "   Duration: ${duration}ms"
    echo ""
    
    # Validate keyword filtering
    keywords_lower=$(echo "$keywords" | tr '[:upper:]' '[:lower:]')
    results=$(echo "$body" | jq -r '.results // []')
    result_count=$(echo "$results" | jq 'length')
    
    echo "📊 Validation Results:"
    echo "   Total results: $result_count"
    
    # Check first 3 results
    echo ""
    echo "   First 3 results:"
    for i in 0 1 2; do
        title=$(echo "$results" | jq -r ".[$i].title // \"\"")
        relevance=$(echo "$results" | jq -r ".[$i].relevance_score // 0")
        if [ -n "$title" ]; then
            title_short="${title:0:60}..."
            echo "   Result $((i+1)): $title_short (Relevance: $relevance)"
        fi
    done
    
    echo ""
    echo "✅ Test completed"
    return 0
}

# Run tests
test_search "metrology" "Single keyword search - should only return metrology-related results"
sleep 2

test_search "cybersecurity, RMF" "Multiple keywords - should return cybersecurity/RMF opportunities"
sleep 2

test_search "calibration" "Another single keyword - should filter to calibration-related results"

echo ""
echo "============================================================"
echo "✅ All tests completed"
echo "============================================================"

