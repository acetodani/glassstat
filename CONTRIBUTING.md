# Contributing to GlassStat

Thanks for considering a contribution! Here's how to get started.

## Development Setup

1. Fork and clone the repo
2. Follow the [Manual Setup](#manual-setup) instructions in the README
3. Create a branch for your feature: `git checkout -b feature/your-feature`

## Guidelines

- Keep PRs focused — one feature or fix per PR
- Add types for new data structures in `frontend/src/types/`
- Backend routes go in `backend/app/api/routes/`
- New chart components go in `frontend/src/components/charts/`

## Running Tests

```bash
# Backend
cd backend && python -m pytest

# Frontend
cd frontend && npm test
```

## Reporting Bugs

Open an issue with:
- What you expected
- What happened
- Your OS and camera format (if relevant)
