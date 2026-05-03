# Papirus AI Admin

Papirus AI Admin, ana uygulama ve landing projesinden bağımsız çalışan yerel operasyon panelidir. Landing içeriği
düzenlemez; kullanıcıları, oturumları, dosya/log akışını ve kredi hareketlerini izler.

## Ne Yapar?

- Kullanıcıları ve hesap ayrıntılarını listeler.
- Üniversite/bölüm onboarding bilgilerini gösterir.
- Son oturumları, yüklenen dosyaları ve progress kayıtlarını gösterir.
- Seçilen kullanıcıya kredi ekler veya kredi bakiyesini ayarlar.
- Kredi işlemlerini `admin_credit_events` tablosuna, kritik panel işlemlerini `admin_audit_logs` tablosuna yazar.
- Paket/faz planını operasyon ekranında görünür tutar.

## Önerilen Deneme Kotası

50 kağıt yerine 15 kağıt önerildi:

- 1 sınav
- 1 referans kağıdı
- 15 öğrenci kağıdı
- 14 gün süre
- Kredi kartı yok
- `.edu.tr` veya admin onaylı akademik alan adı

Bu sınır, gerçek el yazısı örnekleriyle güven oluşturmak için yeterlidir ve erken maliyet/suistimal riskini azaltır.

## Lokal Kurulum

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run db:admin-schema
npm run dev
```

Uygulama gerektiğinde `http://localhost:3344/yonetim` adresinde açılır.

`db:admin-schema` yalnızca admin panelinin ihtiyaç duyduğu iki ek tabloyu oluşturur; ana Papirus AI tablolarını
değiştirmez.

## Ortam Değişkenleri

```bash
DATABASE_URL="postgresql://..."
ADMIN_CHALLENGE_ANSWER="ilk-adim-cevabi"
ADMIN_PASSWORD="guclu-bir-sifre"
ADMIN_SESSION_SECRET="uzun-rastgele-bir-secret"
ADMIN_COOKIE_SECURE="false"
```

Canlı HTTPS ortamında `ADMIN_COOKIE_SECURE="true"` kullanılmalıdır.
Admin girişinde önce güvenlik sorusu, sonra admin şifresi sorulur. Bu değerleri repoya yazma; yalnızca lokal `.env`
dosyasında tut.

## Docker

```bash
docker compose up --build
```

Docker için `.env` içinde `DATABASE_URL`, `ADMIN_CHALLENGE_ANSWER`, `ADMIN_PASSWORD` ve `ADMIN_SESSION_SECRET`
tanımlı olmalıdır. Lokal Docker Desktop ortamında varsayılan bağlantı `host.docker.internal:5432/papirus_ai` üzerinden
ana Papirus AI PostgreSQL container'ına gider.

Container açılırken `db/admin-schema.sql` otomatik çalıştırılır ve admin log tabloları yoksa oluşturulur.

## Faz Planı

Detaylı plan `docs/product-roadmap.md` dosyasındadır.
