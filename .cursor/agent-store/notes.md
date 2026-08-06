<tldr>
- [ ] Pages CI: switched to `peaceiris/actions-gh-pages` → push creates `gh-pages`; then set Pages source to that branch ([discussion #49948](https://github.com/orgs/community/discussions/49948)).
</tldr>

- [ ] Pages deploy — official `deploy-pages` “succeeds” but site stays unicorn (`status: null`); workflow now pushes `out/` to `gh-pages`. After first green run, set Settings → Pages → Deploy from branch `gh-pages` `/`.
- [x] Logo + favicon — teal chain mark in header/hero; App Router icons exported in `out/`
