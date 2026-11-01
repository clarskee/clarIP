# clarIP

Userscript overlay for `ome.tv`, plus the notification component and the
`python_info_server/` service.

## Layout

- `scriptloader.js` — installable userscript loader; fetches the current
  `script.js`, `notif.js`, `index.html`, `style.css` and `notification.html`
  from `main` on GitHub each time it runs
- `notif.js` — notification component (`addNotification(title, content, x, y, decay)`)
- `script.js` — overlay injection, dragging, chat theme and UI wiring
- `index.html`, `notification.html`, `style.css` — overlay and notification sources
- `python_info_server/` — unchanged Python service

The loader always pulls the latest reviewed sources from
`https://raw.githubusercontent.com/clarskee/clarIP/main/`. If a non-essential asset
fails, the overlay falls back to its built-in markup and logs a caught warning.

## Install

Install only the loader:

```
https://raw.githubusercontent.com/clarskee/clarIP/main/scriptloader.js
```

If an older bundled `clarIP.user.js` is still installed, remove it and keep only
the loader so updates from `main` are used.

## Checks

```sh
node --check scriptloader.js
node --check notif.js
node --check script.js
python3 -m py_compile python_info_server/main.py
```

Or with npm:

```sh
npm run check
```

## Manual test notes

Static checks run in this repository:

- `node --check scriptloader.js`, `notif.js` and `script.js`.
- `python3 -m py_compile python_info_server/main.py`.

Browser checklist for a normal `ome.tv` session:

- The loader fetches the latest files from `main` and the overlay appears.
- Dragging works and does not replace the host page's global mouse handlers.
- The chat theme is applied once and its polling interval stops.
- Notifications stack without overlapping, fade in and out once, and disappear
  from both the DOM and the internal notification list.
- After a dismissal, new notification ids remain unique (`notif-0`, `notif-1`, ...).
- With a non-essential remote asset unavailable, the overlay still renders and
  logs a caught warning.
- `git status` shows no `__pycache__` or `.pyc` files.
