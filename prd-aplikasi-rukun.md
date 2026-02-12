# KONTEKS PROYEK

Buatkan aplikasi mobile "Sistem Keuangan & Transparansi Kas RT/Masjid/Komunitas" yang menyelesaikan masalah berikut:

## Problem yang Diselesaikan

### A. Problem Pengurus
- Pusing dengan pembukuan manual
- Sering dicurigai oleh warga
- Kurang transparan dalam laporan
- Data Excel yang berantakan dan sulit dikelola

### B. Problem Warga
- Tidak tahu kemana uang kas digunakan
- Tidak percaya kepada pengurus karena kurangnya transparansi

---

# STACK TEKNOLOGI

## Framework & Arsitektur

### Frontend Mobile
**React Native (dengan Expo)** atau **Flutter**

- **Pertimbangan:** Gunakan React Native + Expo jika prioritas adalah development speed, hot reload yang lebih baik, dan ekosistem JavaScript yang luas.
- **Alternatif:** Gunakan Flutter jika prioritas adalah performance native yang lebih baik dan UI consistency lintas platform.
- **Rekomendasi saya:** React Native + Expo untuk kemudahan development dan maintenance.

### Backend
**Node.js dengan Express** atau **NestJS**

- **Rekomendasi:** Gunakan NestJS untuk struktur yang lebih terorganisir dengan TypeScript.

### Database
**PostgreSQL** dengan **Prisma ORM**

### Monorepo Setup
- Gunakan **pnpm workspaces** atau **Turborepo**
- **Struktur folder:**

```text
/
├── apps/
│   ├── mobile/          # React Native app
│   └── backend/         # NestJS backend
├── packages/
│   ├── shared/          # Shared types, constants
│   └── ui/              # Shared UI components
├── pnpm-workspace.yaml
└── turbo.json
```

### Additional Tools
- **Authentication:** Clerk atau Supabase Auth (untuk kemudahan)
- **Storage:** Cloudinary atau AWS S3 (untuk bukti transaksi/foto)
- **Push Notifications:** Firebase Cloud Messaging
- **State Management:** Zustand atau Redux Toolkit
- **API Documentation:** Swagger/OpenAPI
- **Deployment:**
    - **Backend:** Railway, Render, atau Fly.io
    - **Mobile:** Expo EAS Build untuk publishing ke App Store & Play Store

---

# FITUR APLIKASI

## 1. ROLE-BASED ACCESS CONTROL

### A. Role Pengurus (Admin)
- Dashboard analitik keuangan
- Input pemasukan & pengeluaran
- Upload bukti transaksi (foto struk/nota)
- Kategorisasi transaksi
- Export laporan (PDF/Excel)
- Manajemen anggota/warga
- Broadcast notifikasi ke warga

### B. Role Warga (User)
- Lihat semua transaksi secara real-time
- Filter & search transaksi
- Lihat bukti transaksi (foto)
- Notifikasi setiap ada transaksi baru
- Dashboard saldo kas terkini
- Download laporan bulanan/tahunan
- Komentar/feedback pada transaksi (optional)

### C. Role Super Admin (optional untuk multi-organisasi)
- Kelola multiple RT/Masjid/Komunitas
- Approve pengurus baru

## 2. FITUR INTI TRANSAKSI

### A. Pencatatan Pemasukan
- Iuran warga (dengan auto-reminder)
- Donasi
- Pendapatan lainnya
- **Input:** tanggal, jumlah, kategori, keterangan, nama pemberi (jika applicable), bukti foto

### B. Pencatatan Pengeluaran
- Belanja kebutuhan
- Bayar tagihan
- Acara/kegiatan
- Maintenance
- Lain-lain
- **Input:** tanggal, jumlah, kategori, keterangan, vendor/toko, bukti foto (WAJIB)

### C. Fitur Transparansi
- Timeline transaksi (seperti feed social media)
- Semua transaksi langsung visible ke warga
- Bukti foto bisa di-zoom dan dilihat detail
- Saldo real-time terupdate otomatis
- Grafik pemasukan vs pengeluaran
- Breakdown per kategori

