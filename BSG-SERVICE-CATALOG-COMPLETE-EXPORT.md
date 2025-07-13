# BSG SERVICE CATALOG - COMPLETE EXPORT
**Generated**: 2025-07-13  
**System**: Enterprise Ticketing System (ETS)  
**Organization**: Bank Sulawesi Utara Gorontalo (BSG)

---

## EXPORT SCOPE
This document contains the complete BSG service catalog including:
- All service categories and subcategories (7 catalogs)
- All service items with descriptions (240 services)
- All dynamic fields and their configurations
- Field options, validation rules, and dependencies
- BSG master data for dropdown populations (249 options)

---

## EXECUTIVE SUMMARY

**Service Catalog Statistics**:
- **Total Service Catalogs**: 7
- **Total Service Items**: 240
- **Total Dynamic Fields**: 189
- **Total Master Data Options**: 249
- **Total BSG Templates**: 0

---

## SERVICE CATALOG DETAILED BREAKDOWN


### 1. ATM, EDC & BRANCH HARDWARE
**Description**: Services related to physical endpoints and hardware in branches and at customer locations  
**Service Type**: technical_service  
**Service Items**: 21


#### 1.1 ATM - ATMB Error Transfer Antar Bank
- **Description**: Hardware service: ATM - ATMB Error Transfer Antar Bank
- **Sort Order**: 1
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 1.2 ATM - Cash Handler
- **Description**: Hardware service: ATM - Cash Handler
- **Sort Order**: 2
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 1.3 ATM - Cassette Supply/Persediaan Kaset
- **Description**: Hardware service: ATM - Cassette Supply/Persediaan Kaset
- **Sort Order**: 3
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 5

**Dynamic Fields Configuration**:

1. **lokasi_atm** (Lokasi ATM)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Lokasi ATM (cabang/alamat)
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **nomor_kartu** (Nomor Kartu (4 digit terakhir))
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Contoh: xxxx1234
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **waktu_transaksi** (Waktu Transaksi)
   - **Type**: datetime
   - **Required**: Yes
   - **Sort Order**: 3
   - **Placeholder**: Kapan transaksi dilakukan
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

4. **nominal_transaksi** (Nominal Transaksi)
   - **Type**: number
   - **Required**: No
   - **Sort Order**: 4
   - **Placeholder**: Jumlah transaksi
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

5. **jenis_masalah** (Jenis Masalah)
   - **Type**: dropdown
   - **Required**: Yes
   - **Sort Order**: 5
   - **Placeholder**: Pilih jenis masalah
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: [{"label":"Kartu Tertelan","value":"kartu_tertelan","sortOrder":1},{"label":"Uang Tidak Keluar","value":"uang_tidak_keluar","sortOrder":2},{"label":"Struk Tidak Keluar","value":"struk_tidak_keluar","sortOrder":3},{"label":"Saldo Terpotong Tanpa Uang Keluar","value":"saldo_terpotong","sortOrder":4},{"label":"Transaksi Gagal/Error","value":"transaksi_gagal","sortOrder":5}]


#### 1.4 ATM - Communication Offline
- **Description**: Hardware service: ATM - Communication Offline
- **Sort Order**: 4
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 1.5 ATM - Door Contact Sensor Abnormal
- **Description**: Hardware service: ATM - Door Contact Sensor Abnormal
- **Sort Order**: 5
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 1.6 ATM - Gagal Cash in/Cash out
- **Description**: Hardware service: ATM - Gagal Cash in/Cash out
- **Sort Order**: 6
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 1.7 ATM - MCRW Fatal
- **Description**: Hardware service: ATM - MCRW Fatal
- **Sort Order**: 7
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 5

**Dynamic Fields Configuration**:

1. **lokasi_atm** (Lokasi ATM)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Lokasi ATM (cabang/alamat)
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **nomor_kartu** (Nomor Kartu (4 digit terakhir))
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Contoh: xxxx1234
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **waktu_transaksi** (Waktu Transaksi)
   - **Type**: datetime
   - **Required**: Yes
   - **Sort Order**: 3
   - **Placeholder**: Kapan transaksi dilakukan
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

4. **nominal_transaksi** (Nominal Transaksi)
   - **Type**: number
   - **Required**: No
   - **Sort Order**: 4
   - **Placeholder**: Jumlah transaksi
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

5. **jenis_masalah** (Jenis Masalah)
   - **Type**: dropdown
   - **Required**: Yes
   - **Sort Order**: 5
   - **Placeholder**: Pilih jenis masalah
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: [{"label":"Kartu Tertelan","value":"kartu_tertelan","sortOrder":1},{"label":"Uang Tidak Keluar","value":"uang_tidak_keluar","sortOrder":2},{"label":"Struk Tidak Keluar","value":"struk_tidak_keluar","sortOrder":3},{"label":"Saldo Terpotong Tanpa Uang Keluar","value":"saldo_terpotong","sortOrder":4},{"label":"Transaksi Gagal/Error","value":"transaksi_gagal","sortOrder":5}]


#### 1.8 ATM - Receipt Paper Media Out
- **Description**: Hardware service: ATM - Receipt Paper Media Out
- **Sort Order**: 8
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 1.9 ATM-Pendaftaran Terminal Baru
- **Description**: Hardware service: ATM-Pendaftaran Terminal Baru
- **Sort Order**: 9
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 4

**Dynamic Fields Configuration**:

1. **nama_pelapor** (Nama Pelapor)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Nama lengkap pelapor
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **unit_cabang** (Unit/Cabang)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Unit atau cabang pelapor
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **nomor_kontak** (Nomor Kontak)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 3
   - **Placeholder**: Nomor HP/telepon
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

4. **waktu_kejadian** (Waktu Kejadian)
   - **Type**: datetime
   - **Required**: Yes
   - **Sort Order**: 4
   - **Placeholder**: Kapan masalah terjadi
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None


#### 1.10 ATM-Pengiriman Log Jurnal
- **Description**: Hardware service: ATM-Pengiriman Log Jurnal
- **Sort Order**: 10
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 4

**Dynamic Fields Configuration**:

1. **nama_pelapor** (Nama Pelapor)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Nama lengkap pelapor
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **unit_cabang** (Unit/Cabang)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Unit atau cabang pelapor
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **nomor_kontak** (Nomor Kontak)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 3
   - **Placeholder**: Nomor HP/telepon
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

4. **waktu_kejadian** (Waktu Kejadian)
   - **Type**: datetime
   - **Required**: Yes
   - **Sort Order**: 4
   - **Placeholder**: Kapan masalah terjadi
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None


#### 1.11 ATM-Permasalahan Teknis
- **Description**: Hardware service: ATM-Permasalahan Teknis
- **Sort Order**: 11
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 6

**Dynamic Fields Configuration**:

1. **lokasi_atm** (Lokasi ATM)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Masukkan lokasi ATM
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **terminal_id** (Terminal ID)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Masukkan Terminal ID
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **jenis_masalah** (Jenis Masalah)
   - **Type**: dropdown
   - **Required**: Yes
   - **Sort Order**: 3
   - **Placeholder**: None
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: [{"label":"Kartu Tertelan","value":"kartu_tertelan","sortOrder":1},{"label":"Uang Tidak Keluar","value":"uang_tidak_keluar","sortOrder":2},{"label":"Mesin Error/Hang","value":"mesin_error","sortOrder":3},{"label":"Kertas Struk Habis","value":"kertas_habis","sortOrder":4},{"label":"Jaringan Offline","value":"jaringan_offline","sortOrder":5},{"label":"Lainnya","value":"lainnya","sortOrder":6}]

4. **deskripsi_masalah** (Deskripsi Detail Masalah)
   - **Type**: textarea
   - **Required**: Yes
   - **Sort Order**: 4
   - **Placeholder**: Jelaskan masalah secara detail
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

5. **waktu_kejadian** (Waktu Kejadian)
   - **Type**: datetime
   - **Required**: Yes
   - **Sort Order**: 5
   - **Placeholder**: None
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

6. **dampak_layanan** (Dampak terhadap Layanan)
   - **Type**: radio
   - **Required**: Yes
   - **Sort Order**: 6
   - **Placeholder**: None
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: [{"label":"ATM Tidak Bisa Digunakan","value":"high","sortOrder":1},{"label":"Layanan Terganggu Sebagian","value":"medium","sortOrder":2},{"label":"Masalah Minor","value":"low","sortOrder":3}]


#### 1.12 ATM-Permintaan Log Switching
- **Description**: Hardware service: ATM-Permintaan Log Switching
- **Sort Order**: 12
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 5

**Dynamic Fields Configuration**:

1. **lokasi_atm** (Lokasi ATM)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Lokasi ATM (cabang/alamat)
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **nomor_kartu** (Nomor Kartu (4 digit terakhir))
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Contoh: xxxx1234
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **waktu_transaksi** (Waktu Transaksi)
   - **Type**: datetime
   - **Required**: Yes
   - **Sort Order**: 3
   - **Placeholder**: Kapan transaksi dilakukan
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

4. **nominal_transaksi** (Nominal Transaksi)
   - **Type**: number
   - **Required**: No
   - **Sort Order**: 4
   - **Placeholder**: Jumlah transaksi
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

5. **jenis_masalah** (Jenis Masalah)
   - **Type**: dropdown
   - **Required**: Yes
   - **Sort Order**: 5
   - **Placeholder**: Pilih jenis masalah
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: [{"label":"Kartu Tertelan","value":"kartu_tertelan","sortOrder":1},{"label":"Uang Tidak Keluar","value":"uang_tidak_keluar","sortOrder":2},{"label":"Struk Tidak Keluar","value":"struk_tidak_keluar","sortOrder":3},{"label":"Saldo Terpotong Tanpa Uang Keluar","value":"saldo_terpotong","sortOrder":4},{"label":"Transaksi Gagal/Error","value":"transaksi_gagal","sortOrder":5}]


#### 1.13 ATM-Perubahan IP
- **Description**: Hardware service: ATM-Perubahan IP
- **Sort Order**: 13
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 4

**Dynamic Fields Configuration**:

1. **nama_pelapor** (Nama Pelapor)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Nama lengkap pelapor
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **unit_cabang** (Unit/Cabang)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Unit atau cabang pelapor
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **nomor_kontak** (Nomor Kontak)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 3
   - **Placeholder**: Nomor HP/telepon
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

4. **waktu_kejadian** (Waktu Kejadian)
   - **Type**: datetime
   - **Required**: Yes
   - **Sort Order**: 4
   - **Placeholder**: Kapan masalah terjadi
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None


#### 1.14 ATM-Perubahan Profil
- **Description**: Hardware service: ATM-Perubahan Profil
- **Sort Order**: 14
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 4

**Dynamic Fields Configuration**:

1. **nama_pelapor** (Nama Pelapor)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Nama lengkap pelapor
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **unit_cabang** (Unit/Cabang)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Unit atau cabang pelapor
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **nomor_kontak** (Nomor Kontak)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 3
   - **Placeholder**: Nomor HP/telepon
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

4. **waktu_kejadian** (Waktu Kejadian)
   - **Type**: datetime
   - **Required**: Yes
   - **Sort Order**: 4
   - **Placeholder**: Kapan masalah terjadi
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None


#### 1.15 Penggantian Mesin
- **Description**: Hardware service: Penggantian Mesin
- **Sort Order**: 15
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 1.16 Perubahan Denom
- **Description**: Hardware service: Perubahan Denom
- **Sort Order**: 16
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 1.17 BSGDebit/EDC - Permintaan Salinan Bukti Transaksi
- **Description**: Hardware service: BSGDebit/EDC - Permintaan Salinan Bukti Transaksi
- **Sort Order**: 17
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 1.18 Error Pinpad
- **Description**: Hardware service: Error Pinpad
- **Sort Order**: 18
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 1.19 Maintenance Printer
- **Description**: Hardware service: Maintenance Printer
- **Sort Order**: 19
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 1.20 Pendaftaran Terminal Komputer Baru
- **Description**: Hardware service: Pendaftaran Terminal Komputer Baru
- **Sort Order**: 20
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 1.21 Formulir Serah Terima Komputer
- **Description**: Hardware service: Formulir Serah Terima Komputer
- **Sort Order**: 21
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 0


### 2. CLAIMS & DISPUTES
**Description**: A dedicated category for all transaction-related claims, disputes, and reconciliations  
**Service Type**: business_service  
**Service Items**: 57


#### 2.1 ATM-Pembayaran Citilink
- **Description**: Claims service: ATM-Pembayaran Citilink
- **Sort Order**: 1
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.2 ATM-Pembayaran PBB
- **Description**: Claims service: ATM-Pembayaran PBB
- **Sort Order**: 2
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.3 ATM-Pembayaran Samsat
- **Description**: Claims service: ATM-Pembayaran Samsat
- **Sort Order**: 3
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.4 ATM-Pembayaran Tagihan BigTV
- **Description**: Claims service: ATM-Pembayaran Tagihan BigTV
- **Sort Order**: 4
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 6

**Dynamic Fields Configuration**:

1. **nama_pelapor** (Nama Pelapor)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Nama lengkap pelapor
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **unit_cabang** (Unit/Cabang)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Unit atau cabang pelapor
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **nomor_kontak** (Nomor Kontak)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 3
   - **Placeholder**: Nomor HP/telepon
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

4. **waktu_kejadian** (Waktu Kejadian)
   - **Type**: datetime
   - **Required**: Yes
   - **Sort Order**: 4
   - **Placeholder**: Kapan masalah terjadi
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

5. **nomor_referensi** (Nomor Referensi)
   - **Type**: text
   - **Required**: No
   - **Sort Order**: 5
   - **Placeholder**: Nomor referensi transaksi
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

6. **nominal** (Nominal)
   - **Type**: number
   - **Required**: No
   - **Sort Order**: 6
   - **Placeholder**: Jumlah nominal
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None


#### 2.5 ATM-Pembayaran Tagihan BPJS
- **Description**: Claims service: ATM-Pembayaran Tagihan BPJS
- **Sort Order**: 5
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.6 ATM-Pembayaran Tagihan PLN
- **Description**: Claims service: ATM-Pembayaran Tagihan PLN
- **Sort Order**: 6
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 6

