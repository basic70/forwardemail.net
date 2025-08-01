# Порт 25 заблокирован интернет-провайдером, обходной путь {#port-25-blocked-by-isp-workaround}

## Содержание {#table-of-contents}

* [Как обойти блокировку входящего SMTP-трафика через порт 25 со стороны интернет-провайдера](#how-to-workaround-isp-blocking-inbound-smtp-on-port-25)
* [Как обойти блокировку исходящего SMTP-трафика через порт 25 со стороны интернет-провайдера](#how-to-workaround-isp-blocking-outbound-smtp-on-port-25)
* [Как проверить, блокирует ли мой интернет-провайдер порты?](#how-can-i-check-if-my-isp-blocks-ports)

## Как обойти блокировку входящего SMTP-трафика через порт 25 со стороны интернет-провайдера {#how-to-workaround-isp-blocking-inbound-smtp-on-port-25}

Если на IP-адресе вашего почтового сервера не открыт порт 25, то это руководство для вас.

Например, вы используете дома собственный почтовый сервер, и ваш интернет-провайдер («ISP») заблокировал исходящий порт 25.

Поскольку исходящий трафик через порт 25 невозможен, то из-за этой блокировки у вас, скорее всего, не будет и входящего трафика через порт 25.

Предположим, вы используете наш сервис для пересылки писем, [Вы можете обойти эту проблему, воспользовавшись ответом на часто задаваемые вопросы здесь.](/faq#can-i-forward-emails-to-ports-other-than-25-eg-if-my-isp-has-blocked-port-25).

## Как обойти блокировку исходящего SMTP-трафика через порт 25 со стороны интернет-провайдера {#how-to-workaround-isp-blocking-outbound-smtp-on-port-25}

Если ваш интернет-провайдер блокирует исходящий порт 25, вам придется найти альтернативное решение или связаться с ним.

## Как проверить, блокирует ли мой провайдер порты {#how-can-i-check-if-my-isp-blocks-ports}

Вы можете запустить `telnet smtp.forwardemail.net 25` из командной строки или терминала, чтобы проверить, заблокировано ли исходящее соединение через порт 25.