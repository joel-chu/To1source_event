# change from V1 to V2

- rewrite in Typescript
- restructure the internal to make it clear of their functions
- `StoreClass` becomes standalone, and the `WeakMap` store becomes private for better inheritance access
- Only ESM export from V.2 since this is very rarely use standalone

@TODO

- `WatchClass` upgrade to Proxy
- investigate the possibility to extend with stream features

---

2023-02-13