**Dynamic Fields Configuration**:

1. **nama_pelapor** (Nama Pelapor)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Nama lengkap pelapor
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **unit_cabang** (Unit/Cabang)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Unit atau cabang pelapor
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **nomor_kontak** (Nomor Kontak)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 3
   - **Placeholder**: Nomor HP/telepon
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

4. **waktu_kejadian** (Waktu Kejadian)
   - **Type**: datetime
   - **Required**: Yes
   - **Sort Order**: 4
   - **Placeholder**: Kapan masalah terjadi
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

5. **nomor_referensi** (Nomor Referensi)
   - **Type**: text
   - **Required**: No
   - **Sort Order**: 5
   - **Placeholder**: Nomor referensi transaksi
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

6. **nominal** (Nominal)
   - **Type**: number
   - **Required**: No
   - **Sort Order**: 6
   - **Placeholder**: Jumlah nominal
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None


#### 2.7 ATM-Pembayaran Tagihan PSTN
- **Description**: Claims service: ATM-Pembayaran Tagihan PSTN
- **Sort Order**: 7
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 6

**Dynamic Fields Configuration**:

1. **nama_pelapor** (Nama Pelapor)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Nama lengkap pelapor
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **unit_cabang** (Unit/Cabang)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Unit atau cabang pelapor
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **nomor_kontak** (Nomor Kontak)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 3
   - **Placeholder**: Nomor HP/telepon
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

4. **waktu_kejadian** (Waktu Kejadian)
   - **Type**: datetime
   - **Required**: Yes
   - **Sort Order**: 4
   - **Placeholder**: Kapan masalah terjadi
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

5. **nomor_referensi** (Nomor Referensi)
   - **Type**: text
   - **Required**: No
   - **Sort Order**: 5
   - **Placeholder**: Nomor referensi transaksi
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

6. **nominal** (Nominal)
   - **Type**: number
   - **Required**: No
   - **Sort Order**: 6
   - **Placeholder**: Jumlah nominal
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None


#### 2.8 ATM-Pembelian Pulsa Indosat
- **Description**: Claims service: ATM-Pembelian Pulsa Indosat
- **Sort Order**: 8
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 4

**Dynamic Fields Configuration**:

1. **nama_pelapor** (Nama Pelapor)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Nama lengkap pelapor
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **unit_cabang** (Unit/Cabang)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Unit atau cabang pelapor
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **nomor_kontak** (Nomor Kontak)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 3
   - **Placeholder**: Nomor HP/telepon
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

4. **waktu_kejadian** (Waktu Kejadian)
   - **Type**: datetime
   - **Required**: Yes
   - **Sort Order**: 4
   - **Placeholder**: Kapan masalah terjadi
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None


#### 2.9 ATM-Pembelian Pulsa Telkomsel
- **Description**: Claims service: ATM-Pembelian Pulsa Telkomsel
- **Sort Order**: 9
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 5

**Dynamic Fields Configuration**:

1. **lokasi_atm** (Lokasi ATM)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Lokasi ATM (cabang/alamat)
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **nomor_kartu** (Nomor Kartu (4 digit terakhir))
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Contoh: xxxx1234
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **waktu_transaksi** (Waktu Transaksi)
   - **Type**: datetime
   - **Required**: Yes
   - **Sort Order**: 3
   - **Placeholder**: Kapan transaksi dilakukan
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

4. **nominal_transaksi** (Nominal Transaksi)
   - **Type**: number
   - **Required**: No
   - **Sort Order**: 4
   - **Placeholder**: Jumlah transaksi
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

5. **jenis_masalah** (Jenis Masalah)
   - **Type**: dropdown
   - **Required**: Yes
   - **Sort Order**: 5
   - **Placeholder**: Pilih jenis masalah
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: [{"label":"Kartu Tertelan","value":"kartu_tertelan","sortOrder":1},{"label":"Uang Tidak Keluar","value":"uang_tidak_keluar","sortOrder":2},{"label":"Struk Tidak Keluar","value":"struk_tidak_keluar","sortOrder":3},{"label":"Saldo Terpotong Tanpa Uang Keluar","value":"saldo_terpotong","sortOrder":4},{"label":"Transaksi Gagal/Error","value":"transaksi_gagal","sortOrder":5}]


#### 2.10 ATM-Pembelian Pulsa Three
- **Description**: Claims service: ATM-Pembelian Pulsa Three
- **Sort Order**: 10
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 4

**Dynamic Fields Configuration**:

1. **nama_pelapor** (Nama Pelapor)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Nama lengkap pelapor
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **unit_cabang** (Unit/Cabang)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Unit atau cabang pelapor
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **nomor_kontak** (Nomor Kontak)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 3
   - **Placeholder**: Nomor HP/telepon
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

4. **waktu_kejadian** (Waktu Kejadian)
   - **Type**: datetime
   - **Required**: Yes
   - **Sort Order**: 4
   - **Placeholder**: Kapan masalah terjadi
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None


#### 2.11 ATM-Pembelian Pulsa XL
- **Description**: Claims service: ATM-Pembelian Pulsa XL
- **Sort Order**: 11
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 5

**Dynamic Fields Configuration**:

1. **lokasi_atm** (Lokasi ATM)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Lokasi ATM (cabang/alamat)
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **nomor_kartu** (Nomor Kartu (4 digit terakhir))
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Contoh: xxxx1234
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **waktu_transaksi** (Waktu Transaksi)
   - **Type**: datetime
   - **Required**: Yes
   - **Sort Order**: 3
   - **Placeholder**: Kapan transaksi dilakukan
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

4. **nominal_transaksi** (Nominal Transaksi)
   - **Type**: number
   - **Required**: No
   - **Sort Order**: 4
   - **Placeholder**: Jumlah transaksi
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

5. **jenis_masalah** (Jenis Masalah)
   - **Type**: dropdown
   - **Required**: Yes
   - **Sort Order**: 5
   - **Placeholder**: Pilih jenis masalah
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: [{"label":"Kartu Tertelan","value":"kartu_tertelan","sortOrder":1},{"label":"Uang Tidak Keluar","value":"uang_tidak_keluar","sortOrder":2},{"label":"Struk Tidak Keluar","value":"struk_tidak_keluar","sortOrder":3},{"label":"Saldo Terpotong Tanpa Uang Keluar","value":"saldo_terpotong","sortOrder":4},{"label":"Transaksi Gagal/Error","value":"transaksi_gagal","sortOrder":5}]


#### 2.12 ATM-Pembelian Token PLN
- **Description**: Claims service: ATM-Pembelian Token PLN
- **Sort Order**: 12
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 4

**Dynamic Fields Configuration**:

1. **nama_pelapor** (Nama Pelapor)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Nama lengkap pelapor
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **unit_cabang** (Unit/Cabang)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Unit atau cabang pelapor
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **nomor_kontak** (Nomor Kontak)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 3
   - **Placeholder**: Nomor HP/telepon
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

4. **waktu_kejadian** (Waktu Kejadian)
   - **Type**: datetime
   - **Required**: Yes
   - **Sort Order**: 4
   - **Placeholder**: Kapan masalah terjadi
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None


#### 2.13 ATM-Penarikan ATM Bank Lain
- **Description**: Claims service: ATM-Penarikan ATM Bank Lain
- **Sort Order**: 13
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 4

**Dynamic Fields Configuration**:

1. **nama_pelapor** (Nama Pelapor)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Nama lengkap pelapor
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **unit_cabang** (Unit/Cabang)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Unit atau cabang pelapor
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **nomor_kontak** (Nomor Kontak)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 3
   - **Placeholder**: Nomor HP/telepon
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

4. **waktu_kejadian** (Waktu Kejadian)
   - **Type**: datetime
   - **Required**: Yes
   - **Sort Order**: 4
   - **Placeholder**: Kapan masalah terjadi
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None


#### 2.14 ATM-Penarikan ATM Bank Lain >75 Hari
- **Description**: Claims service: ATM-Penarikan ATM Bank Lain >75 Hari
- **Sort Order**: 14
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 5

**Dynamic Fields Configuration**:

1. **lokasi_atm** (Lokasi ATM)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Lokasi ATM (cabang/alamat)
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **nomor_kartu** (Nomor Kartu (4 digit terakhir))
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Contoh: xxxx1234
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **waktu_transaksi** (Waktu Transaksi)
   - **Type**: datetime
   - **Required**: Yes
   - **Sort Order**: 3
   - **Placeholder**: Kapan transaksi dilakukan
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

4. **nominal_transaksi** (Nominal Transaksi)
   - **Type**: number
   - **Required**: No
   - **Sort Order**: 4
   - **Placeholder**: Jumlah transaksi
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

5. **jenis_masalah** (Jenis Masalah)
   - **Type**: dropdown
   - **Required**: Yes
   - **Sort Order**: 5
   - **Placeholder**: Pilih jenis masalah
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: [{"label":"Kartu Tertelan","value":"kartu_tertelan","sortOrder":1},{"label":"Uang Tidak Keluar","value":"uang_tidak_keluar","sortOrder":2},{"label":"Struk Tidak Keluar","value":"struk_tidak_keluar","sortOrder":3},{"label":"Saldo Terpotong Tanpa Uang Keluar","value":"saldo_terpotong","sortOrder":4},{"label":"Transaksi Gagal/Error","value":"transaksi_gagal","sortOrder":5}]


#### 2.15 ATM-Penyelesaian Re-Klaim Bank Lain
- **Description**: Claims service: ATM-Penyelesaian Re-Klaim Bank Lain
- **Sort Order**: 15
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 4

**Dynamic Fields Configuration**:

1. **nama_pelapor** (Nama Pelapor)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Nama lengkap pelapor
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **unit_cabang** (Unit/Cabang)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Unit atau cabang pelapor
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **nomor_kontak** (Nomor Kontak)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 3
   - **Placeholder**: Nomor HP/telepon
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

4. **waktu_kejadian** (Waktu Kejadian)
   - **Type**: datetime
   - **Required**: Yes
   - **Sort Order**: 4
   - **Placeholder**: Kapan masalah terjadi
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None


#### 2.16 ATM-Transfer ATM Bank Lain
- **Description**: Claims service: ATM-Transfer ATM Bank Lain
- **Sort Order**: 16
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 6

**Dynamic Fields Configuration**:

1. **nama_pelapor** (Nama Pelapor)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Nama lengkap pelapor
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **unit_cabang** (Unit/Cabang)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Unit atau cabang pelapor
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **nomor_kontak** (Nomor Kontak)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 3
   - **Placeholder**: Nomor HP/telepon
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

4. **waktu_kejadian** (Waktu Kejadian)
   - **Type**: datetime
   - **Required**: Yes
   - **Sort Order**: 4
   - **Placeholder**: Kapan masalah terjadi
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

5. **nomor_referensi** (Nomor Referensi)
   - **Type**: text
   - **Required**: No
   - **Sort Order**: 5
   - **Placeholder**: Nomor referensi transaksi
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

6. **nominal** (Nominal)
   - **Type**: number
   - **Required**: No
   - **Sort Order**: 6
   - **Placeholder**: Jumlah nominal
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None


#### 2.17 ATM-Transfer Bank Lain > 75 Hari
- **Description**: Claims service: ATM-Transfer Bank Lain > 75 Hari
- **Sort Order**: 17
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 6

**Dynamic Fields Configuration**:

1. **nama_pelapor** (Nama Pelapor)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Nama lengkap pelapor
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **unit_cabang** (Unit/Cabang)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Unit atau cabang pelapor
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **nomor_kontak** (Nomor Kontak)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 3
   - **Placeholder**: Nomor HP/telepon
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

4. **waktu_kejadian** (Waktu Kejadian)
   - **Type**: datetime
   - **Required**: Yes
   - **Sort Order**: 4
   - **Placeholder**: Kapan masalah terjadi
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

5. **nomor_referensi** (Nomor Referensi)
   - **Type**: text
   - **Required**: No
   - **Sort Order**: 5
   - **Placeholder**: Nomor referensi transaksi
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

6. **nominal** (Nominal)
   - **Type**: number
   - **Required**: No
   - **Sort Order**: 6
   - **Placeholder**: Jumlah nominal
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None


#### 2.18 BSG QRIS - Klaim BI Fast
- **Description**: Claims service: BSG QRIS - Klaim BI Fast
- **Sort Order**: 18
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.19 BSG QRIS - Klaim Gagal Transaksi
- **Description**: Claims service: BSG QRIS - Klaim Gagal Transaksi
- **Sort Order**: 19
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.20 BSG QRIS - Pembelian Data Telkomsel
- **Description**: Claims service: BSG QRIS - Pembelian Data Telkomsel
- **Sort Order**: 20
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.21 BSG QRIS - Pembelian Pulsa Telkomsel
- **Description**: Claims service: BSG QRIS - Pembelian Pulsa Telkomsel
- **Sort Order**: 21
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.22 BSGDebit/EDC - Pembayaran
- **Description**: Claims service: BSGDebit/EDC - Pembayaran
- **Sort Order**: 22
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.23 BSGtouch - Pembayaran PBB
- **Description**: Claims service: BSGtouch - Pembayaran PBB
- **Sort Order**: 23
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.24 BSGtouch - Pembayaran Samsat
- **Description**: Claims service: BSGtouch - Pembayaran Samsat
- **Sort Order**: 24
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.25 BSGtouch - Pembayaran Tagihan BPJS
- **Description**: Claims service: BSGtouch - Pembayaran Tagihan BPJS
- **Sort Order**: 25
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.26 BSGtouch - Pembayaran Tagihan Kartu Halo
- **Description**: Claims service: BSGtouch - Pembayaran Tagihan Kartu Halo
- **Sort Order**: 26
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.27 BSGtouch - Pembayaran Tagihan PDAM
- **Description**: Claims service: BSGtouch - Pembayaran Tagihan PDAM
- **Sort Order**: 27
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 5

**Dynamic Fields Configuration**:

1. **nama_nasabah** (Nama Nasabah)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Nama lengkap nasabah
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **nomor_rekening** (Nomor Rekening)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Nomor rekening nasabah
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **nomor_hp** (Nomor HP Terdaftar)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 3
   - **Placeholder**: Nomor HP yang terdaftar di BSGTouch
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

