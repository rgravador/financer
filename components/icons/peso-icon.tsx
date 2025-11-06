interface PesoIconProps {
  className?: string
  size?: number
}

/**
 * Philippine Peso (₱) Icon Component
 * SVG representation of the peso symbol
 */
export function PesoIcon({ className = "w-5 h-5", size }: PesoIconProps) {
  const iconStyle = size ? { width: size, height: size } : {}
  
  return (
    <svg 
      className={className}
      style={iconStyle}
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Peso symbol paths */}
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M6 9h8a3 3 0 013 3v0a3 3 0 01-3 3H9m-3-6V6m0 3v9m3-9h5m-5 3h5M6 18h3"
      />
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  )
}

/**
 * Simple peso icon without circle border for inline use
 */
export function SimplePesoIcon({ className = "w-5 h-5", size }: PesoIconProps) {
  const iconStyle = size ? { width: size, height: size } : {}
  
  return (
    <svg 
      className={className}
      style={iconStyle}
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Simplified peso symbol - just the P with horizontal lines */}
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M6 6v12M6 9h6a3 3 0 100-6H6m0 6h8m-8 3h6"
      />
    </svg>
  )
}