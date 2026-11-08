# LockerLine

The parcel room of one apartment tower: 48 doors (20 small, 20 medium, 8 large). Couriers drop parcels, residents
collect them with a one-time code.

## Pickup codes

A drop answers with a six-digit code, once. The app stores only a **keyed SHA-256 (HMAC) of the code**, never the code
itself, and compares a presented code with `crypto.timingSafeEqual`, so how long the comparison takes gives nothing
away.

Why HMAC rather than bcrypt: a six-digit code has only a million values, so any plain hash of it can be reversed by
trying them all; the secret key (the `CODE_HASH_KEY` setting) is what makes the stored hash useless to someone who
reads the database. It is also fast and needs no extra library. Keep the real key out of the code and out of git.

<!-- learntube:start -->
---

[![tests](https://github.com/leenarosemarys-byte/lockerline-mern/actions/workflows/tests.yml/badge.svg)](https://github.com/leenarosemarys-byte/lockerline-mern/actions/workflows/tests.yml)

### Progress

- [x] Ticket 1 · Forty-eight doors, and a wall you can look at
- [x] Ticket 2 · A courier asks for a door
- [x] Ticket 3 · The code that dies at midnight
- [x] Ticket 4 · Three ways to say no
- [x] Ticket 5 · The door opens, and the clock stops
- [x] Ticket 6 · A notebook nobody can rewrite
- [ ] Ticket 7 · One file becomes an app
- [ ] Ticket 8 · The rule table, and then the rule changes
- [ ] Ticket 9 · It runs on a machine that isn't yours
- [ ] Ticket 10 · It survives being switched off

Built by LEENA ROSE MARY S on [LearnTube Guided Projects](https://guidedprojects.learntube.ai).
<!-- learntube:end -->
