from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    jwt_secret: str = "supersecretkey"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    model_config = {
        "env_file": ".env",
        "case_sensitive": False,
        "extra": "ignore",
    }


settings = Settings()
