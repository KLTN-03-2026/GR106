interface NavbarDividerProps {
  mounted: boolean;
  scrolled?: boolean;
}

export function NavbarDivider({ mounted, scrolled = false }: NavbarDividerProps) {
  return (
    <div
      className={`w-full h-px transition-all duration-[1000ms] ease-out delay-[800ms]
        ${mounted ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"}`}
      style={{
        background: scrolled
          ? "none"
          : "linear-gradient(90deg, transparent 0%, rgba(232,200,64,0.5) 20%, rgba(232,200,64,0.8) 50%, rgba(232,200,64,0.5) 80%, transparent 100%)",
        transformOrigin: "center",
      }}
    />
  );
}

export default NavbarDivider;