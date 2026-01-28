const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
require('dotenv').config();

const shopLensProducts = [
  // --- FASHION (Clothing, Beauty) ---
  {
    name: 'Classic Aviator Sunglasses',
    description: 'Timeless metal frame aviators that suit almost any face shape. Perfect for adding a cool edge to your outfit.',
    price: 150.00,
    category: 'Clothing',
    brand: 'Ray-Ban',
    countInStock: 50,
    images: [{ public_id: 'aviator_1', url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80' }],
    tags: ['sunglasses', 'aviator', 'fashion', 'accessories', 'metal', 'gold', 'face-shape'],
    rating: 4.8,
    numReviews: 45
  },
  {
    name: 'Round Metal Glasses',
    description: 'Vintage-inspired round glasses. Ideal for softening square face shapes.',
    price: 120.00,
    category: 'Clothing',
    brand: 'Oliver Peoples',
    countInStock: 30,
    images: [{ public_id: 'round_glasses_1', url: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=500&q=80' }],
    tags: ['glasses', 'round', 'fashion', 'vintage', 'intellectual', 'accessories'],
    rating: 4.6,
    numReviews: 22
  },
  {
    name: 'Beige Trench Coat',
    description: 'A classic double-breasted trench coat. The ultimate staple for a polished look.',
    price: 250.00,
    category: 'Clothing',
    brand: 'Burberry',
    countInStock: 20,
    images: [{ public_id: 'trench_1', url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&q=80' }],
    tags: ['coat', 'trench', 'beige', 'outerwear', 'classic', 'fashion', 'winter'],
    rating: 4.9,
    numReviews: 10
  },
  {
    name: 'Navy Blue Crew Neck T-Shirt',
    description: 'Premium cotton t-shirt in deep navy. Compliments cool skin undertones perfectly.',
    price: 35.00,
    category: 'Clothing',
    brand: 'Uniqlo',
    countInStock: 100,
    images: [{ public_id: 'navy_tee_1', url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80' }],
    tags: ['t-shirt', 'navy', 'blue', 'casual', 'basics', 'fashion', 'cool-tone'],
    rating: 4.5,
    numReviews: 156
  },
  {
    name: 'Leather Biker Jacket',
    description: 'Genuine leather motorcycle jacket. Adds instant attitude and structure.',
    price: 300.00,
    category: 'Clothing',
    brand: 'AllSaints',
    countInStock: 15,
    images: [{ public_id: 'leather_jacket_1', url: 'https://images.unsplash.com/photo-1551028919-ac412800dfb3?w=500&q=80' }],
    tags: ['jacket', 'leather', 'black', 'edgy', 'biker', 'fashion', 'outerwear'],
    rating: 4.7,
    numReviews: 34
  },
  {
    name: 'Floral Summer Dress',
    description: 'Light and airy dress with a floral pattern. Perfect for warm weather.',
    price: 65.00,
    category: 'Clothing',
    brand: 'Reformation',
    countInStock: 40,
    images: [{ public_id: 'floral_dress_1', url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&q=80' }],
    tags: ['dress', 'floral', 'summer', 'fashion', 'casual', 'feminine'],
    rating: 4.4,
    numReviews: 28
  },
  {
    name: 'White Sneakers',
    description: 'Clean, minimalist white leather sneakers. Goes with absolutely everything.',
    price: 90.00,
    category: 'Clothing',
    brand: 'Common Projects',
    countInStock: 60,
    images: [{ public_id: 'white_sneakers_1', url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&q=80' }],
    tags: ['sneakers', 'shoes', 'white', 'minimalist', 'casual', 'footwear'],
    rating: 4.8,
    numReviews: 89
  },
  
  // --- DECOR (Home & Garden) ---
  {
    name: 'Industrial Floor Lamp',
    description: 'Metal floor lamp with a rustic finish. Adds character to any reading nook.',
    price: 120.00,
    category: 'Home & Garden',
    brand: 'West Elm',
    countInStock: 25,
    images: [{ public_id: 'industrial_lamp_1', url: 'https://images.unsplash.com/photo-1513506003011-3b03f84821a7?w=500&q=80' }],
    tags: ['lamp', 'lighting', 'industrial', 'metal', 'decor', 'living-room'],
    rating: 4.6,
    numReviews: 42
  },
  {
    name: 'Persian Style Rug',
    description: 'Richly patterned rug in warm reds and oranges. Anchors a room with texture.',
    price: 350.00,
    category: 'Home & Garden',
    brand: 'Ruggable',
    countInStock: 10,
    images: [{ public_id: 'persian_rug_1', url: 'https://images.unsplash.com/photo-1596230529625-7ee541fb33f7?w=500&q=80' }],
    tags: ['rug', 'carpet', 'persian', 'oriental', 'red', 'decor', 'texture', 'warmth'],
    rating: 4.9,
    numReviews: 18
  },
  {
    name: 'Minimalist Ceramic Vase',
    description: 'Matte white ceramic vase. Simple curves for a modern touch.',
    price: 45.00,
    category: 'Home & Garden',
    brand: 'H&M Home',
    countInStock: 80,
    images: [{ public_id: 'white_vase_1', url: 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=500&q=80' }],
    tags: ['vase', 'ceramic', 'white', 'minimalist', 'decor', 'modern', 'accessories'],
    rating: 4.5,
    numReviews: 33
  },
  {
    name: 'Velvet Throw Pillow',
    description: 'Luxurious emerald green velvet pillow. Adds a pop of color and softness.',
    price: 30.00,
    category: 'Home & Garden',
    brand: 'Pottery Barn',
    countInStock: 120,
    images: [{ public_id: 'velvet_pillow_1', url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=500&q=80' }],
    tags: ['pillow', 'cushion', 'velvet', 'green', 'decor', 'texture', 'sofa'],
    rating: 4.7,
    numReviews: 67
  },
  {
    name: 'Mid-Century Modern Chair',
    description: 'Wooden armchair with clean lines and tapered legs.',
    price: 450.00,
    category: 'Home & Garden',
    brand: 'Article',
    countInStock: 8,
    images: [{ public_id: 'mcm_chair_1', url: 'https://images.unsplash.com/photo-1567538096630-e99482672606?w=500&q=80' }],
    tags: ['chair', 'furniture', 'mid-century', 'wood', 'decor', 'sitting'],
    rating: 4.8,
    numReviews: 29
  },
  {
    name: 'Potted Fiddle Leaf Fig',
    description: 'Large artificial plant that brings life to a corner without the maintenance.',
    price: 95.00,
    category: 'Home & Garden',
    brand: 'Nearby Naturals',
    countInStock: 40,
    images: [{ public_id: 'fiddle_fig_1', url: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=500&q=80' }],
    tags: ['plant', 'greenery', 'artificial', 'decor', 'nature', 'indoor'],
    rating: 4.3,
    numReviews: 12
  },
  {
    name: 'Abstract Wall Art',
    description: 'Large canvas print with soothing blue and grey tones.',
    price: 110.00,
    category: 'Home & Garden',
    brand: 'Society6',
    countInStock: 15,
    images: [{ public_id: 'abstract_art_1', url: 'https://images.unsplash.com/photo-1580130601275-ca9a8181878b?w=500&q=80' }],
    tags: ['art', 'wall-art', 'abstract', 'blue', 'decor', 'canvas'],
    rating: 4.6,
    numReviews: 19
  },

  // --- REPAIR (Automotive/Home/Tools) ---
  {
    name: 'Adjustable Pipe Wrench',
    description: 'Heavy-duty pipe wrench for plumbing repairs. A must-have for leaky pipes.',
    price: 25.00,
    category: 'Home & Garden',
    brand: 'Ridgid',
    countInStock: 50,
    images: [{ public_id: 'pipe_wrench_1', url: 'https://images.unsplash.com/photo-1616400619175-5beda3a17896?w=500&q=80' }],
    tags: ['wrench', 'tool', 'plumbing', 'repair', 'metal', 'heavy-duty', 'leak'],
    rating: 4.8,
    numReviews: 102
  },
  {
    name: 'Teflon Thread Seal Tape',
    description: 'White sealant tape for sealing pipe threads. Stops leaks instantly.',
    price: 2.99,
    category: 'Home & Garden',
    brand: 'Oatey',
    countInStock: 500,
    images: [{ public_id: 'teflon_tape_1', url: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0b6b?w=500&q=80' }],
    tags: ['tape', 'plumbing', 'repair', 'sealant', 'leak', 'fix'],
    rating: 4.5,
    numReviews: 340
  },
  {
    name: 'Multi-Purpose WD-40',
    description: 'Lubricates moving parts and loosens rusted bolts. The mechanic\'s best friend.',
    price: 8.50,
    category: 'Automotive',
    brand: 'WD-40',
    countInStock: 200,
    images: [{ public_id: 'wd40_1', url: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500&q=80' }],
    tags: ['lubricant', 'repair', 'rust', 'mechanic', 'spray', 'fix', 'squeak'],
    rating: 4.9,
    numReviews: 1200
  },
  {
    name: 'Precision Screwdriver Set',
    description: 'Set of small screwdrivers for electronics and small appliances.',
    price: 15.00,
    category: 'Home & Garden',
    brand: 'iFixit',
    countInStock: 100,
    images: [{ public_id: 'screwdriver_set_1', url: 'https://images.unsplash.com/photo-1581147036324-c17ac41d7c3d?w=500&q=80' }],
    tags: ['screwdriver', 'tool', 'electronics', 'repair', 'kit', 'precision'],
    rating: 4.7,
    numReviews: 88
  },
  {
    name: 'Duct Tape - Silver',
    description: 'Strong, water-resistant tape for temporary fixes and repairs.',
    price: 5.99,
    category: 'Home & Garden',
    brand: 'Gorilla',
    countInStock: 300,
    images: [{ public_id: 'duct_tape_1', url: 'https://plus.unsplash.com/premium_photo-1677103216851-4040a4555f2d?w=500&q=80' }],
    tags: ['tape', 'duct-tape', 'repair', 'fix', 'adhesive', 'silver'],
    rating: 4.6,
    numReviews: 210
  },
  {
    name: 'Claw Hammer',
    description: '16oz fiberglass handle hammer for general construction and repair.',
    price: 18.00,
    category: 'Home & Garden',
    brand: 'Stanley',
    countInStock: 60,
    images: [{ public_id: 'claw_hammer_1', url: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=500&q=80' }],
    tags: ['hammer', 'tool', 'construction', 'repair', 'nail', 'wood'],
    rating: 4.8,
    numReviews: 95
  },
  {
    name: 'Car Battery Charger',
    description: 'Portable jump starter and battery charger for emergencies.',
    price: 75.00,
    category: 'Automotive',
    brand: 'NOCO',
    countInStock: 30,
    images: [{ public_id: 'battery_charger_1', url: 'https://images.unsplash.com/photo-1590497576596-41f237f849cc?w=500&q=80' }],
    tags: ['charger', 'car', 'automotive', 'battery', 'repair', 'emergency'],
    rating: 4.9,
    numReviews: 150
  }
];

const seedShopLens = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for ShopLens seeding...');

        // Find admin user
        let admin = await User.findOne({ email: 'admin@example.com' });
        if (!admin) {
             // Fallback to checking for 'admin@ecommerce.com' from seedAdmin.js
             admin = await User.findOne({ email: 'admin@ecommerce.com' });
        }
        
        if (!admin) {
            console.log('No admin user found! Please run seedAdmin.js or seedData.js first.');
            process.exit(1);
        }

        console.log(`Assigning products to Admin: ${admin.name} (${admin.email})`);

        // Prepare products with required owner/createdBy fields
        const productsToInsert = shopLensProducts.map(p => ({
            ...p,
            owner: admin._id,
            createdBy: admin._id,
            // Ensure delivery info default structure if Schema requires it (Schema has defaults so it might be fine, but let's be safe if strict)
        }));

        // Upsert products to avoid duplicates if run multiple times
        // We'll check by name
        let insertedCount = 0;
        let updatedCount = 0;

        for (const product of productsToInsert) {
            const result = await Product.findOneAndUpdate(
                { name: product.name },
                { $set: product },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            if (result.isNew) insertedCount++; // isNew might not be available on findOneAndUpdate result directly in all mongoose versions, but close enough logic
            else updatedCount++;
        }

        console.log(`Seeding Complete!`);
        console.log('ShopLens Inventory Ready.');
        
    } catch (error) {
        console.error('Error seeding ShopLens data:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

seedShopLens();
