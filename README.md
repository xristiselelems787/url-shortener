# URL Shortener

A fast, simple URL shortener with custom aliases built with Nuxt 3.

## Features

- 🔗 Shorten any URL
- ✏️ Custom aliases (e.g., `/my-brand`)
- 📊 Click tracking
- ⚡ Fast redirects
- 🎨 Clean, modern UI
- 📱 Responsive design

## Tech Stack

- **Framework**: Nuxt 3
- **Storage**: File-based (Nitro storage)
- **Styling**: Vanilla CSS
- **Deployment**: Vercel

## Usage

1. Enter a long URL
2. Optionally add a custom alias
3. Click "Shorten URL"
4. Copy and share your short link!

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## API Endpoints

### POST /api/shorten
Create a shortened URL.

**Body:**
```json
{
  "url": "https://example.com/long-url",
  "alias": "custom-alias" // optional
}
```

**Response:**
```json
{
  "shortUrl": "https://your-domain.com/abc123",
  "code": "abc123"
}
```

### GET /api/urls
Get list of recent shortened URLs.

### GET /[code]
Redirect to the original URL.

---

Built with 🔥 by 0xAssist