## 3. DASHBOARD & LAPORAN

### Dashboard Pengurus
- Total saldo terkini
- Grafik tren pemasukan/pengeluaran (harian, mingguan, bulanan)
- Top 5 kategori pengeluaran
- Reminder iuran yang belum dibayar
- Quick action buttons

### Dashboard Warga
- Saldo kas terkini
- Ringkasan transaksi bulan ini
- Grafik transparansi
- Feed transaksi terbaru
- Status iuran pribadi

### Laporan Auto-Generate
- Laporan bulanan (auto-send via notification di awal bulan)
- Laporan tahunan
- Format PDF yang rapi dan profesional
- Include semua bukti foto dalam lampiran

## 4. FITUR TAMBAHAN (NICE TO HAVE)
- **Voting/Polling:** Untuk keputusan penggunaan dana besar
- **Request Dana:** Warga bisa request penggunaan dana dengan voting
- **Reminder Iuran:** Auto-reminder via push notification
- **Multi-Kas:** Pisahkan kas operasional, kas sosial, kas pembangunan
- **QR Code Payment:** Generate QR untuk pembayaran iuran
- **Chat/Diskusi:** Forum diskusi per transaksi
- **Audit Trail:** Log semua perubahan data (siapa, kapan, apa)
- **Offline Mode:** Sinkronisasi otomatis saat online lagi

---

# UI/UX REQUIREMENTS

## Design Principles
- **Simple & Clean:** Mudah digunakan oleh pengurus yang gaptek sekalipun
- **Transparansi First:** Semua informasi mudah diakses, tidak perlu banyak klik
- **Trust Building:** Visual yang professional untuk membangun kepercayaan
- **Mobile First:** Optimized untuk penggunaan smartphone

## Key Screens
- **Onboarding:** Penjelasan singkat nilai transparansi
- **Login/Register:** Support phone number atau email
- **Home Dashboard:** Saldo besar di atas, transaksi terbaru di bawah
- **Add Transaction:** Form simple dengan camera integration
- **Transaction Detail:** Full detail dengan bukti foto besar
- **Reports:** Visual yang menarik dengan charts
- **Profile & Settings:** Kelola akun dan organisasi

## Design System
- **Color:** Professional tapi approachable (biru/hijau untuk trust)
- **Typography:** Clear hierarchy, readable di mobile
- **Icons:** Consistent icon set (Lucide React atau Heroicons)
- **Components:** Reusable component library di monorepo

---

# TECHNICAL REQUIREMENTS

## Backend API Endpoints

### Authentication
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

### Organizations
- `POST /organizations` (create RT/Masjid)
- `GET /organizations/:id`
- `PUT /organizations/:id`
- `GET /organizations/:id/members`

### Transactions
- `GET /transactions` (with filters, pagination)
- `POST /transactions`
- `GET /transactions/:id`
- `PUT /transactions/:id`
- `DELETE /transactions/:id` (soft delete with audit)
- `POST /transactions/:id/upload-proof`

### Reports
- `GET /reports/monthly/:year/:month`
- `GET /reports/yearly/:year`
- `GET /reports/export` (PDF/Excel)

### Users
- `GET /users/me`
- `PUT /users/me`
- `GET /users/:orgId` (all members)

### Notifications
- `GET /notifications`
- `POST /notifications/send-broadcast`

