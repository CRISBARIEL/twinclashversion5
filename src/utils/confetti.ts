import { playSoundConfetti } from './soundManager';

export const createConfetti = () => {
  playSoundConfetti();

  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  const randomInRange = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
  };

  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

  const confettiElements: HTMLDivElement[] = [];

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      clearInterval(interval);
      confettiElements.forEach(el => el.remove());
      return;
    }

    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.width = '10px';
      confetti.style.height = '10px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = Math.random() * window.innerWidth + 'px';
      confetti.style.top = '-20px';
      confetti.style.opacity = '1';
      confetti.style.borderRadius = '50%';
      confetti.style.pointerEvents = 'none';
      confetti.style.zIndex = '9999';

      document.body.appendChild(confetti);
      confettiElements.push(confetti);

      const angle = randomInRange(0, 360);
      const velocity = randomInRange(10, 30);
      const drift = randomInRange(-2, 2);

      let posX = parseFloat(confetti.style.left);
      let posY = -20;
      let velocityX = Math.cos(angle * Math.PI / 180) * velocity;
      let velocityY = Math.sin(angle * Math.PI / 180) * velocity;

      const animate = () => {
        posX += velocityX + drift;
        posY += velocityY;
        velocityY += 0.5;

        confetti.style.left = posX + 'px';
        confetti.style.top = posY + 'px';
        confetti.style.opacity = String(Math.max(0, 1 - posY / window.innerHeight));

        if (posY < window.innerHeight && Date.now() < animationEnd) {
          requestAnimationFrame(animate);
        } else {
          confetti.remove();
        }
      };

      animate();
    }
  }, 250);
};
