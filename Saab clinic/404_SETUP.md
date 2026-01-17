# 404 Error Page Setup

The site now includes a `404.html` file for wrong URLs. To enable it:

## For local testing (Python):
```bash
python3 -m http.server --directory . 8000
```

## For GitHub Pages:
GitHub automatically serves `404.html` for any non-existent path.

## For other hosting (Netlify, Vercel, etc.):
Configure your server to serve `404.html` for all 404 errors:

### Netlify:
Add to `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/404.html"
  status = 404
```

### Vercel:
Add to `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/404.html" }
  ]
}
```

The 404 page includes:
- Large "404" error code
- "Page Not Found" headline
- Helpful navigation links back to home and services
- Contact link for further assistance
- Responsive dark theme matching the site design
