import { ChevronLeft, Wrench } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-screen bg-[#F8F7F2]">
      <section
        className="w-full overflow-hidden px-4 py-16 md:py-24"
        style={{
          background: 'linear-gradient(to bottom, #F8F7F2, #F1F0E8)',
        }}
      >
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* الفيديو */}
          <div className="order-1 flex justify-center">
            <div
              className="relative h-[380px] w-full max-w-2xl overflow-hidden rounded-[42px] border sm:h-[480px]"
              style={{
                background:
                  'linear-gradient(135deg,#FFFDF7 0%,#F8F5EA 50%,#EDE7D8 100%)',
                borderColor: '#D8CFB8',
                boxShadow: '0 30px 80px rgba(15,58,43,0.18)',
              }}
            >
              <video
                src="/omani-drone.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full rounded-[42px] object-cover"
              />
            </div>
          </div>

          {/* النص والأزرار */}
          <div className="order-2 text-center lg:text-right">
            <h1
              className="mb-6 text-4xl font-bold leading-tight md:text-6xl"
              style={{ color: '#0F3A2B' }}
            >
              نظرتكم من فوق
            </h1>

            <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-gray-600 md:text-xl lg:mr-0">
              نوفر أحدث منتجات DJI والدرونات الاحترافية في سلطنة عمان
              بجودة عالية وأسعار منافسة
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              {/* المتجر */}
              <button
                type="button"
                onClick={() => onNavigate('shop')}
                className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95"
                style={{ backgroundColor: '#0F3A2B' }}
              >
                <span>تصفح المتجر</span>

                <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              </button>

              {/* المزاد */}
              <button
                type="button"
                onClick={() => onNavigate('auctions')}
                className="group inline-flex items-center gap-2 rounded-full border-2 px-7 py-3.5 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
                style={{
                  borderColor: '#0F3A2B',
                  color: '#0F3A2B',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <span>الدخول إلى المزاد</span>

                <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              </button>

              {/* الورشة */}
              <button
                type="button"
                onClick={() => onNavigate('workshop')}
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full px-8 py-4 font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-[0_14px_30px_rgba(15,58,43,0.28)] active:translate-y-0 active:scale-95"
                style={{
                  background:
                    'linear-gradient(135deg, #173F31 0%, #0F3A2B 55%, #08271D 100%)',
                  border: '1px solid rgba(216,201,155,0.65)',
                }}
              >
                <span className="absolute inset-0 translate-x-full bg-gradient-to-l from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:-translate-x-full" />

                <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#D8C99B]/15 ring-1 ring-[#D8C99B]/35">
                  <Wrench className="h-4 w-4 text-[#E5D8AA] transition-transform duration-300 group-hover:rotate-12" />
                </span>

                <span className="relative z-10">
                  الدخول إلى الورشة
                </span>

                <ChevronLeft className="relative z-10 h-5 w-5 text-[#E5D8AA] transition-transform duration-300 group-hover:-translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
