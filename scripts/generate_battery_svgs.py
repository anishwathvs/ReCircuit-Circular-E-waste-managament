import os

OUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'public', 'images', 'products', 'batteries'))
os.makedirs(OUT_DIR, exist_ok=True)

# 1. Dell 54Wh Type 4GVGH OEM Laptop Battery
# Form Factor: Elongated slim 4-cell internal battery with center Dell regulatory label & brass connector
dell_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F8FAF7" />
      <stop offset="100%" stop-color="#EBF3ED" />
    </linearGradient>
    <linearGradient id="casingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#282E2B" />
      <stop offset="40%" stop-color="#1A1F1C" />
      <stop offset="100%" stop-color="#101311" />
    </linearGradient>
    <filter id="packShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#084D36" flood-opacity="0.14" />
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.25" />
    </filter>
  </defs>

  <rect width="600" height="360" fill="url(#bgGlow)" rx="24" />

  <g filter="url(#packShadow)">
    <!-- Mounting tabs -->
    <path d="M 45 155 L 70 155 L 70 195 L 45 195 A 6 6 0 0 1 45 155 Z" fill="#1C201E" stroke="#3A423E" stroke-width="1.5" />
    <circle cx="57" cy="175" r="4.5" fill="#4B5550" stroke="#101311" stroke-width="1" />
    <path d="M 555 155 L 530 155 L 530 195 L 555 195 A 6 6 0 0 0 555 155 Z" fill="#1C201E" stroke="#3A423E" stroke-width="1.5" />
    <circle cx="543" cy="175" r="4.5" fill="#4B5550" stroke="#101311" stroke-width="1" />
    
    <!-- Top cable clip tab -->
    <rect x="270" y="96" width="60" height="16" rx="4" fill="#1A1F1C" stroke="#3A423E" />
    <rect x="282" y="92" width="36" height="6" rx="2" fill="#D4AF37" />

    <!-- Main elongated 4-cell casing -->
    <rect x="70" y="110" width="460" height="135" rx="12" fill="url(#casingGrad)" stroke="#3E4743" stroke-width="1.5" />

    <!-- 4 Cell dividers -->
    <line x1="185" y1="112" x2="185" y2="243" stroke="#0E1110" stroke-width="2.5" />
    <line x1="300" y1="112" x2="300" y2="243" stroke="#0E1110" stroke-width="2.5" />
    <line x1="415" y1="112" x2="415" y2="243" stroke="#0E1110" stroke-width="2.5" />

    <!-- OEM Label Surface -->
    <rect x="195" y="125" width="210" height="105" rx="6" fill="#F4F6F3" stroke="#D1D5DB" stroke-width="1" />
    
    <!-- Dell Logo -->
    <circle cx="225" cy="150" r="14" fill="#007DB8" />
    <text x="225" y="155" font-family="Arial, sans-serif" font-size="12" font-weight="900" fill="#FFFFFF" text-anchor="middle">DELL</text>
    
    <text x="250" y="145" font-family="Arial, sans-serif" font-size="12" font-weight="800" fill="#111827">54Wh Standard</text>
    <text x="250" y="159" font-family="Arial, sans-serif" font-size="10" font-weight="600" fill="#374151">Rechargeable Li-ion Battery</text>
    <text x="250" y="172" font-family="monospace" font-size="9" fill="#16834D" font-weight="700">Type 4GVGH • 15.2V === 3500mAh</text>
    
    <!-- Specs box -->
    <rect x="205" y="184" width="190" height="38" rx="4" fill="#E5E7EB" />
    <text x="215" y="198" font-family="sans-serif" font-size="7.5" fill="#374151">DP/N: 01P6KD | Made in China | 4-Cell</text>
    <text x="215" y="210" font-family="sans-serif" font-size="7.5" font-weight="700" fill="#B91C1C">CAUTION: Do not expose to temp above 65°C</text>
  </g>
