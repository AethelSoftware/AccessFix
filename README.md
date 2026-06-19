# AccessFix 🔍

> A basic accessibility auditor that scans websites for WCAG compliance with GitHub repo integration.

## 🎯 The Vision

I built a tool to help developers catch accessibility issues early. It scans websites, checks against WCAG standards, and integrates with GitHub repos to track issues alongside your code.

## ⚠️ Current Status

**Deprecated / End-of-Life** — This project has been sunsetted. You won't be able to log in or run scans anymore. It lives here as a record of what I built.

## 🔗 Project Link

**[AccessFix]((https://accessfix.vercel.app/))** — The site is still up, but authentication and scanning functionality have been disabled.

## ✨ Features (What It Did)

- [x] Website URL scanning for WCAG compliance
- [x] GitHub repository integration
- [x] Automated accessibility issue detection
- [x] Basic reporting dashboard
- [ ] Full WCAG 2.1 AA coverage *(never fully implemented)*
- [ ] Continuous integration / PR checks *(planned, not shipped)*

## 🛠️ Built With

- **JavaScript** (vanilla + React)
- **React** for the frontend UI
- [Accessibility scanning library — e.g., axe-core, pa11y]
- [GitHub API for integration]

## 🤔 Why I Built It

Accessibility is often an afterthought in development. I wanted to create a tool that made it easier to catch issues early and integrate checks.

## 📦 What Went Wrong

- Scraping at scale is harder than it looks
- Authentication and rate-limiting became a headache
- The scope was too broad for a solo project
- Maintaining the scanning engine required more effort than anticipated
- Lighthouse is much better and more thorough.
---

*Not every project ships. But every project teaches you something.* ✌️
