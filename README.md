# StreamPay ⚡

**Monad Testnet üzerinde çalışan, dakikalık ödeme sistemiyle içerik izleme platformu.**

Netflix benzeri bir arayüzde, kullanıcılar MetaMask cüzdanlarını bağlayarak MON token ile dakika satın alır ve içerik izlerken bakiyelerinden otomatik olarak düşer.

![Monad Testnet](https://img.shields.io/badge/Monad-Testnet-836ef9)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E)

---

## 📋 İçindekiler

- [Nasıl Çalışır?](#nasıl-çalışır)
- [Ödeme Sistemi Detayları](#ödeme-sistemi-detayları)
- [Para Nereye Gidiyor?](#para-nereye-gidiyor)
- [Teknoloji Mimarisi](#teknoloji-mimarisi)
- [Kurulum](#kurulum)
- [Ortam Değişkenleri](#ortam-değişkenleri)
- [Supabase Veritabanı Kurulumu](#supabase-veritabanı-kurulumu)
- [Proje Yapısı](#proje-yapısı)

---

## Nasıl Çalışır?

```
Kullanıcı Akışı:

1. MetaMask Bağla  →  Monad Testnet'e otomatik geçiş
2. Dakika Yükle    →  MON token ile dakika paketi satın al
3. İçerik İzle     →  Her 1 saniye = 1/60 dakika bakiyeden düşer
4. Oturum Kapanır  →  İzleme kaydı Supabase + Monoracle'a yazılır
```

### Adım Adım:

1. **Cüzdan Bağlantısı:** Kullanıcı MetaMask ile giriş yapar. Uygulama otomatik olarak Monad Testnet'e (Chain ID: 10143) geçiş yapar.

2. **Dakika Yükleme:** Kullanıcı dakika paketlerinden birini seçer:

   | Paket | Dakika | Fiyat (MON) | Dakika Başı |
   |-------|--------|-------------|-------------|
   | Başlangıç | 10 dk | 0.01 MON | 0.001 MON/dk |
   | **Popüler** | **30 dk** | **0.025 MON** | **0.00083 MON/dk** |
   | Standart | 60 dk | 0.04 MON | 0.00067 MON/dk |
   | Premium | 120 dk | 0.06 MON | 0.0005 MON/dk |

3. **İzleme:** Video oynatıldığında her saniye `1/60 dakika` (≈0.0167 dk) bakiyeden düşer. Bakiye bitince video otomatik durur.

4. **Kayıt:** İzleme bittiğinde oturum bilgileri Supabase veritabanına ve Monoracle API'ye kaydedilir.

---

## Ödeme Sistemi Detayları

### Ödeme Ne Zaman Alınır?

Ödeme **sadece dakika yüklerken** alınır. İzleme sırasında ek bir blockchain işlemi yapılmaz.

```
┌─────────────────────────────────────────────────┐
│  Dakika Yükle (Ödeme Anı)                       │
│                                                 │
│  Kullanıcı "30 Dakika" seçer                    │
│       ↓                                         │
│  MetaMask açılır → 0.025 MON onay ister         │
│       ↓                                         │
│  contract.pay() çağrılır (on-chain tx)          │
│       ↓                                         │
│  TX onaylanır → 30 dk bakiyeye eklenir          │
│       ↓                                         │
│  Supabase'e bakiye + işlem kaydı yazılır        │
│  Monoracle'a satın alma kaydı yazılır           │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  İzleme (Ödeme Yok)                             │
│                                                 │
│  Video oynat → her saniye 1/60 dk düş           │
│       ↓                                         │
│  Bakiye canlı güncellenir (UI'da görünür)       │
│       ↓                                         │
│  Video durdur / kapat                           │
│       ↓                                         │
│  Supabase'e izleme kaydı yazılır                │
│  Monoracle'a oturum kaydı yazılır               │
│  (Blockchain tx yok - sadece veritabanı)        │
└─────────────────────────────────────────────────┘
```

### Bakiye Nerede Saklanır?

| Katman | Nerede? | Ne Saklar? | Kalıcı mı? |
|--------|---------|------------|-------------|
| **Supabase** (ana kaynak) | `user_balances` tablosu | Dakika bakiyesi | ✅ Kalıcı (sunucu) |
| **Supabase** | `transactions` tablosu | Tüm işlem geçmişi | ✅ Kalıcı (sunucu) |
| **localStorage** (önbellek) | Tarayıcı | Bakiye kopyası | ⚠️ Tarayıcıya özel |
| **Monoracle** | Monad blockchain | İşlem kaydı (veri kontratı) | ✅ Kalıcı (zincir üstü) |

> Supabase birincil kaynaktır. localStorage sadece hızlı erişim önbelleği olarak kullanılır. Supabase başarısız olursa localStorage'a fallback yapılır.

---

## Para Nereye Gidiyor?

### Smart Contract Adresi

```
0xbAB6645D0843ddB00Aa1CCfdf369F48F8b620B97
```

**Explorer:** [Monad Testnet Explorer'da Görüntüle](https://testnet.monadexplorer.com/address/0xbAB6645D0843ddB00Aa1CCfdf369F48F8b620B97)

### Akış

```
Kullanıcı Cüzdanı (MetaMask)
       │
       │  contract.pay{ value: X MON }
       ▼
StreamPay Smart Contract
(0xbAB6645D0843ddB00Aa1CCfdf369F48F8b620B97)
       │
       │  MON token kontrata gönderilir
       │  MicroPayment eventi emit edilir
       ▼
Kontrat Bakiyesi (MON birikir)
```

- Kullanıcı dakika satın aldığında MON token'lar doğrudan **StreamPay smart contract**'ına gönderilir
- Kontrat `pay()` fonksiyonunu çağırır ve `MicroPayment` eventi yayınlar
- MON'lar kontrat adresinde birikir
- **Not:** Bu testnet üzerinde çalışır, gerçek para değildir. MON testnet token'larıdır

### Kontrat ABI

```solidity
// Tek fonksiyon - ödeme al
function pay() external payable;

// Event - her ödeme için emit edilir
event MicroPayment(address indexed sender, uint256 amount, uint256 timestamp);
```

### Ödeme Doğrulama

Her ödeme blockchain üzerinde doğrulanabilir:
1. İşlem hash'i `transactions` tablosunda saklanır
2. Monad Testnet Explorer'da görüntülenebilir
3. Monoracle üzerinde veri kontratı olarak da kaydedilir

---

## Teknoloji Mimarisi

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 16)                │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐              │
│  │VideoPlayer│  │ TopBar   │  │BuyMinutes │              │
│  │(izleme)  │  │(bakiye)  │  │  Modal    │              │
│  └────┬─────┘  └────┬─────┘  └─────┬─────┘              │
│       │              │              │                    │
│  ┌────▼──────────────▼──────────────▼────┐               │
│  │         StreamPayDemo.tsx             │               │
│  │    (state yönetimi, iş mantığı)      │               │
│  └────┬───────────┬──────────────┬───────┘               │
│       │           │              │                       │
│  ┌────▼────┐ ┌────▼─────┐ ┌─────▼──────┐                │
│  │ web3.ts │ │supabase.ts│ │monoracle.ts│                │
│  └────┬────┘ └────┬──────┘ └─────┬──────┘                │
└───────┼───────────┼──────────────┼───────────────────────┘
        │           │              │
   ┌────▼────┐ ┌────▼─────┐ ┌─────▼──────┐
   │  Monad  │ │ Supabase │ │ Monoracle  │
   │Testnet  │ │(PostgreSQL)│ │   API     │
   │(EVM)    │ │          │ │(On-chain   │
   │         │ │          │ │  data)     │
   └─────────┘ └──────────┘ └────────────┘
```

### Kullanılan Teknolojiler

| Teknoloji | Kullanım Amacı |
|-----------|---------------|
| **Next.js 16** | Frontend framework (App Router) |
| **React 19** | UI bileşenleri |
| **TypeScript** | Tip güvenliği |
| **Tailwind CSS 4** | Styling |
| **ethers.js v6** | Blockchain etkileşimi (MetaMask, kontrat çağrıları) |
| **Supabase** | Veritabanı (bakiye, işlem geçmişi) |
| **Monoracle API** | Zincir üstü veri kayıt (data contracts) |
| **Monad Testnet** | EVM uyumlu blockchain ağı |
| **shadcn/ui** | UI bileşen kütüphanesi |
| **Lucide Icons** | İkon seti |

---

## Kurulum

### Gereksinimler

- Node.js 18+
- MetaMask tarayıcı eklentisi
- Monad Testnet MON token'ları ([Faucet](https://testnet.monad.xyz))

### Adımlar

```bash
# 1. Repo'yu klonla
git clone <repo-url>
cd StreamPay

# 2. Bağımlılıkları yükle
cd frontend
npm install

# 3. Ortam değişkenlerini ayarla (.env.local dosyasını oluştur)
cp .env.local.example .env.local
# Supabase credential'larını gir

# 4. Supabase tablolarını oluştur
# supabase-schema.sql dosyasını Supabase Dashboard > SQL Editor'da çalıştır

# 5. Geliştirme sunucusunu başlat
npm run dev
```

Uygulama `http://localhost:3000` adresinde açılır.

---

## Ortam Değişkenleri

`frontend/.env.local` dosyasında:

```env
# Supabase (zorunlu)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Monoracle (opsiyonel - varsayılan key kodda mevcut)
MONORACLE_API_KEY=your-monoracle-api-key
```

---

## Supabase Veritabanı Kurulumu

1. [Supabase Dashboard](https://app.supabase.com)'a git
2. Projenin **SQL Editor** sayfasını aç
3. `supabase-schema.sql` dosyasının içeriğini yapıştır ve **Run** et

Bu iki tablo oluşturulur:

### `user_balances` — Kullanıcı Bakiyeleri
| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `wallet_address` | TEXT (PK) | Cüzdan adresi (lowercase) |
| `minute_balance` | NUMERIC(12,4) | Kalan dakika bakiyesi |
| `updated_at` | TIMESTAMPTZ | Son güncelleme zamanı |

### `transactions` — İşlem Geçmişi
| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `id` | UUID (PK) | Benzersiz işlem ID'si |
| `wallet_address` | TEXT | Cüzdan adresi |
| `type` | TEXT | `purchase` veya `watch` |
| `content_id` | TEXT | İzlenen içeriğin ID'si |
| `content_title` | TEXT | İçerik adı veya paket adı |
| `minutes_amount` | NUMERIC(12,4) | Yüklenen/kullanılan dakika |
| `cost_mon` | NUMERIC(18,6) | Ödenen MON miktarı (sadece purchase) |
| `tx_hash` | TEXT | Blockchain işlem hash'i |
| `explorer_url` | TEXT | Explorer linki |
| `monoracle_contract` | TEXT | Monoracle veri kontrat adresi |
| `seconds_watched` | INTEGER | İzlenen süre (saniye) |
| `remaining_balance` | NUMERIC(12,4) | İşlem sonrası kalan bakiye |
| `status` | TEXT | `completed`, `pending`, `failed` |
| `created_at` | TIMESTAMPTZ | İşlem zamanı |

---

## Proje Yapısı

```
StreamPay/
├── README.md                          # Bu dosya
├── supabase-schema.sql                # Veritabanı şeması
├── skills.md                          # Monoracle API dökümanı
└── frontend/
    ├── .env.local                     # Ortam değişkenleri
    ├── package.json
    ├── next.config.ts
    └── src/
        ├── app/
        │   ├── layout.tsx             # Root layout
        │   ├── page.tsx               # Ana sayfa
        │   ├── globals.css            # Global stiller
        │   └── api/
        │       └── monoracle/
        │           └── route.ts       # Monoracle API proxy
        ├── components/
        │   ├── StreamPayDemo.tsx       # Ana uygulama bileşeni (state yönetimi)
        │   ├── TopBar.tsx              # Navigasyon, bakiye, dakika yükle butonu
        │   ├── HeroSection.tsx         # Öne çıkan içerik banner'ı
        │   ├── ContentRow.tsx          # Netflix tarzı yatay içerik listesi
        │   ├── ContentModal.tsx        # İçerik detay modalı
        │   ├── VideoPlayer.tsx         # Video oynatıcı + dakika sayacı
        │   ├── BuyMinutesModal.tsx     # Dakika satın alma modalı
        │   ├── TransactionsPage.tsx    # İşlem geçmişi sayfası
        │   ├── SearchOverlay.tsx       # Arama overlay'i
        │   ├── BalanceCounter.tsx      # Bakiye animasyonu
        │   └── TransactionFeed.tsx     # İşlem feed'i
        └── lib/
            ├── web3.ts                 # Blockchain etkileşimi (MetaMask, kontrat)
            ├── supabase.ts             # Supabase client (bakiye, işlem CRUD)
            ├── monoracle.ts            # Monoracle API client
            ├── mockData.ts             # İçerik verileri, dakika paketleri
            └── utils.ts                # Yardımcı fonksiyonlar
```

---

## Blockchain Detayları

### Monad Testnet

| Parametre | Değer |
|-----------|-------|
| Ağ Adı | Monad Testnet |
| Chain ID | 10143 (0x279F) |
| RPC URL | `https://testnet-rpc.monad.xyz` |
| Explorer | `https://testnet.monadexplorer.com` |
| Native Token | MON |

### Güvenlik Notları

- Kontrat `payable` fonksiyon ile MON kabul eder
- Tüm işlemler Monad Testnet üzerinde gerçekleşir (**gerçek para değildir**)
- Supabase RLS (Row Level Security) açıktır, şu an tüm işlemlere izin verilir
- Üretim ortamında Supabase Auth + wallet imza doğrulama eklenmelidir
- Monoracle API key'i sunucu tarafında (`/api/monoracle` route) saklanır

---

## Lisans

MIT