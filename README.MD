# ~ODDEASY~

The Odd Easy website: a single static page built exactly to [`architecture.md`](architecture.md).

```
index.html          markup
styles/main.css     all CSS
scripts/main.js     all JS (vanilla IIFE; GSAP 3.13.0 + CustomEase from cdnjs)
assets/studio.jpg   About backdrop photograph
assets/og.jpg       Open Graph still of the lit frame
assets/favicon.svg  favicon
```

No build step. Serve the folder with any static server, e.g.

```
python3 -m http.server 8000
```

and open http://localhost:8000. (Opening `index.html` straight from disk also works.)
