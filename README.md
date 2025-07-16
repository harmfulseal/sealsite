# sealsite

## View Counter with Cloudflare Pages

This project uses a Cloudflare Worker to implement a view counter compatible with Cloudflare Pages.

### Setup and Deployment

1. **Cloudflare Worker:**

- Deploy the `cloudflare-worker.js` file as a Cloudflare Worker.
- Bind a Workers KV namespace to the variable `VIEW_COUNT_KV` in the Cloudflare dashboard.
- The worker handles the following API endpoints:
  - `POST /api/viewcount/increment` - increments the view count with rate limiting.
  - `GET /api/viewcount` - retrieves the current view count.

2. **Cloudflare Pages:**

- Configure your Cloudflare Pages project to route requests starting with `/api/viewcount` to the Cloudflare Worker.
- This ensures that the frontend calls to `/api/viewcount/increment` and `/api/viewcount` are handled by the Worker.

3. **Frontend:**

- The frontend (`index.html`) calls the Worker API endpoints to increment and display the view count.

### Legacy Server Removal

- The legacy `server.js` and `viewcount.txt` files are no longer used and should be removed as they are incompatible with Cloudflare Pages.

### Testing

- After deployment, visit your site and verify that the view count increments and displays correctly.
