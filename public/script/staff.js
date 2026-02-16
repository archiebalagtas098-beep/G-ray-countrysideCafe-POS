let currentOrder = [];
let orderType = null;
let currentCategory = 'all';
let selectedPaymentMethod = null;
let productCatalog = [];
let staffInventory = [];
let outOfStockItems = [];

// ==================== 🔴 EVENT SOURCE FOR REAL-TIME UPDATES ====================
let stockEventSource = null;

// ==================== 🔴 MAXIMUM STOCK LIMIT ====================
const MAX_STOCK_PER_ITEM = 100;

// ==================== 🍽️ SERVINGWARE INVENTORY ====================
let servingwareInventory = {
    'plate': { name: 'Plate', current: 100, max: 100, unit: 'piece', minThreshold: 20 },
    'tray': { name: 'Party Tray', current: 100, max: 100, unit: 'piece', minThreshold: 15 },
    'glass': { name: 'Glass', current: 100, max: 100, unit: 'piece', minThreshold: 25 },
    'sizzling plate': { name: 'Sizzling Plate', current: 100, max: 100, unit: 'piece', minThreshold: 20 },
    'cup': { name: 'Coffee Cup', current: 100, max: 100, unit: 'piece', minThreshold: 20 },
    'bowl': { name: 'Rice Bowl', current: 100, max: 100, unit: 'piece', minThreshold: 30 },
    'pitcher': { name: 'Pitcher', current: 50, max: 50, unit: 'piece', minThreshold: 10 },
    'bottle': { name: 'Bottle', current: 100, max: 100, unit: 'piece', minThreshold: 20 },
    'serving': { name: 'Serving Plate', current: 80, max: 80, unit: 'piece', minThreshold: 15 },
    'sandwich': { name: 'Sandwich Plate', current: 50, max: 50, unit: 'piece', minThreshold: 10 },
    'meal': { name: 'Meal Tray', current: 100, max: 100, unit: 'piece', minThreshold: 20 },
    'pot': { name: 'Cooking Pot', current: 30, max: 30, unit: 'piece', minThreshold: 5 }
};

// ==================== 🥩 INGREDIENT INVENTORY ====================
let ingredientInventory = {
    'pork': { name: 'Pork', current: 50, max: 500, unit: 'kg', minThreshold: 20 },
    'chicken': { name: 'Chicken', current: 40, max: 300, unit: 'kg', minThreshold: 15 },
    'beef': { name: 'Beef', current: 30, max: 200, unit: 'kg', minThreshold: 10 },
    'shrimp': { name: 'Shrimp', current: 20, max: 100, unit: 'kg', minThreshold: 8 },
    'fish': { name: 'Cream Dory', current: 25, max: 150, unit: 'kg', minThreshold: 10 },
    'pork_belly': { name: 'Pork Belly', current: 30, max: 100, unit: 'kg', minThreshold: 10 },
    'pork_chop': { name: 'Pork Chop', current: 25, max: 80, unit: 'kg', minThreshold: 8 },
    'onion': { name: 'Onion', current: 15, max: 50, unit: 'kg', minThreshold: 5 },
    'garlic': { name: 'Garlic', current: 10, max: 30, unit: 'kg', minThreshold: 3 },
    'cabbage': { name: 'Cabbage', current: 12, max: 40, unit: 'kg', minThreshold: 5 },
    'carrot': { name: 'Carrot', current: 10, max: 30, unit: 'kg', minThreshold: 5 },
    'bell_pepper': { name: 'Bell Pepper', current: 8, max: 20, unit: 'kg', minThreshold: 3 },
    'calamansi': { name: 'Calamansi', current: 8, max: 20, unit: 'kg', minThreshold: 5 },
    'tomato': { name: 'Tomato', current: 10, max: 30, unit: 'kg', minThreshold: 5 },
    'potato': { name: 'Potato', current: 25, max: 100, unit: 'kg', minThreshold: 10 },
    'cucumber': { name: 'Cucumber', current: 10, max: 30, unit: 'kg', minThreshold: 5 },
    'eggplant': { name: 'Eggplant', current: 10, max: 30, unit: 'kg', minThreshold: 5 },
    'green_beans': { name: 'Green Beans', current: 10, max: 30, unit: 'kg', minThreshold: 5 },
    'rice': { name: 'Rice', current: 80, max: 200, unit: 'kg', minThreshold: 30 }
};