</svg>"""

# 2. Lenovo ThinkPad 48Wh 6-Cell 68+ Battery
# Form Factor: Cylindrical external modular battery bar with Lenovo red logo, rear locking latch & 6 rounded cell lobes
lenovo_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F8FAF7" />
      <stop offset="100%" stop-color="#EBF3ED" />
    </linearGradient>
    <linearGradient id="cylGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#3C423E" />
      <stop offset="25%" stop-color="#242926" />
      <stop offset="70%" stop-color="#141715" />
      <stop offset="100%" stop-color="#2E3330" />
    </linearGradient>
    <filter id="packShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#084D36" flood-opacity="0.14" />
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.25" />
    </filter>
  </defs>

  <rect width="600" height="360" fill="url(#bgGlow)" rx="24" />

  <g filter="url(#packShadow)">
    <!-- Base Mounting Frame & Guide Rails -->
    <rect x="80" y="100" width="440" height="40" rx="6" fill="#151816" stroke="#2B302D" />
    
    <!-- ThinkPad Latch Mechanism -->
    <rect x="420" y="88" width="50" height="14" rx="3" fill="#E11D48" />
    <text x="445" y="99" font-family="sans-serif" font-size="8" font-weight="900" fill="#FFFFFF" text-anchor="middle">LOCK ▶</text>
    
    <!-- Modular Interface Pins (Gold/Yellow) -->
    <rect x="130" y="92" width="70" height="10" rx="2" fill="#EAB308" stroke="#CA8A04" />
    <line x1="140" y1="92" x2="140" y2="102" stroke="#151816" stroke-width="2" />
    <line x1="152" y1="92" x2="152" y2="102" stroke="#151816" stroke-width="2" />
    <line x1="164" y1="92" x2="164" y2="102" stroke="#151816" stroke-width="2" />
    <line x1="176" y1="92" x2="176" y2="102" stroke="#151816" stroke-width="2" />
    <line x1="188" y1="92" x2="188" y2="102" stroke="#151816" stroke-width="2" />

    <!-- 6 Cylindrical 18650 Cells Form Factor (Bulging Rounded Lobes) -->
    <g>
      <rect x="80" y="130" width="70" height="120" rx="35" fill="url(#cylGrad)" stroke="#4A524E" stroke-width="1.5" />
      <rect x="148" y="130" width="70" height="120" rx="35" fill="url(#cylGrad)" stroke="#4A524E" stroke-width="1.5" />
      <rect x="216" y="130" width="70" height="120" rx="35" fill="url(#cylGrad)" stroke="#4A524E" stroke-width="1.5" />
      <rect x="284" y="130" width="70" height="120" rx="35" fill="url(#cylGrad)" stroke="#4A524E" stroke-width="1.5" />
      <rect x="352" y="130" width="70" height="120" rx="35" fill="url(#cylGrad)" stroke="#4A524E" stroke-width="1.5" />
      <rect x="420" y="130" width="70" height="120" rx="35" fill="url(#cylGrad)" stroke="#4A524E" stroke-width="1.5" />
    </g>

    <!-- Center Label Panel -->
    <rect x="150" y="150" width="270" height="80" rx="6" fill="#1C1F1D" stroke="#374151" />
    
    <!-- Lenovo / ThinkPad Badge -->
    <rect x="165" y="162" width="60" height="20" rx="3" fill="#E11D48" />
    <text x="195" y="176" font-family="Arial, sans-serif" font-size="11" font-weight="900" fill="#FFFFFF" text-anchor="middle">lenovo</text>
    
    <text x="235" y="174" font-family="sans-serif" font-size="13" font-weight="800" fill="#F3F4F6">ThinkPad Battery 68+</text>
    <text x="235" y="188" font-family="monospace" font-size="9" fill="#22C55E" font-weight="700">FRU 0C52862 / ASM 45N1126</text>
    <text x="165" y="210" font-family="sans-serif" font-size="9" fill="#9CA3AF">Rating: 10.8V === 4.4Ah 48Wh | 6-Cell Cylindrical Pack</text>
    <text x="165" y="222" font-family="sans-serif" font-size="8" fill="#FACC15">Certified Genuine OEM Component for T440 / T450 / X240 / X250</text>
  </g>
</svg>"""