4. **nominal_transaksi** (Nominal Transaksi)
   - **Type**: number
   - **Required**: No
   - **Sort Order**: 4
   - **Placeholder**: Nominal transaksi (jika ada)
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

5. **waktu_kejadian** (Waktu Kejadian)
   - **Type**: datetime
   - **Required**: Yes
   - **Sort Order**: 5
   - **Placeholder**: Kapan masalah terjadi
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None


#### 2.28 BSGtouch - Pembayaran Tagihan PLN
- **Description**: Claims service: BSGtouch - Pembayaran Tagihan PLN
- **Sort Order**: 28
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.29 BSGtouch - Pembayaran Tagihan PSTN
- **Description**: Claims service: BSGtouch - Pembayaran Tagihan PSTN
- **Sort Order**: 29
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.30 BSGTouch - Pembelian Pulsa Indosat
- **Description**: Claims service: BSGTouch - Pembelian Pulsa Indosat
- **Sort Order**: 30
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.31 BSGTouch - Pembelian Pulsa Telkomsel
- **Description**: Claims service: BSGTouch - Pembelian Pulsa Telkomsel
- **Sort Order**: 31
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 5

**Dynamic Fields Configuration**:

1. **nama_nasabah** (Nama Nasabah)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Nama lengkap nasabah
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **nomor_rekening** (Nomor Rekening)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Nomor rekening nasabah
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **nomor_hp** (Nomor HP Terdaftar)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 3
   - **Placeholder**: Nomor HP yang terdaftar di BSGTouch
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

4. **nominal_transaksi** (Nominal Transaksi)
   - **Type**: number
   - **Required**: No
   - **Sort Order**: 4
   - **Placeholder**: Nominal transaksi (jika ada)
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

5. **waktu_kejadian** (Waktu Kejadian)
   - **Type**: datetime
   - **Required**: Yes
   - **Sort Order**: 5
   - **Placeholder**: Kapan masalah terjadi
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None


#### 2.32 BSGTouch - Pembelian Pulsa Three
- **Description**: Claims service: BSGTouch - Pembelian Pulsa Three
- **Sort Order**: 32
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 5

**Dynamic Fields Configuration**:

1. **nama_nasabah** (Nama Nasabah)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Nama lengkap nasabah
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **nomor_rekening** (Nomor Rekening)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Nomor rekening nasabah
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **nomor_hp** (Nomor HP Terdaftar)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 3
   - **Placeholder**: Nomor HP yang terdaftar di BSGTouch
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

4. **nominal_transaksi** (Nominal Transaksi)
   - **Type**: number
   - **Required**: No
   - **Sort Order**: 4
   - **Placeholder**: Nominal transaksi (jika ada)
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

5. **waktu_kejadian** (Waktu Kejadian)
   - **Type**: datetime
   - **Required**: Yes
   - **Sort Order**: 5
   - **Placeholder**: Kapan masalah terjadi
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None


#### 2.33 BSGTouch - Pembelian Pulsa XL
- **Description**: Claims service: BSGTouch - Pembelian Pulsa XL
- **Sort Order**: 33
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.34 BSGTouch - Pembelian Token PLN
- **Description**: Claims service: BSGTouch - Pembelian Token PLN
- **Sort Order**: 34
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.35 BSGTouch - Top-Up BSGcash
- **Description**: Claims service: BSGTouch - Top-Up BSGcash
- **Sort Order**: 35
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.36 BSGTouch - Transfer Antar Bank
- **Description**: Claims service: BSGTouch - Transfer Antar Bank
- **Sort Order**: 36
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 5

**Dynamic Fields Configuration**:

1. **nama_nasabah** (Nama Nasabah)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Nama lengkap nasabah
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **nomor_rekening** (Nomor Rekening)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Nomor rekening nasabah
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **nomor_hp** (Nomor HP Terdaftar)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 3
   - **Placeholder**: Nomor HP yang terdaftar di BSGTouch
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

4. **nominal_transaksi** (Nominal Transaksi)
   - **Type**: number
   - **Required**: No
   - **Sort Order**: 4
   - **Placeholder**: Nominal transaksi (jika ada)
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

5. **waktu_kejadian** (Waktu Kejadian)
   - **Type**: datetime
   - **Required**: Yes
   - **Sort Order**: 5
   - **Placeholder**: Kapan masalah terjadi
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None


#### 2.37 Keamanan Informasi
- **Description**: Claims service: Keamanan Informasi
- **Sort Order**: 37
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.38 Samsat - Error Transaksi
- **Description**: Claims service: Samsat - Error Transaksi
- **Sort Order**: 38
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.39 SMSBanking-Pembayaran PBB
- **Description**: Claims service: SMSBanking-Pembayaran PBB
- **Sort Order**: 39
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.40 SMSBanking-Pembayaran Samsat
- **Description**: Claims service: SMSBanking-Pembayaran Samsat
- **Sort Order**: 40
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.41 SMSBanking-Pembayaran Tagihan BigTV
- **Description**: Claims service: SMSBanking-Pembayaran Tagihan BigTV
- **Sort Order**: 41
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.42 SMSBanking-Pembayaran Tagihan Kartu Halo
- **Description**: Claims service: SMSBanking-Pembayaran Tagihan Kartu Halo
- **Sort Order**: 42
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.43 SMSBanking-Pembayaran Tagihan PLN
- **Description**: Claims service: SMSBanking-Pembayaran Tagihan PLN
- **Sort Order**: 43
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.44 SMSBanking-Pembayaran Tagihan PSTN
- **Description**: Claims service: SMSBanking-Pembayaran Tagihan PSTN
- **Sort Order**: 44
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.45 SMSBanking-Pembelian Pulsa Indosat
- **Description**: Claims service: SMSBanking-Pembelian Pulsa Indosat
- **Sort Order**: 45
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.46 SMSBanking-Pembelian Pulsa Telkomsel
- **Description**: Claims service: SMSBanking-Pembelian Pulsa Telkomsel
- **Sort Order**: 46
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 4

**Dynamic Fields Configuration**:

1. **nama_nasabah** (Nama Nasabah)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Nama lengkap nasabah
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **nomor_hp** (Nomor HP)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Nomor HP yang terdaftar
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **kode_transaksi** (Kode Transaksi)
   - **Type**: text
   - **Required**: No
   - **Sort Order**: 3
   - **Placeholder**: Kode transaksi yang digunakan
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

4. **waktu_transaksi** (Waktu Transaksi)
   - **Type**: datetime
   - **Required**: Yes
   - **Sort Order**: 4
   - **Placeholder**: Kapan transaksi dilakukan
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None


#### 2.47 SMSBanking-Pembelian Pulsa Three
- **Description**: Claims service: SMSBanking-Pembelian Pulsa Three
- **Sort Order**: 47
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.48 SMSBanking-Pembelian Pulsa XL
- **Description**: Claims service: SMSBanking-Pembelian Pulsa XL
- **Sort Order**: 48
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 4

**Dynamic Fields Configuration**:

1. **nama_nasabah** (Nama Nasabah)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Nama lengkap nasabah
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **nomor_hp** (Nomor HP)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Nomor HP yang terdaftar
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **kode_transaksi** (Kode Transaksi)
   - **Type**: text
   - **Required**: No
   - **Sort Order**: 3
   - **Placeholder**: Kode transaksi yang digunakan
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

4. **waktu_transaksi** (Waktu Transaksi)
   - **Type**: datetime
   - **Required**: Yes
   - **Sort Order**: 4
   - **Placeholder**: Kapan transaksi dilakukan
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None


#### 2.49 SMSBanking-Pembelian Token PLN
- **Description**: Claims service: SMSBanking-Pembelian Token PLN
- **Sort Order**: 49
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.50 SMSBanking-Transfer Bank Lain
- **Description**: Claims service: SMSBanking-Transfer Bank Lain
- **Sort Order**: 50
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.51 SMSBanking-Transfer Bank Lain >75 Hari
- **Description**: Claims service: SMSBanking-Transfer Bank Lain >75 Hari
- **Sort Order**: 51
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.52 Teller App-Pembayaran Samsat
- **Description**: Claims service: Teller App-Pembayaran Samsat
- **Sort Order**: 52
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.53 Teller App / Reporting - Gagal Transaksi
- **Description**: Claims service: Teller App / Reporting - Gagal Transaksi
- **Sort Order**: 53
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.54 Hasil Rekonsiliasi
- **Description**: Claims service: Hasil Rekonsiliasi
- **Sort Order**: 54
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.55 Permintaan - Penyelesaian Selisih ATM
- **Description**: Claims service: Permintaan - Penyelesaian Selisih ATM
- **Sort Order**: 55
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.56 Permintaan - Upload Data DHN
- **Description**: Claims service: Permintaan - Upload Data DHN
- **Sort Order**: 56
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 2.57 Permintaan Data Softcopy Rekening Koran
- **Description**: Claims service: Permintaan Data Softcopy Rekening Koran
- **Sort Order**: 57
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


### 3. CORE BANKING & FINANCIAL SYSTEMS
**Description**: Services for core financial platforms and specialized financial applications  
**Service Type**: business_service  
**Service Items**: 58


#### 3.1 OLIBs - BE Error
- **Description**: OLIBS service request: OLIBs - BE Error
- **Sort Order**: 1
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 5

**Dynamic Fields Configuration**:

1. **nama_lengkap** (Nama Lengkap)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Nama lengkap user
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **nip_pegawai** (NIP/ID Pegawai)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Nomor Induk Pegawai
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **jabatan** (Jabatan)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 3
   - **Placeholder**: Jabatan pegawai
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

4. **unit_kerja** (Unit Kerja/Cabang)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 4
   - **Placeholder**: Unit kerja atau cabang
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

5. **tanggal_berlaku** (Tanggal Berlaku)
   - **Type**: date
   - **Required**: Yes
   - **Sort Order**: 5
   - **Placeholder**: Tanggal berlaku perubahan
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None


#### 3.2 OLIBs - Buka Blokir
- **Description**: OLIBS service request: OLIBs - Buka Blokir
- **Sort Order**: 2
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 5

**Dynamic Fields Configuration**:

1. **nama_lengkap** (Nama Lengkap)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Nama lengkap user
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **nip_pegawai** (NIP/ID Pegawai)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Nomor Induk Pegawai
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **jabatan** (Jabatan)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 3
   - **Placeholder**: Jabatan pegawai
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

4. **unit_kerja** (Unit Kerja/Cabang)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 4
   - **Placeholder**: Unit kerja atau cabang
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

5. **tanggal_berlaku** (Tanggal Berlaku)
   - **Type**: date
   - **Required**: Yes
   - **Sort Order**: 5
   - **Placeholder**: Tanggal berlaku perubahan
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None


#### 3.3 OLIBs - Error Deposito
- **Description**: OLIBS service request: OLIBs - Error Deposito
- **Sort Order**: 3
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 5

**Dynamic Fields Configuration**:

1. **nama_lengkap** (Nama Lengkap)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Nama lengkap user
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **nip_pegawai** (NIP/ID Pegawai)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Nomor Induk Pegawai
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **jabatan** (Jabatan)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 3
   - **Placeholder**: Jabatan pegawai
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

4. **unit_kerja** (Unit Kerja/Cabang)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 4
   - **Placeholder**: Unit kerja atau cabang
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

5. **tanggal_berlaku** (Tanggal Berlaku)
   - **Type**: date
   - **Required**: Yes
   - **Sort Order**: 5
   - **Placeholder**: Tanggal berlaku perubahan
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None


#### 3.4 OLIBs - Error Giro
- **Description**: OLIBS service request: OLIBs - Error Giro
- **Sort Order**: 4
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 5

**Dynamic Fields Configuration**:

1. **nama_lengkap** (Nama Lengkap)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Nama lengkap user
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **nip_pegawai** (NIP/ID Pegawai)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Nomor Induk Pegawai
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **jabatan** (Jabatan)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 3
   - **Placeholder**: Jabatan pegawai
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

4. **unit_kerja** (Unit Kerja/Cabang)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 4
   - **Placeholder**: Unit kerja atau cabang
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

5. **tanggal_berlaku** (Tanggal Berlaku)
   - **Type**: date
   - **Required**: Yes
   - **Sort Order**: 5
   - **Placeholder**: Tanggal berlaku perubahan
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None


#### 3.5 OLIBs - Error Kredit
- **Description**: OLIBS service request: OLIBs - Error Kredit
- **Sort Order**: 5
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 5

**Dynamic Fields Configuration**:

1. **nama_lengkap** (Nama Lengkap)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Nama lengkap user
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **nip_pegawai** (NIP/ID Pegawai)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Nomor Induk Pegawai
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **jabatan** (Jabatan)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 3
   - **Placeholder**: Jabatan pegawai
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

4. **unit_kerja** (Unit Kerja/Cabang)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 4
   - **Placeholder**: Unit kerja atau cabang
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

5. **tanggal_berlaku** (Tanggal Berlaku)
   - **Type**: date
   - **Required**: Yes
   - **Sort Order**: 5
   - **Placeholder**: Tanggal berlaku perubahan
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None


#### 3.6 OLIBs - Error PRK
- **Description**: OLIBS service request: OLIBs - Error PRK
- **Sort Order**: 6
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.7 OLIBs - Error Tabungan
- **Description**: OLIBS service request: OLIBs - Error Tabungan
- **Sort Order**: 7
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.8 OLIBs - Error User
- **Description**: OLIBS service request: OLIBs - Error User
- **Sort Order**: 8
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.9 OLIBs - FE Error
- **Description**: OLIBS service request: OLIBs - FE Error
- **Sort Order**: 9
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.10 OLIBs - Gagal Close Operasional
- **Description**: OLIBS service request: OLIBs - Gagal Close Operasional
- **Sort Order**: 10
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.11 OLIBs - Mutasi User Pegawai
- **Description**: OLIBS service request: OLIBs - Mutasi User Pegawai
- **Sort Order**: 11
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.12 OLIBs - Non Aktif User
- **Description**: OLIBS service request: OLIBs - Non Aktif User
- **Sort Order**: 12
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.13 OLIBs - Override Password
- **Description**: OLIBS service request: OLIBs - Override Password
- **Sort Order**: 13
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.14 OLIBs - Pendaftaran User Baru
- **Description**: OLIBS service request: OLIBs - Pendaftaran User Baru
- **Sort Order**: 14
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 6

