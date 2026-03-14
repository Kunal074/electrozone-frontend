"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getBanners } from "@/lib/queries";

const defaultSlides = [
  {
    tag:      "⚡ Today's Deal",
    title:    "Best Smartphones\nBest Prices",
    subtitle: "Limited stock • Same day delivery",
    btnText:  "Shop Now",
    link:     "/products?category=SMARTPHONE",
    image:    null,
    bgFrom:   "#1e3a8a",
    bgTo:     "#1d4ed8",
  },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [fadeIn,  setFadeIn]  = useState(true);

  const { data } = useQuery({
    queryKey: ["banners"],
    queryFn:  getBanners,
  });

  const slides = data?.data?.length > 0 ? data.data : defaultSlides;

  useEffect(() => {
    const timer = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
        setFadeIn(true);
      }, 300);
    }, 3500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleDotClick = (i) => {
    setFadeIn(false);
    setTimeout(() => {
      setCurrent(i);
      setFadeIn(true);
    }, 300);
  };

  const slide = slides[current] || defaultSlides[0];

  return (
    <div
      style={{
        background: `linear-gradient(to right, ${slide.bgFrom}, ${slide.bgTo})`,
        transition: "background 0.7s ease",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div
          className="flex items-center justify-between"
          style={{
            opacity:    fadeIn ? 1 : 0,
            transform:  fadeIn ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.3s ease, transform 0.3s ease",
          }}
        >
          <div className="flex-1">
            <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              {slide.tag}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold mt-4 mb-3 whitespace-pre-line leading-tight text-white">
              {slide.title}
            </h1>
            <p className="mb-6 text-white opacity-80">{slide.subtitle}</p>
            <Link
              href={slide.link}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-lg inline-block transition"
            >
              {slide.btnText} →
            </Link>
          </div>

          {/* Image */}
          <div className="hidden md:block w-64 h-64 flex-shrink-0">
            {slide.image ? (
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            ) : (
              <div className="text-9xl opacity-20 flex items-center justify-center h-full">
                📱
              </div>
            )}
          </div>
        </div>

        {/* Dots */}
        {slides.length > 1 && (
          <div className="flex gap-2 mt-8">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => handleDotClick(i)}
                style={{
                  width:           i === current ? 32 : 8,
                  height:          8,
                  borderRadius:    4,
                  backgroundColor: i === current ? "#EA580C" : "rgba(255,255,255,0.4)",
                  transition:      "all 0.3s ease",
                  border:          "none",
                  cursor:          "pointer",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}