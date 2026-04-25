const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Product = require("../models/Product");

dotenv.config();

const DUMMY_DOMAIN = "dummy.budgetfree.local";
const REMOTE_SEED_FLAG = "ALLOW_REMOTE_SEED";
const DUMMY_BATCHES = [
  { label: "Core", priceDelta: 0, ratingDelta: 0 },
  { label: "Plus", priceDelta: 350, ratingDelta: 0.1 },
  { label: "Max", priceDelta: 700, ratingDelta: 0.2 },
];
const EYE_TIE_VARIANTS = [
  {
    brand: "RayZone",
    line: "Blue Cut Vision",
    price: 1199,
    rating: 4.2,
    feature: "Blue light filtering lenses",
  },
  {
    brand: "Urban Frame",
    line: "Workday Clear",
    price: 1499,
    rating: 4.1,
    feature: "Lightweight full-rim frame",
  },
  {
    brand: "OptiWear",
    line: "Screen Comfort",
    price: 1799,
    rating: 4.4,
    feature: "Anti-glare transparent lens",
  },
  {
    brand: "VisionCraft",
    line: "Night Reader",
    price: 1599,
    rating: 4.0,
    feature: "Comfort fit temples",
  },
];
const CLOTHES_VARIANTS = [
  {
    brand: "CampusThread",
    line: "Everyday Hoodie",
    price: 1299,
    rating: 4.3,
    feature: "Soft brushed cotton blend",
  },
  {
    brand: "StreetForm",
    line: "Relaxed Joggers",
    price: 999,
    rating: 4.1,
    feature: "Tapered comfort fit",
  },
  {
    brand: "UrbanFold",
    line: "Oversized Tee",
    price: 699,
    rating: 4.0,
    feature: "Breathable daily wear fabric",
  },
  {
    brand: "ModeCraft",
    line: "Checked Shirt",
    price: 1199,
    rating: 4.2,
    feature: "Smart casual pattern",
  },
];
const LAPTOP_USE_CASES = [
  {
    label: "Students",
    description:
      "Built for classes, notes, browsing, assignments, and everyday student work.",
    feature: "Student-friendly workflow",
    pro: "Helpful for study sessions and online classes",
  },
  {
    label: "Coding",
    description:
      "Suitable for VS Code, browser tabs, terminal work, Python practice, and lightweight web development.",
    feature: "Coding-ready laptop setup",
    pro: "Comfortable for coding practice and daily development tasks",
  },
  {
    label: "Gaming",
    description:
      "Aimed at light gaming, esports titles, cloud gaming, and casual play after work or class.",
    feature: "Gaming-focused laptop profile",
    pro: "Handles entry-level gaming and casual entertainment better than a basic office laptop",
  },
];

