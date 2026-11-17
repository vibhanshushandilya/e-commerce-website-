"""
Management command: python manage.py seed_data

Populates the database with Amazon-style categories, subcategories,
brands, and sample products covering:
  Electronics, Mobile Phones, Computers & Laptops, Cameras,
  TV & Home Entertainment, Kitchen Appliances, Large Appliances,
  Home & Furniture, Fashion, Beauty & Health, Sports, Books, Toys, Automotive
"""
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from myapp.models import Category, Brand, Product
import random, decimal


CATEGORIES = [
    # (parent_name, child_name) — parent_name=None means top-level
    (None, "Electronics"),
        ("Electronics", "Mobile Phones & Accessories"),
            ("Mobile Phones & Accessories", "Smartphones"),
            ("Mobile Phones & Accessories", "Mobile Covers & Cases"),
            ("Mobile Phones & Accessories", "Screen Protectors"),
            ("Mobile Phones & Accessories", "Chargers & Cables"),
            ("Mobile Phones & Accessories", "Power Banks"),
            ("Mobile Phones & Accessories", "Earphones & Headphones"),
            ("Mobile Phones & Accessories", "Smartwatches & Bands"),
        ("Electronics", "Computers & Laptops"),
            ("Computers & Laptops", "Laptops"),
            ("Computers & Laptops", "Desktop PCs"),
            ("Computers & Laptops", "Monitors"),
            ("Computers & Laptops", "Keyboards & Mice"),
            ("Computers & Laptops", "Printers & Ink"),
            ("Computers & Laptops", "Networking & WiFi"),
            ("Computers & Laptops", "Hard Drives & SSDs"),
            ("Computers & Laptops", "RAM & Memory"),
            ("Computers & Laptops", "Graphic Cards"),
            ("Computers & Laptops", "Laptop Bags & Sleeves"),
        ("Electronics", "Cameras & Photography"),
            ("Cameras & Photography", "DSLR Cameras"),
            ("Cameras & Photography", "Mirrorless Cameras"),
            ("Cameras & Photography", "Action Cameras"),
            ("Cameras & Photography", "Camera Lenses"),
            ("Cameras & Photography", "Tripods & Stands"),
            ("Cameras & Photography", "Memory Cards"),
        ("Electronics", "TV & Home Entertainment"),
            ("TV & Home Entertainment", "Televisions"),
            ("TV & Home Entertainment", "Streaming Devices"),
            ("TV & Home Entertainment", "Home Theatre Systems"),
            ("TV & Home Entertainment", "Soundbars"),
            ("TV & Home Entertainment", "Blu-ray & DVD Players"),
            ("TV & Home Entertainment", "Projectors"),
        ("Electronics", "Audio"),
            ("Audio", "Bluetooth Speakers"),
            ("Audio", "Over-ear Headphones"),
            ("Audio", "In-ear Earbuds"),
            ("Audio", "Home Audio"),
            ("Audio", "Microphones"),
        ("Electronics", "Wearable Technology"),
            ("Wearable Technology", "Smart Watches"),
            ("Wearable Technology", "Fitness Trackers"),
            ("Wearable Technology", "Smart Glasses"),

    (None, "Home & Kitchen"),
        ("Home & Kitchen", "Kitchen Appliances"),
            ("Kitchen Appliances", "Mixer Grinder & Blenders"),
            ("Kitchen Appliances", "Microwave Ovens"),
            ("Kitchen Appliances", "OTG & Air Fryers"),
            ("Kitchen Appliances", "Coffee Makers"),
            ("Kitchen Appliances", "Toasters & Sandwich Makers"),
            ("Kitchen Appliances", "Rice Cookers"),
            ("Kitchen Appliances", "Induction Cooktops"),
            ("Kitchen Appliances", "Juicers & Citrus Press"),
            ("Kitchen Appliances", "Electric Kettles"),
            ("Kitchen Appliances", "Food Processors"),
            ("Kitchen Appliances", "Water Purifiers"),
        ("Home & Kitchen", "Cookware & Bakeware"),
            ("Cookware & Bakeware", "Pressure Cookers"),
            ("Cookware & Bakeware", "Non-stick Pans"),
            ("Cookware & Bakeware", "Kadai & Woks"),
            ("Cookware & Bakeware", "Baking Trays & Moulds"),
            ("Cookware & Bakeware", "Tawa & Griddles"),
        ("Home & Kitchen", "Kitchen Storage & Organisation"),
        ("Home & Kitchen", "Dining & Serveware"),
        ("Home & Kitchen", "Home Décor"),
            ("Home Décor", "Wall Art & Paintings"),
            ("Home Décor", "Clocks"),
            ("Home Décor", "Photo Frames"),
            ("Home Décor", "Candles & Holders"),
            ("Home Décor", "Artificial Plants"),
        ("Home & Kitchen", "Bedding & Linen"),
            ("Bedding & Linen", "Bedsheets"),
            ("Bedding & Linen", "Comforters & Quilts"),
            ("Bedding & Linen", "Pillows & Pillow Covers"),
            ("Bedding & Linen", "Mattress Protectors"),
        ("Home & Kitchen", "Cleaning Supplies"),
            ("Cleaning Supplies", "Vacuum Cleaners"),
            ("Cleaning Supplies", "Mops & Brooms"),
            ("Cleaning Supplies", "Cleaning Liquids"),
        ("Home & Kitchen", "Furniture"),
            ("Furniture", "Sofas & Recliners"),
            ("Furniture", "Beds & Mattresses"),
            ("Furniture", "Wardrobes & Storage"),
            ("Furniture", "Study Tables & Chairs"),
            ("Furniture", "TV Units & Cabinets"),
            ("Furniture", "Shelves & Bookcases"),

    (None, "Large Appliances"),
        ("Large Appliances", "Refrigerators"),
            ("Refrigerators", "Single Door Refrigerators"),
            ("Refrigerators", "Double Door Refrigerators"),
            ("Refrigerators", "Side-by-Side Refrigerators"),
        ("Large Appliances", "Washing Machines"),
            ("Washing Machines", "Front Load Washing Machines"),
            ("Washing Machines", "Top Load Washing Machines"),
            ("Washing Machines", "Semi-Automatic Washing Machines"),
        ("Large Appliances", "Air Conditioners"),
            ("Air Conditioners", "Split ACs"),
            ("Air Conditioners", "Window ACs"),
            ("Air Conditioners", "Portable ACs"),
        ("Large Appliances", "Dishwashers"),
        ("Large Appliances", "Water Heaters & Geysers"),

    (None, "Fashion"),
        ("Fashion", "Men's Clothing"),
            ("Men's Clothing", "T-Shirts & Polos"),
            ("Men's Clothing", "Casual Shirts"),
            ("Men's Clothing", "Formal Shirts"),
            ("Men's Clothing", "Jeans & Trousers"),
            ("Men's Clothing", "Track Pants & Joggers"),
            ("Men's Clothing", "Suits & Blazers"),
            ("Men's Clothing", "Ethnic Wear Men"),
        ("Fashion", "Women's Clothing"),
            ("Women's Clothing", "Sarees"),
            ("Women's Clothing", "Kurtis & Suits"),
            ("Women's Clothing", "Dresses & Jumpsuits"),
            ("Women's Clothing", "Tops & T-Shirts"),
            ("Women's Clothing", "Jeans & Leggings"),
            ("Women's Clothing", "Lingerie & Sleepwear"),
        ("Fashion", "Kids' Fashion"),
        ("Fashion", "Footwear"),
            ("Footwear", "Men's Shoes"),
            ("Footwear", "Women's Shoes"),
            ("Footwear", "Sports Shoes"),
            ("Footwear", "Sandals & Slippers"),
        ("Fashion", "Bags & Luggage"),
            ("Bags & Luggage", "Backpacks"),
            ("Bags & Luggage", "Handbags & Clutches"),
            ("Bags & Luggage", "Trolley Bags"),
            ("Bags & Luggage", "Wallets"),
        ("Fashion", "Jewellery & Accessories"),
            ("Jewellery & Accessories", "Necklaces & Chains"),
            ("Jewellery & Accessories", "Earrings"),
            ("Jewellery & Accessories", "Rings"),
            ("Jewellery & Accessories", "Watches"),
            ("Jewellery & Accessories", "Sunglasses"),
            ("Jewellery & Accessories", "Belts"),

    (None, "Beauty & Health"),
        ("Beauty & Health", "Skin Care"),
            ("Skin Care", "Moisturisers & Creams"),
            ("Skin Care", "Sunscreen"),
            ("Skin Care", "Face Wash"),
            ("Skin Care", "Serums & Essences"),
            ("Skin Care", "Sheet Masks"),
        ("Beauty & Health", "Hair Care"),
            ("Hair Care", "Shampoos"),
            ("Hair Care", "Conditioners"),
            ("Hair Care", "Hair Oils"),
            ("Hair Care", "Hair Dryers"),
            ("Hair Care", "Straighteners & Curlers"),
        ("Beauty & Health", "Grooming"),
            ("Grooming", "Trimmers & Shavers"),
            ("Grooming", "Shaving Accessories"),
            ("Grooming", "Men's Grooming Kits"),
        ("Beauty & Health", "Fragrances"),
        ("Beauty & Health", "Makeup"),
        ("Beauty & Health", "Health & Personal Care"),
            ("Health & Personal Care", "Vitamins & Supplements"),
            ("Health & Personal Care", "BP Monitors"),
            ("Health & Personal Care", "Weighing Scales"),
            ("Health & Personal Care", "Thermometers"),
            ("Health & Personal Care", "Pulse Oximeters"),
            ("Health & Personal Care", "Nebulisers"),

    (None, "Sports & Outdoors"),
        ("Sports & Outdoors", "Exercise & Fitness"),
            ("Exercise & Fitness", "Dumbbells & Weights"),
            ("Exercise & Fitness", "Resistance Bands"),
            ("Exercise & Fitness", "Yoga Mats"),
            ("Exercise & Fitness", "Treadmills"),
            ("Exercise & Fitness", "Cycles & Accessories"),
        ("Sports & Outdoors", "Cricket"),
        ("Sports & Outdoors", "Football"),
        ("Sports & Outdoors", "Badminton"),
        ("Sports & Outdoors", "Swimming"),
        ("Sports & Outdoors", "Camping & Hiking"),

    (None, "Books & Stationery"),
        ("Books & Stationery", "Fiction Books"),
        ("Books & Stationery", "Non-Fiction Books"),
        ("Books & Stationery", "Textbooks & Study Guides"),
        ("Books & Stationery", "Children's Books"),
        ("Books & Stationery", "Notebooks & Diaries"),
        ("Books & Stationery", "Pens & Pencils"),

    (None, "Toys & Baby Products"),
        ("Toys & Baby Products", "Action Figures & Collectibles"),
        ("Toys & Baby Products", "Board Games & Puzzles"),
        ("Toys & Baby Products", "Educational Toys"),
        ("Toys & Baby Products", "Remote Control Toys"),
        ("Toys & Baby Products", "Baby Gear"),
            ("Baby Gear", "Strollers & Prams"),
            ("Baby Gear", "Baby Car Seats"),
            ("Baby Gear", "Baby Monitors"),
            ("Baby Gear", "Diapers & Wipes"),
        ("Toys & Baby Products", "LEGO & Building Sets"),

    (None, "Automotive"),
        ("Automotive", "Car Accessories"),
            ("Car Accessories", "Car Audio & Video"),
            ("Car Accessories", "Dash Cameras"),
            ("Car Accessories", "Car Chargers"),
            ("Car Accessories", "Car Covers & Seat Covers"),
            ("Car Accessories", "GPS & Navigation"),
        ("Automotive", "Bike Accessories"),
        ("Automotive", "Tyres & Wheels"),
        ("Automotive", "Tools & Equipment"),

    (None, "Office Products"),
        ("Office Products", "Office Furniture"),
        ("Office Products", "Stationery Supplies"),
        ("Office Products", "Printers & Scanners"),
        ("Office Products", "Paper & Notebooks"),
        ("Office Products", "Projectors & Presentation"),
        ("Office Products", "Laminators & Shredders"),

    (None, "Garden & Outdoors"),
        ("Garden & Outdoors", "Seeds & Plants"),
        ("Garden & Outdoors", "Garden Tools"),
        ("Garden & Outdoors", "Pots & Planters"),
        ("Garden & Outdoors", "Fertilizers & Soil"),
        ("Garden & Outdoors", "Outdoor Furniture"),
        ("Garden & Outdoors", "Water Pumps & Sprinklers"),

    (None, "Pet Supplies"),
        ("Pet Supplies", "Dog Food & Treats"),
        ("Pet Supplies", "Cat Food & Treats"),
        ("Pet Supplies", "Pet Toys"),
        ("Pet Supplies", "Grooming & Care"),
        ("Pet Supplies", "Cages & Kennels"),

    (None, "Musical Instruments"),
        ("Musical Instruments", "Guitars"),
        ("Musical Instruments", "Keyboards & Pianos"),
        ("Musical Instruments", "Drums & Percussion"),
        ("Musical Instruments", "Wind Instruments"),
        ("Musical Instruments", "Studio & Recording"),
]

