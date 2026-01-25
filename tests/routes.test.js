import test from "node:test"
import assert from "node:assert/strict"
import path from "node:path"
import fs from "node:fs"

const projectRoot = process.cwd()

const requiredRoutes = [
  "app/(marketing)/page.tsx",
  "app/(marketing)/login/page.tsx",
  "app/(dashboard)/admin/page.tsx",
  "app/(dashboard)/client/page.tsx",
  "app/(dashboard)/worker/page.tsx",
  "app/(dashboard)/supervisor/page.tsx",
]

test("required route files exist", () => {
  requiredRoutes.forEach((routePath) => {
    const fullPath = path.join(projectRoot, routePath)
    assert.ok(fs.existsSync(fullPath), `Missing route: ${routePath}`)
  })
})