**Dynamic Fields Configuration**:

1. **nama_lengkap** (Nama Lengkap)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Masukkan nama lengkap pengguna
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **nip** (NIP (Nomor Induk Pegawai))
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Masukkan NIP
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **jabatan** (Jabatan)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 3
   - **Placeholder**: Masukkan jabatan
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

4. **unit_kerja** (Unit Kerja)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 4
   - **Placeholder**: Masukkan unit kerja
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

5. **jenis_akses** (Jenis Akses yang Diperlukan)
   - **Type**: dropdown
   - **Required**: Yes
   - **Sort Order**: 5
   - **Placeholder**: None
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: [{"label":"View Only","value":"view_only","sortOrder":1},{"label":"Input Transaksi","value":"input_transaksi","sortOrder":2},{"label":"Supervisor/Approval","value":"supervisor","sortOrder":3}]

6. **modul_akses** (Modul yang Diakses)
   - **Type**: dropdown
   - **Required**: Yes
   - **Sort Order**: 6
   - **Placeholder**: Pilih modul yang dibutuhkan
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: [{"label":"Modul Tabungan","value":"tabungan","sortOrder":1},{"label":"Modul Deposito","value":"deposito","sortOrder":2},{"label":"Modul Kredit","value":"kredit","sortOrder":3},{"label":"Modul Giro","value":"giro","sortOrder":4},{"label":"Modul Report/Laporan","value":"report","sortOrder":5},{"label":"Semua Modul","value":"all","sortOrder":6}]


#### 3.15 OLIBs - Perubahan Menu dan Limit Transaksi
- **Description**: OLIBS service request: OLIBs - Perubahan Menu dan Limit Transaksi
- **Sort Order**: 15
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.16 OLIBs - Selisih Pembukuan
- **Description**: OLIBS service request: OLIBs - Selisih Pembukuan
- **Sort Order**: 16
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.17 Kasda Online - Error Approval Maker
- **Description**: KASDA service request: Kasda Online - Error Approval Maker
- **Sort Order**: 17
- **Request Type**: service_request
- **KASDA Related**: Yes
- **Dynamic Fields**: 0


#### 3.18 Kasda Online - Error Approval Transaksi
- **Description**: KASDA service request: Kasda Online - Error Approval Transaksi
- **Sort Order**: 18
- **Request Type**: service_request
- **KASDA Related**: Yes
- **Dynamic Fields**: 0


#### 3.19 Kasda Online - Error Cek Transaksi/Saldo Rekening
- **Description**: KASDA service request: Kasda Online - Error Cek Transaksi/Saldo Rekening
- **Sort Order**: 19
- **Request Type**: service_request
- **KASDA Related**: Yes
- **Dynamic Fields**: 0


#### 3.20 Kasda Online - Error Lainnya
- **Description**: KASDA service request: Kasda Online - Error Lainnya
- **Sort Order**: 20
- **Request Type**: service_request
- **KASDA Related**: Yes
- **Dynamic Fields**: 0


#### 3.21 Kasda Online - Error Login
- **Description**: KASDA service request: Kasda Online - Error Login
- **Sort Order**: 21
- **Request Type**: service_request
- **KASDA Related**: Yes
- **Dynamic Fields**: 0


#### 3.22 Kasda Online - Error Permintaan Token Transaksi
- **Description**: KASDA service request: Kasda Online - Error Permintaan Token Transaksi
- **Sort Order**: 22
- **Request Type**: service_request
- **KASDA Related**: Yes
- **Dynamic Fields**: 0


#### 3.23 Kasda Online - Error Tarik Data SP2D (Kasda FMIS)
- **Description**: KASDA service request: Kasda Online - Error Tarik Data SP2D (Kasda FMIS)
- **Sort Order**: 23
- **Request Type**: service_request
- **KASDA Related**: Yes
- **Dynamic Fields**: 0


#### 3.24 Kasda Online - Gagal Pembayaran
- **Description**: KASDA service request: Kasda Online - Gagal Pembayaran
- **Sort Order**: 24
- **Request Type**: service_request
- **KASDA Related**: Yes
- **Dynamic Fields**: 0


#### 3.25 Kasda Online - Gagal Transfer
- **Description**: KASDA service request: Kasda Online - Gagal Transfer
- **Sort Order**: 25
- **Request Type**: service_request
- **KASDA Related**: Yes
- **Dynamic Fields**: 0


#### 3.26 Kasda Online BUD - Error
- **Description**: KASDA service request: Kasda Online BUD - Error
- **Sort Order**: 26
- **Request Type**: service_request
- **KASDA Related**: Yes
- **Dynamic Fields**: 0


#### 3.27 Kasda Online - User Management
- **Description**: KASDA service request: Kasda Online - User Management
- **Sort Order**: 27
- **Request Type**: service_request
- **KASDA Related**: Yes
- **Dynamic Fields**: 0


#### 3.28 Antasena - Error Proses Aplikasi
- **Description**: Specialized financial system service: Antasena - Error Proses Aplikasi
- **Sort Order**: 28
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 6

**Dynamic Fields Configuration**:

1. **nama_pelapor** (Nama Pelapor)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Nama lengkap pelapor
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **unit_cabang** (Unit/Cabang)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Unit atau cabang pelapor
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **nomor_kontak** (Nomor Kontak)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 3
   - **Placeholder**: Nomor HP/telepon
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

4. **waktu_kejadian** (Waktu Kejadian)
   - **Type**: datetime
   - **Required**: Yes
   - **Sort Order**: 4
   - **Placeholder**: Kapan masalah terjadi
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

5. **ip_address** (IP Address/Server)
   - **Type**: text
   - **Required**: No
   - **Sort Order**: 5
   - **Placeholder**: IP address atau nama server
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

6. **error_message** (Pesan Error)
   - **Type**: textarea
   - **Required**: No
   - **Sort Order**: 6
   - **Placeholder**: Pesan error yang muncul
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None


#### 3.29 Antasena - Pendaftaran User
- **Description**: Specialized financial system service: Antasena - Pendaftaran User
- **Sort Order**: 29
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.30 Antasena - Reset Password
- **Description**: Specialized financial system service: Antasena - Reset Password
- **Sort Order**: 30
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.31 Antasena - User Expire
- **Description**: Specialized financial system service: Antasena - User Expire
- **Sort Order**: 31
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.32 BI Fast - Error
- **Description**: Specialized financial system service: BI Fast - Error
- **Sort Order**: 32
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.33 BI RTGS - Error Aplikasi
- **Description**: Specialized financial system service: BI RTGS - Error Aplikasi
- **Sort Order**: 33
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.34 Brocade (Broker) - Mutasi User
- **Description**: Specialized financial system service: Brocade (Broker) - Mutasi User
- **Sort Order**: 34
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.35 Brocade (Broker) - Pendaftaran User Baru
- **Description**: Specialized financial system service: Brocade (Broker) - Pendaftaran User Baru
- **Sort Order**: 35
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.36 Brocade (Broker) - Perubahan User
- **Description**: Specialized financial system service: Brocade (Broker) - Perubahan User
- **Sort Order**: 36
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.37 Brocade (Broker) - Reset Password
- **Description**: Specialized financial system service: Brocade (Broker) - Reset Password
- **Sort Order**: 37
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.38 BSG sprint TNP - Error
- **Description**: Specialized financial system service: BSG sprint TNP - Error
- **Sort Order**: 38
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.39 BSGbrocade - Error
- **Description**: Specialized financial system service: BSGbrocade - Error
- **Sort Order**: 39
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.40 Error GoAML - Error Proses
- **Description**: Specialized financial system service: Error GoAML - Error Proses
- **Sort Order**: 40
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.41 Finnet - Error
- **Description**: Specialized financial system service: Finnet - Error
- **Sort Order**: 41
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.42 MPN - Error Transaksi
- **Description**: Specialized financial system service: MPN - Error Transaksi
- **Sort Order**: 42
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.43 PSAK 71 - Error Aplikasi
- **Description**: Specialized financial system service: PSAK 71 - Error Aplikasi
- **Sort Order**: 43
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.44 Report Viewer 724 - Error
- **Description**: Specialized financial system service: Report Viewer 724 - Error
- **Sort Order**: 44
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.45 Report Viewer 724 - Selisih
- **Description**: Specialized financial system service: Report Viewer 724 - Selisih
- **Sort Order**: 45
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.46 SIKP - Error
- **Description**: Specialized financial system service: SIKP - Error
- **Sort Order**: 46
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.47 SIKP - Error Aplikasi
- **Description**: Specialized financial system service: SIKP - Error Aplikasi
- **Sort Order**: 47
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.48 SIKP - Pendaftaran user
- **Description**: Specialized financial system service: SIKP - Pendaftaran user
- **Sort Order**: 48
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.49 SKNBI - Error Aplikasi
- **Description**: Specialized financial system service: SKNBI - Error Aplikasi
- **Sort Order**: 49
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.50 SKNBI - Mutasi User
- **Description**: Specialized financial system service: SKNBI - Mutasi User
- **Sort Order**: 50
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.51 SKNBI - Pendaftaran User
- **Description**: Specialized financial system service: SKNBI - Pendaftaran User
- **Sort Order**: 51
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.52 SKNBI - Perubahan User
- **Description**: Specialized financial system service: SKNBI - Perubahan User
- **Sort Order**: 52
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.53 SKNBI - Reset Password
- **Description**: Specialized financial system service: SKNBI - Reset Password
- **Sort Order**: 53
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.54 SLIK - Error
- **Description**: Specialized financial system service: SLIK - Error
- **Sort Order**: 54
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.55 Switching - Error Transaksi
- **Description**: Specialized financial system service: Switching - Error Transaksi
- **Sort Order**: 55
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.56 Switching - Permintaan Pendaftaran Prefiks Bank
- **Description**: Specialized financial system service: Switching - Permintaan Pendaftaran Prefiks Bank
- **Sort Order**: 56
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.57 Switching - Permintaan Penghapusan Prefiks Bank
- **Description**: Specialized financial system service: Switching - Permintaan Penghapusan Prefiks Bank
- **Sort Order**: 57
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 3.58 Switching - Permintaan Penyesuaian Prefiks Bank
- **Description**: Specialized financial system service: Switching - Permintaan Penyesuaian Prefiks Bank
- **Sort Order**: 58
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


### 4. CORPORATE IT & EMPLOYEE SUPPORT
**Description**: Internal IT services that support employees and corporate functions  
**Service Type**: technical_service  
**Service Items**: 75


#### 4.1 Digital Dashboard - Mutasi user
- **Description**: Corporate IT service: Digital Dashboard - Mutasi user
- **Sort Order**: 1
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.2 Digital Dashboard - Pendaftaran User
- **Description**: Corporate IT service: Digital Dashboard - Pendaftaran User
- **Sort Order**: 2
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.3 Digital Dashboard - Perpanjangan Masa Berlaku
- **Description**: Corporate IT service: Digital Dashboard - Perpanjangan Masa Berlaku
- **Sort Order**: 3
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.4 Digital Dashboard - Perubahan User
- **Description**: Corporate IT service: Digital Dashboard - Perubahan User
- **Sort Order**: 4
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.5 Digital Dashboard - Reset Password User
- **Description**: Corporate IT service: Digital Dashboard - Reset Password User
- **Sort Order**: 5
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.6 Domain - Pendaftaran/Perubahan User
- **Description**: Corporate IT service: Domain - Pendaftaran/Perubahan User
- **Sort Order**: 6
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.7 Domain - Reset Password
- **Description**: Corporate IT service: Domain - Reset Password
- **Sort Order**: 7
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.8 eLOS - Mutasi User
- **Description**: Corporate IT service: eLOS - Mutasi User
- **Sort Order**: 8
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.9 eLOS - Pendaftaran Akses VPN
- **Description**: Corporate IT service: eLOS - Pendaftaran Akses VPN
- **Sort Order**: 9
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.10 eLOS - Pendaftaran User
- **Description**: Corporate IT service: eLOS - Pendaftaran User
- **Sort Order**: 10
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.11 eLOS - Perubahan User
- **Description**: Corporate IT service: eLOS - Perubahan User
- **Sort Order**: 11
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.12 eLOS - Reset Akses User
- **Description**: Corporate IT service: eLOS - Reset Akses User
- **Sort Order**: 12
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.13 eLOS - Reset Password User
- **Description**: Corporate IT service: eLOS - Reset Password User
- **Sort Order**: 13
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.14 Ms. Office 365 - Pendaftaran Email Baru
- **Description**: Corporate IT service: Ms. Office 365 - Pendaftaran Email Baru
- **Sort Order**: 14
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.15 Ms. Office 365 - Reset Password
- **Description**: Corporate IT service: Ms. Office 365 - Reset Password
- **Sort Order**: 15
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.16 Payroll - Pendaftaran User
- **Description**: Corporate IT service: Payroll - Pendaftaran User
- **Sort Order**: 16
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.17 Payroll - Perubahan User
- **Description**: Corporate IT service: Payroll - Perubahan User
- **Sort Order**: 17
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.18 Payroll - Reset Batas Koneksi
- **Description**: Corporate IT service: Payroll - Reset Batas Koneksi
- **Sort Order**: 18
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.19 Portal - IT Hepldesk - Pendaftaran User
- **Description**: Corporate IT service: Portal - IT Hepldesk - Pendaftaran User
- **Sort Order**: 19
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.20 XReport - Pendaftaran User Baru
- **Description**: Corporate IT service: XReport - Pendaftaran User Baru
- **Sort Order**: 20
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.21 ARS73 - Error Aplikasi
- **Description**: Corporate IT service: ARS73 - Error Aplikasi
- **Sort Order**: 21
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.22 ARS73 - Mutasi User
- **Description**: Corporate IT service: ARS73 - Mutasi User
- **Sort Order**: 22
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.23 ARS73 - Pendaftaran User Baru
- **Description**: Corporate IT service: ARS73 - Pendaftaran User Baru
- **Sort Order**: 23
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.24 ARS73 - Perubahan User
- **Description**: Corporate IT service: ARS73 - Perubahan User
- **Sort Order**: 24
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.25 ARS73 -Buka Blokir
- **Description**: Corporate IT service: ARS73 -Buka Blokir
- **Sort Order**: 25
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.26 E-Dapem - Error Transaksi
- **Description**: Corporate IT service: E-Dapem - Error Transaksi
- **Sort Order**: 26
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.27 Error - Error Middleware
- **Description**: Corporate IT service: Error - Error Middleware
- **Sort Order**: 27
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.28 Error - Rintis PaymentProd
- **Description**: Corporate IT service: Error - Rintis PaymentProd
- **Sort Order**: 28
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.29 Error Aplikasi
- **Description**: Corporate IT service: Error Aplikasi
- **Sort Order**: 29
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.30 HRMS - Gagal Koneksi
- **Description**: Corporate IT service: HRMS - Gagal Koneksi
- **Sort Order**: 30
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.31 HRMS - Pengaktifan dan Reset Password User
- **Description**: Corporate IT service: HRMS - Pengaktifan dan Reset Password User
- **Sort Order**: 31
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.32 HRMS - Perubahan IP PC
- **Description**: Corporate IT service: HRMS - Perubahan IP PC
- **Sort Order**: 32
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.33 HRMS - User Error
- **Description**: Corporate IT service: HRMS - User Error
- **Sort Order**: 33
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.34 KMS - Reset Password
- **Description**: Corporate IT service: KMS - Reset Password
- **Sort Order**: 34
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.35 MIS - Error MIS
- **Description**: Corporate IT service: MIS - Error MIS
- **Sort Order**: 35
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.36 Ms. Office 365 - Error
- **Description**: Corporate IT service: Ms. Office 365 - Error
- **Sort Order**: 36
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 4

