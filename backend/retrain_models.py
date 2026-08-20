"""
Retrain AgriSight AI leaf detection models.

HOW TO USE:
1. Prepare your dataset in the folder defined by DATA_DIR.
   Each crop/disease should be a subfolder, e.g.:
     photos/
       pigeon_pea/
         healthy/
         alternaria_leaf_spot/
       tomato/
         healthy/
         early_blight/
       ...

2. Update the CROP_CLASSES and DISEASE_CLASSES dicts below if needed.

3. Run:
     python retrain_models.py

4. After training, copy backend/models/*.pt and *.txt to your server.
"""

import os
from pathlib import Path
from collections import defaultdict
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, transforms, models
from tqdm import tqdm

# ---------------------------------------------------------------------------
# CONFIG
# ---------------------------------------------------------------------------
DATA_DIR = Path("C:/Users/DELL/file/OneDrive/Desktop/PROJECT/AgriPlus AI/photos")
OUT_DIR = Path("C:/Users/DELL/file/OneDrive/Desktop/PROJECT/AgriPlus AI/backend/models")
OUT_DIR.mkdir(parents=True, exist_ok=True)

NUM_EPOCHS = 10
BATCH_SIZE = 16
LEARNING_RATE = 1e-4
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
INPUT_SIZE = 224

# Expected crop classes (must match model_registry.py)
CROP_CLASSES = [
    "pigeon_pea", "rice", "wheat", "maize",
    "tomato", "potato", "cotton", "soybean"
]

# Disease classes per crop
DISEASE_CLASSES = {
    "pigeon_pea": ["healthy", "alternaria_leaf_spot", "cercospora_leaf_spot", "sterility_mosaic_disease", "wilt", "yellow_mosaic_disease"],
    "tomato": ["healthy", "early_blight", "late_blight", "bacterial_spot", "leaf_mold"],
    "rice": ["healthy", "brown_spot", "rice_blast", "bacterial_leaf_blight"],
    "wheat": ["healthy", "leaf_spot", "blight", "wilt", "mosaic_virus"],
    "maize": ["healthy", "leaf_spot", "blight", "wilt", "mosaic_virus"],
    "potato": ["healthy", "leaf_spot", "blight", "wilt", "mosaic_virus"],
    "cotton": ["healthy", "leaf_spot", "blight", "wilt", "mosaic_virus"],
    "soybean": ["healthy", "leaf_spot", "blight", "wilt", "mosaic_virus"],
}

