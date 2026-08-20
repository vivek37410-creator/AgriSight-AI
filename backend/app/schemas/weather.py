from datetime import datetime
from pydantic import BaseModel, ConfigDict


class WeatherObservationBase(BaseModel):
    temperature: float | None = None
    humidity: float | None = None
    rainfall: float | None = None
    wind_speed: float | None = None
    pressure: float | None = None
    recorded_at: datetime | None = None
    source: str


class WeatherObservation(WeatherObservationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    farm_id: int


class WeatherForecastBase(BaseModel):
    forecast_time: datetime
    temperature: float | None = None
    humidity: float | None = None
    rainfall_probability: float | None = None
    rainfall_amount: float | None = None
    wind_speed: float | None = None
    source: str


class WeatherForecast(WeatherForecastBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    farm_id: int
