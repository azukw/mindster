const fs = require('fs');
const path = require('path');

const BASE = 'https://mindster.fr';
const outDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const today = new Date().toISOString().split('T')[0];

const modes = [null, 'easy', 'normal', 'hard', 'extreme'];
const modals = [null, 'help', 'settings', 'shop', 'stats'];

const urls = new Set();

for (const mode of modes) {
    for (const modal of modals) {
        const params = new URLSearchParams();
        if (mode) params.set('mode', mode);
        if (modal) params.set('modal', modal);
        const query = params.toString();
        const pathPart = query ? '/?' + query : '/';
        // ensure single trailing slash for root and absolute URLs
        urls.add(`${BASE}${pathPart}`);
    }
}

const escapeXml = (s) =>
    s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

const urlset = Array.from(urls).map(loc => {
    const safeLoc = escapeXml(loc);
    return `  <url>
    <loc>${safeLoc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
}).join('\n');

const xmlHeader =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n` +
    `        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n` +
    `        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n` +
    `                            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n`;

const xml = xmlHeader + `${urlset}\n</urlset>\n`;

fs.writeFileSync(path.join(outDir, 'sitemap.xml'), xml, 'utf8');
console.log('Sitemap generated at public/sitemap.xml');

const robotsPath = path.join(outDir, 'robots.txt');
const robots = `User-agent: *\nAllow: /\nSitemap: ${BASE}/sitemap.xml\n`;
fs.writeFileSync(robotsPath, robots, 'utf8');
console.log('Robots generated at public/robots.txt');
