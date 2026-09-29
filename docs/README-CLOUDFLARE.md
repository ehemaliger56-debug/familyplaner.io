# Cloudflare Pages – Deploy (statisch, kein Build)

Diese Website ist reines HTML/CSS/JS + Supabase via CDN. Kein Node, kein Server, kein Build nötig. Funktioniert auf GitHub Pages **und** Cloudflare Pages.

## Dateien (Root = Upload-Ordner)

- `index.html` (NEU) – Einstieg für `/`, leitet auf `Familientafel-Essensplan.html` weiter
- `Familientafel-Essensplan.html` – bestehende App, unverändert
- `supabase.js` – zentrale Supabase-Config (URL + public Key, bereits eingetragen)
- `supabase-test.html` – Verbindungstest
- `_headers` (NEU) – Cache-Regeln für Cloudflare Pages
- `.gitignore`, `README-SUPABASE.md`

## Deploy in 3 Minuten (Git-verbunden, empfohlen)

1. Ordner-Inhalt ins GitHub-Repo pushen (Root, kein Unterordner).
2. Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git** → Repo wählen.
3. Build-Einstellungen:
   - **Framework preset:** `None`
   - **Build command:** *(leer lassen)*
   - **Build output directory:** `/` bzw. `.` (Root)
   - **Root directory:** `/` (bzw. Unterordner nur falls dort die Dateien liegen)
4. **Deploy** → URL sieht so aus: `https://familientafel.pages.dev`
5. Testen:
   - `…/supabase-test.html` → „Verbindung testen“ → 3x grün
   - `…/` → landet automatisch beim Essensplan

## Alternative: Direct Upload

Workers & Pages → Create → Pages → **Upload assets** → Ordnerinhalt als ZIP hochladen. Gleiche Tests wie oben.

## Hinweise

- Keine Umgebungsvariablen nötig: der public Key in `supabase.js` ist absichtlich öffentlich (Schutz später via RLS). Keine Secrets in Pages-Env eintragen.
- Eigene Domain (optional): Pages-Projekt → **Custom domains** → z. B. `essen.deinedomain.de` → CNAME folgen.
- Wichtig: `index.html` nicht löschen – Cloudflare und GitHub servieren `/` sonst als 404. Die App-Datei selbst bleibt unverändert als `Familientafel-Essensplan.html`.
