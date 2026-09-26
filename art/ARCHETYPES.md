# Sticker archetypes for held foods

`art/draw.mjs` holds the shared drawings. This file maps food names to an archetype and colours, so a wiring pass can copy an entry straight into `art/bindings/<id>.json`. `food` is a plain English name, not a pack item id. When a pack names the food differently (`plátano`, `Bitter gourd`), copy `archetype` and `colours` under that pack's own item name. `also` lists the research-pack and pack names the entry is meant for.

Entries marked `"existing": true` use an archetype that was already in the library. They are listed because a research pack names that food and the existing drawing already reads as it.

`node scripts/sticker-sheet.mjs` renders every new entry at fact-sheet size (180 px), wheel size (48 px), and chip size (28 px), beside existing stickers for comparison, into `/opt/cursor/artifacts/screenshots/sticker-sheet.png`. A second argument filters by food or archetype name.

## New archetypes

`almond`, `bambooshoot`, `banana`, `bittermelon`, `caltrop`, `carambola`, `coconut`, `coffee`, `corm`, `custardapple`, `date`, `dragonfruit`, `durian`, `fiddlehead`, `ginger`, `ginkgo`, `jackfruit`, `kelp`, `kiwi`, `longan`, `lotuspod`, `lotusroot`, `lychee`, `okra`, `olive`, `papaya`, `passionfruit`, `peanut`, `peppercorn`, `pineapple`, `pistachio`, `rose`, `scape`, `sprouts`, `sugarcane`, `sunflower`, `tea`, `walnut`, `waxapple`.

## Not drawn

These stay in `STICKER_GAPS.md`:

- Seafood and other catches: fish, crab, shrimp, crayfish, clam, oyster, scallop, abalone, jellyfish, and sea cucumber. No pack has a seafood category, and the category legend is shared, so adding one needs its own decision.
- Luffa / loofah: the drawn gourd read as a cucumber or courgette.
- Truffle: read as a chestnut burr or a sea urchin.
- Soursop: read as a spiny cucumber.
- Black pepper: fresh green peppercorns would repeat the green Sichuan pepper sticker and not read as black pepper.
- Crops with no silhouette most visitors know: bamboo fungus, celtuce, toon shoots, houttuynia root, garlic shoots, water bamboo, water shield, water poppy, gorgon nut, black locust flowers, canistel, chickpea, leafy tara sprouts, fukinoto, and the sapotes, akee and star apple in the Florida IFAS list.

## Mapping