const laptopVariants = [
  {
    brand: "Acer",
    line: "Aspire Student",
    processor: "Intel Celeron N4500",
    ram: "4GB RAM",
    storage: "128GB SSD",
    screen: "14-inch HD",
    price: 16999,
    rating: 4.1,
  },
  {
    brand: "Lenovo",
    line: "IdeaPad Learn",
    processor: "Intel Celeron N4020",
    ram: "8GB RAM",
    storage: "256GB SSD",
    screen: "15.6-inch HD",
    price: 19999,
    rating: 4.4,
  },
  {
    brand: "HP",
    line: "Notebook Campus",
    processor: "AMD 3020e",
    ram: "8GB RAM",
    storage: "256GB SSD",
    screen: "14-inch anti-glare",
    price: 21499,
    rating: 4.2,
  },
  {
    brand: "ASUS",
    line: "VivoBook Scholar",
    processor: "Intel Pentium Silver",
    ram: "8GB RAM",
    storage: "512GB SSD",
    screen: "15.6-inch FHD",
    price: 24499,
    rating: 4.6,
  },
  {
    brand: "Avita",
    line: "Essential Study",
    processor: "Intel Celeron N5030",
    ram: "8GB RAM",
    storage: "256GB SSD",
    screen: "14-inch FHD",
    price: 18999,
    rating: 4.0,
  },
  {
    brand: "Chuwi",
    line: "HeroBook Student",
    processor: "Intel Jasper Lake N5100",
    ram: "8GB RAM",
    storage: "256GB SSD",
    screen: "14.1-inch FHD",
    price: 22999,
    rating: 4.3,
  },
  {
    brand: "Primebook",
    line: "WiFi Learning",
    processor: "MediaTek Kompanio 520",
    ram: "4GB RAM",
    storage: "128GB UFS",
    screen: "11.6-inch HD",
    price: 16499,
    rating: 3.9,
  },
  {
    brand: "Lenovo",
    line: "Slim Student",
    processor: "AMD Athlon Silver 3050U",
    ram: "8GB RAM",
    storage: "256GB SSD",
    screen: "14-inch FHD",
    price: 23999,
    rating: 4.5,
  },
  {
    brand: "Acer",
    line: "Travel Learn",
    processor: "Intel N100",
    ram: "8GB RAM",
    storage: "512GB SSD",
    screen: "14-inch slim bezel",
    price: 24999,
    rating: 4.7,
  },
  {
    brand: "HP",
    line: "Everyday Student",
    processor: "Intel Celeron N4120",
    ram: "4GB RAM",
    storage: "256GB SSD",
    screen: "15.6-inch HD",
    price: 17999,
    rating: 4.1,
  },
  {
    brand: "ASUS",
    line: "BR StudyBook",
    processor: "Intel N200",
    ram: "8GB RAM",
    storage: "256GB SSD",
    screen: "14-inch FHD",
    price: 23499,
    rating: 4.4,
  },
  {
    brand: "Lenovo",
    line: "ClassMate Flex",
    processor: "Intel Celeron N4500",
    ram: "8GB RAM",
    storage: "128GB SSD",
    screen: "11.6-inch compact",
    price: 17499,
    rating: 4.0,
  },
  {
    brand: "Acer",
    line: "Swift Student",
    processor: "AMD Athlon 7120U",
    ram: "8GB LPDDR5",
    storage: "512GB SSD",
    screen: "14-inch FHD IPS",
    price: 24949,
    rating: 4.6,
  },
  {
    brand: "Primebook",
    line: "4G Campus",
    processor: "MediaTek MT8788",
    ram: "4GB RAM",
    storage: "64GB eMMC",
    screen: "11.6-inch HD",
    price: 15999,
    rating: 3.8,
  },
  {
    brand: "Avita",
    line: "Liber StudyGo",
    processor: "Intel Celeron N5100",
    ram: "8GB RAM",
    storage: "512GB SSD",
    screen: "14-inch FHD",
    price: 21999,
    rating: 4.2,
  },
  {
    brand: "HP",
    line: "StudyMate 15",
    processor: "AMD 3020e",
    ram: "8GB RAM",
    storage: "512GB SSD",
    screen: "15.6-inch micro-edge",
    price: 24799,
    rating: 4.5,
  },
  {
    brand: "ASUS",
    line: "GoBook Campus",
    processor: "Intel Celeron N4500",
    ram: "4GB RAM",
    storage: "256GB SSD",
    screen: "14-inch HD",
    price: 18249,
    rating: 4.1,
  },
  {
    brand: "Lenovo",
    line: "IdeaPad Note",
    processor: "AMD Athlon Silver 3050U",
    ram: "8GB RAM",
    storage: "512GB SSD",
    screen: "15.6-inch anti-glare",
    price: 24990,
    rating: 4.6,
  },
];

const phoneVariants = [
  {
    brand: "Redmi",
    line: "Value Note 5G",
    price: 13999,
    rating: 4.4,
    memory: "6GB + 128GB",
    camera: "50MP AI camera",
    battery: "5000mAh battery",
  },
  {
    brand: "Realme",
    line: "Narzo Boost",
    price: 12499,
    rating: 4.2,
    memory: "8GB + 128GB",
    camera: "64MP street camera",
    battery: "5000mAh fast charging",
  },
  {
    brand: "Motorola",
    line: "G Play Lite",
    price: 14999,
    rating: 4.3,
    memory: "6GB + 128GB",
    camera: "50MP quad pixel",
    battery: "6000mAh battery",
  },
  {
    brand: "Samsung",
    line: "Galaxy Budget",
    price: 15499,
    rating: 4.1,
    memory: "6GB + 128GB",
    camera: "48MP OIS camera",
    battery: "5000mAh battery",
  },
  {
    brand: "Poco",
    line: "Speed Core",
    price: 15999,
    rating: 4.5,
    memory: "8GB + 256GB",
    camera: "64MP dual camera",
    battery: "Turbo 5000mAh",
  },
  {
    brand: "Infinix",
    line: "Note Smart",
    price: 11999,
    rating: 4.0,
    memory: "8GB + 128GB",
    camera: "108MP main camera",
    battery: "5000mAh battery",
  },
  {
    brand: "Lava",
    line: "Agni Mini",
    price: 12999,
    rating: 4.0,
    memory: "6GB + 128GB",
    camera: "50MP primary lens",
    battery: "5000mAh battery",
  },
  {
    brand: "Nokia",
    line: "G Campus",
    price: 10999,
    rating: 3.9,
    memory: "4GB + 128GB",
    camera: "50MP triple camera",
    battery: "5050mAh battery",
  },
];

