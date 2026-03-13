

## Problem

The Source column code is correct — line 228 forces `'Phone'` for the first row and renders a phone icon. The icons should be visible. The most likely cause is the preview not reflecting the latest build.

## Plan

1. **No code changes needed** — the current code already:
   - Forces row 1 to show a Phone icon (green)
   - Shows AtSign icon for Email (purple)  
   - Shows BB/BV as text badges
   
2. **Force a rebuild** by adding a trivial comment to `InquiryTable.tsx` to trigger a fresh preview render, confirming the icons display.

If after rebuild the icons still don't show, I'll inspect the live preview with browser tools to identify the actual rendering issue.

