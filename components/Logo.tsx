export default function Logo() {
  return (
    <div className="flex items-center justify-center py-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-cubic.svg"
        alt="CUBIC Café & Bar"
        className="h-32 md:h-44 w-auto object-contain"
      />
    </div>
  );
}
