from . import consumers
from channels import route


channel_routing = [
    route('websocket.connect', consumers.ws_connect),
    route('websocket.receive', consumers.ws_receive),
        route('websocket.disconnect', consumers.ws_disconnect),
]
