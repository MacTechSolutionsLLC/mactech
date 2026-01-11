/**
 * Contract discovery metrics and monitoring
 * Structured logging and performance tracking
 */

export interface Metric {
  name: string
  value: number
  tags?: Record<string, string>
  timestamp: number
}

export interface SearchMetrics {
  searchId: string
  query: string
  method: 'api' | 'google'
  duration: number
  resultsCount: number
  error?: string
  timestamp: number
}

export interface ScrapeMetrics {
  scrapeId: string
  url: string
  duration: number
  success: boolean
  sowFound: boolean
  error?: string
  timestamp: number
}

class MetricsCollector {
  private metrics: Metric[] = []
  private searchMetrics: SearchMetrics[] = []
  private scrapeMetrics: ScrapeMetrics[] = []
  private maxMetrics = 1000 // Keep last 1000 metrics
  
  recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    this.metrics.push({
      name,
      value,
      tags,
      timestamp: Date.now(),
    })
    
    // Trim if too many
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }
  }
  
  recordSearch(metrics: SearchMetrics): void {
    this.searchMetrics.push(metrics)
    
    if (this.searchMetrics.length > this.maxMetrics) {
      this.searchMetrics = this.searchMetrics.slice(-this.maxMetrics)
    }
  }
  
  recordScrape(metrics: ScrapeMetrics): void {
    this.scrapeMetrics.push(metrics)
    
    if (this.scrapeMetrics.length > this.maxMetrics) {
      this.scrapeMetrics = this.scrapeMetrics.slice(-this.maxMetrics)
    }
  }
  
  getMetrics(): Metric[] {
    return [...this.metrics]
  }
  
  getSearchMetrics(): SearchMetrics[] {
    return [...this.searchMetrics]
  }
  
  getScrapeMetrics(): ScrapeMetrics[] {
    return [...this.scrapeMetrics]
  }
  
  getStats(): {
    totalSearches: number
    totalScrapes: number
    searchSuccessRate: number
    scrapeSuccessRate: number
    avgSearchDuration: number
    avgScrapeDuration: number
  } {
    const searches = this.searchMetrics
    const scrapes = this.scrapeMetrics
    
    const successfulSearches = searches.filter(s => !s.error).length
    const successfulScrapes = scrapes.filter(s => s.success).length
    
    const avgSearchDuration = searches.length > 0
      ? searches.reduce((sum, s) => sum + s.duration, 0) / searches.length
      : 0
    
    const avgScrapeDuration = scrapes.length > 0
      ? scrapes.reduce((sum, s) => sum + s.duration, 0) / scrapes.length
      : 0
    
    return {
      totalSearches: searches.length,
      totalScrapes: scrapes.length,
      searchSuccessRate: searches.length > 0 ? successfulSearches / searches.length : 0,
      scrapeSuccessRate: scrapes.length > 0 ? successfulScrapes / scrapes.length : 0,
      avgSearchDuration,
      avgScrapeDuration,
    }
  }
  
  clear(): void {
    this.metrics = []
    this.searchMetrics = []
    this.scrapeMetrics = []
  }
}

// Singleton instance
const metricsCollector = new MetricsCollector()

/**
 * Structured logger
 */
export class Logger {
  constructor(private context: string) {}
  
  private log(level: string, message: string, data?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      context: this.context,
      message,
      ...(data && { data }),
    }
    
    // In production, use structured logging
    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(logEntry))
    } else {
      console.log(`[${level}] [${this.context}] ${message}`, data || '')
    }
  }
  
  info(message: string, data?: any): void {
    this.log('INFO', message, data)
  }
  
  warn(message: string, data?: any): void {
    this.log('WARN', message, data)
  }
  
  error(message: string, error?: Error | any, data?: any): void {
    const errorData = {
      ...data,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
    }
    this.log('ERROR', message, errorData)
  }
  
  debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      this.log('DEBUG', message, data)
    }
  }
}

/**
 * Create logger instance
 */
export function createLogger(context: string): Logger {
  return new Logger(context)
}

/**
 * Record search metrics
 */
export function recordSearchMetrics(metrics: SearchMetrics): void {
  metricsCollector.recordSearch(metrics)
}

/**
 * Record scrape metrics
 */
export function recordScrapeMetrics(metrics: ScrapeMetrics): void {
  metricsCollector.recordScrape(metrics)
}

/**
 * Record custom metric
 */
export function recordMetric(name: string, value: number, tags?: Record<string, string>): void {
  metricsCollector.recordMetric(name, value, tags)
}

/**
 * Get metrics statistics
 */
export function getMetricsStats() {
  return metricsCollector.getStats()
}

/**
 * Get all metrics (for debugging/monitoring)
 */
export function getAllMetrics() {
  return {
    metrics: metricsCollector.getMetrics(),
    searches: metricsCollector.getSearchMetrics(),
    scrapes: metricsCollector.getScrapeMetrics(),
    stats: metricsCollector.getStats(),
  }
}