BRANDS = [
    # Electronics
    ("Samsung", "South Korea"), ("Apple", "USA"), ("OnePlus", "China"),
    ("Xiaomi", "China"), ("Realme", "China"), ("Oppo", "China"),
    ("Vivo", "China"), ("Nokia", "Finland"), ("Motorola", "USA"),
    ("Sony", "Japan"), ("LG", "South Korea"), ("Panasonic", "Japan"),
    ("Philips", "Netherlands"), ("Bosch", "Germany"), ("Siemens", "Germany"),
    ("Dell", "USA"), ("HP", "USA"), ("Lenovo", "China"),
    ("Asus", "Taiwan"), ("Acer", "Taiwan"), ("MSI", "Taiwan"),
    ("Intel", "USA"), ("AMD", "USA"), ("Nvidia", "USA"),
    ("Canon", "Japan"), ("Nikon", "Japan"), ("Fujifilm", "Japan"),
    ("GoPro", "USA"), ("DJI", "China"),
    ("JBL", "USA"), ("Bose", "USA"), ("Boat", "India"),
    ("Noise", "India"), ("Skullcandy", "USA"), ("Sennheiser", "Germany"),
    ("Fitbit", "USA"), ("Garmin", "USA"),
    # Home Appliances
    ("Whirlpool", "USA"), ("Haier", "China"), ("Godrej", "India"),
    ("Voltas", "India"), ("Daikin", "Japan"), ("Blue Star", "India"),
    ("IFB", "India"), ("Bajaj", "India"), ("Prestige", "India"),
    ("Havells", "India"), ("Crompton", "India"), ("Usha", "India"),
    ("Butterfly", "India"), ("Morphy Richards", "UK"),
    ("Kent", "India"), ("Aquaguard", "India"),
    # Fashion
    ("Nike", "USA"), ("Adidas", "Germany"), ("Puma", "Germany"),
    ("Reebok", "UK"), ("Levi's", "USA"), ("Allen Solly", "India"),
    ("Raymond", "India"), ("Fabindia", "India"), ("Zara", "Spain"),
    ("H&M", "Sweden"), ("Tanishq", "India"), ("Titan", "India"),
    ("Fastrack", "India"), ("Wildcraft", "India"), ("Skybags", "India"),
    # Beauty
    ("L'Oréal", "France"), ("Lakme", "India"), ("Maybelline", "USA"),
    ("Dove", "UK"), ("Pantene", "USA"), ("Himalaya", "India"),
    ("Biotique", "India"), ("The Body Shop", "UK"), ("Gillette", "USA"),
    ("Philips", "Netherlands"),
    # Sports
    ("Yonex", "Japan"), ("Cosco", "India"), ("SG Cricket", "India"),
    ("Decathlon", "France"), ("Nivia", "India"),
    # Automotive
    ("Bosch", "Germany"), ("Minda", "India"), ("Varta", "Germany"),
    # Books
    ("Penguin Random House", "USA"), ("Oxford University Press", "UK"),
    # Baby
    ("Pampers", "USA"), ("Huggies", "USA"), ("Chicco", "Italy"),
]


