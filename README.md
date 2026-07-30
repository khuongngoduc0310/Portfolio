# Portfolio - Khuong "Kyle" Ngo

A technical editorial portfolio focused on real-time AI, concurrent applications, and backend systems. The site is built with semantic HTML, responsive CSS, and minimal vanilla JavaScript.

## Local preview

Serve the repository with any static file server, then open the local URL in a browser. For example:

```powershell
python -m http.server 8000
```

## Structure

- `index.html` contains the page content and metadata.
- `style.css` contains the visual system and responsive behavior.
- `script.js` progressively enhances section reveals.
- `diagrams.js` lazily renders project diagrams in the browser with Mermaid 11.16.0.
- `assets/projects/diagrams/` contains the canonical Mermaid sources and shared configuration.
- `assets/` contains project media and sharing assets.
- `resume2.pdf` is the public resume linked from the site.

Runtime diagram rendering fetches local `.mmd` files and loads Mermaid from jsDelivr, so local previews must use an HTTP server rather than opening `index.html` directly.

## Deployment

GitHub Pages serves the repository directly. The live site is available at [khuongngoduc0310.github.io/Portfolio](https://khuongngoduc0310.github.io/Portfolio/).
