import os
from pathlib import Path
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
from tqdm import tqdm

DATA_DIR = Path("C:/Users/DELL/file/OneDrive/Desktop/PROJECT/AgriPlus AI/photos")
MODEL_PATH = Path("C:/Users/DELL/file/OneDrive/Desktop/PROJECT/AgriPlus AI/backend/models/plant_model.pt")
CLASS_NAMES_PATH = Path("C:/Users/DELL/file/OneDrive/Desktop/PROJECT/AgriPlus AI/backend/models/class_names.txt")
CHECKPOINT_PATH = Path("C:/Users/DELL/file/OneDrive/Desktop/PROJECT/AgriPlus AI/backend/models/checkpoint.pt")
NUM_EPOCHS = 10
BATCH_SIZE = 16
LEARNING_RATE = 1e-4

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

dataset = datasets.ImageFolder(root=str(DATA_DIR), transform=transform)
class_names = dataset.classes
print(f"Found {len(dataset)} images across {len(class_names)} classes.")

with open(CLASS_NAMES_PATH, "w", encoding="utf-8") as f:
    for name in class_names:
        f.write(name + "\n")

loader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=0)

start_epoch = 0
model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.DEFAULT)
model.classifier[3] = nn.Linear(model.classifier[3].in_features, len(class_names))
model = model.to(device)

criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)

if CHECKPOINT_PATH.exists():
    print(f"Resuming from checkpoint: {CHECKPOINT_PATH}")
    ckpt = torch.load(str(CHECKPOINT_PATH), map_location=device, weights_only=False)
    model.load_state_dict(ckpt["model_state_dict"])
    optimizer.load_state_dict(ckpt["optimizer_state_dict"])
    start_epoch = ckpt["epoch"]
    print(f"Resumed from epoch {start_epoch + 1}")

for epoch in range(start_epoch, NUM_EPOCHS):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0
    for inputs, labels in tqdm(loader, desc=f"Epoch {epoch+1}/{NUM_EPOCHS}"):
        inputs, labels = inputs.to(device), labels.to(device)
        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        running_loss += loss.item() * inputs.size(0)
        _, predicted = torch.max(outputs, 1)
        correct += (predicted == labels).sum().item()
        total += labels.size(0)
    epoch_loss = running_loss / total
    epoch_acc = correct / total
    print(f"Epoch {epoch+1}: loss={epoch_loss:.4f}, acc={epoch_acc:.4f}")

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    torch.save({
        "epoch": epoch,
        "model_state_dict": model.state_dict(),
        "optimizer_state_dict": optimizer.state_dict(),
    }, CHECKPOINT_PATH)

torch.save(model.state_dict(), MODEL_PATH)
print(f"Model saved to {MODEL_PATH}")
print(f"Class names saved to {CLASS_NAMES_PATH}")