**Dynamic Fields Configuration**:

1. **nama_pegawai** (Nama Pegawai)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Nama lengkap pegawai
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **nip** (NIP)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Nomor Induk Pegawai
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **unit_kerja** (Unit Kerja)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 3
   - **Placeholder**: Unit kerja/departemen
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

4. **jenis_permintaan** (Jenis Permintaan)
   - **Type**: dropdown
   - **Required**: Yes
   - **Sort Order**: 4
   - **Placeholder**: Pilih jenis permintaan
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: [{"label":"Pembuatan Akun Baru","value":"akun_baru","sortOrder":1},{"label":"Reset Password","value":"reset_password","sortOrder":2},{"label":"Perubahan Hak Akses","value":"perubahan_akses","sortOrder":3},{"label":"Nonaktifkan Akun","value":"nonaktif_akun","sortOrder":4}]


#### 4.37 OBOX - Error Aplikasi
- **Description**: Corporate IT service: OBOX - Error Aplikasi
- **Sort Order**: 37
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.38 Payroll - Error Proses
- **Description**: Corporate IT service: Payroll - Error Proses
- **Sort Order**: 38
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.39 Teller App / Reporting - Gagal Connect
- **Description**: Corporate IT service: Teller App / Reporting - Gagal Connect
- **Sort Order**: 39
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.40 Teller App / Reporting - Mutasi User
- **Description**: Corporate IT service: Teller App / Reporting - Mutasi User
- **Sort Order**: 40
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.41 Teller App / Reporting - Pendaftaran User Baru
- **Description**: Corporate IT service: Teller App / Reporting - Pendaftaran User Baru
- **Sort Order**: 41
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.42 Teller App / Reporting - Perubahan User
- **Description**: Corporate IT service: Teller App / Reporting - Perubahan User
- **Sort Order**: 42
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.43 Teller App / Reporting - Reset Batas Koneksi
- **Description**: Corporate IT service: Teller App / Reporting - Reset Batas Koneksi
- **Sort Order**: 43
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.44 XCARD - Buka Blokir dan Reset Password
- **Description**: Corporate IT service: XCARD - Buka Blokir dan Reset Password
- **Sort Order**: 44
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.45 XCARD - Error Aplikasi
- **Description**: Corporate IT service: XCARD - Error Aplikasi
- **Sort Order**: 45
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.46 XCARD - Mutasi User
- **Description**: Corporate IT service: XCARD - Mutasi User
- **Sort Order**: 46
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.47 XCARD - Pendaftaran User Baru
- **Description**: Corporate IT service: XCARD - Pendaftaran User Baru
- **Sort Order**: 47
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.48 XCARD - Penggantian PIN
- **Description**: Corporate IT service: XCARD - Penggantian PIN
- **Sort Order**: 48
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.49 XCARD - Perubahan Menu
- **Description**: Corporate IT service: XCARD - Perubahan Menu
- **Sort Order**: 49
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.50 XLink - Error
- **Description**: Corporate IT service: XLink - Error
- **Sort Order**: 50
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.51 XMonitoring ATM - Buka Blokir & Reset Password
- **Description**: Corporate IT service: XMonitoring ATM - Buka Blokir & Reset Password
- **Sort Order**: 51
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.52 XMonitoring ATM - Error Aplikasi
- **Description**: Corporate IT service: XMonitoring ATM - Error Aplikasi
- **Sort Order**: 52
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.53 XMonitoring ATM - Mutasi User
- **Description**: Corporate IT service: XMonitoring ATM - Mutasi User
- **Sort Order**: 53
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.54 XMonitoring ATM - Pendaftaran User
- **Description**: Corporate IT service: XMonitoring ATM - Pendaftaran User
- **Sort Order**: 54
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.55 XMonitoring ATM - Perubahan User
- **Description**: Corporate IT service: XMonitoring ATM - Perubahan User
- **Sort Order**: 55
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.56 Gangguan Ekstranet BI
- **Description**: Corporate IT service: Gangguan Ekstranet BI
- **Sort Order**: 56
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.57 Gangguan Internet
- **Description**: Corporate IT service: Gangguan Internet
- **Sort Order**: 57
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.58 Gangguan LAN
- **Description**: Corporate IT service: Gangguan LAN
- **Sort Order**: 58
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.59 Gangguan WAN
- **Description**: Corporate IT service: Gangguan WAN
- **Sort Order**: 59
- **Request Type**: incident
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.60 Maintenance Komputer
- **Description**: Corporate IT service: Maintenance Komputer
- **Sort Order**: 60
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.61 Memo ke Divisi TI
- **Description**: Corporate IT service: Memo ke Divisi TI
- **Sort Order**: 61
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.62 Network - Permintaan Pemasangan Jaringan
- **Description**: Corporate IT service: Network - Permintaan Pemasangan Jaringan
- **Sort Order**: 62
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.63 Permintaan Akses Flashdisk/Harddisk/SSD
- **Description**: Corporate IT service: Permintaan Akses Flashdisk/Harddisk/SSD
- **Sort Order**: 63
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.64 Permintaan Data Lain
- **Description**: Corporate IT service: Permintaan Data Lain
- **Sort Order**: 64
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.65 Permintaan Pengembangan Aplikasi
- **Description**: Corporate IT service: Permintaan Pengembangan Aplikasi
- **Sort Order**: 65
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.66 Permintaan Perubahan Nomor PK Kredit
- **Description**: Corporate IT service: Permintaan Perubahan Nomor PK Kredit
- **Sort Order**: 66
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.67 Permintaan Softcopy RC
- **Description**: Corporate IT service: Permintaan Softcopy RC
- **Sort Order**: 67
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.68 Surat ke Divisi TI
- **Description**: Corporate IT service: Surat ke Divisi TI
- **Sort Order**: 68
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.69 Technical Problem
- **Description**: Corporate IT service: Technical Problem
- **Sort Order**: 69
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.70 Card Center - Laporan Penerimaan Kartu ATM di Cabang
- **Description**: Corporate IT service: Card Center - Laporan Penerimaan Kartu ATM di Cabang
- **Sort Order**: 70
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.71 Card Center - Laporan Penerimaan PIN ATM di Cabang
- **Description**: Corporate IT service: Card Center - Laporan Penerimaan PIN ATM di Cabang
- **Sort Order**: 71
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 5

**Dynamic Fields Configuration**:

1. **lokasi_atm** (Lokasi ATM)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Lokasi ATM (cabang/alamat)
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **nomor_kartu** (Nomor Kartu (4 digit terakhir))
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Contoh: xxxx1234
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **waktu_transaksi** (Waktu Transaksi)
   - **Type**: datetime
   - **Required**: Yes
   - **Sort Order**: 3
   - **Placeholder**: Kapan transaksi dilakukan
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

4. **nominal_transaksi** (Nominal Transaksi)
   - **Type**: number
   - **Required**: No
   - **Sort Order**: 4
   - **Placeholder**: Jumlah transaksi
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

5. **jenis_masalah** (Jenis Masalah)
   - **Type**: dropdown
   - **Required**: Yes
   - **Sort Order**: 5
   - **Placeholder**: Pilih jenis masalah
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: [{"label":"Kartu Tertelan","value":"kartu_tertelan","sortOrder":1},{"label":"Uang Tidak Keluar","value":"uang_tidak_keluar","sortOrder":2},{"label":"Struk Tidak Keluar","value":"struk_tidak_keluar","sortOrder":3},{"label":"Saldo Terpotong Tanpa Uang Keluar","value":"saldo_terpotong","sortOrder":4},{"label":"Transaksi Gagal/Error","value":"transaksi_gagal","sortOrder":5}]


#### 4.72 Card Center - Laporan Persediaan Kartu ATM
- **Description**: Corporate IT service: Card Center - Laporan Persediaan Kartu ATM
- **Sort Order**: 72
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.73 Penggantian Kartu
- **Description**: Corporate IT service: Penggantian Kartu
- **Sort Order**: 73
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.74 Penggantian PIN - Call Center
- **Description**: Corporate IT service: Penggantian PIN - Call Center
- **Sort Order**: 74
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 4.75 Penutupan Kartu
- **Description**: Corporate IT service: Penutupan Kartu
- **Sort Order**: 75
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


### 5. DIGITAL CHANNELS & CUSTOMER APPLICATIONS
**Description**: Services for all customer-facing digital applications  
**Service Type**: business_service  
**Service Items**: 26


#### 5.1 BSGTouch (Android) - Mutasi User
- **Description**: Digital channel service: BSGTouch (Android) - Mutasi User
- **Sort Order**: 1
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 5.2 BSGTouch (Android) - Pendaftaran User Baru
- **Description**: Digital channel service: BSGTouch (Android) - Pendaftaran User Baru
- **Sort Order**: 2
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 5.3 BSGTouch (Android) - Buka Blokir dan Reset Password
- **Description**: Digital channel service: BSGTouch (Android) - Buka Blokir dan Reset Password
- **Sort Order**: 3
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 5.4 BSGTouch (Android) - Error Registrasi BSGtouch
- **Description**: Digital channel service: BSGTouch (Android) - Error Registrasi BSGtouch
- **Sort Order**: 4
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 5.5 BSGTouch (Android) - Perpanjang Masa Berlaku
- **Description**: Digital channel service: BSGTouch (Android) - Perpanjang Masa Berlaku
- **Sort Order**: 5
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 5.6 BSGTouch (Android) - Perubahan User
- **Description**: Digital channel service: BSGTouch (Android) - Perubahan User
- **Sort Order**: 6
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 5.7 BSGTouch (Android/iOS) - Permintaan Pengiriman SMS Aktivasi
- **Description**: Digital channel service: BSGTouch (Android/iOS) - Permintaan Pengiriman SMS Aktivasi
- **Sort Order**: 7
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 5.8 BSGTouch (Android/Ios) - Error Aplikasi
- **Description**: Digital channel service: BSGTouch (Android/Ios) - Error Aplikasi
- **Sort Order**: 8
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 5.9 BSGTouch (iOS) - Error Registrasi BSGtouch (iOS)
- **Description**: Digital channel service: BSGTouch (iOS) - Error Registrasi BSGtouch (iOS)
- **Sort Order**: 9
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 5.10 BSGTouch (iOS) - SMS Aktivasi tidak terkirim
- **Description**: Digital channel service: BSGTouch (iOS) - SMS Aktivasi tidak terkirim
- **Sort Order**: 10
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 5.11 BSGtouch - Error Transaksi
- **Description**: Digital channel service: BSGtouch - Error Transaksi
- **Sort Order**: 11
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 5.12 BSGTouch - Penutupan Akun BSGTouch
- **Description**: Digital channel service: BSGTouch - Penutupan Akun BSGTouch
- **Sort Order**: 12
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 5.13 BSGDirect - Error Aplikasi
- **Description**: Digital channel service: BSGDirect - Error Aplikasi
- **Sort Order**: 13
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 5.14 BSGDirect - Error Transaksi
- **Description**: Digital channel service: BSGDirect - Error Transaksi
- **Sort Order**: 14
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 5.15 BSGDirect - User Management
- **Description**: Digital channel service: BSGDirect - User Management
- **Sort Order**: 15
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 5.16 SMS Banking - Error
- **Description**: Digital channel service: SMS Banking - Error
- **Sort Order**: 16
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 5.17 SMS Banking - Mutasi user
- **Description**: Digital channel service: SMS Banking - Mutasi user
- **Sort Order**: 17
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 5.18 SMS Banking - Pendaftaran User
- **Description**: Digital channel service: SMS Banking - Pendaftaran User
- **Sort Order**: 18
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 5.19 SMS Banking - Perubahan User
- **Description**: Digital channel service: SMS Banking - Perubahan User
- **Sort Order**: 19
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 5.20 SMS Banking - Reset Password
- **Description**: Digital channel service: SMS Banking - Reset Password
- **Sort Order**: 20
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 5.21 BSG QRIS - Buka Blokir & Reset Password
- **Description**: Digital channel service: BSG QRIS - Buka Blokir & Reset Password
- **Sort Order**: 21
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 5.22 BSG QRIS - Error Transaksi/Aplikasi
- **Description**: Digital channel service: BSG QRIS - Error Transaksi/Aplikasi
- **Sort Order**: 22
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 4

**Dynamic Fields Configuration**:

1. **merchant_name** (Nama Merchant)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Nama merchant QRIS
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **qris_id** (ID QRIS/Terminal)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: ID QRIS atau terminal
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

