import os
import re

DATA_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend', 'src', 'data', 'expandedMarketplaceProducts.ts'))

MAPPING = [
    # Laptops
    ('Dell Latitude 5420', '/images/products/laptops/dell-latitude-5420.jpg'),
    ('HP ProBook 440 G7', '/images/products/laptops/hp-probook-440-g7.jpg'),
    ('Lenovo ThinkPad T14 Gen 2', '/images/products/laptops/lenovo-thinkpad-t14.jpg'),
    ('Apple MacBook Air M1 (2020)', '/images/products/laptops/apple-macbook-air-m1.jpg'),
    ('Dell XPS 13 9305', '/images/products/laptops/dell-xps-13.jpg'),
    ('ASUS ZenBook 14 UX425', '/images/products/laptops/asus-zenbook-14.jpg'),
    ('Acer Aspire 5 A515-56', '/images/products/laptops/acer-aspire-5.jpg'),
    
    # Motherboards
    ('MSI B450 TOMAHAWK MAX II', '/images/products/motherboards/msi-b450-tomahawk.jpg'),
    ('ASUS ROG STRIX B550-F Gaming WiFi', '/images/products/motherboards/asus-rog-strix-b550f.jpg'),
    ('Gigabyte B660M DS3H AX DDR4', '/images/products/motherboards/gigabyte-b660m-ds3h.jpg'),
    ('ASRock B560 Pro4 ATX', '/images/products/motherboards/asrock-b560-pro4.jpg'),
    ('MSI MAG Z790 TOMAHAWK WiFi DDR5', '/images/products/motherboards/msi-mag-z790-tomahawk.jpg'),
    ('ASUS Prime H610M-E D4', '/images/products/motherboards/asus-prime-h610m.jpg'),
    
    # Batteries
    ('Dell 54Wh Type 4GVGH OEM Laptop Battery', '/images/products/batteries/dell-54wh-4gvgh.svg'),
    ('Lenovo ThinkPad 48Wh 6-Cell 68+ Battery', '/images/products/batteries/lenovo-thinkpad-48wh-68plus.svg'),
    ('HP HT03XL Original Battery Pack 41.04Wh', '/images/products/batteries/hp-ht03xl-41wh.svg'),
    ('Apple MacBook Pro 13" A1819 Battery Module', '/images/products/batteries/apple-macbook-pro-a1819.svg'),
    ('ASUS C21N1818 Li-Polymer 37Wh Battery', '/images/products/batteries/asus-c21n1818.svg'),
    ('Acer AC14B8K Li-Polymer 36Wh Battery Pack', '/images/products/batteries/acer-ac14b8k.svg'),
    
    # RAM
    ('Corsair Vengeance LPX 16GB DDR4 3200MHz', '/images/products/ram/corsair-vengeance-lpx-16gb.jpg'),
    ('G.Skill Ripjaws V 32GB (2x16GB) DDR4 3600MHz', '/images/products/ram/gskill-ripjaws-v-32gb.jpg'),
    ('Kingston Fury Beast 16GB DDR5 5200MHz', '/images/products/ram/kingston-fury-beast-16gb.jpg'),
    ('Crucial 8GB DDR4 3200MHz SODIMM Laptop Memory', '/images/products/ram/crucial-sodimm-8gb.jpg'),
    ('TeamGroup T-Force Delta RGB 16GB DDR4 3200MHz', '/images/products/ram/teamgroup-tforce-delta-rgb.jpg'),
    ('Samsung 16GB DDR4 2666MHz ECC SO-DIMM', '/images/products/ram/samsung-ecc-16gb.jpg'),
    
    # CPUs
    ('AMD Ryzen 5 5600X (6-Core, 12-Thread 4.6GHz)', '/images/products/cpus/amd-ryzen-5-5600x.jpg'),
    ('Intel Core i5-12400F 12th Gen (6-Core 4.4GHz)', '/images/products/cpus/intel-core-i5-12400f.jpg'),
    ('AMD Ryzen 7 5800X (8-Core, 16-Thread 4.7GHz)', '/images/products/cpus/amd-ryzen-7-5800x.jpg'),
    ('Intel Core i7-11700K 11th Gen (8-Core 5.0GHz)', '/images/products/cpus/intel-core-i7-11700k.jpg'),
    ('AMD Ryzen 3 3200G with Radeon Vega 8', '/images/products/cpus/amd-ryzen-3-3200g.jpg'),
    ('Intel Core i3-10100F 10th Gen 4-Core 4.3GHz', '/images/products/cpus/intel-core-i3-10100f.jpg'),
    
    # GPUs
    ('Zotac Gaming GeForce RTX 3060 12GB Twin Edge', '/images/products/gpus/zotac-rtx-3060-12gb.jpg'),
    ('ASUS Dual GeForce RTX 2060 6GB EVO', '/images/products/gpus/asus-dual-rtx-2060-6gb.jpg'),
    ('MSI Radeon RX 6600 MECH 2X 8GB', '/images/products/gpus/msi-rx-6600-mech-8gb.jpg'),
    ('Gigabyte GeForce GTX 1660 Super OC 6GB', '/images/products/gpus/gigabyte-gtx-1660-super.jpg'),
    ('Sapphire Pulse AMD Radeon RX 580 8GB', '/images/products/gpus/sapphire-pulse-rx-580.jpg'),
    ('EVGA GeForce RTX 3070 XC3 Ultra 8GB', '/images/products/gpus/evga-rtx-3070-xc3.jpg'),
    
    # Smartphones
    ('Samsung Galaxy S21 5G 128GB Phantom Gray', '/images/products/smartphones/samsung-galaxy-s21.jpg'),
    ('Apple iPhone 12 128GB Blue', '/images/products/smartphones/apple-iphone-12.jpg'),
    ('OnePlus 9 Pro 5G 12GB/256GB Morning Mist', '/images/products/smartphones/oneplus-9-pro.jpg'),
    ('Google Pixel 6 128GB Stormy Black', '/images/products/smartphones/google-pixel-6.jpg'),
    ('Xiaomi Redmi Note 10 Pro Max 128GB', '/images/products/smartphones/xiaomi-redmi-note-10-pro.jpg'),
    ('Samsung Galaxy Note 10 Aura Glow 256GB', '/images/products/smartphones/samsung-galaxy-note-10.jpg'),
    
    # Monitors
    ('Dell UltraSharp 24" U2422H FHD IPS 100% sRGB', '/images/products/monitors/dell-ultrasharp-u2422h.jpg'),
    ('LG 27" 4K UHD 27UL500-W HDR10 IPS Display', '/images/products/monitors/lg-27ul500w-4k.jpg'),
    ('ASUS ProArt Display 24.1" PA248QV 16:10 WUXGA', '/images/products/monitors/asus-proart-pa248qv.jpg'),
    ('BenQ GW2780 27" Eye-Care FHD IPS Monitor', '/images/products/monitors/benq-gw2780.jpg'),
    ('HP 24mh 23.8" FHD IPS Monitor with Speakers', '/images/products/monitors/hp-24mh.jpg'),
    ('Acer Nitro 23.8" VG240Y 165Hz IPS Gaming Monitor', '/images/products/monitors/acer-nitro-vg240y.jpg'),
    
    # Chargers
    ('Apple 61W USB-C Power Adapter (Original OEM)', '/images/products/chargers/apple-61w-usbc.jpg'),
    ('Dell 65W Round-Tip AC Power Adapter 19.5V', '/images/products/chargers/dell-65w-roundtip.jpg'),
    ('Lenovo 65W USB-C Standard Charger Adapter', '/images/products/chargers/lenovo-65w-usbc.jpg'),
    ('HP 45W Smart Blue-Pin AC Adapter', '/images/products/chargers/hp-45w-bluepin.jpg'),
    ('Anker PowerPort III 65W GaN Fast Charger', '/images/products/chargers/anker-65w-gan.jpg'),
    ('Samsung 45W Super Fast Type-C Charger EP-TA845', '/images/products/chargers/samsung-45w-ta845.jpg'),
]

with open(DATA_FILE, 'r') as f:
    content = f.read()

updated = 0
for title, img_path in MAPPING:
    # Pattern to find the object with this title and replace its images array
    # Look for title: '...' followed eventually by images: ['...']
    pattern = rf"(title:\s*['\"]{re.escape(title)}['\"].*?images:\s*\[)[^\]]+(\])"
    match = re.search(pattern, content, re.DOTALL)
    if match:
        replacement = f"\\g<1>'{img_path}'\\g<2>"
        content, count = re.subn(pattern, replacement, content, count=1, flags=re.DOTALL)
        if count > 0:
            updated += 1
            print(f"Updated: {title} -> {img_path}")
    else:
        print(f"WARNING: Match not found for {title}")

print(f"\nTotal items updated in file: {updated}/{len(MAPPING)}")

with open(DATA_FILE, 'w') as f:
    f.write(content)

print(f"Successfully saved {DATA_FILE}")

