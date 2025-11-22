"use client";

export const IntroPage = () => {
  return (
    <section
      className="relative flex items-center justify-center w-full overflow-hidden transition-colors duration-500"
      style={{ height: "calc(100vh - 80px)" }}
    >
      {/* Fullscreen Background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000"
        style={{ backgroundImage: "url('/bg-image.png')" }}
      ></div>

      {/* Overlay */}
      <div
        className="absolute inset-0 transition-colors duration-500"
        style={{ background: "var(--intro-overlay)" }}
      ></div>

      {/* Floating Circles */}
      <div className="absolute w-60 h-60 bg-yellow-400 rounded-full opacity-15 animate-float1 top-12 left-12"></div>
      <div className="absolute w-44 h-44 bg-yellow-300 rounded-full opacity-10 animate-float2 bottom-16 right-16"></div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl animate-fadeIn">
        <h1 className="h1 mb-5 font-[Poppins] drop-shadow-lg text-4xl md:text-5xl lg:text-6xl">
          Organize Your Home Effortlessly
        </h1>
        <p className="p mb-8 font-[Inter] drop-shadow-md text-base md:text-lg lg:text-xl leading-relaxed">
          Track your groceries, kitchen essentials, and household items in one smart, beautifully designed, theme-adaptive app.
        </p>
        <a href="/login" className="btn-theme px-8 py-3 text-base md:text-lg">
          Get Started
        </a>
      </div>

      {/* Floating animation keyframes */}
      <style jsx>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(15px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float1 { animation: float1 6s ease-in-out infinite; }
        .animate-float2 { animation: float2 8s ease-in-out infinite; }
      `}</style>
    </section>
  );
};
