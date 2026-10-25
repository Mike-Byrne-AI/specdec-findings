# specdec-findings

The findings site of [specdec-sidechannels v1.0.0](https://github.com/Mike-Byrne-AI/specdec-sidechannels/tree/v1.0.0):
three research records on what a speculative decoding system gives away for free. Every number on the pages
carries the file, the line and the first twelve hex of the sha256 of the file it was copied from, in the public
repository at commit 447815f (tag v1.0.0).

Read it at https://mike-byrne-ai.github.io/specdec-findings/

- The records, their code and their evidence: https://github.com/Mike-Byrne-AI/specdec-sidechannels
- The raw data on Zenodo: https://doi.org/10.5281/zenodo.23462826
- How to cite: CITATION.cff in that repository

## What is in this repository

`docs/` holds the built pages as GitHub Pages serves them: seven HTML pages, one stylesheet, one script, the
sharing card, the icon, and the two self-hosted typefaces with their licences in `docs/fonts/`. The pages are
written by a generator kept with the private record and not published yet. It reads only the public tree at the
tag, and it refuses to write when a chip's hex does not match the sha256 of the file the chip names. Its two data
files were extracted again from a fresh clone of the tag on 2026-10-25 and came out byte for byte the same.

The pages were built with the help of Claude.

## Licence

MIT, as the records are (`LICENSE`). The typefaces, STIX Two Text and Source Code Pro, are under the SIL Open Font
License; their licence files sit beside them in `docs/fonts/`.
