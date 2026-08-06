<tldr>
- [x] Pages CI: `peaceiris` → `gh-pages` branch publish ([discussion #49948](https://github.com/orgs/community/discussions/49948)); site live at https://rutvik24.github.io/app-universal-links-helper/
</tldr>

- [x] Pages deploy — switched off stuck `actions/deploy-pages` (`deployment_queued` / fake success). Workflow builds with Bun + Node 24 and publishes `out/` to `gh-pages`. Pages source = branch `gh-pages` `/`. Note: GitHub’s auto `pages-build-deployment` may still timeout on Deploy; content still publishes via the classic Pages builder.
- [x] Logo + favicon — teal chain mark in header/hero; App Router icons exported in `out/`