transform = transforms.Compose([
    transforms.Resize((INPUT_SIZE, INPUT_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])


def get_crop_subfolders(crop: str) -> list[Path]:
    """Find all subfolders in DATA_DIR that belong to a crop."""
    matches = []
    for folder in DATA_DIR.iterdir():
        if not folder.is_dir():
            continue
        name = folder.name.lower()
        if crop == "pigeon_pea" and ("pigeon" in name or "pigeon_pea" in name):
            matches.append(folder)
        elif crop == "tomato" and "tomato" in name:
            matches.append(folder)
        elif crop == "potato" and "potato" in name:
            matches.append(folder)
        elif crop == "soybean" and ("soybean" in name or "soya" in name):
            matches.append(folder)
        elif crop == "maize" and ("maize" in name or "corn" in name):
            matches.append(folder)
        elif crop == "rice" and "rice" in name:
            matches.append(folder)
        elif crop == "wheat" and "wheat" in name:
            matches.append(folder)
        elif crop == "cotton" and "cotton" in name:
            matches.append(folder)
    return matches


def build_crop_dataset():
    samples = []
    class_to_idx = {c: i for i, c in enumerate(CROP_CLASSES)}
    for crop in CROP_CLASSES:
        folders = get_crop_subfolders(crop)
        for folder in folders:
            for ext in ("*.jpg", "*.jpeg", "*.png"):
                for img in folder.glob(ext):
                    samples.append((str(img), class_to_idx[crop]))

    print(f"Crop classifier dataset: {len(samples)} images, {len(class_to_idx)} classes")
    if len(samples) == 0:
        raise RuntimeError("No training images found. Add folders to DATA_DIR.")

    class CustomDataset(torch.utils.data.Dataset):
        def __init__(self, samples):
            self.samples = samples
        def __len__(self):
            return len(self.samples)
        def __getitem__(self, idx):
            path, label = self.samples[idx]
            img = datasets.folder.default_loader(path)
            return transform(img), label

    return CustomDataset(samples), {v: k for k, v in class_to_idx.items()}


def build_disease_dataset(crop: str):
    classes = DISEASE_CLASSES[crop]
    class_to_idx = {c: i for i, c in enumerate(classes)}
    samples = []
    folders = get_crop_subfolders(crop)
    for folder in folders:
        folder_name = folder.name.lower()
        matched_class = None
        for cls in classes:
            if cls.replace("_", " ") in folder_name or cls in folder_name:
                matched_class = cls
                break
        if matched_class is None:
            matched_class = "healthy"
        for ext in ("*.jpg", "*.jpeg", "*.png"):
            for img in folder.glob(ext):
                samples.append((str(img), class_to_idx[matched_class]))

    print(f"  Disease dataset for {crop}: {len(samples)} images, {len(classes)} classes")
    if len(samples) < 2:
        return None, None

    class CustomDataset(torch.utils.data.Dataset):
        def __init__(self, samples):
            self.samples = samples
        def __len__(self):
            return len(self.samples)
        def __getitem__(self, idx):
            path, label = self.samples[idx]
            img = datasets.folder.default_loader(path)
            return transform(img), label

    return CustomDataset(samples), {v: k for k, v in class_to_idx.items()}


def train_model(model, loader, criterion, optimizer, epochs, name="model"):
    model.train()
    for epoch in range(epochs):
        running_loss = 0.0
        correct = 0
        total = 0
        pbar = tqdm(loader, desc=f"{name} Epoch {epoch+1}/{epochs}")
        for inputs, labels in pbar:
            inputs, labels = inputs.to(DEVICE), labels.to(DEVICE)
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item() * inputs.size(0)
            _, predicted = torch.max(outputs, 1)
            correct += (predicted == labels).sum().item()
            total += labels.size(0)
            pbar.set_postfix({"loss": f"{running_loss/total:.4f}", "acc": f"{correct/total:.4f}"})
        epoch_loss = running_loss / total
        epoch_acc = correct / total
        print(f"[{name}] Epoch {epoch+1}: loss={epoch_loss:.4f}, acc={epoch_acc:.4f}")


def train_crop_classifier():
    print("\n=== Training Crop Classifier ===")
    dataset, idx_to_class = build_crop_dataset()
    train_size = int(0.8 * len(dataset))
    val_size = len(dataset) - train_size
    train_ds, _ = random_split(dataset, [train_size, val_size])
    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True, num_workers=0)

    num_classes = len(idx_to_class)
    model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.DEFAULT)
    model.classifier[3] = nn.Linear(model.classifier[3].in_features, num_classes)
    model = model.to(DEVICE)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)
    train_model(model, train_loader, criterion, optimizer, NUM_EPOCHS, name="CropClassifier")

    crop_model_path = OUT_DIR / "crop_classifier.pt"
    class_names_path = OUT_DIR / "crop_class_names.txt"
    torch.save(model.state_dict(), crop_model_path)
    with open(class_names_path, "w", encoding="utf-8") as f:
        for i in range(num_classes):
            f.write(idx_to_class[i] + "\n")
    print(f"Saved crop classifier to {crop_model_path}")
    print(f"Saved class names to {class_names_path}")


def train_disease_models():
    print("\n=== Training Disease Models ===")
    for crop in CROP_CLASSES:
        dataset, idx_to_class = build_disease_dataset(crop)
        if dataset is None:
            continue
        train_size = max(1, int(0.8 * len(dataset)))
        train_ds, _ = random_split(dataset, [train_size, len(dataset) - train_size])
        train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True, num_workers=0)

        num_classes = len(idx_to_class)
        model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.DEFAULT)
        model.classifier[3] = nn.Linear(model.classifier[3].in_features, num_classes)
        model = model.to(DEVICE)

        criterion = nn.CrossEntropyLoss()
        optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)
        train_model(model, train_loader, criterion, optimizer, NUM_EPOCHS, name=crop)

        model_path = OUT_DIR / f"{crop}_disease.pt"
        class_names_path = OUT_DIR / f"{crop}_disease_classes.txt"
        torch.save(model.state_dict(), model_path)
        with open(class_names_path, "w", encoding="utf-8") as f:
            for i in range(num_classes):
                f.write(idx_to_class[i] + "\n")
        print(f"Saved {crop} disease model to {model_path}")


if __name__ == "__main__":
    print(f"Device: {DEVICE}")
    print(f"Data dir: {DATA_DIR}")
    print(f"Output dir: {OUT_DIR}")
    train_crop_classifier()
    train_disease_models()
    print("\nDone. Copy backend/models/*.pt and *.txt to your server.")
