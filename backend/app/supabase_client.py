from typing import Optional
from supabase import create_client, Client
from app.core.config import settings


def get_supabase_client() -> Optional[Client]:
    url = settings.SUPABASE_URL
    key = settings.SUPABASE_ANON_KEY
    if not url or not key:
        return None
    return create_client(url, key)


def get_supabase_service_client() -> Optional[Client]:
    url = settings.SUPABASE_URL
    key = settings.SUPABASE_SERVICE_ROLE_KEY
    if not url or not key:
        return None
    return create_client(url, key)