// ==================== 🍽️ PRODUCT INGREDIENT MAPPING ====================
const productIngredientMap = {
    'Korean Spicy Bulgogi (Pork)': {
        ingredients: { 
            'pork': 0.2, 
            'onion': 0.05, 
            'garlic': 0.02, 
            'gochujang': 0.03,
            'sesame_oil': 0.01,
            'soy_sauce': 0.03, 
            'cooking_oil': 0.02,
            'salt': 0.01,
            'black_pepper': 0.01,
            'chili': 0.01
        },
        servingware: 'plate'
    },
    'Korean Salt and Pepper (Pork)': {
        ingredients: { 
            'pork': 0.2, 
            'onion': 0.05, 
            'garlic': 0.02, 
            'gochujang': 0.03,
            'sesame_oil': 0.01,
            'soy_sauce': 0.03, 
            'cooking_oil': 0.02,
            'salt': 0.01,
            'black_pepper': 0.01,
            'peppercorn': 0.01
        },
        servingware: 'plate'
    },
    'Crispy Pork Lechon Kawali': {
        ingredients: { 
            'pork_belly': 0.25, 
            'garlic': 0.02, 
            'onion': 0.03,
            'salt': 0.01,
            'cooking_oil': 0.1,
            'cornstarch': 0.02
        },
        servingware: 'plate'
    },
    'Pork Shanghai': {
        ingredients: { 
            'pork': 0.15, 
            'garlic': 0.02, 
            'onion': 0.03,
            'carrots': 0.02,
            'breadcrumbs': 0.03,
            'flour': 0.02,
            'cornstarch': 0.02,
            'cooking_oil': 0.05,
            'egg': 0.02
        },
        servingware: 'plate'
    },
    'Sinigang (Pork)': {
        ingredients: { 
            'pork': 0.25, 
            'onion': 0.05, 
            'garlic': 0.02,
            'tomato': 0.05,
            'calamansi': 0.02,
            'chili': 0.01,
            'shrimp_paste': 0.02,
            'tamarind_mix': 0.03,
            'salt': 0.01,
            'black_pepper': 0.01,
            'bay_leaves': 0.01,
            'water': 0.3
        },
        servingware: 'bowl'
    },
    'Sizzling Pork Sisig': {
        ingredients: { 
            'pork': 0.2, 
            'onion': 0.05, 
            'garlic': 0.02,
            'chili': 0.02,
            'calamansi': 0.02,
            'egg': 0.05,
            'mayonnaise': 0.03,
            'soy_sauce': 0.02,
            'oyster_sauce': 0.02,
            'cooking_oil': 0.02,
            'salt': 0.01,
            'black_pepper': 0.01
        },
        servingware: 'sizzling_plate'
    },
    'Sizzling Liempo': {
        ingredients: { 
            'pork_belly': 0.25, 
            'onion': 0.05, 
            'garlic': 0.02,
            'cooking_oil': 0.02,
            'salt': 0.01
        },
        servingware: 'sizzling_plate'
    },
    'Sizzling Porkchop': {
        ingredients: { 
            'pork': 0.25, 
            'onion': 0.05, 
            'garlic': 0.02,
            'cooking_oil': 0.02,
            'salt': 0.01
        },
        servingware: 'sizzling_plate'
    },
    'Buttered Honey Chicken': {
        ingredients: { 
            'chicken': 0.25, 
            'butter': 0.03,
            'honey': 0.03,
            'cooking_oil': 0.02
        },
        servingware: 'plate'
    },
    'Buttered Spicy Chicken': {
        ingredients: { 
            'chicken': 0.25, 
            'butter': 0.03,
            'cooking_oil': 0.02,
            'chili': 0.02
        },
        servingware: 'plate'
    },
    'Chicken Adobo': {
        ingredients: { 
            'chicken': 0.25, 
            'onion': 0.05, 
            'garlic': 0.02,
            'tomato': 0.05,
            'soy_sauce': 0.04,
            'bay_leaves': 0.01,
            'salt': 0.01,
            'cooking_oil': 0.02
        },
        servingware: 'plate'
    },
    'Fried Chicken': {
        ingredients: { 
            'chicken': 0.25, 
            'breadcrumbs': 0.03,
            'flour': 0.03,
            'cooking_oil': 0.1,
            'salt': 0.01
        },
        servingware: 'plate'
    },
    'Sizzling Fried Chicken': {
        ingredients: { 
            'chicken': 0.25, 
            'onion': 0.05, 
            'garlic': 0.02,
            'cooking_oil': 0.1,
            'salt': 0.01
        },
        servingware: 'sizzling_plate'
    },
    'Budget Fried Chicken': {
        ingredients: { 
            'chicken': 0.15, 
            'breadcrumbs': 0.02,
            'flour': 0.02,
            'cooking_oil': 0.08,
            'salt': 0.01
        },
        servingware: 'plate'
    },
    'Clubhouse Sandwich': {
        ingredients: { 
            'chicken': 0.1, 
            'bread': 0.1,
            'mayonnaise': 0.02,
            'gravy': 0.03
        },
        servingware: 'plate'
    },
    'Cream Dory Fish Fillet': {
        ingredients: { 
            'cream_dory': 0.2, 
            'breadcrumbs': 0.02,
            'flour': 0.02,
            'cooking_oil': 0.05,
            'salt': 0.01
        },
        servingware: 'plate'
    },
    'Fish and Fries': {
        ingredients: { 
            'cream_dory': 0.15, 
            'french_fries': 0.15,
            'breadcrumbs': 0.02,
            'flour': 0.02,
            'cooking_oil': 0.08,
            'salt': 0.01
        },
        servingware: 'plate'
    },
    'Sinigang (Shrimp)': {
        ingredients: { 
            'shrimp': 0.2, 
            'onion': 0.05, 
            'garlic': 0.02,
            'tomato': 0.05,
            'calamansi': 0.02,
            'chili': 0.01,
            'shrimp_paste': 0.02,
            'tamarind_mix': 0.03,
            'salt': 0.01,
            'black_pepper': 0.01,
            'bay_leaves': 0.01,
            'water': 0.3
        },
        servingware: 'bowl'
    },
    'Buttered Shrimp': {
        ingredients: { 
            'shrimp': 0.2, 
            'butter': 0.03,
            'calamansi': 0.02,
            'salt': 0.01,
            'black_pepper': 0.01
        },
        servingware: 'plate'
    },
    'Special Bulalo': {
        ingredients: { 
            'shrimp': 0.1,
            'corn': 0.1,
            'potato': 0.1,
            'carrots': 0.1,
            'onion': 0.05,
            'garlic': 0.02,
            'bay_leaves': 0.01,
            'salt': 0.01,
            'water': 0.3,
            'chicken_broth': 0.2
        },
        servingware: 'bowl'
    },
    'Paknet (Pakbet w/ Bagnet)': {
        ingredients: { 
            'bagnet': 0.15,
            'onion': 0.05, 
            'garlic': 0.02,
            'tomato': 0.05,
            'cucumber': 0.05,
            'corn': 0.05,
            'potato': 0.05,
            'carrots': 0.05,
            'salt': 0.01,
            'black_pepper': 0.01
        },
        servingware: 'plate'
    },
    'Pancit Bihon': {
        ingredients: { 
            'rice_noodles': 0.15,
            'onion': 0.03, 
            'garlic': 0.02,
            'carrots': 0.05,
            'soy_sauce': 0.02,
            'oyster_sauce': 0.02,
            'cooking_oil': 0.02
        },
        servingware: 'plate'
    },
    'Pancit Canton + Bihon (Mixed)': {
        ingredients: { 
            'pancit_canton': 0.1,
            'rice_noodles': 0.1,
            'onion': 0.03, 
            'garlic': 0.02,
            'carrots': 0.05,
            'soy_sauce': 0.02,
            'oyster_sauce': 0.02,
            'cooking_oil': 0.02
        },
        servingware: 'plate'
    },
    'Spaghetti (Filipino Style)': {
        ingredients: { 
            'spaghetti_pasta': 0.15,
            'onion': 0.03, 
            'garlic': 0.02,
            'tomato': 0.05,
            'soy_sauce': 0.02,
            'sweet_tomato_sauce': 0.05,
            'cooking_oil': 0.02
        },
        servingware: 'plate'
    },
    'Tinapa Rice': {
        ingredients: { 
            'rice': 0.2,
            'tinapa': 0.05
        },
        servingware: 'plate'
    },
    'Tuyo Pesto': {
        ingredients: { 
            'rice': 0.2,
            'tuyo': 0.03,
            'shrimp_paste': 0.02
        },
        servingware: 'plate'
    },
    'Fried Rice': {
        ingredients: { 
            'rice': 0.2,
            'onion': 0.02, 
            'garlic': 0.02,
            'egg': 0.05,
            'soy_sauce': 0.01,
            'sesame_oil': 0.01,
            'sugar': 0.01,
            'salt': 0.01,
            'water': 0.02,
            'cooking_oil': 0.02
        },
        servingware: 'plate'
    },
    'Plain Rice': {
        ingredients: { 
            'rice': 0.2,
            'salt': 0.01,
            'water': 0.02
        },
        servingware: 'cup'
    },
    'Cheesy Nachos': {
        ingredients: { 
            'nacho_chips': 0.15,
            'onion': 0.02,
            'cheese_sauce': 0.05,
            'cheese': 0.03,
            'cooking_oil': 0.02
        },
        servingware: 'plate'
    },
    'Nachos Supreme': {
        ingredients: { 
            'nacho_chips': 0.15,
            'onion': 0.02,
            'cheese_sauce': 0.05,
            'cheese': 0.03,
            'cooking_oil': 0.02
        },
        servingware: 'plate'
    },
    'French Fries': {
        ingredients: { 
            'french_fries': 0.2,
            'flour': 0.02,
            'cooking_oil': 0.08,
            'salt': 0.01
        },
        servingware: 'plate'
    },
    'Cheesy Dynamite Lumpia': {
        ingredients: { 
            'lumpia_wrapper': 0.1,
            'cheese': 0.05,
            'cheese_sauce': 0.03,
            'cornstarch': 0.02,
            'cooking_oil': 0.05
        },
        servingware: 'plate'
    },
    'Lumpiang Shanghai': {
        ingredients: { 
            'lumpia_wrapper': 0.1,
            'pork': 0.1,
            'carrots': 0.03,
            'onion': 0.02,
            'garlic': 0.01,
            'breadcrumbs': 0.02,
            'flour': 0.02,
            'cornstarch': 0.02,
            'cooking_oil': 0.05
        },
        servingware: 'plate'
    },
    'Cucumber Lemonade': {
        ingredients: { 
            'cucumber': 0.05,
            'lemon_juice': 0.03,
            'honey': 0.02,
            'sugar': 0.02,
            'calamansi': 0.02,
            'water': 0.25
        },
        servingware: 'glass'
    },
    'Blue Lemonade': {
        ingredients: { 
            'blue_syrup': 0.03,
            'lemon_juice': 0.03,
            'honey': 0.02,
            'sugar': 0.02,
            'calamansi': 0.02,
            'water': 0.25
        },
        servingware: 'glass'
    },
    'Red Tea': {
        ingredients: { 
            'black_tea': 0.02,
            'honey': 0.02,
            'sugar': 0.02,
            'hot_water': 0.25
        },
        servingware: 'glass'
    },
    'Cafe Americano': {
        ingredients: { 
            'coffee_beans': 0.02,
            'sugar': 0.02,
            'hot_water': 0.25
        },
        servingware: 'cup'
    },
    'Cafe Latte': {
        ingredients: { 
            'espresso': 0.05,
            'milk': 0.15,
            'sugar': 0.02,
            'vanilla_syrup': 0.02,
            'steamed_milk': 0.1
        },
        servingware: 'cup'
    },
    'Caramel Macchiato': {
        ingredients: { 
            'espresso': 0.05,
            'milk': 0.15,
            'sugar': 0.02,
            'caramel_syrup': 0.03,
            'steamed_milk': 0.1,
            'cream': 0.02
        },
        servingware: 'cup'
    },
    'Milk Tea': {
        ingredients: { 
            'milk': 0.15,
            'tea': 0.05,
            'sugar': 0.02,
            'tapioca_pearls': 0.05
        },
        servingware: 'glass'
    },
    'Matcha Green Tea': {
        ingredients: { 
            'matcha_powder': 0.02,
            'milk': 0.15,
            'tea': 0.05,
            'sugar': 0.02,
            'tapioca_pearls': 0.05
        },
        servingware: 'glass'
    },
    'Cookies & Cream': {
        ingredients: { 
            'milk': 0.15,
            'cream': 0.05,
            'sugar': 0.02,
            'tapioca_pearls': 0.05,
            'cookie_crumbs': 0.03
        },
        servingware: 'glass'
    },
    'Strawberry & Cream': {
        ingredients: { 
            'milk': 0.15,
            'cream': 0.05,
            'sugar': 0.02,
            'strawberry_syrup': 0.03,
            'tapioca_pearls': 0.05
        },
        servingware: 'glass'
    },
    'Mango Cheesecake': {
        ingredients: { 
            'milk': 0.15,
            'cream': 0.05,
            'cream_cheese_flavor': 0.03,
            'mango_flavor': 0.03,
            'sugar': 0.02,
            'tapioca_pearls': 0.05
        },
        servingware: 'glass'
    },
    'Soda': {
        ingredients: { 
            'carbonated_soft_drink': 0.33
        },
        servingware: 'can'
    }
};