const tabletVariants = [
  {
    brand: "Lenovo",
    line: "Tab Study 10",
    price: 17999,
    rating: 4.3,
    display: "10.1-inch FHD",
    memory: "4GB + 128GB",
  },
  {
    brand: "Realme",
    line: "Pad Classroom",
    price: 15999,
    rating: 4.2,
    display: "10.4-inch 2K",
    memory: "4GB + 64GB",
  },
  {
    brand: "Samsung",
    line: "Galaxy Tab Lite",
    price: 18999,
    rating: 4.4,
    display: "10.5-inch TFT",
    memory: "6GB + 128GB",
  },
  {
    brand: "Honor",
    line: "Pad Learn",
    price: 16499,
    rating: 4.1,
    display: "11-inch 2K",
    memory: "6GB + 128GB",
  },
  {
    brand: "Xiaomi",
    line: "Pad Go Student",
    price: 19999,
    rating: 4.5,
    display: "11-inch 2.4K",
    memory: "8GB + 128GB",
  },
  {
    brand: "Nokia",
    line: "Tab Reading",
    price: 14999,
    rating: 3.9,
    display: "10.3-inch HD",
    memory: "4GB + 64GB",
  },
];

const audioVariants = [
  {
    brand: "Boat",
    line: "Airdopes Study",
    price: 1999,
    rating: 4.2,
    battery: "45-hour playback",
  },
  {
    brand: "OnePlus",
    line: "Nord Buds Campus",
    price: 2499,
    rating: 4.4,
    battery: "30-hour playback",
  },
  {
    brand: "JBL",
    line: "Tune Mini",
    price: 2999,
    rating: 4.5,
    battery: "32-hour playback",
  },
  {
    brand: "Realme",
    line: "Buds Air Learn",
    price: 1799,
    rating: 4.1,
    battery: "38-hour playback",
  },
  {
    brand: "Noise",
    line: "Buds VS Class",
    price: 1499,
    rating: 4.0,
    battery: "40-hour playback",
  },
  {
    brand: "Boult",
    line: "Omega StudyPods",
    price: 1699,
    rating: 4.2,
    battery: "50-hour playback",
  },
];

const electronicsVariants = [
  {
    brand: "Logitech",
    line: "Student Mouse M221",
    price: 799,
    rating: 4.5,
    feature: "Silent clicks",
  },
  {
    brand: "HP",
    line: "Campus Backpack 15",
    price: 1299,
    rating: 4.3,
    feature: "Padded laptop compartment",
  },
  {
    brand: "Portronics",
    line: "DeskMate Laptop Stand",
    price: 1499,
    rating: 4.4,
    feature: "Adjustable alloy stand",
  },
  {
    brand: "Ambrane",
    line: "PowerMax 20000",
    price: 1799,
    rating: 4.2,
    feature: "20,000mAh power bank",
  },
  {
    brand: "Cosmic Byte",
    line: "Typing Keyboard",
    price: 999,
    rating: 4.1,
    feature: "Full-size wired keyboard",
  },
  {
    brand: "TP-Link",
    line: "Study Router AX1500",
    price: 2499,
    rating: 4.4,
    feature: "Dual-band Wi-Fi 6",
  },
];

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const buildAffiliateLink = (slug) => `https://${DUMMY_DOMAIN}/products/${slug}`;

const buildImage = (seed) =>
  `https://picsum.photos/seed/${seed}/800/600`;

const createVariantCopies = (items, createProduct) =>
  items.flatMap((item, index) =>
    DUMMY_BATCHES.map((batch, batchIndex) =>
      createProduct(item, index, batch, batchIndex),
    ),
  );

const clampRating = (rating) =>
  Math.max(3.5, Math.min(4.9, Number(rating.toFixed(1))));

