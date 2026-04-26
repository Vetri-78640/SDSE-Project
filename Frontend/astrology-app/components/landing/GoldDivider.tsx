export default function GoldDivider() {
  return (
    <div className="relative flex items-center justify-center py-2" aria-hidden="true">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gold opacity-30" />
      </div>
      <div className="relative flex items-center justify-center">
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="none"
          className="text-gold opacity-50 bg-void"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="0.8" />
          <polygon points="12,4 18,16 6,16" stroke="currentColor" strokeWidth="0.8" fill="none" />
          <polygon points="12,20 18,8 6,8" stroke="currentColor" strokeWidth="0.8" fill="none" />
          <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.6" />
        </svg>
      </div>
    </div>
  )
}
