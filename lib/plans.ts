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
    credits: 5,
    userLimit: "1 kurumsal e-posta",
    positioning: "Kredi kartı istemeden akademisyene kendi gerçek kağıdıyla hızlı güven anını yaşatır.",
    guardrails: [
      "Sadece .edu.tr veya admin tarafından onaylanmış akademik alan adı.",
      "1 sınav, 1 referans kağıdı ve en fazla 5 öğrenci kağıdı.",
      "Referans kağıdı ve başarısız OCR retry işlemleri kredi yakmamalı.",
      "Deneme sonunda export kapatılabilir, ama sonuç ekranı açık kalmalı.",
    ],
  },
  {
    code: "paper-350",
    name: "Başlangıç Paketi",
    price: "1.999 TL",
    period: "Paket",
    credits: 350,
    userLimit: "1 kullanıcı",
    positioning: "Tek ders, küçük sınıf veya ilk düzenli kullanım için erişilebilir başlangıç paketi.",
    guardrails: [
      "350 kağıt okuma kredisi.",
      "Soru bazlı değerlendirme ve sınav arşivi.",
      "Gmail ile güvenli konsol girişi.",
    ],
  },
  {
    code: "paper-1000",
    name: "Akademik Paket",
    price: "4.999 TL",
    period: "Paket",
    credits: 1000,
    userLimit: "Akademisyen / ekip",
    positioning: "Yoğun sınav dönemlerinde daha yüksek hacimli değerlendirme yapan akademik ekipler için.",
    guardrails: [
      "1.000 kağıt okuma kredisi.",
      "Rubrik bazlı karşılaştırma.",
      "Sınıf performans özeti.",
    ],
  },
  {
    code: "paper-5000",
    name: "Kurumsal Paket",
    price: "19.999 TL",
    period: "Paket",
    credits: 5000,
    userLimit: "Bölüm / fakülte",
    positioning: "Bölüm, fakülte ve yüksek hacimli akademik operasyonlar için.",
    guardrails: [
      "5.000 kağıt okuma kredisi.",
      "Kurum ölçeğinde kullanım.",
      "Öncelikli destek.",
    ],
  },
];

export const legacyPlanCodes = {
  individual: "Eski Bireysel Paket",
  team: "Eski Kürsü / Asistan Grubu",
} as const;

export const roadmapPhases = [
  {
    phase: "Faz 0",
    title: "Operasyon kontrolü",
    outcome: "Admin paneli kullanıcıları, logları, dosyaları ve kredi hareketlerini görür; manuel kredi tanımlar.",
  },
  {
    phase: "Faz 1",
    title: "Deneme ve kredi kapısı",
    outcome: ".edu.tr kayıt, 1 sınav/5 kağıt deneme kotası, kredi düşme ve limit uyarıları ana uygulamaya eklenir.",
  },
  {
    phase: "Faz 2",
    title: "Paket satışı",
    outcome: "Başlangıç, Akademik ve Kurumsal paketleri ödeme altyapısına bağlanır; admin tüm hareketleri izler.",
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
