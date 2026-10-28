from pathlib import Path
import math
import random

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "assets"
OUT.mkdir(parents=True, exist_ok=True)
random.seed(52)


def save_background():
    w, h = 1280, 720
    img = Image.new("RGB", (w, h), "#0b2430")
    d = ImageDraw.Draw(img, "RGBA")
    top, bottom = (12, 35, 51), (29, 77, 78)
    for y in range(h):
        f = y / h
        c = tuple(int(top[i] * (1 - f) + bottom[i] * f) for i in range(3))
        d.line((0, y, w, y), fill=c + (255,))

    glow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow, "RGBA")
    gd.ellipse((865, 42, 1085, 262), fill=(250, 184, 86, 105))
    img = Image.alpha_composite(img.convert("RGBA"), glow.filter(ImageFilter.GaussianBlur(38)))
    d = ImageDraw.Draw(img, "RGBA")
    d.ellipse((909, 86, 1041, 218), fill=(243, 186, 83, 235))

    # Layered island ridges.
    d.polygon([(0, 405), (130, 286), (235, 374), (376, 226), (522, 390), (662, 244), (820, 387), (977, 254), (1130, 385), (1280, 292), (1280, 520), (0, 520)], fill=(16, 53, 59, 245))
    d.polygon([(0, 466), (185, 346), (333, 443), (494, 318), (660, 448), (826, 339), (1000, 445), (1155, 327), (1280, 422), (1280, 550), (0, 550)], fill=(10, 40, 46, 255))

    # Ruined outpost silhouettes.
    for x, y, bw, bh in [(78, 322, 130, 210), (270, 386, 215, 142), (760, 345, 175, 183), (1075, 374, 142, 155)]:
        d.rectangle((x, y, x + bw, y + bh), fill=(12, 34, 38, 255), outline=(45, 74, 72, 220), width=3)
        for wy in range(y + 30, y + bh - 20, 46):
            for wx in range(x + 22, x + bw - 15, 44):
                if random.random() > .34:
                    d.rectangle((wx, wy, wx + 14, wy + 19), fill=(235, 161, 65, random.randint(35, 90)))
        d.polygon([(x, y), (x + bw * .35, y - 26), (x + bw * .61, y + 5), (x + bw, y - 18), (x + bw, y + 6), (x, y + 6)], fill=(9, 27, 31, 255))

    # Atmospheric clouds.
    clouds = Image.new("RGBA", img.size, (0, 0, 0, 0))
    cd = ImageDraw.Draw(clouds, "RGBA")
    for i in range(20):
        x = random.randint(-150, 1300)
        y = random.randint(40, 270)
        rw = random.randint(110, 280)
        cd.ellipse((x, y, x + rw, y + random.randint(35, 80)), fill=(119, 157, 158, random.randint(12, 28)))
    img = Image.alpha_composite(img, clouds.filter(ImageFilter.GaussianBlur(16)))
    d = ImageDraw.Draw(img, "RGBA")

    # Vegetation silhouettes and foreground mist.
    for i in range(130):
        x = random.randint(0, w)
        y = random.randint(490, 650)
        height = random.randint(25, 110)
        col = random.choice([(7, 31, 32, 220), (12, 43, 40, 190), (19, 58, 49, 170)])
        d.polygon([(x, y), (x + random.randint(-16, 16), y - height), (x + random.randint(3, 12), y)], fill=col)
    d.rectangle((0, 608, w, h), fill=(5, 18, 22, 210))
    for i in range(28):
        x = random.randint(0, w)
        d.ellipse((x, 625, x + random.randint(80, 220), 710), fill=(35, 85, 75, random.randint(12, 28)))
    img.convert("RGB").save(OUT / "arena-background.jpg", quality=94)


