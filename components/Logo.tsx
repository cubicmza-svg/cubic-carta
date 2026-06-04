export default function Logo() {
  return (
    <div className="flex flex-col items-center py-10 pb-6">
      <svg
        width="200"
        height="80"
        viewBox="0 0 200 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="CUBIC Café & Bar"
      >
        {/* Cuadrado decorativo */}
        <rect x="0" y="8" width="14" height="14" fill="#4ADE80" />
        <rect x="186" y="8" width="14" height="14" fill="#4ADE80" />

        {/* Texto CUBIC */}
        <text
          x="100"
          y="42"
          fontFamily="'Bebas Neue', cursive"
          fontSize="52"
          fontWeight="400"
          fill="white"
          textAnchor="middle"
          letterSpacing="10"
        >
          CUBIC
        </text>

        {/* Línea divisora verde */}
        <line x1="20" y1="52" x2="180" y2="52" stroke="#4ADE80" strokeWidth="1.5" />

        {/* Subtítulo */}
        <text
          x="100"
          y="70"
          fontFamily="'DM Sans', sans-serif"
          fontSize="13"
          fontWeight="400"
          fill="#9B97A8"
          textAnchor="middle"
          letterSpacing="6"
        >
          CAFÉ &amp; BAR
        </text>
      </svg>
    </div>
  );
}