3. **nominal_transaksi** (Nominal Transaksi)
   - **Type**: number
   - **Required**: Yes
   - **Sort Order**: 3
   - **Placeholder**: Jumlah transaksi
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

4. **waktu_transaksi** (Waktu Transaksi)
   - **Type**: datetime
   - **Required**: Yes
   - **Sort Order**: 4
   - **Placeholder**: Kapan transaksi dilakukan
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None


#### 5.23 BSG QRIS - Mutasi User
- **Description**: Digital channel service: BSG QRIS - Mutasi User
- **Sort Order**: 23
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 5.24 BSG QRIS - Pendaftaran User
- **Description**: Digital channel service: BSG QRIS - Pendaftaran User
- **Sort Order**: 24
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 5.25 BSG QRIS - Perpanjang Masa Berlaku
- **Description**: Digital channel service: BSG QRIS - Perpanjang Masa Berlaku
- **Sort Order**: 25
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 5.26 BSG QRIS - Perubahan User
- **Description**: Digital channel service: BSG QRIS - Perubahan User
- **Sort Order**: 26
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


### 6. GENERAL & DEFAULT SERVICES
**Description**: Catch-all services for requests that do not fit into other categories  
**Service Type**: technical_service  
**Service Items**: 2


#### 6.1 Default Request
- **Description**: General service: Default Request
- **Sort Order**: 1
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


#### 6.2 Permintaan Lainnya
- **Description**: General service: Permintaan Lainnya
- **Sort Order**: 2
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 0


### 7. USER ACCOUNT MANAGEMENT
**Description**: Services for managing user accounts and access  
**Service Type**: technical_service  
**Service Items**: 1


#### 7.1 New Employee Account Setup
- **Description**: Create accounts for new employees across all BSG systems
- **Sort Order**: 0
- **Request Type**: service_request
- **KASDA Related**: No
- **Dynamic Fields**: 9

**Dynamic Fields Configuration**:

1. **employee_name** (Employee Full Name)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 1
   - **Placeholder**: Enter employee full name
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: None

2. **employee_id** (Employee ID)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 2
   - **Placeholder**: Enter employee ID number
   - **Default Value**: None
   - **Validation Rules**: {"pattern":"^[A-Z]{3}[0-9]{6}$","helpText":"Format: 3 letters followed by 6 digits (e.g., BSG123456)"}
   - **Options**: None

3. **department** (Department)
   - **Type**: dropdown
   - **Required**: Yes
   - **Sort Order**: 3
   - **Placeholder**: None
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: [{"label":"Information Technology","value":"it"},{"label":"Human Resources","value":"hr"},{"label":"Finance & Accounting","value":"finance"},{"label":"Operations","value":"operations"},{"label":"Marketing","value":"marketing"},{"label":"Customer Service","value":"customer_service"}]

4. **start_date** (Start Date)
   - **Type**: date
   - **Required**: Yes
   - **Sort Order**: 4
   - **Placeholder**: None
   - **Default Value**: None
   - **Validation Rules**: {"helpText":"Employee start date"}
   - **Options**: None

5. **systems_access** (Required System Access)
   - **Type**: checkbox
   - **Required**: Yes
   - **Sort Order**: 5
   - **Placeholder**: None
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: [{"label":"Email Account","value":"email"},{"label":"KASDA System","value":"kasda"},{"label":"BSGDirect","value":"bsgdirect"},{"label":"Core Banking System","value":"core_banking"},{"label":"HR Management System","value":"hr_system"},{"label":"File Share Access","value":"file_share"}]

6. **mobile_number** (Mobile Phone Number)
   - **Type**: text
   - **Required**: Yes
   - **Sort Order**: 6
   - **Placeholder**: +62-xxx-xxxx-xxxx
   - **Default Value**: None
   - **Validation Rules**: {"pattern":"^\\+62[0-9]{9,12}$"}
   - **Options**: None

7. **office_location** (Office Location)
   - **Type**: radio
   - **Required**: Yes
   - **Sort Order**: 7
   - **Placeholder**: None
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: [{"label":"Headquarters - Manado","value":"hq"},{"label":"Branch Office","value":"branch"},{"label":"Remote Worker","value":"remote"}]

8. **computer_required** (Computer Required?)
   - **Type**: radio
   - **Required**: Yes
   - **Sort Order**: 8
   - **Placeholder**: None
   - **Default Value**: None
   - **Validation Rules**: None
   - **Options**: [{"label":"Yes - Desktop","value":"yes"},{"label":"Yes - Laptop","value":"laptop"},{"label":"No - Using existing","value":"no"}]

9. **special_notes** (Special Requirements or Notes)
   - **Type**: textarea
   - **Required**: No
   - **Sort Order**: 9
   - **Placeholder**: Any special access requirements or notes
   - **Default Value**: None
   - **Validation Rules**: {"rows":4}
   - **Options**: None


---

## BSG MASTER DATA (Dropdown Options)

This section contains all dropdown options used across the system:


### 1. ACCESS_LEVEL
**Total Options**: 3

| Code | Name | Display Name | Sort Order | Active |
|------|------|--------------|------------|--------|
| view_only | View Only | View Only - Akses untuk melihat data saja | 1 | Yes |
| input_operator | Input Operator | Input Operator - Akses input transaksi harian | 2 | Yes |
| supervisor | Supervisor | Supervisor - Akses penuh termasuk approval | 3 | Yes |


### 2. ATM
**Total Options**: 163