// ==================== 🍽️ MENU DATABASE BY CATEGORY ====================
const menuDatabase = {
    'Rice': [
        { name: 'Korean Spicy Bulgogi (Pork)', unit: 'plate', defaultPrice: 180 },
        { name: 'Korean Salt and Pepper (Pork)', unit: 'plate', defaultPrice: 180 },
        { name: 'Crispy Pork Lechon Kawali', unit: 'plate', defaultPrice: 180 },
        { name: 'Cream Dory Fish Fillet', unit: 'plate', defaultPrice: 170 },
        { name: 'Buttered Honey Chicken', unit: 'plate', defaultPrice: 170 },
        { name: 'Buttered Spicy Chicken', unit: 'plate', defaultPrice: 170 },
        { name: 'Chicken Adobo', unit: 'plate', defaultPrice: 170 },
        { name: 'Pork Shanghai', unit: 'plate', defaultPrice: 180 },
        { name: 'Sizzling Pork Sisig', unit: 'sizzling plate', defaultPrice: 190 },
        { name: 'Sizzling Liempo', unit: 'sizzling plate', defaultPrice: 190 },
        { name: 'Sizzling Porkchop', unit: 'sizzling plate', defaultPrice: 190 },
        { name: 'Sizzling Fried Chicken', unit: 'sizzling plate', defaultPrice: 180 },
        { name: 'Fried Chicken', unit: 'plate', defaultPrice: 160 },
        { name: 'Budget Fried Chicken', unit: 'plate', defaultPrice: 120 },
        { name: 'Tinapa Rice', unit: 'plate', defaultPrice: 150 },
        { name: 'Tuyo Pesto', unit: 'plate', defaultPrice: 150 },
        { name: 'Fried Rice', unit: 'plate', defaultPrice: 120 },
        { name: 'Plain Rice', unit: 'cup', defaultPrice: 40 },
        { name: 'Sinigang (Pork)', unit: 'bowl', defaultPrice: 220 },
        { name: 'Sinigang (Shrimp)', unit: 'bowl', defaultPrice: 220 },
        { name: 'Paknet (Pakbet w/ Bagnet)', unit: 'plate', defaultPrice: 190 },
        { name: 'Buttered Shrimp', unit: 'plate', defaultPrice: 190 },
        { name: 'Special Bulalo', unit: 'bowl', defaultPrice: 250 }
    ],
    'Sizzling': [
        { name: 'Sizzling Pork Sisig', unit: 'sizzling plate', defaultPrice: 190 },
        { name: 'Sizzling Liempo', unit: 'sizzling plate', defaultPrice: 190 },
        { name: 'Sizzling Porkchop', unit: 'sizzling plate', defaultPrice: 190 },
        { name: 'Sizzling Fried Chicken', unit: 'sizzling plate', defaultPrice: 180 }
    ],
    'Party': [
        { name: 'Pancit Bihon', unit: 'plate', defaultPrice: 160 },
        { name: 'Pancit Canton + Bihon (Mixed)', unit: 'plate', defaultPrice: 170 },
        { name: 'Spaghetti (Filipino Style)', unit: 'plate', defaultPrice: 160 },
        { name: 'Lumpiang Shanghai', unit: 'plate (6 pcs)', defaultPrice: 140 },
        { name: 'Pork Shanghai', unit: 'plate', defaultPrice: 180 }
    ],
    'Snack & Appetizer': [
        { name: 'Cheesy Nachos', unit: 'plate', defaultPrice: 150 },
        { name: 'Nachos Supreme', unit: 'plate', defaultPrice: 180 },
        { name: 'French Fries', unit: 'plate', defaultPrice: 120 },
        { name: 'Cheesy Dynamite Lumpia', unit: 'plate (6 pcs)', defaultPrice: 150 },
        { name: 'Lumpiang Shanghai', unit: 'plate (6 pcs)', defaultPrice: 140 }
    ],
    'Budget Meals Served with Rice': [
        { name: 'Budget Fried Chicken', unit: 'plate', defaultPrice: 120 },
        { name: 'Plain Rice', unit: 'cup', defaultPrice: 40 }
    ],
    'Specialties': [
        { name: 'Special Bulalo', unit: 'bowl', defaultPrice: 250 },
        { name: 'Sinigang (Pork)', unit: 'bowl', defaultPrice: 220 },
        { name: 'Sinigang (Shrimp)', unit: 'bowl', defaultPrice: 220 },
        { name: 'Paknet (Pakbet w/ Bagnet)', unit: 'plate', defaultPrice: 190 },
        { name: 'Tinapa Rice', unit: 'plate', defaultPrice: 150 },
        { name: 'Tuyo Pesto', unit: 'plate', defaultPrice: 150 }
    ],
    'Drink': [
        { name: 'Cucumber Lemonade', unit: 'glass', defaultPrice: 90 },
        { name: 'Blue Lemonade', unit: 'glass', defaultPrice: 90 },
        { name: 'Red Tea', unit: 'glass', defaultPrice: 70 },
        { name: 'Soda', unit: 'can', defaultPrice: 50 }
    ],
    'Cafe': [
        { name: 'Cafe Americano', unit: 'cup', defaultPrice: 80 },
        { name: 'Cafe Latte', unit: 'cup', defaultPrice: 100 },
        { name: 'Caramel Macchiato', unit: 'cup', defaultPrice: 110 }
    ],
    'Milk': [
        { name: 'Milk Tea', unit: 'glass', defaultPrice: 90 },
        { name: 'Matcha Green Tea', unit: 'glass', defaultPrice: 100 },
        { name: 'Cookies & Cream', unit: 'glass', defaultPrice: 100 },
        { name: 'Strawberry & Cream', unit: 'glass', defaultPrice: 100 },
        { name: 'Mango Cheesecake', unit: 'glass', defaultPrice: 100 }
    ]
};

