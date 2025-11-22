export const IntroPage = () => {
  return (
    <section
      className="h-screen w-full bg-cover bg-center relative"
      style={{ backgroundImage: "url('/bg-image.png')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-6">
        <h1 className="text-5xl md:text-7xl font-bold mb-4 font-['Playfair_Display'] drop-shadow-lg">
          Organize Your Home Better
        </h1>

        <p className="max-w-2xl text-lg md:text-xl font-light mb-8 font-['Poppins']">
          Manage groceries, kitchen essentials, and household items — all in one
          smart, simple, beautifully designed app.
        </p>

        <a
          href="/login"
          className="px-8 py-3 bg-yellow-400 text-black font-semibold rounded-full hover:bg-yellow-300 transition shadow-lg"
        >
          Get Started
        </a>
      </div>
    </section>
  )
}
