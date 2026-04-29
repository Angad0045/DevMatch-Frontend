# DevMatch — Frontend

> DevMatch — a developer matching platform built on intent, stack, and ambition.

---

## What is DevMatch?

DevMatch is a Tinder-style developer matching platform where engineers connect based on **intent** — not random discovery. Swipe on developer profiles filtered by shared stack, experience level, and collaboration goals.

**Core flows:**

- 🔐 Register → onboarding → swipe feed
- 👆 Drag-to-swipe cards with like/pass animations
- 🤝 Automatic match detection on mutual likes
- 💬 Real-time chat via Socket.io per match
- ✏️ Full profile management

---

## Tech Stack

| Layer            | Technology                |
| ---------------- | ------------------------- |
| Framework        | React 18                  |
| Build tool       | Vite 5                    |
| Styling          | Tailwind CSS v4           |
| State management | Redux Toolkit             |
| Routing          | React Router v6           |
| HTTP client      | Axios (with interceptors) |
| Real-time        | Socket.io client          |
| Utility          | clsx + tailwind-merge     |

---

## Project Structure

```
src/
├── app/
│   ├── store.js              # Redux store
│   └── hooks.js              # useAppDispatch + useAppSelector
├── features/                 # Redux slices — one per domain
│   ├── auth/authSlice.js     # user, accessToken, isNewUser
│   ├── feed/feedSlice.js     # feed users, filters, pagination
│   ├── matches/matchSlice.js # match list
│   └── chat/chatSlice.js     # messages, typing, online presence
├── services/                 # Axios API calls
│   ├── api.js                # Axios instance + token refresh interceptor
│   ├── authService.js
│   ├── userService.js
│   ├── feedService.js
│   ├── matchService.js
│   ├── swipeService.js
│   └── chatService.js
├── pages/
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   ├── onboarding/
│   │   └── OnboardingPage.jsx  # 4-step: photo → experience → skills → intent
│   ├── feed/
│   │   ├── FeedPage.jsx        # Two-column layout with side panel
│   │   └── SwipeCard.jsx       # Drag-to-swipe with animations
│   ├── matches/
│   │   └── MatchesPage.jsx     # Match list + unmatch flow
│   ├── chat/
│   │   └── ChatPage.jsx        # Two-panel: sidebar + active chat
│   └── profile/
│       └── ProfilePage.jsx     # Edit profile matching design system
├── components/
│   ├── ui/
│   │   ├── Button.jsx          # variant + size + loading state
│   │   └── Input.jsx           # label + error + password toggle
│   └── layout/
│       ├── Navbar.jsx          # Sticky nav with user dropdown
│       ├── ProtectedRoute.jsx  # Redirects unauthenticated users
│       └── GuestRoute.jsx      # Redirects authenticated users
├── hooks/
│   └── useSocket.js            # Singleton Socket.io connection
├── utils/
│   └── cn.js                   # clsx + tailwind-merge helper
├── constants/
│   └── index.js                # Intent options, skill suggestions
├── App.jsx                     # Routes + session bootstrap
├── main.jsx
└── index.css                   # Tailwind v4 @theme config
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- DevMatch backend running (see [backend repo](#))

### 1. Clone and install

```bash
git clone https://github.com/your-username/devmatch-frontend.git
cd devmatch-frontend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in your `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_SOCKET_URL=http://localhost:3000
```

> For production, point these at your Vercel REST API URL and Railway Socket.io URL.

### 3. Run in development

```bash
npm run dev
```

App starts on `http://localhost:5173`.

---

## Screens

### Auth — `/login` `/register`

Split-panel layout. Left side is a branded illustration panel with feature highlights and social proof. Right side is the form. Register includes a live password strength indicator.

### Onboarding — `/onboarding`

4-step flow triggered immediately after registration:

1. **Photo** — paste an image URL, live preview with error detection (skippable)
2. **Experience** — junior · mid · senior · principal
3. **Skills** — chip-based tag input with quick-add suggestions
4. **Intent** — multi-select 2×2 card grid

Progress bar and step counter update as you advance.

### Feed — `/feed`

Two-column layout:

- **Left:** draggable swipe card stack with bio strip and action buttons
- **Right:** Technical Stack card + Why You're a Match card

Swipe mechanics:

- Drag left/right or use Pass/Connect buttons
- Card rotates proportionally during drag
- PASS / CONNECT overlays fade in at threshold
- Keyboard shortcuts: `←` pass · `→` like
- Match toast appears for 3.5s when mutual like detected

### Matches — `/matches`

- Search bar (client-side, by name)
- Each card: avatar, name, intent badge, relative timestamp, skill tags
- Hover reveals kebab menu → unmatch with confirmation modal
- Skeleton loading state

### Chat — `/matches/:matchId/chat`

Two-panel layout matching the Messages screen:

- **Left sidebar:** conversation list with search, online indicators, skill tags, unread badges
- **Right panel:** active chat or empty state prompt

Chat features:

