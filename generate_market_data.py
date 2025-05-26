
import csv
import random
from datetime import datetime, timedelta

random.seed(2025)

regions = [
    ("Metro Manila", "NCR", ["Quezon City", "Makati", "Pasig", "Taguig"]),
    ("Cebu", "Central Visayas", ["Cebu City", "Mandaue"]),
    ("Davao", "Davao Region", ["Davao City"]),
    ("Pampanga", "Central Luzon", ["Angeles", "San Fernando"]),
    ("Batangas", "CALABARZON", ["Batangas City"]),
    ("Bicol", "Bicol Region", ["Naga"]),
    ("Ilocos", "Ilocos Region", ["Laoag"]),
    ("Negros Occidental", "Western Visayas", ["Bacolod"]),
    ("Baguio", "Cordillera", ["Baguio City"]),
    ("Laguna", "CALABARZON", ["San Pablo"])
]

barangays = ["Bagumbayan", "Poblacion", "Lahug", "Buhangin", "Pallocan West", "Mandalagan", "Bgy 17", "Balibago", "Ugong", "Abella"]

tbwa_brands = [
    ("Alaska Milk Corporation", "Dairy", ["Alaska Evaporated Milk", "Alaska Condensed Milk", "Alaska Powdered Milk", "Krem-Top (Coffee Creamer)", "Alpine (Evaporated & Condensed Milk)", "Cow Bell (Powdered Milk)"]),
    ("Oishi", "Snacks", ["Oishi Prawn Crackers", "Oishi Pillows", "Oishi Marty's", "Oishi Ridges", "Oishi Bread Pan", "Gourmet Picks", "Crispy Patata", "Smart C+ (Vitamin Drinks)", "Oaties", "Hi-Ho", "Rinbee", "Deli Mex"]),
    ("Peerless", "Household", ["Champion (Detergent, Fabric Conditioner)", "Calla (Personal Care Products)", "Hana (Shampoo and Conditioner)", "Cyclone (Bleach)", "Pride (Dishwashing Liquid)", "Care Plus (Alcohol and Hand Sanitizer)"]),
    ("Del Monte Philippines", "Grocery", ["Del Monte Pineapple (Juice, Chunks, Slices)", "Del Monte Tomato Sauce & Ketchup", "Del Monte Spaghetti Sauce", "Del Monte Fruit Cocktail", "Del Monte Pasta", "S&W (Premium Fruit & Vegetable Products)", "Today's (Budget-Friendly Product Line)", "Fit 'n Right (Juice Drinks)"]),
    ("JTI", "Cigarettes", ["Winston", "Camel", "Mevius (formerly Mild Seven)", "LD", "Mighty", "Caster", "Glamour"]),
]

competitors = [
    ("Jack 'n Jill", "Snacks", ["Chippy", "Piattos", "Nova", "Roller Coaster"]),
    ("Regent", "Snacks", ["Cheese Ring"]),
    ("Leslie's", "Snacks", ["Clover Chips"]),
    ("Lucky Me!", "Noodles", ["Lucky Me! Pancit Canton", "Lucky Me! Beef Noodles"]),
    ("Zest-O", "Beverages", ["Zest-O Orange", "Zest-O Mango"]),
    ("Coca-Cola", "Beverages", ["Coke", "Sprite", "Royal"]),
    ("Birch Tree", "Dairy", ["Birch Tree Milk"]),
    ("Surf", "Household", ["Surf Detergent"]),
    ("Downy", "Household", ["Downy Fabric Softener"]),
    ("Palmolive", "Personal Care", ["Palmolive Shampoo"]),
    ("Marlboro", "Cigarettes", ["Marlboro Red", "Marlboro Lights"]),
    ("Hope", "Cigarettes", ["Hope"]),
    ("Fortune", "Cigarettes", ["Fortune"]),
    ("Marvels", "Cigarettes", ["Marvels"]),
]

all_brands = tbwa_brands + competitors

# Generate brands/SKUs
brands = []
skus = []
brand_id_map = {}
sku_id_map = {}
brand_id = 1
sku_id = 1
for company, category, sku_list in all_brands:
    brands.append((brand_id, company, category))
    brand_id_map[company] = brand_id
    for sku in sku_list:
        skus.append((sku_id, sku, brand_id, category))
        sku_id_map[sku] = sku_id
        sku_id += 1
    brand_id += 1

# Generate regions, provinces, cities, barangays
region_data = []
province_data = []
city_data = []
barangay_data = []
store_data = []

region_id = 1
province_id = 1
city_id = 1
barangay_id = 1
store_id = 1

