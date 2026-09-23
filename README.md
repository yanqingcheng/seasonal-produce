# seasonal-produce

This repository is the UK-first seasonal produce calendar for idea #22. International coverage is gated. The work follows the museum-ship pipeline.

[INTENT.md](INTENT.md) is the product truth.

[STAGE2.md](STAGE2.md) records a PASS (2026-09-23) of the UK pass-2 corpus against that intent. It is not Melody’s earlier idea #22 PASS.

[DESIGN.md](DESIGN.md) is the Stage 3 design. It records Qing’s 2026-09-23 art direction (stylised, never fake-realistic food; joyful, dynamic, slick) and the "Sticker Garden" system that meets it.

[ARCH.md](ARCH.md) is the Stage 4 high-level design. The signed-off sticker-garden wheel is the shared graphics layer. Stage 5 ships the UK pack on that one wheel. A later country is another pack plus a selector, not a new wheel. The thin ship does not include a globe or a second country. Where ARCH.md and DESIGN.md disagree on the UK clock, the UK staple ranking, or which UK items may be stickers, ARCH.md wins. Motion and art stay in DESIGN.md.

## Prototype

An interactive design prototype of the UK year-wheel lives in [`prototype/`](prototype/). It uses the UK corpus only, vendored in [`data/uk/`](data/uk/).

```bash
node scripts/build-data.mjs          # regenerate prototype/data.js from data/uk/
python3 -m http.server -d prototype  # open http://localhost:8000/
```

pstack is enabled for this repository in [`.cursor/settings.json`](.cursor/settings.json). Keep later work static and small.
