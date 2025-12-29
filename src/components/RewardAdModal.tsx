import { useMemo, useState } from "react";

type Props = {
  open: boolean;
  levelId: number;
  reward: number;
  onClaimed: () => void;   // continuar al siguiente nivel
  onSkip: () => void;      // continuar sin recompensa (opcional)
};

const ZONE_ID = "10391169";
const SCRIPT_SRC = "https://nap5k.com/tag.min.js";

function loadMonetagOnce() {
  if (document.querySelector(`script[data-zone="${ZONE_ID}"]`)) {
    return Promise.resolve(true);
  }
  return new Promise<boolean>((resolve) => {
    const s = document.createElement("script");
    s.dataset.zone = ZONE_ID;
    s.src = SCRIPT_SRC;
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

// anti-trampa (1 vez por nivel)
function getClaimedLevels(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem("claimedLevels") || "[]"));
  } catch {
    return new Set();
  }
}
function saveClaimedLevels(set: Set<string>) {
  localStorage.setItem("claimedLevels", JSON.stringify([...set]));
}

export function RewardAdModal({ open, levelId, reward, onClaimed, onSkip }: Props) {
  const claimed = useMemo(() => getClaimedLevels(), []);
  const alreadyClaimed = claimed.has(String(levelId));
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  if (!open) return null;

  const claim = async () => {
    if (alreadyClaimed) {
      setMsg("Ya reclamaste este nivel.");
      return;
    }

    setLoading(true);
    setMsg("Mostrando anuncio...");

    await loadMonetagOnce();

    claimed.add(String(levelId));
    saveClaimedLevels(claimed);

    setMsg(`¡Reclamado! +${reward} monedas.`);
    setLoading(false);

    onClaimed();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 grid place-items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl text-center">
        <div className="text-5xl mb-2">🎉</div>
        <h3 className="text-2xl font-black text-gray-800 mb-1">¡Nivel {levelId} completado!</h3>
        <p className="text-gray-600 mb-5">Reclama tu recompensa al ver un anuncio.</p>

        <button
          onClick={claim}
          disabled={loading || alreadyClaimed}
          className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-60"
        >
          {loading ? "Cargando..." : alreadyClaimed ? "Recompensa ya reclamada" : `Reclamar +${reward} monedas`}
        </button>

        <div className="min-h-[20px] mt-3 text-sm text-gray-700">{msg}</div>

        <button
          onClick={onSkip}
          className="w-full mt-3 py-3 rounded-xl font-semibold border border-gray-300"
        >
          Continuar sin recompensa
        </button>
      </div>
    </div>
  );
}
