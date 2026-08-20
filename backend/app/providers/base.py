from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import datetime


class BaseProvider(ABC):
    @abstractmethod
    def get_observations(self, farm_id: int, **kwargs) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_latest(self, farm_id: int, **kwargs) -> Optional[Dict[str, Any]]:
        pass

    @abstractmethod
    def calculate_indices(self, data: Dict[str, Any]) -> Dict[str, Any]:
        pass
