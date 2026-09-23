# seasonal-produce

This repository is the UK-first seasonal produce calendar for idea #22. International coverage is gated. The work follows the museum-ship pipeline.

[INTENT.md](INTENT.md) is the product truth.

[STAGE2.md](STAGE2.md) records a PASS (2026-09-23) of the UK pass-2 corpus against that intent. It is not Melody’s earlier idea #22 PASS.

[DESIGN.md](DESIGN.md) is the Stage 3 design. It records Qing’s 2026-09-23 art direction (stylised, never fake-realistic food; joyful, dynamic, slick) and the "Sticker Garden" system that meets it.

[ARCH.md](ARCH.md) is the Stage 4 high-level design. The signed-off sticker-garden wheel is the shared graphics layer. Stage 5 ships the UK pack on that one wheel. A later country is another pack plus a selector, not a new wheel. The thin ship does not include a globe or a second country. Where ARCH.md and DESIGN.md disagree on the UK clock, the UK staple ranking, or which UK items may be stickers, ARCH.md wins. Motion and art stay in DESIGN.md.

## Thin ship

Stage 5 publishes one static exhibit in [`site/`](site/). It loads the UK pack only. There is no country selector.

```bash
node scripts/build-data.mjs uk
node scripts/check-ship.mjs
python3 -m http.server -d site
```

Open `http://localhost:8000/`. With no query, the wheel lands on the current month in Europe/London. `?month=9` opens September and leaves the today marker on London's month. `?item=apple` opens that fact sheet after the arrival spin. `?country=es` is ignored; the UK pack still loads.

The intended public URL is `https://yanqingcheng.github.io/seasonal-produce/`.

## Prototype

The signed Stage 3 prototype stays in [`prototype/`](prototype/) for comparison. Its `data.js` is the Stage 3 snapshot. The ship command above does not regenerate it.

```bash
python3 -m http.server -d prototype
```

pstack is enabled for this repository in [`.cursor/settings.json`](.cursor/settings.json). Keep later work static and small.