SAMPLE_PRODUCTS = [
    # (category_name, brand_name, name, price, original_price, stock, rating, is_prime)
    ("Smartphones", "Samsung", "Samsung Galaxy S25 Ultra 5G (12GB/256GB)", 134999, 149999, 50, 4.5, True),
    ("Smartphones", "Apple",   "Apple iPhone 16 Pro Max (256GB) – Natural Titanium", 159900, 164900, 30, 4.8, True),
    ("Smartphones", "OnePlus", "OnePlus 13 5G (16GB/512GB) – Midnight Ocean", 69999, 74999, 80, 4.4, True),
    ("Smartphones", "Xiaomi",  "Xiaomi 14 Ultra 5G (16GB/512GB)", 99999, 109999, 60, 4.3, True),
    ("Smartphones", "Realme",  "Realme GT 7 Pro 5G (12GB/256GB)", 44999, 49999, 100, 4.2, False),
    ("Laptops",     "Dell",    "Dell XPS 15 9560 – Intel i9, 32GB RAM, 1TB SSD", 189990, 209990, 20, 4.6, True),
    ("Laptops",     "Apple",   "Apple MacBook Air M3 (16GB/512GB) – Midnight", 134900, 139900, 25, 4.9, True),
    ("Laptops",     "HP",      "HP Pavilion 15 – AMD Ryzen 7, 16GB, 512GB SSD", 74999, 85000, 40, 4.3, True),
    ("Laptops",     "Lenovo",  "Lenovo ThinkPad X1 Carbon – i7, 16GB, 1TB", 149990, 169990, 15, 4.7, True),
    ("Laptops",     "Asus",    "Asus ROG Zephyrus G14 – Ryzen 9, RTX 4070", 139990, 154990, 20, 4.5, True),
    ("Televisions", "Samsung", "Samsung 65\" QLED 4K Smart TV (QN65Q80D)", 134990, 149990, 10, 4.6, True),
    ("Televisions", "LG",      "LG 55\" OLED evo C4 4K Smart TV", 189990, 209990, 8,  4.8, True),
    ("Televisions", "Sony",    "Sony Bravia 75\" X90L 4K HDR Google TV", 219990, 239990, 5,  4.7, True),
    ("Mixer Grinder & Blenders", "Bajaj",   "Bajaj Rex 500W Mixer Grinder (3 Jars)", 1999,  2499, 200, 4.2, False),
    ("Mixer Grinder & Blenders", "Prestige","Prestige Iris 750W Mixer Grinder (4 Jars)", 2799, 3299, 150, 4.4, True),
    ("Microwave Ovens", "LG",   "LG 32L Convection Microwave Oven (MC3286BRUM)", 19990, 22990, 40, 4.5, True),
    ("Microwave Ovens", "Samsung", "Samsung 28L Convection Microwave (MC28H5025VK)", 15990, 18500, 55, 4.3, True),
    ("OTG & Air Fryers", "Philips", "Philips HD9270 XXL Digital Air Fryer (7L)", 11999, 14999, 80, 4.6, True),
    ("Split ACs",   "Daikin",  "Daikin 1.5 Ton 5 Star Inverter Split AC (FTKF50U)", 44990, 49990, 25, 4.5, True),
    ("Split ACs",   "Voltas",  "Voltas 1.5 Ton 3 Star Inverter Split AC (183V Vectra Prism)", 36990, 41000, 30, 4.3, True),
    ("Double Door Refrigerators", "Samsung", "Samsung 653L French Door Refrigerator (RF65A977FSR)", 109990, 124990, 10, 4.6, True),
    ("Front Load Washing Machines", "LG", "LG 9 Kg Front Load Washing Machine (FHP1409Z5W)", 59990, 65990, 20, 4.5, True),
    ("T-Shirts & Polos", "Nike", "Nike Dri-FIT Men's Training T-Shirt", 1799, 2499, 300, 4.3, False),
    ("Jeans & Trousers", "Levi's", "Levi's Men's 511 Slim Fit Jeans", 2999, 3999, 250, 4.4, True),
    ("Sarees",  "Fabindia",  "Fabindia Silk Cotton Handloom Saree – Indigo", 3990, 4990, 50, 4.5, True),
    ("Sports Shoes", "Adidas", "Adidas Ultraboost 22 Running Shoes", 14999, 17999, 100, 4.6, True),
    ("Sports Shoes", "Nike",   "Nike Air Zoom Pegasus 40 Running Shoes", 11995, 13995, 90,  4.5, True),
    ("Backpacks", "Wildcraft",  "Wildcraft 45L Trident Backpack – Grey", 2299, 2999, 120, 4.3, False),
    ("Dumbbells & Weights", "Decathlon", "Decathlon Rubber Hex Dumbbell Set 2-10kg", 3999, 4999, 60, 4.5, True),
    ("Yoga Mats", "Decathlon", "Decathlon Domyos 7mm Non-Slip Yoga Mat", 999, 1499, 150, 4.4, False),
    ("Trimmers & Shavers", "Philips", "Philips OneBlade QP2525 Electric Trimmer", 2499, 2999, 200, 4.4, True),
    ("Shampoos", "Dove",        "Dove Intense Repair Shampoo 650ml", 349, 399, 500, 4.3, False),
    ("Hair Dryers", "Philips",  "Philips BHD356 Thermo Protect Hairdryer 2300W", 3295, 3995, 80, 4.4, True),
    ("Smartwatches & Bands", "Samsung", "Samsung Galaxy Watch 7 44mm – Green", 29999, 34999, 60, 4.5, True),
    ("Smartwatches & Bands", "Apple",   "Apple Watch Series 10 (GPS, 46mm)", 44900, 46900, 40, 4.8, True),
    ("Smartwatches & Bands", "Noise",   "Noise ColorFit Pro 5 Smart Watch", 2999, 4999, 200, 4.1, False),
    ("Bluetooth Speakers", "JBL",  "JBL Flip 6 Portable Waterproof Speaker", 9999, 11999, 100, 4.6, True),
    ("Bluetooth Speakers", "Boat",  "boAt Stone 1200F 32W Portable Speaker", 2999, 3999, 150, 4.2, False),
    ("Bluetooth Speakers", "Bose",  "Bose SoundLink Flex Bluetooth Speaker", 14399, 15990, 60, 4.7, True),
    ("Power Banks", "Xiaomi",   "Xiaomi 33W Power Bank 20000mAh", 1699, 2299, 300, 4.4, True),
    ("Power Banks", "Boat",     "boAt PowerHeart 15000 mAh Power Bank", 1299, 1799, 250, 4.2, False),
    ("DSLR Cameras", "Canon",  "Canon EOS 1500D DSLR Camera (18-55mm Lens)", 34990, 39990, 15, 4.5, True),
    ("DSLR Cameras", "Nikon",  "Nikon D3500 DSLR Camera with AF-P 18-55mm Lens", 36990, 41990, 10, 4.6, True),
    ("Action Cameras", "GoPro","GoPro HERO13 Black Action Camera", 44990, 49990, 25, 4.7, True),
    ("Pressure Cookers", "Prestige", "Prestige Popular Aluminium Pressure Cooker 5L", 1095, 1399, 300, 4.5, False),
    ("Non-stick Pans", "Prestige", "Prestige Omega Select Plus Non-Stick Fry Pan 24cm", 849, 1099, 200, 4.3, False),
    ("Water Purifiers", "Kent", "KENT Grand+ 11 L RO+UF Water Purifier", 15490, 17990, 40, 4.5, True),
    ("Water Purifiers", "Aquaguard", "Aquaguard Aura 7L UV+UF Water Purifier", 11999, 13999, 50, 4.3, True),
    ("Board Games & Puzzles", "Hasbro", "Hasbro Monopoly Classic Board Game", 799, 999, 100, 4.5, False),
    ("Dash Cameras", "Minda", "Minda M20 1080P Dash Camera with Night Vision", 3999, 5499, 60, 4.2, False),
]