def soldier(path: str, uniform, accent):
    s = 96
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    d.ellipse((23, 80, 76, 93), fill=(0, 0, 0, 80))
    # Legs, boots, torso, pack.
    d.rounded_rectangle((33, 58, 45, 84), radius=4, fill=(20, 30, 32, 255))
    d.rounded_rectangle((54, 58, 66, 84), radius=4, fill=(20, 30, 32, 255))
    d.rectangle((27, 79, 47, 87), fill=(8, 13, 15, 255))
    d.rectangle((52, 79, 72, 87), fill=(8, 13, 15, 255))
    d.rounded_rectangle((25, 32, 72, 68), radius=9, fill=uniform + (255,), outline=(123, 169, 158, 180), width=3)
    d.rounded_rectangle((17, 37, 31, 63), radius=5, fill=(27, 48, 52, 255))
    d.rectangle((30, 47, 68, 57), fill=accent + (235,))
    d.polygon([(30, 34), (47, 42), (65, 34), (58, 28), (38, 28)], fill=(221, 174, 88, 240))
    # Head and helmet.
    d.ellipse((35, 10, 63, 39), fill=(98, 60, 41, 255))
    d.pieslice((31, 5, 67, 39), 180, 360, fill=(16, 25, 28, 255))
    d.rectangle((32, 20, 68, 27), fill=(16, 25, 28, 255))
    d.ellipse((57, 24, 62, 29), fill=(245, 195, 93, 255))
    # Jetpack canisters.
    d.rounded_rectangle((14, 42, 24, 68), radius=4, fill=(54, 78, 78, 255), outline=(94, 135, 129, 180))
    d.rounded_rectangle((72, 42, 82, 68), radius=4, fill=(54, 78, 78, 255), outline=(94, 135, 129, 180))
    img.save(OUT / path)


def weapon(path: str, body, detail):
    img = Image.new("RGBA", (80, 28), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    d.rounded_rectangle((5, 8, 66, 20), radius=4, fill=body + (255,), outline=(21, 28, 30, 255), width=2)
    d.rectangle((62, 11, 78, 16), fill=detail + (255,))
    d.polygon([(30, 18), (45, 18), (41, 27), (33, 27)], fill=(28, 37, 39, 255))
    d.rectangle((15, 4, 36, 9), fill=detail + (220,))
    img.save(OUT / path)


def platform():
    img = Image.new("RGBA", (256, 52), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    d.rounded_rectangle((0, 0, 256, 37), radius=6, fill=(38, 58, 57, 255), outline=(104, 128, 116, 255), width=3)
    d.rectangle((5, 8, 251, 16), fill=(61, 84, 76, 255))
    for x in range(16, 245, 38):
        d.polygon([(x, 20), (x + 17, 20), (x + 5, 35)], fill=(23, 42, 42, 180))
    d.polygon([(0, 35), (256, 35), (236, 52), (18, 52)], fill=(15, 34, 36, 255))
    img.save(OUT / "platform.png")


def pickup(path: str, color, mark: str):
    img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    d.rounded_rectangle((7, 10, 57, 58), radius=8, fill=(11, 27, 31, 245), outline=color + (255,), width=3)
    d.rectangle((17, 4, 47, 14), fill=(30, 48, 49, 255), outline=color + (210,), width=2)
    if mark == "plus":
        d.rectangle((27, 21, 37, 49), fill=color + (255,))
        d.rectangle((18, 30, 46, 40), fill=color + (255,))
    elif mark == "fuel":
        d.polygon([(32, 18), (45, 35), (39, 49), (25, 49), (19, 35)], fill=color + (245,))
        d.line((32, 23, 25, 38, 39, 34, 32, 47), fill=(228, 246, 235, 220), width=3)
    else:
        d.rectangle((18, 29, 48, 38), fill=color + (245,))
        d.rectangle((37, 25, 51, 32), fill=color + (245,))
        d.rectangle((23, 38, 31, 48), fill=color + (245,))
    img.save(OUT / path)


save_background()
soldier("ranger.png", (31, 93, 104), (225, 125, 50))
soldier("raider-coral.png", (126, 49, 49), (238, 111, 69))
soldier("raider-gold.png", (111, 82, 34), (236, 178, 69))
soldier("raider-green.png", (46, 92, 62), (116, 198, 116))
soldier("raider-violet.png", (82, 55, 100), (190, 118, 207))
weapon("rifle.png", (55, 72, 72), (239, 170, 65))
weapon("shotgun.png", (76, 55, 43), (231, 107, 65))
weapon("plasma.png", (35, 88, 94), (75, 228, 202))
platform()
pickup("medkit.png", (235, 91, 72), "plus")
pickup("fuel.png", (75, 220, 197), "fuel")
pickup("weapon-crate.png", (236, 180, 69), "gun")
print(f"Generated assets in {OUT}")
