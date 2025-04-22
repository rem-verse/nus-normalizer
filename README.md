# NUS Normalizer #

A small middleware script for NUS style CDNs that will allow CDNs to act like
the official nintendo CDN, while still only storing the data once:

1. All title ids/filenames are implicitly lowercased.
2. `/ccs/download/`  path prefix is stripped if present.

This assumes your original storage location is just `<title id lowercased>/<file name lowercased>`.
