from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class ModelMetadata:
    model_name: str
    model_version: str
    framework: str
    architecture: str
    input_size: tuple[int, int]
    classes: List[str]
    training_date: str
    accuracy: Optional[float] = None
    macro_f1: Optional[float] = None
    supported_crop: str = ""
    status: str = "active"


@dataclass
class CropModelRegistry:
    crop_models: dict[str, ModelMetadata] = field(default_factory=dict)
    crop_classifier: Optional[ModelMetadata] = None

    def register_crop_model(self, metadata: ModelMetadata) -> None:
        self.crop_models[metadata.supported_crop.lower()] = metadata

    def get_crop_model(self, crop_name: str) -> Optional[ModelMetadata]:
        return self.crop_models.get(crop_name.lower())

    def get_crop_classifier(self) -> Optional[ModelMetadata]:
        return self.crop_classifier

    def list_supported_crops(self) -> List[str]:
        return list(self.crop_models.keys())


_registry = CropModelRegistry()

_registry.crop_classifier = ModelMetadata(
    model_name="plant_classifier",
    model_version="v1",
    framework="pytorch",
    architecture="MobileNetV3Small",
    input_size=(224, 224),
    classes=[
        "alo Vera", "Apple leaf", "Ashwagandha", "Banana", "Bell_pepper leaf",
        "Blueberry leaf", "Calendula", "Chamomile", "Cherry leaf", "Cinnamon",
        "Clove", "Corn Gray leaf spot", "Corn leaf blight", "Dandelion", "Echinacea",
        "eucalyptus", "Fenugreek", "Garlic", "Ginger", "Ginkgo", "Ginseng",
        "grape leaf", "Holy_Basil", "Lavender", "Licorice", "Mango", "Moringa",
        "Neem", "Papaya", "Peach leaf", "peppermint", "pigeon", "Pigeon_Pea",
        "Potato leaf early blight", "Raspberry leaf", "Rosemary", "Saw_Palmetto",
        "Soyabean leaf", "St._John_s_Wort", "Strawberry leaf", "Sugarcane",
        "Tea_Tree", "Tomato leaf", "Tulsi", "turmeric", "Valerian"
    ],
    training_date="2025-01-01",
    accuracy=None,
    macro_f1=None,
    supported_crop="multi",
    status="active",
)


def get_model_registry() -> CropModelRegistry:
    return _registry
