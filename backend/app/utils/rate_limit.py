from slowapi import Limiter
from slowapi.util import get_remote_address

# Shared limiter instance. Keyed by client IP address.
# Imported by main.py (to register state + handler) and by routers that
# need to apply per-endpoint limits.
limiter = Limiter(key_func=get_remote_address)
