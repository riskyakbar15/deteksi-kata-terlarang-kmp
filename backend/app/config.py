import secrets
import warnings
from pydantic_settings import BaseSettings, SettingsConfigDict


# Sentinel default. If this value is still in use at runtime it means no
# SECRET_KEY was provided via environment/.env, which is unsafe in production.
_DEFAULT_SECRET_KEY = "CHANGE_ME_INSECURE_DEFAULT_SECRET_KEY"


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Deteksi Kata Terlarang API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "sqlite:///./forbidden_words.db"

    # JWT
    SECRET_KEY: str = _DEFAULT_SECRET_KEY
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # CORS
    CORS_ORIGINS: list = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # Default admin account (used only by the seed script)
    DEFAULT_ADMIN_USERNAME: str = "admin"
    DEFAULT_ADMIN_EMAIL: str = "admin@example.com"
    DEFAULT_ADMIN_PASSWORD: str = "admin123"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

    def model_post_init(self, __context) -> None:
        """Fail fast in production if the SECRET_KEY was not overridden."""
        if self.SECRET_KEY == _DEFAULT_SECRET_KEY:
            if self.DEBUG:
                # Generate an ephemeral key so local development still works,
                # while making it obvious the value must be configured.
                object.__setattr__(self, "SECRET_KEY", secrets.token_urlsafe(48))
                warnings.warn(
                    "SECRET_KEY is not set. A temporary key was generated for "
                    "development. Tokens will be invalidated on restart. Set "
                    "SECRET_KEY in your .env for a stable, secure value.",
                    stacklevel=2,
                )
            else:
                raise RuntimeError(
                    "SECRET_KEY must be set via environment or .env when DEBUG=False. "
                    "Refusing to start with an insecure default."
                )


settings = Settings()