## Database Schema (Prisma)

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  phone         String?  @unique
  name          String
  role          Role     @default(WARGA)
  organizations OrganizationMember[]
  transactions  Transaction[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Organization {
  id           String   @id @default(cuid())
  name         String
  type         OrgType  // RT, MASJID, KOMUNITAS
  balance      Decimal  @default(0)
  members      OrganizationMember[]
  transactions Transaction[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model OrganizationMember {
  id             String       @id @default(cuid())
  userId         String
  organizationId String
  role           Role         // ADMIN, WARGA
  user           User         @relation(fields: [userId], references: [id])
  organization   Organization @relation(fields: [organizationId], references: [id])
  createdAt      DateTime     @default(now())
  
  @@unique([userId, organizationId])
}

model Transaction {
  id             String       @id @default(cuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  type           TxType       // PEMASUKAN, PENGELUARAN
  amount         Decimal
  category       String
  description    String
  proofUrl       String?      // URL bukti foto
  createdBy      String
  creator        User         @relation(fields: [createdBy], references: [id])
  date           DateTime
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  deletedAt      DateTime?    // Soft delete
}

enum Role {
  SUPER_ADMIN
  ADMIN
  WARGA
}

enum OrgType {
  RT
  MASJID
  KOMUNITAS
}

enum TxType {
  PEMASUKAN
  PENGELUARAN
}
```

## Security Requirements
- Input validation dengan Zod
- Rate limiting pada API
- HTTPS only
- JWT authentication dengan refresh token
- Enkripsi data sensitif
- Image upload size limit (max 5MB)
- Sanitize input untuk prevent XSS/SQL injection

## Performance
- API response < 200ms
- Implement caching (Redis optional)
- Lazy loading untuk list transaksi
- Image compression before upload
- Pagination untuk semua list

---

# DEVELOPMENT PHASES

## Phase 1 - MVP (2-3 minggu)
- Setup monorepo
- Authentication system
- Basic CRUD transaksi (pemasukan/pengeluaran)
- Upload bukti foto
- Dashboard sederhana (saldo + list transaksi)
- Role-based access (Admin vs Warga)

## Phase 2 - Core Features (2-3 minggu)
- Kategori transaksi
- Filter & search
- Laporan PDF bulanan
- Push notifications
- Grafik & analytics
- Multi-organization support

## Phase 3 - Enhancement (2 minggu)
- Reminder iuran
- Voting/polling features
- Advanced reports
- Audit trail
- Performance optimization
- Beta testing dengan real users

## Phase 4 - Launch (1 minggu)
- Bug fixes dari beta
- App Store & Play Store submission
- Documentation
- Marketing materials

---

# DELIVERABLES

## Source Code
Clean, well-documented code di monorepo

## Documentation
- README dengan setup instructions
- API documentation (Swagger)
- User guide untuk pengurus & warga

## Deployment
- Backend deployed dan accessible
- Mobile app di TestFlight & Play Store (beta)

## Design Assets
Figma file atau design system documentation

---

# KRITERIA SUKSES

- ✅ Pengurus bisa input transaksi dalam < 2 menit
- ✅ Warga bisa lihat semua transaksi secara real-time
- ✅ Setiap transaksi WAJIB ada bukti foto
- ✅ App bisa digunakan oleh user gaptek teknologi
- ✅ Saldo selalu akurat dan terupdate
- ✅ Notification real-time untuk setiap transaksi baru
- ✅ Laporan bulanan auto-generate dan bisa di-download
- ✅ App stabil, jarang crash, smooth performance

---

# INSTRUKSI UNTUK AI AGENT

1. **Start with monorepo setup:** Setup pnpm workspace dengan React Native (Expo) dan NestJS
2. **Database first:** Setup Prisma dengan schema di atas, jalankan migrations
3. **Build API endpoints:** Implementasi semua REST API dengan proper validation
4. **Mobile app:** Build UI screens sesuai requirements dengan reusable components
5. **Integration:** Connect mobile app dengan backend API
6. **Testing:** Implement basic testing untuk critical flows
7. **Documentation:** Generate API docs dan README yang comprehensive

> **PENTING:**
> - Fokus pada simplicity dan user experience
> - Transparansi adalah fitur utama - pastikan semua data mudah diakses warga
> - Gunakan TypeScript untuk type safety
> - Follow best practices untuk clean code dan security
> - Build incrementally - MVP dulu, polish later

Silakan mulai dengan setup monorepo dan bertanya jika ada yang perlu klarifikasi!