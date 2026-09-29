/* ============================================================================
 * FamilienTafel – Zentrale Supabase-Verbindung
 * ----------------------------------------------------------------------------
 * DIESE Datei ist die EINZIGE Stelle für die Supabase-Konfiguration.
 * Alle anderen Dateien nutzen: window.FamilienTafelSupabase.getClient()
 *
 * GitHub-Pages-kompatibel:
 *  - kein Build, kein Node, kein Server – reines Browser-JS
 *  - relative Pfade, keine localhost-Abhängigkeit
 *  - lädt das offizielle SDK via CDN (siehe supabase-test.html bzw. unten)
 *
 * Sicherheit:
 *  - Hier darf NUR der öffentliche "anon / publishable" Key stehen.
 *  - NIEMALS service_role / secret Key oder DB-Passwort hier eintragen!
 *  - Echter Schutz kommt später über Supabase Row Level Security (RLS).
 * ========================================================================== */

(function () {
  "use strict";

  // --------------------------------------------------------------------------
  // 1) KONFIGURATION – hier deine Werte aus dem Supabase-Dashboard eintragen:
  //    Supabase Dashboard → Project Settings → Data API / API Keys
  //    - Project URL  → z. B. https://xyzcompany.supabase.co
  //    - anon public  → langer JWT-String (eyJhbGciOi...)
  // --------------------------------------------------------------------------
  var SUPABASE_URL = "https://gwnxerxnqnrfcsxtkksr.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_VKiOB_3pBEdd369kDea7Gw_ZMo-r0sZ";

  // Erlaubt Überschreiben ohne Code-Änderung (z. B. lokal testen):
  //   localStorage.setItem("ft_supabase_url", "https://xyz.supabase.co")
  //   localStorage.setItem("ft_supabase_anon", "eyJhbGciOi...")
  // Diese Werte haben Vorrang, werden aber NIE ins Git committet (lokal only).
  try {
    var lsUrl = window.localStorage.getItem("ft_supabase_url");
    var lsKey = window.localStorage.getItem("ft_supabase_anon");
    if (lsUrl && lsUrl.indexOf("http") === 0) SUPABASE_URL = lsUrl;
    if (lsKey && lsKey.length > 20) SUPABASE_ANON_KEY = lsKey;
  } catch (e) {
    /* localStorage nicht verfügbar – egal, Defaults nutzen */
  }

  function isConfigured() {
    return (
      SUPABASE_URL.indexOf("DEIN-PROJEKT") === -1 &&
      SUPABASE_ANON_KEY.indexOf("DEIN-PUBLIC") === -1 &&
      SUPABASE_URL.indexOf("https://") === 0 &&
      SUPABASE_ANON_KEY.length > 20
    );
  }

  // --------------------------------------------------------------------------
  // 2) CLIENT – wird lazy erstellt, damit die bestehende Seite auch OHNE
  //    ausgefüllte Config ganz normal (mit localStorage) weiterläuft.
  // --------------------------------------------------------------------------
  var _client = null;

  function getClient() {
    if (_client) return _client;
    if (!isConfigured()) {
      throw new Error(
        "Supabase ist noch nicht konfiguriert. Bitte SUPABASE_URL und SUPABASE_ANON_KEY in supabase.js eintragen (siehe README-SUPABASE.md)."
      );
    }
    if (!window.supabase || !window.supabase.createClient) {
      throw new Error(
        "Supabase-SDK (window.supabase) nicht geladen. Bitte zuerst das CDN-Script einbinden: " +
          '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>'
      );
    }
    _client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "ft-supabase-auth",
      },
    });
    return _client;
  }

  // --------------------------------------------------------------------------
  // 3) VERBINDUNGSTEST – braucht KEINE Tabellen, funktioniert also schon
  //    vor jeder Datenbankstruktur. Prüft:
  //    a) SDK geladen, b) URL erreichbar, c) Anon-Key akzeptiert.
  //    Verwendet nur auth.getSession() – das ist ein öffentlicher
  //    Auth-Endpunkt, kein Tabellen-Zugriff, kein RLS-Risiko.
  // --------------------------------------------------------------------------
  async function testConnection() {
    var steps = [];
    var started = Date.now();

    // Schritt 1: SDK?
    if (!window.supabase || !window.supabase.createClient) {
      steps.push({ name: "SDK geladen", ok: false, detail: "window.supabase fehlt. CDN-Script nicht geladen." });
      return { ok: false, steps: steps, ms: Date.now() - started };
    }
    steps.push({ name: "SDK geladen", ok: true, detail: "supabase-js v2 (UMD) bereit." });

    // Schritt 2: Config ausgefüllt?
    if (!isConfigured()) {
      steps.push({
        name: "Konfiguration",
        ok: false,
        detail: "SUPABASE_URL / SUPABASE_ANON_KEY noch Platzhalter. In supabase.js eintragen oder per localStorage (ft_supabase_url / ft_supabase_anon) setzen.",
      });
      return { ok: false, steps: steps, ms: Date.now() - started };
    }
    steps.push({ name: "Konfiguration", ok: true, detail: "URL + Anon-Key vorhanden (nur Längen-/Formatcheck, Key wird nicht geloggt)." });

    // Schritt 3: Echte Netzwerkanfrage (auth.getSession – braucht keine Tabelle)
    try {
      var client = getClient();
      var res = await client.auth.getSession();
      if (res && res.error) throw res.error;
      steps.push({
        name: "Supabase erreichbar",
        ok: true,
        detail: "auth.getSession() erfolgreich in " + (Date.now() - started) + " ms. Projekt antwortet, Anon-Key akzeptiert.",
      });
      return { ok: true, steps: steps, ms: Date.now() - started, url: SUPABASE_URL };
    } catch (err) {
      steps.push({
        name: "Supabase erreichbar",
        ok: false,
        detail: "Netzwerk/Auth-Fehler: " + (err && err.message ? err.message : String(err)),
      });
      return { ok: false, steps: steps, ms: Date.now() - started, error: err };
    }
  }

  // Öffentliche API – bewusst klein halten, damit später
  // Essensplan / Gerichte / Einkaufsliste denselben Client nutzen.
  window.FamilienTafelSupabase = {
    getClient: getClient,
    testConnection: testConnection,
    isConfigured: isConfigured,
    getUrl: function () {
      return SUPABASE_URL;
    },
  };
})();