// ==================== 🏷️ CATEGORY DISPLAY NAMES ====================
const categoryDisplayNames = {
    'Rice': 'Rice Bowl Meals',
    'Sizzling': 'Hot Sizzlers',
    'Party': 'Party Tray',
    'Drink': 'Drinks',
    'Cafe': 'Coffee',
    'Milk': 'Milk Tea',
    'Snack & Appetizer': 'Snacks & Appetizer',
    'Budget Meals Served with Rice': 'Budget Meals',
    'Specialties': 'Specialties'
};

// ==================== 🖼️ PRODUCT IMAGE MAPPING ====================
const productImageMap = {
    'Korean Spicy Bulgogi (Pork)': 'rice/korean_spicy_bulgogi.png',
    'Korean Salt and Pepper (Pork)': 'rice/korean_salt_pepper_pork.png',
    'Crispy Pork Lechon Kawali': 'rice/lechon_kawali.png',
    'Pork Shanghai': 'rice/pork_shanghai.png',
    'Sinigang (Pork)': 'specialties/sinigang_pork.png',
    'Sizzling Pork Sisig': 'sizzling/pork_sisig.png',
    'Sizzling Liempo': 'sizzling/liempo.png',
    'Sizzling Porkchop': 'sizzling/porkchop.png',
    'Buttered Honey Chicken': 'rice/buttered_honey_chicken.png',
    'Buttered Spicy Chicken': 'rice/buttered_spicy_chicken.png',
    'Chicken Adobo': 'rice/chicken_adobo.png',
    'Fried Chicken': 'sizzling/fried_chicken.png',
    'Sizzling Fried Chicken': 'sizzling/fried_chicken.png',
    'Budget Fried Chicken': 'budget/fried_chicken_Meal.png',
    'Clubhouse Sandwich': 'snacks/club_house_sandwich.png',
    'Cream Dory Fish Fillet': 'rice/cream_dory.png',
    'Fish and Fries': 'snacks/fish_fries.png',
    'Sinigang (Shrimp)': 'specialties/sinigang_shrimp.png',
    'Buttered Shrimp': 'specialties/buttered_shrimp.png',
    'Special Bulalo': 'specialties/bulalo.png',
    'Paknet (Pakbet w/ Bagnet)': 'specialties/paknet.png',
    'Pancit Bihon': 'party/pancit_bihon_large.png',
    'Pancit Canton + Bihon (Mixed)': 'party/pancit_canton_large.png',
    'Spaghetti (Filipino Style)': 'party/spaghetti_large.png',
    'Tinapa Rice': 'budget/Tinapa_fried_rice.png',
    'Tuyo Pesto': 'budget/Tuyo_pesto.png',
    'Fried Rice': 'budget/fried_rice.png',
    'Plain Rice': 'budget/plain_rice.png',
    'Cheesy Nachos': 'snacks/cheesy_nachos.png',
    'Nachos Supreme': 'snacks/nachos_supreme.png',
    'French Fries': 'snacks/french_fries.png',
    'Cheesy Dynamite Lumpia': 'snacks/Cheesy_dynamite.png',
    'Lumpiang Shanghai': 'snacks/lumpiang_shanghai.png',
    'Cucumber Lemonade': 'drinks/cucumber_lemonade.png',
    'Blue Lemonade': 'drinks/blue_lemonade.png',
    'Red Tea': 'drinks/red_tea.png',
    'Cafe Americano': 'coffee/cafe_americano_grande.png',
    'Cafe Latte': 'coffee/cafe_latte_grande.png',
    'Caramel Macchiato': 'coffee/caramel_macchiato_grande.png',
    'Milk Tea': 'milktea/Milktea_regular.png',
    'Matcha Green Tea': 'milktea/Matcha_greentea_HC.png',
    'Cookies & Cream': 'frappe/Cookies_&Cream_HC.png',
    'Strawberry & Cream': 'frappe/Strawberry_Cream_frappe_HC.png',
    'Mango Cheesecake': 'frappe/Mango_cheesecake_HC.png',
    'Soda': 'drinks/soda_mismo.png'
};

