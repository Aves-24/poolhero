import type { FilterType, UsageLevel } from "../types";
import type { ParamKey, Status } from "../water";
import type { MeasureKey } from "../reagents";

export type Locale = "pl" | "de";

type Dict = Record<string, string>;

const pl: Dict = {
  // Header / footer
  "footer.disclaimer": "Dawki są przybliżone — zawsze sprawdzaj etykietę preparatu. Normy: basen prywatny.",

  // Auth
  "auth.subtitle": "Zaloguj się kontem Google, aby zarządzać swoimi basenami.",
  "auth.signIn": "Zaloguj się przez Google",

  // Home
  "home.title": "Wybierz profil basenu",
  "home.signOut": "Wyloguj",
  "home.loading": "Ładowanie…",
  "home.noProfiles": "Brak profili. Dodaj pierwszy przyciskiem + poniżej.",
  "home.lastTestToday": "Ostatni test: dzisiaj",
  "home.lastTestOneDay": "Ostatni test: 1 dzień temu",
  "home.lastTestDaysAgo": "Ostatni test: {{n}} dni temu",
  "home.noTests": "Brak testów",
  "home.newProfileTitle": "Nowy profil basenu",
  "home.profileName": "Nazwa profilu",
  "home.profileNamePlaceholder": "np. Basen ogród",
  "home.volumeLabel": "Objętość wody (litry)",
  "home.volumePlaceholder": "np. 24000",
  "home.saving": "Zapisuję…",
  "home.addProfile": "Dodaj profil",
  "home.loadError": "Błąd ładowania",
  "home.addError": "Nie udało się dodać profilu",

  // Pool page
  "pool.notFound": "Nie znaleziono profilu.",
  "pool.backToProfiles": "← Profile",
  "tabs.test": "🧪 Test",
  "tabs.history": "📜 Historia",
  "tabs.settings": "⚙️ Ustawienia",

  // Settings
  "settings.title": "Ustawienia profilu",
  "settings.volumeLabel": "Objętość wody w basenie (litry)",
  "settings.volumeHint": "Np. basen 5×3×1,4 m ≈ 21 000 l",
  "settings.technicalSectionTitle": "Dane techniczne basenu (dla analizy AI)",
  "settings.filterType": "Typ filtra",
  "settings.notProvided": "— nie podano —",
  "settings.sanitizer": "Środek dezynfekujący",
  "settings.sanitizerPlaceholder": "Np. HTH Granulat 90%, Bayrol Chlorifix, aktywny tlen…",
  "settings.sanitizerHint": "Wpisz raz — zostanie zapamiętane i dołączone do analizy AI.",
  "settings.city": "Miasto (lokalizacja basenu)",
  "settings.cityPlaceholder": "Np. Warszawa, Kraków, Berlin…",
  "settings.cityHint": "Gemini pobierze pogodę z ostatnich 7 dni i uwzględni ją w analizie.",
  "settings.usage": "Intensywność użytkowania",
  "settings.covered": "Przykrycie basenu",
  "settings.coveredYes": "Tak — przykrywany",
  "settings.coveredNo": "Nie — odkryty",
  "settings.heated": "Podgrzewanie wody",
  "settings.heatedYes": "Tak — podgrzewany",
  "settings.heatedNo": "Nie — bez ogrzewania",
  "settings.save": "Zapisz ustawienia",
  "settings.saved": "Zapisano ✓",
  "settings.saveError": "Nie udało się zapisać",
  "settings.photoTitle": "Zdjęcie profilowe",
  "settings.photoAdd": "Dodaj zdjęcie",
  "settings.photoChange": "Zmień zdjęcie",
  "settings.photoUploading": "Wysyłam…",
  "settings.photoDelete": "Usuń zdjęcie",
  "settings.photoHint": "Zdjęcie zapisuje się na Google Drive. Wyświetlane jako miniaturka na stronie głównej.",
  "settings.photoDeleteConfirm": "Usunąć zdjęcie?",
  "settings.photoUploadError": "Błąd uploadu",
  "settings.photoDeleteError": "Błąd usuwania",
  "settings.dangerZone": "Strefa niebezpieczna",
  "settings.deleteProfile": "Usuń profil i całą historię testów",
  "settings.deleting": "Usuwam…",
  "settings.deleteHint": "Tej operacji nie można cofnąć.",
  "settings.deleteConfirm": "Usunąć profil „{{name}}\" wraz z całą historią testów? Tej operacji nie można cofnąć.",

  // History
  "history.backToList": "← Lista testów",
  "history.deleteEntry": "🗑 Usuń wpis",
  "history.deleteEntryConfirm": "Usunąć ten wpis z historii?",
  "history.deleteError": "Błąd usuwania",
  "history.noTests": "Brak zapisanych testów. Wykonaj pierwszy w zakładce „Test\".",
  "history.allOk": "Wszystko OK",
  "history.toImprove": "{{n}} do poprawy",

  // Wizard
  "wizard.fullTest": "🧪 Pełny test",
  "wizard.tablets": "Tabletki:",
  "wizard.quickTest": "⚡ Szybki test",
  "wizard.singleMeasure": "🔬 Pojedynczy pomiar",
  "wizard.singleMeasureDesc": "Wybierz jeden parametr do zmierzenia.",
  "wizard.back": "← Wróć",
  "wizard.tabletLabel": "Tabletka:",
  "wizard.stepOf": "Krok {{cur}} z {{total}}",
  "wizard.measurement": "Pomiar",
  "wizard.instruction": "Instrukcja",
  "wizard.enterResult": "Wpisz wynik z wyświetlacza",
  "wizard.stepBack": "← Wstecz",
  "wizard.cancel": "Anuluj",
  "wizard.finish": "Zakończ i pokaż wynik",
  "wizard.next": "Dalej →",
  "wizard.saving": "Zapisuję…",
  "wizard.saveError": "Nie udało się zapisać testu",
  "wizard.resultTitle": "Wynik testu",
  "wizard.newTest": "Nowy test",

  // Measure options
  "measure.ph.label": "pH",
  "measure.ph.description": "Odczyn wody",
  "measure.chlorine.label": "Chlor (wolny + całkowity)",
  "measure.chlorine.description": "Chlor wolny, całkowity i związany",
  "measure.alkalinity.label": "Zasadowość",
  "measure.alkalinity.description": "Kwasowość węglanowa (TA)",
  "measure.cya.label": "Stabilizator (CYA)",
  "measure.cya.description": "Kwas cyjanurowy",

  // Wizard steps (reagents)
  "step.powerOn.title": "1. Włącz urządzenie",
  "step.powerOn.body": "Naciśnij przycisk ON/OFF, aby włączyć PoolLab 1.0.",
  "step.fill.title": "2. Napełnij kuwetę wodą basenową",
  "step.fill.body": "Zanurz urządzenie w basenie lub nalej próbkę wody basenowej do kreski (ok. 10 ml). Wytrzyj kuwetę z zewnątrz do sucha.",
  "step.zero.title": "3. Skalibruj — naciśnij ZERO",
  "step.zero.body": "Z czystą wodą basenową (BEZ żadnej tabletki) naciśnij przycisk ZERO i poczekaj na potwierdzenie. Kalibrację ZERO wykonujesz tylko RAZ — jest ważna dla wszystkich kolejnych pomiarów w tej sesji.",
  "step.freshSample.title": "Wymień próbkę wody",
  "step.freshSample.body": "Wylej wodę z poprzedniego pomiaru, przepłucz kuwetę i napełnij świeżą wodą basenową do kreski. Nie naciskaj ZERO — kalibracja z początku sesji nadal obowiązuje.",
  "step.ph.title": "pH — tabletka Phenol Red",
  "step.ph.body": "Wrzuć 1 tabletkę Phenol Red, rozkrusz mieszadełkiem aż się rozpuści, zamknij i naciśnij przycisk pH. Odczytaj wynik z wyświetlacza i wpisz poniżej.",
  "step.freeCl.title": "Chlor wolny — DPD No. 1",
  "step.freeCl.body": "Wrzuć 1 tabletkę DPD No. 1, rozkrusz aż się rozpuści i naciśnij przycisk Cl (chlor). Odczytaj CHLOR WOLNY i wpisz poniżej.",
  "step.totalCl.title": "Chlor całkowity — DPD No. 3 — NIE WYLEWAJ WODY",
  "step.totalCl.body": "Do TEJ SAMEJ próbki (nie wylewaj!) dodaj 1 tabletkę DPD No. 3, rozkrusz i naciśnij ponownie przycisk Cl. Odczytaj CHLOR CAŁKOWITY i wpisz poniżej. Chlor związany aplikacja policzy sama.",
  "step.alkalinity.title": "Zasadowość — Alkalinity-M",
  "step.alkalinity.body": "Wrzuć 1 tabletkę Alkalinity-M, rozkrusz aż się rozpuści i naciśnij przycisk Alka. Odczytaj wynik i wpisz poniżej.",
  "step.cya.title": "Stabilizator — CYA Test",
  "step.cya.body": "Wrzuć 1 tabletkę CYA Test, rozkrusz aż się rozpuści i naciśnij przycisk CYA. Odczytaj wynik i wpisz poniżej.",

  // Field info panels
  "fieldInfo.ph.purpose": "Odczyn kwasowości wody. Wpływa na skuteczność chloru i komfort pływania — przy złym pH chlor traci działanie nawet przy prawidłowym stężeniu.",
  "fieldInfo.ph.range": "Ideał: 7,2 · Norma: 7,0 – 7,4",
  "fieldInfo.freeCl.purpose": "Aktywny chlor dezynfekujący wodę. Za mało = brak ochrony przed bakteriami, za dużo = podrażnienia skóry i oczu.",
  "fieldInfo.freeCl.range": "Ideał: 2,0 mg/l · Norma: 1,0 – 3,0 mg/l",
  "fieldInfo.totalCl.purpose": "Chlor całkowity = wolny + związany (chloraminy). Aplikacja wyliczy sam chlor związany — to on powoduje charakterystyczny zapach basenu i podrażnienia.",
  "fieldInfo.totalCl.range": "Chlor związany (różnica) max 0,2 mg/l · Im bliżej chloru wolnego, tym lepiej",
  "fieldInfo.alkalinity.purpose": "Bufor stabilizujący pH. Wysoka zasadowość sprawia, że pH jest odporne na skoki po dodaniu chemii lub po deszczu.",
  "fieldInfo.alkalinity.range": "Ideał: 100 mg/l · Norma: 80 – 120 mg/l",
  "fieldInfo.cya.purpose": "Stabilizator chroni chlor przed rozkładem przez promieniowanie UV (słońce). Bez niego chlor w słoneczny dzień może zniknąć w ciągu kilku godzin.",
  "fieldInfo.cya.range": "Ideał: 40 mg/l · Norma: 30 – 50 mg/l",

  // Results table
  "results.noMeasured": "Brak zmierzonych parametrów.",
  "results.allOk": "✅ Woda w normie — wszystkie zmierzone parametry OK.",
  "results.problems": "⚠️ Do poprawy: {{n}} z {{total}} parametrów.",
  "results.tableParam": "Parametr",
  "results.tableResult": "Wynik",
  "results.tableNorm": "Norma",
  "results.tableStatus": "Status",
  "results.whatToDo": "Co zrobić?",
  "results.noData": "Brak danych do rekomendacji.",
  "results.share": "Udostępnij",
  "results.shareTitle": "Udostępnij prompt (WhatsApp, schowek…)",
  "results.copied": "✓ Skopiowano",

  // Param labels
  "param.ph": "pH",
  "param.freeCl": "Chlor wolny",
  "param.combinedCl": "Chlor związany",
  "param.alkalinity": "Zasadowość (TA)",
  "param.cya": "Stabilizator (CYA)",

  // Status labels
  "status.ok": "OK",
  "status.low": "Za mało",
  "status.high": "Za dużo",
  "status.missing": "—",

  // Filter type labels
  "filterType.sand": "Piasek (Sand)",
  "filterType.filterballs": "Filterballs",
  "filterType.cartridge": "Wkład filtracyjny",
  "filterType.de": "Ziemia okrzemkowa (DE)",

  // Usage level labels
  "usageLevel.low": "Rzadkie (kilka razy w tygodniu)",
  "usageLevel.medium": "Regularne (codziennie)",
  "usageLevel.high": "Intensywne (wiele osób / często)",

  // Verdicts / recommendations
  "verdict.missing": "Brak pomiaru",
  "recommendation.missing": "Nie zmierzono tego parametru.",
  "verdict.ok": "W normie ✓",
  "recommendation.ok": "Brak działań — wartość w normie.",

  "verdict.ph.high": "Za wysokie pH",
  "recommendation.ph.high": "Dodaj ok. {{dose}} preparatu pH‑Minus, aby obniżyć pH do ~{{ideal}}.",
  "verdict.ph.low": "Za niskie pH",
  "recommendation.ph.low": "Dodaj ok. {{dose}} preparatu pH‑Plus, aby podnieść pH do ~{{ideal}}.",

  "verdict.freeCl.low": "Za mało chloru",
  "recommendation.freeCl.low": "Dodaj ok. {{dose}} chloru (granulat szybki ~60%), aby podnieść do ~{{ideal}} mg/l.",
  "verdict.freeCl.high": "Za dużo chloru",
  "recommendation.freeCl.high": "Nie dodawaj chloru. Wstrzymaj dozowanie i poczekaj, aż poziom spadnie (kąpiel dozwolona poniżej 3 mg/l). Możesz częściowo wymienić wodę.",

  "verdict.combinedCl.high": "Za dużo chloramin",
  "recommendation.combinedCl.high": "Wykonaj chlorowanie szokowe (przebicie): podnieś chlor wolny ~10× powyżej chloru związanego, aby rozbić chloraminy. Zadbaj o wentylację.",
  "recommendation.combinedCl.ok": "Brak działań — niski poziom chloramin.",

  "verdict.alkalinity.low": "Za niska zasadowość",
  "recommendation.alkalinity.low": "Dodaj ok. {{dose}} preparatu Alka‑Plus (wodorowęglan sodu), aby podnieść do ~{{ideal}} mg/l.",
  "verdict.alkalinity.high": "Za wysoka zasadowość",
  "recommendation.alkalinity.high": "Obniż zasadowość preparatem pH‑Minus (kwas) dozowanym partiami, kontrolując pH. Wysoka TA utrudnia stabilizację pH.",

  "verdict.cya.low": "Za mało stabilizatora",
  "recommendation.cya.low": "Dodaj ok. {{dose}} stabilizatora (kwas cyjanurowy), aby podnieść CYA do ~{{ideal}} mg/l. Dozuj powoli przez skimmer.",
  "verdict.cya.high": "Za dużo stabilizatora",
  "recommendation.cya.high": "Stabilizatora nie da się usunąć chemicznie — częściowo wymień wodę (rozcieńczenie), aby obniżyć CYA. Zbyt wysoki CYA osłabia działanie chloru.",

  // AI / share prompt
  "prompt.intro": "Jesteś doświadczonym technologiem wody basenowej z wieloletnią praktyką w utrzymaniu basenów prywatnych. Mój basen ma {{volume}} litrów wody.",
  "prompt.measuredIntro": "Zmierzyłem wartości wody i moje wyniki są następujące:",
  "prompt.technicalIntro": "Dane techniczne basenu:",
  "prompt.filterLine": "- Typ filtra: {{value}}",
  "prompt.sanitizerLine": "- Środek dezynfekujący: {{value}}",
  "prompt.coveredYes": "- Przykrycie basenu: tak, basen jest przykrywany",
  "prompt.coveredNo": "- Przykrycie basenu: nie, basen odkryty",
  "prompt.heatedYes": "- Podgrzewanie wody: tak, woda jest podgrzewana",
  "prompt.heatedNo": "- Podgrzewanie wody: nie, bez ogrzewania",
  "prompt.usageLine": "- Intensywność użytkowania: {{value}}",
  "prompt.cityLine": "Basen znajduje się w: {{city}}. Sprawdź pogodę dla tego miasta z ostatnich 7 dni i weź ją pod uwagę przy analizie (np. wysokie temperatury i nasłonecznienie rozkładają chlor, deszcz rozcieńcza wodę).",
  "prompt.weatherHeader": "Pogoda dla {{city}} ({{country}}) – ostatnie 7 dni:",
  "prompt.weatherLine": "  {{date}}: {{tmin}}–{{tmax}}°C, opady {{rain}} mm, słońce {{sun}}h",
  "prompt.closing": "Przeanalizuj powyższe dane jak ekspert. Dla każdego parametru krótko opisz: czy jest w normie, dlaczego ma znaczenie i co mogło spowodować odchylenie (uwzględnij dane techniczne basenu, jeśli podano). Następnie zaproponuj konkretny plan działania: jakie preparaty dodać, w jakiej przybliżonej ilości na {{volume}} litrów, w jakiej kolejności i z jakim odstępem czasowym (nie dodawaj kilku produktów naraz — odczekaj i przetestuj ponownie). Na końcu dodaj krótkie podsumowanie w punktach „Jak zadbać o wodę” — zarówno działania natychmiastowe, jak i nawyki na przyszłość (częstotliwość testowania, czas pracy filtracji, szczotkowanie, płukanie filtra, ochrona przed glonami i UV, rola przykrycia). Odpowiedz po polsku, w tonie eksperckim, rzeczowo i praktycznie, z użyciem nagłówków.",
  "prompt.closingWithWeather": "Przeanalizuj powyższe dane jak ekspert. Dla każdego parametru krótko opisz: czy jest w normie, dlaczego ma znaczenie i co mogło spowodować odchylenie — uwzględnij dane techniczne basenu oraz warunki pogodowe z ostatnich 7 dni (np. wysokie temperatury i intensywne nasłonecznienie przyspieszają rozkład chloru, opady mogą rozcieńczyć wodę). Następnie zaproponuj konkretny plan działania: jakie preparaty dodać, w jakiej przybliżonej ilości na {{volume}} litrów, w jakiej kolejności i z jakim odstępem czasowym (nie dodawaj kilku produktów naraz — odczekaj i przetestuj ponownie). Na końcu dodaj krótkie podsumowanie w punktach „Jak zadbać o wodę” — zarówno działania natychmiastowe, jak i nawyki na przyszłość (częstotliwość testowania, czas pracy filtracji, szczotkowanie, płukanie filtra, ochrona przed glonami i UV, rola przykrycia). Odpowiedz po polsku, w tonie eksperckim, rzeczowo i praktycznie, z użyciem nagłówków.",

  // Analyze API errors
  "analyze.missingKey": "Brak klucza GEMINI_API_KEY — skonfiguruj zmienną środowiskową na Vercel.",
  "analyze.quotaError": "Przekroczono limit Gemini API. Włącz billing w Google Cloud Console dla projektu z kluczem API — koszt to ok. $0.00005 za analizę (Gemini 2.0 Flash). Szczegóły: https://console.cloud.google.com/billing",
  "analyze.genericError": "Błąd Gemini API",
};

