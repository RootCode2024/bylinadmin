import Echo from "laravel-echo"
import Pusher from "pusher-js"

window.Pusher = Pusher

const echo = new Echo({
  broadcaster: "pusher",
  key: import.meta.env.VITE_PUSHER_APP_KEY,
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
  wsHost: window.location.hostname,
  wsPort: import.meta.env.VITE_PUSHER_PORT || 6001,
  wssPort: import.meta.env.VITE_PUSHER_PORT || 6001,
  forceTLS: import.meta.env.VITE_PUSHER_SCHEME === "https",
  enabledTransports: ["ws", "wss"],
  authEndpoint: `${import.meta.env.VITE_API_URL}/api/broadcasting/auth`,
  auth: {
    headers: {
      Accept: "application/json",
    },
  },
})

export default echo