const BACKEND_URL = window.location.origin;

// ==================== 📸 GET PRODUCT IMAGE ====================
function getProductImage(productName) {
    return productImageMap[productName] || 'default_food.jpg';
}

// ==================== 🎯 TOAST NOTIFICATION ====================
function showToast(message, type = 'success', duration = 3000) {
    // Remove existing toast
    const existingToast = document.getElementById('activeToast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.id = 'activeToast';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ff9800' : '#17a2b8'};
        color: white;
        border-radius: 8px;
        z-index: 99999;
        font-weight: bold;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        animation: slideInRight 0.3s ease-in-out;
        max-width: 400px;
        word-wrap: break-word;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    if (duration > 0) {
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, duration);
    }
    
    return toast;
}

// ==================== � LOGOUT HANDLER ====================
function handleLogout() {
    console.log('🚪 Logging out staff user...');
    
    try {
        // Clear all local state variables
        currentOrder = [];
        currentServingwareInventory = {};
        
        // Clear all localStorage items related to offline sync
        const itemsToClear = [
            'servingwareInventory',
            'offlineMode',
            'lastSyncTime'
        ];
        
        itemsToClear.forEach(item => {
            localStorage.removeItem(item);
            console.log(`✓ Cleared localStorage: ${item}`);
        });
        
        // Show logout toast
        showToast('Logging out... Please wait', 'info', 2000);
        
        // Call logout endpoint on backend
        setTimeout(() => {
            fetch('/logout', {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            })
            .then(response => {
                console.log('✓ Logout endpoint called successfully');
                // Redirect to login page regardless of response
                window.location.href = '/login?logout=true';
            })
            .catch(error => {
                console.error('⚠️ Logout error:', error);
                // Still redirect to login even if logout endpoint fails
                window.location.href = '/login?logout=true';
            });
        }, 500);
        
    } catch (error) {
        console.error('❌ Error during logout:', error);
        // Force redirect to login as fallback
        window.location.href = '/login?logout=true';
    }
}

