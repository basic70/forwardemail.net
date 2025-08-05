# 이메일 API {#email-api}

## 목차 {#table-of-contents}

* [도서관](#libraries)
* [기본 URI](#base-uri)
* [입증](#authentication)
* [오류](#errors)
* [현지화](#localization)
* [쪽수 매기기](#pagination)
* [로그](#logs)
  * [로그 검색](#retrieve-logs)
* [계정](#account)
  * [계정 생성](#create-account)
  * [계정 검색](#retrieve-account)
  * [계정 업데이트](#update-account)
* [별칭 연락처(CardDAV)](#alias-contacts-carddav)
  * [연락처 목록](#list-contacts)
  * [연락처 만들기](#create-contact)
  * [연락처 검색](#retrieve-contact)
  * [연락처 업데이트](#update-contact)
  * [연락처 삭제](#delete-contact)
* [별칭 달력(CalDAV)](#alias-calendars-caldav)
  * [캘린더 목록](#list-calendars)
  * [캘린더 만들기](#create-calendar)
  * [달력 검색](#retrieve-calendar)
  * [캘린더 업데이트](#update-calendar)
  * [캘린더 삭제](#delete-calendar)
* [별칭 메시지(IMAP/POP3)](#alias-messages-imappop3)
  * [메시지 나열 및 검색](#list-and-search-for-messages)
  * [메시지 작성](#create-message)
  * [메시지 검색](#retrieve-message)
  * [메시지 업데이트](#update-message)
  * [메시지 삭제](#delete-message)
* [별칭 폴더(IMAP/POP3)](#alias-folders-imappop3)
  * [폴더 목록](#list-folders)
  * [폴더 만들기](#create-folder)
  * [폴더 검색](#retrieve-folder)
  * [폴더 업데이트](#update-folder)
  * [폴더 삭제](#delete-folder)
  * [폴더 복사](#copy-folder)
* [아웃바운드 이메일](#outbound-emails)
  * [아웃바운드 SMTP 이메일 제한 가져오기](#get-outbound-smtp-email-limit)
  * [아웃바운드 SMTP 이메일 나열](#list-outbound-smtp-emails)
  * [아웃바운드 SMTP 이메일 생성](#create-outbound-smtp-email)
  * [아웃바운드 SMTP 이메일 검색](#retrieve-outbound-smtp-email)
  * [아웃바운드 SMTP 이메일 삭제](#delete-outbound-smtp-email)
* [도메인](#domains)
  * [도메인 목록](#list-domains)
  * [도메인 생성](#create-domain)
  * [도메인 검색](#retrieve-domain)
  * [도메인 레코드 확인](#verify-domain-records)
  * [도메인 SMTP 레코드 확인](#verify-domain-smtp-records)
  * [도메인 전체의 포괄적인 비밀번호 나열](#list-domain-wide-catch-all-passwords)
  * [도메인 전체에 적용되는 포괄적인 비밀번호 생성](#create-domain-wide-catch-all-password)
  * [도메인 전체의 포괄적인 비밀번호 제거](#remove-domain-wide-catch-all-password)
  * [도메인 업데이트](#update-domain)
  * [도메인 삭제](#delete-domain)
* [초대합니다](#invites)
  * [도메인 초대 수락](#accept-domain-invite)
  * [도메인 초대 만들기](#create-domain-invite)
  * [도메인 초대 제거](#remove-domain-invite)
* [회원들](#members)
  * [도메인 멤버 업데이트](#update-domain-member)
  * [도메인 멤버 제거](#remove-domain-member)
* [별칭](#aliases)
  * [별칭 비밀번호 생성](#generate-an-alias-password)
  * [도메인 별칭 나열](#list-domain-aliases)
  * [새 도메인 별칭 만들기](#create-new-domain-alias)
  * [도메인 별칭 검색](#retrieve-domain-alias)
  * [도메인 별칭 업데이트](#update-domain-alias)
  * [도메인 별칭 삭제](#delete-domain-alias)
* [암호화](#encrypt)
  * [TXT 레코드 암호화](#encrypt-txt-record)

## 라이브러리 {#libraries}

현재 API 래퍼는 출시되지 않았지만, 가까운 시일 내에 출시할 예정입니다. 특정 프로그래밍 언어의 API 래퍼 출시 알림을 받으시려면 <api@forwardemail.net>으로 이메일을 보내주세요. 그동안 애플리케이션에서 추천 HTTP 요청 라이브러리를 사용하거나 아래 예시처럼 [컬](https://stackoverflow.com/a/27442239/3586413)을 사용하시면 됩니다.

| 언어 | 도서관 |
| ---------- | ---------------------------------------------------------------------- |
| 루비 | [Faraday](https://github.com/lostisland/faraday) |
| 파이썬 | [requests](https://github.com/psf/requests) |
| 자바 | [OkHttp](https://github.com/square/okhttp/) |
| PHP | [guzzle](https://github.com/guzzle/guzzle) |
| 자바스크립트 | [superagent](https://github.com/ladjs/superagent) (우리는 유지 관리자입니다) |
| Node.js | [superagent](https://github.com/ladjs/superagent) (우리는 유지 관리자입니다) |
| 가다 | [net/http](https://golang.org/pkg/net/http/) |
| .NET | [RestSharp](https://github.com/restsharp/RestSharp) |

## 기본 URI {#base-uri}

현재 HTTP 기본 URI 경로는 `BASE_URI`입니다.

## 인증 {#authentication}

모든 엔드포인트에서는 [API 키](https://forwardemail.net/my-account/security)을 요청의 [기본 권한 부여](https://en.wikipedia.org/wiki/Basic_access_authentication) 헤더의 "사용자 이름" 값으로 설정해야 합니다([별칭 연락처](#alias-contacts), [별칭 달력](#alias-calendars) 및 [별칭 사서함](#alias-mailboxes)는 예외이며, 이들은 [생성된 별칭 사용자 이름 및 비밀번호](/faq#do-you-support-receiving-email-with-imap)를 사용합니다).

걱정하지 마세요. 이것이 무엇인지 확실하지 않다면 아래에 예를 제공했습니다.

## 오류 {#errors}

오류가 발생하면 API 요청의 응답 본문에 자세한 오류 메시지가 포함됩니다.

| 암호 | 이름 |
| ---- | --------------------- |
| 200 | OK |
| 400 | 잘못된 요청 |
| 401 | 무단 |
| 403 | 금지됨 |
| 404 | 찾을 수 없음 |
| 429 | 요청이 너무 많습니다 |
| 500 | 내부 서버 오류 |
| 501 | 구현되지 않음 |
| 502 | 배드 게이트웨이 |
| 503 | 서비스를 이용할 수 없습니다 |
| 504 | 게이트웨이 시간 초과 |

> \[!TIP]
> 5xx 상태 코드가 표시될 경우(발생해서는 안 되는 현상입니다), <a href="mailto:api@forwardemail.net"><api@forwardemail.net></a>으로 문의해 주시면 즉시 문제를 해결해 드리겠습니다.

## 현지화 {#localization}

저희 서비스는 25개 이상의 언어로 번역됩니다. 모든 API 응답 메시지는 API 요청을 보낸 사용자가 마지막으로 감지한 로캘로 번역됩니다. 사용자 지정 `Accept-Language` 헤더를 전달하여 이 설정을 재정의할 수 있습니다. 이 페이지 하단의 언어 드롭다운을 사용하여 자유롭게 사용해 보세요.

## 페이지 매김 {#pagination}

> \[!NOTE]
> 2024년 11월 1일부터 [도메인 목록](#list-domains) 및 [도메인 별칭 나열](#list-domain-aliases)의 API 엔드포인트는 페이지당 최대 결과 수가 `1000`으로 기본 설정됩니다. 이 동작을 미리 적용하려면 엔드포인트 쿼리 URL에 `?paginate=true`를 추가 쿼리 문자열 매개변수로 전달하면 됩니다.

페이지 매김은 결과를 나열하는 모든 API 엔드포인트에서 지원됩니다.

간단히 쿼리 문자열 속성 `page`(및 선택적으로 `limit`)을 제공하세요.

`page` 속성은 `1`보다 크거나 같은 숫자여야 합니다. `limit`(숫자)를 제공하는 경우, 최소값은 `10`이고 최대값은 `50`입니다(별도로 명시되지 않는 한).

| 쿼리 문자열 매개변수 | 필수의 | 유형 | 설명 |
| --------------------- | -------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `page` | 아니요 | 숫자 | 반환할 결과 페이지입니다. 지정하지 않으면 `page` 값은 `1`이 됩니다. `1`보다 크거나 같은 숫자여야 합니다. |
| `limit` | 아니요 | 숫자 | 페이지당 반환할 결과 수입니다. 지정하지 않으면 기본값은 `10`입니다. `1` 이상, `50` 이하여야 합니다. |

추가 결과가 있는지 확인하기 위해 다음과 같은 HTTP 응답 헤더를 제공합니다(프로그래밍 방식으로 페이지를 나누기 위해 구문 분석 가능):

| HTTP 응답 헤더 | 예 | 설명 |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `X-Page-Count` | `X-Page-Count: 3` | 사용 가능한 총 페이지 수입니다. |
| `X-Page-Current` | `X-Page-Current: 1` | 반환된 결과의 현재 페이지(예: `page` 쿼리 문자열 매개변수 기반). |
| `X-Page-Size` | `X-Page-Size: 10` | 페이지에서 반환된 결과의 총 수(예: `limit` 쿼리 문자열 매개변수와 반환된 실제 결과 기준). |
| `X-Item-Count` | `X-Item-Count: 30` | 모든 페이지에서 사용 가능한 항목의 총 수입니다. |
| `Link` | `Link: <https://api.forwardemail.net/v1/emails?page=1>; rel="prev", <https://api.forwardemail.net/v1/emails?page=3>; rel="next", <https://api.forwardemail.net/v1/emails?page=3; rel="last", https://api.forwardemail.net/v1/emails?page=1; rel="first"` | 예시와 같이 구문 분석할 수 있는 `Link` HTTP 응답 헤더가 제공됩니다. 이는 [similar to GitHub](https://docs.github.com/en/rest/using-the-rest-api/using-pagination-in-the-rest-api#using-link-headers)입니다. (예: 관련성이 없거나 사용할 수 없는 값은 모두 제공되지 않습니다. 예를 들어, 다른 페이지가 없는 경우 `"next"`은 제공되지 않습니다.) |

> 요청 예시:

```sh
curl BASE_URI/v1/domains/DOMAIN_NAME/aliases?page=2&pagination=true \
  -u API_TOKEN:
```

## 로그 {#logs}

### 로그 검색 {#retrieve-logs}

저희 API를 통해 프로그래밍 방식으로 계정 로그를 다운로드할 수 있습니다. 이 엔드포인트에 요청을 제출하면 계정의 모든 로그가 처리되어 완료되면 첨부 파일([지압](https://en.wikipedia.org/wiki/Gzip) 압축 [CSV](https://en.wikipedia.org/wiki/Comma-separated_values) 스프레드시트 파일)로 이메일로 전송됩니다.

이를 통해 [크론 작업](https://en.wikipedia.org/wiki/Cron)을 사용하여 백그라운드 작업을 생성하거나 [Node.js 작업 스케줄링 소프트웨어 Bree](https://github.com/breejs/bree)을 사용하여 원할 때마다 로그를 수신할 수 있습니다. 이 엔드포인트는 하루에 `10`개의 요청으로 제한됩니다.

첨부 파일은 `email-deliverability-logs-YYYY-MM-DD-h-mm-A-z.csv.gz`의 소문자 형식이며, 이메일 자체에는 검색된 로그에 대한 간략한 요약이 포함되어 있습니다. [내 계정 → 로그](/my-account/logs)에서 언제든지 로그를 다운로드할 수도 있습니다.

> `GET /v1/logs/download`

| 쿼리 문자열 매개변수 | 필수의 | 유형 | 설명 |
| --------------------- | -------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `domain` | 아니요 | 문자열(FQDN) | 정규화된 도메인("FQDN")으로 로그를 필터링합니다. FQDN을 제공하지 않으면 모든 도메인의 모든 로그가 검색됩니다. |
| `q` | 아니요 | 끈 | 이메일, 도메인, 별칭 이름, IP 주소 또는 날짜(`M/Y`, `M/D/YY`, `M-D`, `M-D-YY` 또는 `M.D.YY` 형식)로 로그를 검색합니다. |
| `bounce_category` | 아니요 | 끈 | 특정 반송 카테고리(예: `blocklist`)로 로그를 검색합니다. |
| `response_code` | 아니요 | 숫자 | 특정 오류 응답 코드(예: `421` 또는 `550`)로 로그를 검색합니다. |

> 요청 예시:

```sh
curl BASE_URI/v1/logs/download \
  -u API_TOKEN:
```

> Cron 작업 예시(매일 자정):

```sh
0 0 * * * /usr/bin/curl BASE_URI/v1/logs/download -u API_TOKEN: &>/dev/null
```

[Crontab.guru](https://crontab.guru/)와 같은 서비스를 사용하면 Cron 작업 표현식 구문을 검증할 수 있습니다.

> Cron 작업 예시(매일 자정에 **그리고 전날의 로그와 함께**):

MacOS의 경우:

```sh
0 0 * * * /usr/bin/curl BASE_URI/v1/logs/download?q=`date -v-1d -u "+%-m/%-d/%y"` -u API_TOKEN: &>/dev/null
```

Linux 및 Ubuntu의 경우:

```sh
0 0 * * * /usr/bin/curl BASE_URI/v1/logs/download?q=`date --date "-1 days" -u "+%-m/%-d/%y"` -u API_TOKEN: &>/dev/null
```

## 계정 {#account}

### 계정 생성 {#create-account}

> `POST /v1/account`

| 신체 매개변수 | 필수의 | 유형 | 설명 |
| -------------- | -------- | -------------- | ------------- |
| `email` | 예 | 문자열(이메일) | 이메일 주소 |
| `password` | 예 | 끈 | 비밀번호 |

> 요청 예시:

```sh
curl -X POST BASE_URI/v1/account \
  -u API_TOKEN: \
  -d "email=EMAIL"
```

### 계정 검색 {#retrieve-account}

> `GET /v1/account`

> 요청 예시:

```sh
curl BASE_URI/v1/account \
  -u API_TOKEN:
```

### 계정 업데이트 {#update-account}

> `PUT /v1/account`

| 신체 매개변수 | 필수의 | 유형 | 설명 |
| -------------- | -------- | -------------- | -------------------- |
| `email` | 아니요 | 문자열(이메일) | 이메일 주소 |
| `given_name` | 아니요 | 끈 | 이름 |
| `family_name` | 아니요 | 끈 | 성 |
| `avatar_url` | 아니요 | 문자열(URL) | 아바타 이미지에 대한 링크 |

> 요청 예시:

```sh
curl -X PUT BASE_URI/v1/account \
  -u API_TOKEN: \
  -d "email=EMAIL"
```

## 별칭 연락처(CardDAV) {#alias-contacts-carddav}

> \[!NOTE]
> 다른 API 엔드포인트와 달리, 이 엔드포인트는 기본 권한 부여 헤더로 [입증](#authentication) "username"이 별칭 사용자 이름과 동일하고, "password"가 별칭에서 생성된 비밀번호와 동일해야 합니다.

> \[!WARNING]
> 이 엔드포인트 섹션은 현재 개발 중이며 2024년에 출시될 예정입니다(희망 사항). 그동안 웹사이트 탐색 메뉴의 "앱" 드롭다운 메뉴에서 IMAP 클라이언트를 사용해 주세요.

### 연락처 목록 {#list-contacts}

> `GET /v1/contacts`

**곧 출시**

### 연락처 만들기 {#create-contact}

> `POST /v1/contacts`

**곧 출시**

### 연락처 검색 {#retrieve-contact}

> `GET /v1/contacts/:id`

**곧 출시**

### 연락처 업데이트 {#update-contact}

> `PUT /v1/contacts/:id`

**곧 출시**

### 연락처 삭제 {#delete-contact}

> `DELETE /v1/contacts/:id`

**곧 출시**

## 별칭 캘린더(CalDAV) {#alias-calendars-caldav}

> \[!NOTE]
> 다른 API 엔드포인트와 달리, 이 엔드포인트는 기본 권한 부여 헤더로 [입증](#authentication) "username"이 별칭 사용자 이름과 동일하고, "password"가 별칭에서 생성된 비밀번호와 동일해야 합니다.

> \[!WARNING]
> 이 엔드포인트 섹션은 현재 개발 중이며 2024년에 출시될 예정입니다(희망 사항). 그동안 웹사이트 탐색 메뉴의 "앱" 드롭다운 메뉴에서 IMAP 클라이언트를 사용해 주세요.

### 캘린더 목록 {#list-calendars}

> `GET /v1/calendars`

**곧 출시**

### 캘린더 만들기 {#create-calendar}

> `POST /v1/calendars`

**곧 출시**

### 캘린더 검색 {#retrieve-calendar}

> `GET /v1/calendars/:id`

**곧 출시**

### 캘린더 업데이트 {#update-calendar}}

> `PUT /v1/calendars/:id`

**곧 출시**

### 캘린더 삭제 {#delete-calendar}

> `DELETE /v1/calendars/:id`

**곧 출시**

## 별칭 메시지(IMAP/POP3) {#alias-messages-imappop3}

> \[!NOTE]
> 다른 API 엔드포인트와 달리, 이 엔드포인트는 기본 권한 부여 헤더로 [입증](#authentication) "username"이 별칭 사용자 이름과 동일하고, "password"가 별칭에서 생성된 비밀번호와 동일해야 합니다.

> \[!WARNING]
> 이 엔드포인트 섹션은 현재 개발 중이며 2024년에 출시될 예정입니다(희망 사항). 그동안 웹사이트 탐색 메뉴의 "앱" 드롭다운 메뉴에서 IMAP 클라이언트를 사용해 주세요.

귀하의 도메인에 대한 설정 지침을 따랐는지 확인하세요.

해당 지침은 FAQ 섹션 [IMAP을 사용하여 이메일 수신을 지원하시나요?](/faq#do-you-support-receiving-email-with-imap)에서 확인할 수 있습니다.

### 메시지 나열 및 검색 {#list-and-search-for-messages}

> `GET /v1/messages`

**곧 출시**

### 메시지 만들기 {#create-message}

> \[!NOTE]
> 이 명령은 이메일을 **전송**하지 않습니다. 단지 메시지를 사서함 폴더에 추가할 뿐입니다(예: IMAP `APPEND` 명령과 유사). 이메일을 보내려면 아래 [아웃바운드 SMTP 이메일 생성](#create-outbound-smtp-email)를 참조하세요. 아웃바운드 SMTP 이메일을 생성한 후, 이 엔드포인트를 사용하여 별칭 사서함에 사본을 추가하여 저장할 수 있습니다.

> `POST /v1/messages`

**곧 출시**

### 메시지 검색 {#retrieve-message}

> `GET /v1/messages/:id`

**곧 출시**

### 업데이트 메시지 {#update-message}

> `PUT /v1/messages/:id`

**곧 출시**

### 메시지 삭제 {#delete-message}

> `DELETE /v1/messages:id`

**곧 출시**

## 별칭 폴더(IMAP/POP3) {#alias-folders-imappop3}

> \[!TIP]
> 폴더 경로 <code>/v1/folders/:path</code>를 엔드포인트로 사용하는 폴더 엔드포인트는 폴더 ID <code>:id</code>와 상호 교환 가능합니다. 즉, <code>path</code> 또는 <code>id</code> 값으로 폴더를 참조할 수 있습니다.

> \[!WARNING]
> 이 엔드포인트 섹션은 현재 개발 중이며 2024년에 출시될 예정입니다(희망 사항). 그동안 웹사이트 탐색 메뉴의 "앱" 드롭다운 메뉴에서 IMAP 클라이언트를 사용해 주세요.

### 폴더 목록 {#list-folders}

> `GET /v1/folders`

**곧 출시**

### 폴더 만들기 {#create-folder}

> `POST /v1/folders`

**곧 출시**

### 폴더 {#retrieve-folder}}을 검색합니다.

> `GET /v1/folders/:id`

**곧 출시**

### 폴더 업데이트 {#update-folder}}

> `PUT /v1/folders/:id`

**곧 출시**

### 폴더 삭제 {#delete-folder}

> `DELETE /v1/folders/:id`

**곧 출시**

### 폴더 복사 {#copy-folder}

> `POST /v1/folders/:id/copy`

**곧 출시**

## 발신 이메일 {#outbound-emails}

귀하의 도메인에 대한 설정 지침을 따랐는지 확인하세요.

이 지침은 [내 계정 → 도메인 → 설정 → 아웃바운드 SMTP 구성](/my-account/domains)에서 확인할 수 있습니다. 도메인을 사용하여 아웃바운드 SMTP를 전송하려면 DKIM, 반환 경로 및 DMARC를 설정해야 합니다.

### 아웃바운드 SMTP 이메일 제한 가져오기 {#get-outbound-smtp-email-limit}

이는 계정별로 매일 발송되는 SMTP 메시지 수를 나타내는 `count`과 `limit`을 포함하는 JSON 객체를 반환하는 간단한 엔드포인트입니다.

> `GET /v1/emails/limit`

> 요청 예시:

```sh
curl BASE_URI/v1/emails/limit \
  -u API_TOKEN:
```

### 아웃바운드 SMTP 이메일 나열 {#list-outbound-smtp-emails}

이 엔드포인트는 이메일의 `message`, `headers`, `rejectedErrors`에 대한 속성 값을 반환하지 않습니다.

해당 속성과 값을 반환하려면 이메일 ID와 함께 [이메일 검색](#retrieve-email) 엔드포인트를 사용하세요.

> `GET /v1/emails`

| 쿼리 문자열 매개변수 | 필수의 | 유형 | 설명 |
| --------------------- | -------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `q` | 아니요 | 문자열(RegExp 지원) | 메타데이터로 이메일 검색 |
| `domain` | 아니요 | 문자열(RegExp 지원) | 도메인 이름으로 이메일 검색 |
| `sort` | 아니요 | 끈 | 특정 필드를 기준으로 정렬합니다(해당 필드의 역방향으로 정렬하려면 `-`처럼 하이픈 하나를 접두사로 붙입니다). 설정하지 않으면 기본값은 `created_at`입니다. |
| `page` | 아니요 | 숫자 | 자세한 내용은 [Pagination](#pagination)을 참조하세요. |
| `limit` | 아니요 | 숫자 | 자세한 내용은 [Pagination](#pagination)을 참조하세요. |

> 요청 예시:

```sh
curl BASE_URI/v1/emails?limit=1 \
  -u API_TOKEN:
```

### 아웃바운드 SMTP 이메일 생성 {#create-outbound-smtp-email}

이메일 생성을 위한 API는 Nodemailer의 메시지 옵션 구성에서 영감을 받아 개발되었으며, 이를 활용합니다. 아래 모든 본문 매개변수는 [Nodemailer 메시지 구성](https://nodemailer.com/message/)을 참조하세요.

`envelope`과 `dkim`(자동으로 설정됨)을 제외하고 모든 Nodemailer 옵션이 지원됩니다. 보안상의 이유로 `disableFileAccess`와 `disableUrlAccess` 옵션은 `true`로 자동 설정됩니다.

**헤더를 포함한 전체 이메일 원본과 함께 `raw`의 단일 옵션을 전달하거나** 아래에 개별 본문 매개변수 옵션을 전달해야 합니다.

이 API 엔드포인트는 헤더에 이모지가 발견되면 자동으로 인코딩합니다(예: `Subject: 🤓 Hello` 제목은 `Subject: =?UTF-8?Q?=F0=9F=A4=93?= Hello`로 자동 변환됨). 저희의 목표는 개발자 친화적이고 더미 검증이 가능한 이메일 API를 만드는 것이었습니다.

> `POST /v1/emails`

| 신체 매개변수 | 필수의 | 유형 | 설명 |
| ---------------- | -------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `from` | 아니요 | 문자열(이메일) | 발신자의 이메일 주소(도메인의 별칭으로 존재해야 함). |
| `to` | 아니요 | 문자열 또는 배열 | "받는 사람" 헤더에 대한 수신자 목록(쉼표로 구분) 또는 배열입니다. |
| `cc` | 아니요 | 문자열 또는 배열 | "Cc" 헤더에 대한 수신자 목록(쉼표로 구분) 또는 배열입니다. |
| `bcc` | 아니요 | 문자열 또는 배열 | "Bcc" 헤더에 대한 수신자 목록(쉼표로 구분) 또는 배열입니다. |
| `subject` | 아니요 | 끈 | 이메일의 제목. |
| `text` | 아니요 | 문자열 또는 버퍼 | 메시지의 평문 버전. |
| `html` | 아니요 | 문자열 또는 버퍼 | 메시지의 HTML 버전입니다. |
| `attachments` | 아니요 | 정렬 | 첨부 파일 객체의 배열([Nodemailer's common fields](https://nodemailer.com/message/#common-fields) 참조). |
| `sender` | 아니요 | 끈 | "발신자" 헤더의 이메일 주소([Nodemailer's more advanced fields](https://nodemailer.com/message/#more-advanced-fields) 참조). |
| `replyTo` | 아니요 | 끈 | "답장" 헤더에 대한 이메일 주소입니다. |
| `inReplyTo` | 아니요 | 끈 | 메시지가 답장되는 메시지 ID입니다. |
| `references` | 아니요 | 문자열 또는 배열 | 공백으로 구분된 목록 또는 메시지 ID 배열입니다. |
| `attachDataUrls` | 아니요 | 부울 | `true`이면 메시지의 HTML 콘텐츠에 있는 `data:` 이미지를 내장 첨부 파일로 변환합니다. |
| `watchHtml` | 아니요 | 끈 | Apple Watch 전용 HTML 버전의 메시지([according to the Nodemailer docs](https://nodemailer.com/message/#content-options]), 최신 시계에서는 이 설정을 요구하지 않음). |
| `amp` | 아니요 | 끈 | AMP4EMAIL 전용 HTML 버전의 메시지([Nodemailer's example](https://nodemailer.com/message/#amp-example) 참조). |
| `icalEvent` | 아니요 | 물체 | 대체 메시지 콘텐츠로 사용할 iCalendar 이벤트입니다([Nodemailer's calendar events](https://nodemailer.com/message/calendar-events/) 참조). |
| `alternatives` | 아니요 | 정렬 | 대체 메시지 콘텐츠의 배열([Nodemailer's alternative content](https://nodemailer.com/message/alternatives/) 참조). |
| `encoding` | 아니요 | 끈 | 텍스트 및 HTML 문자열에 대한 인코딩(기본값은 `"utf-8"`이지만 `"hex"` 및 `"base64"` 인코딩 값도 지원함). |
| `raw` | 아니요 | 문자열 또는 버퍼 | Nodemailer에서 생성된 메시지 대신 사용할 사용자 지정 RFC822 형식 메시지([Nodemailer's custom source](https://nodemailer.com/message/custom-source/) 참조). |
| `textEncoding` | 아니요 | 끈 | 텍스트 값에 강제로 사용하도록 설정된 인코딩(`"quoted-printable"` 또는 `"base64"`). 기본값은 감지된 값 중 가장 가까운 값입니다(ASCII의 경우 `"quoted-printable"`). |
| `priority` | 아니요 | 끈 | 이메일의 우선순위 수준(`"high"`, `"normal"`(기본값), 또는 `"low"`). `"normal"` 값은 우선순위 헤더를 설정하지 않습니다(이는 기본 동작입니다). `"high"` 또는 `"low"` 값이 설정되면 `X-Priority`, `X-MSMail-Priority`, `Importance` 헤더는 [will be set accordingly](https://github.com/nodemailer/nodemailer/blob/19fce2dc4dcb83224acaf1cfc890d08126309594/lib/mailer/mail-message.js#L222-L240)이 됩니다. |
| `headers` | 아니요 | 객체 또는 배열 | 설정할 추가 헤더 필드의 개체 또는 배열([Nodemailer's custom headers](https://nodemailer.com/message/custom-headers/) 참조). |
| `messageId` | 아니요 | 끈 | "Message-ID" 헤더에 대한 선택적 Message-ID 값(설정하지 않으면 기본값이 자동으로 생성됩니다. 값은 [adhere to the RFC2822 specification](https://stackoverflow.com/a/4031705)이어야 합니다). |
| `date` | 아니요 | 문자열 또는 날짜 | 구문 분석 후 Date 헤더가 누락된 경우 사용되는 선택적 Date 값입니다. 그렇지 않은 경우 현재 UTC 문자열이 사용됩니다. 날짜 헤더는 현재 시간보다 30일 이상 앞설 수 없습니다. |
| `list` | 아니요 | 물체 | `List-*` 헤더의 선택적 개체([Nodemailer's list headers](https://nodemailer.com/message/list-headers/) 참조). |

> 요청 예시:

```sh
curl -X POST BASE_URI/v1/emails \
  -u API_TOKEN: \
  -d "from=alias@DOMAIN_NAME" \
  -d "to=EMAIL" \
  -d "subject=test" \
  -d "text=test"
```

> 요청 예시:

```sh
curl -X POST BASE_URI/v1/emails \
  -u API_TOKEN: \
  -d "raw=`cat file.eml`"
```

### 아웃바운드 SMTP 이메일 검색 {#retrieve-outbound-smtp-email}

> `GET /v1/emails/:id`

> 요청 예시:

```sh
curl BASE_URI/v1/emails/:id \
  -u API_TOKEN:
```

### 아웃바운드 SMTP 이메일 삭제 {#delete-outbound-smtp-email}

이메일을 삭제하면 현재 상태가 `"pending"`, `"queued"` 또는 `"deferred"` 중 하나인 경우에만 상태가 `"rejected"`으로 설정되고 이후 대기열에서 처리되지 않습니다. 이메일은 생성 및/또는 발송 후 30일이 지나면 자동으로 삭제될 수 있으므로 클라이언트, 데이터베이스 또는 애플리케이션에 아웃바운드 SMTP 이메일 사본을 보관해야 합니다. 필요한 경우 데이터베이스에서 이메일 ID 값을 참조할 수 있습니다. 이 값은 [이메일 만들기](#create-email) 및 [이메일 검색](#retrieve-email) 엔드포인트 모두에서 반환됩니다.

> `DELETE /v1/emails/:id`

> 요청 예시:

```sh
curl -X DELETE BASE_URI/v1/emails/:id \
  -u API_TOKEN:
```

## 도메인 {#domains}

> \[!TIP]
> 도메인 이름 <code>/v1/domains/:domain_name</code>을 엔드포인트로 사용하는 도메인 엔드포인트는 도메인 ID <code>:domain_id</code>와 상호 교환 가능합니다. 즉, <code>name</code> 또는 <code>id</code> 값으로 도메인을 참조할 수 있습니다.

### 도메인 목록 {#list-domains}

> \[!NOTE]
> 2024년 11월 1일부터 [도메인 목록](#list-domains) 및 [도메인 별칭 나열](#list-domain-aliases)의 API 엔드포인트는 페이지당 최대 결과 수가 `1000`으로 기본 설정됩니다. 이 동작을 미리 적용하려면 엔드포인트 쿼리 URL에 `?paginate=true`를 추가 쿼리 문자열 매개변수로 전달하면 됩니다. 자세한 내용은 [쪽수 매기기](#pagination)를 참조하세요.

> `GET /v1/domains`

| 쿼리 문자열 매개변수 | 필수의 | 유형 | 설명 |
| --------------------- | -------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `q` | 아니요 | 문자열(RegExp 지원) | 이름으로 도메인 검색 |
| `name` | 아니요 | 문자열(RegExp 지원) | 이름으로 도메인 검색 |
| `sort` | 아니요 | 끈 | 특정 필드를 기준으로 정렬합니다(해당 필드의 역방향으로 정렬하려면 `-`처럼 하이픈 하나를 접두사로 붙입니다). 설정하지 않으면 기본값은 `created_at`입니다. |
| `page` | 아니요 | 숫자 | 자세한 내용은 [Pagination](#pagination)을 참조하세요. |
| `limit` | 아니요 | 숫자 | 자세한 내용은 [Pagination](#pagination)을 참조하세요. |

> 요청 예시:

```sh
curl BASE_URI/v1/domains \
  -u API_TOKEN:
```

### 도메인 {#create-domain}}을 만듭니다.

> `POST /v1/domains`

| 신체 매개변수 | 필수의 | 유형 | 설명 |
| ------------------------------ | -------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `domain` | 예 | 문자열(FQDN 또는 IP) | 정규화된 도메인 이름("FQDN") 또는 IP 주소 |
| `team_domain` | 아니요 | 문자열(도메인 ID 또는 도메인 이름, FQDN) | 이 도메인을 다른 도메인의 동일한 팀에 자동으로 할당합니다. 즉, 이 도메인의 모든 구성원이 팀 구성원으로 할당되고 `plan`도 자동으로 `team`로 설정됩니다. 필요한 경우 이 값을 `"none"`로 설정하여 명시적으로 비활성화할 수 있지만, 반드시 그럴 필요는 없습니다. |
| `plan` | 아니요 | 문자열(열거 가능) | 플랜 유형(`"free"`, `"enhanced_protection"` 또는 `"team"`여야 함, 기본값은 `"free"` 또는 사용자의 현재 유료 플랜(플랜을 사용하는 경우)) |
| `catchall` | 아니요 | 문자열(구분된 이메일 주소) 또는 부울 | 기본 포괄 별칭을 생성합니다. 기본값은 `true`입니다. `true`인 경우 API 사용자의 이메일 주소를 수신자로 사용하고, `false`인 경우 포괄 별칭을 생성하지 않습니다. 문자열을 전달하면 수신자로 사용할 이메일 주소 목록이 구분 기호로 표시됩니다(줄 바꿈, 공백, 쉼표로 구분). |
| `has_adult_content_protection` | 아니요 | 부울 | 이 도메인에서 스팸 스캐너 성인 콘텐츠 보호를 활성화할지 여부 |
| `has_phishing_protection` | 아니요 | 부울 | 이 도메인에서 스팸 스캐너 피싱 보호를 활성화할지 여부 |
| `has_executable_protection` | 아니요 | 부울 | 이 도메인에서 스팸 스캐너 실행 파일 보호를 활성화할지 여부 |
| `has_virus_protection` | 아니요 | 부울 | 이 도메인에서 스팸 스캐너 바이러스 보호 기능을 활성화할지 여부 |
| `has_recipient_verification` | 아니요 | 부울 | 이메일이 통과하기 위해 별칭 수신자가 이메일 확인 링크를 클릭해야 하는지 여부에 대한 글로벌 도메인 기본값 |
| `ignore_mx_check` | 아니요 | 부울 | 도메인의 MX 레코드 확인을 무시할지 여부입니다. 이는 주로 고급 MX 교환 구성 규칙을 사용하고 기존 MX 교환을 그대로 유지하며 저희 MX 교환으로 전달해야 하는 사용자를 위한 기능입니다. |
| `retention_days` | 아니요 | 숫자 | `0`과 `30` 사이의 정수로, 성공적으로 전송되거나 영구적으로 오류가 발생한 아웃바운드 SMTP 이메일을 저장하는 보존 일수에 해당합니다. 기본값은 `0`이며, 보안을 위해 아웃바운드 SMTP 이메일이 즉시 삭제되고 수정됩니다. |
| `bounce_webhook` | 아니요 | 문자열(URL) 또는 부울(false) | 반송 웹훅을 보낼 `http://` 또는 `https://` 웹훅 URL을 선택하세요. 아웃바운드 SMTP 실패(예: 소프트 또는 하드 실패 - 구독자 관리 및 아웃바운드 이메일 프로그래밍 방식 관리 가능)에 대한 정보와 함께 `POST` 요청을 이 URL로 전송합니다. |
| `max_quota_per_alias` | 아니요 | 끈 | 이 도메인 이름에 대한 별칭의 최대 저장 용량입니다. [bytes](https://github.com/visionmedia/bytes.js)에서 구문 분석할 "1GB"와 같은 값을 입력하세요. |

> 요청 예시:

```sh
curl -X POST BASE_URI/v1/domains \
  -u API_TOKEN: \
  -d domain=DOMAIN_NAME \
  -d plan=free
```

### 도메인 {#retrieve-domain}}을 검색합니다.

> `GET /v1/domains/DOMAIN_NAME`

> 요청 예시:

```sh
curl BASE_URI/v1/domains/DOMAIN_NAME \
  -u API_TOKEN:
```

### 도메인 레코드 확인 {#verify-domain-records}

> `GET /v1/domains/DOMAIN_NAME/verify-records`

> 요청 예시:

```sh
curl BASE_URI/v1/domains/DOMAIN_NAME/verify-records \
  -u API_TOKEN:
```

### 도메인 SMTP 레코드 확인 {#verify-domain-smtp-records}

> `GET /v1/domains/DOMAIN_NAME/verify-smtp`

> 요청 예시:

```sh
curl BASE_URI/v1/domains/DOMAIN_NAME/verify-smtp \
  -u API_TOKEN:
```

### 도메인 전체의 포괄적인 비밀번호 나열 {#list-domain-wide-catch-all-passwords}

> `GET /v1/domains/DOMAIN_NAME/catch-all-passwords`

> 요청 예시:

```sh
curl BASE_URI/v1/domains/DOMAIN_NAME/catch-all-passwords \
  -u API_TOKEN:
```

### 도메인 전체에 적용되는 포괄적인 비밀번호 만들기 {#create-domain-wide-catch-all-password}

> `POST /v1/domains/DOMAIN_NAME/catch-all-passwords`

| 신체 매개변수 | 필수의 | 유형 | 설명 |
| -------------- | -------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `new_password` | 아니요 | 끈 | 도메인 전체에 적용되는 포괄적인 비밀번호에 사용할 사용자 지정 새 비밀번호입니다. 무작위로 생성되는 강력한 비밀번호를 받으려면 API 요청 본문에서 이 부분을 비워 두거나 아예 생략할 수 있습니다. |
| `description` | 아니요 | 끈 | 이 설명은 조직 목적으로만 사용됩니다. |

> 요청 예시:

```sh
curl BASE_URL/v1/domains/DOMAIN_NAME/catch-all-passwords \
  -u API_TOKEN:
```

### 도메인 전체의 포괄적인 비밀번호 제거 {#remove-domain-wide-catch-all-password}

> `DELETE /v1/domains/DOMAIN_NAME/catch-all-passwords/:token_id`

> 요청 예시:

```sh
curl -X DELETE BASE_URI/v1/domains/:domain_name/catch-all-passwords/:token_id \
  -u API_TOKEN:
```

### 도메인 업데이트 {#update-domain}

> `PUT /v1/domains/DOMAIN_NAME`

| 신체 매개변수 | 필수의 | 유형 | 설명 |
| ------------------------------ | -------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `smtp_port` | 아니요 | 문자열 또는 숫자 | SMTP 전달을 위해 구성할 사용자 지정 포트(기본값은 `"25"`) |
| `has_adult_content_protection` | 아니요 | 부울 | 이 도메인에서 스팸 스캐너 성인 콘텐츠 보호를 활성화할지 여부 |
| `has_phishing_protection` | 아니요 | 부울 | 이 도메인에서 스팸 스캐너 피싱 보호를 활성화할지 여부 |
| `has_executable_protection` | 아니요 | 부울 | 이 도메인에서 스팸 스캐너 실행 파일 보호를 활성화할지 여부 |
| `has_virus_protection` | 아니요 | 부울 | 이 도메인에서 스팸 스캐너 바이러스 보호 기능을 활성화할지 여부 |
| `has_recipient_verification` | 아니요 | 부울 | 이메일이 통과하기 위해 별칭 수신자가 이메일 확인 링크를 클릭해야 하는지 여부에 대한 글로벌 도메인 기본값 |
| `ignore_mx_check` | 아니요 | 부울 | 도메인의 MX 레코드 확인을 무시할지 여부입니다. 이는 주로 고급 MX 교환 구성 규칙을 사용하고 기존 MX 교환을 그대로 유지하며 저희 MX 교환으로 전달해야 하는 사용자를 위한 기능입니다. |
| `retention_days` | 아니요 | 숫자 | `0`과 `30` 사이의 정수로, 성공적으로 전송되거나 영구적으로 오류가 발생한 아웃바운드 SMTP 이메일을 저장하는 보존 일수에 해당합니다. 기본값은 `0`이며, 보안을 위해 아웃바운드 SMTP 이메일이 즉시 삭제되고 수정됩니다. |
| `bounce_webhook` | 아니요 | 문자열(URL) 또는 부울(false) | 반송 웹훅을 보낼 `http://` 또는 `https://` 웹훅 URL을 선택하세요. 아웃바운드 SMTP 실패(예: 소프트 또는 하드 실패 - 구독자 관리 및 아웃바운드 이메일 프로그래밍 방식 관리 가능)에 대한 정보와 함께 `POST` 요청을 이 URL로 전송합니다. |
| `max_quota_per_alias` | 아니요 | 끈 | 이 도메인 이름에 대한 별칭의 최대 저장 용량입니다. [bytes](https://github.com/visionmedia/bytes.js)에서 구문 분석할 "1GB"와 같은 값을 입력하세요. |

> 요청 예시:

```sh
curl -X PUT BASE_URI/v1/domains/DOMAIN_NAME \
  -u API_TOKEN:
```

### 도메인 삭제 {#delete-domain}

> `DELETE /v1/domains/:domain_name`

> 요청 예시:

```sh
curl -X DELETE BASE_URI/v1/domains/:domain_name \
  -u API_TOKEN:
```

##이 {#invites}}을 초대합니다.

### 도메인 초대 수락 {#accept-domain-invite}

> `GET /v1/domains/:domain_name/invites`

> 요청 예시:

```sh
curl BASE_URI/v1/domains/:domain_name/invites \
  -u API_TOKEN:
```

### 도메인 초대 만들기 {#create-domain-invite}

> `POST /v1/domains/DOMAIN_NAME/invites`

| 신체 매개변수 | 필수의 | 유형 | 설명 |
| -------------- | -------- | ------------------- | ----------------------------------------------------------------------------------------- |
| `email` | 예 | 문자열(이메일) | 도메인 회원 목록에 초대할 이메일 주소 |
| `group` | 예 | 문자열(열거 가능) | 사용자를 도메인 멤버십에 추가할 그룹(`"admin"` 또는 `"user"` 중 하나일 수 있음) |

> 요청 예시:

```sh
curl -X POST BASE_URI/v1/domains/DOMAIN_NAME/invites \
  -u API_TOKEN: \
  -d "email=EMAIL" \
  -d group=admin
```

> \[!IMPORTANT]
> 초대받는 사용자가 이미 다른 도메인의 승인된 회원이고, 초대하는 관리자가 회원으로 등록되어 있는 경우, 초대는 자동으로 승인되고 이메일은 전송되지 않습니다.

### 도메인 초대 삭제 {#remove-domain-invite}

> `DELETE /v1/domains/:domain_name/invites`

| 신체 매개변수 | 필수의 | 유형 | 설명 |
| -------------- | -------- | -------------- | ------------------------------------------------ |
| `email` | 예 | 문자열(이메일) | 도메인 회원 목록에서 제거할 이메일 주소 |

> 요청 예시:

```sh
curl -X DELETE BASE_URI/v1/domains/:domain_name/invites \
  -u API_TOKEN:
```

## 회원 {#members}

### 도메인 멤버 업데이트 {#update-domain-member}

> `PUT /v1/domains/DOMAIN_NAME/members/MEMBER_ID`

| 신체 매개변수 | 필수의 | 유형 | 설명 |
| -------------- | -------- | ------------------- | -------------------------------------------------------------------------------------------- |
| `group` | 예 | 문자열(열거 가능) | 사용자를 도메인 멤버십으로 업데이트할 그룹(`"admin"` 또는 `"user"` 중 하나일 수 있음) |

> 요청 예시:

```sh
curl -X PUT BASE_URI/v1/domains/DOMAIN_NAME/members/MEMBER_ID \
  -u API_TOKEN:
```

### 도메인 구성원 {#remove-domain-member}}을 제거합니다.

> `DELETE /v1/domains/:domain_name/members/:member_id`

> 요청 예시:

```sh
curl -X DELETE BASE_URI/v1/domains/:domain_name/members/:member_id \
  -u API_TOKEN:
```

## 별칭 {#aliases}

### 별칭 비밀번호 생성 {#generate-an-alias-password}

지침을 이메일로 보내지 않으면 사용자 이름과 비밀번호는 성공적인 요청의 JSON 응답 본문에 `{ username: 'alias@yourdomain.com', password: 'some-generated-password' }` 형식으로 포함됩니다.

> `POST /v1/domains/DOMAIN_NAME/aliases/ALIAS_ID/generate-password`

| 신체 매개변수 | 필수의 | 유형 | 설명 |
| ---------------------- | -------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `new_password` | 아니요 | 끈 | 별칭에 사용할 사용자 지정 새 비밀번호입니다. 무작위로 생성되고 강력한 비밀번호를 받으려면 API 요청 본문에서 이 부분을 비워 두거나 아예 생략할 수 있습니다. |
| `password` | 아니요 | 끈 | 별칭에 대한 기존 비밀번호를 사용하여 기존 IMAP 사서함 저장소를 삭제하지 않고 비밀번호를 변경할 수 있습니다(기존 비밀번호가 더 이상 없는 경우 아래의 `is_override` 옵션 참조). |
| `is_override` | 아니요 | 부울 | **주의해서 사용하세요**: 이 옵션을 사용하면 기존 별칭 비밀번호와 데이터베이스가 완전히 무시되고, 기존 IMAP 저장소가 영구적으로 삭제되며 별칭의 SQLite 이메일 데이터베이스가 완전히 재설정됩니다. 이 별칭에 기존 사서함이 연결되어 있는 경우 가능하면 백업해 두세요. |
| `emailed_instructions` | 아니요 | 끈 | 별칭 비밀번호와 설정 지침을 보낼 이메일 주소입니다. |

> 요청 예시:

```sh
curl -X POST BASE_URI/v1/domains/DOMAIN_NAME/aliases/ALIAS_ID/generate-password \
  -u API_TOKEN:
```

### 도메인 별칭 목록 {#list-domain-aliases}

> \[!NOTE]
> 2024년 11월 1일부터 [도메인 목록](#list-domains) 및 [도메인 별칭 나열](#list-domain-aliases)의 API 엔드포인트는 페이지당 최대 결과 수가 `1000`으로 기본 설정됩니다. 이 동작을 미리 적용하려면 엔드포인트 쿼리 URL에 `?paginate=true`를 추가 쿼리 문자열 매개변수로 전달하면 됩니다. 자세한 내용은 [쪽수 매기기](#pagination)를 참조하세요.

> `GET /v1/domains/DOMAIN_NAME/aliases`

| 쿼리 문자열 매개변수 | 필수의 | 유형 | 설명 |
| --------------------- | -------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `q` | 아니요 | 문자열(RegExp 지원) | 이름, 레이블 또는 수신자로 도메인의 별칭 검색 |
| `name` | 아니요 | 문자열(RegExp 지원) | 이름으로 도메인의 별칭 검색 |
| `recipient` | 아니요 | 문자열(RegExp 지원) | 수신자별로 도메인의 별칭 검색 |
| `sort` | 아니요 | 끈 | 특정 필드를 기준으로 정렬합니다(해당 필드의 역방향으로 정렬하려면 `-`처럼 하이픈 하나를 접두사로 붙입니다). 설정하지 않으면 기본값은 `created_at`입니다. |
| `page` | 아니요 | 숫자 | 자세한 내용은 [Pagination](#pagination)을 참조하세요. |
| `limit` | 아니요 | 숫자 | 자세한 내용은 [Pagination](#pagination)을 참조하세요. |

> 요청 예시:

```sh
curl BASE_URI/v1/domains/DOMAIN_NAME/aliases?pagination=true \
  -u API_TOKEN:
```

### 새 도메인 별칭 만들기 {#create-new-domain-alias}

> `POST /v1/domains/DOMAIN_NAME/aliases`

| 신체 매개변수 | 필수의 | 유형 | 설명 |
| ------------------------------- | -------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name` | 아니요 | 끈 | 별칭 이름(제공되지 않거나 비어 있는 경우 무작위 별칭이 생성됩니다) |
| `recipients` | 아니요 | 문자열 또는 배열 | 수신자 목록(줄 바꿈/공백/쉼표로 구분된 문자열 또는 유효한 이메일 주소, 정규화된 도메인 이름("FQDN"), IP 주소 및/또는 웹훅 URL의 배열이어야 함 - 제공되지 않거나 빈 배열인 경우 API 요청을 하는 사용자의 이메일이 수신자로 설정됨) |
| `description` | 아니요 | 끈 | 별칭 설명 |
| `labels` | 아니요 | 문자열 또는 배열 | 라벨 목록(줄 바꿈/공백/쉼표로 구분된 문자열 또는 배열이어야 함) |
| `has_recipient_verification` | 아니요 | 부울 | 이메일이 통과하려면 수신자가 이메일 확인 링크를 클릭하도록 요구합니다(요청 본문에 명시적으로 설정되지 않은 경우 도메인 설정이 기본값으로 지정됨) |
| `is_enabled` | 아니요 | 부울 | 이 별칭을 활성화할지 비활성화할지 여부(비활성화 시 이메일은 아무 곳으로도 라우팅되지 않고 성공 상태 코드를 반환합니다). 값이 전달되면 [boolean](https://github.com/thenativeweb/boolean#quick-start)을 사용하여 부울로 변환됩니다. |
| `error_code_if_disabled` | 아니요 | 숫자(`250`, `421` 또는 `550`) | 이 별칭으로 수신되는 이메일은 `is_enabled`이 `false`이고, `250`(블랙홀 또는 `/dev/null` 등 아무 곳에도 조용히 전달되지 않음), `421`(약식 거부, 최대 5일 동안 재시도), 또는 `550`(영구 실패 및 거부)인 경우 거부됩니다. 기본값은 `250`입니다. |
| `has_imap` | 아니요 | 부울 | 이 별칭에 대해 IMAP 저장소를 활성화할지 비활성화할지 여부(비활성화된 경우 수신된 인바운드 이메일이 [IMAP storage](/blog/docs/best-quantum-safe-encrypted-email-service)에 저장되지 않음. 값이 전달되면 [boolean](https://github.com/thenativeweb/boolean#quick-start)을 사용하여 부울로 변환됨) |
| `has_pgp` | 아니요 | 부울 | 별칭 `public_key`을 사용하여 [IMAP/POP3/CalDAV/CardDAV encrypted email storage](/blog/docs/best-quantum-safe-encrypted-email-service)에 대해 [OpenPGP encryption](/faq#do-you-support-openpgpmime-end-to-end-encryption-e2ee-and-web-key-directory-wkd)을 활성화할지 비활성화할지 여부입니다. |
| `public_key` | 아니요 | 끈 | ASCII Armor 형식의 OpenPGP 공개 키([click here to view an example](/.well-known/openpgpkey/hu/mxqp8ogw4jfq83a58pn1wy1ccc1cx3f5.txt); 예: `support@forwardemail.net`에 대한 GPG 키). 이는 `has_pgp`을 `true`로 설정한 경우에만 적용됩니다. [Learn more about end-to-end encryption in our FAQ](/faq#do-you-support-openpgpmime-end-to-end-encryption-e2ee-and-web-key-directory-wkd). |
| `max_quota` | 아니요 | 끈 | 이 별칭에 대한 최대 저장 용량 할당량입니다. 도메인의 현재 최대 용량으로 재설정하려면 비워 두거나, [bytes](https://github.com/visionmedia/bytes.js)에서 구문 분석할 "1GB"와 같은 값을 입력하세요. 이 값은 도메인 관리자만 조정할 수 있습니다. |
| `vacation_responder_is_enabled` | 아니요 | 부울 | 자동 휴가 응답 기능을 활성화할지 비활성화할지 여부. |
| `vacation_responder_start_date` | 아니요 | 끈 | 휴가 응답 시작일(활성화되어 있고 시작일이 설정되지 않은 경우 이미 시작된 것으로 간주합니다). `MM/DD/YYYY`, `YYYY-MM-DD`과 같은 날짜 형식과 `dayjs`를 사용한 스마트 파싱을 통해 기타 날짜 형식을 지원합니다. |
| `vacation_responder_end_date` | 아니요 | 끈 | 휴가 응답 종료일(활성화되어 있고 종료일을 설정하지 않은 경우, 종료되지 않고 계속 응답하는 것으로 간주합니다). `MM/DD/YYYY`, `YYYY-MM-DD`과 같은 날짜 형식과 `dayjs`를 사용한 스마트 파싱을 통해 기타 날짜 형식을 지원합니다. |
| `vacation_responder_subject` | 아니요 | 끈 | 부재중 자동응답 메일 제목(예: "부재중")을 일반 텍스트로 입력합니다. `striptags`을 사용하여 모든 HTML을 제거합니다. |
| `vacation_responder_message` | 아니요 | 끈 | 휴가 응답자에게 보낼 일반 텍스트 메시지입니다. 예: "2월까지 부재중입니다.". `striptags`을 사용하여 모든 HTML을 제거합니다. |

> 요청 예시:

```sh
curl -X POST BASE_URI/v1/domains/DOMAIN_NAME/aliases \
  -u API_TOKEN:
```

### 도메인 별칭 검색 {#retrieve-domain-alias}

`id` 또는 `name` 값을 통해 도메인 별칭을 검색할 수 있습니다.

> `GET /v1/domains/:domain_name/aliases/:alias_id`

> 요청 예시:

```sh
curl BASE_URI/v1/domains/:domain_name/aliases/:alias_id \
  -u API_TOKEN:
```

> `GET /v1/domains/:domain_name/aliases/:alias_name`

> 요청 예시:

```sh
curl BASE_URI/v1/domains/:domain_name/aliases/:alias_name \
  -u API_TOKEN:
```

### 도메인 별칭 업데이트 {#update-domain-alias}

> `PUT /v1/domains/DOMAIN_NAME/aliases/ALIAS_ID`

| 신체 매개변수 | 필수의 | 유형 | 설명 |
| ------------------------------- | -------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name` | 아니요 | 끈 | 별칭 |
| `recipients` | 아니요 | 문자열 또는 배열 | 수신자 목록(줄 바꿈/공백/쉼표로 구분된 문자열 또는 유효한 이메일 주소, 정규화된 도메인 이름("FQDN"), IP 주소 및/또는 웹훅 URL의 배열이어야 함) |
| `description` | 아니요 | 끈 | 별칭 설명 |
| `labels` | 아니요 | 문자열 또는 배열 | 라벨 목록(줄 바꿈/공백/쉼표로 구분된 문자열 또는 배열이어야 함) |
| `has_recipient_verification` | 아니요 | 부울 | 이메일이 통과하려면 수신자가 이메일 확인 링크를 클릭하도록 요구합니다(요청 본문에 명시적으로 설정되지 않은 경우 도메인 설정이 기본값으로 지정됨) |
| `is_enabled` | 아니요 | 부울 | 이 별칭을 활성화할지 비활성화할지 여부(비활성화 시 이메일은 아무 곳으로도 라우팅되지 않고 성공 상태 코드를 반환합니다). 값이 전달되면 [boolean](https://github.com/thenativeweb/boolean#quick-start)을 사용하여 부울로 변환됩니다. |
| `error_code_if_disabled` | 아니요 | 숫자(`250`, `421` 또는 `550`) | 이 별칭으로 수신되는 이메일은 `is_enabled`이 `false`이고, `250`(블랙홀 또는 `/dev/null` 등 아무 곳에도 조용히 전달되지 않음), `421`(약식 거부, 최대 5일 동안 재시도), 또는 `550`(영구 실패 및 거부)인 경우 거부됩니다. 기본값은 `250`입니다. |
| `has_imap` | 아니요 | 부울 | 이 별칭에 대해 IMAP 저장소를 활성화할지 비활성화할지 여부(비활성화된 경우 수신된 인바운드 이메일이 [IMAP storage](/blog/docs/best-quantum-safe-encrypted-email-service)에 저장되지 않음. 값이 전달되면 [boolean](https://github.com/thenativeweb/boolean#quick-start)을 사용하여 부울로 변환됨) |
| `has_pgp` | 아니요 | 부울 | 별칭 `public_key`을 사용하여 [IMAP/POP3/CalDAV/CardDAV encrypted email storage](/blog/docs/best-quantum-safe-encrypted-email-service)에 대해 [OpenPGP encryption](/faq#do-you-support-openpgpmime-end-to-end-encryption-e2ee-and-web-key-directory-wkd)을 활성화할지 비활성화할지 여부입니다. |
| `public_key` | 아니요 | 끈 | ASCII Armor 형식의 OpenPGP 공개 키([click here to view an example](/.well-known/openpgpkey/hu/mxqp8ogw4jfq83a58pn1wy1ccc1cx3f5.txt); 예: `support@forwardemail.net`에 대한 GPG 키). 이는 `has_pgp`을 `true`로 설정한 경우에만 적용됩니다. [Learn more about end-to-end encryption in our FAQ](/faq#do-you-support-openpgpmime-end-to-end-encryption-e2ee-and-web-key-directory-wkd). |
| `max_quota` | 아니요 | 끈 | 이 별칭에 대한 최대 저장 용량 할당량입니다. 도메인의 현재 최대 용량으로 재설정하려면 비워 두거나, [bytes](https://github.com/visionmedia/bytes.js)에서 구문 분석할 "1GB"와 같은 값을 입력하세요. 이 값은 도메인 관리자만 조정할 수 있습니다. |
| `vacation_responder_is_enabled` | 아니요 | 부울 | 자동 휴가 응답 기능을 활성화할지 비활성화할지 여부. |
| `vacation_responder_start_date` | 아니요 | 끈 | 휴가 응답 시작일(활성화되어 있고 시작일이 설정되지 않은 경우 이미 시작된 것으로 간주합니다). `MM/DD/YYYY`, `YYYY-MM-DD`과 같은 날짜 형식과 `dayjs`를 사용한 스마트 파싱을 통해 기타 날짜 형식을 지원합니다. |
| `vacation_responder_end_date` | 아니요 | 끈 | 휴가 응답 종료일(활성화되어 있고 종료일을 설정하지 않은 경우, 종료되지 않고 계속 응답하는 것으로 간주합니다). `MM/DD/YYYY`, `YYYY-MM-DD`과 같은 날짜 형식과 `dayjs`를 사용한 스마트 파싱을 통해 기타 날짜 형식을 지원합니다. |
| `vacation_responder_subject` | 아니요 | 끈 | 부재중 자동응답 메일 제목(예: "부재중")을 일반 텍스트로 입력합니다. `striptags`을 사용하여 모든 HTML을 제거합니다. |
| `vacation_responder_message` | 아니요 | 끈 | 휴가 응답자에게 보낼 일반 텍스트 메시지입니다. 예: "2월까지 부재중입니다.". `striptags`을 사용하여 모든 HTML을 제거합니다. |

> 요청 예시:

```sh
curl -X PUT BASE_URI/v1/domains/DOMAIN_NAME/aliases/ALIAS_ID \
  -u API_TOKEN:
```

### 도메인 별칭 삭제 {#delete-domain-alias}

> `DELETE /v1/domains/:domain_name/aliases/:alias_id`

> 요청 예시:

```sh
curl -X DELETE BASE_URI/v1/domains/:domain_name/aliases/:alias_id \
  -u API_TOKEN:
```

## {#encrypt}}을 암호화합니다.

무료 플랜에서도 기록 암호화를 무료로 제공합니다. 개인정보 보호는 단순한 기능이 아니라 제품의 모든 측면에 기본적으로 내장되어야 합니다. [개인정보 보호 가이드 토론](https://discuss.privacyguides.net/t/forward-email-email-provider/13370) 및 [우리의 GitHub 이슈](https://github.com/forwardemail/forwardemail.net/issues/254)에서 많은 요청이 있었으므로 이 기능을 추가했습니다.

### TXT 레코드 암호화 {#encrypt-txt-record}

> `POST /v1/encrypt`

| 신체 매개변수 | 필수의 | 유형 | 설명 |
| -------------- | -------- | ------ | -------------------------------------------- |
| `input` | 예 | 끈 | 유효한 전달 이메일 일반 텍스트 TXT 레코드 |

> 요청 예시:

```sh
curl -X POST BASE_URI/v1/encrypt \
  -d "input=user@gmail.com"
```
