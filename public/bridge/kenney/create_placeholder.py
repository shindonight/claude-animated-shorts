import struct
import os

# Create minimal valid GLB files for each required asset
# GLB format: 4-byte magic "gltf", 4-byte version (2), 4-byte length
# Then chunks: 4-byte length, 4-byte type (JSON=0x4E4F534A, BIN=0x004E4942)

def create_minimal_glb(name):
    # Minimal glTF JSON
    json_data = {
        "asset": {"version": "2.0", "generator": "placeholder"},
        "scene": 0,
        "scenes": [{"nodes": [0]}],
        "nodes": [{"mesh": 0}],
        "meshes": [{"primitives": [{"attributes": {"POSITION": 0}}]}],
        "accessors": [{"bufferView": 0, "componentType": 5126, "count": 3, "type": "VEC3", "max": [1,1,1], "min": [-1,-1,-1]}],
        "bufferViews": [{"buffer": 0, "byteLength": 36}],
        "buffers": [{"byteLength": 36}]
    }
    import json
    json_str = json.dumps(json_data, separators=(',', ':')).encode()
    json_padded = json_str + b' ' * ((4 - len(json_str) % 4) % 4)
    
    # Minimal binary data (3 vertices * 3 floats * 4 bytes = 36 bytes)
    bin_data = struct.pack('<9f', -1, -1, 0, 1, -1, 0, 0, 1, 0)
    bin_padded = bin_data + b'\x00' * ((4 - len(bin_data) % 4) % 4)
    
    # GLB header
    total_len = 12 + 8 + len(json_padded) + 8 + len(bin_padded)
    glb = struct.pack('<4sII', b'gltf', 2, total_len)
    glb += struct.pack('<II', len(json_padded), 0x4E4F534A)  # JSON chunk
    glb += json_padded
    glb += struct.pack('<II', len(bin_padded), 0x004E4942)  # BIN chunk
    glb += bin_padded
    
    with open(f"{name}.glb", "wb") as f:
        f.write(glb)
    print(f"Created {name}.glb ({len(glb)} bytes)")

assets = [
    "tree_oak", "tree_default", "tree_detailed", "tree_fat", "tree_cone", 
    "tree-high-round", "tree", "plant_bushLarge", "plant_bushDetailed",
    "plant_bush", "hedge", "flower_redA", "flower_yellowA", "flower_purpleA",
    "grass_large", "grass", "lily_large", "lantern", "cart", "stall-red",
    "stall-green", "stall-bench", "banner-red", "banner-green", "windmill", "canoe",
    "pillow", "mug", "sign_post", "table_round"
]

for asset in assets:
    create_minimal_glb(asset)

print("Done!")
