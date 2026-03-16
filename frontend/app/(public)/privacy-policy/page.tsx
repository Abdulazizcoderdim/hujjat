import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ReactNode } from "react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="bg-background ">
        <section className="max-w-5xl mx-auto px-4 py-10 space-y-10">
          {/* HEADER */}
          <header className="space-y-4 border-b pb-6">
            <h1 className="text-3xl font-bold tracking-tight">
              DOCLAB.UZ MAXFIYLIK SIYOSATI
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ushbu hujjat Doclab.uz platformasida foydalanuvchilarning shaxsiy
              ma'lumotlarini himoya qilish va xavfsizligini ta'minlash maqsadida
              ishlab chiqilgan.
            </p>
          </header>

          {/* CONTENT */}
          <div className="space-y-8 text-sm leading-relaxed">
            <Section title="1. Kirish">
              <p>
                1.1. Ushbu Maxfiylik siyosati (keyingi o'rinlarda — "Siyosat")
                Doclab.uz raqamli mahsulotlar bozori platformasida (keyingi
                o'rinlarda — "Platforma") qabul qilingan bo'lib,
                foydalanuvchilarning shaxsiy ma'lumotlarini himoya qilish va
                xavfsizligini ta'minlash maqsadida ishlab chiqilgan.
              </p>
              <p>
                1.2. Mazkur Siyosat Foydalanuvchi bilan kelishuv va Sotuvchilar
                bilan shartnomaning ajralmas qismi hisoblanadi. Platformadan
                foydalanish orqali siz ushbu Siyosat shartlariga rozilik
                bildirgan hisoblanasiz.
              </p>
            </Section>

            <Section title="2. Atama va ta'riflar">
              <p>
                <b>Platforma</b> — Doclab.uz veb-sayti va unga tegishli
                xizmatlar, raqamli mahsulotlar (biznes rejalar, ma'lumotlar,
                qo'llanmalar, referatlar, prezentatsiyalar va boshqalar)ni
                sotish va sotib olish imkonini beruvchi bozor.
              </p>
              <p>
                <b>Shaxsiy ma'lumotlar</b> — muayyan jismoniy shaxsga taalluqli
                bo'lgan yoki uni identifikatsiya qilish imkonini beradigan
                axborot.
              </p>
              <p>
                <b>Sotuvchi</b> — Platformada o'z raqamli mahsulotlarini sotish
                uchun ro'yxatdan o'tgan shaxs.
              </p>
              <p>
                <b>Foydalanuvchi (Xaridor)</b> — Platformada ro'yxatdan o'tgan
                va mahsulot xarid qiluvchi shaxs.
              </p>
              <p>
                <b>Shaxsiy ma'lumotlarni qayta ishlash</b> — shaxsiy
                ma'lumotlarni yig'ish, saqlash, tizimlashtirish, o'zgartirish,
                foydalanish, uzatish va yo'q qilishni o'z ichiga olgan har
                qanday operatsiya.
              </p>
            </Section>

            <Section title="3. Qo'llash sohasi">
              <p>
                3.1. Ushbu Siyosat Platforma bilan o'zaro munosabatlar
                jarayonida Foydalanuvchi va/yoki Sotuvchidan olinishi mumkin
                bo'lgan barcha shaxsiy ma'lumotlarga nisbatan amal qiladi.
              </p>
              <p>
                3.2. Platformadan foydalanish va shaxsiy ma'lumotlarini taqdim
                etish orqali Foydalanuvchi va/yoki Sotuvchi ushbu Siyosatga
                muvofiq shaxsiy ma'lumotlarni qayta ishlashga rozilik beradi.
              </p>
            </Section>

            <Section title="4. Yig'iladigan ma'lumotlar">
              <p className="font-medium">
                4.1. Foydalanuvchi (Xaridor) ma'lumotlari:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Ism va familiya</li>
                <li>Telefon raqami</li>
                <li>Elektron pochta manzili (E-mail)</li>
                <li>Telegram ID</li>
                <li>Xarid qilingan mahsulotlar tarixi</li>
              </ul>

              <p className="font-medium mt-4">4.2. Sotuvchi ma'lumotlari:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Ism va familiya</li>
                <li>Telefon raqami</li>
                <li>Elektron pochta manzili (E-mail)</li>
                <li>Telegram ID</li>
                <li>Sotilgan mahsulotlar va daromadlar tarixi</li>
              </ul>

              <p className="font-medium mt-4">
                4.3. Avtomatik yig'iladigan ma'lumotlar:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>IP-manzil</li>
                <li>Platformaga kirish vaqti va muddati</li>
              </ul>
            </Section>

            <Section title="5. Cookie fayllari">
              <p>
                5.1. Platforma foydalanuvchi tajribasini yaxshilash va statistik
                ma'lumotlarni to'plash maqsadida Cookie fayllardan foydalanadi.
              </p>
              <p>
                5.2. Cookie fayllari orqali quyidagi ma'lumotlar yig'ilishi
                mumkin:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Sahifa ko'rishlar va bosishlar statistikasi</li>
                <li>Brauzer identifikatori</li>
                <li>Qurilma haqida ma'lumot</li>
                <li>Tanlangan mahsulotlar va xizmatlar</li>
              </ul>
              <p>
                5.3. Foydalanuvchi brauzer sozlamalari orqali Cookie fayllarni
                boshqarishi mumkin. Cookie'larni o'chirish ayrim funksiyalarning
                ishlamasligiga olib kelishi mumkin.
              </p>
            </Section>

            <Section title="6. Ma'lumotlarni qayta ishlash maqsadlari">
              <p>
                Platforma shaxsiy ma'lumotlarni quyidagi maqsadlarda qayta
                ishlaydi:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Platformaga kirish va shaxsiy kabinetdan foydalanish</li>
                <li>Buyurtmalarni qayta ishlash</li>
                <li>To'lovlarni amalga oshirish</li>
                <li>Sotuvchilarni identifikatsiyalash</li>
                <li>Daromadlarni yechib olish</li>
                <li>Aloqa o'rnatish</li>
                <li>Xavfsizlikni ta'minlash</li>
                <li>Firibgarlikning oldini olish</li>
                <li>Xizmatlarni takomillashtirish</li>
                <li>Qonunchilik talablarini bajarish</li>
              </ul>
            </Section>

            <Section title="7. Ma'lumotlarni saqlash muddati">
              <p>
                7.1. Shaxsiy ma'lumotlar qayta ishlash maqsadlariga erishilgunga
                qadar saqlanadi.
              </p>
              <p>
                7.2. Rozilikni qaytarib olish uchun doclab.uz@gmail.com
                manziliga yozma murojaat yuboriladi.
              </p>
            </Section>

            <Section title="8. Ma'lumotlarni himoya qilish">
              <p>Platforma quyidagi himoya choralarini qo'llaydi:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Axborot tizimlariga kirishni cheklash</li>
                <li>Zararli dasturlardan himoya</li>
                <li>Shifrlash</li>
                <li>Tarmoqlararo ekranlash</li>
                <li>Xavfsizlik monitoringi</li>
              </ul>
            </Section>

            <Section title="9. Uchinchi shaxslarga uzatish">
              <p>Shaxsiy ma'lumotlar quyidagi hollarda uzatilishi mumkin:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Foydalanuvchi roziligi bilan</li>
                <li>To'lov tizimlariga (Click, Payme va boshqalar)</li>
                <li>Davlat organlariga</li>
                <li>Hamkor tashkilotlarga</li>
              </ul>
            </Section>

            <Section title="10. Foydalanuvchi va Sotuvchi huquqlari">
              <p>
                Shaxsiy ma'lumotlarni ko'rish, o'zgartirish, o'chirishni
                so'rash, ishlov berish haqida ma'lumot olish va rozilikni bekor
                qilish huquqlari mavjud.
              </p>
            </Section>

            <Section title="11. Siyosatga o'zgartirishlar">
              <p>
                O'zgartirishlar saytga joylashtirilgan vaqtdan boshlab kuchga
                kiradi.
              </p>
            </Section>

            <Section title="12. Aloqa">
              <ul className="list-disc pl-5 space-y-1">
                <li>Email: doclab.uz@gmail.com</li>
                <li>Telegram: @doclabuz</li>
                <li>Veb-sayt: https://doclab.uz</li>
                <li>Telefon: +998 (97) 706 11 24</li>
              </ul>
            </Section>

            <Section title="13. Yakuniy qoidalar">
              <p>
                Nizolar muzokara orqali, kelishuv bo'lmasa O'zbekiston
                Respublikasi sudlari orqali hal etiladi.
              </p>
            </Section>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="space-y-3">
    <h3 className="text-base font-semibold">{title}</h3>
    {children}
  </section>
);

export default PrivacyPolicy;