```json
[
  {"food": "banana", "archetype": "banana", "colours": {"body": "#ffd84a", "body2": "#ffb627", "tip": "#7a4a2c", "stem": "#a8e05a"}, "also": ["plátano (es)", "Banana (yn, hi)", "Banana (fl IFAS)", "Banana (Guangdong)"]},
  {"food": "plantain", "archetype": "banana", "colours": {"body": "#a8e05a", "body2": "#52c26b", "tip": "#7a4a2c", "stem": "#3bb273"}, "also": ["plantain rows in a later pack"]},
  {"food": "kiwifruit", "archetype": "kiwi", "colours": {"skin": "#b0703f", "body": "#52c26b", "core": "#fff6dc", "fuzz": true}, "also": ["kiwi (es, it)", "Kiwifruit (sc, sd, js, yn)", "Kiwifruit (jp)", "Kiwifruit (California)", "Kiwifruit (Heping, Guangdong)"]},
  {"food": "hardy kiwi", "archetype": "kiwi", "colours": {"skin": "#3bb273", "body": "#a8e05a", "core": "#fff0a6"}, "also": ["Hardy kiwi (js)"]},
  {"food": "lychee", "archetype": "lychee", "colours": {"body": "#ff5a6e", "body2": "#c2255c", "stem": "#7a4a2c", "leaf": "#3bb273", "flesh": "#fffdf6"}, "also": ["Lychee (yn, hi)", "Lychee (fl)", "Lychee (Guangdong)"]},
  {"food": "rambutan", "archetype": "lychee", "colours": {"body": "#ff5a4e", "body2": "#d9344a", "hairs": "#52c26b", "stem": "#7a4a2c", "leaf": "#3bb273"}, "also": ["Rambutan (hi)"]},
  {"food": "longan", "archetype": "longan", "colours": {"body": "#e9b87a", "body2": "#b0703f", "stem": "#7a4a2c", "leaf": "#3bb273"}, "also": ["Longan (hi)", "Longan (fl)", "Longan (Shixia, Guangdong)"]},
  {"food": "wampee", "archetype": "longan", "colours": {"body": "#ffc93c", "body2": "#b0703f", "stem": "#7a4a2c", "leaf": "#3bb273", "oval": true}, "also": ["Wampee (hi)", "Wampee (fl IFAS)", "Wampee (huangpi, Guangdong)"]},
  {"food": "papaya", "archetype": "papaya", "colours": {"skin": "#a8e05a", "body": "#ff9a3c", "cavity": "#ff5a4e", "stem": "#3bb273"}, "also": ["Papaya (hi)", "Papaya (fl)"]},
  {"food": "passion fruit", "archetype": "passionfruit", "colours": {"body": "#8e4dd6", "pith": "#fff6dc", "pulp": "#ffc93c", "pulp2": "#fff0a6", "leaf": "#3bb273"}, "also": ["Passion fruit (sc, yn, hi)", "Passion fruit (fl)", "Passion fruit (Xuwen, Guangdong)"]},
  {"food": "dragon fruit", "archetype": "dragonfruit", "colours": {"body": "#ff5f8a", "tip": "#a8e05a"}, "also": ["Dragon fruit (yn, hi)", "Pitaya (dragon fruit) (fl IFAS)", "Dragon fruit (Guangdong)"]},
  {"food": "jackfruit", "archetype": "jackfruit", "colours": {"body": "#c9dc5a", "body2": "#6f9a2e", "stem": "#b0703f", "leaf": "#3bb273"}, "also": ["Jackfruit (hi)", "Jackfruit (fl IFAS)"]},
  {"food": "durian", "archetype": "durian", "colours": {"body": "#b9b44e", "body2": "#6f6a24", "stem": "#7a4a2c"}, "also": ["Durian (hi)"]},
  {"food": "custard apple", "archetype": "custardapple", "colours": {"body": "#b8e39a", "body2": "#3bb273", "stem": "#7a4a2c", "leaf": "#3bb273"}, "also": ["chirimoya (es)", "Sugar apple (hi)", "Custard apple, Sugar apple, Atemoya (fl IFAS)"]},
  {"food": "carambola", "archetype": "carambola", "colours": {"body": "#ffd84a", "body2": "#d8e05a", "flesh": "#fff0a6", "stem": "#7a4a2c"}, "also": ["Carambola (fl)", "Carambola (Huadu, Guangdong)"]},
  {"food": "pineapple", "archetype": "pineapple", "colours": {"body": "#ffb627", "body2": "#b0703f", "leaf": "#3bb273"}, "also": ["Pineapple (hi)", "Pineapple (Xuwen, Guangdong)"]},
  {"food": "wax apple", "archetype": "waxapple", "colours": {"body": "#ff5a6e", "stem": "#7a4a2c"}, "also": ["Wax apple (hi)", "Wax jambu (fl IFAS)"]},
  {"food": "coconut", "archetype": "coconut", "colours": {"body": "#7a4a2c", "flesh": "#fffdf6", "flesh2": "#fff0d0"}, "also": ["Coconut (fl IFAS)"]},
  {"food": "date", "archetype": "date", "colours": {"body": "#9a4a2c", "cap": "#ffb627", "stem": "#ffb627"}, "also": ["Date (California)"]},
  {"food": "olive", "archetype": "olive", "colours": {"body": "#8fae3a", "leaf": "#9dbf94", "stem": "#7a4a2c"}, "also": ["Olive (California)", "Chinese olive (Chaozhou, Guangdong)"]},
  {"food": "black olive", "archetype": "olive", "colours": {"body": "#5b3a9b", "leaf": "#9dbf94", "stem": "#7a4a2c"}, "also": ["Olive (California), when the pack means ripe olives"]},
  {"food": "peanut", "archetype": "peanut", "colours": {"body": "#e9b87a"}, "also": ["Peanut (hi)", "Peanut (fl)"]},
  {"food": "walnut", "archetype": "walnut", "colours": {"body": "#d49a5e"}, "also": ["Walnut (yn, xj)", "Walnut (California)", "noix (fr), bound to chestnut today"]},
  {"food": "almond", "archetype": "almond", "colours": {"body": "#d0925a", "body2": "#9a5a34"}, "also": ["Almond (xj)", "Almond (California)"]},
  {"food": "pecan", "archetype": "almond", "colours": {"body": "#a8643a", "body2": "#5a321e", "pecan": true}, "also": ["Pecan (California)"]},
  {"food": "pistachio", "archetype": "pistachio", "colours": {"body": "#f0d9a8", "kernel": "#a8e05a", "skin": "#c2255c"}, "also": ["Pistachio (California)"]},
  {"food": "ginkgo nut", "archetype": "ginkgo", "colours": {"body": "#fff0a6", "leaf": "#ffd84a", "stem": "#b0703f"}, "also": ["Ginkgo nut (js)"]},
  {"food": "sunflower seed", "archetype": "sunflower", "colours": {"body": "#ffd84a", "disc": "#7a4a2c", "seed": "#e9b87a", "stem": "#3bb273", "leaf": "#52c26b"}, "also": ["Sunflower seed (xj)"]},
  {"food": "coffee", "archetype": "coffee", "colours": {"body": "#7a4a2c", "body2": "#b0703f", "leaf": "#23865a"}, "also": ["Coffee cherry (yn)", "Coffee (hi)"]},
  {"food": "Sichuan pepper", "archetype": "peppercorn", "colours": {"body": "#d9344a", "body2": "#8a1f33", "leaf": "#3bb273", "stem": "#7a4a2c"}, "also": ["Sichuan pepper (sc)"]},
  {"food": "green Sichuan pepper", "archetype": "peppercorn", "colours": {"body": "#52c26b", "body2": "#23865a", "leaf": "#3bb273", "stem": "#7a4a2c"}, "also": ["Green Sichuan pepper (yn)"]},
  {"food": "tea", "archetype": "tea", "colours": {"body": "#3bb273", "body2": "#52c26b", "bud": "#a8e05a", "stem": "#7a4a2c"}, "also": ["Tea (yn, hi)", "Green tea, spring (sd)", "Green tea, first flush (jp)"]},
  {"food": "green tea", "archetype": "tea", "colours": {"body": "#52c26b", "body2": "#a8e05a", "bud": "#c9f0b0", "stem": "#7a4a2c"}, "also": ["Green tea (hi)"]},
  {"food": "bitter melon", "archetype": "bittermelon", "colours": {"body": "#7fcf52", "body2": "#23865a", "stem": "#3bb273"}, "also": ["Bitter Melon/Fuzzy Squash (on)", "Bitter melon (sc)", "Bitter gourd (hi)", "Bitter melon (Dading, Guangdong)"]},
  {"food": "okra", "archetype": "okra", "colours": {"body": "#52c26b", "cap": "#a8e05a"}, "also": ["Okra (hi)", "Okra (jp)"]},
  {"food": "lotus root", "archetype": "lotusroot", "colours": {"body": "#e9b87a", "flesh": "#fff6dc", "hole": "#e9b87a"}, "also": ["Lotus root (sc, js)", "Lotus root (jp)", "Lotus root (Zengcheng, Guangdong)"]},
  {"food": "lotus seed pod", "archetype": "lotuspod", "colours": {"body": "#52c26b", "top": "#a8e05a", "seed": "#c9f0b0"}, "also": ["Lotus seed pod (js)"]},
  {"food": "bamboo shoot", "archetype": "bambooshoot", "colours": {"body": "#e9b87a", "body2": "#b0703f", "tip": "#a8e05a", "base": "#fff6dc"}, "also": ["Spring bamboo shoot (sc, js)", "Bamboo shoot (yn)", "Leigong shoot (hi)", "Bamboo shoot (moso) (jp)", "Bamboo shoot (ma bamboo, Guangdong)"]},
  {"food": "water chestnut", "archetype": "corm", "colours": {"body": "#7a4a2c", "body2": "#4a2a1c", "sprout": "#b0703f"}, "also": ["Water chestnut (js)", "Water chestnut (Beixiang, Guangdong)"]},
  {"food": "arrowhead", "archetype": "corm", "colours": {"body": "#e8e1f5", "body2": "#8e4dd6", "sprout": "#fff0a6", "beak": true}, "also": ["Arrowhead (js)"]},
  {"food": "red water caltrop", "archetype": "caltrop", "colours": {"body": "#c2255c", "body2": "#7a4a2c"}, "also": ["Red water caltrop (js)"]},
  {"food": "garlic scape", "archetype": "scape", "colours": {"body": "#3bb273", "bud": "#c9f0b0"}, "also": ["Garlic Scapes (on)", "Garlic scape (sd)"]},
  {"food": "garlic-chive flower stems", "archetype": "scape", "colours": {"body": "#3bb273", "bud": "#c9f0b0", "band": "#ffc93c", "straight": true}, "also": ["Garlic-chive flower stems (js)"]},
  {"food": "bracken fern", "archetype": "fiddlehead", "colours": {"body": "#8fbf3a", "body2": "#a8e05a"}, "also": ["Bracken fern (sc)"]},
  {"food": "young ginger", "archetype": "ginger", "colours": {"body": "#fff0a6", "tip": "#ff86a8", "leaf": "#52c26b"}, "also": ["Young ginger (yn)"]},
  {"food": "ginger", "archetype": "ginger", "colours": {"body": "#e9b87a", "tip": "#ff86a8", "leaf": "#52c26b"}, "also": ["Ginger (new-crop harvest) (jp)"]},
  {"food": "sugarcane", "archetype": "sugarcane", "colours": {"body": "#8e4dd6", "node": "#5b3a9b", "flesh": "#fff6dc", "leaf": "#3bb273"}, "also": ["Sugarcane (yn)", "Sugarcane (fresh-eating, Guangdong)"]},
  {"food": "edible rose", "archetype": "rose", "colours": {"body": "#ff86a8", "body2": "#ff5f8a", "leaf": "#3bb273", "stem": "#3bb273"}, "also": ["Edible rose (sd, yn)"]},
  {"food": "sprouts", "archetype": "sprouts", "colours": {"body": "#fffdf6", "head": "#fff0a6", "leaf": "#a8e05a"}, "also": ["Sprouts (on)"]},
  {"food": "kelp", "archetype": "kelp", "colours": {"body": "#7a8f3a", "body2": "#b8c46a"}, "also": ["Kelp (sd)"]},
  {"food": "mirabelle plum", "archetype": "oval", "colours": {"body": "#ffd84a", "cleft": true, "leaf": "#3bb273"}, "also": ["Mirabelle de Lorraine (fr regional)"], "existing": true},
  {"food": "Espelette chilli", "archetype": "chilli", "colours": {"body": "#ff5a4e", "cap": "#3bb273"}, "also": ["Piment d'Espelette (fr regional)"], "existing": true},
  {"food": "wild blueberry", "archetype": "cluster", "colours": {"body": "#34307a"}, "also": ["Wild blueberry (on regional)"], "existing": true},
  {"food": "white asparagus", "archetype": "asparagus", "colours": {"body": "#fff6dc", "tip": "#e9b87a", "band": "#ff5f8a"}, "also": ["Asperge des sables des Landes (fr regional)"], "existing": true},
  {"food": "calçot", "archetype": "springonion", "colours": {"body": "#fffdf6", "leaf": "#3bb273"}, "also": ["Calçot de Valls (es regional)"], "existing": true},
  {"food": "lemon", "archetype": "round", "colours": {"body": "#ffd84a", "leaf": "#52c26b"}, "also": ["Limone di Sorrento (it regional)"], "existing": true},
  {"food": "artichoke", "archetype": "artichoke", "colours": {"body": "#9dbf94", "body2": "#3bb273", "tip": "#8e4dd6"}, "also": ["Carciofo Romanesco (it regional)"], "existing": true},
  {"food": "potato", "archetype": "potato", "colours": {"body": "#e9b87a"}, "also": ["Patata della Sila (it regional)"], "existing": true},
  {"food": "chestnut", "archetype": "chestnut", "colours": {"body": "#7a4a2c", "body2": "#e9b87a"}, "also": ["Châtaigne d'Ardèche (fr regional)", "Castaña de Galicia (es regional)"], "existing": true},
  {"food": "cherry", "archetype": "cherry", "colours": {"body": "#d9344a", "stem": "#3bb273", "leaf": "#52c26b"}, "also": ["Cereza del Jerte (es regional)"], "existing": true},
  {"food": "strawberry", "archetype": "strawberry", "colours": {"body": "#ff5a4e", "leaf": "#3bb273"}, "also": ["Fraise de Plougastel (fr regional)"], "existing": true},
  {"food": "apricot", "archetype": "oval", "colours": {"body": "#ffb627", "cleft": true, "leaf": "#52c26b"}, "also": ["Abricots rouges du Roussillon (fr regional)"], "existing": true},
  {"food": "cobnut", "archetype": "cobnut", "colours": {"body": "#e9b87a", "leaf": "#a8e05a"}, "also": ["Kentish cobnut (uk regional)"], "existing": true},
  {"food": "bramley apple", "archetype": "round", "colours": {"body": "#a8e05a", "leaf": "#3bb273"}, "also": ["Bramley apple (Armagh) (uk regional)"], "existing": true},
  {"food": "taro", "archetype": "potato", "colours": {"body": "#6b3f69"}, "also": ["Taro (Zhangxi, Guangdong)"], "existing": true}
]
```
