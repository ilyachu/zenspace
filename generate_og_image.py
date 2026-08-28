import math
import random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_og_image():
    width = 1200
    height = 630
    
    # 1. Base Gradient Background (#030712 to #0c1833)
    img = Image.new("RGB", (width, height), (3, 7, 18))
    draw = ImageDraw.Draw(img)
    
    for y in range(height):
        # Radial / vertical atmospheric curve
        ratio = y / height
        r = int(3 + (14 - 3) * ratio * ratio)
        g = int(7 + (26 - 7) * ratio * ratio)
        b = int(18 + (58 - 18) * ratio * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
        
    # 2. Add Ambient Glowing Auras
    glow_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layer)
    
    # Central Zen Cyan/Sky Aura
    cx, cy = width // 2, 230
    for rad in range(220, 20, -15):
        alpha = int(30 * (1 - rad / 220))
        glow_draw.ellipse([cx - rad, cy - rad, cx + rad, cy + rad], fill=(56, 189, 248, alpha))
        
    # Golden Inner Core Glow
    for rad in range(120, 10, -10):
        alpha = int(45 * (1 - rad / 120))
        glow_draw.ellipse([cx - rad, cy - rad, cx + rad, cy + rad], fill=(246, 196, 106, alpha))
        
    # Twinkling Background Stars
    random.seed(42)
    for _ in range(120):
        sx = random.randint(20, width - 20)
        sy = random.randint(20, height - 20)
        srad = random.choice([1, 1, 1, 2, 2, 3])
        salpha = random.randint(90, 240)
        glow_draw.ellipse([sx - srad, sy - srad, sx + srad, sy + srad], fill=(255, 255, 255, salpha))
        
    # Draw Constellation Lines & Golden Nodes
    nodes = [
        (cx - 140, cy - 60),
        (cx + 140, cy - 70),
        (cx + 110, cy + 90),
        (cx - 120, cy + 80),
        (cx, cy - 110),
        (cx, cy + 110)
    ]
    for i in range(len(nodes)):
        x1, y1 = nodes[i]
        glow_draw.line([(x1, y1), (cx, cy)], fill=(246, 196, 106, 120), width=2)
        glow_draw.ellipse([x1 - 4, y1 - 4, x1 + 4, y1 + 4], fill=(255, 255, 255, 230))
        glow_draw.ellipse([x1 - 8, y1 - 8, x1 + 8, y1 + 8], outline=(246, 196, 106, 100), width=1)
        
    # Central Glowing Ring (Mindfulness Circle)
    glow_draw.ellipse([cx - 50, cy - 50, cx + 50, cy + 50], outline=(56, 189, 248, 220), width=3)
    glow_draw.ellipse([cx - 24, cy - 24, cx + 24, cy + 24], fill=(246, 196, 106, 240))
    glow_draw.ellipse([cx - 12, cy - 12, cx + 12, cy + 12], fill=(255, 255, 255, 255))
    
    # Merge Glow
    img = Image.alpha_composite(img.convert("RGBA"), glow_layer).convert("RGB")
    draw = ImageDraw.Draw(img)
    
    # 3. Typography
    try:
        font_title = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 68)
        font_sub = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 30)
        font_badge = ImageFont.truetype("/System/Library/Fonts/Supplemental/Courier New Bold.ttf", 22)
    except:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_badge = ImageFont.load_default()
        
    # Title: ZENSPACE
    title_text = "Z E N S P A C E"
    t_bbox = draw.textbbox((0, 0), title_text, font=font_title)
    t_w = t_bbox[2] - t_bbox[0]
    draw.text(((width - t_w) // 2, 380), title_text, fill=(255, 255, 255), font=font_title)
    
    # Subtitle: Осознанность • Дыхание • Студийный Звук
    sub_text = "Осознанность • Дыхание • Студийные практики"
    s_bbox = draw.textbbox((0, 0), sub_text, font=font_sub)
    s_w = s_bbox[2] - s_bbox[0]
    draw.text(((width - s_w) // 2, 470), sub_text, fill=(148, 163, 184), font=font_sub)
    
    # Bottom Badge: by Il Chu (@chu_il) • Free & Open
    badge_text = "zen.chuchuchu.ru  //  Mind & Breath by Il Chu (@chu_il)"
    b_bbox = draw.textbbox((0, 0), badge_text, font=font_badge)
    b_w = b_bbox[2] - b_bbox[0]
    
    # Pill background for badge
    bx = (width - b_w) // 2
    by = 540
    draw.rounded_rectangle([bx - 24, by - 8, bx + b_w + 24, by + 34], radius=20, fill=(6, 12, 26), outline=(246, 196, 106), width=1)
    draw.text((bx, by), badge_text, fill=(246, 196, 106), font=font_badge)
    
    # Save OG image (1200x630 JPEG & PNG)
    out_jpg = "/Users/ilyachumachenkov/Documents/zenspace/public/og-preview.jpg"
    out_png = "/Users/ilyachumachenkov/Documents/zenspace/public/og-image.jpg"
    img.save(out_jpg, "JPEG", quality=95)
    img.save(out_png, "JPEG", quality=95)
    print("Saved:", out_jpg)
    
    # 4. Generate App Icons (512x512, 192x192, 180x180)
    icon_size = 512
    icon = Image.new("RGB", (icon_size, icon_size), (3, 7, 18))
    ic_draw = ImageDraw.Draw(icon)
    for y in range(icon_size):
        ratio = y / icon_size
        r = int(3 + 12 * ratio)
        g = int(7 + 20 * ratio)
        b = int(18 + 40 * ratio)
        ic_draw.line([(0, y), (icon_size, y)], fill=(r, g, b))
        
    ic_glow = Image.new("RGBA", (icon_size, icon_size), (0, 0, 0, 0))
    ic_glow_draw = ImageDraw.Draw(ic_glow)
    ic_cx, ic_cy = icon_size // 2, icon_size // 2 - 20
    
    for rad in range(180, 20, -15):
        alpha = int(40 * (1 - rad / 180))
        ic_glow_draw.ellipse([ic_cx - rad, ic_cy - rad, ic_cx + rad, ic_cy + rad], fill=(56, 189, 248, alpha))
        
    for rad in range(100, 10, -10):
        alpha = int(60 * (1 - rad / 100))
        ic_glow_draw.ellipse([ic_cx - rad, ic_cy - rad, ic_cx + rad, ic_cy + rad], fill=(246, 196, 106, alpha))
        
    ic_nodes = [
        (ic_cx - 100, ic_cy - 40),
        (ic_cx + 100, ic_cy - 50),
        (ic_cx + 80, ic_cy + 70),
        (ic_cx - 90, ic_cy + 60)
    ]
    for x1, y1 in ic_nodes:
        ic_glow_draw.line([(x1, y1), (ic_cx, ic_cy)], fill=(246, 196, 106, 140), width=2)
        ic_glow_draw.ellipse([x1 - 4, y1 - 4, x1 + 4, y1 + 4], fill=(255, 255, 255, 240))
        
    ic_glow_draw.ellipse([ic_cx - 42, ic_cy - 42, ic_cx + 42, ic_cy + 42], outline=(56, 189, 248, 220), width=3)
    ic_glow_draw.ellipse([ic_cx - 20, ic_cy - 20, ic_cx + 20, ic_cy + 20], fill=(246, 196, 106, 255))
    ic_glow_draw.ellipse([ic_cx - 10, ic_cy - 10, ic_cx + 10, ic_cy + 10], fill=(255, 255, 255, 255))
    
    icon = Image.alpha_composite(icon.convert("RGBA"), ic_glow).convert("RGB")
    ic_draw = ImageDraw.Draw(icon)
    
    try:
        f_ic = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 36)
    except:
        f_ic = ImageFont.load_default()
    ic_text = "ZENSPACE"
    t_bb = ic_draw.textbbox((0, 0), ic_text, font=f_ic)
    ic_draw.text(((icon_size - (t_bb[2] - t_bb[0])) // 2, 420), ic_text, fill=(246, 196, 106), font=f_ic)
    
    icon.save("/Users/ilyachumachenkov/Documents/zenspace/public/icon-512.png", "PNG")
    icon.resize((192, 192), Image.Resampling.LANCZOS).save("/Users/ilyachumachenkov/Documents/zenspace/public/icon-192.png", "PNG")
    icon.resize((180, 180), Image.Resampling.LANCZOS).save("/Users/ilyachumachenkov/Documents/zenspace/public/apple-touch-icon.png", "PNG")
    print("Saved all PWA PNG icons.")

create_og_image()
