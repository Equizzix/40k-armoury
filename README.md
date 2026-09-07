# The Armory

A miniature collection tracker and army list builder — same idea as the guitar inventory,
adapted for Warhammer 40k. All data lives in one JSON file. No database, no backend.

## What's in here

```
40k-armory/
├── index.html          the page (Collection view + Army List Builder view)
├── style.css           look and feel
├── app.js              reads the data, renders both views
├── data/
│   └── inventory.json  every unit lives here — edit this to add/change units
├── images/
│   └── (photos go here)
└── README.md
```

## The two views

**Collection** — every unit you own, with faction, role, points cost, quantity, and paint
status. Filter by faction or paint status, search by name.

**Army List Builder** — set a points limit (2000 by default), click "Add" on units from your
collection to build a list, and watch the points bar fill up. Goes red if you go over. Your
current list is saved in the browser (not in the git repo), so it'll still be there next time
you open the page on the same computer — but it won't show up on a different device. Clear it
any time with the "Clear list" button.

## Setting this up on GitHub — step by step

Same process as the guitar inventory:

1. Create a GitHub account if you don't have one (github.com → Sign up).
2. Install git and confirm it with `git --version` in Terminal.
3. Create a new empty repo on GitHub called `40k-armory` — don't check "add a README."
4. In Terminal, `cd` into this folder, then:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: armory structure and sample units"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/40k-armory.git
   git push -u origin main
   ```
5. Turn on GitHub Pages: repo → Settings → Pages → Source: Deploy from a branch → main / root → Save.
6. Visit `https://YOUR-USERNAME.github.io/40k-armory/`.

If `git push` asks for a password, it wants a **Personal Access Token**, not your GitHub
password — generate one at github.com/settings/tokens (check the "repo" scope box), and paste
that in as the password instead.

## Adding units — field reference

| Field | What it's for |
|---|---|
| `id` | Unique string, just needs to not repeat |
| `faction` | Free text — "Space Marines", "Orks", whatever you play |
| `name` | Unit name |
| `role` | Battlefield role: Battleline, Character, Elites, Heavy Support, Vehicle, etc. |
| `points_cost` | Number, no commas — the points value for one unit as listed in your codex |
| `quantity_owned` | How many models are in this entry |
| `painted_status` | One of `Unpainted`, `Primed`, `WIP`, `Painted` |
| `image` / `images` | Single photo path, or an array of paths for multiple angles |
| `notes` | Free text, general notes |
| `paint_plan` | Free text — the actual paint recipe (base coat, layers, washes) |
| `tags` | Array of short searchable strings |

## Ongoing workflow

```bash
git add .
git commit -m "Add Redemptor Dreadnought"
git push
```

Hard-refresh the Pages URL (Cmd+Shift+R on Mac) if you don't see the change right away —
browsers sometimes cache the data file.
