from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import model_validator


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')
    database_url: str = 'sqlite:///./nebula.db'
    environment: str = 'development'
    secure_cookies: bool = False
    redis_url: str = 'redis://redis:6379/0'
    refresh_days: int = 14
    ai_provider: str = 'mock'

    @model_validator(mode='after')
    def production_guard(self):
        if self.refresh_days < 1:
            raise ValueError('refresh_days must be positive')
        if self.environment == 'production' and (not self.secure_cookies or not self.database_url.startswith('postgresql')):
            raise ValueError('Production requires PostgreSQL and secure cookies')
        return self


settings = Settings()
