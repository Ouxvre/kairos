# GO LIVE — Membuka Registrasi untuk Semua Orang

> Rencana untuk hari peluncuran. Saat dokumen ini ditulis (2026-08-25), registrasi
> masih **waitlist-gated + approval manual**. Jalankan semua langkah di bawah
> secara berurutan saat mau buka keran. Semua konteks cukup dari dokumen ini +
> kode repo, tidak perlu riwayat chat lama.

## Latar belakang arsitektur gate (kondisi SEBELUM go live)

- Tabel `public.waitlist`: `email` (unique), `approved_at`, `claimed_at`, `created_at`.
- RPC `claim_waitlist_seat(p_email)` dipanggil di `src/app/(auth)/register/page.tsx`
  sebelum `supabase.auth.signUp`. Return codes:
  - `0` = email tidak ada di waitlist → register ditolak + link join waitlist.
  - `3` = ada di waitlist tapi `approved_at` NULL (belum di-approve manual) → ditolak.
  - `2` = sudah pernah klaim → ditolak "slot already used".
  - `1` = lolos → lanjut signUp. Gagal signUp → `release_waitlist_seat` mengosongkan `claimed_at` (hanya klaim <10 menit) supaya bisa retry.
- RPC `join_waitlist(p_email)` = form waitlist publik di landing page (tetap jalan).

## Langkah 1 — Migrasi SQL `open_registration`

Jalankan di Supabase (SQL Editor atau migrasi). Efek: siapa pun bisa langsung
daftar tanpa pernah menyentuh halaman utama; seluruh antrian lama otomatis lolos;
tabel `waitlist` menjadi log pendaftar.

```sql
CREATE OR REPLACE FUNCTION public.claim_waitlist_seat(p_email text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE r record;
BEGIN
  SELECT * INTO r FROM public.waitlist WHERE lower(email) = lower(p_email);
  IF NOT FOUND THEN
    INSERT INTO public.waitlist (email, approved_at, claimed_at)
    VALUES (lower(p_email), now(), now());
    RETURN 1;
  END IF;
  IF r.claimed_at IS NOT NULL THEN RETURN 2; END IF;
  UPDATE public.waitlist
     SET approved_at = coalesce(approved_at, now()),
         claimed_at = now()
   WHERE id = r.id;
  RETURN 1;
END $$;
```

Catatan:
- `release_waitlist_seat` TIDAK diubah (retry gagal-signup tetap berfungsi).
- Kode `register/page.tsx` tidak perlu diubah — cabang error 0/2/3 hanya tidak
  pernah terpicu lagi.
- Verifikasi cepat pasca-migrasi:
  `SELECT claim_waitlist_seat('email-baru-acak@test.com');` harus `1`,
  lalu hapus baris test itu dari tabel.

## Langkah 2 — Landing page

1. **Hero** (`src/components/landing/Hero.tsx`):
   CTA *"Join The Waitlist"* → *"Start Trading"*, href `#waitlist` → `/register`
   (pakai `<a href="/register">`, konsisten dengan tombol Launch App).
2. **Section eks-waitlist** (`src/components/landing/WaitlistForm.tsx` + pemanggilnya):
   ubah jadi form update produk:
   - Copy: eyebrow/h2/body baru (mis. "Stay ahead of the market" / tombol
     "Keep Me Posted"). Bukan lagi bahasa antrean/seats.
   - Tetap panggil RPC `join_waitlist` (tabel sama), tapi state sukses tidak
     menampilkan nomor antrean ("You're #N") — ganti pesan sukses netral.
3. **Grep referensi mati**: cari `#waitlist` di seluruh `src/` dan perbaiki/ganti
   semua link yang menunjuk ke section tersebut.

## Langkah 3 — Verifikasi

1. `npm.cmd run build` + `npm.cmd run lint` (Windows/bash: pakai `npm.cmd`).
2. Tes manual di dev server:
   - Register email **baru** yang tidak pernah ada di waitlist → langsung berhasil,
     masuk `/dashboard`.
   - Login akun lama → normal.
   - Register ulang email yang sudah terdaftar → pesan "slot already used"
     (sebenarnya error dari Supabase "user already exists" yang muncul; wajar).

## Langkah 4 — Checklist manual (non-kode)

- [ ] Supabase Dashboard → Authentication → aktifkan **Leaked Password Protection**.
- [ ] Cek setting email confirmation: kalau ON, user harus verifikasi email
      sebelum session aktif — pastikan alurnya masuk akal untuk publik.
- [ ] **Freqtrade tetap dry-run/testnet** sesuai PRD — buka registrasi ≠ uang
      riil. Trading live adalah fase terpisah (Phase 4+).
- [ ] Domain produksi + SSL di level reverse proxy/Cloudflare Pages.
- [ ] Review keamanan sebelum publik (API key, kredensial Freqtrade, isolasi
      multi-tenant) — sudah diflag di PRD sebagai gap knowledge.

## Rollback (kalau perlu tutup keran lagi)

Balikkan fungsi ke mode approval-manual (lihat riwayat migrasi `waitlist_gate`
+ `waitlist_approval` di Supabase, atau tulis ulang: return `3` bila
`approved_at IS NULL`, tanpa auto-insert). Frontend tidak perlu disentuh.
