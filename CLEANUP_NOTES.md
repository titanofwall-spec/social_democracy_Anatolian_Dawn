# Legacy cleanup

The adaptation now uses AP state keys, Turkish coalition terminology, prime-minister and defense-minister fields, and parliament chart IDs consistently across source and browser code.

Removed inherited German advisor cards, Weimar-specific events and party actions, German election branches, obsolete voter categories and faction effects, and identifiable German portraits, posters and event images. Where a surviving Turkish scene used one of those images, it now uses the existing TBMM image. Historical attribution documents and legitimate references to Germany in Turkish history and international relations are retained.

Inherited German endings, constitutional provisions and criminal-law reforms were replaced with Turkish-context summaries and explicitly hypothetical reform choices. These are editorial adaptations, rather than a comprehensive historical review or a final balancing pass.

The national election and cabinet paths were repaired alongside the renames: elections use 450 seats, snap-election scheduling counts half-month turns correctly, and dropping finance removes the finance portfolio. Cyprus military strength remains separate from general armed-forces strength.

The pinned engine dependency is retained. `npm run build` normalizes source paths for Windows and Linux and regenerates the playable browser data while preserving the custom interface. `node scripts/test-cleanup.js` checks initialization, a year of turns, national and local elections, cabinet changes, coalition collapse, Cyprus entry, dashboards and the ending with the engine. It is a simulated engine check; full visual browser testing and every possible playthrough remain unverified.

Start a fresh game: old saves use renamed state and scene IDs and are not supported. No commits, pushes or deployments were performed.
