from pathlib import Path
import math
import random

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "assets"
OUT.mkdir(parents=True, exist_ok=True)
MAP_OUT = OUT / "maps"
MAP_OUT.mkdir(parents=True, exist_ok=True)
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


def weapon(path: str, body, detail, variant=0):
    img = Image.new("RGBA", (96, 36), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    body_end = 59 + (variant % 5) * 5
    body_height = 12 + (variant % 3) * 2
    top = 10 + (variant % 2) * 3
    d.rounded_rectangle((8, top, body_end, top + body_height), radius=4, fill=body + (255,), outline=(21, 28, 30, 255), width=2)
    d.rectangle((body_end - 2, top + 4, min(94, body_end + 15 + variant % 4 * 3), top + 8), fill=detail + (255,))
    if variant % 3 == 0:
        d.polygon([(26, top + body_height), (42, top + body_height), (39, 34), (30, 34)], fill=(28, 37, 39, 255))
    elif variant % 3 == 1:
        d.rounded_rectangle((31, top + body_height - 1, 43, 34), radius=3, fill=(28, 37, 39, 255))
    else:
        d.polygon([(36, top + body_height), (51, top + body_height), (55, 34), (41, 34)], fill=(28, 37, 39, 255))
    d.rectangle((16, max(2, top - 5), 32 + variant % 5 * 3, top), fill=detail + (220,))
    if variant % 2:
        d.polygon([(8, top + 2), (1, top + 7), (8, top + body_height - 1)], fill=(37, 49, 50, 255))
    # Production pass: readable rails, receiver highlights, trigger, bolt, and muzzle profile.
    d.line((12, top + 2, body_end - 4, top + 2), fill=tuple(min(255, c + 38) for c in body) + (210,), width=1)
    d.line((body_end + 1, top + 5, min(95, body_end + 18), top + 5), fill=(225, 232, 215, 180), width=1)
    d.ellipse((body_end - 10, top + 4, body_end - 6, top + 8), fill=(220, 226, 205, 235))
    d.arc((37, top + body_height - 2, 50, top + body_height + 11), 180, 345, fill=(151, 167, 157, 230), width=2)
    d.rectangle((min(91, body_end + 13), top + 3, min(95, body_end + 18), top + 9), fill=(28, 35, 36, 255))
    img.save(OUT / path)


def platform():
    img = Image.new("RGBA", (256, 52), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    d.rounded_rectangle((0, 0, 256, 37), radius=6, fill=(38, 58, 57, 255), outline=(104, 128, 116, 255), width=3)
    d.rectangle((5, 8, 251, 16), fill=(61, 84, 76, 255))
    for x in range(16, 245, 38):
        d.polygon([(x, 20), (x + 17, 20), (x + 5, 35)], fill=(23, 42, 42, 180))
    d.polygon([(0, 35), (256, 35), (236, 52), (18, 52)], fill=(15, 34, 36, 255))
    for x in range(10, 250, 40):
        d.ellipse((x, 5, x + 4, 9), fill=(172, 190, 173, 220))
    d.line((8, 18, 248, 18), fill=(115, 151, 133, 155), width=2)
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
    d.line((14, 17, 50, 17), fill=(203, 224, 213, 120), width=2)
    d.ellipse((12, 48, 17, 53), fill=color + (190,))
    d.ellipse((47, 48, 52, 53), fill=color + (190,))
    img.save(OUT / path)


def map_preview(path: str, sky, ground, accent, seed: int):
    random.seed(seed)
    img = Image.new("RGB", (480, 270), sky)
    d = ImageDraw.Draw(img, "RGBA")
    for y in range(270):
        shade = int(y / 270 * 28)
        d.line((0, y, 480, y), fill=(max(0, sky[0] - shade), max(0, sky[1] - shade), max(0, sky[2] - shade), 255))
    d.polygon([(0, 190), (80, 120), (155, 180), (240, 90), (330, 170), (410, 110), (480, 175), (480, 270), (0, 270)], fill=ground + (210,))
    for index in range(7):
        x = 18 + index * 68 + random.randint(-12, 12)
        y = random.randint(95, 220)
        width = random.randint(70, 130)
        d.rounded_rectangle((x, y, min(470, x + width), y + 12), radius=3, fill=accent + (235,))
        d.rectangle((x + 5, y + 12, min(470, x + width - 7), y + 17), fill=(8, 20, 24, 220))
    img.save(MAP_OUT / path)


def production_map_art(map_id: str, sky, horizon, ground, accent, seed: int, motif: str):
    random.seed(seed)
    w, h = 1600, 900
    img = Image.new("RGB", (w, h), sky)
    d = ImageDraw.Draw(img, "RGBA")
    for y in range(h):
        t = y / h
        color = tuple(int(sky[i] * (1 - t) + horizon[i] * t) for i in range(3))
        d.line((0, y, w, y), fill=color + (255,))

    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow, "RGBA")
    gd.ellipse((1120, 65, 1450, 395), fill=accent + (100,))
    img = Image.alpha_composite(img.convert("RGBA"), glow.filter(ImageFilter.GaussianBlur(70)))
    d = ImageDraw.Draw(img, "RGBA")
    d.ellipse((1215, 130, 1370, 285), fill=accent + (190,))

    # Three depth-separated silhouettes make camera movement readable.
    for layer, alpha in [(0, 105), (1, 175), (2, 245)]:
        baseline = 485 + layer * 105
        points = [(0, baseline)]
        for x in range(0, w + 180, 180):
            points.append((x, baseline - random.randint(35 + layer * 15, 165 + layer * 25)))
        points.extend([(w, h), (0, h)])
        shade = tuple(max(3, channel - (32 - layer * 8)) for channel in ground)
        d.polygon(points, fill=shade + (alpha,))

    if motif == "dock":
        for x in (140, 620, 1120):
            d.rectangle((x, 300, x + 28, 690), fill=(12, 24, 34, 235))
            d.line((x + 14, 300, x + 250, 160), fill=(40, 58, 66, 230), width=18)
            d.line((x + 180, 205, x + 180, 510), fill=(31, 45, 54, 220), width=7)
        d.rectangle((0, 710, w, h), fill=(12, 45, 61, 245))
        for y in range(725, 890, 38):
            d.line((0, y, w, y - 18), fill=accent + (26,), width=4)
    elif motif == "foundry":
        for x in range(80, w, 270):
            height = random.randint(180, 360)
            d.rectangle((x, 690 - height, x + 150, 710), fill=(31, 24, 26, 250))
            d.rectangle((x + 35, 690 - height - 95, x + 65, 710 - height), fill=(26, 20, 22, 245))
            for wy in range(690 - height + 35, 670, 48):
                d.rectangle((x + 25, wy, x + 125, wy + 8), fill=accent + (80,))
        d.rectangle((0, 745, w, h), fill=(35, 19, 20, 255))
        for _ in range(90):
            x, y = random.randint(0, w), random.randint(100, 780)
            d.ellipse((x, y, x + 3, y + random.randint(8, 24)), fill=accent + (random.randint(60, 180),))
    elif motif == "ruins":
        for x in range(60, w, 240):
            d.rectangle((x, 380, x + 46, 760), fill=(22, 48, 43, 245))
            d.polygon([(x - 35, 410), (x + 23, 340), (x + 81, 410)], fill=(28, 60, 49, 245))
            for _ in range(5):
                vx = x + random.randint(-40, 70)
                d.line((vx, 300, vx + random.randint(-45, 45), 790), fill=(43, 103, 73, 145), width=8)
        for _ in range(110):
            x, y = random.randint(0, w), random.randint(300, 830)
            d.ellipse((x, y, x + random.randint(4, 14), y + random.randint(2, 7)), fill=accent + (random.randint(35, 100),))
    elif motif == "frost":
        for x in range(100, w, 320):
            d.rectangle((x, 410, x + 34, 760), fill=(39, 69, 84, 245))
            d.arc((x - 70, 300, x + 110, 480), 185, 345, fill=(151, 206, 225, 220), width=15)
            d.line((x + 16, 420, x + 105, 330), fill=(102, 151, 169, 220), width=9)
        d.rectangle((0, 735, w, h), fill=(172, 214, 223, 235))
        for _ in range(160):
            x, y = random.randint(0, w), random.randint(40, 840)
            radius = random.randint(2, 7)
            d.ellipse((x, y, x + radius, y + radius), fill=(224, 247, 249, random.randint(80, 190)))
    elif motif == "neon":
        d.rectangle((0, 250, w, 790), fill=(17, 18, 35, 230))
        for x in range(90, w, 230):
            d.rectangle((x, 290, x + 26, 760), fill=(37, 37, 58, 245))
            d.line((x + 13, 315, x + 13, 710), fill=accent + (190,), width=5)
        for y in (680, 735):
            d.line((0, y, w, y), fill=(102, 132, 154, 235), width=8)
            d.line((0, y + 13, w, y + 13), fill=accent + (110,), width=3)
    elif motif == "sky":
        clouds = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        cd = ImageDraw.Draw(clouds, "RGBA")
        for _ in range(35):
            x, y = random.randint(-150, w), random.randint(230, 720)
            rw = random.randint(130, 360)
            cd.ellipse((x, y, x + rw, y + random.randint(45, 110)), fill=(218, 238, 241, random.randint(35, 95)))
        img = Image.alpha_composite(img, clouds.filter(ImageFilter.GaussianBlur(18)))
        d = ImageDraw.Draw(img, "RGBA")
        for x in (130, 590, 1080, 1420):
            d.polygon([(x, 650), (x + 155, 560), (x + 330, 650), (x + 280, 720), (x + 45, 720)], fill=(42, 68, 79, 245))
            d.line((x + 40, 632, x + 285, 632), fill=accent + (190,), width=7)
    elif motif == "blacksite":
        d.rectangle((0, 260, w, 790), fill=(17, 22, 27, 245))
        for x in range(50, w, 260):
            d.rectangle((x, 325, x + 190, 745), fill=(26, 33, 39, 255), outline=(66, 75, 79, 220), width=6)
            d.rectangle((x + 35, 390, x + 155, 405), fill=accent + (180,))
            d.rectangle((x + 65, 470, x + 125, 650), fill=(9, 13, 16, 245))
        for x in range(0, w, 160):
            d.line((x, 280, x + 90, 280), fill=(240, 70, 66, 120), width=5)
    else:
        for x in range(90, w, 260):
            bw, bh = random.randint(150, 240), random.randint(150, 330)
            d.rectangle((x, 720 - bh, x + bw, 720), fill=(11, 34, 38, 248), outline=(46, 82, 75, 190), width=5)
            d.polygon([(x, 720 - bh), (x + bw * .35, 680 - bh), (x + bw, 700 - bh), (x + bw, 730 - bh), (x, 730 - bh)], fill=(8, 26, 30, 255))
            for wy in range(755 - bh, 680, 52):
                for wx in range(x + 28, x + bw - 20, 55):
                    d.rectangle((wx, wy, wx + 18, wy + 24), fill=accent + (random.randint(45, 120),))

    # Foreground silhouettes frame actors without obscuring combat lanes.
    d.rectangle((0, 820, w, h), fill=(5, 15, 20, 245))
    for _ in range(145):
        x = random.randint(0, w)
        height = random.randint(18, 105)
        d.polygon([(x, 840), (x + random.randint(-12, 12), 840 - height), (x + random.randint(4, 18), 840)], fill=ground + (190,))

    art_path = MAP_OUT / f"{map_id}-background.jpg"
    img.convert("RGB").save(art_path, quality=91, optimize=True)
    preview = img.convert("RGB").resize((480, 270), Image.Resampling.LANCZOS)
    pd = ImageDraw.Draw(preview, "RGBA")
    for index in range(6):
        x = 18 + index * 76 + random.randint(-10, 10)
        y = random.randint(105, 225)
        pd.rounded_rectangle((x, y, min(475, x + random.randint(70, 125)), y + 10), radius=3, fill=accent + (220,))
    preview.save(MAP_OUT / f"{map_id}-preview.png", optimize=True)


def soldier_sheet(source_name: str, sheet_name: str, accent):
    source = Image.open(OUT / source_name).convert("RGBA")
    sheet = Image.new("RGBA", (96 * 6, 96), (0, 0, 0, 0))
    for frame in range(6):
        pose = Image.new("RGBA", (96, 96), (0, 0, 0, 0))
        bob = [0, -2, -3, -1, 1, 0][frame]
        pose.alpha_composite(source, (0, bob))
        fd = ImageDraw.Draw(pose, "RGBA")
        if frame in (2, 3):
            fd.polygon([(18, 70), (23, 92), (28, 70)], fill=accent + (180,))
            fd.polygon([(68, 70), (73, 92), (78, 70)], fill=(91, 226, 209, 180))
        if frame % 2:
            fd.line((34, 79, 29, 88), fill=(8, 13, 15, 255), width=5)
            fd.line((61, 79, 68, 87), fill=(8, 13, 15, 255), width=5)
        sheet.alpha_composite(pose, (frame * 96, 0))
    sheet.save(OUT / sheet_name, optimize=True)


save_background()
soldier("ranger.png", (31, 93, 104), (225, 125, 50))
soldier("raider-coral.png", (126, 49, 49), (238, 111, 69))
soldier("raider-gold.png", (111, 82, 34), (236, 178, 69))
soldier("raider-green.png", (46, 92, 62), (116, 198, 116))
soldier("raider-violet.png", (82, 55, 100), (190, 118, 207))
soldier_sheet("ranger.png", "ranger-sheet.png", (79, 224, 199))
soldier_sheet("raider-coral.png", "raider-coral-sheet.png", (238, 111, 69))
soldier_sheet("raider-gold.png", "raider-gold-sheet.png", (236, 178, 69))
soldier_sheet("raider-green.png", "raider-green-sheet.png", (116, 198, 116))
soldier_sheet("raider-violet.png", "raider-violet-sheet.png", (190, 118, 207))
weapon("rifle.png", (55, 72, 72), (239, 170, 65), 2)
weapon("shotgun.png", (76, 55, 43), (231, 107, 65), 7)
weapon("plasma.png", (35, 88, 94), (75, 228, 202), 9)
weapon("m9.png", (63, 70, 72), (240, 196, 106), 0)
weapon("viper.png", (70, 62, 66), (240, 155, 98), 1)
weapon("ak47.png", (78, 62, 45), (243, 168, 79), 2)
weapon("ak117.png", (52, 72, 69), (239, 209, 93), 3)
weapon("falcon.png", (67, 78, 58), (214, 227, 122), 4)
weapon("vector9.png", (66, 58, 63), (239, 118, 92), 5)
weapon("b4rpd.png", (69, 68, 53), (236, 193, 75), 6)
weapon("ironclad.png", (76, 55, 43), (240, 108, 80), 7)
weapon("longbow.png", (43, 65, 67), (155, 231, 223), 8)
weapon("arc.png", (35, 88, 94), (79, 224, 199), 9)
weapon("hydra.png", (83, 57, 48), (255, 118, 87), 10)
platform()
pickup("medkit.png", (235, 91, 72), "plus")
pickup("fuel.png", (75, 220, 197), "fuel")
pickup("weapon-crate.png", (236, 180, 69), "gun")
map_preview("outpost-kilo-preview.png", (13, 47, 59), (20, 77, 69), (89, 132, 118), 101)
map_preview("drydock-12-preview.png", (21, 36, 62), (53, 68, 81), (194, 139, 58), 102)
map_preview("ember-foundry-preview.png", (49, 27, 28), (67, 46, 43), (226, 99, 48), 103)
map_preview("canopy-ruins-preview.png", (18, 55, 47), (37, 80, 58), (77, 172, 132), 104)
production_map_art("outpost-kilo", (18, 52, 62), (50, 92, 84), (22, 67, 57), (235, 173, 72), 301, "outpost")
production_map_art("drydock-12", (19, 31, 53), (48, 75, 91), (24, 55, 69), (211, 165, 79), 302, "dock")
production_map_art("ember-foundry", (51, 24, 29), (108, 49, 37), (69, 31, 29), (245, 105, 55), 303, "foundry")
production_map_art("canopy-ruins", (16, 48, 45), (45, 94, 67), (25, 72, 52), (104, 215, 160), 304, "ruins")
production_map_art("frost-relay", (64, 95, 119), (141, 180, 194), (88, 130, 145), (198, 238, 248), 305, "frost")
production_map_art("neon-underpass", (25, 19, 50), (47, 28, 72), (30, 29, 56), (239, 74, 203), 306, "neon")
production_map_art("sky-fortress", (80, 137, 171), (173, 207, 218), (65, 96, 109), (244, 210, 118), 307, "sky")
production_map_art("blacksite-zero", (22, 27, 33), (47, 52, 57), (25, 32, 38), (232, 74, 70), 308, "blacksite")
print(f"Generated assets in {OUT}")
