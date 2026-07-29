import { Wrench, ArrowLeft } from 'lucide-react';

interface WorkshopProps {
  onNavigate: (page: string) => void;
}

export default function Workshop({ onNavigate }: WorkshopProps) {
  return (
    <section className="min-h-[75vh] bg-[#F8F7F2] px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[32px] border border-[#E5E1D8] bg-white px-6 py-14 text-center shadow-sm md:px-12">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#0F3A2B] text-white">
            <Wrench className="h-9 w-9" />
          </div>

          <p className="mb-3 text-sm font-bold text-[#789087]">
            ورشة مرقاب
          </p>

          <h1 className="mb-5 text-4xl font-black text-[#0F3A2B] md:text-6xl">
            صيانة وإصلاح الدرونات
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-base leading-8 text-[#6E7F76] md:text-lg">
            نقدم خدمات فحص وصيانة وإصلاح الدرونات وملحقاتها بأيدي
            مختصين، مع تشخيص واضح للحالة قبل بدء عملية الإصلاح.
          </p>

          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 rounded-full bg-[#0F3A2B] px-7 py-3.5 font-bold text-white transition hover:scale-105"
          >
            العودة للرئيسية
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
