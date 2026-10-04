"""Shrink a VRoid VRM export for the web.

Usage: python3 scripts/optimize-vrm.py <input.vrm> <output.vrm>

Downsizes textures to WebP and drops the facial morph targets the site never
plays, then repacks the binary. Needs Pillow.
"""
import io
import json
import struct
import sys

from PIL import Image

MAX_TEXTURE = 1024
# Expressions the site uses; every other preset and its morph data is removed.
KEEP_EXPRESSIONS = {"neutral", "happy", "relaxed", "surprised", "blink"}

source, target = sys.argv[1], sys.argv[2]
with open(source, "rb") as f:
    f.read(12)
    json_length, _ = struct.unpack("<I4s", f.read(8))
    gltf = json.loads(f.read(json_length))
    bin_length, _ = struct.unpack("<I4s", f.read(8))
    binary = f.read(bin_length)

views = gltf["bufferViews"]
data = [binary[v.get("byteOffset", 0) : v.get("byteOffset", 0) + v["byteLength"]] for v in views]

# Textures: cap the size and re-encode as WebP.
vrm = gltf["extensions"]["VRMC_vrm"]
thumbnail = vrm["meta"].get("thumbnailImage")
for index, image in enumerate(gltf["images"]):
    picture = Image.open(io.BytesIO(data[image["bufferView"]]))
    limit = 128 if index == thumbnail else MAX_TEXTURE
    if max(picture.size) > limit:
        picture.thumbnail((limit, limit), Image.LANCZOS)
    if picture.mode not in ("RGB", "RGBA"):
        picture = picture.convert("RGBA")
    out = io.BytesIO()
    picture.save(out, "WEBP", quality=88, method=6)
    data[image["bufferView"]] = out.getvalue()
    image["mimeType"] = "image/webp"

# Morph targets: keep only the ones bound to the expressions we use.
presets = vrm["expressions"]["preset"]
for name in list(presets):
    if name not in KEEP_EXPRESSIONS:
        del presets[name]
kept = {}  # mesh index -> sorted target indices
for expression in presets.values():
    for bind in expression.get("morphTargetBinds", []):
        mesh = gltf["nodes"][bind["node"]]["mesh"]
        kept.setdefault(mesh, set()).add(bind["index"])
for mesh_index, mesh in enumerate(gltf["meshes"]):
    order = sorted(kept.get(mesh_index, ()))
    for primitive in mesh["primitives"]:
        if "targets" in primitive:
            primitive["targets"] = [primitive["targets"][i] for i in order]
            if not order:
                del primitive["targets"]
    if "weights" in mesh:
        mesh["weights"] = [mesh["weights"][i] for i in order]
    names = mesh.get("extras", {}).get("targetNames")
    if names:
        mesh["extras"]["targetNames"] = [names[i] for i in order]
for expression in presets.values():
    for bind in expression.get("morphTargetBinds", []):
        mesh = gltf["nodes"][bind["node"]]["mesh"]
        bind["index"] = sorted(kept[mesh]).index(bind["index"])

# Drop accessors and buffer views nothing refers to any more, then repack.
used_accessors = set()
for mesh in gltf["meshes"]:
    for primitive in mesh["primitives"]:
        used_accessors.update(primitive["attributes"].values())
        if "indices" in primitive:
            used_accessors.add(primitive["indices"])
        for morph in primitive.get("targets", []):
            used_accessors.update(morph.values())
for skin in gltf.get("skins", []):
    if "inverseBindMatrices" in skin:
        used_accessors.add(skin["inverseBindMatrices"])
assert not gltf.get("animations"), "animations are not handled"
accessor_map = {old: new for new, old in enumerate(sorted(used_accessors))}
gltf["accessors"] = [gltf["accessors"][old] for old in sorted(used_accessors)]
for mesh in gltf["meshes"]:
    for primitive in mesh["primitives"]:
        primitive["attributes"] = {k: accessor_map[v] for k, v in primitive["attributes"].items()}
        if "indices" in primitive:
            primitive["indices"] = accessor_map[primitive["indices"]]
        if "targets" in primitive:
            primitive["targets"] = [{k: accessor_map[v] for k, v in morph.items()} for morph in primitive["targets"]]
for skin in gltf.get("skins", []):
    if "inverseBindMatrices" in skin:
        skin["inverseBindMatrices"] = accessor_map[skin["inverseBindMatrices"]]

used_views = sorted(
    {a["bufferView"] for a in gltf["accessors"] if "bufferView" in a} | {i["bufferView"] for i in gltf["images"]}
)
view_map = {old: new for new, old in enumerate(used_views)}
packed = bytearray()
new_views = []
for old in used_views:
    while len(packed) % 4:
        packed.append(0)
    view = {k: v for k, v in views[old].items() if k != "byteOffset"}
    view["byteOffset"] = len(packed)
    view["byteLength"] = len(data[old])
    packed += data[old]
    new_views.append(view)
while len(packed) % 4:
    packed.append(0)
gltf["bufferViews"] = new_views
for accessor in gltf["accessors"]:
    if "bufferView" in accessor:
        accessor["bufferView"] = view_map[accessor["bufferView"]]
for image in gltf["images"]:
    image["bufferView"] = view_map[image["bufferView"]]
gltf["buffers"] = [{"byteLength": len(packed)}]

payload = json.dumps(gltf, separators=(",", ":"), ensure_ascii=False).encode()
payload += b" " * (-len(payload) % 4)
with open(target, "wb") as f:
    f.write(struct.pack("<4sII", b"glTF", 2, 12 + 8 + len(payload) + 8 + len(packed)))
    f.write(struct.pack("<I4s", len(payload), b"JSON") + payload)
    f.write(struct.pack("<I4s", len(packed), b"BIN\x00") + bytes(packed))
print(f"{target}: {(12 + 16 + len(payload) + len(packed)) / 1e6:.2f} MB")