# 3. HP HT03XL Original Battery Pack 41.04Wh
# Form Factor: 3-cell flat internal battery pack with stepped corner, HP logo, L11119-855 sticker
hp_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F8FAF7" />
      <stop offset="100%" stop-color="#EBF3ED" />
    </linearGradient>
    <linearGradient id="hpCasing" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2D3330" />
      <stop offset="50%" stop-color="#1B201D" />
      <stop offset="100%" stop-color="#111412" />
    </linearGradient>
    <filter id="packShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#084D36" flood-opacity="0.14" />
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.25" />
    </filter>
  </defs>

  <rect width="600" height="360" fill="url(#bgGlow)" rx="24" />

  <g filter="url(#packShadow)">
    <!-- Stepped polygon casing characteristic of HP HT03XL -->
    <path d="M 80 120 L 460 120 L 460 160 L 520 160 L 520 235 L 80 235 Z" fill="url(#hpCasing)" stroke="#424A45" stroke-width="1.5" />
    
    <!-- Screw tabs -->
    <circle cx="95" cy="132" r="5" fill="#374151" stroke="#111412" />
    <circle cx="505" cy="172" r="5" fill="#374151" stroke="#111412" />
    <circle cx="95" cy="223" r="5" fill="#374151" stroke="#111412" />
    <circle cx="505" cy="223" r="5" fill="#374151" stroke="#111412" />

    <!-- 3 Cell partitions -->
    <line x1="205" y1="120" x2="205" y2="235" stroke="#0B0D0C" stroke-width="2.5" />
    <line x1="330" y1="120" x2="330" y2="235" stroke="#0B0D0C" stroke-width="2.5" />

    <!-- Interface Connector Harness Cable -->
    <rect x="470" y="130" width="30" height="22" rx="3" fill="#111827" stroke="#374151" />
    <line x1="475" y1="141" x2="495" y2="141" stroke="#E5E7EB" stroke-width="4" stroke-dasharray="2 2" />

    <!-- HP OEM White Label -->
    <rect x="110" y="135" width="200" height="85" rx="5" fill="#FFFFFF" stroke="#D1D5DB" />
    
    <!-- HP Round Circular Logo -->
    <circle cx="135" cy="160" r="16" fill="#0096D6" />
    <text x="135" y="167" font-family="'Times New Roman', serif" font-size="20" font-style="italic" font-weight="bold" fill="#FFFFFF" text-anchor="middle">hp</text>

    <text x="160" y="155" font-family="sans-serif" font-size="12" font-weight="900" fill="#111827">HP HT03XL</text>
    <text x="160" y="168" font-family="sans-serif" font-size="9" fill="#4B5553">Regulatory Model: HSTNN-LB8L</text>
    <text x="160" y="180" font-family="monospace" font-size="9" font-weight="700" fill="#084D36">11.55V === 41.04Wh 3470mAh</text>
    <text x="120" y="202" font-family="monospace" font-size="8" fill="#374151">HP Spare: L11119-855 • 3-Cell Li-ion</text>
    <text x="120" y="213" font-family="sans-serif" font-size="7" font-weight="700" fill="#DC2626">WARNING: Replace only with HP certified spare</text>
  </g>