const createLaptopProducts = () =>
  createVariantCopies(laptopVariants, (item, index, batch, batchIndex) => {
    const useCase = LAPTOP_USE_CASES[(index + batchIndex) % LAPTOP_USE_CASES.length];
    const slug = slugify(
      `${item.brand}-${item.line}-${item.processor}-${useCase.label}-${batch.label}-${index + 1}`,
    );
    return {
      title: `${item.brand} ${item.line} ${batch.label} ${item.processor} Laptop for ${useCase.label}`,
      description: `Dummy laptop test product. Includes ${item.ram}, ${item.storage}, and a ${item.screen} display. ${useCase.description} ${batch.label} edition adds more variety for search and filter testing.`,
      category: "Laptops",
      price: item.price + batch.priceDelta,
      affiliateLink: buildAffiliateLink(slug),
      images: [buildImage(`student-laptop-${index + 1}-${batchIndex + 1}`)],
      features: [
        item.processor,
        item.ram,
        item.storage,
        item.screen,
        "Wi-Fi and Bluetooth support",
        `${batch.label} configuration`,
        useCase.feature,
      ],
      pros: [
        useCase.pro,
        "Suitable for web browsing and daily use",
        "Portable for daily carry",
      ],
      cons: [
        useCase.label === "Gaming"
          ? "Still entry-level for modern AAA games"
          : "Not designed for heavy AAA gaming",
        "Basic integrated graphics",
      ],
      rating: clampRating(item.rating + batch.ratingDelta),
    };
  });

const createPhoneProducts = () =>
  createVariantCopies(phoneVariants, (item, index, batch, batchIndex) => {
    const slug = slugify(`${item.brand}-${item.line}-${batch.label}-${index + 1}`);
    return {
      title: `${item.brand} ${item.line} ${batch.label} Smartphone`,
      description: `Dummy phone listing for catalog and search testing with ${item.memory}, ${item.camera}, and ${item.battery}. ${batch.label} edition helps create a richer storefront.`,
      category: "Mobiles",
      price: item.price + batch.priceDelta,
      affiliateLink: buildAffiliateLink(slug),
      images: [buildImage(`phone-${index + 1}-${batchIndex + 1}`)],
      features: [item.memory, item.camera, item.battery, "Dual SIM 5G", `${batch.label} model`],
      pros: ["Good value pricing", "Strong battery life", "Reliable daily performance"],
      cons: ["Mid-range low-light camera", "Plastic frame"],
      rating: clampRating(item.rating + batch.ratingDelta),
    };
  });

const createTabletProducts = () =>
  createVariantCopies(tabletVariants, (item, index, batch, batchIndex) => {
    const slug = slugify(`${item.brand}-${item.line}-${batch.label}-${index + 1}`);
    return {
      title: `${item.brand} ${item.line} ${batch.label} Tablet`,
      description: `Dummy tablet product for browsing, note-taking, and streaming tests with ${item.display} and ${item.memory}. ${batch.label} edition expands the test catalog.`,
      category: "Electronics",
      price: item.price + batch.priceDelta,
      affiliateLink: buildAffiliateLink(slug),
      images: [buildImage(`tablet-${index + 1}-${batchIndex + 1}`)],
      features: [item.display, item.memory, "Stereo speakers", "USB-C charging", `${batch.label} configuration`],
      pros: ["Large display for study content", "Portable media device", "Good for online learning"],
      cons: ["Basic cameras", "Limited multitasking on entry variants"],
      rating: clampRating(item.rating + batch.ratingDelta),
    };
  });

const createAudioProducts = () =>
  createVariantCopies(audioVariants, (item, index, batch, batchIndex) => {
    const slug = slugify(`${item.brand}-${item.line}-${batch.label}-${index + 1}`);
    return {
      title: `${item.brand} ${item.line} ${batch.label} Wireless Earbuds`,
      description: `Dummy audio product for UI testing with ENC calling support and ${item.battery}. ${batch.label} edition gives search more varied phrases to match.`,
      category: "Electronics",
      price: item.price + Math.round(batch.priceDelta / 4),
      affiliateLink: buildAffiliateLink(slug),
      images: [buildImage(`audio-${index + 1}-${batchIndex + 1}`)],
      features: [item.battery, "Bluetooth 5.3", "Touch controls", "Instant pairing", `${batch.label} variant`],
      pros: ["Affordable audio upgrade", "Compact charging case", "Good for commuting"],
      cons: ["Average microphone in noisy spaces", "No wireless charging"],
      rating: clampRating(item.rating + batch.ratingDelta),
    };
  });