// ==================== �📋 LOAD ALL MENU ITEMS ====================
async function loadAllMenuItems() {
    console.log('📋 Loading menu items from API...');
    
    try {
        const response = await fetch('/api/menu', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success && result.data && Array.isArray(result.data)) {
            productCatalog = [];
            outOfStockItems = [];
            
            result.data.forEach(item => {
                const currentStock = parseInt(item.currentStock) || 0;
                
                // 🆕 FIXED: ONLY show products with stock > 0
                // Staff should ONLY see products that admin has sent stock for
                if (currentStock <= 0) {
                    console.log(`⏭️ Skipping ${item.name || item.itemName} (no stock sent by admin)`);
                    return; // Skip this product
                }
                
                const product = {
                    name: item.name || item.itemName || 'Unknown',
                    price: item.price || 0,
                    category: categoryDisplayNames[item.category] || item.category || 'Uncategorized',
                    image: getProductImage(item.name || item.itemName || ''),
                    stock: currentStock,
                    unit: item.unit || 'piece',
                    _id: item._id || `temp_${Date.now()}_${Math.random()}`,
                    maxStock: item.maxStock || MAX_STOCK_PER_ITEM,
                    status: currentStock > 0 ? 'in_stock' : 'out_of_stock'
                };
                
                productCatalog.push(product);
                
                if (currentStock <= 0) {
                    outOfStockItems.push(product.name);
                }
            });
            
            console.log(`✅ Loaded ${productCatalog.length} products from API (only items with stock > 0)`);
            renderMenu();
            return true;
        }
        
        console.warn('⚠️ API response invalid, loading from local database...');
        loadFromLocalMenuDatabase();
        return false;
        
    } catch (error) {
        console.error('❌ Error loading menu from API:', error);
        console.warn('⚠️ Falling back to local database...');
        loadFromLocalMenuDatabase();
        return false;
    }
}

// ==================== 📋 LOCAL DATABASE FALLBACK ====================
function loadFromLocalMenuDatabase() {
    console.log('📋 Loading from local menu database...');
    
    productCatalog = [];
    outOfStockItems = [];
    
    for (const [categoryKey, items] of Object.entries(menuDatabase)) {
        const displayCategory = categoryDisplayNames[categoryKey] || categoryKey;
        
        for (const menuItem of items) {
            const product = {
                name: menuItem.name,
                price: menuItem.defaultPrice,
                category: displayCategory,
                image: getProductImage(menuItem.name),
                stock: 0,
                unit: menuItem.unit,
                _id: `local_${Date.now()}_${menuItem.name.replace(/\s+/g, '_')}`,
                maxStock: MAX_STOCK_PER_ITEM,
                status: 'out_of_stock'
            };
            
            productCatalog.push(product);
            outOfStockItems.push(product.name);
        }
    }
    
    console.log(`✅ Loaded ${productCatalog.length} products from local database`);
    renderMenu();
}