| Code | Name | Display Name | Sort Order | Active |
|------|------|--------------|------------|--------|
| ATM_003 | BSG JAKARTA - Lobby | BSG JAKARTA - Lobby |  | Yes |
| ATM_UTAMA_001 | ATM BSG UTAMA - Lobby | ATM BSG UTAMA - Lobby |  | Yes |
| ATM_006 | AIRMADIDI - Outdoor | AIRMADIDI - Outdoor |  | Yes |
| ATM_005 | TUMINTING - Indoor | TUMINTING - Indoor |  | Yes |
| ATM_004 | KELAPA GADING - Outdoor | KELAPA GADING - Outdoor |  | Yes |
| ATM_001 | BSG UTAMA - Lobby | BSG UTAMA - Lobby |  | Yes |
| ATM_002 | BSG UTAMA - Drive Thru | BSG UTAMA - Drive Thru |  | Yes |
| ATM_UTAMA_002 | ATM BSG UTAMA - Drive Thru | ATM BSG UTAMA - Drive Thru | 1 | Yes |
| ATM_JAKARTA_001 | ATM BSG JAKARTA - Lobby | ATM BSG JAKARTA - Lobby | 2 | Yes |
| ATM_JAKARTA_002 | ATM BSG JAKARTA - Outdoor | ATM BSG JAKARTA - Outdoor | 3 | Yes |
| ATM_GORONTALO_001 | ATM BSG GORONTALO - Lobby | ATM BSG GORONTALO - Lobby | 4 | Yes |
| ATM_BITUNG_001 | ATM CABANG BITUNG - Lobby | ATM CABANG BITUNG - Lobby | 5 | Yes |
| ATM_TOMOHON_001 | ATM CABANG TOMOHON - Lobby | ATM CABANG TOMOHON - Lobby | 6 | Yes |
| ATM_KELAPA_GADING_001 | ATM CAPEM KELAPA GADING | ATM CAPEM KELAPA GADING | 7 | Yes |
| ATM_TUMINTING_001 | ATM CAPEM TUMINTING | ATM CAPEM TUMINTING | 8 | Yes |
| ATM_WENANG_001 | ATM CAPEM WENANG | ATM CAPEM WENANG | 9 | Yes |
| ATM_MANTOS_001 | ATM MANADO TOWN SQUARE - Level 1 | ATM MANADO TOWN SQUARE - Level 1 | 10 | Yes |
| ATM_MANTOS_002 | ATM MANADO TOWN SQUARE - Level 2 | ATM MANADO TOWN SQUARE - Level 2 | 11 | Yes |
| ATM_MEGA_001 | ATM MEGA MALL MANADO - Ground Floor | ATM MEGA MALL MANADO - Ground Floor | 12 | Yes |
| ATM_MEGA_002 | ATM MEGA MALL MANADO - Food Court | ATM MEGA MALL MANADO - Food Court | 13 | Yes |
| ATM_UNSRAT_001 | ATM UNIVERSITAS SAM RATULANGI | ATM UNIVERSITAS SAM RATULANGI | 14 | Yes |
| ATM_UNIMA_001 | ATM UNIVERSITAS NEGERI MANADO | ATM UNIVERSITAS NEGERI MANADO | 15 | Yes |
| ATM_RSUP_001 | ATM RSUP PROF. DR. R. D. KANDOU | ATM RSUP PROF. DR. R. D. KANDOU | 16 | Yes |
| ATM_BANDARA_001 | ATM BANDARA SAM RATULANGI - Arrival | ATM BANDARA SAM RATULANGI - Arrival | 17 | Yes |
| ATM_BANDARA_002 | ATM BANDARA SAM RATULANGI - Departure | ATM BANDARA SAM RATULANGI - Departure | 18 | Yes |
| ATM_PEMKOT_001 | ATM BALAI KOTA MANADO | ATM BALAI KOTA MANADO | 19 | Yes |
| ATM_PEMKAB_001 | ATM PEMKAB MINAHASA | ATM PEMKAB MINAHASA | 20 | Yes |
| ATM_PEMKAB_002 | ATM PEMKAB MINAHASA UTARA | ATM PEMKAB MINAHASA UTARA | 21 | Yes |
| ATM_KANWIL_001 | ATM KANWIL BRI SULUT | ATM KANWIL BRI SULUT | 22 | Yes |
| ATM_PASAR_001 | ATM PASAR BERSEHATI - Main Gate | ATM PASAR BERSEHATI - Main Gate | 23 | Yes |
| ATM_PASAR_002 | ATM PASAR BERSEHATI - Food Section | ATM PASAR BERSEHATI - Food Section | 24 | Yes |
| ATM_PASAR_KAROMBASAN_001 | ATM PASAR KAROMBASAN | ATM PASAR KAROMBASAN | 25 | Yes |
| ATM_SPBU_001 | ATM SPBU PAAL DUA | ATM SPBU PAAL DUA | 26 | Yes |
| ATM_SPBU_002 | ATM SPBU TIKALA | ATM SPBU TIKALA | 27 | Yes |
| ATM_UTAMA_003 | ATM BSG UTAMA - Unit 3 | ATM BSG UTAMA - Unit 3 | 28 | Yes |
| ATM_UTAMA_004 | ATM BSG UTAMA - Unit 4 | ATM BSG UTAMA - Unit 4 | 29 | Yes |
| ATM_UTAMA_005 | ATM BSG UTAMA - Unit 5 | ATM BSG UTAMA - Unit 5 | 30 | Yes |
| ATM_JAKARTA_003 | ATM BSG JAKARTA - Unit 3 | ATM BSG JAKARTA - Unit 3 | 31 | Yes |
| ATM_JAKARTA_004 | ATM BSG JAKARTA - Unit 4 | ATM BSG JAKARTA - Unit 4 | 32 | Yes |
| ATM_JAKARTA_005 | ATM BSG JAKARTA - Unit 5 | ATM BSG JAKARTA - Unit 5 | 33 | Yes |
| ATM_GORONTALO_003 | ATM BSG GORONTALO - Unit 3 | ATM BSG GORONTALO - Unit 3 | 34 | Yes |
| ATM_GORONTALO_004 | ATM BSG GORONTALO - Unit 4 | ATM BSG GORONTALO - Unit 4 | 35 | Yes |
| ATM_GORONTALO_005 | ATM BSG GORONTALO - Unit 5 | ATM BSG GORONTALO - Unit 5 | 36 | Yes |
| ATM_BITUNG_003 | ATM CABANG BITUNG - Unit 3 | ATM CABANG BITUNG - Unit 3 | 37 | Yes |
| ATM_BITUNG_004 | ATM CABANG BITUNG - Unit 4 | ATM CABANG BITUNG - Unit 4 | 38 | Yes |
| ATM_BITUNG_005 | ATM CABANG BITUNG - Unit 5 | ATM CABANG BITUNG - Unit 5 | 39 | Yes |
| ATM_TOMOHON_003 | ATM CABANG TOMOHON - Unit 3 | ATM CABANG TOMOHON - Unit 3 | 40 | Yes |
| ATM_TOMOHON_004 | ATM CABANG TOMOHON - Unit 4 | ATM CABANG TOMOHON - Unit 4 | 41 | Yes |
| ATM_TOMOHON_005 | ATM CABANG TOMOHON - Unit 5 | ATM CABANG TOMOHON - Unit 5 | 42 | Yes |
| ATM_KOTAMOBAGU_003 | ATM CABANG KOTAMOBAGU - Unit 3 | ATM CABANG KOTAMOBAGU - Unit 3 | 43 | Yes |
| ATM_KOTAMOBAGU_004 | ATM CABANG KOTAMOBAGU - Unit 4 | ATM CABANG KOTAMOBAGU - Unit 4 | 44 | Yes |
| ATM_KOTAMOBAGU_005 | ATM CABANG KOTAMOBAGU - Unit 5 | ATM CABANG KOTAMOBAGU - Unit 5 | 45 | Yes |
| ATM_TAHUNA_003 | ATM CABANG TAHUNA - Unit 3 | ATM CABANG TAHUNA - Unit 3 | 46 | Yes |
| ATM_TAHUNA_004 | ATM CABANG TAHUNA - Unit 4 | ATM CABANG TAHUNA - Unit 4 | 47 | Yes |
| ATM_TAHUNA_005 | ATM CABANG TAHUNA - Unit 5 | ATM CABANG TAHUNA - Unit 5 | 48 | Yes |
| ATM_MANADO_MEGA_003 | ATM CABANG MANADO MEGA MALL - Unit 3 | ATM CABANG MANADO MEGA MALL - Unit 3 | 49 | Yes |
| ATM_MANADO_MEGA_004 | ATM CABANG MANADO MEGA MALL - Unit 4 | ATM CABANG MANADO MEGA MALL - Unit 4 | 50 | Yes |
| ATM_MANADO_MEGA_005 | ATM CABANG MANADO MEGA MALL - Unit 5 | ATM CABANG MANADO MEGA MALL - Unit 5 | 51 | Yes |
| ATM_MANADO_PASAR_003 | ATM CABANG PASAR SENTRAL - Unit 3 | ATM CABANG PASAR SENTRAL - Unit 3 | 52 | Yes |
| ATM_MANADO_PASAR_004 | ATM CABANG PASAR SENTRAL - Unit 4 | ATM CABANG PASAR SENTRAL - Unit 4 | 53 | Yes |
| ATM_MANADO_PASAR_005 | ATM CABANG PASAR SENTRAL - Unit 5 | ATM CABANG PASAR SENTRAL - Unit 5 | 54 | Yes |
| ATM_TONDANO_003 | ATM CABANG TONDANO - Unit 3 | ATM CABANG TONDANO - Unit 3 | 55 | Yes |
| ATM_TONDANO_004 | ATM CABANG TONDANO - Unit 4 | ATM CABANG TONDANO - Unit 4 | 56 | Yes |
| ATM_TONDANO_005 | ATM CABANG TONDANO - Unit 5 | ATM CABANG TONDANO - Unit 5 | 57 | Yes |
| ATM_LANGOWAN_003 | ATM CABANG LANGOWAN - Unit 3 | ATM CABANG LANGOWAN - Unit 3 | 58 | Yes |
| ATM_LANGOWAN_004 | ATM CABANG LANGOWAN - Unit 4 | ATM CABANG LANGOWAN - Unit 4 | 59 | Yes |
| ATM_LANGOWAN_005 | ATM CABANG LANGOWAN - Unit 5 | ATM CABANG LANGOWAN - Unit 5 | 60 | Yes |
| ATM_AIRMADIDI_003 | ATM CABANG AIRMADIDI - Unit 3 | ATM CABANG AIRMADIDI - Unit 3 | 61 | Yes |
| ATM_AIRMADIDI_004 | ATM CABANG AIRMADIDI - Unit 4 | ATM CABANG AIRMADIDI - Unit 4 | 62 | Yes |
| ATM_AIRMADIDI_005 | ATM CABANG AIRMADIDI - Unit 5 | ATM CABANG AIRMADIDI - Unit 5 | 63 | Yes |
| ATM_MAUMERE_003 | ATM CABANG MAUMERE - Unit 3 | ATM CABANG MAUMERE - Unit 3 | 64 | Yes |
| ATM_MAUMERE_004 | ATM CABANG MAUMERE - Unit 4 | ATM CABANG MAUMERE - Unit 4 | 65 | Yes |
| ATM_MAUMERE_005 | ATM CABANG MAUMERE - Unit 5 | ATM CABANG MAUMERE - Unit 5 | 66 | Yes |
| ATM_ENDE_003 | ATM CABANG ENDE - Unit 3 | ATM CABANG ENDE - Unit 3 | 67 | Yes |
| ATM_ENDE_004 | ATM CABANG ENDE - Unit 4 | ATM CABANG ENDE - Unit 4 | 68 | Yes |
| ATM_ENDE_005 | ATM CABANG ENDE - Unit 5 | ATM CABANG ENDE - Unit 5 | 69 | Yes |
| ATM_KUPANG_003 | ATM CABANG KUPANG - Unit 3 | ATM CABANG KUPANG - Unit 3 | 70 | Yes |
| ATM_KUPANG_004 | ATM CABANG KUPANG - Unit 4 | ATM CABANG KUPANG - Unit 4 | 71 | Yes |
| ATM_KUPANG_005 | ATM CABANG KUPANG - Unit 5 | ATM CABANG KUPANG - Unit 5 | 72 | Yes |
| ATM_TERNATE_003 | ATM CABANG TERNATE - Unit 3 | ATM CABANG TERNATE - Unit 3 | 73 | Yes |
| ATM_TERNATE_004 | ATM CABANG TERNATE - Unit 4 | ATM CABANG TERNATE - Unit 4 | 74 | Yes |
| ATM_TERNATE_005 | ATM CABANG TERNATE - Unit 5 | ATM CABANG TERNATE - Unit 5 | 75 | Yes |
| ATM_AMBON_003 | ATM CABANG AMBON - Unit 3 | ATM CABANG AMBON - Unit 3 | 76 | Yes |
| ATM_AMBON_004 | ATM CABANG AMBON - Unit 4 | ATM CABANG AMBON - Unit 4 | 77 | Yes |
| ATM_AMBON_005 | ATM CABANG AMBON - Unit 5 | ATM CABANG AMBON - Unit 5 | 78 | Yes |
| ATM_SORONG_003 | ATM CABANG SORONG - Unit 3 | ATM CABANG SORONG - Unit 3 | 79 | Yes |
| ATM_SORONG_004 | ATM CABANG SORONG - Unit 4 | ATM CABANG SORONG - Unit 4 | 80 | Yes |
| ATM_SORONG_005 | ATM CABANG SORONG - Unit 5 | ATM CABANG SORONG - Unit 5 | 81 | Yes |
| ATM_JAYAPURA_003 | ATM CABANG JAYAPURA - Unit 3 | ATM CABANG JAYAPURA - Unit 3 | 82 | Yes |
| ATM_JAYAPURA_004 | ATM CABANG JAYAPURA - Unit 4 | ATM CABANG JAYAPURA - Unit 4 | 83 | Yes |
| ATM_JAYAPURA_005 | ATM CABANG JAYAPURA - Unit 5 | ATM CABANG JAYAPURA - Unit 5 | 84 | Yes |
| ATM_PALU_003 | ATM CABANG PALU - Unit 3 | ATM CABANG PALU - Unit 3 | 85 | Yes |
| ATM_PALU_004 | ATM CABANG PALU - Unit 4 | ATM CABANG PALU - Unit 4 | 86 | Yes |
| ATM_PALU_005 | ATM CABANG PALU - Unit 5 | ATM CABANG PALU - Unit 5 | 87 | Yes |
| ATM_KENDARI_003 | ATM CABANG KENDARI - Unit 3 | ATM CABANG KENDARI - Unit 3 | 88 | Yes |
| ATM_KENDARI_004 | ATM CABANG KENDARI - Unit 4 | ATM CABANG KENDARI - Unit 4 | 89 | Yes |
| ATM_KENDARI_005 | ATM CABANG KENDARI - Unit 5 | ATM CABANG KENDARI - Unit 5 | 90 | Yes |
| ATM_MAKASSAR_003 | ATM CABANG MAKASSAR - Unit 3 | ATM CABANG MAKASSAR - Unit 3 | 91 | Yes |
| ATM_MAKASSAR_004 | ATM CABANG MAKASSAR - Unit 4 | ATM CABANG MAKASSAR - Unit 4 | 92 | Yes |
| ATM_MAKASSAR_005 | ATM CABANG MAKASSAR - Unit 5 | ATM CABANG MAKASSAR - Unit 5 | 93 | Yes |
| ATM_PAREPARE_003 | ATM CABANG PAREPARE - Unit 3 | ATM CABANG PAREPARE - Unit 3 | 94 | Yes |
| ATM_PAREPARE_004 | ATM CABANG PAREPARE - Unit 4 | ATM CABANG PAREPARE - Unit 4 | 95 | Yes |
| ATM_PAREPARE_005 | ATM CABANG PAREPARE - Unit 5 | ATM CABANG PAREPARE - Unit 5 | 96 | Yes |
| ATM_BONE_003 | ATM CABANG BONE - Unit 3 | ATM CABANG BONE - Unit 3 | 97 | Yes |
| ATM_BONE_004 | ATM CABANG BONE - Unit 4 | ATM CABANG BONE - Unit 4 | 98 | Yes |
| ATM_BONE_005 | ATM CABANG BONE - Unit 5 | ATM CABANG BONE - Unit 5 | 99 | Yes |
| ATM_SURABAYA_003 | ATM CABANG SURABAYA - Unit 3 | ATM CABANG SURABAYA - Unit 3 | 100 | Yes |
| ATM_SURABAYA_004 | ATM CABANG SURABAYA - Unit 4 | ATM CABANG SURABAYA - Unit 4 | 101 | Yes |
| ATM_SURABAYA_005 | ATM CABANG SURABAYA - Unit 5 | ATM CABANG SURABAYA - Unit 5 | 102 | Yes |
| ATM_MALANG_003 | ATM CABANG MALANG - Unit 3 | ATM CABANG MALANG - Unit 3 | 103 | Yes |
| ATM_MALANG_004 | ATM CABANG MALANG - Unit 4 | ATM CABANG MALANG - Unit 4 | 104 | Yes |
| ATM_MALANG_005 | ATM CABANG MALANG - Unit 5 | ATM CABANG MALANG - Unit 5 | 105 | Yes |
| ATM_BALIKPAPAN_003 | ATM CABANG BALIKPAPAN - Unit 3 | ATM CABANG BALIKPAPAN - Unit 3 | 106 | Yes |
| ATM_BALIKPAPAN_004 | ATM CABANG BALIKPAPAN - Unit 4 | ATM CABANG BALIKPAPAN - Unit 4 | 107 | Yes |
| ATM_BALIKPAPAN_005 | ATM CABANG BALIKPAPAN - Unit 5 | ATM CABANG BALIKPAPAN - Unit 5 | 108 | Yes |
| ATM_KELAPA_GADING_003 | ATM CAPEM KELAPA GADING - Unit 3 | ATM CAPEM KELAPA GADING - Unit 3 | 109 | Yes |
| ATM_KELAPA_GADING_004 | ATM CAPEM KELAPA GADING - Unit 4 | ATM CAPEM KELAPA GADING - Unit 4 | 110 | Yes |
| ATM_TUMINTING_003 | ATM CAPEM TUMINTING - Unit 3 | ATM CAPEM TUMINTING - Unit 3 | 111 | Yes |
| ATM_TUMINTING_004 | ATM CAPEM TUMINTING - Unit 4 | ATM CAPEM TUMINTING - Unit 4 | 112 | Yes |
| ATM_WENANG_003 | ATM CAPEM WENANG - Unit 3 | ATM CAPEM WENANG - Unit 3 | 113 | Yes |
| ATM_WENANG_004 | ATM CAPEM WENANG - Unit 4 | ATM CAPEM WENANG - Unit 4 | 114 | Yes |
| ATM_MALALAYANG_003 | ATM CAPEM MALALAYANG - Unit 3 | ATM CAPEM MALALAYANG - Unit 3 | 115 | Yes |
| ATM_MALALAYANG_004 | ATM CAPEM MALALAYANG - Unit 4 | ATM CAPEM MALALAYANG - Unit 4 | 116 | Yes |
| ATM_PAAL_DUA_003 | ATM CAPEM PAAL DUA - Unit 3 | ATM CAPEM PAAL DUA - Unit 3 | 117 | Yes |
| ATM_PAAL_DUA_004 | ATM CAPEM PAAL DUA - Unit 4 | ATM CAPEM PAAL DUA - Unit 4 | 118 | Yes |
| ATM_TIKALA_003 | ATM CAPEM TIKALA - Unit 3 | ATM CAPEM TIKALA - Unit 3 | 119 | Yes |
| ATM_TIKALA_004 | ATM CAPEM TIKALA - Unit 4 | ATM CAPEM TIKALA - Unit 4 | 120 | Yes |
| ATM_WANEA_003 | ATM CAPEM WANEA - Unit 3 | ATM CAPEM WANEA - Unit 3 | 121 | Yes |
| ATM_WANEA_004 | ATM CAPEM WANEA - Unit 4 | ATM CAPEM WANEA - Unit 4 | 122 | Yes |
| ATM_WINANGUN_003 | ATM CAPEM WINANGUN - Unit 3 | ATM CAPEM WINANGUN - Unit 3 | 123 | Yes |
| ATM_WINANGUN_004 | ATM CAPEM WINANGUN - Unit 4 | ATM CAPEM WINANGUN - Unit 4 | 124 | Yes |
| ATM_KAROMBASAN_003 | ATM CAPEM KAROMBASAN - Unit 3 | ATM CAPEM KAROMBASAN - Unit 3 | 125 | Yes |
| ATM_KAROMBASAN_004 | ATM CAPEM KAROMBASAN - Unit 4 | ATM CAPEM KAROMBASAN - Unit 4 | 126 | Yes |
| ATM_WOLTER_MONGINSIDI_003 | ATM CAPEM WOLTER MONGINSIDI - Unit 3 | ATM CAPEM WOLTER MONGINSIDI - Unit 3 | 127 | Yes |
| ATM_WOLTER_MONGINSIDI_004 | ATM CAPEM WOLTER MONGINSIDI - Unit 4 | ATM CAPEM WOLTER MONGINSIDI - Unit 4 | 128 | Yes |
| ATM_KAWANGKOAN_003 | ATM CAPEM KAWANGKOAN - Unit 3 | ATM CAPEM KAWANGKOAN - Unit 3 | 129 | Yes |
| ATM_KAWANGKOAN_004 | ATM CAPEM KAWANGKOAN - Unit 4 | ATM CAPEM KAWANGKOAN - Unit 4 | 130 | Yes |
| ATM_TARERAN_003 | ATM CAPEM TARERAN - Unit 3 | ATM CAPEM TARERAN - Unit 3 | 131 | Yes |
| ATM_TARERAN_004 | ATM CAPEM TARERAN - Unit 4 | ATM CAPEM TARERAN - Unit 4 | 132 | Yes |
| ATM_RATATOTOK_003 | ATM CAPEM RATATOTOK - Unit 3 | ATM CAPEM RATATOTOK - Unit 3 | 133 | Yes |
| ATM_RATATOTOK_004 | ATM CAPEM RATATOTOK - Unit 4 | ATM CAPEM RATATOTOK - Unit 4 | 134 | Yes |
| ATM_KAUDITAN_003 | ATM CAPEM KAUDITAN - Unit 3 | ATM CAPEM KAUDITAN - Unit 3 | 135 | Yes |
| ATM_KAUDITAN_004 | ATM CAPEM KAUDITAN - Unit 4 | ATM CAPEM KAUDITAN - Unit 4 | 136 | Yes |
| ATM_LOLAK_003 | ATM CAPEM LOLAK - Unit 3 | ATM CAPEM LOLAK - Unit 3 | 137 | Yes |
| ATM_LOLAK_004 | ATM CAPEM LOLAK - Unit 4 | ATM CAPEM LOLAK - Unit 4 | 138 | Yes |
| ATM_MODAYAG_003 | ATM CAPEM MODAYAG - Unit 3 | ATM CAPEM MODAYAG - Unit 3 | 139 | Yes |
| ATM_MODAYAG_004 | ATM CAPEM MODAYAG - Unit 4 | ATM CAPEM MODAYAG - Unit 4 | 140 | Yes |
| ATM_LIMBOTO_003 | ATM CAPEM LIMBOTO - Unit 3 | ATM CAPEM LIMBOTO - Unit 3 | 141 | Yes |
| ATM_LIMBOTO_004 | ATM CAPEM LIMBOTO - Unit 4 | ATM CAPEM LIMBOTO - Unit 4 | 142 | Yes |
| ATM_TILAMUTA_003 | ATM CAPEM TILAMUTA - Unit 3 | ATM CAPEM TILAMUTA - Unit 3 | 143 | Yes |
| ATM_TILAMUTA_004 | ATM CAPEM TILAMUTA - Unit 4 | ATM CAPEM TILAMUTA - Unit 4 | 144 | Yes |
| ATM_BONE_BOLANGO_003 | ATM CAPEM BONE BOLANGO - Unit 3 | ATM CAPEM BONE BOLANGO - Unit 3 | 145 | Yes |
| ATM_BONE_BOLANGO_004 | ATM CAPEM BONE BOLANGO - Unit 4 | ATM CAPEM BONE BOLANGO - Unit 4 | 146 | Yes |
| ATM_KWANDANG_003 | ATM CAPEM KWANDANG - Unit 3 | ATM CAPEM KWANDANG - Unit 3 | 147 | Yes |
| ATM_KWANDANG_004 | ATM CAPEM KWANDANG - Unit 4 | ATM CAPEM KWANDANG - Unit 4 | 148 | Yes |
| ATM_MARISA_003 | ATM CAPEM MARISA - Unit 3 | ATM CAPEM MARISA - Unit 3 | 149 | Yes |
| ATM_MARISA_004 | ATM CAPEM MARISA - Unit 4 | ATM CAPEM MARISA - Unit 4 | 150 | Yes |
| ATM_PAGUYAMAN_003 | ATM CAPEM PAGUYAMAN - Unit 3 | ATM CAPEM PAGUYAMAN - Unit 3 | 151 | Yes |
| ATM_PAGUYAMAN_004 | ATM CAPEM PAGUYAMAN - Unit 4 | ATM CAPEM PAGUYAMAN - Unit 4 | 152 | Yes |
| ATM_POPAYATO_003 | ATM CAPEM POPAYATO - Unit 3 | ATM CAPEM POPAYATO - Unit 3 | 153 | Yes |
| ATM_POPAYATO_004 | ATM CAPEM POPAYATO - Unit 4 | ATM CAPEM POPAYATO - Unit 4 | 154 | Yes |
| ATM_TANJUNG_SELOR_003 | ATM CAPEM TANJUNG SELOR - Unit 3 | ATM CAPEM TANJUNG SELOR - Unit 3 | 155 | Yes |
| ATM_TANJUNG_SELOR_004 | ATM CAPEM TANJUNG SELOR - Unit 4 | ATM CAPEM TANJUNG SELOR - Unit 4 | 156 | Yes |


