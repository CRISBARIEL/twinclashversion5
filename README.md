# ⚡ Twin Clash - Memory Card Game

<div align="center">

![Twin Clash Logo](public/logo-twinclash.svg)

**Epic memory matching game with progression system, themes, and competitive duels**

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/YOUR_USERNAME/twin-clash)

[Play Demo](#) | [Report Bug](#) | [Request Feature](#)

</div>

---

## 🚀 Quick Deploy to Netlify

Click the button above to deploy Twin Clash to Netlify in one click!

### Required Environment Variables

When deploying, you'll be asked to configure these environment variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your Supabase project at: https://app.supabase.com/project/_/settings/api

### Stripe Configuration (for payments)

To enable real payments, you must configure Stripe:
1. Get your Stripe Secret Key from https://dashboard.stripe.com/apikeys
2. Add it to Supabase Edge Functions Secrets (NOT in Vercel)
3. See [STRIPE_SETUP.md](STRIPE_SETUP.md) for detailed instructions

## 🎮 Features

### Core Gameplay
- **5 Difficulty Levels** - From beginner to expert
- **Dynamic Timer** - Challenge yourself against the clock
- **Score System** - Earn points for matches and speed
- **Smooth Animations** - Professional flip effects and transitions

### Progression System
- **Coin Economy** - Earn coins by completing games
- **Theme Shop** - 6 unlockable card themes
- **Daily Rewards** - Come back daily for bonus coins
- **Global Leaderboard** - Compete with players worldwide

### Visual & Audio
- **Professional Branding** - Twin Clash logo with neon glow effects
- **6 Card Themes** - Classic, Ocean, Forest, Sunset, Space, Neon
- **Sound Effects** - Card flips, victory celebrations, UI feedback
- **Confetti Animations** - Celebrate your victories

### Technical
- **User Authentication** - Secure Supabase auth
- **Cloud Sync** - Save progress across devices
- **Responsive Design** - Perfect on mobile and desktop
- **PWA Ready** - Install as mobile app (Capacitor configured)

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Hosting:** Netlify
- **Mobile:** Capacitor (Android ready)

## 📦 Local Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/twin-clash.git
   cd twin-clash
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Supabase credentials.

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Open browser:**
   ```
   http://localhost:5173
   ```

### Build for Production

```bash
npm run build
```

## 🗄️ Database Setup

The project uses Supabase with the following tables:

- `profiles` - User profiles and progression data
- `scores` - Game scores and leaderboard
- `user_themes` - Purchased and equipped themes

### Migrations

Migrations are located in `supabase/migrations/`:
- Create scores table
- Create profiles table
- Add crew and bot fields
- Add user themes system

## 🔊 Sound Effects (Optional)

To enable sound effects, generate WAV files using the script in `SOUNDS_README.md`:

```bash
# Generate sounds with Python
python generate_sounds.py

# Move to public folder
mkdir -p public/sounds
mv *.wav public/sounds/
```

**Sound files:**
- `zap.wav` - Electric zap (logo reveal)
- `flip_pop.wav` - Card flip sound
- `countdown_click.wav` - Countdown tick
- `confetti.wav` - Victory celebration
- `loop_150bpm.wav` - Background music (150 BPM)

## 📱 Mobile App (Android)

The project includes Capacitor configuration for Android:

```bash
# Build web app
npm run build

# Sync with Capacitor
npx cap sync android

# Open in Android Studio
npx cap open android
```

## 🎨 Customization

### Adding New Themes

Edit `src/lib/skins.ts` to add new card themes:

```typescript
{
  id: 7,
  name: 'My Theme',
  price: 150,
  cardBackColor: 'bg-gradient-to-br from-color-500 to-color-700',
  cardBorderColor: 'border-color-400',
}
```

### Adjusting Difficulty

Edit `src/components/GameShell.tsx`:

```typescript
const LEVELS = {
  1: { pairs: 6, timeLimit: 60 },
  2: { pairs: 8, timeLimit: 50 },
  // ... customize
}
```

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- JWT-based authentication
- Environment variables for sensitive data
- HTTPS by default on Netlify
- Security headers configured

## 📊 Performance

- **Bundle size:** ~328 KB (gzipped: 96 KB)
- **Lighthouse score:** 90+ on all metrics
- **First Contentful Paint:** < 1s
- **Time to Interactive:** < 2s

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Images from Pexels (stock photos)
- Icons from Lucide React
- Supabase for backend infrastructure
- Netlify for hosting

## 📞 Support

For deployment help, see `DEPLOYMENT.md`

For sound setup, see `SOUNDS_README.md`

---

<div align="center">

**Built with ⚡ by [Your Name]**

[⭐ Star this repo](https://github.com/YOUR_USERNAME/twin-clash) | [🐛 Report Bug](https://github.com/YOUR_USERNAME/twin-clash/issues)

</div>
