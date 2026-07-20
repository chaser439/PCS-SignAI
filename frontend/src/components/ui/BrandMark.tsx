interface BrandMarkProps {
  compact?: boolean
}

export function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <span className="brand-mark" aria-label="PCS-SignAI">
      <svg className="brand-mark__symbol" viewBox="0 0 40 40" aria-hidden="true">
        <path d="M10 28V13.5c0-2 1.6-3.5 3.5-3.5h8.2c5 0 8.3 2.8 8.3 7.1 0 4.6-3.6 7.4-8.8 7.4h-5.4" />
        <path d="M16 30c3.2-4.1 8.4-4.9 12.4-1.7" />
        <circle cx="10" cy="31" r="2.2" />
        <circle cx="30.5" cy="29.5" r="2.2" />
        <circle cx="30" cy="12" r="1.6" />
      </svg>
      {!compact && (
        <span className="brand-mark__type">
          <strong>PCS-SignAI</strong>
          <small>Semantic Understanding Layer</small>
        </span>
      )}
    </span>
  )
}