### 3. ATM_ERROR
**Total Options**: 6

| Code | Name | Display Name | Sort Order | Active |
|------|------|--------------|------------|--------|
| card_reader_error | Card Reader Error | Card Reader Error - Masalah pembacaan kartu | 10 | Yes |
| cash_dispenser_jam | Cash Dispenser Jam | Cash Dispenser Jam - Uang macet di mesin | 11 | Yes |
| network_connection | Network Connection | Network Connection - Tidak ada koneksi jaringan | 12 | Yes |
| receipt_printer_error | Receipt Printer Error | Receipt Printer Error - Printer struk bermasalah | 13 | Yes |
| screen_display_issue | Screen Display Issue | Screen Display Issue - Layar tidak berfungsi normal | 14 | Yes |
| transaction_timeout | Transaction Timeout | Transaction Timeout - Transaksi terputus/timeout | 15 | Yes |


### 4. BRANCH
**Total Options**: 56

| Code | Name | Display Name | Sort Order | Active |
|------|------|--------------|------------|--------|
| TUM | TUMINTING | TUMINTING (CAPEM) |  | Yes |
| AIR | AIRMADIDI | AIRMADIDI (CAPEM) |  | Yes |
| JAKARTA | BSG JAKARTA | BSG JAKARTA (CABANG) |  | Yes |
| JKT | BSG JAKARTA | BSG JAKARTA (CABANG) |  | Yes |
| UTAMA | BSG UTAMA | BSG UTAMA (CABANG) |  | Yes |
| GTO | BSG GORONTALO | BSG GORONTALO (CABANG) |  | Yes |
| KG | KELAPA GADING | KELAPA GADING (CAPEM) |  | Yes |
| GORONTALO | BSG GORONTALO | BSG GORONTALO (CABANG) | 1 | Yes |
| BITUNG | CABANG BITUNG | CABANG BITUNG (CABANG) | 2 | Yes |
| TOMOHON | CABANG TOMOHON | CABANG TOMOHON (CABANG) | 3 | Yes |
| KOTAMOBAGU | CABANG KOTAMOBAGU | CABANG KOTAMOBAGU (CABANG) | 4 | Yes |
| TAHUNA | CABANG TAHUNA | CABANG TAHUNA (CABANG) | 5 | Yes |
| MANADO_MEGA | CABANG MANADO MEGA MALL | CABANG MANADO MEGA MALL (CABANG) | 6 | Yes |
| MANADO_PASAR | CABANG PASAR SENTRAL | CABANG PASAR SENTRAL (CABANG) | 7 | Yes |
| TONDANO | CABANG TONDANO | CABANG TONDANO (CABANG) | 8 | Yes |
| LANGOWAN | CABANG LANGOWAN | CABANG LANGOWAN (CABANG) | 9 | Yes |
| AIRMADIDI | CABANG AIRMADIDI | CABANG AIRMADIDI (CABANG) | 10 | Yes |
| MAUMERE | CABANG MAUMERE | CABANG MAUMERE (CABANG) | 11 | Yes |
| ENDE | CABANG ENDE | CABANG ENDE (CABANG) | 12 | Yes |
| KUPANG | CABANG KUPANG | CABANG KUPANG (CABANG) | 13 | Yes |
| TERNATE | CABANG TERNATE | CABANG TERNATE (CABANG) | 14 | Yes |
| AMBON | CABANG AMBON | CABANG AMBON (CABANG) | 15 | Yes |
| SORONG | CABANG SORONG | CABANG SORONG (CABANG) | 16 | Yes |
| JAYAPURA | CABANG JAYAPURA | CABANG JAYAPURA (CABANG) | 17 | Yes |
| PALU | CABANG PALU | CABANG PALU (CABANG) | 18 | Yes |
| KENDARI | CABANG KENDARI | CABANG KENDARI (CABANG) | 19 | Yes |
| MAKASSAR | CABANG MAKASSAR | CABANG MAKASSAR (CABANG) | 20 | Yes |
| PAREPARE | CABANG PAREPARE | CABANG PAREPARE (CABANG) | 21 | Yes |
| BONE | CABANG BONE | CABANG BONE (CABANG) | 22 | Yes |
| SURABAYA | CABANG SURABAYA | CABANG SURABAYA (CABANG) | 23 | Yes |
| MALANG | CABANG MALANG | CABANG MALANG (CABANG) | 24 | Yes |
| BALIKPAPAN | CABANG BALIKPAPAN | CABANG BALIKPAPAN (CABANG) | 25 | Yes |
| KELAPA_GADING | CAPEM KELAPA GADING | CAPEM KELAPA GADING (CAPEM) | 26 | Yes |
| TUMINTING | CAPEM TUMINTING | CAPEM TUMINTING (CAPEM) | 27 | Yes |
| WENANG | CAPEM WENANG | CAPEM WENANG (CAPEM) | 28 | Yes |
| MALALAYANG | CAPEM MALALAYANG | CAPEM MALALAYANG (CAPEM) | 29 | Yes |
| PAAL_DUA | CAPEM PAAL DUA | CAPEM PAAL DUA (CAPEM) | 30 | Yes |
| TIKALA | CAPEM TIKALA | CAPEM TIKALA (CAPEM) | 31 | Yes |
| WANEA | CAPEM WANEA | CAPEM WANEA (CAPEM) | 32 | Yes |
| WINANGUN | CAPEM WINANGUN | CAPEM WINANGUN (CAPEM) | 33 | Yes |
| KAROMBASAN | CAPEM KAROMBASAN | CAPEM KAROMBASAN (CAPEM) | 34 | Yes |
| WOLTER_MONGINSIDI | CAPEM WOLTER MONGINSIDI | CAPEM WOLTER MONGINSIDI (CAPEM) | 35 | Yes |
| KAWANGKOAN | CAPEM KAWANGKOAN | CAPEM KAWANGKOAN (CAPEM) | 36 | Yes |
| TARERAN | CAPEM TARERAN | CAPEM TARERAN (CAPEM) | 37 | Yes |
| RATATOTOK | CAPEM RATATOTOK | CAPEM RATATOTOK (CAPEM) | 38 | Yes |
| KAUDITAN | CAPEM KAUDITAN | CAPEM KAUDITAN (CAPEM) | 39 | Yes |
| LOLAK | CAPEM LOLAK | CAPEM LOLAK (CAPEM) | 40 | Yes |
| MODAYAG | CAPEM MODAYAG | CAPEM MODAYAG (CAPEM) | 41 | Yes |
| LIMBOTO | CAPEM LIMBOTO | CAPEM LIMBOTO (CAPEM) | 42 | Yes |
| TILAMUTA | CAPEM TILAMUTA | CAPEM TILAMUTA (CAPEM) | 43 | Yes |
| BONE_BOLANGO | CAPEM BONE BOLANGO | CAPEM BONE BOLANGO (CAPEM) | 44 | Yes |
| KWANDANG | CAPEM KWANDANG | CAPEM KWANDANG (CAPEM) | 45 | Yes |
| MARISA | CAPEM MARISA | CAPEM MARISA (CAPEM) | 46 | Yes |
| PAGUYAMAN | CAPEM PAGUYAMAN | CAPEM PAGUYAMAN (CAPEM) | 47 | Yes |
| POPAYATO | CAPEM POPAYATO | CAPEM POPAYATO (CAPEM) | 48 | Yes |
| TANJUNG_SELOR | CAPEM TANJUNG SELOR | CAPEM TANJUNG SELOR (CAPEM) | 49 | Yes |


### 5. DEPARTMENT
**Total Options**: 5

| Code | Name | Display Name | Sort Order | Active |
|------|------|--------------|------------|--------|
| accounting | Accounting | Accounting | 1 | Yes |
| hr | Human Resources | Human Resources | 2 | Yes |
| it | Information Technology | Information Technology | 3 | Yes |
| operations | Operations | Operations | 4 | Yes |
| finance | Finance | Finance | 5 | Yes |


### 6. OLIBS_MENU
**Total Options**: 11

| Code | Name | Display Name | Sort Order | Active |
|------|------|--------------|------------|--------|
| kredit_aplikasi | Kredit - Input Aplikasi | Kredit - Input Aplikasi |  | Yes |
| kredit_pencairan | Kredit - Pencairan | Kredit - Pencairan |  | Yes |
| giro_buka | Giro - Buka Rekening | Giro - Buka Rekening |  | Yes |
| giro_tutup | Giro - Tutup Rekening | Giro - Tutup Rekening |  | Yes |
| report_harian | Report Harian | Report Harian |  | Yes |
| tabungan_buka | Tabungan - Buka Rekening | Tabungan - Buka Rekening |  | Yes |
| report_bulanan | Report Bulanan | Report Bulanan |  | Yes |
| tabungan_tutup | Tabungan - Tutup Rekening | Tabungan - Tutup Rekening |  | Yes |
| tabungan_transfer | Tabungan - Transfer | Tabungan - Transfer |  | Yes |
| deposito_buka | Deposito - Buka Rekening | Deposito - Buka Rekening |  | Yes |
| deposito_perpanjang | Deposito - Perpanjangan | Deposito - Perpanjangan |  | Yes |


### 7. REQUEST_TYPE
**Total Options**: 5

| Code | Name | Display Name | Sort Order | Active |
|------|------|--------------|------------|--------|
| new_access | New Access Request | Permintaan Akses Baru | 1 | Yes |
| modify_access | Modify Access | Ubah Hak Akses | 2 | Yes |
| remove_access | Remove Access | Hapus Akses | 3 | Yes |
| temporary_access | Temporary Access | Akses Sementara | 4 | Yes |
| emergency_access | Emergency Access | Akses Darurat | 5 | Yes |


---

## BSG TEMPLATES

Additional service templates and their field configurations:


---

## TECHNICAL IMPLEMENTATION DETAILS

### Database Tables Involved
- **ServiceCatalog**: Main service catalog definitions
- **ServiceItem**: Individual services within catalogs
- **ServiceFieldDefinition**: Dynamic field configurations
- **FieldTypeDefinition**: Field type specifications
- **BSGMasterData**: Dropdown option values
- **BSGTemplate**: Additional service templates
- **Category/SubCategory**: Service organization structure

### Field Types Supported
- Text input fields (single line)
- Textarea fields (multi-line)
- Dropdown/Select fields
- Checkbox fields (multiple selection)
- Radio button fields (single selection)
- Date fields
- Number fields
- Email fields
- Phone number fields

### Integration Points
- Customer portal form generation
- Technician workspace field display
- Manager approval review screens
- Reporting and analytics systems

---

## DATA INTEGRITY NOTES

**Export Date**: 2025-07-13T07:57:55.272Z  
**Total Records Exported**: 256  
**Data Validation**: All relationships verified  
**Completeness**: 100% of active service catalog data included

This export represents the complete production-ready service catalog for BSG's Enterprise Ticketing System.
