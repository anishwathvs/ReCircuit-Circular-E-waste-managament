import os
import sys
import json
import urllib.request
import urllib.parse
from PIL import Image
import io

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PUBLIC_DIR = os.path.join(BASE_DIR, 'frontend', 'public', 'images', 'products')

HEADERS = {
    'User-Agent': 'ReCircuitPlatform/1.0 (contact@recircuit.com; refurbished-tech-qa)'
}

def get_wikimedia_url(filename):
    url = f"https://commons.wikimedia.org/w/api.php?action=query&titles={urllib.parse.quote('File:' + filename)}&prop=imageinfo&iiprop=url|size|mime&format=json"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
            pages = data.get('query', {}).get('pages', {})
            for pid, p in pages.items():
                if 'imageinfo' in p and len(p['imageinfo']) > 0:
                    return p['imageinfo'][0]['url']
    except Exception as e:
        print(f"Error fetching URL for {filename}: {e}")
    return None

def download_and_process(img_url, out_path, target_size=(800, 600)):
    req = urllib.request.Request(img_url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            raw_data = resp.read()
            img = Image.open(io.BytesIO(raw_data))
            if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                # Alpha composite over clean neutral light background #F8FAF7
                bg = Image.new('RGB', img.size, (248, 250, 247))
                img = img.convert('RGBA')
                bg.paste(img, mask=img.split()[3])
                img = bg
            else:
                img = img.convert('RGB')
            
            # Aspect-fit into target_size with border padding
            img_ratio = img.width / img.height
            target_ratio = target_size[0] / target_size[1]
            
            if img_ratio > target_ratio:
                # Wider than target
                new_w = target_size[0]
                new_h = max(1, int(target_size[0] / img_ratio))
            else:
                # Taller than target
                new_h = target_size[1]
                new_w = max(1, int(target_size[1] * img_ratio))
            
            resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            final_img = Image.new('RGB', target_size, (248, 250, 247))
            offset_x = (target_size[0] - new_w) // 2
            offset_y = (target_size[1] - new_h) // 2
            final_img.paste(resized, (offset_x, offset_y))
            
            os.makedirs(os.path.dirname(out_path), exist_ok=True)
            final_img.save(out_path, 'JPEG', quality=90, optimize=True)
            print(f"  [SAVED] {os.path.basename(out_path)} ({len(raw_data)} raw bytes -> {os.path.getsize(out_path)} bytes)")
            return True
    except Exception as e:
        print(f"  [FAIL] Could not process {img_url}: {e}")
        return False

# Distinct curated sources for all categories
SOURCES = {
    # ================= 1. LAPTOPS =================
    'laptops': [
        ('dell-latitude-5420.jpg', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80'),
        ('hp-probook-440-g7.jpg', 'https://images.unsplash.com/photo-1663354027456-ce6a7e07d212?w=800&auto=format&fit=crop&q=80'),
        ('lenovo-thinkpad-t14.jpg', 'WIKIMEDIA:Lenovo ThinkPad T14 (50379777211).jpg'),
        ('apple-macbook-air-m1.jpg', 'WIKIMEDIA:MacBook Air M1.png'),
        ('dell-xps-13.jpg', 'WIKIMEDIA:DELL XPS 13 and 15 (37080596413).jpg'),
        ('asus-zenbook-14.jpg', 'WIKIMEDIA:ASUS ZenBook Duo UX481FL.jpg'),
        ('acer-aspire-5.jpg', 'WIKIMEDIA:Acer Aspire A515-51.jpg'),
    ],
    # ================= 2. MOTHERBOARDS =================
    'motherboards': [
        ('msi-b450-tomahawk.jpg', 'WIKIMEDIA:MSI K7T266 motherboard.jpg'),
        ('asus-rog-strix-b550f.jpg', 'WIKIMEDIA:2023 Płyta główna Asus ROG STRIX Z690-A GAMING WIFI.jpg'),
        ('gigabyte-b660m-ds3h.jpg', 'WIKIMEDIA:GIGABYTE P55-UD6 Motherboard Unboxed.jpg'),
        ('asrock-b560-pro4.jpg', 'WIKIMEDIA:2023 Płyta główna ASRock A320M-DVS.jpg'),
        ('msi-mag-z790-tomahawk.jpg', 'WIKIMEDIA:Motherboard MSI Trident X 9th 20201120 DSC6186.jpg'),
        ('asus-prime-h610m.jpg', 'WIKIMEDIA:ASUS PRIME X570-P and X570-PRO 20190601.jpg'),
    ],
    # ================= 3. RAM =================
    'ram': [
        ('corsair-vengeance-lpx-16gb.jpg', 'WIKIMEDIA:2014 Corsair Vengeance 2x4GB, 1600MHz.jpg'),
        ('gskill-ripjaws-v-32gb.jpg', 'WIKIMEDIA:G.Skill RipjawsX DDR3 memory modules.JPG'),
        ('kingston-fury-beast-16gb.jpg', 'WIKIMEDIA:HX318C10FB-8 rear 20160503.jpg'),
        ('crucial-sodimm-8gb.jpg', 'WIKIMEDIA:Goodram DDR4 8GB 3200MHz CL22 SODIMM module.jpg'),
        ('teamgroup-tforce-delta-rgb.jpg', 'WIKIMEDIA:2023 Pamięci Corsair Vengeance RGB.jpg'),
        ('samsung-ecc-16gb.jpg', 'WIKIMEDIA:Micron MTC40F204681RC48BA1R 20240407 076.jpg'),
    ],
    # ================= 4. CPUS =================
    'cpus': [
        ('amd-ryzen-5-5600x.jpg', 'WIKIMEDIA:AMD@7nm(12nmIOD)@Zen3@Vermeer@Ryzen 5 5600X@100-000000064 BG 2042SUS 9JF6228V00014 DSCx2.jpg'),
        ('intel-core-i5-12400f.jpg', 'WIKIMEDIA:Intel@intel7(10nmESF)@AlderLake@ADL-S(6P+0E)@i5-12400F@SRL5Z DSCx01@VIS (52402436460).jpg'),
        ('amd-ryzen-7-5800x.jpg', 'WIKIMEDIA:AMD Ryzen 7 5800X 19339.jpg'),
        ('intel-core-i7-11700k.jpg', 'WIKIMEDIA:4th Generation Intel® Core™ i7 Processor Front.jpg'),
        ('amd-ryzen-3-3200g.jpg', 'WIKIMEDIA:Socket AM4 (ASRock AB350M Pro4) 01.jpg'),
        ('intel-core-i3-10100f.jpg', 'WIKIMEDIA:Intel core i3-2350m sr0dn observe.jpg'),
    ],
    # ================= 5. GPUS =================
    'gpus': [
        ('zotac-rtx-3060-12gb.jpg', 'WIKIMEDIA:Zotac GeForce RTX 3060 12GB VRAM LHR video card.jpg'),
        ('asus-dual-rtx-2060-6gb.jpg', 'WIKIMEDIA:NVIDIA GeForce RTX 2060.jpg'),
        ('msi-rx-6600-mech-8gb.jpg', 'WIKIMEDIA:ASUS AMD RX 6600 XT - Dual fan (52000061780).jpg'),
        ('gigabyte-gtx-1660-super.jpg', 'WIKIMEDIA:Gigabyte GTX 1660 Ti graphics card (51993493927).jpg'),
        ('sapphire-pulse-rx-580.jpg', 'WIKIMEDIA:NITRO+ RX 580 4G G5.jpg'),
        ('evga-rtx-3070-xc3.jpg', 'WIKIMEDIA:MSI GeForce RTX 3070 VENTUS 3X OC.jpg'),
    ],
    # ================= 6. SMARTPHONES =================
    'smartphones': [
        ('samsung-galaxy-s21.jpg', 'WIKIMEDIA:GalaxyS21.png'),
        ('apple-iphone-12.jpg', 'WIKIMEDIA:Rear 3 lenses of an iPhone 12.jpg'),
        ('oneplus-9-pro.jpg', 'WIKIMEDIA:OnePlus 9 Pro Camera Module.jpg'),
        ('google-pixel-6.jpg', 'WIKIMEDIA:Google Pixel 6 Sorta Seafoam rear bottom-left.jpg'),
        ('xiaomi-redmi-note-10-pro.jpg', 'WIKIMEDIA:Redmi Note 10 Pro left.jpg'),
        ('samsung-galaxy-note-10.jpg', 'WIKIMEDIA:Back of Galaxy Note 10, Galaxy Note 10+ and Galaxy Note 10 Lite 20200220b.jpg'),
    ],
    # ================= 7. MONITORS =================
    'monitors': [
        ('dell-ultrasharp-u2422h.jpg', 'WIKIMEDIA:Dual Dell monitor workstation setup.jpg'),
        ('lg-27ul500w-4k.jpg', 'WIKIMEDIA:LG Monitor.jpg'),
        ('asus-proart-pa248qv.jpg', 'WIKIMEDIA:Asus ProArt PA246Q monitor 2.JPG'),
        ('benq-gw2780.jpg', 'WIKIMEDIA:BENQ MONITOR (Жидкокристалический).jpg'),
        ('hp-24mh.jpg', 'WIKIMEDIA:HP ProDesk and HP Compaq monitor in library.jpg'),
        ('acer-nitro-vg240y.jpg', 'WIKIMEDIA:Gaming-Monitor ausgestellt 20190202 185511 Kopie.jpg'),
    ],
    # ================= 8. CHARGERS =================
    'chargers': [
        ('apple-61w-usbc.jpg', 'WIKIMEDIA:Apple 96W USB Type-C Power Adapter for new 16 inch MacBook Pro (49165128252).jpg'),
        ('dell-65w-roundtip.jpg', 'WIKIMEDIA:Dell AC Adapter AD-4214N.jpg'),
        ('lenovo-65w-usbc.jpg', 'WIKIMEDIA:Lenovo 65W 20V AC adapter (FRU 42T5283) for ThinkPad laptops.jpg'),
        ('hp-45w-bluepin.jpg', 'WIKIMEDIA:HP Presario F700 Adapter.jpg'),
        ('anker-65w-gan.jpg', 'WIKIMEDIA:Silicon vs GaN 30W USB-C chargers.jpg'),
        ('samsung-45w-ta845.jpg', 'WIKIMEDIA:SAMSUNG EP-T4510 45W POWER ADAPER BLACK.jpg'),
    ],
}

def main():
    print("=== STARTING SKU ASSET ACQUISITION & PROCESSING ===")
    total = sum(len(items) for items in SOURCES.values())
    print(f"Total hardware photographic items to fetch: {total}")
    success_count = 0
    
    for category, items in SOURCES.items():
        print(f"\nProcessing category: {category} ({len(items)} items)")
        cat_dir = os.path.join(PUBLIC_DIR, category)
        os.makedirs(cat_dir, exist_ok=True)
        
        for filename, source in items:
            out_file = os.path.join(cat_dir, filename)
            print(f"Fetching {filename}...")
            
            if source.startswith('WIKIMEDIA:'):
                wm_file = source.replace('WIKIMEDIA:', '')
                img_url = get_wikimedia_url(wm_file)
                if not img_url:
                    print(f"  [ERROR] Wikimedia URL not found for {wm_file}")
                    continue
            else:
                img_url = source
                
            ok = download_and_process(img_url, out_file)
            if ok:
                success_count += 1
                
    print(f"\nFinished: {success_count}/{total} images successfully created.")

if __name__ == '__main__':
    main()

