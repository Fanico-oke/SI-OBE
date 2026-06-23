-- Duplikasi Kurikulum 2024/2025 ke 2025/2026
SET @newKurId = UUID();
SET @oldKurId = '2fe0f250-d0fe-4a8d-a961-9f67a3abe722';

-- 1. Insert new Kurikulum
INSERT INTO Kurikulum (id, nama, prodi, tahunMulai, tahunSelesai, deskripsi, tujuan, levelKkni, referensiAcuan, petaOkupasi, status, createdAt, updatedAt)
SELECT @newKurId, 'Rancangan Kurikulum SI Semester 2025/2026', prodi, 2025, 2029, deskripsi, tujuan, levelKkni, referensiAcuan, petaOkupasi, 'ARCHIVED', NOW(), NOW()
FROM Kurikulum WHERE id = @oldKurId;

-- 2. Duplikasi Profil Lulusan
INSERT INTO ProfilLulusan (id, kurikulumId, kode, deskripsi, referensi, createdAt, updatedAt)
SELECT UUID(), @newKurId, kode, deskripsi, referensi, NOW(), NOW()
FROM ProfilLulusan WHERE kurikulumId = @oldKurId;

-- 3. Duplikasi CPL
DROP TEMPORARY TABLE IF EXISTS cpl_map;
CREATE TEMPORARY TABLE cpl_map (oldId VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci, newId VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci);

INSERT INTO cpl_map (oldId, newId)
SELECT id, UUID() FROM CPL WHERE kurikulumId = @oldKurId;

INSERT INTO CPL (id, kurikulumId, kode, deskripsi, kategori, createdAt, updatedAt)
SELECT m.newId, @newKurId, c.kode, c.deskripsi, COALESCE(c.kategori, 'Pengetahuan'), NOW(), NOW()
FROM CPL c JOIN cpl_map m ON c.id = m.oldId;

-- 4. Duplikasi CPL SN-DIKTI
INSERT INTO CPLSnDikti (id, kurikulumId, kode, deskripsi, kategori, createdAt, updatedAt)
SELECT UUID(), @newKurId, kode, deskripsi, kategori, NOW(), NOW()
FROM CPLSnDikti WHERE kurikulumId = @oldKurId;

-- 5. Duplikasi Bahan Kajian
DROP TEMPORARY TABLE IF EXISTS bk_map;
CREATE TEMPORARY TABLE bk_map (oldId VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci, newId VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci);

INSERT INTO bk_map (oldId, newId)
SELECT id, UUID() FROM BahanKajian WHERE kurikulumId = @oldKurId;

INSERT INTO BahanKajian (id, kurikulumId, kode, nama, createdAt, updatedAt)
SELECT m.newId, @newKurId, b.kode, b.nama, NOW(), NOW()
FROM BahanKajian b JOIN bk_map m ON b.id = m.oldId;

-- 6. Duplikasi Mata Kuliah
DROP TEMPORARY TABLE IF EXISTS mk_map;
CREATE TEMPORARY TABLE mk_map (oldId VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci, newId VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci);

INSERT INTO mk_map (oldId, newId)
SELECT id, UUID() FROM MataKuliah WHERE kurikulumId = @oldKurId;

INSERT INTO MataKuliah (id, kurikulumId, kode, nama, sks, semester, createdAt, updatedAt)
SELECT m.newId, @newKurId, mk.kode, mk.nama, mk.sks, mk.semester, NOW(), NOW()
FROM MataKuliah mk JOIN mk_map m ON mk.id = m.oldId;

-- 7. Duplikasi CPMK
DROP TEMPORARY TABLE IF EXISTS cpmk_map;
CREATE TEMPORARY TABLE cpmk_map (oldId VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci, newId VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci);

INSERT INTO cpmk_map (oldId, newId)
SELECT id, UUID() FROM CPMK WHERE cplId IN (SELECT oldId FROM cpl_map);

INSERT INTO CPMK (id, cplId, kode, deskripsi, createdAt, updatedAt)
SELECT cm.newId, cplm.newId, c.kode, c.deskripsi, NOW(), NOW()
FROM CPMK c JOIN cpmk_map cm ON c.id = cm.oldId JOIN cpl_map cplm ON c.cplId = cplm.oldId;

-- 8. Duplikasi SubCPMK
DROP TEMPORARY TABLE IF EXISTS subcpmk_map;
CREATE TEMPORARY TABLE subcpmk_map (oldId VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci, newId VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci);

INSERT INTO subcpmk_map (oldId, newId)
SELECT id, UUID() FROM SubCPMK WHERE cpmkId IN (SELECT oldId FROM cpmk_map);

INSERT INTO SubCPMK (id, cpmkId, kode, deskripsi, createdAt, updatedAt)
SELECT sm.newId, cpmkm.newId, s.kode, s.deskripsi, NOW(), NOW()
FROM SubCPMK s JOIN subcpmk_map sm ON s.id = sm.oldId JOIN cpmk_map cpmkm ON s.cpmkId = cpmkm.oldId;

-- 9. Duplikasi Pemetaan CPL-BK
INSERT INTO PemetaanCPLBK (id, cplId, bkId)
SELECT UUID(), cplm.newId, bkm.newId
FROM PemetaanCPLBK p JOIN cpl_map cplm ON p.cplId = cplm.oldId JOIN bk_map bkm ON p.bkId = bkm.oldId;

-- 10. Duplikasi Pemetaan BK-MK
INSERT INTO PemetaanBKMK (id, bkId, mkId)
SELECT UUID(), bkm.newId, mkm.newId
FROM PemetaanBKMK p JOIN bk_map bkm ON p.bkId = bkm.oldId JOIN mk_map mkm ON p.mkId = mkm.oldId;

-- 11. Duplikasi Pemetaan CPL-MK
INSERT INTO PemetaanCPLMK (id, cplId, mkId)
SELECT UUID(), cplm.newId, mkm.newId
FROM PemetaanCPLMK p JOIN cpl_map cplm ON p.cplId = cplm.oldId JOIN mk_map mkm ON p.mkId = mkm.oldId;

-- 12. Duplikasi Pemetaan MK-CPMK
INSERT INTO PemetaanMKCPMK (id, mkId, cpmkId)
SELECT UUID(), mkm.newId, cpmkm.newId
FROM PemetaanMKCPMK p JOIN mk_map mkm ON p.mkId = mkm.oldId JOIN cpmk_map cpmkm ON p.cpmkId = cpmkm.oldId;

-- Cleanup
DROP TEMPORARY TABLE IF EXISTS cpl_map, bk_map, mk_map, cpmk_map, subcpmk_map;

SELECT 'Duplikasi kurikulum berhasil!' as result;
