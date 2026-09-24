# Hosting on Namecheap

The owners' screenshot says Namecheap is their **domain host** and dealr.cloud currently runs the website. That establishes the registrar, not the available web-hosting plan. Confirm the actual plan before choosing the deployment target.

This app requires a supported Node.js runtime. It is not a static HTML export: live inventory and lead delivery run on the server. Use Node 24 LTS for deployment (the locked Next.js release requires at least Node 20.9) and a hosting plan with sufficient memory to run Next.js. Check the installed Next.js package's engine requirements when changing framework versions.

Namecheap documents custom Next.js servers under cPanel's **Setup Node.js App**:
[Namecheap Next.js deployment guide](https://www.namecheap.com/support/knowledgebase/article.aspx/10686/29/how-to-deploy-reactjs-vitejs-react-native-and-nextjs-applications-in-cpanel/)

The article's sample version table is old; use the requirements of the version in this project's lockfile. Namecheap also supports Node deployments on suitable VPS plans. If the existing plan cannot run this version, keep DNS at Namecheap and use a compatible Node host or upgrade the hosting plan.

## Local preview

```sh
npm ci
npm run dev
```

Open http://localhost:3000. No environment variables are required for the labeled inventory preview. Forms will not claim delivery without an approved lead relay.

## Production build

Set production environment variables in the host's secret settings, using `.env.example` as a checklist. Never commit actual values. `SITE_URL` must be the final HTTPS origin (no trailing slash). Keep `SITE_INDEXABLE=false` until the approved live feed and lead flow have been tested.

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm run start
```

For cPanel Passenger, use the included `server.cjs` as the application startup file and `NODE_ENV=production`. The custom server uses `PORT` from the host. Install dependencies and build in a compatible Linux environment; do not upload macOS native node_modules to Linux. If cPanel's build limits are too low, create the `.next` build on a matching Linux build runner, then deploy it with source configuration and Linux dependencies.

Upload `src/`, `public/`, `.next/`, `package.json`, `package-lock.json`, `next.config.ts`, `server.cjs`, and runtime dependencies. Do not upload private research, conversation screenshots, original source-video archives, local Python environments, test screenshots, or secrets. The `research/` directory is gitignored and never imported by the app.

## Launch sequence

1. Connect and validate the dealer-authorized inventory adapter and lead relay on a staging origin.
2. Confirm the permanent provider-hosted credit-application URL before redirecting the legacy dealership domain.
3. Confirm the new domain, business email, logo treatment, phone/hours and legal copy with the dealer.
4. Replace the two temporary video slots if the new films are ready. Review captions and posters.
5. Configure HTTPS, environment variables, trusted proxy headers and shared abuse protection. Verify that deployment logs never contain lead payloads.
6. Smoke-test home → inventory → vehicle → inquiry, financing link, trade/contact forms, phone/text/maps, and a provider-confirmed CRM test lead.
7. Point the new domain through Namecheap DNS. Preserve old `/inventory/<slug>/<id>` paths with path-preserving 301 redirects at the old host. This app also redirects `/home`, `/contact`, and `/trade-in` aliases.
8. Enable `SITE_INDEXABLE=true` only with the real feed active, then rebuild/restart. Check canonical URLs, sitemap, robots, and structured vehicle data.
9. Monitor feed freshness and relay delivery. Ensure sold vehicles disappear and source photo links remain valid.

No DNS changes or public deployment were made during this build.
