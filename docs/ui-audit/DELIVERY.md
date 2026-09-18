# Delivery provenance

The source was transferred from the native grok test workspace to a separate Mac worktree via authorized MCP file operations. Each patch-transfer part and all six tested UI source files were SHA-256 verified. `native-grok-results.json` is a byte-identical copy of the actual 61-check native Chromium result (SHA-256 `a381090fea8d74ba83885818b78d118ffde4bc368c926dd18ce2eb5dbbd99529`). `runtime/results.json` retains this native-grok result, not a claimed Mac browser result.

The Mac independently reran all 95 Node checks and the build successfully. The supplemental Mac browser launch did not complete because the matching Playwright browser executable was missing; that separate failure is recorded in `mac-browser-environment-failure.json`. It does not invalidate the matching-source native Chromium run, and is not counted as a browser pass.

The native screenshots, PDF and PPT files remain in the grok working tree; they are not included in this source-transfer commit. The documented test script reproduces them, and CI is configured to upload the complete evidence directory even when the intent gate fails. Do not claim remote screenshot review or production deployment from these files.

The overall audit remains NOT ALL PASS for the original UI/actual-Agent shared-state requirement. This is a review candidate, not approval to merge or deploy.

Upstream was checked again at `12139f1`. The five post-`3f29aef` changes modify the old inline selector/routing code only. This candidate replaces those handlers with the hash-verified modular implementation, preserving canonical and legacy route support, and is rebased on that newer main snapshot before review.
