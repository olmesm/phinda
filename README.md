# Phinda (pin-dah)

Phinda - _repeat in Zulu_ - is a simple JSX server built on bun.

## Goals

1. Simplicity
1. HTML & server first
1. Idiomatic

## Features

- [x] Support Pages and components
  - [x] query
  - [x] params
- [x] ORM
- [x] authentication
  - [ ] login error
  - [ ] register error
- [x] config
- [x] email
- [ ] package
- [ ] phinda start
- [ ] testing
  - [ ] e2e
  - [ ] unit tests

```bash
# add migration
bunx prisma migrate dev
```

## Emails

https://github.com/mailhog/MailHog

```
docker run --rm -it -p 8025:8025 -p 1025:1025 mailhog/mailhog
```

---

## Emails

- https://jsx.email/docs/email-providers
- https://www.emlreader.com/
- https://www.zoho.com/toolkit/eml-viewer.html