const de: Dict = {
  "footer.disclaimer": "Dosierungen sind Richtwerte — prüfen Sie immer das Etikett des Produkts. Richtwerte: privater Pool.",

  "auth.subtitle": "Melden Sie sich mit Google an, um Ihre Pools zu verwalten.",
  "auth.signIn": "Mit Google anmelden",

  "home.title": "Pool-Profil auswählen",
  "home.signOut": "Abmelden",
  "home.loading": "Wird geladen…",
  "home.noProfiles": "Keine Profile vorhanden. Fügen Sie mit dem +-Button unten das erste hinzu.",
  "home.lastTestToday": "Letzter Test: heute",
  "home.lastTestOneDay": "Letzter Test: vor 1 Tag",
  "home.lastTestDaysAgo": "Letzter Test: vor {{n}} Tagen",
  "home.noTests": "Keine Tests",
  "home.newProfileTitle": "Neues Pool-Profil",
  "home.profileName": "Profilname",
  "home.profileNamePlaceholder": "z. B. Gartenpool",
  "home.volumeLabel": "Wasservolumen (Liter)",
  "home.volumePlaceholder": "z. B. 24000",
  "home.saving": "Wird gespeichert…",
  "home.addProfile": "Profil hinzufügen",
  "home.loadError": "Fehler beim Laden",
  "home.addError": "Profil konnte nicht hinzugefügt werden",

  "pool.notFound": "Profil nicht gefunden.",
  "pool.backToProfiles": "← Profile",
  "tabs.test": "🧪 Test",
  "tabs.history": "📜 Verlauf",
  "tabs.settings": "⚙️ Einstellungen",

  "settings.title": "Profileinstellungen",
  "settings.volumeLabel": "Wasservolumen im Pool (Liter)",
  "settings.volumeHint": "z. B. Pool 5×3×1,4 m ≈ 21.000 l",
  "settings.technicalSectionTitle": "Technische Pooldaten (für KI-Analyse)",
  "settings.filterType": "Filtertyp",
  "settings.notProvided": "— nicht angegeben —",
  "settings.sanitizer": "Desinfektionsmittel",
  "settings.sanitizerPlaceholder": "z. B. HTH Granulat 90%, Bayrol Chlorifix, Aktivsauerstoff…",
  "settings.sanitizerHint": "Einmal eingeben — wird gespeichert und in die KI-Analyse einbezogen.",
  "settings.city": "Stadt (Standort des Pools)",
  "settings.cityPlaceholder": "z. B. Berlin, München, Warschau…",
  "settings.cityHint": "Gemini ruft das Wetter der letzten 7 Tage ab und berücksichtigt es in der Analyse.",
  "settings.usage": "Nutzungsintensität",
  "settings.covered": "Poolabdeckung",
  "settings.coveredYes": "Ja — abgedeckt",
  "settings.coveredNo": "Nein — offen",
  "settings.heated": "Wassererwärmung",
  "settings.heatedYes": "Ja — beheizt",
  "settings.heatedNo": "Nein — unbeheizt",
  "settings.save": "Einstellungen speichern",
  "settings.saved": "Gespeichert ✓",
  "settings.saveError": "Speichern fehlgeschlagen",
  "settings.photoTitle": "Profilbild",
  "settings.photoAdd": "Bild hinzufügen",
  "settings.photoChange": "Bild ändern",
  "settings.photoUploading": "Wird hochgeladen…",
  "settings.photoDelete": "Bild löschen",
  "settings.photoHint": "Das Bild wird auf Google Drive gespeichert. Es wird als Miniaturbild auf der Startseite angezeigt.",
  "settings.photoDeleteConfirm": "Bild löschen?",
  "settings.photoUploadError": "Fehler beim Hochladen",
  "settings.photoDeleteError": "Fehler beim Löschen",
  "settings.dangerZone": "Gefahrenzone",
  "settings.deleteProfile": "Profil und gesamten Testverlauf löschen",
  "settings.deleting": "Wird gelöscht…",
  "settings.deleteHint": "Diese Aktion kann nicht rückgängig gemacht werden.",
  "settings.deleteConfirm": "Profil „{{name}}\" und den gesamten Testverlauf löschen? Diese Aktion kann nicht rückgängig gemacht werden.",

  "history.backToList": "← Testliste",
  "history.deleteEntry": "🗑 Eintrag löschen",
  "history.deleteEntryConfirm": "Diesen Eintrag aus dem Verlauf löschen?",
  "history.deleteError": "Fehler beim Löschen",
  "history.noTests": "Keine gespeicherten Tests. Führen Sie den ersten im Tab „Test\" durch.",
  "history.allOk": "Alles OK",
  "history.toImprove": "{{n}} zu verbessern",

  "wizard.fullTest": "🧪 Vollständiger Test",
  "wizard.tablets": "Tabletten:",
  "wizard.quickTest": "⚡ Schnelltest",
  "wizard.singleMeasure": "🔬 Einzelmessung",
  "wizard.singleMeasureDesc": "Wählen Sie einen zu messenden Parameter.",
  "wizard.back": "← Zurück",
  "wizard.tabletLabel": "Tablette:",
  "wizard.stepOf": "Schritt {{cur}} von {{total}}",
  "wizard.measurement": "Messung",
  "wizard.instruction": "Anleitung",
  "wizard.enterResult": "Ergebnis vom Display eingeben",
  "wizard.stepBack": "← Zurück",
  "wizard.cancel": "Abbrechen",
  "wizard.finish": "Abschließen und Ergebnis anzeigen",
  "wizard.next": "Weiter →",
  "wizard.saving": "Wird gespeichert…",
  "wizard.saveError": "Test konnte nicht gespeichert werden",
  "wizard.resultTitle": "Testergebnis",
  "wizard.newTest": "Neuer Test",

  "measure.ph.label": "pH",
  "measure.ph.description": "Wasser-pH-Wert",
  "measure.chlorine.label": "Chlor (frei + gesamt)",
  "measure.chlorine.description": "Freies, gesamtes und gebundenes Chlor",
  "measure.alkalinity.label": "Alkalität",
  "measure.alkalinity.description": "Karbonathärte (TA)",
  "measure.cya.label": "Stabilisator (CYA)",
  "measure.cya.description": "Cyanursäure",

  "step.powerOn.title": "1. Gerät einschalten",
  "step.powerOn.body": "Drücken Sie die ON/OFF-Taste, um das PoolLab 1.0 einzuschalten.",
  "step.fill.title": "2. Küvette mit Poolwasser füllen",
  "step.fill.body": "Tauchen Sie das Gerät in den Pool oder füllen Sie eine Poolwasserprobe bis zur Markierung (ca. 10 ml) ein. Wischen Sie die Küvette von außen trocken.",
  "step.zero.title": "3. Kalibrieren — ZERO drücken",
  "step.zero.body": "Drücken Sie mit klarem Poolwasser (OHNE Tablette) die ZERO-Taste und warten Sie auf die Bestätigung. Die ZERO-Kalibrierung führen Sie nur EINMAL durch — sie gilt für alle folgenden Messungen dieser Sitzung.",
  "step.freshSample.title": "Wasserprobe wechseln",
  "step.freshSample.body": "Gießen Sie das Wasser der vorherigen Messung aus, spülen Sie die Küvette und füllen Sie frisches Poolwasser bis zur Markierung ein. Drücken Sie NICHT ZERO — die Kalibrierung vom Sitzungsbeginn gilt weiterhin.",
  "step.ph.title": "pH — Phenol-Red-Tablette",
  "step.ph.body": "Geben Sie 1 Phenol-Red-Tablette hinein, zerdrücken Sie sie mit dem Rührstäbchen bis sie sich auflöst, schließen Sie das Gerät und drücken Sie die pH-Taste. Lesen Sie das Ergebnis vom Display ab und tragen Sie es unten ein.",
  "step.freeCl.title": "Freies Chlor — DPD Nr. 1",
  "step.freeCl.body": "Geben Sie 1 DPD-Nr.-1-Tablette hinein, zerdrücken Sie sie bis sie sich auflöst und drücken Sie die Cl-Taste (Chlor). Lesen Sie das FREIE CHLOR ab und tragen Sie es unten ein.",
  "step.totalCl.title": "Gesamtchlor — DPD Nr. 3 — WASSER NICHT AUSGIESSEN",
  "step.totalCl.body": "Geben Sie zur GLEICHEN Probe (nicht ausgießen!) 1 DPD-Nr.-3-Tablette hinzu, zerdrücken Sie sie und drücken Sie erneut die Cl-Taste. Lesen Sie das GESAMTCHLOR ab und tragen Sie es unten ein. Das gebundene Chlor berechnet die App automatisch.",
  "step.alkalinity.title": "Alkalität — Alkalinity-M",
  "step.alkalinity.body": "Geben Sie 1 Alkalinity-M-Tablette hinein, zerdrücken Sie sie bis sie sich auflöst und drücken Sie die Alka-Taste. Lesen Sie das Ergebnis ab und tragen Sie es unten ein.",
  "step.cya.title": "Stabilisator — CYA-Test",
  "step.cya.body": "Geben Sie 1 CYA-Test-Tablette hinein, zerdrücken Sie sie bis sie sich auflöst und drücken Sie die CYA-Taste. Lesen Sie das Ergebnis ab und tragen Sie es unten ein.",

  "fieldInfo.ph.purpose": "Der Säuregehalt des Wassers. Beeinflusst die Wirksamkeit von Chlor und den Badekomfort — bei falschem pH-Wert verliert Chlor seine Wirkung, selbst bei richtiger Konzentration.",
  "fieldInfo.ph.range": "Ideal: 7,2 · Richtwert: 7,0 – 7,4",
  "fieldInfo.freeCl.purpose": "Aktives Chlor zur Wasserdesinfektion. Zu wenig = kein Schutz vor Bakterien, zu viel = Haut- und Augenreizungen.",
  "fieldInfo.freeCl.range": "Ideal: 2,0 mg/l · Richtwert: 1,0 – 3,0 mg/l",
  "fieldInfo.totalCl.purpose": "Gesamtchlor = frei + gebunden (Chloramine). Die App berechnet automatisch das gebundene Chlor — dieses verursacht den typischen Poolgeruch und Reizungen.",
  "fieldInfo.totalCl.range": "Gebundenes Chlor (Differenz) max. 0,2 mg/l · Je näher am freien Chlor, desto besser",
  "fieldInfo.alkalinity.purpose": "Puffer zur pH-Stabilisierung. Hohe Alkalität macht den pH-Wert widerstandsfähig gegen Schwankungen nach Chemikalienzugabe oder Regen.",
  "fieldInfo.alkalinity.range": "Ideal: 100 mg/l · Richtwert: 80 – 120 mg/l",
  "fieldInfo.cya.purpose": "Der Stabilisator schützt Chlor vor Abbau durch UV-Strahlung (Sonne). Ohne ihn kann Chlor an einem sonnigen Tag innerhalb weniger Stunden verschwinden.",
  "fieldInfo.cya.range": "Ideal: 40 mg/l · Richtwert: 30 – 50 mg/l",

  "results.noMeasured": "Keine gemessenen Parameter.",
  "results.allOk": "✅ Wasser im Normbereich — alle gemessenen Parameter OK.",
  "results.problems": "⚠️ Zu verbessern: {{n}} von {{total}} Parametern.",
  "results.tableParam": "Parameter",
  "results.tableResult": "Ergebnis",
  "results.tableNorm": "Richtwert",
  "results.tableStatus": "Status",
  "results.whatToDo": "Was tun?",
  "results.noData": "Keine Daten für Empfehlungen.",
  "results.share": "Teilen",
  "results.shareTitle": "Prompt teilen (WhatsApp, Zwischenablage…)",
  "results.copied": "✓ Kopiert",

  "param.ph": "pH",
  "param.freeCl": "Freies Chlor",
  "param.combinedCl": "Gebundenes Chlor",
  "param.alkalinity": "Alkalität (TA)",
  "param.cya": "Stabilisator (CYA)",

  "status.ok": "OK",
  "status.low": "Zu niedrig",
  "status.high": "Zu hoch",
  "status.missing": "—",

  "filterType.sand": "Sand",
  "filterType.filterballs": "Filterbälle",
  "filterType.cartridge": "Filterkartusche",
  "filterType.de": "Kieselgur (DE)",

  "usageLevel.low": "Selten (mehrmals pro Woche)",
  "usageLevel.medium": "Regelmäßig (täglich)",
  "usageLevel.high": "Intensiv (viele Personen / oft)",

  "verdict.missing": "Keine Messung",
  "recommendation.missing": "Dieser Parameter wurde nicht gemessen.",
  "verdict.ok": "Im Normbereich ✓",
  "recommendation.ok": "Keine Maßnahmen nötig — Wert im Normbereich.",

  "verdict.ph.high": "pH-Wert zu hoch",
  "recommendation.ph.high": "Fügen Sie ca. {{dose}} pH-Minus hinzu, um den pH-Wert auf ~{{ideal}} zu senken.",
  "verdict.ph.low": "pH-Wert zu niedrig",
  "recommendation.ph.low": "Fügen Sie ca. {{dose}} pH-Plus hinzu, um den pH-Wert auf ~{{ideal}} zu erhöhen.",

  "verdict.freeCl.low": "Zu wenig Chlor",
  "recommendation.freeCl.low": "Fügen Sie ca. {{dose}} Chlor (Schnellgranulat ~60%) hinzu, um auf ~{{ideal}} mg/l zu erhöhen.",
  "verdict.freeCl.high": "Zu viel Chlor",
  "recommendation.freeCl.high": "Kein Chlor hinzufügen. Dosierung stoppen und warten, bis der Wert sinkt (Baden erlaubt unter 3 mg/l). Sie können teilweise Wasser austauschen.",

  "verdict.combinedCl.high": "Zu viele Chloramine",
  "recommendation.combinedCl.high": "Führen Sie eine Stoßchlorung durch: Erhöhen Sie das freie Chlor auf das ~10-fache des gebundenen Chlors, um Chloramine aufzubrechen. Sorgen Sie für Belüftung.",
  "recommendation.combinedCl.ok": "Keine Maßnahmen nötig — niedriger Chloraminwert.",

  "verdict.alkalinity.low": "Alkalität zu niedrig",
  "recommendation.alkalinity.low": "Fügen Sie ca. {{dose}} Alka-Plus (Natriumhydrogencarbonat) hinzu, um auf ~{{ideal}} mg/l zu erhöhen.",
  "verdict.alkalinity.high": "Alkalität zu hoch",
  "recommendation.alkalinity.high": "Senken Sie die Alkalität mit portionsweise dosiertem pH-Minus (Säure) unter pH-Kontrolle. Hohe TA erschwert die pH-Stabilisierung.",

  "verdict.cya.low": "Zu wenig Stabilisator",
  "recommendation.cya.low": "Fügen Sie ca. {{dose}} Stabilisator (Cyanursäure) hinzu, um CYA auf ~{{ideal}} mg/l zu erhöhen. Langsam über den Skimmer dosieren.",
  "verdict.cya.high": "Zu viel Stabilisator",
  "recommendation.cya.high": "Stabilisator kann nicht chemisch entfernt werden — tauschen Sie teilweise Wasser aus (Verdünnung), um CYA zu senken. Zu hoher CYA-Wert schwächt die Chlorwirkung.",

  "prompt.intro": "Sie sind ein erfahrener Wassertechnologe mit langjähriger Praxis in der Pflege privater Pools. Mein Pool hat {{volume}} Liter Wasser.",
  "prompt.measuredIntro": "Ich habe die Wasserwerte gemessen und meine Ergebnisse sind wie folgt:",
  "prompt.technicalIntro": "Technische Pooldaten:",
  "prompt.filterLine": "- Filtertyp: {{value}}",
  "prompt.sanitizerLine": "- Desinfektionsmittel: {{value}}",
  "prompt.coveredYes": "- Poolabdeckung: ja, der Pool ist abgedeckt",
  "prompt.coveredNo": "- Poolabdeckung: nein, der Pool ist offen",
  "prompt.heatedYes": "- Wassererwärmung: ja, das Wasser wird beheizt",
  "prompt.heatedNo": "- Wassererwärmung: nein, unbeheizt",
  "prompt.usageLine": "- Nutzungsintensität: {{value}}",
  "prompt.cityLine": "Der Pool befindet sich in: {{city}}. Prüfen Sie das Wetter der letzten 7 Tage für diese Stadt und berücksichtigen Sie es in der Analyse (z. B. bauen hohe Temperaturen und Sonneneinstrahlung Chlor ab, Regen verdünnt das Wasser).",
  "prompt.weatherHeader": "Wetter für {{city}} ({{country}}) – letzte 7 Tage:",
  "prompt.weatherLine": "  {{date}}: {{tmin}}–{{tmax}}°C, Niederschlag {{rain}} mm, Sonne {{sun}}h",
  "prompt.closing": "Analysieren Sie die obigen Daten wie ein Experte. Beschreiben Sie für jeden Parameter kurz: ob er im Normbereich liegt, warum er wichtig ist und was die Abweichung verursacht haben könnte (berücksichtigen Sie die technischen Pooldaten, falls angegeben). Schlagen Sie anschließend einen konkreten Handlungsplan vor: welche Präparate in welcher ungefähren Menge für {{volume}} Liter, in welcher Reihenfolge und mit welchem zeitlichen Abstand (fügen Sie nicht mehrere Produkte gleichzeitig hinzu — warten Sie und testen Sie erneut). Fügen Sie am Ende eine kurze Zusammenfassung in Stichpunkten „Wie Sie sich um das Wasser kümmern” hinzu — sowohl Sofortmaßnahmen als auch Gewohnheiten für die Zukunft (Testhäufigkeit, Filterlaufzeit, Bürsten, Filterspülung, Algen- und UV-Schutz, Rolle der Abdeckung). Antworten Sie auf Deutsch, im fachkundigen Ton, sachlich und praktisch, mit Überschriften.",
  "prompt.closingWithWeather": "Analysieren Sie die obigen Daten wie ein Experte. Beschreiben Sie für jeden Parameter kurz: ob er im Normbereich liegt, warum er wichtig ist und was die Abweichung verursacht haben könnte — berücksichtigen Sie die technischen Pooldaten sowie die Wetterbedingungen der letzten 7 Tage (z. B. beschleunigen hohe Temperaturen und starke Sonneneinstrahlung den Chlorabbau, Niederschlag kann das Wasser verdünnen). Schlagen Sie anschließend einen konkreten Handlungsplan vor: welche Präparate in welcher ungefähren Menge für {{volume}} Liter, in welcher Reihenfolge und mit welchem zeitlichen Abstand (fügen Sie nicht mehrere Produkte gleichzeitig hinzu — warten Sie und testen Sie erneut). Fügen Sie am Ende eine kurze Zusammenfassung in Stichpunkten „Wie Sie sich um das Wasser kümmern” hinzu — sowohl Sofortmaßnahmen als auch Gewohnheiten für die Zukunft (Testhäufigkeit, Filterlaufzeit, Bürsten, Filterspülung, Algen- und UV-Schutz, Rolle der Abdeckung). Antworten Sie auf Deutsch, im fachkundigen Ton, sachlich und praktisch, mit Überschriften.",

  "analyze.missingKey": "GEMINI_API_KEY fehlt — konfigurieren Sie die Umgebungsvariable auf Vercel.",
  "analyze.quotaError": "Gemini-API-Limit überschritten. Aktivieren Sie die Abrechnung in der Google Cloud Console für das Projekt mit dem API-Schlüssel — Kosten ca. $0,00005 pro Analyse (Gemini 2.0 Flash). Details: https://console.cloud.google.com/billing",
  "analyze.genericError": "Gemini-API-Fehler",
};

const dictionaries: Record<Locale, Dict> = { pl, de };

export function t(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  let str = dictionaries[locale][key] ?? dictionaries.pl[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.split(`{{${k}}}`).join(String(v));
    }
  }
  return str;
}

export function paramLabel(locale: Locale, key: ParamKey): string {
  return t(locale, `param.${key}`);
}

export function statusLabelText(locale: Locale, status: Status): string {
  return t(locale, `status.${status}`);
}

export function filterLabels(locale: Locale): Record<FilterType, string> {
  return {
    sand: t(locale, "filterType.sand"),
    filterballs: t(locale, "filterType.filterballs"),
    cartridge: t(locale, "filterType.cartridge"),
    de: t(locale, "filterType.de"),
  };
}

export function usageLabels(locale: Locale): Record<UsageLevel, string> {
  return {
    low: t(locale, "usageLevel.low"),
    medium: t(locale, "usageLevel.medium"),
    high: t(locale, "usageLevel.high"),
  };
}

export function measureLabel(locale: Locale, key: MeasureKey): string {
  return t(locale, `measure.${key}.label`);
}

export function measureDescription(locale: Locale, key: MeasureKey): string {
  return t(locale, `measure.${key}.description`);
}