for region_name, prov_name, cities in regions:
    # Add region
    region_data.append((f"R{region_id:02d}", region_name))
    current_region_id = f"R{region_id:02d}"
    
    # Add province
    province_data.append((f"P{province_id:02d}", prov_name, current_region_id))
    current_province_id = f"P{province_id:02d}"
    
    for city in cities:
        # Add city
        city_data.append((f"C{city_id:03d}", city, current_province_id))
        current_city_id = f"C{city_id:03d}"
        
        # Add barangays for this city
        for barangay in random.sample(barangays, min(3, len(barangays))):
            barangay_data.append((f"B{barangay_id:04d}", barangay, current_city_id, 
                                round(random.uniform(14.0, 15.0), 6), 
                                round(random.uniform(120.0, 122.0), 6)))
            current_barangay_id = f"B{barangay_id:04d}"
            
            # Add stores for this barangay
            for i in range(random.randint(1, 2)):
                store_name = f"{random.choice(['SM', 'Robinsons', '7-Eleven', 'Shopwise', 'Puregold', 'Landers', 'SaveMore'])} {city}"
                store_data.append((f"S{store_id:03d}", store_name, current_barangay_id, 
                                 f"{store_name} Address", 
                                 random.choice(["Small", "Medium", "Large"]),
                                 round(random.uniform(14.0, 15.0), 6), 
                                 round(random.uniform(120.0, 122.0), 6)))
                store_id += 1
            
            barangay_id += 1
        city_id += 1
    province_id += 1
    region_id += 1

# Generate customers
customers = []
for i in range(1, 201):
    random_barangay = random.choice(barangay_data)
    customers.append((f"CUST{i:04d}", random.choice(["Male", "Female"]), 
                     random.randint(18, 65), random_barangay[0], 
                     f"DEVICE{i:04d}"))

# Generate 300 transactions (spanning 3 months, 10 regions)
transactions = []
transaction_items = []
substitution_events = []

dt0 = datetime(2025, 1, 1)
transaction_id = 1
item_id = 1
subs_id = 1

for i in range(300):
    # Transaction meta
    date = dt0 + timedelta(days=random.randint(0, 90))
    store = random.choice(store_data)
    customer = random.choice(customers)
    n_items = random.randint(1, 4)
    this_txn_items = []
    basket_value = 0
    
    for n in range(n_items):
        sku = random.choice(skus)
        qty = random.randint(1, 5)
        price = round(random.uniform(18, 130), 2)
        total = qty * price
        transaction_items.append((
            f"TI{item_id:05d}", f"TXN{transaction_id:05d}", f"SKU{sku[0]:03d}", qty, price, random.choice([True, False])
        ))
        this_txn_items.append((sku, qty, price, item_id))
        item_id += 1
        basket_value += total

    transactions.append((
        f"TXN{transaction_id:05d}", store[0], customer[0], 
        date.strftime("%Y-%m-%d"), n_items, round(basket_value, 2)
    ))

    # Simulate substitution in ~10% of txns
    if random.random() < 0.1 and n_items > 1:
        # Randomly swap two different SKUs in this transaction
        orig, sub = random.sample(this_txn_items, 2)
        substitution_events.append((
            f"SUB{subs_id:04d}", f"TXN{transaction_id:05d}", f"SKU{orig[0][0]:03d}", f"SKU{sub[0][0]:03d}", 
            random.choice(["Out of Stock", "Promo", "Preference"]), 
            random.randint(1, 3), date.strftime("%Y-%m-%d")
        ))
        subs_id += 1

    transaction_id += 1

# Update SKUs to use proper IDs
skus_formatted = []
for i, (_, sku_name, brand_id, category) in enumerate(skus, 1):
    skus_formatted.append((f"SKU{i:03d}", sku_name, f"BR{brand_id:02d}", category, "Package"))

# Update brands to use proper IDs
brands_formatted = []
for i, (_, brand_name, category) in enumerate(brands, 1):
    brands_formatted.append((f"BR{i:02d}", brand_name, category, "Parent Company"))

