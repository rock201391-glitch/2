import {
  CalendarDays,
  ChevronLeft,
  Gavel,
  ShoppingBag,
  Wrench,
} from 'lucide-react';

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

          {/* النص والقوائم */}
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

            <div className="mx-auto grid max-w-xl grid-cols-1 gap-3 lg:mr-0">
              {/* المتجر */}
              <button
                type="button"
                onClick={() => onNavigate('shop')}
                className="group flex w-full items-center justify-between rounded-[24px] border border-[#D8CFB8] bg-white px-5 py-4 text-right shadow-[0_10px_30px_rgba(15,58,43,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[#0F3A2B]/40 hover:shadow-[0_18px_40px_rgba(15,58,43,0.14)] active:scale-[0.99]"
              >
                <span className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F3A2B] text-white">
                    <ShoppingBag className="h-5 w-5" />
                  </span>

                  <span>
                    <span className="block text-base font-black text-[#0F3A2B]">
                      تصفح المتجر
                    </span>

                    <span className="mt-1 block text-sm text-gray-500">
                      شاهد الدرونات والكاميرات والإكسسوارات
                    </span>
                  </span>
                </span>

                <ChevronLeft className="h-5 w-5 text-[#0F3A2B] transition-transform group-hover:-translate-x-1" />
              </button>

              {/* المزادات */}
              <button
                type="button"
                onClick={() => onNavigate('auctions')}
                className="group flex w-full items-center justify-between rounded-[24px] border border-[#D8CFB8] bg-white px-5 py-4 text-right shadow-[0_10px_30px_rgba(15,58,43,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[#0F3A2B]/40 hover:shadow-[0_18px_40px_rgba(15,58,43,0.14)] active:scale-[0.99]"
              >
                <span className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F0E8CC] text-[#0F3A2B]">
                    <Gavel className="h-5 w-5" />
                  </span>

                  <span>
                    <span className="block text-base font-black text-[#0F3A2B]">
                      الدخول إلى المزادات
                    </span>

                    <span className="mt-1 block text-sm text-gray-500">
                      شارك في المزادات والمنتجات المميزة
                    </span>
                  </span>
                </span>

                <ChevronLeft className="h-5 w-5 text-[#0F3A2B] transition-transform group-hover:-translate-x-1" />
              </button>

              {/* التأجير */}
              <button
                type="button"
                onClick={() => onNavigate('rentals')}
                className="group flex w-full items-center justify-between rounded-[24px] border border-[#D8CFB8] bg-white px-5 py-4 text-right shadow-[0_10px_30px_rgba(15,58,43,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[#0F3A2B]/40 hover:shadow-[0_18px_40px_rgba(15,58,43,0.14)] active:scale-[0.99]"
              >
                <span className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6EFEA] text-[#0F3A2B]">
                    <CalendarDays className="h-5 w-5" />
                  </span>

                  <span>
                    <span className="block text-base font-black text-[#0F3A2B]">
                      تأجير الدرونات
                    </span>

                    <span className="mt-1 block text-sm text-gray-500">
                      اختر الدرون وحدد مدة الإيجار
                    </span>
                  </span>
                </span>

                <ChevronLeft className="h-5 w-5 text-[#0F3A2B] transition-transform group-hover:-translate-x-1" />
              </button>

              {/* الورشة */}
              <button
                type="button"
                onClick={() => onNavigate('workshop')}
                className="group flex w-full items-center justify-between rounded-[24px] border border-[#D8CFB8] bg-white px-5 py-4 text-right shadow-[0_10px_30px_rgba(15,58,43,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[#0F3A2B]/40 hover:shadow-[0_18px_40px_rgba(15,58,43,0.14)] active:scale-[0.99]"
              >
                <span className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F3A2B] text-white">
                    <Wrench className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                  </span>

                  <span>
                    <span className="block text-base font-black text-[#0F3A2B]">
                      الدخول إلى الورشة
                    </span>

                    <span className="mt-1 block text-sm text-gray-500">
                      صيانة وإصلاح الدرونات والملحقات
                    </span>
                  </span>
                </span>

                <ChevronLeft className="h-5 w-5 text-[#0F3A2B] transition-transform group-hover:-translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