const createElectronicsProducts = () =>
  createVariantCopies(electronicsVariants, (item, index, batch, batchIndex) => {
    const slug = slugify(`${item.brand}-${item.line}-${batch.label}-${index + 1}`);
    return {
      title: `${item.brand} ${item.line} ${batch.label}`,
      description: `Dummy accessory product used to test category browsing and product cards. Includes ${item.feature}. ${batch.label} edition helps build a larger browsing dataset.`,
      category: "Electronics",
      price: item.price + Math.round(batch.priceDelta / 5),
      affiliateLink: buildAffiliateLink(slug),
      images: [buildImage(`accessory-${index + 1}-${batchIndex + 1}`)],
      features: [item.feature, "Budget-friendly", "Easy to add to student setup", `${batch.label} version`],
      pros: ["Useful everyday accessory", "Compact and practical", "Good entry pricing"],
      cons: ["Basic packaging", "Limited premium materials"],
      rating: clampRating(item.rating + batch.ratingDelta),
    };
  });

const createEyeTieProducts = () =>
  createVariantCopies(EYE_TIE_VARIANTS, (item, index, batch, batchIndex) => {
    const slug = slugify(`${item.brand}-${item.line}-${batch.label}-${index + 1}`);
    return {
      title: `${item.brand} ${item.line} ${batch.label} Eye-tie`,
      description: `Dummy eye-tie product for category browsing tests. Includes ${item.feature} and a ${batch.label.toLowerCase()} style option.`,
      category: "Eye-tie",
      price: item.price + Math.round(batch.priceDelta / 4),
      affiliateLink: buildAffiliateLink(slug),
      images: [buildImage(`eyetie-${index + 1}-${batchIndex + 1}`)],
      features: [item.feature, "Comfortable daily wear", `${batch.label} frame style`],
      pros: ["Useful for screen-heavy days", "Lightweight fit", "Easy style upgrade"],
      cons: ["No prescription lens included", "Basic carry case"],
      rating: clampRating(item.rating + batch.ratingDelta),
    };
  });

const createClothesProducts = () =>
  createVariantCopies(CLOTHES_VARIANTS, (item, index, batch, batchIndex) => {
    const slug = slugify(`${item.brand}-${item.line}-${batch.label}-${index + 1}`);
    return {
      title: `${item.brand} ${item.line} ${batch.label}`,
      description: `Dummy clothes product for storefront testing. Includes ${item.feature} and a ${batch.label.toLowerCase()} edition for richer category coverage.`,
      category: "Clothes",
      price: item.price + Math.round(batch.priceDelta / 4),
      affiliateLink: buildAffiliateLink(slug),
      images: [buildImage(`clothes-${index + 1}-${batchIndex + 1}`)],
      features: [item.feature, "Casual daily wear", `${batch.label} edition`],
      pros: ["Comfortable everyday fit", "Good casual styling", "Budget-friendly wardrobe option"],
      cons: ["Basic fabric finish", "Color choices may vary"],
      rating: clampRating(item.rating + batch.ratingDelta),
    };
  });

const dummyProducts = [
  ...createLaptopProducts(),
  ...createPhoneProducts(),
  ...createTabletProducts(),
  ...createAudioProducts(),
  ...createElectronicsProducts(),
  ...createEyeTieProducts(),
  ...createClothesProducts(),
];

const isRemoteMongoUri = (mongoUri) => {
  if (!mongoUri) {
    return false;
  }

  return !/localhost|127\.0\.0\.1/i.test(mongoUri);
};

const ensureSafeTarget = () => {
  const mongoUri = process.env.MONGO_URI || "";

  if (!mongoUri) {
    throw new Error("MONGO_URI is missing. Point the script to a dev or test database first.");
  }

  if (isRemoteMongoUri(mongoUri) && process.env[REMOTE_SEED_FLAG] !== "true") {
    throw new Error(
      `Remote MongoDB detected. Set ${REMOTE_SEED_FLAG}=true only when you intentionally want to seed a non-local database.`,
    );
  }
};

const seedDummyProducts = async () => {
  ensureSafeTarget();
  await connectDB();

  const dummyFilter = {
    affiliateLink: { $regex: DUMMY_DOMAIN.replace(".", "\\."), $options: "i" },
  };

  const deleted = await Product.deleteMany(dummyFilter);
  const inserted = await Product.insertMany(dummyProducts);

  console.log(
    `Dummy product seed complete. Removed ${deleted.deletedCount} old dummy products and inserted ${inserted.length} fresh products.`,
  );
};

seedDummyProducts()
  .catch((error) => {
    console.error("Dummy product seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