</svg>"""

# 4. Apple MacBook Pro 13" A1819 Battery Module
# Form Factor: 3-piece segmented asymmetrical black pouch battery array with central ribbon cable for Touch Bar A1706
apple_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F8FAF7" />
      <stop offset="100%" stop-color="#EBF3ED" />
    </linearGradient>
    <linearGradient id="applePouch" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#222624" />
      <stop offset="60%" stop-color="#141715" />
      <stop offset="100%" stop-color="#0A0C0B" />
    </linearGradient>
    <filter id="packShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#084D36" flood-opacity="0.14" />
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.25" />
    </filter>
  </defs>

  <rect width="600" height="360" fill="url(#bgGlow)" rx="24" />

  <g filter="url(#packShadow)">
    <!-- Central Logic Flex Board & Ribbon (Signature Apple Architecture) -->
    <path d="M 270 95 L 330 95 L 330 250 L 270 250 Z" fill="#1C1F1D" stroke="#333A36" />
    <!-- Gold contact bus pins -->
    <rect x="282" y="90" width="36" height="10" rx="2" fill="#EAB308" />
    <line x1="288" y1="90" x2="288" y2="100" stroke="#111827" stroke-width="1.5" />
    <line x1="294" y1="90" x2="294" y2="100" stroke="#111827" stroke-width="1.5" />
    <line x1="300" y1="90" x2="300" y2="100" stroke="#111827" stroke-width="1.5" />
    <line x1="306" y1="90" x2="306" y2="100" stroke="#111827" stroke-width="1.5" />
    <line x1="312" y1="90" x2="312" y2="100" stroke="#111827" stroke-width="1.5" />

    <!-- Flexible interconnect ribbon traces -->
    <line x1="190" y1="170" x2="270" y2="170" stroke="#CA8A04" stroke-width="5" />
    <line x1="330" y1="170" x2="410" y2="170" stroke="#CA8A04" stroke-width="5" />

    <!-- 3 Distinct Lithium-Polymer Pouch Cells -->
    <!-- Left Wing Pouch -->
    <rect x="70" y="115" width="130" height="125" rx="8" fill="url(#applePouch)" stroke="#3E4541" stroke-width="1.5" />
    <!-- Center Pouch -->
    <rect x="235" y="125" width="130" height="110" rx="8" fill="url(#applePouch)" stroke="#3E4541" stroke-width="1.5" />
    <!-- Right Wing Pouch -->
    <rect x="400" y="115" width="130" height="125" rx="8" fill="url(#applePouch)" stroke="#3E4541" stroke-width="1.5" />

    <!-- Apple Aesthetic Minimal Laser-Printed Typography on Center Pouch -->
    <path d="M 297 142 C 297 138 299 135 301 133 C 299 133 296 135 294 138 C 293 140 293 143 294 145 C 296 145 297 143 297 142 Z" fill="#9CA3AF" />
    <path d="M 303 146 C 300 146 298 144 296 144 C 294 144 292 146 289 146 C 286 146 283 142 281 138 C 279 133 281 127 286 127 C 289 127 291 128 293 128 C 295 128 297 127 300 127 C 302 127 305 128 307 130 C 304 132 304 136 307 138 C 305 142 303 146 303 146 Z" fill="#9CA3AF" />

    <text x="300" y="165" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="10" font-weight="700" fill="#FFFFFF" text-anchor="middle">MacBook Pro 13" Battery</text>
    <text x="300" y="178" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="8.5" fill="#9CA3AF" text-anchor="middle">Model A1819 • 11.41V  49.2Wh  4314mAh</text>
    <text x="300" y="190" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="7.5" fill="#6B7280" text-anchor="middle">Rechargeable Li-ion Polymer Battery Pack</text>
    <text x="300" y="202" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="7" font-weight="600" fill="#EF4444" text-anchor="middle">CAUTION: Authorized Service Provider Only</text>
    <text x="300" y="214" font-family="monospace" font-size="7.5" fill="#10B981" text-anchor="middle">Serial: D868294029HJ37281</text>
  </g>
</svg>"""

