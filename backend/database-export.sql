-- BSG Ticketing System Database Export
-- Generated: 2025-07-12T05:49:49.875Z
-- Description: Dynamic fields and master data for service catalog

-- BSG Master Data
DELETE FROM bsg_master_data WHERE data_type IN ('branch', 'olibs_menu', 'atm', 'generic');

INSERT INTO bsg_master_data (data_type, code, name, display_name, metadata, sort_order, is_active) VALUES ('atm', 'ATM_006', 'AIRMADIDI - Outdoor', 'AIRMADIDI - Outdoor', '{"location":"Minahasa"}', 0, true);
INSERT INTO bsg_master_data (data_type, code, name, display_name, metadata, sort_order, is_active) VALUES ('atm', 'ATM_003', 'BSG JAKARTA - Lobby', 'BSG JAKARTA - Lobby', '{"location":"Jakarta"}', 0, true);
INSERT INTO bsg_master_data (data_type, code, name, display_name, metadata, sort_order, is_active) VALUES ('atm', 'ATM_002', 'BSG UTAMA - Drive Thru', 'BSG UTAMA - Drive Thru', '{"location":"Manado"}', 0, true);
INSERT INTO bsg_master_data (data_type, code, name, display_name, metadata, sort_order, is_active) VALUES ('atm', 'ATM_001', 'BSG UTAMA - Lobby', 'BSG UTAMA - Lobby', '{"location":"Manado"}', 0, true);
INSERT INTO bsg_master_data (data_type, code, name, display_name, metadata, sort_order, is_active) VALUES ('atm', 'ATM_004', 'KELAPA GADING - Outdoor', 'KELAPA GADING - Outdoor', '{"location":"Jakarta"}', 0, true);
INSERT INTO bsg_master_data (data_type, code, name, display_name, metadata, sort_order, is_active) VALUES ('atm', 'ATM_005', 'TUMINTING - Indoor', 'TUMINTING - Indoor', '{"location":"Manado"}', 0, true);
INSERT INTO bsg_master_data (data_type, code, name, display_name, metadata, sort_order, is_active) VALUES ('branch', 'AIR', 'AIRMADIDI', 'AIRMADIDI (CAPEM)', '{"type":"CAPEM"}', 0, true);
INSERT INTO bsg_master_data (data_type, code, name, display_name, metadata, sort_order, is_active) VALUES ('branch', 'GTO', 'BSG GORONTALO', 'BSG GORONTALO (CABANG)', '{"type":"CABANG"}', 0, true);
INSERT INTO bsg_master_data (data_type, code, name, display_name, metadata, sort_order, is_active) VALUES ('branch', 'JKT', 'BSG JAKARTA', 'BSG JAKARTA (CABANG)', '{"type":"CABANG"}', 0, true);
INSERT INTO bsg_master_data (data_type, code, name, display_name, metadata, sort_order, is_active) VALUES ('branch', 'UTAMA', 'BSG UTAMA', 'BSG UTAMA (CABANG)', '{"type":"CABANG"}', 0, true);
INSERT INTO bsg_master_data (data_type, code, name, display_name, metadata, sort_order, is_active) VALUES ('branch', 'KG', 'KELAPA GADING', 'KELAPA GADING (CAPEM)', '{"type":"CAPEM"}', 0, true);
INSERT INTO bsg_master_data (data_type, code, name, display_name, metadata, sort_order, is_active) VALUES ('branch', 'TUM', 'TUMINTING', 'TUMINTING (CAPEM)', '{"type":"CAPEM"}', 0, true);
INSERT INTO bsg_master_data (data_type, code, name, display_name, metadata, sort_order, is_active) VALUES ('generic', 'view_only', 'View Only', 'View Only - Akses untuk melihat data saja', '{"category":"olibs_access","fieldType":"dropdown","description":"OLIBS access type: View Only"}', 1, true);
INSERT INTO bsg_master_data (data_type, code, name, display_name, metadata, sort_order, is_active) VALUES ('generic', 'input_operator', 'Input Operator', 'Input Operator - Akses input transaksi harian', '{"category":"olibs_access","fieldType":"dropdown","description":"OLIBS access type: Input Operator"}', 2, true);
INSERT INTO bsg_master_data (data_type, code, name, display_name, metadata, sort_order, is_active) VALUES ('generic', 'supervisor', 'Supervisor', 'Supervisor - Akses penuh termasuk approval', '{"category":"olibs_access","fieldType":"dropdown","description":"OLIBS access type: Supervisor"}', 3, true);
INSERT INTO bsg_master_data (data_type, code, name, display_name, metadata, sort_order, is_active) VALUES ('generic', 'card_reader_error', 'Card Reader Error', 'Card Reader Error - Masalah pembacaan kartu', '{"category":"atm_problems","fieldType":"dropdown","description":"ATM problem type: Card Reader Error"}', 10, true);
INSERT INTO bsg_master_data (data_type, code, name, display_name, metadata, sort_order, is_active) VALUES ('generic', 'cash_dispenser_jam', 'Cash Dispenser Jam', 'Cash Dispenser Jam - Uang macet di mesin', '{"category":"atm_problems","fieldType":"dropdown","description":"ATM problem type: Cash Dispenser Jam"}', 11, true);
INSERT INTO bsg_master_data (data_type, code, name, display_name, metadata, sort_order, is_active) VALUES ('generic', 'network_connection', 'Network Connection', 'Network Connection - Tidak ada koneksi jaringan', '{"category":"atm_problems","fieldType":"dropdown","description":"ATM problem type: Network Connection"}', 12, true);
INSERT INTO bsg_master_data (data_type, code, name, display_name, metadata, sort_order, is_active) VALUES ('generic', 'receipt_printer_error', 'Receipt Printer Error', 'Receipt Printer Error - Printer struk bermasalah', '{"category":"atm_problems","fieldType":"dropdown","description":"ATM problem type: Receipt Printer Error"}', 13, true);
INSERT INTO bsg_master_data (data_type, code, name, display_name, metadata, sort_order, is_active) VALUES ('generic', 'screen_display_issue', 'Screen Display Issue', 'Screen Display Issue - Layar tidak berfungsi normal', '{"category":"atm_problems","fieldType":"dropdown","description":"ATM problem type: Screen Display Issue"}', 14, true);
INSERT INTO bsg_master_data (data_type, code, name, display_name, metadata, sort_order, is_active) VALUES ('generic', 'transaction_timeout', 'Transaction Timeout', 'Transaction Timeout - Transaksi terputus/timeout', '{"category":"atm_problems","fieldType":"dropdown","description":"ATM problem type: Transaction Timeout"}', 15, true);
INSERT INTO bsg_master_data (data_type, code, name, display_name, metadata, sort_order, is_active) VALUES ('olibs_menu', 'deposito_buka', 'Deposito - Buka Rekening', 'Deposito - Buka Rekening', '{"category":"deposito"}', 0, true);
INSERT INTO bsg_master_data (data_type, code, name, display_name, metadata, sort_order, is_active) VALUES ('olibs_menu', 'deposito_perpanjang', 'Deposito - Perpanjangan', 'Deposito - Perpanjangan', '{"category":"deposito"}', 0, true);
INSERT INTO bsg_master_data (data_type, code, name, display_name, metadata, sort_order, is_active) VALUES ('olibs_menu', 'giro_buka', 'Giro - Buka Rekening', 'Giro - Buka Rekening', '{"category":"giro"}', 0, true);
INSERT INTO bsg_master_data (data_type, code, name, display_name, metadata, sort_order, is_active) VALUES ('olibs_menu', 'giro_tutup', 'Giro - Tutup Rekening', 'Giro - Tutup Rekening', '{"category":"giro"}', 0, true);
INSERT INTO bsg_master_data (data_type, code, name, display_name, metadata, sort_order, is_active) VALUES ('olibs_menu', 'kredit_aplikasi', 'Kredit - Input Aplikasi', 'Kredit - Input Aplikasi', '{"category":"kredit"}', 0, true);
INSERT INTO bsg_master_data (data_type, code, name, display_name, metadata, sort_order, is_active) VALUES ('olibs_menu', 'kredit_pencairan', 'Kredit - Pencairan', 'Kredit - Pencairan', '{"category":"kredit"}', 0, true);
INSERT INTO bsg_master_data (data_type, code, name, display_name, metadata, sort_order, is_active) VALUES ('olibs_menu', 'report_bulanan', 'Report Bulanan', 'Report Bulanan', '{"category":"report"}', 0, true);
INSERT INTO bsg_master_data (data_type, code, name, display_name, metadata, sort_order, is_active) VALUES ('olibs_menu', 'report_harian', 'Report Harian', 'Report Harian', '{"category":"report"}', 0, true);
INSERT INTO bsg_master_data (data_type, code, name, display_name, metadata, sort_order, is_active) VALUES ('olibs_menu', 'tabungan_buka', 'Tabungan - Buka Rekening', 'Tabungan - Buka Rekening', '{"category":"tabungan"}', 0, true);
INSERT INTO bsg_master_data (data_type, code, name, display_name, metadata, sort_order, is_active) VALUES ('olibs_menu', 'tabungan_transfer', 'Tabungan - Transfer', 'Tabungan - Transfer', '{"category":"tabungan"}', 0, true);
INSERT INTO bsg_master_data (data_type, code, name, display_name, metadata, sort_order, is_active) VALUES ('olibs_menu', 'tabungan_tutup', 'Tabungan - Tutup Rekening', 'Tabungan - Tutup Rekening', '{"category":"tabungan"}', 0, true);

-- Service Field Definitions (sample for key services)
-- Note: Full field definitions available in database-export.json
-- Total field definitions: 211
-- Key services with fields: 157
