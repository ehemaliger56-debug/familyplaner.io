# FamilienTafel + Supabase – nur Verbindung einrichten (Schritt 1)

Diese Anleitung richtet **nur die saubere Supabase-Connection** ein.
Es wird **keine Datenbankstruktur** und **keine erfundene Tabelle** erstellt –
genau wie gewünscht.

## Was wurde geändert / erstellt und warum

| Datei | Status | Warum |
|---|---|---|
| `Familientafel-Essensplan.html` | **unverändert** | Bestehendes Design und Funktionen (Login Demo Mama/Papa, Wochenplan Mo–So, Frühstück/Mittag/Abend, Vorschläge mit Voting, localStorage `ft_users` / `ft_families` / `ft_current`) bleiben zu 100 % erhalten. |
| `supabase.js` **(NEU)** | zentrale Stelle | Einzige Stelle für `SUPABASE_URL` + öffentlichen Anon-Key. Stellt `window.FamilienTafelSupabase.getClient()` / `testConnection()` bereit. Später nutzen Essensplan, Gerichte und Einkaufsliste denselben Client. |
| `supabase-test.html` **(NEU)** | Testseite | Kleiner Test: prüft SDK + URL + Anon-Key via `auth.getSession()` – braucht **keine Tabellen**. Läuft lokal und auf GitHub Pages. |
| `.gitignore` **(NEU)** | Schutz | Verhindert versehentliches Committen von `.env` / lokalen Keys. Der Anon-Key in `supabase.js` ist öffentlich und darf auf GitHub liegen (Schutz erfolgt später via RLS). |
| `README-SUPABASE.md` | diese Datei | Setup-Anleitung. |

## In 5 Minuten einrichten

### 1. Supabase-Projekt holen
1. https://supabase.com → neues Projekt erstellen.
2. Dashboard → **Project Settings → Data API** öffnen.
3. Kopieren:
   - **Project URL** → z. B. `https://xyzcompany.supabase.co`
   - **anon public** Key → langer `eyJhbGciOi...`-String.

> Niemals `service_role` / `secret` Key oder das Datenbankpasswort ins Frontend schreiben!

### 2. In `supabase.js` eintragen
```js
var SUPABASE_URL = "https://xyzcompany.supabase.co";
var SUPABASE_ANON_KEY = "eyJhbGciOi...dein-anon-key...";
```

Alternative ohne Code-Änderung (nur lokal, wird nie committet):
```js
localStorage.setItem("ft_supabase_url", "https://xyzcompany.supabase.co");
localStorage.setItem("ft_supabase_anon", "eyJhbGciOi...");
```

### 3. Verbindung testen
- Lokal: Ordner mit einem statischen Server öffnen, z. B. VS Code „Live Server“ oder `npx serve`, dann `supabase-test.html` öffnen → **Verbindung testen** klicken.
- Erwartung **vor** dem Eintragen: Schritt „Konfiguration“ schlägt fehl – das ist normal.
- Erwartung **nach** dem Eintragen: alle 3 Schritte grün (`SDK geladen`, `Konfiguration`, `Supabase erreichbar`).

### 4. Auf GitHub Pages veröffentlichen
1. Diesen Ordner (`Familientafel-Essensplan.html`, `supabase.js`, `supabase-test.html`, `.gitignore`) ins GitHub-Repo pushen.
2. GitHub → Repo → **Settings → Pages** → Branch + Root (`/`) wählen.
3. Nach dem Deploy:
   - `https://DEIN-NAME.github.io/DEIN-REPO/supabase-test.html` → Test klicken.
   - `https://DEIN-NAME.github.io/DEIN-REPO/Familientafel-Essensplan.html` → bestehende Seite läuft wie bisher.
4. GitHub Pages braucht: relative Pfade (`./supabase.js`), kein `localhost`, kein Node, keine Server-Keys – alles erfüllt.

> Tipp: Damit die Startseite direkt aufgeht, in den Repo-Einstellungen oder per Umbenennen `Familientafel-Essensplan.html` als `index.html` bereitstellen. Aktuell wurde nichts umbenannt, um nichts kaputt zu machen.

## Sicherheit / RLS-Vorbereitung

- Aktuell gibt es **keine öffentlichen DB-Regeln** und **keine Tabellen** – es kann also nichts Unsicheres entstehen.
- Der Anon-Key ist absichtlich öffentlich, aber nutzlos ohne Tabellen + RLS-Policies.
- Nächster Schritt (später, nicht jetzt): Tabellen für Familie, Essensplan, Gerichte, Einkaufsliste anlegen, **RLS aktivieren** und Policies wie „User sieht nur Daten seiner eigenen `family_id`“ erstellen. Erst dann Auth + Speicherung umstellen. Die App läuft bis dahin weiter mit `localStorage`.

## Technik

- Offizielles SDK: `@supabase/supabase-js@2` via jsDelivr-UMD (`window.supabase.createClient`).
- Session-Persistenz: `persistSession: true`, Storage-Key `ft-supabase-auth` (kollidiert nicht mit `ft_users` / `ft_families` / `ft_current`).
- Keine `fetch`-Direktaufrufe, kein Passwort, kein Secret im Code.