// ==================== 🎯 RENDER MENU ====================
function renderMenu() {
    const container = document.getElementById('menuContainer');
    if (!container) return;
    
    container.innerHTML = '';

    const items = currentCategory === 'all'
        ? productCatalog
        : productCatalog.filter(p => p.category === currentCategory);

    if (items.length === 0) {
        container.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px 20px;
                text-align: center;
                min-height: 300px;
                color: #666;
            ">
                <div style="font-size: 48px; margin-bottom: 20px;">📦</div>
                <h3 style="margin: 10px 0; font-size: 20px; color: #333;">No Products Found</h3>
                <p style="margin: 10px 0; font-size: 14px; color: #999;">
                    No items available in this category at the moment.
                </p>
                <p style="margin: 10px 0; font-size: 13px; color: #bbb;">
                    Please try another category or check back later.
                </p>
            </div>
        `;
        return;
    }

    items.forEach(product => {
        const card = createProductCard(product);
        container.appendChild(card);
    });
}

// ==================== 🎯 PRODUCT CARD ====================
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'compact-product-card';
    
    card.dataset.productName = product.name;
    card.dataset.productId = product._id;
    card.dataset.stock = product.stock || 0;
    
    card.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (product.stock > 0) {
            addItemToOrder(product.name, product.price, product);
        } else {
            // Just show a simple toast that item is out of stock
            showToast(`❌ ${product.name} is currently out of stock`, 'error', 3000);
        }
    };
    
    const stockStatus = product.stock > 0 
        ? `✅ In Stock: ${product.stock}`
        : `🚫 OUT OF STOCK`;
    
    const stockColor = product.stock > 0 ? '#28a745' : '#dc3545';
    
    card.innerHTML = `
        <img src="/images/${product.image}" 
             onerror="this.onerror=null; this.src='/images/default_food.jpg';" 
             alt="${product.name}"
             style="opacity: ${product.stock > 0 ? '1' : '0.7'};" />
        <div class="compact-product-name">${product.name}</div>
        <div class="compact-product-category">${product.category}</div>
        <div class="compact-product-price">₱${product.price}</div>
        <div class="compact-product-stock" style="color: ${stockColor}; font-weight: bold;">
            ${stockStatus}
        </div>
    `;
    
    return card;
}

// ==================== 🔴 ADD ITEM TO ORDER ====================
function addItemToOrder(name, price, product = null) {
    if (!product) {
        product = productCatalog.find(p => p.name === name);
    }
    
    if (!product || product.stock <= 0) {
        showToast(`❌ ${name} is out of stock`, 'error', 3000);
        return;
    }
    
    const existingItem = currentOrder.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity++;
        existingItem.subtotal = existingItem.quantity * existingItem.price;
        product.stock--;
    } else {
        currentOrder.push({
            name: product.name,
            price: product.price,
            quantity: 1,
            subtotal: product.price,
            unit: product.unit,
            _id: product._id
        });
        product.stock--;
    }
    
    if (product.stock === 0) {
        product.status = 'out_of_stock';
        if (!outOfStockItems.includes(product.name)) {
            outOfStockItems.push(product.name);
        }
    }
    
    renderOrder();
    renderMenu();
    updatePayButtonState();
}

// ==================== 🧾 ORDER FUNCTIONS ====================
function renderOrder() {
    const list = document.getElementById('productlist');
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('totals');

    if (!list) return;

    list.innerHTML = '';
    let subtotal = 0;

    currentOrder.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        list.innerHTML += `
            <li style="display: flex; justify-content: space-between; align-items: center; padding: 5px 0;">
                <span>${item.name} x${item.quantity}</span>
                <span>₱${itemTotal.toFixed(2)}</span>
                <button onclick="removeItemFromOrder(${index})" style="background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer; padding: 2px 8px;">✕</button>
            </li>`;
    });

    if (subtotalEl) subtotalEl.textContent = `₱${subtotal.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `${subtotal.toFixed(2)}`;
}

function removeItemFromOrder(index) {
    const item = currentOrder[index];
    const product = productCatalog.find(p => p.name === item.name);
    
    if (product) {
        product.stock += item.quantity;
        if (product.stock > 0) {
            product.status = 'in_stock';
            outOfStockItems = outOfStockItems.filter(name => name !== product.name);
        }
    }
    
    currentOrder.splice(index, 1);
    renderOrder();
    renderMenu();
    updatePayButtonState();
}

function clearCurrentOrder() {
    if (currentOrder.length === 0) return;
    
    if (!confirm('Clear current order?')) return;
    
    currentOrder.forEach(item => {
        const product = productCatalog.find(p => p.name === item.name);
        if (product) {
            product.stock += item.quantity;
            if (product.stock > 0) {
                product.status = 'in_stock';
                outOfStockItems = outOfStockItems.filter(name => name !== product.name);
            }
        }
    });
    
    currentOrder = [];
    renderOrder();
    renderMenu();
    updatePayButtonState();
}

// ==================== 💰 PAYMENT FUNCTIONS ====================
function setOrderTypeNone() {
    orderType = null;
    const display = document.getElementById("orderTypeDisplay");
    if (display) display.textContent = "None";
    updatePayButtonState();
}

function setDineIn() {
    orderType = "Dine In";
    const display = document.getElementById("orderTypeDisplay");
    if (display) display.textContent = orderType;
    updatePayButtonState();
}

function setTakeout() {
    orderType = "Take Out";
    const display = document.getElementById("orderTypeDisplay");
    if (display) display.textContent = orderType;
    updatePayButtonState();
}

function selectPaymentMethod(method) {
    selectedPaymentMethod = method.toLowerCase();
    const display = document.getElementById("paymentMethodDisplay");
    if (display) {
        display.textContent = selectedPaymentMethod === 'cash' ? 'Cash' : 'GCash';
    }
    updatePayButtonState();
}

function updatePayButtonState() {
    const payButton = document.getElementById('payButton');
    if (!payButton) return;
    
    const hasItems = currentOrder.length > 0;
    const hasOrderType = orderType && orderType !== "None";
    const hasPaymentMethod = selectedPaymentMethod;
    
    payButton.disabled = !(hasItems && hasOrderType && hasPaymentMethod);
    payButton.style.opacity = payButton.disabled ? '0.6' : '1';
    payButton.style.backgroundColor = payButton.disabled ? '#6c757d' : '#28a745';
    payButton.style.cursor = payButton.disabled ? 'not-allowed' : 'pointer';
}

function Payment() {
    if (!currentOrder.length) {
        alert("Please add items to order");
        return;
    }
    
    if (!orderType || orderType === "None") {
        alert("Please select order type");
        return;
    }
    
    if (!selectedPaymentMethod) {
        alert("Please select payment method");
        return;
    }
    
    const total = currentOrder.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (confirm(`Process payment of ₱${total.toFixed(2)}?`)) {
        alert("Order processed successfully!");
        clearCurrentOrder();
    }
}

// ==================== 📋 CATEGORY FUNCTIONS ====================
function filterCategory(category) {
    currentCategory = category;
    
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });
    
    renderMenu();
}

