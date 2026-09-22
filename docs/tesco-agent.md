# Tesco Ireland local agent

This proof of concept exposes a local MCP server that uses a visible, dedicated Chrome profile to search Tesco Ireland and prepare a basket. It is not an official Tesco integration.

## Current live status

The MCP protocol and safety controls work, but a live test from the development machine was rejected by Tesco Ireland's edge security with `Access Denied`. The agent detects this explicitly and stops. It does not attempt to hide automation or bypass retailer controls. Consequently, live search and basket preparation remain experimental and unavailable wherever Tesco applies this block.

## Safety boundary

- `tesco_prepare_basket` defaults to `dryRun: true`.
- Adding items requires `dryRun: false` and is blocked when the estimated products total exceeds the supplied budget.
- The agent never accepts, reads or stores a Tesco password or card number.
- The browser profile is stored locally in `.grocery-pilot/tesco-profile` and excluded from Git.
- Checkout preview requires the exact confirmation phrase `REVIEW TESCO CHECKOUT`.
- No MCP tool can click the final purchase button in this release.
- CAPTCHA, MFA, expired sessions and changed Tesco pages require user intervention.
- Product matching, live total, delivery fees, substitutions and the delivery slot must be reviewed by the user.

## Run

```bash
npm run agent:tesco
```

For interactive MCP inspection:

```bash
npm run agent:tesco:inspect
```

Example MCP client configuration:

```json
{
  "mcpServers": {
    "grocery-pilot-tesco": {
      "command": "npm",
      "args": ["run", "agent:tesco"],
      "cwd": "/absolute/path/to/grocery-pilot"
    }
  }
}
```

## Intended sequence

1. Call `tesco_open_login` and sign in manually in the visible Tesco window.
2. Call `tesco_prepare_basket` with `dryRun: true`.
3. Review matches, missing products, unit-price limits and the total.
4. Call it again with `dryRun: false` to add the reviewed products.
5. Call `tesco_open_basket` and verify Tesco's live basket.
6. Call `tesco_open_checkout_preview` with the required confirmation values.
7. Complete the purchase manually on Tesco after checking the final amount and delivery slot.
8. Call `tesco_close_session` to close the dedicated browser cleanly.
