# Continuous Integration / Continuous Deployment

Our CI/CD pipeline ensures code quality and automates artifact generation.

## CI Pipeline (GitHub Actions)
Triggered on every PR to `main`:
1. **Checkout Code**
2. **Setup Node.js 20**
3. **Install Dependencies:** `npm ci`
4. **Linting:** `npm run lint` (Checks TypeScript and style rules)
5. **Web Build Test:** `npm run build` ensures Vite compiles without errors.

## CD Pipeline
Triggered on tags pushed to `main` (e.g., `v1.2.0`):
1. Runs the full CI Pipeline.
2. **Setup Java 17 & Android SDK**.
3. **Capacitor Sync:** `npx cap sync android`.
4. **Gradle Assemble Release:** Builds the signed APK.
5. **Artifact Upload:** Uploads the APK to the GitHub Release page automatically.