function searchFood(searchTerm) {
    const container = document.getElementById('menuContainer');
    if (!container) return;
    
    if (!searchTerm.trim()) {
        renderMenu();
        return;
    }
    
    const term = searchTerm.toLowerCase().trim();
    const filtered = productCatalog.filter(product => {
        if (currentCategory !== 'all' && product.category !== currentCategory) return false;
        return product.name.toLowerCase().includes(term);
    });
    
    container.innerHTML = '';
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px 20px;
                text-align: center;
                min-height: 300px;
                color: #666;
            ">
                <div style="font-size: 48px; margin-bottom: 20px;">🔍</div>
                <h3 style="margin: 10px 0; font-size: 20px; color: #333;">No Results Found</h3>
                <p style="margin: 10px 0; font-size: 14px; color: #999;">
                    No products match your search for "<strong>${term}</strong>"
                </p>
                <p style="margin: 10px 0; font-size: 13px; color: #bbb;">
                    Try a different search term or browse by category.
                </p>
            </div>
        `;
        return;
    }
    
    filtered.forEach(product => {
        container.appendChild(createProductCard(product));
    });
}

// ==================== 💾 STORAGE FUNCTIONS ====================
function saveInventoryToStorage() {
    localStorage.setItem('servingwareInventory', JSON.stringify(servingwareInventory));
    localStorage.setItem('ingredientInventory', JSON.stringify(ingredientInventory));
}

function loadInventoryFromStorage() {
    const saved = localStorage.getItem('servingwareInventory');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            Object.keys(parsed).forEach(key => {
                if (servingwareInventory[key]) {
                    servingwareInventory[key].current = parsed[key].current;
                }
            });
        } catch (e) {}
    }
}

// ==================== � REAL-TIME STOCK UPDATES ====================
function connectToStockUpdates() {
    try {
        // Close existing connection
        if (stockEventSource) {
            stockEventSource.close();
        }
        
        // Connect to staff real-time events endpoint
        stockEventSource = new EventSource(`${BACKEND_URL}/api/staff/events`);
        
        stockEventSource.onmessage = function(event) {
            try {
                const data = JSON.parse(event.data);
                console.log('📨 Received real-time update:', data);
                
                // Handle different event types
                if (data.type === 'stock_fulfilled') {
                    handleStockFulfilled(data);
                } else if (data.type === 'inventory_update') {
                    // Raw ingredient stock changed
                    handleInventoryUpdate(data);
                }
            } catch (e) {
                console.error('⚠️ Error parsing real-time message:', e);
            }
        };
        
        stockEventSource.onerror = function() {
            console.warn('⚠️ Real-time connection lost, attempting to reconnect...');
            stockEventSource.close();
            stockEventSource = null;
            // Try to reconnect after 5 seconds
            setTimeout(connectToStockUpdates, 5000);
        };
        
        stockEventSource.onopen = function() {
            console.log('✅ Connected to real-time stock updates');
        };
    } catch (error) {
        console.error('❌ Error connecting to real-time updates:', error);
        stockEventSource = null;
    }
}

// ==================== HANDLE STOCK FULFILLED NOTIFICATION ====================
function handleStockFulfilled(data) {
    const { productName, quantity, newStock, timestamp } = data;
    
    console.log('🎉 Stock fulfilled notification received:', {
        productName,
        quantity,
        newStock,
        timestamp
    });
    
    // Find and update product in catalog
    const product = productCatalog.find(p => p.name === productName);
    
    if (product) {
        console.log(`📦 Updating ${productName}: ${product.stock} → ${newStock}`);
        
        // Update product stock
        product.stock = newStock;
        product.status = newStock > 0 ? 'in_stock' : 'out_of_stock';
        
        // Update out-of-stock items list
        if (newStock > 0) {
            const outOfStockIndex = outOfStockItems.indexOf(productName);
            if (outOfStockIndex > -1) {
                outOfStockItems.splice(outOfStockIndex, 1);
                console.log(`✅ Removed ${productName} from out-of-stock list`);
            }
        }
        
        // Re-render the menu to show updated availability
        console.log('🎨 Re-rendering menu with updated stock...');
        renderMenu();
        
        // Show success toast to staff
        showToast(`✅ ${productName} is now back in stock! (${newStock} ${product.unit})`, 'success', 4000);
        
        // Play success sound if available
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==');
            audio.play().catch(e => console.log('Sound play skipped'));
        } catch (e) {
            // Silently fail if audio not available
        }
        
        console.log('✅ Stock fulfilled notification processed');
    } else {
        console.warn(`⚠️ Product ${productName} not found in catalog`);
    }
}

// ==================== HANDLE INVENTORY UPDATE ====================
function handleInventoryUpdate(data) {
    const { itemName, currentStock, action } = data;
    console.log(`📦 Inventory update: ${itemName} - ${action}`);
    
    if (action === 'stock_changed') {
        // Update local inventory reference if available
        if (staffInventory) {
            const item = staffInventory.find(i => i.itemName === itemName);
            if (item) {
                item.currentStock = currentStock;
                console.log(`✅ Updated inventory: ${itemName} = ${currentStock}`);
            }
        }
    }
}

// ==================== �🚀 INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Initializing POS System...');
    
    // Load saved data
    loadInventoryFromStorage();
    
    // 🔴 LOAD MENU FIRST - Wait for it to complete
    console.log('📋 Loading menu items on initialization...');
    try {
        const menuLoaded = await loadAllMenuItems();
        if (menuLoaded) {
            console.log(`✅ Menu loaded successfully with ${productCatalog.length} products`);
        } else {
            console.warn('⚠️ Menu not fully loaded, falling back to local database');
            loadFromLocalMenuDatabase();
        }
    } catch (error) {
        console.error('❌ Error during menu loading:', error);
        loadFromLocalMenuDatabase();
    }
    
    // Final validation: ensure catalog is not empty
    if (productCatalog.length === 0) {
        console.warn('⚠️⚠️ Catalog is still empty after all loading attempts, loading local database as last resort...');
        loadFromLocalMenuDatabase();
    }
    
    console.log(`📦 Initialization complete - Catalog has ${productCatalog.length} products`);
    
    // Connect to real-time stock updates from admin
    console.log('🔌 Connecting to real-time stock updates...');
    connectToStockUpdates();
    
    // Setup search
    const searchInput = document.querySelector('input[placeholder*="Search"]');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => searchFood(e.target.value));
    }
    
    // Setup category buttons
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterCategory(btn.dataset.category);
        });
    });
    
    // Setup order type buttons
    const dineInBtn = document.querySelector('.dineinandtakeout-btn:nth-child(1)');
    const takeoutBtn = document.querySelector('.dineinandtakeout-btn:nth-child(2)');
    
    if (dineInBtn) dineInBtn.addEventListener('click', setDineIn);
    if (takeoutBtn) takeoutBtn.addEventListener('click', setTakeout);
    
    // Setup payment method buttons
    const cashBtn = document.querySelector('.payment-method-btn:nth-child(1)');
    const gcashBtn = document.querySelector('.payment-method-btn:nth-child(2)');
    
    if (cashBtn) cashBtn.addEventListener('click', () => selectPaymentMethod('cash'));
    if (gcashBtn) gcashBtn.addEventListener('click', () => selectPaymentMethod('gcash'));
    
    // Initial render
    renderMenu();
    updatePayButtonState();
    
    console.log(`✅ POS System initialized with ${productCatalog.length} products ready`);
});

// Auto-save every 30 seconds
setInterval(saveInventoryToStorage, 30000);

// ==================== 🎯 EXPORT GLOBAL FUNCTIONS ====================
window.setDineIn = setDineIn;
window.setTakeout = setTakeout;
window.selectPaymentMethod = selectPaymentMethod;
window.Payment = Payment;
window.clearCurrentOrder = clearCurrentOrder;
window.removeItemFromOrder = removeItemFromOrder;
window.filterCategory = filterCategory;
window.searchFood = searchFood;
window.handleLogout = handleLogout;
window.productCatalog = productCatalog;