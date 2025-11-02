import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Banner as BannerType } from '../services/api';

interface BannerProps {
  banners: BannerType[];
}

export function Banner({ banners }: BannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((current) => (current + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((current) => (current - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((current) => (current + 1) % banners.length);
  };

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full h-[250px] sm:h-[350px] lg:h-[500px] overflow-hidden group">
      <div
        className="flex transition-transform duration-500 ease-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="min-w-full h-full relative">
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
              <div className="p-4 sm:p-6 lg:p-12 text-white max-w-2xl w-full">
                <h2 className="text-xl sm:text-2xl lg:text-5xl font-bold mb-1.5 sm:mb-2 lg:mb-4 line-clamp-2">
                  {banner.title}
                </h2>
                <p className="text-sm sm:text-base lg:text-xl mb-3 sm:mb-4 lg:mb-6 line-clamp-2">
                  {banner.subtitle}
                </p>
                <a
                  href={banner.link}
                  className="inline-block bg-white text-gray-900 px-4 sm:px-6 lg:px-8 py-1.5 sm:py-2 lg:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-100 transition"
                >
                  Comprar Agora
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={goToPrevious}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 sm:p-2 rounded-full opacity-50 sm:opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1.5 sm:p-2 rounded-full opacity-50 sm:opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
      </button>

      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 lg:w-3 lg:h-3 rounded-full transition ${
              index === currentIndex ? 'bg-white w-4 sm:w-6 lg:w-8' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
