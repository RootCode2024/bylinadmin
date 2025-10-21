import Echo from "laravel-echo"
import Pusher from "pusher-js"

window.Pusher = Pusher

const echo = new Echo({
  broadcaster: "pusher",
  key: "83d69067c9d554963de2",
  cluster: "eu",

  wsHost: window.location.hostname, // évite le hardcode localhost
  wsPort: 6001,
  wssPort: 6001,
  forceTLS: false,          // ⚠️ mettre false en local
  enabledTransports: ["ws", "wss"],

  authEndpoint: "http://localhost:8000/api/broadcasting/auth",
  auth: {
    headers: {
      Accept: "application/json",
    },
  },
})

export default echo