class Command(BaseCommand):
    help = 'Seed database with Amazon-style categories, brands and sample products'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('🌱 Seeding data...'))

        # Build categories
        cat_map = {}  # name → Category instance

        for parent_name, child_name in CATEGORIES:
            slug_base = slugify(child_name)
            slug = slug_base
            counter = 1
            while Category.objects.filter(slug=slug).exclude(pk=cat_map.get(child_name, {}).pk if isinstance(cat_map.get(child_name), Category) else None).exists():
                slug = f"{slug_base}-{counter}"
                counter += 1

            parent_obj = cat_map.get(parent_name) if parent_name else None
            obj, created = Category.objects.get_or_create(
                name=child_name,
                defaults={'slug': slug, 'parent': parent_obj}
            )
            if not created and parent_obj and obj.parent != parent_obj:
                obj.parent = parent_obj
                obj.save()
            cat_map[child_name] = obj
            if created:
                self.stdout.write(f"  📁 Category: {obj}")

        self.stdout.write(self.style.SUCCESS(f'✅ {Category.objects.count()} categories ready'))

        # Build brands
        brand_map = {}
        for name, country in BRANDS:
            obj, created = Brand.objects.get_or_create(
                name=name,
                defaults={'country': country, 'slug': slugify(name)}
            )
            brand_map[name] = obj
            if created:
                self.stdout.write(f"  🏷️  Brand: {name}")

        self.stdout.write(self.style.SUCCESS(f'✅ {Brand.objects.count()} brands ready'))

        # Build sample products
        created_count = 0
        for cat_name, brand_name, pname, price, orig_price, stock, rating, is_prime in SAMPLE_PRODUCTS:
            cat   = cat_map.get(cat_name)
            brand = brand_map.get(brand_name)
            if not cat:
                self.stdout.write(self.style.WARNING(f'  ⚠️  Category not found: {cat_name}'))
                continue

            discount = int(((orig_price - price) / orig_price) * 100)
            obj, created = Product.objects.get_or_create(
                name=pname,
                defaults={
                    'category':         cat,
                    'brand':            brand,
                    'price':            decimal.Decimal(price),
                    'original_price':   decimal.Decimal(orig_price),
                    'discount_percent': discount,
                    'stock':            stock,
                    'rating':           decimal.Decimal(str(rating)),
                    'review_count':     random.randint(50, 5000),
                    'is_prime':         is_prime,
                    'is_available':     True,
                    'free_shipping':    is_prime,
                    'condition':        'new',
                    'description':      f'Genuine {brand_name} product. High quality and reliable.',
                }
            )
            if created:
                created_count += 1

        self.stdout.write(self.style.SUCCESS(
            f'✅ {created_count} sample products created  ({Product.objects.count()} total)'
        ))
        self.stdout.write(self.style.SUCCESS('🎉 Done! Open /admin to see everything.'))

