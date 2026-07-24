"use client";

import { MapPin } from "lucide-react";
import { siteConfig } from "@/config/site";

/**
 * Stylized aerial sketch of the actual street layout (Braće Jerkovića bending
 * north of the property, side street, surrounding rooftops) — hand-drawn to
 * match the real satellite view, not a reproduction of Google's map tiles.
 */
export function LocationAerial({ caption }: { caption: string }) {
  return (
    <a
      href={siteConfig.location.googleMapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-2xl border border-ink/10 shadow-soft transition-transform duration-300 hover:scale-[1.01]"
    >
      <svg viewBox="0 0 340 300" className="block w-full" role="img" aria-labelledby="aerial-title">
        <title id="aerial-title">{caption}</title>
        <rect width={340} height={300} fill="#4B5A44" />

        {/* soft canopy texture */}
        <g opacity={0.5}>
          <ellipse cx={60} cy={60} rx={70} ry={40} fill="#5C6B52" />
          <ellipse cx={280} cy={90} rx={80} ry={45} fill="#414F3B" />
          <ellipse cx={40} cy={230} rx={60} ry={50} fill="#5C6B52" />
          <ellipse cx={300} cy={250} rx={70} ry={50} fill="#414F3B" />
        </g>

        {/* open field, upper area */}
        <path d="M40,0 C120,-10 220,10 300,0 L320,70 C230,90 120,85 40,60 Z" fill="#9C8D6E" opacity={0.55} />

        {/* main road: Braće Jerkovića, curving past the property */}
        <path
          d="M 320,10 C 270,50 210,70 178,110 C 165,128 190,150 205,190 C 216,255 210,330 214,300"
          fill="none"
          stroke="#DDD7C8"
          strokeWidth={13}
          strokeLinecap="round"
        />
        <path
          d="M 320,10 C 270,50 210,70 178,110 C 165,128 190,150 205,190 C 216,255 210,330 214,300"
          fill="none"
          stroke="#F7F4EE"
          strokeWidth={1.5}
          strokeDasharray="6 8"
          opacity={0.6}
        />

        {/* side street toward the property */}
        <path
          d="M 178,110 C 145,98 105,92 55,86"
          fill="none"
          stroke="#DDD7C8"
          strokeWidth={9}
          strokeLinecap="round"
        />

        {/* surrounding rooftops */}
        {[
          { x: 8, y: 150, w: 34, h: 26, r: -8 },
          { x: 20, y: 195, w: 40, h: 30, r: 6 },
          { x: 70, y: 225, w: 36, h: 28, r: -4 },
          { x: 15, y: 250, w: 44, h: 32, r: 10 },
          { x: 120, y: 245, w: 38, h: 30, r: -6 },
          { x: 250, y: 190, w: 40, h: 30, r: 8 },
          { x: 270, y: 235, w: 46, h: 34, r: -5 },
          { x: 230, y: 260, w: 34, h: 26, r: 4 },
        ].map((b, i) => (
          <rect
            key={i}
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            rx={3}
            fill="#A9694B"
            opacity={0.85}
            transform={`rotate(${b.r} ${b.x + b.w / 2} ${b.y + b.h / 2})`}
          />
        ))}

        {/* the property — light/white roof */}
        <rect
          x={35}
          y={68}
          width={46}
          height={32}
          rx={3}
          fill="#F2EEE3"
          stroke="#1E1F1C"
          strokeOpacity={0.15}
          strokeWidth={1}
          transform="rotate(-6 58 84)"
        />

        {/* pin marker in front of the property */}
        <g transform="translate(46, 52)">
          <ellipse cx={0} cy={22} rx={7} ry={2.5} fill="#1E1F1C" opacity={0.2} />
          <path
            d="M0 -14C7.7 -14 14 -7.9 14 -0.4C14 8.8 3.6 19.6 0.7 22.6C0.3 23 -0.3 23 -0.7 22.6C-3.6 19.6-14 8.8-14 -0.4C-14 -7.9-7.7-14 0-14Z"
            fill="#A9784E"
          />
          <circle cx={0} cy={-0.4} r={5.5} fill="#F7F4EE" />
        </g>

        <text
          x={165}
          y={230}
          fontSize={11}
          fill="#F7F4EE"
          opacity={0.75}
          fontFamily="Arial, sans-serif"
          transform="rotate(72 165 230)"
        >
          Braće Jerkovića
        </text>
      </svg>

      <div className="flex items-center gap-2 bg-white/70 px-4 py-3">
        <MapPin size={15} className="shrink-0 text-wood" />
        <p className="text-xs text-ink/70 sm:text-sm">{caption}</p>
      </div>
    </a>
  );
}
