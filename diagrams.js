const MERMAID_URL = 'https://cdn.jsdelivr.net/npm/mermaid@11.16.0/dist/mermaid.esm.min.mjs';
const CONFIG_URL = 'assets/projects/diagrams/mermaid-config.json';
const diagramHosts = [...document.querySelectorAll('[data-mermaid-source]')];

const pageLoaded = document.readyState === 'complete'
    ? Promise.resolve()
    : new Promise(resolve => window.addEventListener('load', resolve, { once: true }));

let mermaidPromise;
let renderQueue = Promise.resolve();

const fetchResource = async (url, type) => {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Unable to load ${url}: ${response.status}`);
    }

    return type === 'json' ? response.json() : response.text();
};

const loadMermaid = () => {
    if (mermaidPromise) return mermaidPromise;

    mermaidPromise = Promise.all([
        import(MERMAID_URL),
        fetchResource(CONFIG_URL, 'json'),
        pageLoaded
    ]).then(async ([module, config]) => {
        if (document.fonts) await document.fonts.ready;

        const mermaid = module.default;
        mermaid.initialize({
            ...config,
            startOnLoad: false,
            securityLevel: 'strict',
            suppressErrorRendering: true
        });

        return mermaid;
    });

    return mermaidPromise;
};

const updateScrollability = host => {
    const scrollable = host.scrollWidth - host.clientWidth > 2 || host.scrollHeight - host.clientHeight > 2;
    host.classList.toggle('is-scrollable', scrollable);

    if (!scrollable) {
        host.classList.remove('is-panned');
        host.scrollLeft = 0;
        host.scrollTop = 0;
    }
};

const renderDiagram = async host => {
    const sourceUrl = host.dataset.mermaidSource;
    const canvas = host.querySelector('.mermaid-canvas');
    const status = host.querySelector('.mermaid-status');
    let renderTarget;

    host.dataset.mermaidState = 'loading';
    host.setAttribute('aria-busy', 'true');
    status.hidden = false;
    status.textContent = 'Loading diagram from Mermaid...';

    try {
        const [mermaid, source] = await Promise.all([
            loadMermaid(),
            fetchResource(sourceUrl, 'text')
        ]);

        renderTarget = document.createElement('pre');
        renderTarget.className = 'mermaid mermaid-runtime';
        renderTarget.textContent = source;
        canvas.append(renderTarget);

        await mermaid.run({ nodes: [renderTarget] });

        const svg = renderTarget.querySelector('svg');
        if (!svg) throw new Error(`Mermaid produced no SVG for ${sourceUrl}`);

        const viewBox = svg.viewBox.baseVal;
        if (viewBox.width > 0 && viewBox.height > 0) {
            canvas.style.aspectRatio = `${viewBox.width} / ${viewBox.height}`;
        }

        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        renderTarget.classList.add('is-rendered');
        status.hidden = true;
        host.dataset.mermaidState = 'rendered';
    } catch (error) {
        renderTarget?.remove();
        status.hidden = false;
        status.textContent = 'Diagram unavailable. View the Mermaid source below.';
        host.dataset.mermaidState = 'error';
        console.error(`Mermaid rendering failed for ${sourceUrl}`, error);
    } finally {
        host.removeAttribute('aria-busy');
        requestAnimationFrame(() => updateScrollability(host));
    }
};

const scheduleRender = host => {
    renderQueue = renderQueue.then(() => renderDiagram(host));
};

diagramHosts.forEach(host => {
    updateScrollability(host);
    host.addEventListener('scroll', () => {
        if (Math.abs(host.scrollLeft) > 8 || host.scrollTop > 8) host.classList.add('is-panned');
    }, { passive: true });
});

if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(entries => {
        entries.forEach(entry => updateScrollability(entry.target));
    });

    diagramHosts.forEach(host => resizeObserver.observe(host));
} else {
    window.addEventListener('resize', () => {
        diagramHosts.forEach(updateScrollability);
    });
}

if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            observer.unobserve(entry.target);
            scheduleRender(entry.target);
        });
    }, {
        rootMargin: '350px 0px',
        threshold: 0.01
    });

    diagramHosts.forEach(host => observer.observe(host));
} else {
    diagramHosts.forEach(scheduleRender);
}