# 5. ASUS C21N1818 Li-Polymer 37Wh Battery
# Form Factor: 2-cell wide slim battery pack with gold ASUS branding, 7.6V 4840mAh 37Wh
asus_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F8FAF7" />
      <stop offset="100%" stop-color="#EBF3ED" />
    </linearGradient>
    <linearGradient id="asusCasing" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2F3632" />
      <stop offset="50%" stop-color="#1B201D" />
      <stop offset="100%" stop-color="#101311" />
    </linearGradient>
    <filter id="packShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#084D36" flood-opacity="0.14" />
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.25" />
    </filter>
  </defs>

  <rect width="600" height="360" fill="url(#bgGlow)" rx="24" />

  <g filter="url(#packShadow)">
    <!-- Top cable socket -->
    <rect x="260" y="100" width="80" height="15" rx="3" fill="#1C211E" stroke="#3D4540" />
    <line x1="275" y1="96" x2="325" y2="96" stroke="#EAB308" stroke-width="4" />

    <!-- 2-Cell Extra-Wide Slim Symmetrical Pack -->
    <rect x="65" y="112" width="470" height="135" rx="10" fill="url(#asusCasing)" stroke="#454E49" stroke-width="1.5" />
    
    <!-- Heavy middle spine separating the 2 massive polymer cells -->
    <rect x="295" y="112" width="10" height="135" fill="#101311" />

    <!-- Screw mounts along periphery -->
    <circle cx="80" cy="125" r="4.5" fill="#4B5550" stroke="#101311" />
    <circle cx="520" cy="125" r="4.5" fill="#4B5550" stroke="#101311" />
    <circle cx="80" cy="235" r="4.5" fill="#4B5550" stroke="#101311" />
    <circle cx="520" cy="235" r="4.5" fill="#4B5550" stroke="#101311" />

    <!-- Left Cell ASUS Label -->
    <rect x="85" y="130" width="195" height="100" rx="5" fill="#181D1A" stroke="#2F3632" />
    
    <!-- Gold ASUS Typography -->
    <text x="100" y="158" font-family="'Copperplate', Arial, sans-serif" font-size="18" font-weight="900" fill="#D4AF37" letter-spacing="2">ASUS</text>
    <text x="100" y="175" font-family="sans-serif" font-size="11" font-weight="700" fill="#F3F4F6">Li-ion Battery Pack C21N1818</text>
    <text x="100" y="190" font-family="monospace" font-size="9.5" fill="#22C55E" font-weight="700">7.6V === 37Wh 4840mAh</text>
    <text x="100" y="204" font-family="sans-serif" font-size="8" fill="#9CA3AF">Model: 0B200-03280800 | 2-Cell 2ICP4/59/134</text>
    <text x="100" y="217" font-family="sans-serif" font-size="8" fill="#D1D5DB">ASUSTeK COMPUTER INC. All Rights Reserved</text>

    <!-- Right Cell Regulatory Grid -->
    <rect x="320" y="130" width="195" height="100" rx="5" fill="#181D1A" stroke="#2F3632" />
    <rect x="330" y="140" width="28" height="28" rx="3" fill="#D4AF37" />
    <text x="344" y="158" font-family="sans-serif" font-size="14" font-weight="900" fill="#111827" text-anchor="middle">CE</text>
    <text x="368" y="148" font-family="sans-serif" font-size="8" font-weight="700" fill="#F3F4F6">FOR USE WITH ASUS LAPTOPS</text>
    <text x="368" y="160" font-family="sans-serif" font-size="7.5" fill="#9CA3AF">VivoBook 14 / 15 / X409 / X509 Series</text>
    <text x="330" y="185" font-family="sans-serif" font-size="7.5" font-weight="700" fill="#EF4444">CAUTION: High voltage internal battery</text>
    <text x="330" y="198" font-family="monospace" font-size="7.5" fill="#9CA3AF">ReCircuit Certified QA: PASS-99.2%</text>
    <text x="330" y="210" font-family="monospace" font-size="7.5" fill="#10B981">Battery Health: Grade A+ OEM</text>
  </g>
