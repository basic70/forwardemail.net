# API poczty e-mail {#email-api}

## Spis treści {#table-of-contents}

* [Biblioteki](#libraries)
* [Podstawowy URI](#base-uri)
* [Uwierzytelnianie](#authentication)
* [Błędy](#errors)
* [Lokalizacja](#localization)
* [Paginacja](#pagination)
* [Dzienniki](#logs)
  * [Pobierz dzienniki](#retrieve-logs)
* [Konto](#account)
  * [Utwórz konto](#create-account)
  * [Pobierz konto](#retrieve-account)
  * [Zaktualizuj konto](#update-account)
* [Alias Kontakty (CardDAV)](#alias-contacts-carddav)
  * [Lista kontaktów](#list-contacts)
  * [Utwórz kontakt](#create-contact)
  * [Pobierz kontakt](#retrieve-contact)
  * [Aktualizacja kontaktu](#update-contact)
  * [Usuń kontakt](#delete-contact)
* [Kalendarze aliasów (CalDAV)](#alias-calendars-caldav)
  * [Lista kalendarzy](#list-calendars)
  * [Utwórz kalendarz](#create-calendar)
  * [Pobierz kalendarz](#retrieve-calendar)
  * [Aktualizacja kalendarza](#update-calendar)
  * [Usuń kalendarz](#delete-calendar)
* [Wiadomości aliasowe (IMAP/POP3)](#alias-messages-imappop3)
  * [Lista i wyszukiwanie wiadomości](#list-and-search-for-messages)
  * [Utwórz wiadomość](#create-message)
  * [Pobierz wiadomość](#retrieve-message)
  * [Aktualizuj wiadomość](#update-message)
  * [Usuń wiadomość](#delete-message)
* [Foldery aliasowe (IMAP/POP3)](#alias-folders-imappop3)
  * [Wyświetlanie listy folderów](#list-folders)
  * [Utwórz folder](#create-folder)
  * [Pobierz folder](#retrieve-folder)
  * [Aktualizuj folder](#update-folder)
  * [Usuń folder](#delete-folder)
  * [Kopiuj folder](#copy-folder)
* [Wiadomości e-mail wychodzące](#outbound-emails)
  * [Uzyskaj limit poczty wychodzącej SMTP](#get-outbound-smtp-email-limit)
  * [Wyświetl listę wiadomości e-mail SMTP wychodzących](#list-outbound-smtp-emails)
  * [Utwórz wychodzącą pocztę e-mail SMTP](#create-outbound-smtp-email)
  * [Pobierz wychodzącą pocztę SMTP](#retrieve-outbound-smtp-email)
  * [Usuń wychodzącą pocztę SMTP](#delete-outbound-smtp-email)
* [Domeny](#domains)
  * [Wyświetl domeny](#list-domains)
  * [Utwórz domenę](#create-domain)
  * [Pobierz domenę](#retrieve-domain)
  * [Zweryfikuj rekordy domeny](#verify-domain-records)
  * [Zweryfikuj rekordy SMTP domeny](#verify-domain-smtp-records)
  * [Wyświetl listę haseł uniwersalnych dla całej domeny](#list-domain-wide-catch-all-passwords)
  * [Utwórz uniwersalne hasło obejmujące całą domenę](#create-domain-wide-catch-all-password)
  * [Usuń hasło uniwersalne dla całej domeny](#remove-domain-wide-catch-all-password)
  * [Aktualizacja domeny](#update-domain)
  * [Usuń domenę](#delete-domain)
* [Zaproszenia](#invites)
  * [Zaakceptuj zaproszenie do domeny](#accept-domain-invite)
  * [Utwórz zaproszenie do domeny](#create-domain-invite)
  * [Usuń zaproszenie do domeny](#remove-domain-invite)
* [Członkowie](#members)
  * [Aktualizacja członka domeny](#update-domain-member)
  * [Usuń członka domeny](#remove-domain-member)
* [Pseudonimy](#aliases)
  * [Wygeneruj hasło aliasu](#generate-an-alias-password)
  * [Wyświetl aliasy domen](#list-domain-aliases)
  * [Utwórz nowy alias domeny](#create-new-domain-alias)
  * [Pobierz alias domeny](#retrieve-domain-alias)
  * [Zaktualizuj alias domeny](#update-domain-alias)
  * [Usuń alias domeny](#delete-domain-alias)
* [Szyfruj](#encrypt)
  * [Szyfruj rekord TXT](#encrypt-txt-record)

## Biblioteki {#libraries}

W tej chwili nie opublikowaliśmy jeszcze żadnych wrapperów API, ale planujemy to zrobić w najbliższej przyszłości. Wyślij wiadomość e-mail na adres <api@forwardemail.net>, jeśli chcesz otrzymywać powiadomienia o wydaniu wrappera API dla konkretnego języka programowania. W międzyczasie możesz korzystać z zalecanych bibliotek żądań HTTP w swojej aplikacji lub po prostu użyć [kędzior](https://stackoverflow.com/a/27442239/3586413), jak w poniższych przykładach.

| Język | Biblioteka |
| ---------- | ---------------------------------------------------------------------- |
| Rubin | [Faraday](https://github.com/lostisland/faraday) |
| Pyton | [requests](https://github.com/psf/requests) |
| Jawa | [OkHttp](https://github.com/square/okhttp/) |
| PHP | [guzzle](https://github.com/guzzle/guzzle) |
| JavaScript | [superagent](https://github.com/ladjs/superagent) (jesteśmy konserwatorami) |
| Node.js | [superagent](https://github.com/ladjs/superagent) (jesteśmy konserwatorami) |
| Iść | [net/http](https://golang.org/pkg/net/http/) |
| .NET | [RestSharp](https://github.com/restsharp/RestSharp) |

## Podstawowy URI {#base-uri}

Aktualna ścieżka bazowa URI HTTP to: `BASE_URI`.

## Uwierzytelnianie {#authentication}

Wszystkie punkty końcowe wymagają, aby zmienna [Klucz API](https://forwardemail.net/my-account/security) była ustawiona jako wartość „username” nagłówka [Podstawowa autoryzacja](https://en.wikipedia.org/wiki/Basic_access_authentication) żądania (z wyjątkiem [Alias Kontakty](#alias-contacts), [Kalendarze Alias](#alias-calendars) i [Skrzynki pocztowe Alias](#alias-mailboxes), które używają [wygenerowana nazwa użytkownika i hasło aliasu](/faq#do-you-support-receiving-email-with-imap)).

Nie martw się – jeśli nie jesteś pewien, o co chodzi, poniżej znajdziesz przykłady.

## Błędy {#errors}

Jeśli wystąpią jakiekolwiek błędy, treść odpowiedzi żądania API będzie zawierać szczegółowy komunikat o błędzie.

| Kod | Nazwa |
| ---- | --------------------- |
| 200 | OK |
| 400 | Złe żądanie |
| 401 | Nieautoryzowane |
| 403 | Zabroniony |
| 404 | Nie znaleziono |
| 429 | Zbyt wiele próśb |
| 500 | Wewnętrzny błąd serwera |
| 501 | Nie wdrożono |
| 502 | Zła brama |
| 503 | Usługa niedostępna |
| 504 | Przekroczenie limitu czasu bramy |

> \[!TIP]
> Jeśli otrzymasz kod statusu 5xx (co nie powinno mieć miejsca), skontaktuj się z nami pod adresem <a href="mailto:api@forwardemail.net"><api@forwardemail.net></a>, a natychmiast pomożemy Ci rozwiązać problem.

## Lokalizacja {#localization}

Nasza usługa jest przetłumaczona na ponad 25 różnych języków. Wszystkie komunikaty odpowiedzi API są tłumaczone na ostatnią lokalizację wykrytą przez użytkownika wysyłającego żądanie API. Możesz to zmienić, przekazując niestandardowy nagłówek `Accept-Language`. Możesz to wypróbować, korzystając z menu rozwijanego języków na dole tej strony.

## Paginacja {#pagination}

> \[!NOTE]
> Od 1 listopada 2024 r. punkty końcowe API dla [Wyświetl domeny](#list-domains) i [Wyświetl aliasy domen](#list-domain-aliases) będą domyślnie miały maksymalną liczbę wyników na stronę `1000`. Jeśli chcesz włączyć tę funkcję wcześniej, możesz przekazać `?paginate=true` jako dodatkowy parametr ciągu zapytania do adresu URL zapytania punktu końcowego.

Paginacja jest obsługiwana przez wszystkie punkty końcowe API, które wyświetlają wyniki.

Wystarczy podać właściwości ciągu zapytania `page` (i opcjonalnie `limit`).

Właściwość `page` powinna być liczbą większą lub równą `1`. Jeśli podasz `limit` (również liczbę), minimalna wartość to `10`, a maksymalna to `50` (chyba że zaznaczono inaczej).

| Parametry ciągu zapytania | Wymagany | Typ | Opis |
| --------------------- | -------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `page` | NIE | Numer | Strona wyników do zwrócenia. Jeśli nie zostanie określony, wartość `page` będzie wynosić `1`. Musi to być liczba większa lub równa `1`. |
| `limit` | NIE | Numer | Liczba wyników zwracanych na stronę. Domyślnie `10`, jeśli nie określono. Musi to być liczba większa lub równa `1` i mniejsza lub równa `50`. |

Aby ustalić, czy dostępnych jest więcej wyników, udostępniamy następujące nagłówki odpowiedzi HTTP (które można przeanalizować w celu programowego podziału na strony):

| Nagłówek odpowiedzi HTTP | Przykład | Opis |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `X-Page-Count` | `X-Page-Count: 3` | Łączna liczba dostępnych stron. |
| `X-Page-Current` | `X-Page-Current: 1` | Aktualna strona zwróconych wyników (np. na podstawie parametru ciągu zapytania `page`). |
| `X-Page-Size` | `X-Page-Size: 10` | Łączna liczba wyników zwróconych na stronie (np. na podstawie parametru ciągu zapytania `limit` i faktycznie zwróconych wyników). |
| `X-Item-Count` | `X-Item-Count: 30` | Łączna liczba elementów dostępnych na wszystkich stronach. |
| `Link` | `Link: <https://api.forwardemail.net/v1/emails?page=1>; rel="prev", <https://api.forwardemail.net/v1/emails?page=3>; rel="next", <https://api.forwardemail.net/v1/emails?page=3; rel="last", https://api.forwardemail.net/v1/emails?page=1; rel="first"` | Podajemy nagłówek odpowiedzi HTTP `Link`, który można przeanalizować, jak pokazano w przykładzie. Jest to [similar to GitHub](https://docs.github.com/en/rest/using-the-rest-api/using-pagination-in-the-rest-api#using-link-headers) (np. nie wszystkie wartości zostaną podane, jeśli nie są istotne lub dostępne, np. `"next"` nie zostanie podane, jeśli nie ma innej strony). |

> Przykładowe żądanie:

```sh
curl BASE_URI/v1/domains/DOMAIN_NAME/aliases?page=2&pagination=true \
  -u API_TOKEN:
```

## Rejestruje {#logs}

### Pobierz dzienniki {#retrieve-logs}

Nasze API programowo umożliwia pobieranie logów dla Twojego konta. Wysłanie żądania do tego punktu końcowego spowoduje przetworzenie wszystkich logów dla Twojego konta i wysłanie ich do Ciebie e-mailem w postaci załącznika (skompresowany plik arkusza kalkulacyjnego [Gzip](https://en.wikipedia.org/wiki/Gzip) [CSV](https://en.wikipedia.org/wiki/Comma-separated_values)) po zakończeniu.

Dzięki temu możesz tworzyć zadania w tle z [Zadanie cron](https://en.wikipedia.org/wiki/Cron) lub korzystać z naszego [Oprogramowanie do planowania zadań Node.js Bree](https://github.com/breejs/bree), aby odbierać logi w dowolnym momencie. Pamiętaj, że ten punkt końcowy jest ograniczony do `10` żądań dziennie.

Załącznik to `email-deliverability-logs-YYYY-MM-DD-h-mm-A-z.csv.gz` (pisane małymi literami), a sama wiadomość e-mail zawiera krótkie podsumowanie pobranych logów. Możesz również pobrać logi w dowolnym momencie z [Moje konto → Dzienniki](/my-account/logs).

> `GET /v1/logs/download`

| Parametry ciągu zapytania | Wymagany | Typ | Opis |
| --------------------- | -------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `domain` | NIE | Ciąg (FQDN) | Filtruj logi według w pełni kwalifikowanej domeny („FQDN”). Jeśli tego nie podasz, zostaną pobrane wszystkie logi ze wszystkich domen. |
| `q` | NIE | Smyczkowy | Przeszukaj logi według adresu e-mail, domeny, nazwy aliasu, adresu IP lub daty (format `M/Y`, `M/D/YY`, `M-D`, `M-D-YY` lub `M.D.YY`). |
| `bounce_category` | NIE | Smyczkowy | Wyszukaj dzienniki według określonej kategorii zwrotów (np. `blocklist`). |
| `response_code` | NIE | Numer | Przeszukaj dzienniki według określonego kodu odpowiedzi na błąd (np. `421` lub `550`). |

> Przykładowe żądanie:

```sh
curl BASE_URI/v1/logs/download \
  -u API_TOKEN:
```

> Przykładowe zadanie cron (codziennie o północy):

```sh
0 0 * * * /usr/bin/curl BASE_URI/v1/logs/download -u API_TOKEN: &>/dev/null
```

Należy pamiętać, że do sprawdzenia składni wyrażenia zadania cron można użyć usług takich jak [Crontab.guru](https://crontab.guru/).

> Przykładowe zadanie cron (codziennie o północy **i z logami za poprzedni dzień**):

Dla systemu MacOS:

```sh
0 0 * * * /usr/bin/curl BASE_URI/v1/logs/download?q=`date -v-1d -u "+%-m/%-d/%y"` -u API_TOKEN: &>/dev/null
```

Dla systemów Linux i Ubuntu:

```sh
0 0 * * * /usr/bin/curl BASE_URI/v1/logs/download?q=`date --date "-1 days" -u "+%-m/%-d/%y"` -u API_TOKEN: &>/dev/null
```

## Konto {#account}

### Utwórz konto {#create-account}

> `POST /v1/account`

| Parametr ciała | Wymagany | Typ | Opis |
| -------------- | -------- | -------------- | ------------- |
| `email` | Tak | Ciąg (e-mail) | Adres e-mail |
| `password` | Tak | Smyczkowy | Hasło |

> Przykładowe żądanie:

```sh
curl -X POST BASE_URI/v1/account \
  -u API_TOKEN: \
  -d "email=EMAIL"
```

### Pobierz konto {#retrieve-account}

> `GET /v1/account`

> Przykładowe żądanie:

```sh
curl BASE_URI/v1/account \
  -u API_TOKEN:
```

### Aktualizuj konto {#update-account}

> `PUT /v1/account`

| Parametr ciała | Wymagany | Typ | Opis |
| -------------- | -------- | -------------- | -------------------- |
| `email` | NIE | Ciąg (e-mail) | Adres e-mail |
| `given_name` | NIE | Smyczkowy | Imię |
| `family_name` | NIE | Smyczkowy | Nazwisko |
| `avatar_url` | NIE | Ciąg (URL) | Link do obrazu awatara |

> Przykładowe żądanie:

```sh
curl -X PUT BASE_URI/v1/account \
  -u API_TOKEN: \
  -d "email=EMAIL"
```

## Alias Kontakty (CardDAV) {#alias-contacts-carddav}

> \[!NOTE]
> W przeciwieństwie do innych punktów końcowych API, te wymagają nagłówków autoryzacji podstawowej [Uwierzytelnianie](#authentication) „username” równej nazwie użytkownika aliasu i „password” równemu hasłu wygenerowanemu przez alias.

> \[!WARNING]
> Ta sekcja punktu końcowego jest w trakcie opracowywania i zostanie wydana (mamy nadzieję) w 2024 roku. W międzyczasie prosimy o korzystanie z klienta IMAP z menu rozwijanego „Aplikacje” w nawigacji naszej witryny.

### Wyświetl listę kontaktów {#list-contacts}

> `GET /v1/contacts`

**Wkrótce**

### Utwórz kontakt {#create-contact}

> `POST /v1/contacts`

**Wkrótce**

### Pobierz kontakt {#retrieve-contact}

> `GET /v1/contacts/:id`

**Wkrótce**

### Zaktualizuj kontakt {#update-contact}

> `PUT /v1/contacts/:id`

**Wkrótce**

### Usuń kontakt {#delete-contact}

> `DELETE /v1/contacts/:id`

**Wkrótce**

## Alias Kalendarze (CalDAV) {#alias-calendars-caldav}

> \[!NOTE]
> W przeciwieństwie do innych punktów końcowych API, te wymagają nagłówków autoryzacji podstawowej [Uwierzytelnianie](#authentication) „username” równej nazwie użytkownika aliasu i „password” równemu hasłu wygenerowanemu przez alias.

> \[!WARNING]
> Ta sekcja punktu końcowego jest w trakcie opracowywania i zostanie wydana (mamy nadzieję) w 2024 roku. W międzyczasie prosimy o korzystanie z klienta IMAP z menu rozwijanego „Aplikacje” w nawigacji naszej witryny.

### Wyświetl kalendarze {#list-calendars}

> `GET /v1/calendars`

**Wkrótce**

### Utwórz kalendarz {#create-calendar}

> `POST /v1/calendars`

**Wkrótce**

### Pobierz kalendarz {#retrieve-calendar}

> `GET /v1/calendars/:id`

**Wkrótce**

### Aktualizacja kalendarza {#update-calendar}

> `PUT /v1/calendars/:id`

**Wkrótce**

### Usuń kalendarz {#delete-calendar}

> `DELETE /v1/calendars/:id`

**Wkrótce**

## Wiadomości aliasowe (IMAP/POP3) {#alias-messages-imappop3}

> \[!NOTE]
> W przeciwieństwie do innych punktów końcowych API, te wymagają nagłówków autoryzacji podstawowej [Uwierzytelnianie](#authentication) „username” równej nazwie użytkownika aliasu i „password” równemu hasłu wygenerowanemu przez alias.

> \[!WARNING]
> Ta sekcja punktu końcowego jest w trakcie opracowywania i zostanie wydana (mamy nadzieję) w 2024 roku. W międzyczasie prosimy o korzystanie z klienta IMAP z menu rozwijanego „Aplikacje” w nawigacji naszej witryny.

Upewnij się, że wykonałeś instrukcje konfiguracji dla swojej domeny.

Instrukcje te można znaleźć w naszej sekcji FAQ [Czy obsługujesz odbieranie wiadomości e-mail za pomocą protokołu IMAP?](/faq#do-you-support-receiving-email-with-imap).

### Wyświetl i wyszukaj wiadomości {#list-and-search-for-messages}

> `GET /v1/messages`

**Wkrótce**

### Utwórz wiadomość {#create-message}

> \[!NOTE]
> To polecenie **NIE** wyśle wiadomości e-mail – jedynie doda ją do folderu skrzynki pocztowej (np. działa to podobnie do polecenia IMAP `APPEND`). Jeśli chcesz wysłać wiadomość e-mail, zobacz [Utwórz wychodzącą pocztę e-mail SMTP](#create-outbound-smtp-email) poniżej. Po utworzeniu wychodzącej wiadomości e-mail SMTP możesz dołączyć jej kopię do skrzynki pocztowej swojego aliasu, używając tego punktu końcowego, w celu przechowywania.

> `POST /v1/messages`

**Wkrótce**

### Pobierz wiadomość {#retrieve-message}

> `GET /v1/messages/:id`

**Wkrótce**

### Aktualizacja wiadomości {#update-message}

> `PUT /v1/messages/:id`

**Wkrótce**

### Usuń wiadomość {#delete-message}

> `DELETE /v1/messages:id`

**Wkrótce**

## Foldery aliasowe (IMAP/POP3) {#alias-folders-imappop3}

> \[!TIP]
> Punkty końcowe folderów ze ścieżką <code>/v1/folders/:path</code> jako punktem końcowym są wymienne z identyfikatorem folderu <code>:id</code>. Oznacza to, że można odwołać się do folderu za pomocą wartości <code>path</code> lub <code>id</code>.

> \[!WARNING]
> Ta sekcja punktu końcowego jest w trakcie opracowywania i zostanie wydana (mamy nadzieję) w 2024 roku. W międzyczasie prosimy o korzystanie z klienta IMAP z menu rozwijanego „Aplikacje” w nawigacji naszej witryny.

### Wyświetla listę folderów {#list-folders}

> `GET /v1/folders`

**Wkrótce**

### Utwórz folder {#create-folder}

> `POST /v1/folders`

**Wkrótce**

### Pobierz folder {#retrieve-folder}

> `GET /v1/folders/:id`

**Wkrótce**

### Aktualizacja folderu {#update-folder}

> `PUT /v1/folders/:id`

**Wkrótce**

### Usuń folder {#delete-folder}

> `DELETE /v1/folders/:id`

**Wkrótce**

### Kopiuj folder {#copy-folder}

> `POST /v1/folders/:id/copy`

**Wkrótce**

## Wiadomości e-mail wychodzące {#outbound-emails}

Upewnij się, że wykonałeś instrukcje konfiguracji dla swojej domeny.

Te instrukcje znajdziesz w [Moje konto → Domeny → Ustawienia → Konfiguracja SMTP wychodzącego](/my-account/domains). Musisz skonfigurować DKIM, Return-Path i DMARC, aby wysyłać wiadomości wychodzące SMTP z Twojej domeny.

### Limit wiadomości e-mail SMTP wychodzących {#get-outbound-smtp-email-limit}

Jest to prosty punkt końcowy, który zwraca obiekt JSON zawierający wartości `count` i `limit` określające liczbę dziennych wiadomości wychodzących SMTP dla każdego konta.

> `GET /v1/emails/limit`

> Przykładowe żądanie:

```sh
curl BASE_URI/v1/emails/limit \
  -u API_TOKEN:
```

### Wyświetl listę wiadomości e-mail SMTP wychodzących {#list-outbound-smtp-emails}

Należy pamiętać, że ten punkt końcowy nie zwraca wartości właściwości dla `message`, `headers` ani `rejectedErrors` wiadomości e-mail.

Aby zwrócić te właściwości i ich wartości, użyj punktu końcowego [Pobierz e-mail](#retrieve-email) z identyfikatorem e-mail.

> `GET /v1/emails`

| Parametry ciągu zapytania | Wymagany | Typ | Opis |
| --------------------- | -------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `q` | NIE | Ciąg (obsługiwany przez RegExp) | Wyszukaj wiadomości e-mail według metadanych |
| `domain` | NIE | Ciąg (obsługiwany przez RegExp) | Wyszukaj wiadomości e-mail według nazwy domeny |
| `sort` | NIE | Smyczkowy | Sortuj według konkretnego pola (prefiks z pojedynczym myślnikiem `-` powoduje sortowanie w odwrotnym kierunku niż w przypadku tego pola). Domyślnie `created_at`, jeśli nie jest ustawione. |
| `page` | NIE | Numer | Więcej informacji znajdziesz w [Pagination](#pagination) |
| `limit` | NIE | Numer | Więcej informacji znajdziesz w [Pagination](#pagination) |

> Przykładowe żądanie:

```sh
curl BASE_URI/v1/emails?limit=1 \
  -u API_TOKEN:
```

### Utwórz wychodzącą wiadomość e-mail SMTP {#create-outbound-smtp-email}

Nasze API do tworzenia wiadomości e-mail jest inspirowane konfiguracją opcji wiadomości Nodemailer i wykorzystuje ją. Proszę odwołać się do [Konfiguracja wiadomości Nodemailer](https://nodemailer.com/message/) dla wszystkich poniższych parametrów treści.

Pamiętaj, że z wyjątkiem `envelope` i `dkim` (ponieważ ustawiamy je automatycznie), obsługujemy wszystkie opcje Nodemailera. Ze względów bezpieczeństwa opcje `disableFileAccess` i `disableUrlAccess` są automatycznie ustawiane na `true`.

Należy przekazać pojedynczą opcję `raw` wraz z pełną treścią wiadomości e-mail, łącznie z nagłówkami **lub** przekazać poniższe opcje parametrów treści wiadomości.

Ten punkt końcowy API automatycznie zakoduje emotikony, jeśli znajdą się w nagłówkach (np. temat wiadomości `Subject: 🤓 Hello` zostanie automatycznie przekonwertowany na `Subject: =?UTF-8?Q?=F0=9F=A4=93?= Hello`). Naszym celem było stworzenie niezwykle przyjaznego dla programistów i odpornego na błędy interfejsu API poczty e-mail.

> `POST /v1/emails`

| Parametr ciała | Wymagany | Typ | Opis |
| ---------------- | -------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `from` | NIE | Ciąg (e-mail) | Adres e-mail nadawcy (musi istnieć jako alias domeny). |
| `to` | NIE | Ciąg lub tablica | Lista lub tablica odbiorców rozdzielonych przecinkami dla nagłówka „Do”. |
| `cc` | NIE | Ciąg lub tablica | Lista lub tablica odbiorców oddzielonych przecinkami dla nagłówka „DW”. |
| `bcc` | NIE | Ciąg lub tablica | Lista lub tablica odbiorców oddzielonych przecinkami dla nagłówka „UDW”. |
| `subject` | NIE | Smyczkowy | Temat wiadomości e-mail. |
| `text` | NIE | Ciąg lub bufor | Wersja wiadomości w postaci zwykłego tekstu. |
| `html` | NIE | Ciąg lub bufor | Wersja HTML wiadomości. |
| `attachments` | NIE | Szyk | Tablica obiektów załącznika (patrz [Nodemailer's common fields](https://nodemailer.com/message/#common-fields)). |
| `sender` | NIE | Smyczkowy | Adres e-mail dla nagłówka „Nadawca” (patrz [Nodemailer's more advanced fields](https://nodemailer.com/message/#more-advanced-fields)). |
| `replyTo` | NIE | Smyczkowy | Adres e-mail dla nagłówka „Odpowiedz-Do”. |
| `inReplyTo` | NIE | Smyczkowy | Identyfikator wiadomości, na którą jest odpowiedź. |
| `references` | NIE | Ciąg lub tablica | Lista rozdzielona spacjami lub tablica identyfikatorów wiadomości. |
| `attachDataUrls` | NIE | Boole'a | Jeśli `true`, to konwertuje obrazy `data:` w zawartości HTML wiadomości na osadzone załączniki. |
| `watchHtml` | NIE | Smyczkowy | Wersja wiadomości w formacie HTML przeznaczona dla zegarka Apple Watch ([according to the Nodemailer docs](https://nodemailer.com/message/#content-options]), najnowsze zegarki nie wymagają ustawiania tej opcji). |
| `amp` | NIE | Smyczkowy | Wersja wiadomości w formacie HTML specyficzna dla AMP4EMAIL (patrz [Nodemailer's example](https://nodemailer.com/message/#amp-example)). |
| `icalEvent` | NIE | Obiekt | Wydarzenie iCalendar przeznaczone do wykorzystania jako alternatywna treść wiadomości (patrz [Nodemailer's calendar events](https://nodemailer.com/message/calendar-events/)). |
| `alternatives` | NIE | Szyk | Tablica alternatywnej treści wiadomości (patrz [Nodemailer's alternative content](https://nodemailer.com/message/alternatives/)). |
| `encoding` | NIE | Smyczkowy | Kodowanie tekstu i ciągów HTML (domyślnie `"utf-8"`, ale obsługiwane są również wartości kodowania `"hex"` i `"base64"`). |
| `raw` | NIE | Ciąg lub bufor | Niestandardowo wygenerowana wiadomość w formacie RFC822 do wykorzystania (zamiast wiadomości generowanej przez Nodemailer – patrz [Nodemailer's custom source](https://nodemailer.com/message/custom-source/)). |
| `textEncoding` | NIE | Smyczkowy | Kodowanie, które jest wymuszane dla wartości tekstowych (`"quoted-printable"` lub `"base64"`). Wartością domyślną jest najbliższa wykryta wartość (w przypadku ASCII należy użyć `"quoted-printable"`). |
| `priority` | NIE | Smyczkowy | Poziom priorytetu wiadomości e-mail (może to być `"high"`, `"normal"` (domyślnie) lub `"low"`). Należy pamiętać, że wartość `"normal"` nie ustawia nagłówka priorytetu (jest to zachowanie domyślne). Jeśli ustawiona jest wartość `"high"` lub `"low"`, nagłówki `X-Priority`, `X-MSMail-Priority` i `Importance` ustawiają wartość [will be set accordingly](https://github.com/nodemailer/nodemailer/blob/19fce2dc4dcb83224acaf1cfc890d08126309594/lib/mailer/mail-message.js#L222-L240). |
| `headers` | NIE | Obiekt lub tablica | Obiekt lub tablica dodatkowych pól nagłówka do ustawienia (patrz [Nodemailer's custom headers](https://nodemailer.com/message/custom-headers/)). |
| `messageId` | NIE | Smyczkowy | Opcjonalna wartość Message-ID dla nagłówka „Message-ID” (jeśli nie zostanie ustawiona, automatycznie zostanie utworzona wartość domyślna — należy pamiętać, że wartość powinna wynosić [adhere to the RFC2822 specification](https://stackoverflow.com/a/4031705)). |
| `date` | NIE | Ciąg lub data | Opcjonalna wartość daty, która zostanie użyta, jeśli nagłówek daty nie zostanie przetworzony. W przeciwnym razie, jeśli nie zostanie ustawiony, zostanie użyty bieżący ciąg znaków UTC. Nagłówek daty nie może być wcześniejszy niż 30 dni od czasu bieżącego. |
| `list` | NIE | Obiekt | Opcjonalny obiekt nagłówków `List-*` (patrz [Nodemailer's list headers](https://nodemailer.com/message/list-headers/)). |

> Przykładowe żądanie:

```sh
curl -X POST BASE_URI/v1/emails \
  -u API_TOKEN: \
  -d "from=alias@DOMAIN_NAME" \
  -d "to=EMAIL" \
  -d "subject=test" \
  -d "text=test"
```

> Przykładowe żądanie:

```sh
curl -X POST BASE_URI/v1/emails \
  -u API_TOKEN: \
  -d "raw=`cat file.eml`"
```

### Pobierz wychodzącą wiadomość e-mail SMTP {#retrieve-outbound-smtp-email}

> `GET /v1/emails/:id`

> Przykładowe żądanie:

```sh
curl BASE_URI/v1/emails/:id \
  -u API_TOKEN:
```

### Usuń wychodzącą wiadomość e-mail SMTP {#delete-outbound-smtp-email}

Usunięcie wiadomości e-mail spowoduje ustawienie statusu na `"rejected"` (i nie będzie ona przetwarzana w kolejce) tylko wtedy, gdy aktualny status to `"pending"`, `"queued"` lub `"deferred"`. Możemy automatycznie usuwać wiadomości e-mail po 30 dniach od ich utworzenia i/lub wysłania – dlatego należy zachować kopię wychodzących wiadomości SMTP w kliencie, bazie danych lub aplikacji. W razie potrzeby można odwołać się do wartości naszego identyfikatora e-mail w bazie danych – wartość ta jest zwracana zarówno z punktów końcowych [Utwórz e-mail](#create-email), jak i [Pobierz e-mail](#retrieve-email).

> `DELETE /v1/emails/:id`

> Przykładowe żądanie:

```sh
curl -X DELETE BASE_URI/v1/emails/:id \
  -u API_TOKEN:
```

## Domeny {#domains}

> \[!TIP]
> Punkty końcowe domeny z nazwą domeny <code>/v1/domains/:nazwa_domeny</code> jako punktem końcowym są wymienne z identyfikatorem domeny <code>:id_domeny</code>. Oznacza to, że można odwołać się do domeny za pomocą jej wartości <code>nazwa</code> lub <code>id</code>.

### Wyświetl listę domen {#list-domains}

> \[!NOTE]
> Od 1 listopada 2024 r. punkty końcowe API dla [Wyświetl domeny](#list-domains) i [Wyświetl aliasy domen](#list-domain-aliases) będą domyślnie miały maksymalną liczbę wyników na stronę `1000`. Jeśli chcesz włączyć tę funkcję wcześniej, możesz przekazać `?paginate=true` jako dodatkowy parametr ciągu zapytania do adresu URL zapytania punktu końcowego. Więcej informacji znajdziesz w [Paginacja](#pagination).

> `GET /v1/domains`

| Parametry ciągu zapytania | Wymagany | Typ | Opis |
| --------------------- | -------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `q` | NIE | Ciąg (obsługiwany przez RegExp) | Wyszukaj domeny według nazwy |
| `name` | NIE | Ciąg (obsługiwany przez RegExp) | Wyszukaj domeny według nazwy |
| `sort` | NIE | Smyczkowy | Sortuj według konkretnego pola (prefiks z pojedynczym myślnikiem `-` powoduje sortowanie w odwrotnym kierunku niż w przypadku tego pola). Domyślnie `created_at`, jeśli nie jest ustawione. |
| `page` | NIE | Numer | Więcej informacji znajdziesz w [Pagination](#pagination) |
| `limit` | NIE | Numer | Więcej informacji znajdziesz w [Pagination](#pagination) |

> Przykładowe żądanie:

```sh
curl BASE_URI/v1/domains \
  -u API_TOKEN:
```

### Utwórz domenę {#create-domain}

> `POST /v1/domains`

| Parametr ciała | Wymagany | Typ | Opis |
| ------------------------------ | -------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `domain` | Tak | Ciąg (FQDN lub IP) | W pełni kwalifikowana nazwa domeny („FQDN”) lub adres IP |
| `team_domain` | NIE | Ciąg (ID domeny lub nazwa domeny; FQDN) | Automatycznie przypisz tę domenę do tego samego zespołu z innej domeny. Oznacza to, że wszyscy członkowie z tej domeny zostaną przypisani jako członkowie zespołu, a kod `plan` zostanie automatycznie ustawiony na `team`. W razie potrzeby możesz ustawić kod `"none"`, aby jawnie wyłączyć tę funkcję, ale nie jest to konieczne. |
| `plan` | NIE | Ciąg (wyliczalny) | Typ planu (musi być `"free"`, `"enhanced_protection"` lub `"team"`, domyślnie `"free"` lub bieżący płatny plan użytkownika, jeśli taki posiada) |
| `catchall` | NIE | Ciąg (rozdzielone adresy e-mail) lub wartość logiczna | Utwórz domyślny alias typu catch-all, domyślnie `true` (jeśli `true`, adres e-mail użytkownika API zostanie użyty jako odbiorca, a jeśli `false`, alias typu catch-all nie zostanie utworzony). Jeśli zostanie przekazany ciąg znaków, będzie to lista adresów e-mail, które będą używane jako odbiorcy (rozdzielonych podziałem wiersza, spacją i/lub przecinkiem). |
| `has_adult_content_protection` | NIE | Boole'a | Czy włączyć ochronę antyspamową dla treści dla dorosłych w tej domenie? |
| `has_phishing_protection` | NIE | Boole'a | Czy włączyć ochronę przed phishingiem za pomocą Spam Scanner w tej domenie? |
| `has_executable_protection` | NIE | Boole'a | Czy włączyć ochronę pliku wykonywalnego skanera spamu w tej domenie |
| `has_virus_protection` | NIE | Boole'a | Czy włączyć ochronę antywirusową Spam Scanner w tej domenie |
| `has_recipient_verification` | NIE | Boole'a | Globalna domyślna domena, która określa, czy odbiorcy aliasów mają być zobowiązani do kliknięcia łącza weryfikacyjnego adresu e-mail, aby wiadomości e-mail mogły przez niego przepływać |
| `ignore_mx_check` | NIE | Boole'a | Czy zignorować sprawdzanie rekordu MX w domenie w celu weryfikacji. Dotyczy to głównie użytkowników, którzy mają zaawansowane reguły konfiguracji wymiany MX i muszą zachować swoją istniejącą wymianę MX i przekierować ją do naszej. |
| `retention_days` | NIE | Numer | Liczba całkowita z zakresu od `0` do `30`, która odpowiada liczbie dni retencji wiadomości wychodzących SMTP po ich dostarczeniu lub trwałym błędzie. Domyślnie `0` oznacza, że wiadomości wychodzące SMTP są natychmiast usuwane i redagowane dla Twojego bezpieczeństwa. |
| `bounce_webhook` | NIE | Ciąg (URL) lub wartość logiczna (fałsz) | Wybrany przez Ciebie adres URL webhooka `http://` lub `https://`, do którego mają być wysyłane webhooki z niedostarczonymi wiadomościami. Wyślemy na ten adres URL żądanie `POST` z informacjami o błędach SMTP wychodzących (np. awariach programowych lub sprzętowych – dzięki czemu będziesz mógł zarządzać swoimi subskrybentami i programowo zarządzać pocztą wychodzącą). |
| `max_quota_per_alias` | NIE | Smyczkowy | Maksymalny limit miejsca dla aliasów w tej nazwie domeny. Wprowadź wartość, np. „1 GB”, która zostanie przeanalizowana przez [bytes](https://github.com/visionmedia/bytes.js). |

> Przykładowe żądanie:

```sh
curl -X POST BASE_URI/v1/domains \
  -u API_TOKEN: \
  -d domain=DOMAIN_NAME \
  -d plan=free
```

### Pobierz domenę {#retrieve-domain}

> `GET /v1/domains/DOMAIN_NAME`

> Przykładowe żądanie:

```sh
curl BASE_URI/v1/domains/DOMAIN_NAME \
  -u API_TOKEN:
```

### Zweryfikuj rekordy domeny {#verify-domain-records}

> `GET /v1/domains/DOMAIN_NAME/verify-records`

> Przykładowe żądanie:

```sh
curl BASE_URI/v1/domains/DOMAIN_NAME/verify-records \
  -u API_TOKEN:
```

### Zweryfikuj rekordy SMTP domeny {#verify-domain-smtp-records}

> `GET /v1/domains/DOMAIN_NAME/verify-smtp`

> Przykładowe żądanie:

```sh
curl BASE_URI/v1/domains/DOMAIN_NAME/verify-smtp \
  -u API_TOKEN:
```

### Wyświetl listę haseł uniwersalnych dla całej domeny {#list-domain-wide-catch-all-passwords}

> `GET /v1/domains/DOMAIN_NAME/catch-all-passwords`

> Przykładowe żądanie:

```sh
curl BASE_URI/v1/domains/DOMAIN_NAME/catch-all-passwords \
  -u API_TOKEN:
```

### Utwórz hasło uniwersalne dla całej domeny {#create-domain-wide-catch-all-password}

> `POST /v1/domains/DOMAIN_NAME/catch-all-passwords`

| Parametr ciała | Wymagany | Typ | Opis |
| -------------- | -------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `new_password` | NIE | Smyczkowy | Twoje nowe, niestandardowe hasło, które będzie używane jako hasło uniwersalne dla całej domeny. Pamiętaj, że możesz pozostawić to pole puste lub w ogóle go nie podawać w treści żądania API, jeśli chcesz uzyskać losowo wygenerowane i silne hasło. |
| `description` | NIE | Smyczkowy | Opis ma wyłącznie charakter organizacyjny. |

> Przykładowe żądanie:

```sh
curl BASE_URL/v1/domains/DOMAIN_NAME/catch-all-passwords \
  -u API_TOKEN:
```

### Usuń hasło uniwersalne dla całej domeny {#remove-domain-wide-catch-all-password}

> `DELETE /v1/domains/DOMAIN_NAME/catch-all-passwords/:token_id`

> Przykładowe żądanie:

```sh
curl -X DELETE BASE_URI/v1/domains/:domain_name/catch-all-passwords/:token_id \
  -u API_TOKEN:
```

### Aktualizacja domeny {#update-domain}

> `PUT /v1/domains/DOMAIN_NAME`

| Parametr ciała | Wymagany | Typ | Opis |
| ------------------------------ | -------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `smtp_port` | NIE | Ciąg lub liczba | Niestandardowy port do skonfigurowania dla przekierowania SMTP (domyślnie `"25"`) |
| `has_adult_content_protection` | NIE | Boole'a | Czy włączyć ochronę antyspamową dla treści dla dorosłych w tej domenie? |
| `has_phishing_protection` | NIE | Boole'a | Czy włączyć ochronę przed phishingiem za pomocą Spam Scanner w tej domenie? |
| `has_executable_protection` | NIE | Boole'a | Czy włączyć ochronę pliku wykonywalnego skanera spamu w tej domenie |
| `has_virus_protection` | NIE | Boole'a | Czy włączyć ochronę antywirusową Spam Scanner w tej domenie |
| `has_recipient_verification` | NIE | Boole'a | Globalna domyślna domena, która określa, czy odbiorcy aliasów mają być zobowiązani do kliknięcia łącza weryfikacyjnego adresu e-mail, aby wiadomości e-mail mogły przez niego przepływać |
| `ignore_mx_check` | NIE | Boole'a | Czy zignorować sprawdzanie rekordu MX w domenie w celu weryfikacji. Dotyczy to głównie użytkowników, którzy mają zaawansowane reguły konfiguracji wymiany MX i muszą zachować swoją istniejącą wymianę MX i przekierować ją do naszej. |
| `retention_days` | NIE | Numer | Liczba całkowita z zakresu od `0` do `30`, która odpowiada liczbie dni retencji wiadomości wychodzących SMTP po ich dostarczeniu lub trwałym błędzie. Domyślnie `0` oznacza, że wiadomości wychodzące SMTP są natychmiast usuwane i redagowane dla Twojego bezpieczeństwa. |
| `bounce_webhook` | NIE | Ciąg (URL) lub wartość logiczna (fałsz) | Wybrany przez Ciebie adres URL webhooka `http://` lub `https://`, do którego mają być wysyłane webhooki z niedostarczonymi wiadomościami. Wyślemy na ten adres URL żądanie `POST` z informacjami o błędach SMTP wychodzących (np. awariach programowych lub sprzętowych – dzięki czemu będziesz mógł zarządzać swoimi subskrybentami i programowo zarządzać pocztą wychodzącą). |
| `max_quota_per_alias` | NIE | Smyczkowy | Maksymalny limit miejsca dla aliasów w tej nazwie domeny. Wprowadź wartość, np. „1 GB”, która zostanie przeanalizowana przez [bytes](https://github.com/visionmedia/bytes.js). |

> Przykładowe żądanie:

```sh
curl -X PUT BASE_URI/v1/domains/DOMAIN_NAME \
  -u API_TOKEN:
```

### Usuń domenę {#delete-domain}

> `DELETE /v1/domains/:domain_name`

> Przykładowe żądanie:

```sh
curl -X DELETE BASE_URI/v1/domains/:domain_name \
  -u API_TOKEN:
```

## Zaprasza {#invites}

### Zaakceptuj zaproszenie do domeny {#accept-domain-invite}

> `GET /v1/domains/:domain_name/invites`

> Przykładowe żądanie:

```sh
curl BASE_URI/v1/domains/:domain_name/invites \
  -u API_TOKEN:
```

### Utwórz zaproszenie do domeny {#create-domain-invite}

> `POST /v1/domains/DOMAIN_NAME/invites`

| Parametr ciała | Wymagany | Typ | Opis |
| -------------- | -------- | ------------------- | ----------------------------------------------------------------------------------------- |
| `email` | Tak | Ciąg (e-mail) | Adres e-mail, na który należy wysłać zaproszenie do listy członków domeny |
| `group` | Tak | Ciąg (wyliczalny) | Grupa, do której należy dodać użytkownika, aby był członkiem domeny (może to być jeden z kodów `"admin"` lub `"user"`) |

> Przykładowe żądanie:

```sh
curl -X POST BASE_URI/v1/domains/DOMAIN_NAME/invites \
  -u API_TOKEN: \
  -d "email=EMAIL" \
  -d group=admin
```

> \[!IMPORTANT]
> Jeśli zapraszany użytkownik jest już zaakceptowanym członkiem jakiejkolwiek innej domeny, do której należy zapraszający go administrator, zaproszenie zostanie automatycznie zaakceptowane i wiadomość e-mail nie zostanie wysłana.

### Usuń zaproszenie do domeny {#remove-domain-invite}

> `DELETE /v1/domains/:domain_name/invites`

| Parametr ciała | Wymagany | Typ | Opis |
| -------------- | -------- | -------------- | ------------------------------------------------ |
| `email` | Tak | Ciąg (e-mail) | Adres e-mail do usunięcia z listy członków domeny |

> Przykładowe żądanie:

```sh
curl -X DELETE BASE_URI/v1/domains/:domain_name/invites \
  -u API_TOKEN:
```

## Członkowie {#members}

### Aktualizacja członka domeny {#update-domain-member}

> `PUT /v1/domains/DOMAIN_NAME/members/MEMBER_ID`

| Parametr ciała | Wymagany | Typ | Opis |
| -------------- | -------- | ------------------- | -------------------------------------------------------------------------------------------- |
| `group` | Tak | Ciąg (wyliczalny) | Grupa, do której ma zostać dodany użytkownik, aby uzyskać członkostwo w domenie (może to być jeden z kodów `"admin"` lub `"user"`) |

> Przykładowe żądanie:

```sh
curl -X PUT BASE_URI/v1/domains/DOMAIN_NAME/members/MEMBER_ID \
  -u API_TOKEN:
```

### Usuń członka domeny {#remove-domain-member}

> `DELETE /v1/domains/:domain_name/members/:member_id`

> Przykładowe żądanie:

```sh
curl -X DELETE BASE_URI/v1/domains/:domain_name/members/:member_id \
  -u API_TOKEN:
```

## Aliasy {#aliases}

### Wygeneruj hasło aliasu {#generate-an-alias-password}

Należy pamiętać, że jeśli nie wyślesz instrukcji e-mailem, nazwa użytkownika i hasło zostaną umieszczone w treści odpowiedzi JSON pomyślnego żądania w formacie `{ username: 'alias@yourdomain.com', password: 'some-generated-password' }`.

> `POST /v1/domains/DOMAIN_NAME/aliases/ALIAS_ID/generate-password`

| Parametr ciała | Wymagany | Typ | Opis |
| ---------------------- | -------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `new_password` | NIE | Smyczkowy | Twoje nowe, niestandardowe hasło do aliasu. Pamiętaj, że możesz pozostawić to pole puste lub w ogóle go nie uwzględniać w treści żądania API, jeśli chcesz uzyskać losowo wygenerowane i silne hasło. |
| `password` | NIE | Smyczkowy | Istniejące hasło dla aliasu — aby zmienić hasło bez usuwania istniejącej skrzynki pocztowej IMAP (jeśli nie masz już istniejącego hasła, zobacz opcję `is_override` poniżej). |
| `is_override` | NIE | Boole'a | **UŻYWAJ OSTROŻNIE**: Spowoduje to całkowite zastąpienie istniejącego hasła i bazy danych aliasu, a także trwałe usunięcie istniejącej pamięci masowej IMAP i całkowite zresetowanie bazy danych e-mail SQLite aliasu. Jeśli masz istniejącą skrzynkę pocztową powiązaną z tym aliasem, wykonaj kopię zapasową, jeśli to możliwe. |
| `emailed_instructions` | NIE | Smyczkowy | Adres e-mail, na który należy wysłać hasło aliasu i instrukcję konfiguracji. |

> Przykładowe żądanie:

```sh
curl -X POST BASE_URI/v1/domains/DOMAIN_NAME/aliases/ALIAS_ID/generate-password \
  -u API_TOKEN:
```

### Wyświetl listę aliasów domen {#list-domain-aliases}

> \[!NOTE]
> Od 1 listopada 2024 r. punkty końcowe API dla [Wyświetl domeny](#list-domains) i [Wyświetl aliasy domen](#list-domain-aliases) będą domyślnie miały maksymalną liczbę wyników na stronę `1000`. Jeśli chcesz włączyć tę funkcję wcześniej, możesz przekazać `?paginate=true` jako dodatkowy parametr ciągu zapytania do adresu URL zapytania punktu końcowego. Więcej informacji znajdziesz w [Paginacja](#pagination).

> `GET /v1/domains/DOMAIN_NAME/aliases`

| Parametry ciągu zapytania | Wymagany | Typ | Opis |
| --------------------- | -------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `q` | NIE | Ciąg (obsługiwany przez RegExp) | Wyszukaj aliasów w domenie według nazwy, etykiety lub odbiorcy |
| `name` | NIE | Ciąg (obsługiwany przez RegExp) | Wyszukaj aliasów w domenie według nazwy |
| `recipient` | NIE | Ciąg (obsługiwany przez RegExp) | Wyszukaj aliasów w domenie według odbiorcy |
| `sort` | NIE | Smyczkowy | Sortuj według konkretnego pola (prefiks z pojedynczym myślnikiem `-` powoduje sortowanie w odwrotnym kierunku niż w przypadku tego pola). Domyślnie `created_at`, jeśli nie jest ustawione. |
| `page` | NIE | Numer | Więcej informacji znajdziesz w [Pagination](#pagination) |
| `limit` | NIE | Numer | Więcej informacji znajdziesz w [Pagination](#pagination) |

> Przykładowe żądanie:

```sh
curl BASE_URI/v1/domains/DOMAIN_NAME/aliases?pagination=true \
  -u API_TOKEN:
```

### Utwórz nowy alias domeny {#create-new-domain-alias}

> `POST /v1/domains/DOMAIN_NAME/aliases`

| Parametr ciała | Wymagany | Typ | Opis |
| ------------------------------- | -------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name` | NIE | Smyczkowy | Nazwa aliasu (jeśli nie zostanie podana lub będzie pusta, zostanie wygenerowany losowy alias) |
| `recipients` | NIE | Ciąg lub tablica | Lista odbiorców (musi być ciągiem lub tablicą rozdzielonych podziałem wiersza, spacją i przecinkiem prawidłowych adresów e-mail, w pełni kwalifikowanych nazw domen („FQDN”), adresów IP i/lub adresów URL webhooków – a jeśli nie zostanie podana lub tablica będzie pusta, jako odbiorca zostanie ustawiony adres e-mail użytkownika wysyłającego żądanie API) |
| `description` | NIE | Smyczkowy | Opis aliasu |
| `labels` | NIE | Ciąg lub tablica | Lista etykiet (musi być ciągiem znaków lub tablicą rozdzieloną podziałem wiersza, spacją i przecinkiem) |
| `has_recipient_verification` | NIE | Boole'a | Wymagaj od odbiorców kliknięcia łącza weryfikacyjnego adresu e-mail, aby wiadomości e-mail mogły być przesyłane (domyślnie jest to ustawienie domeny, jeśli nie zostało wyraźnie określone w treści żądania) |
| `is_enabled` | NIE | Boole'a | Czy włączyć, czy wyłączyć ten alias (jeśli wyłączony, wiadomości e-mail nie będą kierowane donikąd, ale będą zwracane kody statusu pomyślnego). Jeśli przekazana zostanie wartość, zostanie ona przekonwertowana na wartość logiczną za pomocą [boolean](https://github.com/thenativeweb/boolean#quick-start)). |
| `error_code_if_disabled` | NIE | Liczba (`250`, `421` lub `550`) | E-maile przychodzące na ten alias zostaną odrzucone, jeśli kod `is_enabled` ma wartość `false` z opcją `250` (ciche dostarczanie donikąd, np. do czarnej dziury lub `/dev/null`), `421` (miękkie odrzucenie; ponawianie prób przez ok. 5 dni) lub `550` oznacza trwałe niepowodzenie i odrzucenie. Domyślnie `250`. |
| `has_imap` | NIE | Boole'a | Określa, czy włączyć, czy wyłączyć przechowywanie danych IMAP dla tego aliasu (jeśli wyłączone, wiadomości e-mail przychodzące nie będą przechowywane w [IMAP storage](/blog/docs/best-quantum-safe-encrypted-email-service). Jeśli przekazana zostanie wartość, zostanie ona przekonwertowana na wartość logiczną przy użyciu [boolean](https://github.com/thenativeweb/boolean#quick-start)) |
| `has_pgp` | NIE | Boole'a | Czy włączyć lub wyłączyć [OpenPGP encryption](/faq#do-you-support-openpgpmime-end-to-end-encryption-e2ee-and-web-key-directory-wkd) dla [IMAP/POP3/CalDAV/CardDAV encrypted email storage](/blog/docs/best-quantum-safe-encrypted-email-service) przy użyciu aliasu `public_key`. |
| `public_key` | NIE | Smyczkowy | Klucz publiczny OpenPGP w formacie ASCII Armor ([click here to view an example](/.well-known/openpgpkey/hu/mxqp8ogw4jfq83a58pn1wy1ccc1cx3f5.txt); np. klucz GPG dla `support@forwardemail.net`). Dotyczy to tylko sytuacji, gdy `has_pgp` jest ustawione na `true`. [Learn more about end-to-end encryption in our FAQ](/faq#do-you-support-openpgpmime-end-to-end-encryption-e2ee-and-web-key-directory-wkd). |
| `max_quota` | NIE | Smyczkowy | Maksymalny limit pamięci dla tego aliasu. Pozostaw puste pole, aby zresetować do bieżącego maksymalnego limitu domeny, lub wprowadź wartość, np. „1 GB”, która zostanie przeanalizowana przez [bytes](https://github.com/visionmedia/bytes.js). Tę wartość mogą zmienić tylko administratorzy domeny. |
| `vacation_responder_is_enabled` | NIE | Boole'a | Czy włączyć lub wyłączyć automatyczną odpowiedź o nieobecności. |
| `vacation_responder_start_date` | NIE | Smyczkowy | Data rozpoczęcia wysyłania wiadomości o nieobecności (jeśli jest włączona i nie ma tu ustawionej daty rozpoczęcia, zakłada się, że aplikacja została już uruchomiona). Obsługujemy formaty dat takie jak `MM/DD/YYYY`, `YYYY-MM-DD` i inne formaty dat poprzez inteligentne parsowanie z użyciem `dayjs`. |
| `vacation_responder_end_date` | NIE | Smyczkowy | Data zakończenia dla funkcji „Odpowiedz na wiadomość o nieobecności” (jeśli ta opcja jest włączona i nie ma tu ustawionej daty zakończenia, funkcja zakłada, że funkcja nigdy się nie kończy i odpowiada w nieskończoność). Obsługujemy formaty dat takie jak `MM/DD/YYYY`, `YYYY-MM-DD` i inne formaty dat za pomocą inteligentnego parsowania z użyciem `dayjs`. |
| `vacation_responder_subject` | NIE | Smyczkowy | Temat wiadomości w postaci zwykłego tekstu, np. „Poza biurem”. Używamy kodu `striptags`, aby usunąć cały kod HTML. |
| `vacation_responder_message` | NIE | Smyczkowy | Wiadomość w postaci zwykłego tekstu dla wiadomości o nieobecności, np. „Będę poza biurem do lutego”. Używamy kodu `striptags`, aby usunąć cały kod HTML. |

> Przykładowe żądanie:

```sh
curl -X POST BASE_URI/v1/domains/DOMAIN_NAME/aliases \
  -u API_TOKEN:
```

### Pobierz alias domeny {#retrieve-domain-alias}

Alias domeny można pobrać według wartości `id` lub `name`.

> `GET /v1/domains/:domain_name/aliases/:alias_id`

> Przykładowe żądanie:

```sh
curl BASE_URI/v1/domains/:domain_name/aliases/:alias_id \
  -u API_TOKEN:
```

> `GET /v1/domains/:domain_name/aliases/:alias_name`

> Przykładowe żądanie:

```sh
curl BASE_URI/v1/domains/:domain_name/aliases/:alias_name \
  -u API_TOKEN:
```

### Zaktualizuj alias domeny {#update-domain-alias}

> `PUT /v1/domains/DOMAIN_NAME/aliases/ALIAS_ID`

| Parametr ciała | Wymagany | Typ | Opis |
| ------------------------------- | -------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name` | NIE | Smyczkowy | Nazwa aliasu |
| `recipients` | NIE | Ciąg lub tablica | Lista odbiorców (musi być ciągiem lub tablicą prawidłowych adresów e-mail, w pełni kwalifikowanych nazw domen („FQDN”), adresów IP i/lub adresów URL webhooków, rozdzielonych podziałem wiersza, spacją i przecinkiem) |
| `description` | NIE | Smyczkowy | Opis aliasu |
| `labels` | NIE | Ciąg lub tablica | Lista etykiet (musi być ciągiem znaków lub tablicą rozdzieloną podziałem wiersza, spacją i przecinkiem) |
| `has_recipient_verification` | NIE | Boole'a | Wymagaj od odbiorców kliknięcia łącza weryfikacyjnego adresu e-mail, aby wiadomości e-mail mogły być przesyłane (domyślnie jest to ustawienie domeny, jeśli nie zostało wyraźnie określone w treści żądania) |
| `is_enabled` | NIE | Boole'a | Czy włączyć, czy wyłączyć ten alias (jeśli wyłączony, wiadomości e-mail nie będą kierowane donikąd, ale będą zwracane kody statusu pomyślnego). Jeśli przekazana zostanie wartość, zostanie ona przekonwertowana na wartość logiczną za pomocą [boolean](https://github.com/thenativeweb/boolean#quick-start)). |
| `error_code_if_disabled` | NIE | Liczba (`250`, `421` lub `550`) | E-maile przychodzące na ten alias zostaną odrzucone, jeśli kod `is_enabled` ma wartość `false` z opcją `250` (ciche dostarczanie donikąd, np. do czarnej dziury lub `/dev/null`), `421` (miękkie odrzucenie; ponawianie prób przez ok. 5 dni) lub `550` oznacza trwałe niepowodzenie i odrzucenie. Domyślnie `250`. |
| `has_imap` | NIE | Boole'a | Określa, czy włączyć, czy wyłączyć przechowywanie danych IMAP dla tego aliasu (jeśli wyłączone, wiadomości e-mail przychodzące nie będą przechowywane w [IMAP storage](/blog/docs/best-quantum-safe-encrypted-email-service). Jeśli przekazana zostanie wartość, zostanie ona przekonwertowana na wartość logiczną przy użyciu [boolean](https://github.com/thenativeweb/boolean#quick-start)) |
| `has_pgp` | NIE | Boole'a | Czy włączyć lub wyłączyć [OpenPGP encryption](/faq#do-you-support-openpgpmime-end-to-end-encryption-e2ee-and-web-key-directory-wkd) dla [IMAP/POP3/CalDAV/CardDAV encrypted email storage](/blog/docs/best-quantum-safe-encrypted-email-service) przy użyciu aliasu `public_key`. |
| `public_key` | NIE | Smyczkowy | Klucz publiczny OpenPGP w formacie ASCII Armor ([click here to view an example](/.well-known/openpgpkey/hu/mxqp8ogw4jfq83a58pn1wy1ccc1cx3f5.txt); np. klucz GPG dla `support@forwardemail.net`). Dotyczy to tylko sytuacji, gdy `has_pgp` jest ustawione na `true`. [Learn more about end-to-end encryption in our FAQ](/faq#do-you-support-openpgpmime-end-to-end-encryption-e2ee-and-web-key-directory-wkd). |
| `max_quota` | NIE | Smyczkowy | Maksymalny limit pamięci dla tego aliasu. Pozostaw puste pole, aby zresetować do bieżącego maksymalnego limitu domeny, lub wprowadź wartość, np. „1 GB”, która zostanie przeanalizowana przez [bytes](https://github.com/visionmedia/bytes.js). Tę wartość mogą zmienić tylko administratorzy domeny. |
| `vacation_responder_is_enabled` | NIE | Boole'a | Czy włączyć lub wyłączyć automatyczną odpowiedź o nieobecności. |
| `vacation_responder_start_date` | NIE | Smyczkowy | Data rozpoczęcia wysyłania wiadomości o nieobecności (jeśli jest włączona i nie ma tu ustawionej daty rozpoczęcia, zakłada się, że aplikacja została już uruchomiona). Obsługujemy formaty dat takie jak `MM/DD/YYYY`, `YYYY-MM-DD` i inne formaty dat poprzez inteligentne parsowanie z użyciem `dayjs`. |
| `vacation_responder_end_date` | NIE | Smyczkowy | Data zakończenia dla funkcji „Odpowiedz na wiadomość o nieobecności” (jeśli ta opcja jest włączona i nie ma tu ustawionej daty zakończenia, funkcja zakłada, że funkcja nigdy się nie kończy i odpowiada w nieskończoność). Obsługujemy formaty dat takie jak `MM/DD/YYYY`, `YYYY-MM-DD` i inne formaty dat za pomocą inteligentnego parsowania z użyciem `dayjs`. |
| `vacation_responder_subject` | NIE | Smyczkowy | Temat wiadomości w postaci zwykłego tekstu, np. „Poza biurem”. Używamy kodu `striptags`, aby usunąć cały kod HTML. |
| `vacation_responder_message` | NIE | Smyczkowy | Wiadomość w postaci zwykłego tekstu dla wiadomości o nieobecności, np. „Będę poza biurem do lutego”. Używamy kodu `striptags`, aby usunąć cały kod HTML. |

> Przykładowe żądanie:

```sh
curl -X PUT BASE_URI/v1/domains/DOMAIN_NAME/aliases/ALIAS_ID \
  -u API_TOKEN:
```

### Usuń alias domeny {#delete-domain-alias}

> `DELETE /v1/domains/:domain_name/aliases/:alias_id`

> Przykładowe żądanie:

```sh
curl -X DELETE BASE_URI/v1/domains/:domain_name/aliases/:alias_id \
  -u API_TOKEN:
```

## Zaszyfruj {#encrypt}

Umożliwiamy szyfrowanie rekordów nawet w ramach darmowego planu, bez żadnych kosztów. Prywatność nie powinna być funkcją, lecz integralną częścią wszystkich aspektów produktu. Zgodnie z gorącymi prośbami w [Dyskusja na temat przewodników dotyczących prywatności](https://discuss.privacyguides.net/t/forward-email-email-provider/13370) i [nasze problemy na GitHubie](https://github.com/forwardemail/forwardemail.net/issues/254), dodaliśmy tę funkcję.

### Szyfruj rekord TXT {#encrypt-txt-record}

> `POST /v1/encrypt`

| Parametr ciała | Wymagany | Typ | Opis |
| -------------- | -------- | ------ | -------------------------------------------- |
| `input` | Tak | Smyczkowy | Dowolny prawidłowy rekord TXT w postaci zwykłego tekstu do przekazania wiadomości e-mail |

> Przykładowe żądanie:

```sh
curl -X POST BASE_URI/v1/encrypt \
  -d "input=user@gmail.com"
```
