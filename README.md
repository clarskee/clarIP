# clarIP

Userscript overlay for `ome.tv`, plus the notification component and the
`python_info_server/` service.

## Layout

- `notif.js` — notification component (`addNotification(title, content, x, y, decay)`)
- `script.js` — overlay injection, dragging, chat theme and UI wiring
- `scriptloader.js` — Node build script; produces the distributable userscript
- `clarIP.user.js` — generated userscript (install this in the userscript manager)
- `index.html`, `notification.html`, `style.css` — overlay and notification sources
- `python_info_server/` — unchanged Python service

`scriptloader.js` embeds the reviewed local sources into `clarIP.user.js`; the
userscript does not load or evaluate remote JavaScript.

## Build and checks

```sh
node scriptloader.js
node --check scriptloader.js
node --check notif.js
node --check script.js
python3 -m py_compile python_info_server/main.py
```

Or with npm:

```sh
npm run build
npm run check
```

## Manual test notes

Static checks run in this repository:

- `node --check script.js`, `scriptloader.js`, `notif.js` and the generated
  `clarIP.user.js`.
- `python3 -m py_compile python_info_server/main.py`.
- Built the bundle with `node scriptloader.js`.

Browser checklist for a normal `ome.tv` session:

- Overlay appears; dragging works and does not replace the host page's global
  mouse handlers.
- The chat theme is applied once and its polling interval stops.
- Notifications stack without overlapping, fade in and out once, and disappear
  from both the DOM and the internal notification list.
- After a dismissal, new notification ids remain unique (`notif-0`, `notif-1`, ...).
- With remote assets unavailable, the bundled userscript still has its markup,
  styles and notification template; standalone `script.js` falls back to the
  built-in markup and logs a caught warning for a missing stylesheet.
- `git status` shows no `__pycache__` or `.pyc` files.
