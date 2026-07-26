import { Instagram, MapPin, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function Footer() {
  return (
    <footer
      dir="rtl"
      className="relative overflow-hidden bg-[#10292D] px-6 py-10 text-white"
    >
      {/* الخلفية المتحركة */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(40)].map((_, index) => (
          <motion.span
            key={index}
            animate={{
              opacity: [0.15, 0.6, 0.15],
              y: [0, -110, 0],
              x: [0, index % 2 === 0 ? 25 : -25, 0],
            }}
            transition={{
              duration: 12 + (index % 4),
              repeat: Infinity,
              repeatType: 'mirror',
              delay: (index % 8) * 0.12,
              ease: 'easeInOut',
            }}
            className="absolute h-1.5 w-1.5 rounded-full bg-[#16B8BE]"
            style={{
              left: `${(index * 19) % 100}%`,
              top: `${(index * 27) % 100}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px]">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* بيانات المتجر */}
          <div className="text-center md:text-right">
            <h2 className="text-2xl font-bold tracking-wider text-white">
              3D TECH
            </h2>

            <p className="mt-4 text-white/70">
              Beyond Dimensions
            </p>

            <div className="mt-4 flex items-center justify-center gap-3 md:justify-start">
              {/* واتساب */}
              <a
                href="https://wa.me/96871979631"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
              >
                <MessageCircle className="h-6 w-6 text-white" />
              </a>

              {/* إنستغرام */}
              <a
                href="https://instagram.com/3dtech.om"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
              >
                <Instagram className="h-6 w-6 text-white" />
              </a>
            </div>
          </div>

          {/* اتصل بنا */}
          <div className="text-center md:mr-auto md:text-left">
            <h3 className="text-lg font-bold text-white">
              اتصل بنا
            </h3>

            <div className="mt-3 space-y-4">
              {/* الرقم */}
              <a
                href="https://wa.me/96871979631"
                target="_blank"
                rel="noopener noreferrer"
                dir="ltr"
                className="flex items-center justify-center gap-3 text-white/80 transition hover:text-white md:justify-start"
              >
                <MessageCircle className="h-5 w-5" />

                <span className="whitespace-nowrap">
                  +968 7197 9631
                </span>
              </a>

              {/* الموقع */}
              <div className="flex items-center justify-center gap-3 text-white/80 md:justify-start">
                <MapPin className="h-5 w-5" />

                <span>
                  مسقط، المعبيلة
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-5 text-center text-sm text-white/60">
          © 2026 3D TECH. جميع الحقوق محفوظة
        </div>
      </div>
    </footer>
  );
}
