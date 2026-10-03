import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import type { SearchResult, BiomedicalEntityType } from '../types/biomedical'
import { entityVisuals } from './graph/entityConfig'

interface GraphSearchBarProps {
  searchResults: SearchResult[]
  searching: boolean
  searchError: string | null
  onSearch: (query: string) => void
  onSelect: (result: SearchResult) => void
  onClear: () => void
}

export function GraphSearchBar({
  searchResults,
  searching,
  searchError,
  onSearch,
  onSelect,
  onClear,
}: GraphSearchBarProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) {
      onClear()
      setOpen(false)
      return
    }
    debounceRef.current = setTimeout(() => {
      onSearch(query)
      setOpen(true)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, onSearch, onClear])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (result: SearchResult) => {
    onSelect(result)
    setQuery(result.title)
    setOpen(false)
  }

  const handleClear = () => {
    setQuery('')
    onClear()
  }

  return (
    <div className="kg-search" ref={containerRef}>
      <div className="kg-search-input-wrap">
        <Search size={14} className="kg-search-icon" />
        <input
          type="text"
          className="kg-search-input"
          placeholder="Search diseases, genes, drugs, pathways…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => searchResults.length > 0 && setOpen(true)}
          aria-label="Search biomedical entities"
        />
        {query && (
          <button
            type="button"
            className="kg-search-clear"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {open && (searching || searchResults.length > 0 || searchError) && (
        <div className="kg-search-dropdown">
          {searching && (
            <div className="kg-search-status">
              <div className="kg-spinner" />
              <span>Searching…</span>
            </div>
          )}

          {searchError && !searching && (
            <div className="kg-search-status kg-search-status--error">
              {searchError}
            </div>
          )}

          {!searching && !searchError && searchResults.length === 0 && query.trim() && (
            <div className="kg-search-status">
              No results found for "{query}"
            </div>
          )}

          {!searching && !searchError && searchResults.length > 0 && (
            <ul className="kg-search-list">
              {searchResults.map((result) => {
                const visual = entityVisuals(result.type as BiomedicalEntityType)
                return (
                  <li key={result.id}>
                    <button
                      type="button"
                      className="kg-search-item"
                      onClick={() => handleSelect(result)}
                    >
                      <span
                        className="kg-search-item-dot"
                        style={{ background: visual.color }}
                      />
                      <span className="kg-search-item-info">
                        <span className="kg-search-item-title">{result.title}</span>
                        <span className="kg-search-item-sub">
                          {visual.label} · {result.subtitle}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