- Message history loaded via REST on mount
- Real-time send/receive via Socket.io
- Typing indicator with animated dots
- Auto-growing textarea (Shift+Enter for new line)
- Message timestamps on hover
- Soft-delete own messages
- Message clusters (avatar shown only on first in a sequence)

### Profile — `/profile`

Two-column layout:

- **Left:** avatar card with initials fallback, Available for Collabs toggle
- **Right:** edit form — headline, bio (with char counter), skill chips, experience level pills, collaboration preference cards (2×2), GitHub handle, timezone
- Save shows a bottom toast for 2.5s on success

---

## State Management

Redux Toolkit manages four slices:

```
auth
  user          ← persisted in localStorage (profile only)
  accessToken   ← in-memory only (never localStorage)
  isNewUser     ← routes new registrations to /onboarding

feed
  users[]       ← current card stack
  filters       ← intent, skills, experienceLevel
  pagination

matches
  list[]        ← all active matches

chat
  messages[]    ← current conversation
  typingUsers[] ← live typing state
  onlineUsers[] ← connected user IDs
```

---

## Auth & Session Flow

```
Register
  → dispatch(setNewUser(true))
  → dispatch(setCredentials({ user, accessToken }))
  → GuestRoute detects isNewUser → /onboarding

Onboarding complete
  → dispatch(setNewUser(false))
  → navigate('/feed')

Login (returning user)
  → dispatch(setCredentials({ user, accessToken }))
  → GuestRoute detects isNewUser=false → /feed

Page refresh
  App.jsx bootstrap:
  1. User found in localStorage?
  2. No accessToken in Redux (cleared on refresh)?
  3. POST /auth/refresh (httpOnly cookie sent automatically)
  4. Success → setCredentials({ accessToken })
  5. Failure → dispatch(logout()) → /login

Token expiry mid-session
  Axios response interceptor:
  1. 401 received
  2. POST /auth/refresh
  3. Retry original request with new token
  4. If refresh also fails → logout → /login
  (Queues concurrent requests during refresh — no duplicate refresh calls)
```

---

## Socket.io

`useSocket.js` manages a **module-level singleton** — one persistent connection for the app lifetime, not per component.

```javascript
// Client connects with JWT access token
const socket = io(VITE_SOCKET_URL, {
  auth: { token: accessToken },
  transports: ["websocket"],
});

// Incoming events dispatch to Redux automatically
socket.on("message:new", (msg) => dispatch(appendMessage(msg)));
socket.on("typing:start", (data) => dispatch(setTyping(data)));
socket.on("typing:stop", (data) => dispatch(clearTyping(data.userId)));
socket.on("user:online", (data) => dispatch(userOnline(data.userId)));
socket.on("user:offline", (data) => dispatch(userOffline(data.userId)));
```

The socket is not disconnected on page navigation — only on logout.

---

## Design System

Warm cream palette matching the design reference, built entirely with Tailwind v4's `@theme` config — no `tailwind.config.js` needed.

```css
/* Key tokens */
--color-cream-100: #f2ede6; /* page background */
--color-ink: #1c1917; /* primary text + buttons */
--color-ink-muted: #78716c; /* secondary text */
--color-violet-badge: #ede9fe; /* intent highlight */
--color-violet-text: #7c3aed;

/* Font */
--font-sans: "Plus Jakarta Sans", sans-serif;

/* Animations */
--animate-swipe-left: swipeLeft 0.4s ease-in forwards;
--animate-swipe-right: swipeRight 0.4s ease-in forwards;
--animate-slide-up: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
```

**Utility classes:**

- `.card` — white surface with border and shadow
- `.tag` — pill chip for skill tags and badges
- `cn()` — `clsx` + `tailwind-merge` for conditional class composition

---

## Scripts

```bash
npm run dev      # Development server (HMR)
npm run build    # Production build
npm run preview  # Preview production build locally
npm run lint     # ESLint
```

---

## Environment Variables

| Variable            | Required | Description                                                       |
| ------------------- | -------- | ----------------------------------------------------------------- |
| `VITE_API_BASE_URL` | ✓        | Backend REST API base URL (e.g. `https://api.devmatch.io/api/v1`) |
| `VITE_SOCKET_URL`   | ✓        | Socket.io server URL (e.g. `https://socket.devmatch.io`)          |

> Only `VITE_` prefixed variables are exposed to the browser by Vite.
> Never put secrets here — this code is public.

---

## Deployment

### Vercel (recommended)

```bash
npm run build
# Deploy /dist to Vercel
```

Or connect the GitHub repo to Vercel — it detects Vite automatically. Set environment variables in the Vercel dashboard under **Settings → Environment Variables**.

**Important:** Add a `vercel.json` to handle client-side routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Without this, refreshing on `/feed` or `/matches/:id/chat` returns a 404.

---

## Recommended VSCode Extensions

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "dsznajder.es7-react-js-snippets"
  ]
}
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit using conventional commits: `feat(feed): add filter by timezone`
4. Push and open a Pull Request

Pre-commit hooks (Husky + lint-staged) run ESLint and Prettier automatically.

---

## Related

- [DevMatch Backend →](https://github.com/your-username/devmatch-backend)

---

## License

MIT © DevMatch
