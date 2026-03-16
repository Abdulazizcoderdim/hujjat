import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ReactNode } from "react";

const Oferta = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="bg-background">
        <section className="max-w-5xl mx-auto px-4 py-10 space-y-10">
          {/* HEADER */}
          <header className="space-y-3 border-b pb-6">
            <h1 className="text-3xl font-bold tracking-tight">
              DOCLAB.UZ — OMMAVIY OFERTA
            </h1>
            <h2 className="text-lg font-semibold text-muted-foreground">
              DOCLAB.UZ PLATFORMASIDAN FOYDALANISH QONUN-QOIDALARI
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Ushbu foydalanish shartnomasi Doclab.uz internet platformasidan
              foydalanish, ro'yxatdan o'tish, raqamli mahsulotlarni sotish va
              xarid qilish bilan bog'liq munosabatlarni tartibga soladi.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Doclab.uz platformasiga kirish, unda ro'yxatdan o'tish, mahsulot
              joylashtirish yoki xarid qilish orqali foydalanuvchi va sotuvchi
              mazkur qonun-qoidalar bilan to'liq tanishganligini va ularga
              so'zsiz rozilik bildirganligini tasdiqlaydi.
            </p>
          </header>

          {/* CONTENT */}
          <div className="space-y-8 text-sm leading-relaxed">
            <Section title="1. Asosiy tushunchalar">
              <p>
                <b>Platforma</b> — Doclab.uz veb-sayti va unga tegishli
                xizmatlar, raqamli mahsulotlar (biznes rejalar, ma'lumotlar,
                qo'llanmalar, referatlar, prezentatsiyalar va boshqalar)ni
                sotish va sotib olish imkonini beruvchi bozor.
              </p>
              <p>
                <b>Shaxsiy kabinet</b> — Foydalanuvchi yoki Sotuvchi tomonidan
                Platformada yaratiladigan, xizmatlardan foydalanish uchun
                mo'ljallangan maxsus sahifa.
              </p>
              <p>
                <b>Raqamli mahsulot</b> — Platformada sotilayotgan elektron
                formatdagi materiallar va kontentlar, jumladan: ilmiy ishlar
                (biznes rejalar, kurs ishlari, diplom ishlari, referatlar,
                tadqiqotlar, taqdimotlar) va boshqa raqamli kontentlar. Raqamli
                mahsulotlar elektron fayl sifatida yuklab olinadi va
                foydalanuvchi tomonidan shaxsiy yoki tijorat maqsadlarida
                ishlatilishi mumkin.
              </p>
              <p>
                <b>Sotuvchi</b> — Platformada o'z raqamli mahsulotlarini sotish
                uchun ro'yxatdan o'tgan shaxs.
              </p>
              <p>
                <b>Buyurtma</b> — Foydalanuvchi tomonidan Platformada raqamli
                mahsulotni sotib olish uchun rasmiylashtirilgan so'rov.
              </p>
            </Section>

            <Section title="2. Umumiy qoidalar">
              <p>
                2.1. Doclab.uz (keyingi o'rinlarda — Platforma) elektron
                hujjatlar, raqamli fayllar, o'quv va axborot materiallarini
                joylashtirish, sotish va xarid qilish imkonini beruvchi onlayn
                vositachi platforma hisoblanadi.
              </p>
              <p>
                2.2. Platforma o'z nomidan hech qanday hujjat yoki mahsulot
                yaratmaydi, tayyorlamaydi va sotmaydi. Platformadagi barcha
                mahsulotlar uchinchi shaxslar — Sotuvchilar tomonidan
                joylashtiriladi.
              </p>
              <p>
                2.3. Platformada joylashtirilgan barcha hujjatlar, materiallar
                va fayllar shartli ravishda "mahsulot" deb yuritiladi hamda ular
                faqat ma'lumot olish va foydalanish uchun mo'ljallangan.
              </p>
              <p>
                2.4. Platformadan foydalanish O'zbekiston Respublikasining
                amaldagi qonunchiligiga muvofiq amalga oshiriladi.
              </p>
            </Section>

            <Section title="3. Foydalanuvchi va Sotuvchi tushunchalari">
              <p>
                3.1. Mehmon — Platformada ro'yxatdan o'tmasdan ochiq sahifalarni
                ko'ruvchi shaxs.
              </p>
              <p>
                3.2. Foydalanuvchi (Xaridor) — Platformada ro'yxatdan o'tgan va
                mahsulot xarid qiluvchi shaxs.
              </p>
              <p>
                3.3. Sotuvchi — Platformada ro'yxatdan o'tib, o'z mahsulotlarini
                joylashtiruvchi va sotuvchi shaxs.
              </p>
            </Section>

            <Section title="4. Foydalanuvchi sifatida ro'yxatdan o'tish">
              <p>
                4.1. Platformada mahsulot xarid qilish uchun foydalanuvchi
                ro'yxatdan o'tishi shart.
              </p>
              <p>
                4.2. Ro'yxatdan o'tish jarayonida kiritilgan barcha ma'lumotlar
                to'g'ri, to'liq va amalda mavjud bo'lishi lozim.
              </p>
              <p>
                4.3. Foydalanuvchi o'z akkaunti orqali amalga oshirilgan barcha
                harakatlar uchun shaxsan javobgar hisoblanadi.
              </p>
            </Section>

            <Section title="5. Sotuvchi sifatida ro'yxatdan o'tish">
              <p>
                5.1. Platformada mahsulot sotish uchun shaxs Sotuvchi sifatida
                ro'yxatdan o'tishi lozim.
              </p>
              <p>
                5.2. Sotuvchi ro'yxatdan o'tishda va faoliyat davomida faqat
                o'ziga tegishli yoki muallifning ruxsati bilan olingan
                mahsulotlarni joylashtirishi shart.
              </p>
              <p>
                5.3. Sotuvchi joylashtirilgan mahsulotlarning sifati,
                qonuniyligi va mualliflik huquqlariga to'liq javobgar
                hisoblanadi.
              </p>
            </Section>

            <Section title="6. Foydalanuvchilarning huquq va majburiyatlari">
              <p>
                <b>6.1. Foydalanuvchi quyidagi huquqlarga ega:</b>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Platformada erkin ro'yxatdan o'tish;</li>
                <li>Platforma xizmatlaridan foydalanish;</li>
                <li>
                  Xarid qilingan mahsulotlardan shaxsiy maqsadlarda foydalanish;
                </li>
                <li>
                  Xaridlar bo'yicha xabarnomalarni shaxsiy kabinet orqali olish;
                </li>
                <li>Platforma ma'muriyatiga murojaat qilish.</li>
              </ul>
              <p>
                <b>
                  6.2. Foydalanuvchi quyidagi majburiyatlarni bajarishi shart:
                </b>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Ro'yxatdan o'tishda to'g'ri ma'lumot kiritish;</li>
                <li>
                  Qonunchilikka zid, haqoratli yoki taqiqlangan kontent
                  tarqatmaslik;
                </li>
                <li>Platforma qoidalariga rioya qilish.</li>
              </ul>
            </Section>

            <Section title="7. Sotuvchilarning huquq va majburiyatlari">
              <p>
                7.1. Sotuvchi Platformada mahsulot joylashtirish, narx belgilash
                va sotuvlarni kuzatish huquqiga ega.
              </p>
              <p>
                7.2. Sotuvchi sotilgan mahsulotlar bo'yicha daromadni
                belgilangan tartibda olish huquqiga ega.
              </p>
              <p>
                7.3. Sotuvchi joylashtirilgan mahsulotlar bo'yicha kelib
                chiqadigan barcha da'vo va nizolar uchun shaxsan javobgar
                hisoblanadi.
              </p>
            </Section>

            <Section title="8. To'lovlar va komissiya">
              <p>8.1. Mahsulot narxi Sotuvchi tomonidan belgilanadi.</p>
              <p>
                8.2. Xaridor mahsulot narxidan tashqari Platforma xizmat haqi
                sifatida 10% miqdorida qo'shimcha to'lov amalga oshiradi.
              </p>
              <p>
                8.3. Platforma har bir sotilgan mahsulotdan 20% miqdorida
                komissiya ushlab qoladi.
              </p>
              <p>
                8.4. Komissiya va xizmat haqi Platformaning texnik ishlashi,
                xavfsizlik va xizmat ko'rsatish xarajatlari uchun undiriladi.
              </p>
            </Section>

            <Section title="9. Xarid va yetkazib berish">
              <p>
                9.1. Xarid qilingan mahsulot foydalanuvchining shaxsiy
                kabinetiga joylashtiriladi.
              </p>
              <p>
                9.2. Mahsulot yuklab olingan yoki olinmaganidan qat'i nazar,
                yetkazib berilgan hisoblanadi.
              </p>
            </Section>

            <Section title="10. Pul mablag'larini qaytarish (Refund Policy)">
              <p>
                10.1. Raqamli mahsulotlar bo'yicha refund faqat mahsulot
                yaroqsiz bo'lsa yoki tavsifga mutlaqo mos kelmasa ko'rib
                chiqiladi.
              </p>
              <p>10.2. Platformaning 10% xizmat haqi qaytarilmaydi.</p>
              <p>
                10.3. Refund bo'yicha yakuniy qaror Platforma ma'muriyati
                tomonidan qabul qilinadi.
              </p>
            </Section>

            <Section title="11. Mualliflik huquqi va javobgarlik">
              <p>
                11.1. Mahsulotlarning mualliflik huquqi Sotuvchiga tegishli
                bo'ladi.
              </p>
              <p>
                11.2. Plagiat yoki qonunbuzarlik aniqlansa, mahsulot o'chiriladi
                va Sotuvchi akkaunti cheklanishi mumkin.
              </p>
            </Section>

            <Section title="12. Javobgarlikni cheklash">
              <p>
                12.1. Platforma sotuvchilar tomonidan joylashtirilgan
                mahsulotlarning sifati va mazmuni uchun to'g'ridan-to'g'ri
                javobgar emas.
              </p>
              <p>
                12.2. Platforma foydalanuvchi va sotuvchi o'rtasidagi
                kelishmovchiliklarga to'g'ridan-to'g'ri javobgar emas, lekin
                shikoyatlarni ko'rib chiqish huquqiga ega.
              </p>
              <p>
                12.3. Platforma texnik nosozliklar va fors-major holatlari
                natijasida yuzaga kelgan zararlar uchun javobgar bo'lmaydi.
              </p>
              <p>
                12.4. Platforma noto'g'ri ma'lumotlar kiritilishi natijasida
                yuzaga kelgan muammolar uchun javobgar emas.
              </p>
            </Section>

            <Section title="13. Akkauntni cheklash va bloklash">
              <p>
                13.1. Qoidabuzarlik, firibgarlik yoki mualliflik huquqi buzilgan
                holatlarda Platforma akkauntni vaqtincha yoki doimiy bloklash
                huquqiga ega.
              </p>
              <p>
                13.2. Yakuniy qaror Platformaning asosiy administratori
                tomonidan qabul qilinadi.
              </p>
            </Section>

            <Section title="14. Shartnomani buzish">
              <p>
                <b>
                  14.1. Ushbu Shartnoma buzilgan taqdirda, Platforma quyidagi
                  choralarni qo'llashi mumkin:
                </b>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Ogohlantirish berish;</li>
                <li>Shaxsiy kabinetga kirishni vaqtincha cheklash;</li>
                <li>Akkauntni doimiy bloklash.</li>
              </ul>
              <p>
                <b>14.2. Bloklash sabablari:</b>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Firibgarlik;</li>
                <li>Mualliflik huquqlarini buzish;</li>
                <li>Boshqa foydalanuvchilarning huquqlarini buzish;</li>
                <li>Qoidalarni takroran buzish.</li>
              </ul>
            </Section>

            <Section title="15. Nizolarni hal qilish">
              <p>
                <b>15.1. Murojaatlar:</b>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Email: doclab.uz@gmail.com</li>
                <li>Telegram: @doclabuz</li>
                <li>Veb-sayt: https://doclab.uz</li>
                <li>Telefon: +998 (97) 706 11 24</li>
              </ul>
              <p>15.2. Nizolar muzokara yo'li bilan hal qilinadi.</p>
              <p>
                15.3. Kelishuv bo'lmasa, O'zbekiston Respublikasi sudlari orqali
                ko'rib chiqiladi.
              </p>
            </Section>

            <Section title="16. Shaxsiy ma'lumotlar">
              <p>
                16.1. Foydalanuvchi va Sotuvchilarning shaxsiy ma'lumotlari
                maxfiy saqlanadi.
              </p>
              <p>
                16.2. Ma'lumotlar faqat qonunchilikda belgilangan hollarda
                uchinchi shaxslarga beriladi.
              </p>
            </Section>

            <Section title="17. Qoidalarni yangilash">
              <p>
                17.1. Platforma ushbu qonun-qoidalarni istalgan vaqtda yangilash
                huquqiga ega.
              </p>
              <p>
                17.2. Yangilanishlar Platformada yoki rasmiy Telegram kanalida
                (t.me/doclabuz) e'lon qilinadi.
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

export default Oferta;