# CSV Output Functions
def to_csv(rows, header, fname):
    with open(fname, "w", newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(rows)

# Output files
to_csv(region_data, ["RegionID", "RegionName"], "regions.csv")
to_csv(province_data, ["ProvinceID", "ProvinceName", "RegionID"], "provinces.csv")
to_csv(city_data, ["CityID", "CityName", "ProvinceID"], "cities.csv")
to_csv(barangay_data, ["BarangayID", "BarangayName", "CityID", "Latitude", "Longitude"], "barangays.csv")
to_csv(store_data, ["StoreID", "StoreName", "BarangayID", "Address", "Size", "Latitude", "Longitude"], "stores.csv")
to_csv(brands_formatted, ["BrandID", "BrandName", "Category", "ParentCompany"], "brands.csv")
to_csv(skus_formatted, ["SKUID", "SKUName", "BrandID", "Category", "PackageType"], "skus.csv")
to_csv(customers, ["CustomerID", "Gender", "Age", "BarangayID", "DeviceID"], "customers.csv")
to_csv(transactions, ["TransactionID", "StoreID", "CustomerID", "TransactionDate", "BasketSize", "TotalValue"], "transactions.csv")
to_csv(transaction_items, ["TransactionItemID", "TransactionID", "SKUID", "Quantity", "Price", "IsPromo"], "transaction_items.csv")
to_csv(substitution_events, ["SubstitutionID", "TransactionID", "OriginalSKUID", "SubstituteSKUID", "Reason", "Count", "Date"], "substitution_events.csv")

print("Market simulation data generated!")
print("Generated files:")
print("- regions.csv, provinces.csv, cities.csv, barangays.csv")
print("- stores.csv, brands.csv, skus.csv, customers.csv")
print("- transactions.csv, transaction_items.csv, substitution_events.csv")
print("\nData summary:")
print(f"- {len(region_data)} regions")
print(f"- {len(province_data)} provinces") 
print(f"- {len(city_data)} cities")
print(f"- {len(barangay_data)} barangays")
print(f"- {len(store_data)} stores")
print(f"- {len(brands_formatted)} brands")
print(f"- {len(skus_formatted)} SKUs")
print(f"- {len(customers)} customers")
print(f"- {len(transactions)} transactions")
print(f"- {len(transaction_items)} transaction items")
print(f"- {len(substitution_events)} substitution events")

# Generate SQL INSERT statements
def generate_sql_inserts():
    sql_statements = []
    
    # Regions
    sql_statements.append("-- Insert Regions")
    for region_id, region_name in region_data:
        sql_statements.append(f"INSERT INTO public.regions (region_id, region_name) VALUES ('{region_id}', '{region_name}');")
    
    # Provinces  
    sql_statements.append("\n-- Insert Provinces")
    for province_id, province_name, region_id in province_data:
        sql_statements.append(f"INSERT INTO public.provinces (province_id, province_name, region_id) VALUES ('{province_id}', '{province_name}', '{region_id}');")
    
    # Cities
    sql_statements.append("\n-- Insert Cities")
    for city_id, city_name, province_id in city_data:
        sql_statements.append(f"INSERT INTO public.cities (city_id, city_name, province_id) VALUES ('{city_id}', '{city_name}', '{province_id}');")
    
    # Barangays
    sql_statements.append("\n-- Insert Barangays")
    for barangay_id, barangay_name, city_id, lat, lng in barangay_data:
        sql_statements.append(f"INSERT INTO public.barangays (barangay_id, barangay_name, city_id, latitude, longitude) VALUES ('{barangay_id}', '{barangay_name}', '{city_id}', {lat}, {lng});")
    
    # Stores
    sql_statements.append("\n-- Insert Stores")
    for store_id, store_name, barangay_id, address, size, lat, lng in store_data:
        sql_statements.append(f"INSERT INTO public.stores (store_id, store_name, barangay_id, address, size, latitude, longitude) VALUES ('{store_id}', '{store_name}', '{barangay_id}', '{address}', '{size}', {lat}, {lng});")
    
    # Brands
    sql_statements.append("\n-- Insert Brands")
    for brand_id, brand_name, category, parent_company in brands_formatted:
        sql_statements.append(f"INSERT INTO public.brands (brand_id, brand_name, category, parent_company) VALUES ('{brand_id}', '{brand_name}', '{category}', '{parent_company}');")
    
    # SKUs
    sql_statements.append("\n-- Insert SKUs")
    for sku_id, sku_name, brand_id, category, package_type in skus_formatted:
        sql_statements.append(f"INSERT INTO public.skus (sku_id, sku_name, brand_id, category, package_type) VALUES ('{sku_id}', '{sku_name}', '{brand_id}', '{category}', '{package_type}');")
    
    # Customers
    sql_statements.append("\n-- Insert Customers")
    for customer_id, gender, age, barangay_id, device_id in customers:
        sql_statements.append(f"INSERT INTO public.customers (customer_id, gender, age, barangay_id, device_id) VALUES ('{customer_id}', '{gender}', {age}, '{barangay_id}', '{device_id}');")
    
    # Transactions
    sql_statements.append("\n-- Insert Transactions")
    for transaction_id, store_id, customer_id, transaction_date, basket_size, total_value in transactions:
        sql_statements.append(f"INSERT INTO public.transactions (transaction_id, store_id, customer_id, transaction_date, basket_size, total_value) VALUES ('{transaction_id}', '{store_id}', '{customer_id}', '{transaction_date}', {basket_size}, {total_value});")
    
    # Transaction Items
    sql_statements.append("\n-- Insert Transaction Items")
    for transaction_item_id, transaction_id, sku_id, quantity, price, is_promo in transaction_items:
        sql_statements.append(f"INSERT INTO public.transaction_items (transaction_item_id, transaction_id, sku_id, quantity, price, is_promo) VALUES ('{transaction_item_id}', '{transaction_id}', '{sku_id}', {quantity}, {price}, {is_promo});")
    
    # Substitution Events
    sql_statements.append("\n-- Insert Substitution Events")
    for substitution_id, transaction_id, original_sku_id, substitute_sku_id, reason, count, timestamp in substitution_events:
        sql_statements.append(f"INSERT INTO public.substitution_events (substitution_id, transaction_id, original_sku_id, substitute_sku_id, reason, count, timestamp) VALUES ('{substitution_id}', '{transaction_id}', '{original_sku_id}', '{substitute_sku_id}', '{reason}', {count}, '{timestamp}');")
    
    # Write to file
    with open("insert_market_data.sql", "w", encoding='utf-8') as f:
        f.write("\n".join(sql_statements))
    
    print("\nSQL INSERT statements generated: insert_market_data.sql")

generate_sql_inserts()
