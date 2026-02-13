# Vercel Configuration Fix: Output Directory

## Problem
The build failed with: `Error: No Output Directory named "public" found`.
This happens because Vercel is looking for a folder named `public` to serve your site, but your Next.js app is building to `.next` (the default).

## Solution
You need to change the **Output Directory** setting in Vercel to be empty (default).

### Steps to Fix
1.  Go to your **Vercel Dashboard**.
2.  Select your project (`employee-management-frontend` or similar).
3.  Go to **Settings** -> **Build & Development**.
4.  Look for **Output Directory**.
5.  If it is set to `public` (or anything else), **Delete it** (make it empty).
    *   *Note:* The placeholder text might say `public` or `dist`, but the *value* should be empty so it uses the framework default.
    *   If you can't make it empty, try setting it to `.next`.
6.  Click **Save**.
7.  Go to the **Deployments** tab and **Redeploy** the latest commit.

### Why this happened?
Vercel sometimes defaults to `public` for static sites. Since your app uses dynamic features (Server Side Rendering), it builds to `.next`, so Vercel couldn't find the `public` folder it was told to look for.
