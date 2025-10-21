import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: "pusher",
  key: import.meta.env.VITE_PUSHER_APP_KEY,      // ou ta clé directement
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER, // ou "mt1"
  forceTLS: true,     // Toujours true sur prod (HTTPS)
  encrypted: true,    // Recommandé pour sécuriser la connexion
});

export default echo;