</svg>"""

# 6. Acer AC14B8K Li-Polymer 36Wh Battery Pack
# Form Factor: Quad-cell compact black internal pack with Acer branding, 15.2V 2365mAh 36Wh
acer_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F8FAF7" />
      <stop offset="100%" stop-color="#EBF3ED" />
    </linearGradient>
    <linearGradient id="acerCasing" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2D3330" />
      <stop offset="50%" stop-color="#191D1B" />
      <stop offset="100%" stop-color="#0E110F" />
    </linearGradient>
    <filter id="packShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#084D36" flood-opacity="0.14" />
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.25" />
    </filter>
  </defs>

  <rect width="600" height="360" fill="url(#bgGlow)" rx="24" />

  <g filter="url(#packShadow)">
    <!-- Asymmetrical Acer Battery Shape with top right battery connector wire -->
    <path d="M 90 115 L 430 115 L 430 145 L 510 145 L 510 235 L 90 235 Z" fill="url(#acerCasing)" stroke="#454D49" stroke-width="1.5" />

    <!-- 4 Cell Internal Blocks -->
    <line x1="175" y1="117" x2="175" y2="233" stroke="#0B0D0C" stroke-width="2.5" />
    <line x1="260" y1="117" x2="260" y2="233" stroke="#0B0D0C" stroke-width="2.5" />
    <line x1="345" y1="117" x2="345" y2="233" stroke="#0B0D0C" stroke-width="2.5" />

    <!-- Cable socket wire assembly -->
    <rect x="445" y="125" width="24" height="15" rx="3" fill="#1C211E" stroke="#3D4540" />
    <line x1="452" y1="120" x2="452" y2="140" stroke="#EF4444" stroke-width="2" />
    <line x1="457" y1="120" x2="457" y2="140" stroke="#111827" stroke-width="2" />
    <line x1="462" y1="120" x2="462" y2="140" stroke="#10B981" stroke-width="2" />

    <!-- Screw Mount Wings -->
    <circle cx="105" cy="128" r="4.5" fill="#4B5550" stroke="#101311" />
    <circle cx="495" cy="223" r="4.5" fill="#4B5550" stroke="#101311" />

    <!-- Acer Genuine Component Label -->
    <rect x="110" y="140" width="220" height="80" rx="5" fill="#F4F6F3" stroke="#CBD5E1" />
    
    <!-- Acer Green Logo -->
    <text x="125" y="165" font-family="Arial, sans-serif" font-size="18" font-weight="900" fill="#83B81A">acer</text>
    <text x="175" y="163" font-family="sans-serif" font-size="11" font-weight="800" fill="#1E293B">AC14B8K Battery</text>
    <text x="125" y="179" font-family="monospace" font-size="9" fill="#084D36" font-weight="700">15.2V === 2365mAh 36Wh</text>
    <text x="125" y="192" font-family="sans-serif" font-size="8" fill="#475569">Part Number: KT.0040G.004 • 4-Cell Li-ion</text>
    <text x="125" y="204" font-family="sans-serif" font-size="7.5" font-weight="700" fill="#DC2626">CAUTION: Do not disassemble or crush</text>
    <text x="125" y="214" font-family="monospace" font-size="7.5" fill="#64748B">Acer Inc. Tested &amp; Certified</text>
  </g>
</svg>"""

files = {
    'dell-54wh-4gvgh.svg': dell_svg,
    'lenovo-thinkpad-48wh-68plus.svg': lenovo_svg,
    'hp-ht03xl-41wh.svg': hp_svg,
    'apple-macbook-pro-a1819.svg': apple_svg,
    'asus-c21n1818.svg': asus_svg,
    'acer-ac14b8k.svg': acer_svg,
}

for name, content in files.items():
    p = os.path.join(OUT_DIR, name)
    with open(p, 'w') as f:
        f.write(content.strip())
    print(f"Created battery SVG: {p} ({len(content)} bytes)")

