export type ProductPlan = {
  code: string;
  name: string;
  price: string;
  period: string;
  credits: number;
  userLimit: string;
  positioning: string;
  guardrails: string[];
};

export const productPlans: ProductPlan[] = [
  {
    code: "poc",
    name: "Proof of Concept",
    price: "Ücretsiz",
    period: "14 gün",
    credits: 15,
    userLimit: "1 kurumsal e-posta",
    positioning: "Güven kancası. Kredi kartı istemeden akademisyene kendi gerçek kağıdıyla 'aha' anını yaşatır.",
    guardrails: [
      "Sadece .edu.tr veya admin tarafından onaylanmış akademik alan adı.",
      "1 sınav, 1 referans kağıdı ve en fazla 15 öğrenci kağıdı.",
      "Referans kağıdı ve başarısız OCR retry işlemleri kredi yakmamalı.",
      "Deneme sonunda export kapatılabilir, ama sonuç ekranı açık kalmalı.",
    ],
  },
  {
    code: "individual",
    name: "Bireysel Akademisyen / Asistan",
    price: "10.000 TL",
    period: "Yıl",
    credits: 1500,
    userLimit: "1 kullanıcı",
    positioning: "Odak ürün. Bir hocanın veya asistanın kişisel bütçeyle satın alabileceği net paket.",
    guardrails: [
      "Aynı anda tek aktif oturum, fakat iki kayıtlı cihaz toleransı.",
      "Bölüm bilgisi segmentasyon için tutulmalı; ilk fazda sert kısıt olmamalı.",
      "Yıllık kullanımda aylık 1.000 TL algısını kıran indirimli ana teklif.",
    ],
  },
  {
    code: "team",
    name: "Kürsü / Asistan Grubu",
    price: "35.000 TL",
    period: "Yıl",
    credits: 6000,
    userLimit: "1 hoca + 3 asistan",
    positioning: "Kurumsal satıştan önce bölüm içi ekip kullanımını yakalayan ara paket.",
    guardrails: [
      "Ortak kredi havuzu.",
      "Alt kullanıcıların yetkileri hoca/admin tarafından yönetilmeli.",
      "Kullanım raporu ve kredi tüketimi hoca ekranında görünmeli.",
    ],
  },
];

export const topUpPlan = {
  code: "topup-500",
  name: "+500 Kağıt Ek Paket",
  price: "3.500 TL",
  credits: 500,
  positioning:
    "Yoğun kullanıcıyı tüm paketi yeniden satın almaya zorlamadan gelir artırır. Taban fiyatı ulaşılabilir tutar.",
};

export const roadmapPhases = [
  {
    phase: "Faz 0",
    title: "Operasyon kontrolü",
    outcome: "Admin paneli kullanıcıları, logları, dosyaları ve kredi hareketlerini görür; manuel kredi tanımlar.",
  },
  {
    phase: "Faz 1",
    title: "Deneme ve kredi kapısı",
    outcome: ".edu.tr kayıt, 1 sınav/15 kağıt deneme kotası, kredi düşme ve limit uyarıları ana uygulamaya eklenir.",
  },
  {
    phase: "Faz 2",
    title: "Paket ve top-up satışı",
    outcome: "Bireysel, ekip ve ek kredi paketleri ödeme altyapısına bağlanır; admin tüm hareketleri izler.",
  },
  {
    phase: "Faz 3",
    title: "Sınav değerlendirme motoru",
    outcome: "Referans kağıdı, öğrenci kağıdı, soru bazlı puan kırma ve hoca onayı uçtan uca stabilize edilir.",
  },
  {
    phase: "Faz 4",
    title: "Kurumsal genişleme",
    outcome: "Bölüm/üniversite raporları, asistan yetkileri, kullanım analitiği ve kurumsal teklif akışı hazırlanır.",
  },
];
