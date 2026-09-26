import Image from "next/image";

// Una sola firma al pie, extraída del original; sin placas ni contenedores.
export function BrandSignature() {
  return (
    <span className="inline-flex items-center gap-3">
      <Image
        src="/brand/symbol.webp"
        alt=""
        width={256}
        height={224}
        unoptimized
        className="h-auto w-14 shrink-0"
      />
      <Image
        src="/brand/wordmark.webp"
        alt="tuestela.es"
        width={600}
        height={104}
        unoptimized
        className="h-auto w-40"
      />
    </span>
  );
}
