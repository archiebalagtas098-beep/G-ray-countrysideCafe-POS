// ==================== GLOBAL VARIABLES ====================
let allMenuItems = [];
let notifications = [];
let notificationCount = 0;
let isNotificationModalOpen = false;
let hasNewNotifications = false;
let currentSection = 'dashboard';
let currentCategory = 'all';
let isModalOpen = false;
let retryCount = 0;
let currentInventoryCache = []; // Cache for current inventory items
let lastInventoryCacheTime = 0; // Timestamp of last inventory fetch

// Send Stock Global Variables
let stocksData = [];
let changes = new Map();
let sendStockUIInitialized = false; // Flag to prevent re-rendering flicker
let lastQuantityValues = new Map(); // Store quantity values before re-render
let staffInventoryCache = []; // Cache for staff inventory
let lastStaffInventoryFetch = 0; // Timestamp of last staff inventory fetch

// PAGINATION VARIABLES
let currentPage = 1;
let itemsPerPage = 15;
let totalPages = 1;
let filteredStocksData = [];

// NOTIFICATION EVENT SOURCE
let notificationEventSource = null;

// WEBSOCKET CONNECTION
let adminWebSocket = null;

// ✅ STOCK REQUEST MODAL VARIABLES
let pendingStockRequests = [];
let stockRequestTimestamps = {};
let activeStockRequestModals = new Set();

const MAX_RETRIES = 3;
const BACKEND_URL = 'http://localhost:5050';
const INVENTORY_CACHE_DURATION = 5000;
const MAX_STOCK_PER_ITEM = 100;

// ==================== 🥩 REAL INGREDIENT INVENTORY ====================
const ingredientInventory = {
    'pork': { name: 'Pork', current: 100, max: 500, unit: 'kg', minThreshold: 20 },
    'chicken': { name: 'Chicken', current: 100, max: 300, unit: 'kg', minThreshold: 15 },
    'beef': { name: 'Beef', current: 50, max: 200, unit: 'kg', minThreshold: 10 },
    'shrimp': { name: 'Shrimp', current: 50, max: 100, unit: 'kg', minThreshold: 8 },
    'fish': { name: 'Cream Dory', current: 50, max: 150, unit: 'kg', minThreshold: 10 },
    'pork_belly': { name: 'Pork Belly', current: 50, max: 100, unit: 'kg', minThreshold: 10 },
    'pork_chop': { name: 'Pork Chop', current: 50, max: 80, unit: 'kg', minThreshold: 8 },
    'onion': { name: 'Onion', current: 30, max: 50, unit: 'kg', minThreshold: 5 },
    'garlic': { name: 'Garlic', current: 20, max: 30, unit: 'kg', minThreshold: 3 },
    'cabbage': { name: 'Cabbage', current: 30, max: 40, unit: 'kg', minThreshold: 5 },
    'carrot': { name: 'Carrot', current: 20, max: 30, unit: 'kg', minThreshold: 5 },
    'bell_pepper': { name: 'Bell Pepper', current: 15, max: 20, unit: 'kg', minThreshold: 3 },
    'calamansi': { name: 'Calamansi', current: 15, max: 20, unit: 'kg', minThreshold: 5 },
    'tomato': { name: 'Tomato', current: 20, max: 30, unit: 'kg', minThreshold: 5 },
    'potato': { name: 'Potato', current: 30, max: 100, unit: 'kg', minThreshold: 10 },
    'cucumber': { name: 'Cucumber', current: 20, max: 30, unit: 'kg', minThreshold: 5 },
    'eggplant': { name: 'Eggplant', current: 20, max: 30, unit: 'kg', minThreshold: 5 },
    'green_beans': { name: 'Green Beans', current: 20, max: 30, unit: 'kg', minThreshold: 5 },
    'rice': { name: 'Rice', current: 100, max: 200, unit: 'kg', minThreshold: 30 },
    'pancit_bihon': { name: 'Pancit Bihon', current: 50, max: 100, unit: 'kg', minThreshold: 15 },
    'pancit_canton': { name: 'Pancit Canton', current: 50, max: 100, unit: 'kg', minThreshold: 15 },
    'spaghetti_pasta': { name: 'Spaghetti Pasta', current: 50, max: 80, unit: 'kg', minThreshold: 10 },
    'soy_sauce': { name: 'Soy Sauce', current: 40, max: 50, unit: 'liter', minThreshold: 10 },
    'vinegar': { name: 'Vinegar', current: 40, max: 50, unit: 'liter', minThreshold: 10 },
    'oyster_sauce': { name: 'Oyster Sauce', current: 30, max: 30, unit: 'liter', minThreshold: 5 },
    'fish_sauce': { name: 'Fish Sauce', current: 30, max: 30, unit: 'liter', minThreshold: 5 },
    'butter': { name: 'Butter', current: 20, max: 30, unit: 'kg', minThreshold: 5 },
    'honey': { name: 'Honey', current: 15, max: 20, unit: 'liter', minThreshold: 3 },
    'cooking_oil': { name: 'Cooking Oil', current: 40, max: 50, unit: 'liter', minThreshold: 10 },
    'milk': { name: 'Milk', current: 30, max: 50, unit: 'liter', minThreshold: 10 },
    'cheese': { name: 'Cheese', current: 20, max: 30, unit: 'kg', minThreshold: 5 },
    'cream': { name: 'Cream', current: 15, max: 20, unit: 'liter', minThreshold: 3 },
    'coffee_beans': { name: 'Coffee Beans', current: 20, max: 30, unit: 'kg', minThreshold: 5 },
    'milk_tea_base': { name: 'Milk Tea Base', current: 25, max: 40, unit: 'liter', minThreshold: 8 },
    'matcha': { name: 'Matcha Powder', current: 8, max: 10, unit: 'kg', minThreshold: 2 },
    'lemon': { name: 'Lemon', current: 20, max: 30, unit: 'kg', minThreshold: 5 },
    'strawberry': { name: 'Strawberry', current: 15, max: 20, unit: 'kg', minThreshold: 3 },
    'mango': { name: 'Mango', current: 20, max: 30, unit: 'kg', minThreshold: 5 },
    'nachos': { name: 'Nachos Chips', current: 30, max: 50, unit: 'kg', minThreshold: 10 },
    'french_fries': { name: 'French Fries', current: 30, max: 50, unit: 'kg', minThreshold: 10 },
    'bread': { name: 'Bread', current: 30, max: 50, unit: 'loaf', minThreshold: 10 },
    'lumpia_wrapper': { name: 'Lumpia Wrapper', current: 60, max: 100, unit: 'pack', minThreshold: 20 },
    'dynamite': { name: 'Dynamite', current: 30, max: 50, unit: 'kg', minThreshold: 8 },
    'egg': { name: 'Egg', current: 300, max: 500, unit: 'piece', minThreshold: 50 },
    'tuyo': { name: 'Tuyo', current: 20, max: 30, unit: 'kg', minThreshold: 5 },
    'tinapa': { name: 'Tinapa', current: 20, max: 30, unit: 'kg', minThreshold: 5 },
    'sugar': { name: 'Sugar', current: 30, max: 50, unit: 'kg', minThreshold: 10 },
    'salt': { name: 'Salt', current: 30, max: 50, unit: 'kg', minThreshold: 10 },
    'black_pepper': { name: 'Black Pepper', current: 20, max: 30, unit: 'kg', minThreshold: 5 },
    'water': { name: 'Water', current: 100, max: 200, unit: 'liter', minThreshold: 30 }
};

// ==================== 🍽️ SERVINGWARE INVENTORY ====================
const servingwareInventory = {
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

// ==================== 🍽️ PRODUCT INGREDIENT MAPPING ====================
const productIngredientMap = {
    // ==================== RICE MEALS ====================
    'Korean Spicy Bulgogi (Pork)': {
        ingredients: { 'pork': 0.25, 'gochujang': 0.03, 'soy_sauce': 0.03, 'garlic': 0.02, 'onion': 0.05, 'sugar': 0.01, 'sesame_oil': 0.02, 'chili_flakes': 0.005, 'black_pepper': 0.005 },
        servingware: 'plate'
    },
    'Korean Salt and Pepper (Pork)': {
        ingredients: { 'pork': 0.25, 'salt': 0.01, 'black_pepper': 0.01, 'garlic': 0.02, 'chili': 0.005, 'cornstarch': 0.02 },
        servingware: 'plate'
    },
    'Crispy Pork Lechon Kawali': {
        ingredients: { 'pork_belly': 0.35, 'garlic': 0.03, 'bay_leaves': 2, 'peppercorn': 0.01, 'salt': 0.01, 'cooking_oil': 0.25 },
        servingware: 'plate'
    },
    'Cream Dory Fish Fillet': {
        ingredients: { 'cream_dory': 0.25, 'flour': 0.05, 'salt': 0.01, 'black_pepper': 0.005, 'butter': 0.05, 'garlic': 0.02, 'cream': 0.1 },
        servingware: 'plate'
    },
    'Buttered Honey Chicken': {
        ingredients: { 'chicken': 0.25, 'butter': 0.05, 'honey': 0.07, 'garlic': 0.02, 'soy_sauce': 0.02, 'black_pepper': 0.005 },
        servingware: 'plate'
    },
    'Buttered Spicy Chicken': {
        ingredients: { 'chicken': 0.25, 'butter': 0.05, 'chili_flakes': 0.01, 'garlic': 0.02, 'soy_sauce': 0.02 },
        servingware: 'plate'
    },
    'Chicken Adobo': {
        ingredients: { 'chicken': 0.3, 'soy_sauce': 0.05, 'vinegar': 0.04, 'garlic': 0.03, 'bay_leaves': 2, 'peppercorn': 0.01 },
        servingware: 'plate'
    },
    'Pork Shanghai': {
        ingredients: { 'ground_pork': 0.2, 'carrot': 0.03, 'onion': 0.03, 'garlic': 0.02, 'egg': 1, 'breadcrumbs': 0.03, 'lumpia_wrapper': 10, 'cooking_oil': 0.1 },
        servingware: 'plate'
    },

    // ==================== SIZZLING ====================
    'Sizzling Pork Sisig': {
        ingredients: { 'pork': 0.3, 'onion': 0.08, 'chili': 0.02, 'calamansi': 0.03, 'mayonnaise': 0.05, 'soy_sauce': 0.02, 'egg': 1, 'cooking_oil': 0.1 },
        servingware: 'sizzling plate'
    },
    'Sizzling Liempo': {
        ingredients: { 'pork_belly': 0.3, 'garlic': 0.02, 'soy_sauce': 0.03, 'black_pepper': 0.01, 'cooking_oil': 0.1 },
        servingware: 'sizzling plate'
    },
    'Sizzling Porkchop': {
        ingredients: { 'pork_chop': 0.35, 'garlic': 0.02, 'soy_sauce': 0.03, 'black_pepper': 0.01, 'cooking_oil': 0.1 },
        servingware: 'sizzling plate'
    },
    'Sizzling Fried Chicken': {
        ingredients: { 'fried_chicken': 0.35, 'flour': 0.03, 'garlic': 0.02, 'black_pepper': 0.01, 'gravy': 0.2, 'cooking_oil': 0.1 },
        servingware: 'sizzling plate'
    },

    // ==================== PARTY TRAYS ====================
    'Pancit Bihon': {
        ingredients: { 'rice_noodles': 0.5, 'chicken': 0.1, 'cabbage': 0.15, 'carrot': 0.1, 'garlic': 0.03, 'onion': 0.05, 'soy_sauce': 0.05, 'oyster_sauce': 0.02, 'cooking_oil': 0.05 },
        servingware: 'tray'
    },
    'Pancit Canton + Bihon (Mixed)': {
        ingredients: { 'pancit_canton': 0.3, 'rice_noodles': 0.3, 'chicken': 0.15, 'cabbage': 0.2, 'carrot': 0.15, 'garlic': 0.04, 'onion': 0.08, 'soy_sauce': 0.08, 'oyster_sauce': 0.03, 'chicken_broth': 0.2, 'cooking_oil': 0.08 },
        servingware: 'tray'
    },
    'Spaghetti (Filipino Style)': {
        ingredients: { 'spaghetti_pasta': 0.5, 'sweet_tomato_sauce': 0.2, 'ground_meat': 0.15, 'hotdog': 0.1, 'cheese': 0.08, 'garlic': 0.02, 'onion': 0.03, 'cooking_oil': 0.05 },
        servingware: 'tray'
    },

    // ==================== DRINKS ====================
    'Cucumber Lemonade': {
        ingredients: { 'cucumber': 0.1, 'lemon': 0.1, 'sugar': 0.05, 'water': 0.3, 'ice': 0.1 },
        servingware: 'glass'
    },
    'Blue Lemonade': {
        ingredients: { 'lemon_juice': 0.15, 'blue_syrup': 0.05, 'sugar': 0.05, 'water': 0.3, 'ice': 0.1 },
        servingware: 'glass'
    },
    'Red Tea': {
        ingredients: { 'tea': 0.02, 'sugar': 0.05, 'water': 0.3, 'ice': 0.1 },
        servingware: 'glass'
    },
    'Soda (Mismo / 1.5L)': {
        ingredients: { 'carbonated_soft_drink': 1 },
        servingware: 'bottle'
    },

    // ==================== COFFEE ====================
    'Cafe Americano': {
        ingredients: { 'espresso': 0.03, 'hot_water': 0.2 },
        servingware: 'cup'
    },
    'Cafe Latte': {
        ingredients: { 'espresso': 0.03, 'steamed_milk': 0.25 },
        servingware: 'cup'
    },
    'Caramel Macchiato': {
        ingredients: { 'espresso': 0.03, 'milk': 0.2, 'caramel_syrup': 0.03, 'vanilla_syrup': 0.01 },
        servingware: 'cup'
    },

    // ==================== MILK TEA / FRAPPE ====================
    'Milk Tea': {
        ingredients: { 'black_tea': 0.02, 'milk': 0.2, 'sugar': 0.05, 'tapioca_pearls': 0.03 },
        servingware: 'cup'
    },
    'Matcha Green Tea': {
        ingredients: { 'matcha_powder': 0.01, 'milk': 0.25, 'sugar': 0.05 },
        servingware: 'cup'
    },
    'Cookies & Cream Frappe': {
        ingredients: { 'ice': 0.2, 'milk': 0.2, 'cookie_crumbs': 0.03, 'cream': 0.1 },
        servingware: 'cup'
    },
    'Strawberry & Cream Frappe': {
        ingredients: { 'strawberry_syrup': 0.05, 'milk': 0.2, 'ice': 0.2, 'cream': 0.1 },
        servingware: 'cup'
    },
    'Mango Cheesecake Frappe': {
        ingredients: { 'mango_flavor': 0.05, 'cream_cheese_flavor': 0.03, 'milk': 0.2, 'ice': 0.2 },
        servingware: 'cup'
    },

    // ==================== SNACKS ====================
    'Cheesy Nachos': {
        ingredients: { 'nacho_chips': 0.3, 'cheese_sauce': 0.15 },
        servingware: 'serving'
    },
    'Nachos Supreme': {
        ingredients: { 'nacho_chips': 0.3, 'cheese': 0.15, 'ground_meat': 0.1, 'tomato': 0.05, 'onion': 0.03 },
        servingware: 'serving'
    },
    'French Fries': {
        ingredients: { 'potato': 0.25, 'cooking_oil': 0.1, 'salt': 0.005 },
        servingware: 'serving'
    },
    'Clubhouse Sandwich': {
        ingredients: { 'bread': 0.1, 'chicken': 0.1, 'ham': 0.05, 'egg': 1, 'lettuce': 0.03, 'tomato': 0.05, 'mayonnaise': 0.02 },
        servingware: 'sandwich'
    },
    'Fish and Fries': {
        ingredients: { 'fish_fillet': 0.15, 'batter': 0.05, 'potato': 0.2, 'cooking_oil': 0.15, 'salt': 0.005 },
        servingware: 'serving'
    },
    'Cheesy Dynamite Lumpia': {
        ingredients: { 'chili': 0.05, 'cheese': 0.05, 'lumpia_wrapper': 10, 'cooking_oil': 0.1 },
        servingware: 'plate'
    },
    'Lumpiang Shanghai': {
        ingredients: { 'ground_pork': 0.15, 'vegetables': 0.1, 'lumpia_wrapper': 15, 'cooking_oil': 0.15 },
        servingware: 'plate'
    },

    // ==================== BUDGET MEALS ====================
    'Fried Chicken': {
        ingredients: { 'chicken': 0.25, 'flour': 0.05, 'garlic': 0.02, 'black_pepper': 0.005, 'cooking_oil': 0.2, 'salt': 0.01 },
        servingware: 'plate'
    },
    'Tinapa Rice': {
        ingredients: { 'tinapa': 0.1, 'rice': 0.3, 'garlic': 0.02, 'egg': 1, 'cooking_oil': 0.05 },
        servingware: 'meal'
    },
    'Tuyo Pesto': {
        ingredients: { 'tuyo': 0.08, 'pasta': 0.3, 'garlic': 0.02, 'cooking_oil': 0.05, 'herbs': 0.01 },
        servingware: 'meal'
    },
    'Fried Rice': {
        ingredients: { 'rice': 0.3, 'garlic': 0.03, 'egg': 1, 'soy_sauce': 0.02, 'cooking_oil': 0.05 },
        servingware: 'bowl'
    },
    'Plain Rice': {
        ingredients: { 'rice': 0.25, 'water': 0.5 },
        servingware: 'bowl'
    },

    // ==================== SPECIALTIES ====================
    'Sinigang (Pork)': {
        ingredients: { 'pork': 0.4, 'tamarind_mix': 0.05, 'tomato': 0.05, 'onion': 0.05, 'radish': 0.1, 'kangkong': 0.1 },
        servingware: 'pot'
    },
    'Sinigang (Shrimp)': {
        ingredients: { 'shrimp': 0.35, 'tamarind_mix': 0.05, 'tomato': 0.05, 'onion': 0.05, 'kangkong': 0.1 },
        servingware: 'pot'
    },
    'Paknet (Pakbet w/ Bagnet)': {
        ingredients: { 'bagnet': 0.2, 'eggplant': 0.15, 'squash': 0.15, 'okra': 0.1, 'ampalaya': 0.1, 'shrimp_paste': 0.02, 'cooking_oil': 0.05 },
        servingware: 'serving'
    },
    'Buttered Shrimp': {
        ingredients: { 'shrimp': 0.3, 'butter': 0.1, 'garlic': 0.03, 'sugar': 0.01, 'salt': 0.005 },
        servingware: 'serving'
    },
    'Special Bulalo': {
        ingredients: { 'beef_shank': 0.8, 'corn': 0.1, 'cabbage': 0.3, 'potato': 0.2, 'onion': 0.1, 'peppercorn': 0.01 },
        servingware: 'pot'
    },

    // ==================== PACKAGING (No Ingredients) ====================
    'Paper Cups (12oz)': {
        ingredients: {},
        servingware: 'pack'
    },
    'Paper Cups (16oz)': {
        ingredients: {},
        servingware: 'pack'
    },
    'Straws (Regular)': {
        ingredients: {},
        servingware: 'pack'
    },
    'Straws (Boba)': {
        ingredients: {},
        servingware: 'pack'
    },
    'Food Containers (Small)': {
        ingredients: {},
        servingware: 'pack'
    },
    'Food Containers (Medium)': {
        ingredients: {},
        servingware: 'pack'
    },
    'Food Containers (Large)': {
        ingredients: {},
        servingware: 'pack'
    },
    'Plastic Utensils Set': {
        ingredients: {},
        servingware: 'set'
    },
    'Napkins (Pack of 50)': {
        ingredients: {},
        servingware: 'pack'
    }
};

// ==================== FALLBACK DATA - USE THIS WHEN BACKEND IS DOWN ====================
const FALLBACK_MENU_ITEMS = [
    { _id: 'fallback_1', name: 'Korean Spicy Bulgogi (Pork)', category: 'Rice', unit: 'plate', price: 180, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_2', name: 'Korean Salt and Pepper (Pork)', category: 'Rice', unit: 'plate', price: 175, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_3', name: 'Crisky Pork Lechon Kawali', category: 'Rice', unit: 'plate', price: 165, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_4', name: 'Cream Dory Fish Fillet', category: 'Rice', unit: 'plate', price: 160, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_5', name: 'Buttered Honey Chicken', category: 'Rice', unit: 'plate', price: 155, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_6', name: 'Buttered Spicy Chicken', category: 'Rice', unit: 'plate', price: 155, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_7', name: 'Chicken Adobo', category: 'Rice', unit: 'plate', price: 145, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_8', name: 'Pork Shanghai', category: 'Rice', unit: 'plate', price: 140, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_9', name: 'Sizzling Pork Sisig', category: 'Sizzling', unit: 'sizzling plate', price: 220, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_10', name: 'Sizzling Liempo', category: 'Sizzling', unit: 'sizzling plate', price: 210, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_11', name: 'Sizzling Porkchop', category: 'Sizzling', unit: 'sizzling plate', price: 195, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_12', name: 'Sizzling Fried Chicken', category: 'Sizzling', unit: 'sizzling plate', price: 185, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_13', name: 'Pancit Bihon (S)', category: 'Party', unit: 'tray', price: 350, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_14', name: 'Pancit Bihon (M)', category: 'Party', unit: 'tray', price: 550, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_15', name: 'Pancit Bihon (L)', category: 'Party', unit: 'tray', price: 750, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_16', name: 'Pancit Canton (S)', category: 'Party', unit: 'tray', price: 380, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_17', name: 'Pancit Canton (M)', category: 'Party', unit: 'tray', price: 580, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_18', name: 'Pancit Canton (L)', category: 'Party', unit: 'tray', price: 780, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_19', name: 'Spaghetti (S)', category: 'Party', unit: 'tray', price: 400, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_20', name: 'Spaghetti (M)', category: 'Party', unit: 'tray', price: 600, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_21', name: 'Spaghetti (L)', category: 'Party', unit: 'tray', price: 800, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_22', name: 'Cucumber Lemonade (Glass)', category: 'Drink', unit: 'glass', price: 60, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_23', name: 'Cucumber Lemonade (Pitcher)', category: 'Drink', unit: 'pitcher', price: 180, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_24', name: 'Blue Lemonade (Glass)', category: 'Drink', unit: 'glass', price: 65, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_25', name: 'Blue Lemonade (Pitcher)', category: 'Drink', unit: 'pitcher', price: 190, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_26', name: 'Red Tea (Glass)', category: 'Drink', unit: 'glass', price: 55, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_27', name: 'Soda (Mismo)', category: 'Drink', unit: 'bottle', price: 25, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_28', name: 'Soda 1.5L', category: 'Drink', unit: 'bottle', price: 65, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_29', name: 'Cafe Americano Tall', category: 'Cafe', unit: 'cup', price: 80, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_30', name: 'Cafe Americano Grande', category: 'Cafe', unit: 'cup', price: 95, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_31', name: 'Cafe Latte Tall', category: 'Cafe', unit: 'cup', price: 90, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_32', name: 'Cafe Latte Grande', category: 'Cafe', unit: 'cup', price: 105, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_33', name: 'Caramel Macchiato Tall', category: 'Cafe', unit: 'cup', price: 100, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_34', name: 'Caramel Macchiato Grande', category: 'Cafe', unit: 'cup', price: 115, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_35', name: 'Milk Tea Regular HC', category: 'Milk', unit: 'cup', price: 85, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_36', name: 'Milk Tea Regular MC', category: 'Milk', unit: 'cup', price: 95, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_37', name: 'Matcha Green Tea HC', category: 'Milk', unit: 'cup', price: 90, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_38', name: 'Matcha Green Tea MC', category: 'Milk', unit: 'cup', price: 100, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_39', name: 'Cheesy Nachos', category: 'Snack & Appetizer', unit: 'serving', price: 150, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_40', name: 'Nachos Supreme', category: 'Snack & Appetizer', unit: 'serving', price: 180, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_41', name: 'French fries', category: 'Snack & Appetizer', unit: 'serving', price: 90, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_42', name: 'Clubhouse Sandwich', category: 'Snack & Appetizer', unit: 'sandwich', price: 120, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_43', name: 'Fish and Fries', category: 'Snack & Appetizer', unit: 'serving', price: 160, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_44', name: 'Cheesy Dynamite Lumpia', category: 'Snack & Appetizer', unit: 'piece', price: 25, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_45', name: 'Lumpiang Shanghai', category: 'Snack & Appetizer', unit: 'piece', price: 20, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_46', name: 'Fried Chicken', category: 'Budget Meals Served with Rice', unit: 'meal', price: 95, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_47', name: 'Buttered Honey Chicken', category: 'Budget Meals Served with Rice', unit: 'meal', price: 105, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_48', name: 'Buttered Spicy Chicken', category: 'Budget Meals Served with Rice', unit: 'meal', price: 105, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_49', name: 'Tinapa Rice', category: 'Budget Meals Served with Rice', unit: 'meal', price: 85, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_50', name: 'Tuyo Pesto', category: 'Budget Meals Served with Rice', unit: 'meal', price: 80, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_51', name: 'Fried Rice', category: 'Budget Meals Served with Rice', unit: 'serving', price: 50, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_52', name: 'Plain Rice', category: 'Budget Meals Served with Rice', unit: 'bowl', price: 25, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_53', name: 'Sinigang (PORK)', category: 'Specialties', unit: 'serving', price: 280, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_54', name: 'Sinigang (Shrimp)', category: 'Specialties', unit: 'serving', price: 320, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_55', name: 'Paknet (Pakbet w/ Bagnet)', category: 'Specialties', unit: 'serving', price: 260, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_56', name: 'Buttered Shrimp', category: 'Specialties', unit: 'serving', price: 300, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_57', name: 'Special Bulalo (good for 2-3 Persons)', category: 'Specialties', unit: 'pot', price: 450, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_58', name: 'Special Bulalo Buy 1 Take 1 (good for 6-8 Persons)', category: 'Specialties', unit: 'pot', price: 850, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_59', name: 'Paper Cups (12oz)', category: 'packaging', unit: 'pack', price: 250, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_60', name: 'Paper Cups (16oz)', category: 'packaging', unit: 'pack', price: 280, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_61', name: 'Straws (Regular)', category: 'packaging', unit: 'pack', price: 120, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_62', name: 'Straws (Boba)', category: 'packaging', unit: 'pack', price: 150, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_63', name: 'Food Containers (Small)', category: 'packaging', unit: 'pack', price: 180, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_64', name: 'Food Containers (Medium)', category: 'packaging', unit: 'pack', price: 220, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_65', name: 'Food Containers (Large)', category: 'packaging', unit: 'pack', price: 260, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_66', name: 'Plastic Utensils Set', category: 'packaging', unit: 'set', price: 85, currentStock: 0, minStock: 10, maxStock: 200 },
    { _id: 'fallback_67', name: 'Napkins (Pack of 50)', category: 'packaging', unit: 'pack', price: 75, currentStock: 0, minStock: 10, maxStock: 200 }
];

// ==================== FALLBACK INVENTORY DATA ====================
const FALLBACK_INVENTORY_ITEMS = [
    // ==================== MEAT & POULTRY ====================
    { _id: 'inv_1', itemName: 'Pork', currentStock: 100, unit: 'kg', category: 'meat' },
    { _id: 'inv_2', itemName: 'Pork belly', currentStock: 100, unit: 'kg', category: 'meat' },
    { _id: 'inv_3', itemName: 'Pork chop', currentStock: 100, unit: 'kg', category: 'meat' },
    { _id: 'inv_4', itemName: 'Ground pork', currentStock: 100, unit: 'kg', category: 'meat' },
    { _id: 'inv_5', itemName: 'Chicken', currentStock: 100, unit: 'kg', category: 'meat' },
    { _id: 'inv_6', itemName: 'Fried chicken', currentStock: 100, unit: 'kg', category: 'meat' },
    { _id: 'inv_7', itemName: 'Shrimp', currentStock: 100, unit: 'kg', category: 'meat' },
    { _id: 'inv_8', itemName: 'Cream dory', currentStock: 100, unit: 'kg', category: 'meat' },
    { _id: 'inv_9', itemName: 'Beef shank', currentStock: 100, unit: 'kg', category: 'meat' },
    { _id: 'inv_10', itemName: 'Bagnet', currentStock: 100, unit: 'kg', category: 'meat' },
    { _id: 'inv_11', itemName: 'Tinapa', currentStock: 100, unit: 'kg', category: 'meat' },
    { _id: 'inv_12', itemName: 'Tuyo', currentStock: 100, unit: 'kg', category: 'meat' },
    { _id: 'inv_13', itemName: 'Ham', currentStock: 100, unit: 'kg', category: 'meat' },
    { _id: 'inv_14', itemName: 'Hotdog', currentStock: 100, unit: 'kg', category: 'meat' },
    { _id: 'inv_15', itemName: 'Fish', currentStock: 100, unit: 'kg', category: 'seafood' },
    
    // ==================== FRESH PRODUCE ====================
    { _id: 'inv_16', itemName: 'Garlic', currentStock: 100, unit: 'kg', category: 'produce' },
    { _id: 'inv_17', itemName: 'Onion', currentStock: 100, unit: 'kg', category: 'produce' },
    { _id: 'inv_18', itemName: 'Carrot', currentStock: 100, unit: 'kg', category: 'produce' },
    { _id: 'inv_19', itemName: 'Cabbage', currentStock: 100, unit: 'kg', category: 'produce' },
    { _id: 'inv_20', itemName: 'Tomato', currentStock: 100, unit: 'kg', category: 'produce' },
    { _id: 'inv_21', itemName: 'Lettuce', currentStock: 100, unit: 'kg', category: 'produce' },
    { _id: 'inv_22', itemName: 'Cucumber', currentStock: 100, unit: 'kg', category: 'produce' },
    { _id: 'inv_23', itemName: 'Lemon', currentStock: 100, unit: 'kg', category: 'produce' },
    { _id: 'inv_24', itemName: 'Bell pepper', currentStock: 100, unit: 'kg', category: 'produce' },
    { _id: 'inv_25', itemName: 'Calamansi', currentStock: 100, unit: 'kg', category: 'produce' },
    { _id: 'inv_26', itemName: 'Chili', currentStock: 100, unit: 'kg', category: 'produce' },
    { _id: 'inv_27', itemName: 'Radish', currentStock: 100, unit: 'kg', category: 'produce' },
    { _id: 'inv_28', itemName: 'Kangkong', currentStock: 100, unit: 'kg', category: 'produce' },
    { _id: 'inv_29', itemName: 'Eggplant', currentStock: 100, unit: 'kg', category: 'produce' },
    { _id: 'inv_30', itemName: 'Squash', currentStock: 100, unit: 'kg', category: 'produce' },
    { _id: 'inv_31', itemName: 'Okra', currentStock: 100, unit: 'kg', category: 'produce' },
    { _id: 'inv_32', itemName: 'Ampalaya', currentStock: 100, unit: 'kg', category: 'produce' },
    { _id: 'inv_33', itemName: 'Corn', currentStock: 100, unit: 'kg', category: 'produce' },
    { _id: 'inv_34', itemName: 'Potato', currentStock: 100, unit: 'kg', category: 'produce' },
    { _id: 'inv_35', itemName: 'Bread', currentStock: 100, unit: 'loaf', category: 'produce' },
    
    // ==================== DAIRY & EGGS ====================
    { _id: 'inv_36', itemName: 'Butter', currentStock: 100, unit: 'kg', category: 'dairy' },
    { _id: 'inv_37', itemName: 'Egg', currentStock: 100, unit: 'piece', category: 'dairy' },
    { _id: 'inv_38', itemName: 'Milk', currentStock: 100, unit: 'liter', category: 'dairy' },
    { _id: 'inv_39', itemName: 'Cheese', currentStock: 100, unit: 'kg', category: 'dairy' },
    { _id: 'inv_40', itemName: 'Cream', currentStock: 100, unit: 'liter', category: 'dairy' },
    { _id: 'inv_41', itemName: 'Mayonnaise', currentStock: 100, unit: 'kg', category: 'dairy' },
    
    // ==================== PANTRY STAPLES ====================
    { _id: 'inv_42', itemName: 'Soy sauce', currentStock: 100, unit: 'liter', category: 'dry' },
    { _id: 'inv_43', itemName: 'Vinegar', currentStock: 100, unit: 'liter', category: 'dry' },
    { _id: 'inv_44', itemName: 'Salt', currentStock: 100, unit: 'kg', category: 'dry' },
    { _id: 'inv_45', itemName: 'Sugar', currentStock: 100, unit: 'kg', category: 'dry' },
    { _id: 'inv_46', itemName: 'Black pepper', currentStock: 100, unit: 'kg', category: 'dry' },
    { _id: 'inv_47', itemName: 'Cooking oil', currentStock: 100, unit: 'liter', category: 'dry' },
    { _id: 'inv_48', itemName: 'Sesame oil', currentStock: 100, unit: 'liter', category: 'dry' },
    { _id: 'inv_49', itemName: 'Flour', currentStock: 100, unit: 'kg', category: 'dry' },
    { _id: 'inv_50', itemName: 'Cornstarch', currentStock: 100, unit: 'kg', category: 'dry' },
    { _id: 'inv_51', itemName: 'Breadcrumbs', currentStock: 100, unit: 'kg', category: 'dry' },
    { _id: 'inv_52', itemName: 'Gochujang', currentStock: 100, unit: 'kg', category: 'dry' },
    { _id: 'inv_53', itemName: 'Oyster sauce', currentStock: 100, unit: 'liter', category: 'dry' },
    { _id: 'inv_54', itemName: 'Shrimp paste', currentStock: 100, unit: 'kg', category: 'dry' },
    { _id: 'inv_55', itemName: 'Tamarind mix', currentStock: 100, unit: 'kg', category: 'dry' },
    { _id: 'inv_56', itemName: 'Peppercorn', currentStock: 100, unit: 'kg', category: 'dry' },
    { _id: 'inv_57', itemName: 'Chili flakes', currentStock: 100, unit: 'kg', category: 'dry' },
    { _id: 'inv_58', itemName: 'Honey', currentStock: 100, unit: 'liter', category: 'dry' },
    { _id: 'inv_59', itemName: 'Bay leaves', currentStock: 100, unit: 'kg', category: 'dry' },
    { _id: 'inv_60', itemName: 'Herbs', currentStock: 100, unit: 'kg', category: 'dry' },
    { _id: 'inv_61', itemName: 'Vegetables', currentStock: 100, unit: 'kg', category: 'dry' },
    { _id: 'inv_62', itemName: 'Sweet tomato sauce', currentStock: 100, unit: 'liter', category: 'dry' },
    { _id: 'inv_63', itemName: 'Gravy', currentStock: 100, unit: 'liter', category: 'dry' },
    { _id: 'inv_64', itemName: 'Batter', currentStock: 100, unit: 'kg', category: 'dry' },
    { _id: 'inv_65', itemName: 'Cheese sauce', currentStock: 100, unit: 'liter', category: 'dry' },
    { _id: 'inv_66', itemName: 'Ground meat', currentStock: 100, unit: 'kg', category: 'dry' },
    { _id: 'inv_67', itemName: 'Water', currentStock: 100, unit: 'liter', category: 'dry' },
    { _id: 'inv_68', itemName: 'Ice', currentStock: 100, unit: 'kg', category: 'dry' },
    
    // ==================== NOODLES & PASTA ====================
    { _id: 'inv_69', itemName: 'Pancit canton', currentStock: 100, unit: 'kg', category: 'dry' },
    { _id: 'inv_70', itemName: 'Rice noodles', currentStock: 100, unit: 'kg', category: 'dry' },
    { _id: 'inv_71', itemName: 'Spaghetti pasta', currentStock: 100, unit: 'kg', category: 'dry' },
    { _id: 'inv_72', itemName: 'Pasta', currentStock: 100, unit: 'kg', category: 'dry' },
    { _id: 'inv_73', itemName: 'Pancit bihon', currentStock: 100, unit: 'kg', category: 'dry' },
    
    // ==================== RICE & GRAINS ====================
    { _id: 'inv_74', itemName: 'Rice', currentStock: 100, unit: 'kg', category: 'dry' },
    
    // ==================== BEVERAGES ====================
    { _id: 'inv_75', itemName: 'Lemon juice', currentStock: 100, unit: 'liter', category: 'beverage' },
    { _id: 'inv_76', itemName: 'Blue syrup', currentStock: 100, unit: 'liter', category: 'beverage' },
    { _id: 'inv_77', itemName: 'Tea', currentStock: 100, unit: 'kg', category: 'beverage' },
    { _id: 'inv_78', itemName: 'Black tea', currentStock: 100, unit: 'kg', category: 'beverage' },
    { _id: 'inv_79', itemName: 'Espresso', currentStock: 100, unit: 'kg', category: 'beverage' },
    { _id: 'inv_80', itemName: 'Hot water', currentStock: 100, unit: 'liter', category: 'beverage' },
    { _id: 'inv_81', itemName: 'Steamed milk', currentStock: 100, unit: 'liter', category: 'beverage' },
    { _id: 'inv_82', itemName: 'Carbonated soft drink', currentStock: 100, unit: 'liter', category: 'beverage' },
    { _id: 'inv_83', itemName: 'Chicken broth', currentStock: 100, unit: 'liter', category: 'beverage' },
    { _id: 'inv_84', itemName: 'Milk tea base', currentStock: 100, unit: 'liter', category: 'beverage' },
    
    // ==================== COFFEE & TEA INGREDIENTS ====================
    { _id: 'inv_85', itemName: 'Coffee beans', currentStock: 100, unit: 'kg', category: 'dry' },
    { _id: 'inv_86', itemName: 'Matcha powder', currentStock: 100, unit: 'kg', category: 'dry' },
    { _id: 'inv_87', itemName: 'Caramel syrup', currentStock: 100, unit: 'liter', category: 'dry' },
    { _id: 'inv_88', itemName: 'Vanilla syrup', currentStock: 100, unit: 'liter', category: 'dry' },
    { _id: 'inv_89', itemName: 'Strawberry syrup', currentStock: 100, unit: 'liter', category: 'dry' },
    { _id: 'inv_90', itemName: 'Mango flavor', currentStock: 100, unit: 'liter', category: 'dry' },
    { _id: 'inv_91', itemName: 'Cream cheese flavor', currentStock: 100, unit: 'liter', category: 'dry' },
    { _id: 'inv_92', itemName: 'Tapioca pearls', currentStock: 100, unit: 'kg', category: 'dry' },
    { _id: 'inv_93', itemName: 'Cookie crumbs', currentStock: 100, unit: 'kg', category: 'dry' },
    
    // ==================== SNACKS & SIDES ====================
    { _id: 'inv_94', itemName: 'Nacho chips', currentStock: 100, unit: 'kg', category: 'dry' },
    { _id: 'inv_95', itemName: 'Lumpia wrapper', currentStock: 100, unit: 'kg', category: 'dry' },
    { _id: 'inv_96', itemName: 'French fries', currentStock: 100, unit: 'kg', category: 'dry' },
    
    // ==================== PACKAGING ====================
    { _id: 'inv_97', itemName: 'Paper cups', currentStock: 100, unit: 'pack', category: 'packaging' },
    { _id: 'inv_98', itemName: 'Straws', currentStock: 100, unit: 'pack', category: 'packaging' },
    { _id: 'inv_99', itemName: 'Napkins', currentStock: 100, unit: 'pack', category: 'packaging' },
    { _id: 'inv_100', itemName: 'Food containers', currentStock: 100, unit: 'pack', category: 'packaging' },
    { _id: 'inv_101', itemName: 'Plastic utensils', currentStock: 100, unit: 'pack', category: 'packaging' }
];

// ✅ FIX: Prevent inventory from resetting to 100 - load persisted values
function loadInventoryWithPersistedValues() {
    console.log('🔄 Loading persisted inventory values...');
    
    // Try to load from InventoryManager first (new system)
    if (typeof inventoryManager !== 'undefined' && inventoryManager) {
        try {
            inventoryManager.updateFallbackFromStorage(FALLBACK_INVENTORY_ITEMS);
            console.log('✅ Loaded from InventoryManager');
            return true;
        } catch (error) {
            console.warn('⚠️ InventoryManager load failed, falling back to localStorage');
        }
    }
    
    // Fallback to direct localStorage
    const persistedInventory = localStorage.getItem('menu_inventory_currentStock');
    if (persistedInventory) {
        try {
            const persistedValues = JSON.parse(persistedInventory);
            console.log('📦 Loading persisted inventory stock values (fallback method)...');
            
            // Update fallback items with persisted values
            FALLBACK_INVENTORY_ITEMS.forEach(item => {
                if (persistedValues[item.itemName] !== undefined) {
                    const oldStock = item.currentStock;
                    item.currentStock = persistedValues[item.itemName];
                    console.log(`  ${item.itemName}: ${oldStock} → ${item.currentStock} (persisted)`);
                }
            });
            
            console.log('✅ Persisted inventory values restored');
            return true;
        } catch (error) {
            console.error('❌ Error loading persisted inventory:', error);
            return false;
        }
    }
    
    console.log('⚠️ No persisted inventory found');
    return false;
}

// ✅ FIX: Save inventory stock values to prevent reset
function saveInventoryStockValues() {
    try {
        // Use InventoryManager if available
        if (typeof inventoryManager !== 'undefined' && inventoryManager) {
            inventoryManager.syncWithFallback(FALLBACK_INVENTORY_ITEMS);
            console.log('💾 Saved inventory via InventoryManager');
        } else {
            const stockValues = {};
            FALLBACK_INVENTORY_ITEMS.forEach(item => {
                stockValues[item.itemName] = item.currentStock;
            });
            localStorage.setItem('menu_inventory_currentStock', JSON.stringify(stockValues));
            console.log('💾 Saved inventory stock values (prevents reset - fallback method)');
        }
    } catch (error) {
        console.error('❌ Error saving inventory stock values:', error);
    }
}

// ==================== LOAD PERSISTED QUANTITIES FROM LOCALSTORAGE ====================
function loadPersistedQuantities() {
    try {
        const savedQuantities = localStorage.getItem('sendStockQuantities');
        if (savedQuantities) {
            const quantitiesObj = JSON.parse(savedQuantities);
            lastQuantityValues = new Map(Object.entries(quantitiesObj));
            console.log('📦 Loaded persisted quantities from localStorage:', Object.keys(quantitiesObj).length, 'items');
        }
    } catch (error) {
        console.error('❌ Error loading persisted quantities:', error);
        lastQuantityValues = new Map();
    }
}

// ==================== SAVE QUANTITIES TO LOCALSTORAGE ====================
function savePersistedQuantities() {
    try {
        const quantitiesObj = Object.fromEntries(lastQuantityValues);
        localStorage.setItem('sendStockQuantities', JSON.stringify(quantitiesObj));
        console.log('💾 Saved persisted quantities to localStorage');
    } catch (error) {
        console.error('❌ Error saving persisted quantities:', error);
    }
}

// ==================== CLEAR PERSISTED QUANTITIES ====================
function clearPersistedQuantities() {
    try {
        localStorage.removeItem('sendStockQuantities');
        lastQuantityValues.clear();
        console.log('🗑️ Cleared persisted quantities from localStorage');
    } catch (error) {
        console.error('❌ Error clearing persisted quantities:', error);
    }
}

// ==================== PERMANENT STOCK VALUES STORAGE - NEVER RESETS ====================
function savePermanentStockValues() {
    try {
        const stockValues = {};
        stocksData.forEach(item => {
            stockValues[item.name] = item.quantity;
        });
        localStorage.setItem('sendStock_permanentValues', JSON.stringify(stockValues));
        console.log('💾 Saved PERMANENT stock values:', Object.keys(stockValues).length, 'items');
    } catch (error) {
        console.error('❌ Error saving permanent stock values:', error);
    }
}

function loadPermanentStockValues() {
    try {
        const saved = localStorage.getItem('sendStock_permanentValues');
        if (saved) {
            const stockValues = JSON.parse(saved);
            console.log('📦 Loaded PERMANENT stock values:', Object.keys(stockValues).length, 'items');
            return stockValues;
        }
    } catch (error) {
        console.error('❌ Error loading permanent stock values:', error);
    }
    return {};
}

function updatePermanentStockValue(itemName, newQuantity) {
    try {
        const stockValues = loadPermanentStockValues();
        stockValues[itemName] = newQuantity;
        localStorage.setItem('sendStock_permanentValues', JSON.stringify(stockValues));
        console.log(`💾 Updated PERMANENT stock for "${itemName}": ${newQuantity}`);
        
        const stockItem = stocksData.find(item => item.name === itemName);
        if (stockItem) {
            stockItem.quantity = newQuantity;
        }
    } catch (error) {
        console.error('❌ Error updating permanent stock value:', error);
    }
}

// ==================== 🆕 UPDATE MENU ITEM STOCK IN MONGODB ====================
async function updateMenuItemStockInMongoDB(itemId, newStock) {
    try {
        console.log(`📤 Updating menu item stock in MongoDB...`);
        console.log(`   Item ID: ${itemId}`);
        console.log(`   New Stock: ${newStock}`);
        
        const response = await fetch(`${BACKEND_URL}/api/menu/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                currentStock: newStock
            })
        });
        
        if (!response.ok) {
            console.warn(`⚠️ Failed to update menu item in MongoDB. Status: ${response.status}`);
            const errorData = await response.json().catch(() => ({}));
            console.warn('Error details:', errorData);
            return false;
        }
        
        const updatedItem = await response.json();
        console.log(`✅ Menu item stock updated in MongoDB:`, updatedItem);
        return true;
    } catch (error) {
        console.error('❌ Error updating menu item stock in MongoDB:', error);
        return false;
    }
}

// ==================== SAVE UNIQUE ITEMS TO LOCALSTORAGE ====================
function saveUniqueItemsToLocalStorage() {
    try {
        const uniqueItems = {};
        stocksData.forEach(item => {
            if (!uniqueItems[item.name]) {
                uniqueItems[item.name] = {
                    id: item.id,
                    _id: item._id,
                    name: item.name,
                    category: item.category,
                    description: item.description,
                    quantity: item.quantity,
                    price: item.price,
                    unit: item.unit,
                    minStock: item.minStock,
                    maxStock: item.maxStock
                };
            }
        });
        localStorage.setItem('sendStock_uniqueItems', JSON.stringify(Object.values(uniqueItems)));
        console.log('💾 Saved unique items to localStorage:', Object.keys(uniqueItems).length, 'items');
    } catch (error) {
        console.error('❌ Error saving unique items:', error);
    }
}

function loadUniqueItemsFromLocalStorage() {
    try {
        const saved = localStorage.getItem('sendStock_uniqueItems');
        if (saved) {
            const items = JSON.parse(saved);
            console.log('📦 Loaded unique items from localStorage:', items.length, 'items');
            return items;
        }
    } catch (error) {
        console.error('❌ Error loading unique items:', error);
    }
    return null;
}

// ==================== SAVE NOTIFICATIONS TO LOCALSTORAGE ====================
function saveNotificationsToLocalStorage() {
    try {
        localStorage.setItem('menu_notifications', JSON.stringify(notifications));
        localStorage.setItem('menu_notificationCount', notificationCount.toString());
        localStorage.setItem('menu_hasNewNotifications', hasNewNotifications.toString());
        console.log('💾 Saved notifications to localStorage:', notifications.length, 'notifications');
    } catch (error) {
        console.error('❌ Error saving notifications:', error);
    }
}

function loadNotificationsFromLocalStorage() {
    try {
        const savedNotifications = localStorage.getItem('menu_notifications');
        if (savedNotifications) {
            notifications = JSON.parse(savedNotifications);
            console.log('📦 Loaded notifications from localStorage:', notifications.length, 'notifications');
        }
        
        const savedCount = localStorage.getItem('menu_notificationCount');
        if (savedCount) {
            notificationCount = parseInt(savedCount);
        }
        
        const savedHasNew = localStorage.getItem('menu_hasNewNotifications');
        if (savedHasNew) {
            hasNewNotifications = savedHasNew === 'true';
        }
        
        updateNotificationBadge();
        renderNotifications();
    } catch (error) {
        console.error('❌ Error loading notifications:', error);
    }
}

// ==================== CHECK FOR OUT OF STOCK PRODUCTS ====================
async function checkOutOfStockProducts() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/products/out-of-stock`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        
        if (response.ok) {
            const result = await response.json();
            const outOfStockProducts = result.data || [];
            
            if (outOfStockProducts.length > 0) {
                console.log(`🚨 Found ${outOfStockProducts.length} out of stock products`);
                
                // Add notifications for each out-of-stock product
                outOfStockProducts.forEach(product => {
                    const existingNotif = notifications.find(n => 
                        n.type === 'out_of_stock' && n.productId === product._id
                    );
                    
                    if (!existingNotif) {
                        const notification = {
                            id: `out_of_stock_${product._id}_${Date.now()}`,
                            type: 'out_of_stock',
                            productId: product._id,
                            productName: product.itemName,
                            category: product.category,
                            message: `🚨 ${product.itemName} is OUT OF STOCK!`,
                            severity: 'critical',
                            timestamp: new Date().toLocaleString('en-PH'),
                            read: false,
                            fulfilled: false
                        };
                        
                        notifications.unshift(notification);
                        hasNewNotifications = true;
                    }
                });
                
                saveNotificationsToLocalStorage();
                updateNotificationBadge();
                renderNotifications();
            }
        }
    } catch (error) {
        console.error('❌ Error checking out of stock products:', error);
    }
}

// ==================== POLL FOR OUT OF STOCK PRODUCTS ====================
function startOutOfStockMonitoring() {
    console.log('📡 Starting out-of-stock product monitoring...');
    // Check every 30 seconds
    setInterval(checkOutOfStockProducts, 30000);
    // Also check immediately on load
    checkOutOfStockProducts();
}

// ==================== CATEGORY DISPLAY NAMES ====================
const categoryDisplayNames = {
    'Rice': 'Rice Bowl Meals',
    'Sizzling': 'Hot Sizzlers',
    'Party': 'Party Trays',
    'Drink': 'Drinks',
    'Cafe': 'Coffee',
    'Milk': 'Milk Tea',
    'Frappe': 'Frappe',
    'Snack & Appetizer': 'Snacks & Appetizers',
    'Budget Meals Served with Rice': 'Budget Meals',
    'Specialties': 'Specialties',
    'packaging': 'Packaging'
};

// ==================== UNIT DISPLAY LABELS ====================
const unitDisplayLabels = {
    'plate': 'Plate',
    'plates': 'Plates',
    'sizzling plate': 'Sizzling Plate',
    'tray': 'Tray',
    'trays': 'Trays',
    'glass': 'Glass',
    'glasses': 'Glasses',
    'cup': 'Cup',
    'cups': 'Cups',
    'pitcher': 'Pitcher',
    'pitchers': 'Pitchers',
    'bottle': 'Bottle',
    'bottles': 'Bottles',
    'serving': 'Serving',
    'servings': 'Servings',
    'meal': 'Meal',
    'meals': 'Meals',
    'bowl': 'Bowl',
    'bowls': 'Bowls',
    'sandwich': 'Sandwich',
    'sandwiches': 'Sandwiches',
    'piece': 'Piece',
    'pieces': 'Pieces',
    'pot': 'Pot',
    'pots': 'Pots',
    'pack': 'Pack',
    'packs': 'Packs',
    'set': 'Set',
    'sets': 'Sets',
    'box': 'Box',
    'boxes': 'Boxes',
    'bag': 'Bag',
    'bags': 'Bags'
};

// ==================== CATEGORY UNITS MAPPING ====================
const categoryUnitsMapping = {
    'Rice': ['plate', 'serving'],
    'Sizzling': ['sizzling plate', 'plate'],
    'Party': ['tray'],
    'Drink': ['glass', 'cup', 'pitcher', 'bottle'],
    'Cafe': ['cup', 'glass'],
    'Milk': ['cup', 'glass'],
    'Frappe': ['cup', 'glass'],
    'Snack & Appetizer': ['serving', 'piece', 'sandwich'],
    'Budget Meals Served with Rice': ['meal', 'bowl'],
    'Specialties': ['serving', 'pot'],
    'packaging': ['pack', 'set', 'box', 'bag']
};

// ==================== MENU DATABASE ====================
const menuDatabase = {
    'Rice': [
        { name: 'Korean Spicy Bulgogi (Pork)', unit: 'plate', defaultPrice: 180 },
        { name: 'Korean Salt and Pepper (Pork)', unit: 'plate', defaultPrice: 175 },
        { name: 'Crisky Pork Lechon Kawali', unit: 'plate', defaultPrice: 165 },
        { name: 'Cream Dory Fish Fillet', unit: 'plate', defaultPrice: 160 },
        { name: 'Buttered Honey Chicken', unit: 'plate', defaultPrice: 155 },
        { name: 'Buttered Spicy Chicken', unit: 'plate', defaultPrice: 155 },
        { name: 'Chicken Adobo', unit: 'plate', defaultPrice: 145 },
        { name: 'Pork Shanghai', unit: 'plate', defaultPrice: 140 }
    ],
    'Sizzling': [
        { name: 'Sizzling Pork Sisig', unit: 'sizzling plate', defaultPrice: 220 },
        { name: 'Sizzling Liempo', unit: 'sizzling plate', defaultPrice: 210 },
        { name: 'Sizzling Porkchop', unit: 'sizzling plate', defaultPrice: 195 },
        { name: 'Sizzling Fried Chicken', unit: 'sizzling plate', defaultPrice: 185 }
    ],
    'Party': [
        { name: 'Pancit Bihon (S)', unit: 'tray', defaultPrice: 350 },
        { name: 'Pancit Bihon (M)', unit: 'tray', defaultPrice: 550 },
        { name: 'Pancit Bihon (L)', unit: 'tray', defaultPrice: 750 },
        { name: 'Pancit Canton (S)', unit: 'tray', defaultPrice: 380 },
        { name: 'Pancit Canton (M)', unit: 'tray', defaultPrice: 580 },
        { name: 'Pancit Canton (L)', unit: 'tray', defaultPrice: 780 },
        { name: 'Spaghetti (S)', unit: 'tray', defaultPrice: 400 },
        { name: 'Spaghetti (M)', unit: 'tray', defaultPrice: 600 },
        { name: 'Spaghetti (L)', unit: 'tray', defaultPrice: 800 }
    ],
    'Drink': [
        { name: 'Cucumber Lemonade (Glass)', unit: 'glass', defaultPrice: 60 },
        { name: 'Cucumber Lemonade (Pitcher)', unit: 'pitcher', defaultPrice: 180 },
        { name: 'Blue Lemonade (Glass)', unit: 'glass', defaultPrice: 65 },
        { name: 'Blue Lemonade (Pitcher)', unit: 'pitcher', defaultPrice: 190 },
        { name: 'Red Tea (Glass)', unit: 'glass', defaultPrice: 55 },
        { name: 'Soda (Mismo)', unit: 'bottle', defaultPrice: 25 },
        { name: 'Soda 1.5L', unit: 'bottle', defaultPrice: 65 }
    ],
    'Cafe': [
        { name: 'Cafe Americano Tall', unit: 'cup', defaultPrice: 80 },
        { name: 'Cafe Americano Grande', unit: 'cup', defaultPrice: 95 },
        { name: 'Cafe Latte Tall', unit: 'cup', defaultPrice: 90 },
        { name: 'Cafe Latte Grande', unit: 'cup', defaultPrice: 105 },
        { name: 'Caramel Macchiato Tall', unit: 'cup', defaultPrice: 100 },
        { name: 'Caramel Macchiato Grande', unit: 'cup', defaultPrice: 115 }
    ],
    'Milk': [
        { name: 'Milk Tea Regular HC', unit: 'cup', defaultPrice: 85 },
        { name: 'Milk Tea Regular MC', unit: 'cup', defaultPrice: 95 },
        { name: 'Matcha Green Tea HC', unit: 'cup', defaultPrice: 90 },
        { name: 'Matcha Green Tea MC', unit: 'cup', defaultPrice: 100 }
    ],
    'Frappe': [
        { name: 'Cookies & Cream HC', unit: 'cup', defaultPrice: 120 },
        { name: 'Cookies & Cream MC', unit: 'cup', defaultPrice: 135 },
        { name: 'Strawberry & Cream HC', unit: 'cup', defaultPrice: 130 },
        { name: 'Mango cheese cake HC', unit: 'cup', defaultPrice: 135 }
    ],
    'Snack & Appetizer': [
        { name: 'Cheesy Nachos', unit: 'serving', defaultPrice: 150 },
        { name: 'Nachos Supreme', unit: 'serving', defaultPrice: 180 },
        { name: 'French fries', unit: 'serving', defaultPrice: 90 },
        { name: 'Clubhouse Sandwich', unit: 'sandwich', defaultPrice: 120 },
        { name: 'Fish and Fries', unit: 'serving', defaultPrice: 160 },
        { name: 'Cheesy Dynamite Lumpia', unit: 'piece', defaultPrice: 25 },
        { name: 'Lumpiang Shanghai', unit: 'piece', defaultPrice: 20 }
    ],
    'Budget Meals Served with Rice': [
        { name: 'Fried Chicken', unit: 'meal', defaultPrice: 95 },
        { name: 'Buttered Honey Chicken', unit: 'meal', defaultPrice: 105 },
        { name: 'Buttered Spicy Chicken', unit: 'meal', defaultPrice: 105 },
        { name: 'Tinapa Rice', unit: 'meal', defaultPrice: 85 },
        { name: 'Tuyo Pesto', unit: 'meal', defaultPrice: 80 },
        { name: 'Fried Rice', unit: 'serving', defaultPrice: 50 },
        { name: 'Plain Rice', unit: 'bowl', defaultPrice: 25 }
    ],
    'Specialties': [
        { name: 'Sinigang (PORK)', unit: 'serving', defaultPrice: 280 },
        { name: 'Sinigang (Shrimp)', unit: 'serving', defaultPrice: 320 },
        { name: 'Paknet (Pakbet w/ Bagnet)', unit: 'serving', defaultPrice: 260 },
        { name: 'Buttered Shrimp', unit: 'serving', defaultPrice: 300 },
        { name: 'Special Bulalo (good for 2-3 Persons)', unit: 'pot', defaultPrice: 450 },
        { name: 'Special Bulalo Buy 1 Take 1 (good for 6-8 Persons)', unit: 'pot', defaultPrice: 850 }
    ],
    'packaging': [
        { name: 'Paper Cups (12oz)', unit: 'pack', defaultPrice: 250 },
        { name: 'Paper Cups (16oz)', unit: 'pack', defaultPrice: 280 },
        { name: 'Straws (Regular)', unit: 'pack', defaultPrice: 120 },
        { name: 'Straws (Boba)', unit: 'pack', defaultPrice: 150 },
        { name: 'Food Containers (Small)', unit: 'pack', defaultPrice: 180 },
        { name: 'Food Containers (Medium)', unit: 'pack', defaultPrice: 220 },
        { name: 'Food Containers (Large)', unit: 'pack', defaultPrice: 260 },
        { name: 'Plastic Utensils Set', unit: 'set', defaultPrice: 85 },
        { name: 'Napkins (Pack of 50)', unit: 'pack', defaultPrice: 75 }
    ]
};

// ==================== DOM ELEMENTS CACHE ====================
const elements = {
    itemModal: document.getElementById('itemModal'),
    modalTitle: document.getElementById('modalTitle'),
    itemForm: document.getElementById('itemForm'),
    closeModal: document.getElementById('closeModal'),
    itemId: document.getElementById('itemId'),
    itemName: document.getElementById('itemName'),
    itemCategory: document.getElementById('itemCategories'),
    itemUnit: document.getElementById('itemUnit'),
    currentStock: document.getElementById('currentStock'),
    minimumStock: document.getElementById('minimumStock'),
    maximumStock: document.getElementById('maximumStock'),
    itemPrice: document.getElementById('itemPrice'),
    addNewItem: document.getElementById('addNewItem'),
    saveItemBtn: document.querySelector('.modal-footer .btn-primary'),
    cancelBtn: document.querySelector('.modal-footer .btn-secondary'),
    navLinks: document.querySelectorAll('.nav-link[data-section]'),
    categoryItems: document.querySelectorAll('.category-item[data-category]'),
    menuGrid: document.getElementById('menuGrid'),
    dashboardGrid: document.getElementById('dashboardGrid'),
    totalProducts: document.getElementById('totalProducts'),
    lowStock: document.getElementById('lowStock'),
    outOfStock: document.getElementById('outOfStock'),
    menuValue: document.getElementById('menuValue'),
    totalMenuItems: document.getElementById('totalMenuItems'),
    currentCategoryTitle: document.getElementById('currentCategoryTitle'),
    // ✅ Missing Ingredients Modal Elements
    missingIngredientsModal: document.getElementById('missingIngredientsModal'),
    closeMissingIngredientsModal: document.getElementById('closeMissingIngredientsModal'),
    closeMissingIngredientsBtn: document.getElementById('closeMissingIngredientsBtn'),
    missingProductName: document.getElementById('missingProductName'),
    missingIngredientsList: document.getElementById('missingIngredientsList')
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Menu Management System initializing...');
    
    try {
        // 1️⃣ Load notifications from localStorage FIRST
        loadNotificationsFromLocalStorage();
        console.log('✅ Notifications loaded from localStorage');
        
        // 2️⃣ Setup UI and styles
        addNotificationStyles();
        initializeNotificationSystem();
        console.log('✅ Notification system initialized');
        
        // 3️⃣ Start monitoring for out-of-stock products
        startOutOfStockMonitoring();
        console.log('✅ Out-of-stock monitoring started');
        
        // 4️⃣ Initialize event listeners and UI
        initializeEventListeners();
        initializeCategoryDropdown();
        console.log('✅ Event listeners initialized');
        
        // 5️⃣ Load from localStorage FIRST
        loadFromLocalStorage();
        loadPersistedQuantities();
        console.log('✅ Data loaded from localStorage');
        
        // 6️⃣ Load persisted inventory stock values BEFORE using fallback
        loadInventoryWithPersistedValues();
        console.log('✅ Inventory stock values loaded');
        
        // 7️⃣ Initialize inventory with REAL data
        currentInventoryCache = FALLBACK_INVENTORY_ITEMS;
        lastInventoryCacheTime = Date.now();
        console.log(`📦 Inventory initialized with ${currentInventoryCache.length} items`);
        
        // 8️⃣ Try to load unique items from send stock
        const uniqueItems = loadUniqueItemsFromLocalStorage();
        if (uniqueItems && uniqueItems.length > 0) {
            stocksData = uniqueItems;
            sendStockUIInitialized = true;
            console.log(`✅ Loaded ${uniqueItems.length} unique items from localStorage`);
            
            // Load permanent stock values
            const permanentStockValues = loadPermanentStockValues();
            stocksData.forEach(item => {
                if (permanentStockValues[item.name] !== undefined) {
                    item.quantity = permanentStockValues[item.name];
                }
            });
        }
        
        // 9️⃣ Show dashboard section
        showSection('dashboard');
        console.log('✅ Dashboard section displayed');
        
        // 1️⃣0️⃣ Try to connect to real-time notifications
        connectToNotificationServer();
        connectWebSocket();
        console.log('✅ Real-time connections initiated');
        
        // 1️⃣1️⃣ Load pending stock requests from database
        console.log('📦 Loading pending stock requests from MongoDB...');
        await loadPendingStockRequests();
        
        // 1️⃣2️⃣ Fetch menu items from backend
        console.log('📋 Fetching menu items from backend...');
        await fetchMenuItems();
        
        // If fetchMenuItems didn't load anything, use fallback
        if (!allMenuItems || allMenuItems.length === 0) {
            console.log('⚠️ No menu items from backend, using fallback data');
            initializeFallbackData();
        }
        
        console.log(`✅ Menu Management System initialized with ${allMenuItems.length} products!`);
        
    } catch (error) {
        console.error('❌ Critical error during initialization:', error);
        console.log('💾 Falling back to localStorage data...');
        
        // Try to load from localStorage as last resort
        if (!allMenuItems || allMenuItems.length === 0) {
            initializeFallbackData();
        }
        
        showToast('System initialized with fallback data. Some features may be limited.', 'warning');
    }
});

// ==================== 📦 LOAD PENDING STOCK REQUESTS FROM DATABASE ====================
async function loadPendingStockRequests() {
    try {
        console.log('📡 Fetching pending stock requests from /api/stock-requests?status=pending...');
        
        const response = await fetch(`${BACKEND_URL}/api/stock-requests?status=pending`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        
        if (!response.ok) {
            console.warn(`⚠️ Failed to load pending requests: ${response.status}`);
            return;
        }
        
        const responseData = await response.json();
        const pendingRequests = responseData.data || [];
        
        console.log(`📦 Loaded ${pendingRequests.length} pending stock requests from database`);
        
        // Add each pending request as a notification
        if (Array.isArray(pendingRequests) && pendingRequests.length > 0) {
            for (const request of pendingRequests) {
                const exists = notifications.some(n =>
                    n.type === 'stock_request' &&
                    n.requestData &&
                    n.requestData._id === request._id
                );
                
                if (!exists) {
                    console.log(`✅ Adding notification for pending request: ${request.productName} x${request.requestedQuantity}`);
                    addNotification(
                        request.productName,
                        `Requested ${request.requestedQuantity} ${request.unit}`,
                        'stock_request',
                        request.priority || 'medium',
                        request.requestedBy || 'Staff',
                        {
                            _id: request._id,
                            quantity: request.requestedQuantity,
                            unit: request.unit,
                            priority: request.priority,
                            notes: request.notes || ''
                        }
                    );
                }
            }
            
            // Update notification badge
            updateNotificationBadge();
            console.log(`✅ ${pendingRequests.length} pending stock requests loaded and notifications created`);
        } else {
            console.log('✅ No pending stock requests found');
        }
        
    } catch (error) {
        console.error('❌ Error loading pending stock requests:', error.message);
    }
}

// ==================== CONNECT TO WEBSOCKET ====================
// Note: WebSocket is now optional - we're using SSE for real-time updates instead
function connectWebSocket() {
    try {
        // Close existing connection
        if (adminWebSocket) {
            adminWebSocket.close();
        }
        
        // Connect to WebSocket server on base /ws path
        // The server will identify this as admin based on the request context
        adminWebSocket = new WebSocket(`ws://localhost:5050/ws`);
        
        adminWebSocket.onopen = function() {
            console.log('✅ Admin WebSocket connected');
        };
        
        adminWebSocket.onerror = function(error) {
            // Silently fail - WebSocket is optional, SSE is primary
            console.log('ℹ️ WebSocket not available, using SSE for updates');
            adminWebSocket = null;
        };
        
        adminWebSocket.onclose = function() {
            adminWebSocket = null;
            // Don't reconnect automatically - SSE is handling updates
        };
    } catch (error) {
        // WebSocket not available - this is ok, SSE is primary method
        console.log('ℹ️ WebSocket unavailable, relying on SSE for real-time updates');
        adminWebSocket = null;
    }
}

// ==================== CONNECT TO NOTIFICATION SERVER ====================
function connectToNotificationServer() {
    try {
        // Close existing connection
        if (notificationEventSource) {
            notificationEventSource.close();
        }
        
        // Try to connect to SSE endpoint
        notificationEventSource = new EventSource(`${BACKEND_URL}/api/admin/events`);
        
        notificationEventSource.onmessage = function(event) {
            try {
                const data = JSON.parse(event.data);
                console.log('📨 Received notification:', data);
                
                if (data.type === 'stock_request') {
                    handleStockRequestNotification(data);
                } else if (data.type === 'low_stock_alert') {
                    handleLowStockAlert(data);
                }
            } catch (e) {
                // Silently fail on parse error
            }
        };
        
        notificationEventSource.onerror = function() {
            // Silently fail - notifications are optional
            notificationEventSource.close();
            notificationEventSource = null;
        };
        
        notificationEventSource.onopen = function() {
            console.log('✅ Connected to notification server');
        };
    } catch (error) {
        // Notification server not available - this is ok
        notificationEventSource = null;
    }
}

// ==================== INITIALIZE FALLBACK DATA ====================
function initializeFallbackData() {
    console.log('📋 Initializing fallback menu data...');
    
    // Set allMenuItems
    allMenuItems = FALLBACK_MENU_ITEMS;
    
    // Build unique stocks data
    buildUniqueStocksData(allMenuItems);
    
    // Save to localStorage
    saveToLocalStorage();
    saveUniqueItemsToLocalStorage();
    savePermanentStockValues();
    
    updateAllUIComponents();
}

// ==================== LOAD FROM LOCALSTORAGE ====================
function loadFromLocalStorage() {
    try {
        const backup = localStorage.getItem('menuItems_backup');
        if (backup) {
            const parsedData = JSON.parse(backup);
            allMenuItems = Array.isArray(parsedData) ? parsedData : [];
            console.log('📦 Loaded from localStorage:', allMenuItems.length, 'items');
            updateAllUIComponents();
        } else {
            // No backup, use fallback
            allMenuItems = FALLBACK_MENU_ITEMS;
            console.log('📋 Using fallback menu data:', allMenuItems.length, 'items');
        }
    } catch (error) {
        console.error('❌ Error loading from localStorage:', error);
        allMenuItems = FALLBACK_MENU_ITEMS;
    }
}

// ==================== NOTIFICATION STYLES ====================
function addNotificationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .notification-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            background: #dc3545;
            color: white;
            font-size: 11px;
            font-weight: bold;
            border-radius: 50%;
            min-width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 4px;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }

        .notification-item {
            padding: 15px;
            border-bottom: 1px solid #eee;
            cursor: pointer;
            transition: background 0.2s;
            position: relative;
        }
        
        .notification-item:hover {
            background: #f5f5f5;
        }
        
        .notification-item.unread {
            background: #fff8e1;
            border-left: 4px solid #ff9800;
        }
        
        .notification-priority {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
            margin-left: 8px;
        }
        
        .priority-normal {
            background: #17a2b8;
            color: white;
        }
        
        .priority-urgent {
            background: #ffc107;
            color: #212529;
        }
        
        .priority-asap {
            background: #dc3545;
            color: white;
        }
        
        .toast {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            z-index: 9999;
            opacity: 0;
            transform: translateX(100%);
            transition: opacity 0.3s, transform 0.3s;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .toast-success { background: #28a745; }
        .toast-error { background: #dc3545; }
        .toast-warning { background: #ffc107; color: #212529; }
        .toast-info { background: #17a2b8; }
        
        .show {
            opacity: 1 !important;
            transform: translateX(0) !important;
        }

        #notificationNavItem {
            position: relative;
            list-style: none;
            margin-left: auto;
        }

        .notification-icon {
            position: relative;
            display: flex;
            align-items: center;
            cursor: pointer;
            padding: 8px 12px;
            border-radius: 4px;
            transition: background 0.2s;
        }
        
        .notification-icon:hover {
            background: rgba(0,0,0,0.05);
        }
        
        .notification-icon i {
            font-size: 20px;
            color: #333;
            margin-right: 8px;
        }
        
        .notification-icon span {
            font-size: 14px;
            color: #333;
        }

        .send-stock-btn {
            background: #28a745;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: background 0.2s;
        }
        
        .send-stock-btn:hover {
            background: #218838;
        }
        
        .send-stock-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .send-stock-btn.btn-danger {
            background: #dc3545;
        }
        
        .send-stock-btn.btn-danger:hover {
            background: #c82333;
        }
        
        .ingredient-ok {
            color: #28a745;
            font-size: 11px;
            margin-left: 4px;
        }
        
        .ingredient-missing {
            color: #dc3545;
            font-size: 11px;
            margin-left: 4px;
        }
        
        .quantity-controls {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .quantity-btn {
            width: 30px;
            height: 30px;
            border: 1px solid #ddd;
            background: white;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
        }
        
        .quantity-btn:hover {
            background: #f8f9fa;
        }
        
        .quantity-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .quantity-input {
            width: 70px;
            text-align: center;
            padding: 6px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        
        .status {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
        }
        
        .status-available {
            background: #d4edda;
            color: #155724;
        }
        
        .status-low {
            background: #fff3cd;
            color: #856404;
        }
        
        .status-out {
            background: #f8d7da;
            color: #721c24;
        }
        
        .status-medium {
            background: #cce5ff;
            color: #004085;
        }
        
        .staff-stock-info {
            font-size: 11px;
            color: #666;
            margin-top: 4px;
            padding: 4px;
            background: #f8f9fa;
            border-radius: 4px;
        }
        
        .warning-icon {
            color: #ff9800;
            margin-right: 4px;
        }
        
        .permanent-stock-badge {
            display: inline-block;
            background: #6c757d;
            color: white;
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 4px;
            margin-left: 6px;
        }
        
        /* PAGINATION STYLES */
        .pagination-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 20px;
            padding: 15px;
            background: white;
            border-radius: 8px;
            border: 1px solid #ddd;
        }
        
        .pagination-controls {
            display: flex;
            gap: 10px;
            align-items: center;
        }
        
        .pagination-btn {
            padding: 8px 16px;
            border: 1px solid #ddd;
            background: white;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .pagination-btn:hover:not(:disabled) {
            background: #f8f9fa;
            border-color: #28a745;
            color: #28a745;
        }
        
        .pagination-btn.active {
            background: #28a745;
            color: white;
            border-color: #28a745;
        }
        
        .pagination-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .items-per-page {
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        
        .page-info {
            color: #666;
            font-size: 14px;
        }
        
        .offline-badge {
            display: inline-block;
            background: #ffc107;
            color: #212529;
            font-size: 11px;
            font-weight: bold;
            padding: 2px 8px;
            border-radius: 12px;
            margin-left: 10px;
        }
        
        .notification-actions {
            display: flex;
            gap: 8px;
            margin-top: 8px;
        }
        
        .notification-btn {
            padding: 4px 12px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
        }
        
        .notification-btn.fulfill {
            background: #28a745;
            color: white;
        }
        
        .notification-btn.fulfill:hover {
            background: #218838;
        }
        
        .notification-btn.dismiss {
            background: #6c757d;
            color: white;
        }
        
        .notification-btn.dismiss:hover {
            background: #5a6268;
        }
        
        .notification-time {
            font-size: 11px;
            color: #999;
        }
        
        .staff-name {
            font-weight: 600;
            color: #007bff;
        }
    `;
    document.head.appendChild(style);
}

// ==================== PAGINATION FUNCTIONS ====================
function updatePagination() {
    const paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) return;
    
    if (!filteredStocksData || filteredStocksData.length === 0) {
        paginationContainer.style.display = 'none';
        return;
    }
    
    paginationContainer.style.display = 'block';
    
    const startItem = ((currentPage - 1) * itemsPerPage) + 1;
    const endItem = Math.min(currentPage * itemsPerPage, filteredStocksData.length);
    
    paginationContainer.innerHTML = `
        <div class="pagination-container">
            <div class="page-info">
                Showing ${startItem} to ${endItem} of ${filteredStocksData.length} items
            </div>
            <div class="pagination-controls">
                <button class="pagination-btn" onclick="changePage(1)" ${currentPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-angle-double-left"></i>
                </button>
                <button class="pagination-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-angle-left"></i>
                </button>
                
                ${generatePageButtons()}
                
                <button class="pagination-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
                    <i class="fas fa-angle-right"></i>
                </button>
                <button class="pagination-btn" onclick="changePage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''}>
                    <i class="fas fa-angle-double-right"></i>
                </button>
                
                <select id="itemsPerPageSelect" name="itemsPerPage" class="items-per-page" onchange="changeItemsPerPage(this.value)">
                    <option value="10" ${itemsPerPage === 10 ? 'selected' : ''}>10 per page</option>
                    <option value="15" ${itemsPerPage === 15 ? 'selected' : ''}>15 per page</option>
                    <option value="20" ${itemsPerPage === 20 ? 'selected' : ''}>20 per page</option>
                    <option value="50" ${itemsPerPage === 50 ? 'selected' : ''}>50 per page</option>
                </select>
            </div>
        </div>
    `;
}

function generatePageButtons() {
    let buttons = '';
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        buttons += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }
    
    return buttons;
}

function changePage(page) {
    currentPage = page;
    renderSendStockTable();
}

function changeItemsPerPage(value) {
    itemsPerPage = parseInt(value);
    currentPage = 1;
    renderSendStockTable();
}

// ==================== INITIALIZE NOTIFICATION SYSTEM ====================
function initializeNotificationSystem() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;
    
    const existingNavItem = document.getElementById('notificationNavItem');
    if (existingNavItem) existingNavItem.remove();
    
    const notificationNavItem = document.createElement('li');
    notificationNavItem.id = 'notificationNavItem';
    notificationNavItem.style.cssText = 'position: relative; list-style: none; margin-left: auto;';
    
    const notificationBtn = document.createElement('a');
    notificationBtn.href = '#';
    notificationBtn.className = 'nav-link notification-icon';
    notificationBtn.innerHTML = `
        <i class="fas fa-bell"></i>
        <span>Notifications</span>
        <span id="notificationBadge" class="notification-badge" style="display: ${notificationCount > 0 ? 'flex' : 'none'};">${notificationCount > 99 ? '99+' : notificationCount}</span>
        <span class="offline-badge" id="offlineBadge" style="display: inline-block;">Offline Mode</span>
    `;
    notificationBtn.addEventListener('click', function(e) {
        e.preventDefault();
        toggleNotificationModal();
    });
    
    notificationNavItem.appendChild(notificationBtn);
    navLinks.appendChild(notificationNavItem);
    
    let notificationContainer = document.getElementById('notificationContainer');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notificationContainer';
        notificationContainer.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            width: 400px;
            max-height: 600px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            z-index: 1000;
            display: none;
            flex-direction: column;
            overflow: hidden;
            border: 1px solid #ddd;
        `;
        
        const notificationHeader = document.createElement('div');
        notificationHeader.style.cssText = `
            padding: 15px 20px;
            background: #f8f9fa;
            border-bottom: 1px solid #ddd;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        
        const headerTitle = document.createElement('h3');
        headerTitle.textContent = 'Notifications';
        headerTitle.style.cssText = 'margin: 0; font-size: 16px; font-weight: 600; color: #333; display: flex; align-items: center; gap: 8px;';
        headerTitle.innerHTML = `<i class="fas fa-bell" style="color: #007bff;"></i> Stock Requests`;
        
        const clearAllBtn = document.createElement('button');
        clearAllBtn.textContent = 'Clear All';
        clearAllBtn.style.cssText = `
            background: none;
            border: 1px solid #dc3545;
            color: #dc3545;
            cursor: pointer;
            font-size: 12px;
            padding: 6px 12px;
            border-radius: 4px;
            transition: all 0.2s;
            font-weight: 500;
        `;
        clearAllBtn.addEventListener('mouseenter', function() {
            this.style.background = '#dc3545';
            this.style.color = 'white';
        });
        clearAllBtn.addEventListener('mouseleave', function() {
            this.style.background = 'none';
            this.style.color = '#dc3545';
        });
        clearAllBtn.addEventListener('click', clearAllNotifications);
        
        notificationHeader.appendChild(headerTitle);
        notificationHeader.appendChild(clearAllBtn);
        
        const notificationList = document.createElement('div');
        notificationList.id = 'notificationList';
        notificationList.style.cssText = 'flex: 1; overflow-y: auto; max-height: 450px; padding: 10px;';
        
        const emptyState = document.createElement('div');
        emptyState.id = 'notificationEmptyState';
        emptyState.style.cssText = 'padding: 40px 20px; text-align: center; color: #666;';
        emptyState.innerHTML = `
            <div style="font-size: 64px; margin-bottom: 20px;">📭</div>
            <h3 style="margin-bottom: 10px; color: #333; font-size: 18px;">No notifications</h3>
            <p style="margin: 0; color: #999; font-size: 14px;">When staff request stock, they will appear here</p>
        `;
        notificationList.appendChild(emptyState);
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.style.cssText = `
            padding: 12px;
            background: #f8f9fa;
            border: none;
            border-top: 1px solid #ddd;
            cursor: pointer;
            color: #333;
            font-size: 14px;
            font-weight: 500;
            transition: background 0.2s;
        `;
        closeBtn.addEventListener('mouseenter', function() {
            this.style.background = '#e9ecef';
        });
        closeBtn.addEventListener('mouseleave', function() {
            this.style.background = '#f8f9fa';
        });
        closeBtn.addEventListener('click', toggleNotificationModal);
        
        notificationContainer.appendChild(notificationHeader);
        notificationContainer.appendChild(notificationList);
        notificationContainer.appendChild(closeBtn);
        
        document.body.appendChild(notificationContainer);
    }
}

// ==================== NOTIFICATION FUNCTIONS ====================
function toggleNotificationModal() {
    const notificationContainer = document.getElementById('notificationContainer');
    if (!notificationContainer) return;
    
    if (isNotificationModalOpen) {
        notificationContainer.style.display = 'none';
        isNotificationModalOpen = false;
    } else {
        notificationContainer.style.display = 'flex';
        isNotificationModalOpen = true;
        
        // Mark all as read when opening
        hasNewNotifications = false;
        notifications.forEach(notification => { 
            notification.read = true; 
        });
        
        updateNotificationBadge();
        renderNotifications();
        saveNotificationsToLocalStorage();
    }
}

function addNotification(productName, message, type = 'info', priority = 'normal', staffName = 'Staff', requestData = null) {
    const notification = {
        id: Date.now() + Math.random(),
        productName: productName,
        message: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString(),
        fullDateTime: new Date().toISOString(),
        read: false,
        type: type,
        priority: priority,
        staffName: staffName,
        fulfilled: false,
        requestData: requestData
    };
    
    notifications.unshift(notification);
    hasNewNotifications = true;
    notificationCount = notifications.filter(n => !n.read && !n.fulfilled).length;
    
    updateNotificationBadge();
    renderNotifications();
    saveNotificationsToLocalStorage();
    
    // Show toast notification
    const priorityEmoji = { 
        'normal': '📦', 
        'urgent': '⚠️', 
        'asap': '🔴' 
    }[priority] || '📦';
    
    const priorityText = priority === 'asap' ? 'ASAP' : priority.charAt(0).toUpperCase() + priority.slice(1);
    showToast(`${priorityEmoji} ${priorityText}: ${productName} (${message})`, 'info');
}

function handleStockRequestNotification(data) {
    // Check if we already have this request
    const exists = notifications.some(n => 
        n.type === 'stock_request' && 
        n.requestData && 
        n.requestData._id === data.requestId
    );
    
    if (!exists) {
        const priority = data.priority || 'normal';
        const staffName = data.staffName || 'Staff Member';
        const quantity = data.requestedQuantity || 10;
        const unit = data.unit || 'units';
        
        addNotification(
            data.productName,
            `Requested ${quantity} ${unit}`,
            'stock_request',
            priority,
            staffName,
            {
                _id: data.requestId,
                quantity: quantity,
                unit: unit,
                priority: priority,
                notes: data.data?.notes || ''
            }
        );
        
        console.log(`✅ Added stock request notification for ${data.productName}`);
    }
}

function handleLowStockAlert(data) {
    addNotification(
        data.productName,
        `Low stock alert: Only ${data.currentStock} ${data.unit} left`,
        'low_stock',
        'urgent',
        'System',
        data
    );
}

function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    if (!badge) return;
    
    // Count only unread and unfulfilled notifications
    notificationCount = notifications.filter(n => !n.read && !n.fulfilled).length;
    
    if (notificationCount > 0) {
        badge.textContent = notificationCount > 99 ? '99+' : notificationCount;
        badge.style.display = 'flex';
        badge.style.animation = 'pulse 1s infinite';
    } else {
        badge.style.display = 'none';
        badge.style.animation = 'none';
    }
}

function renderNotifications() {
    const notificationList = document.getElementById('notificationList');
    const emptyState = document.getElementById('notificationEmptyState');
    
    if (!notificationList) return;
    
    notificationList.innerHTML = '';
    
    // Filter out fulfilled notifications
    const activeNotifications = notifications.filter(n => !n.fulfilled);
    
    if (activeNotifications.length === 0) {
        notificationList.appendChild(emptyState);
        return;
    }
    
    activeNotifications.forEach(notification => {
        const notificationItem = document.createElement('div');
        notificationItem.className = `notification-item ${!notification.read ? 'unread' : ''}`;
        notificationItem.style.cssText = `
            padding: 15px;
            border-bottom: 1px solid #eee;
            cursor: pointer;
            transition: all 0.2s;
            margin-bottom: 5px;
            border-radius: 4px;
            position: relative;
        `;
        
        // Priority badge
        let priorityBadge = '';
        if (notification.priority) {
            let priorityClass = 'priority-normal';
            let priorityText = 'Normal';
            
            if (notification.priority === 'urgent') {
                priorityClass = 'priority-urgent';
                priorityText = 'Urgent';
            } else if (notification.priority === 'asap') {
                priorityClass = 'priority-asap';
                priorityText = 'ASAP';
            }
            
            priorityBadge = `<span class="notification-priority ${priorityClass}">${priorityText}</span>`;
        }
        
        // Staff name
        const staffDisplay = notification.staffName ? 
            `<span class="staff-name">${notification.staffName}</span>` : 
            'Staff';
        
        // Format time
        const timeDisplay = notification.fullDateTime ? 
            new Date(notification.fullDateTime).toLocaleString() : 
            `${notification.date} ${notification.timestamp}`;
        
        notificationItem.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                <div style="font-weight: 600; color: #333; font-size: 14px; display: flex; align-items: center; gap: 8px;">
                    ${notification.type === 'stock_request' ? '📦' : '⚠️'} 
                    ${notification.productName || 'System Notification'}
                    ${priorityBadge}
                </div>
                ${!notification.read ? '<span style="color: #ff9800; font-size: 12px;">● New</span>' : ''}
            </div>
            <div style="color: #666; font-size: 13px; margin-bottom: 5px;">
                <span style="font-weight: 500;">${staffDisplay}</span> ${notification.message}
            </div>
            ${notification.requestData?.notes ? `
                <div style="color: #999; font-size: 12px; margin-bottom: 8px; font-style: italic;">
                    📝 ${notification.requestData.notes}
                </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="color: #999; font-size: 11px;">
                    <i class="far fa-clock"></i> ${timeDisplay}
                </div>
                ${notification.type === 'stock_request' ? `
                    <div class="notification-actions">
                        <button class="notification-btn fulfill" onclick="fulfillStockRequest('${notification.id}', '${notification.productName}', ${notification.requestData?.quantity || 10}, '${notification.requestData?.unit || 'units'}')">
                            <i class="fas fa-check"></i> Fulfill
                        </button>
                        <button class="notification-btn dismiss" onclick="dismissNotification('${notification.id}')">
                            <i class="fas fa-times"></i> Dismiss
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
        
        notificationItem.addEventListener('click', function(e) {
            // Don't trigger if clicking on buttons
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                return;
            }
            
            notification.read = true;
            updateNotificationBadge();
            renderNotifications();
            saveNotificationsToLocalStorage();
        });
        
        notificationList.appendChild(notificationItem);
    });
}

function fulfillStockRequest(notificationId, productName, quantity, unit) {
    console.log(`\n✅ ========== FULFILLING STOCK REQUEST ==========`);
    console.log(`Product: ${productName}`);
    console.log(`Quantity: ${quantity} ${unit}`);
    console.log(`Notification ID: ${notificationId}`);
    console.log(`================================================\n`);
    
    // Find the notification
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) {
        console.error(`❌ Notification not found: ${notificationId}`);
        showToast('❌ Notification not found', 'error');
        return;
    }
    
    // Find the product
    const product = allMenuItems.find(p => p.name === productName || p.itemName === productName);
    if (!product) {
        console.error(`❌ Product not found: ${productName}`);
        showToast(`❌ Product "${productName}" not found in menu`, 'error');
        return;
    }
    
    // Show confirmation dialog
    const confirmHTML = `
        <div id="fulfillConfirmDialog" style="display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 11000; align-items: center; justify-content: center;">
            <div style="background: white; padding: 30px; border-radius: 10px; max-width: 500px; width: 90%; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="margin-top: 0; color: #333;">Fulfill Stock Request</h2>
                <p style="color: #666; font-size: 16px; margin: 15px 0;">
                    Add <strong>${quantity} ${unit}</strong> of <strong>${productName}</strong> to inventory?
                </p>
                <p style="color: #666; font-size: 14px; margin: 10px 0;">
                    Current stock: ${product.stock || 0}/${product.maxStock || 100}
                </p>
                <p style="color: #666; font-size: 14px; margin: 10px 0;">
                    After fulfillment: ${(product.stock || 0) + quantity}/${product.maxStock || 100}
                </p>
                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 25px;">
                    <button onclick="closeFulfillConfirm()" style="padding: 10px 20px; border: 1px solid #ddd; border-radius: 5px; cursor: pointer; background: #f0f0f0; color: #333;">Cancel</button>
                    <button onclick="submitFulfillRequest('${notificationId}', '${productName}', ${quantity}, '${unit}')" style="padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; background: #4CAF50; color: white;">Fulfill Request</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', confirmHTML);
}

function closeFulfillConfirm() {
    const dialog = document.getElementById('fulfillConfirmDialog');
    if (dialog) dialog.remove();
}

async function submitFulfillRequest(notificationId, productName, quantity, unit) {
    const dialog = document.getElementById('fulfillConfirmDialog');
    if (dialog) dialog.remove();
    
    console.log(`\n📤 ========== SUBMITTING FULFILL REQUEST ==========`);
    console.log(`Product: ${productName}`);
    console.log(`Quantity: ${quantity} ${unit}`);
    console.log(`Notification ID: ${notificationId}`);
    console.log(`=================================================\n`);
    
    try {
        // Get product details
        const product = allMenuItems.find(p => p.name === productName || p.itemName === productName);
        if (!product) {
            console.error(`❌ Product not found: ${productName}`);
            showToast(`❌ Product not found`, 'error');
            return;
        }
        
        // Call backend to fulfill request
        const response = await fetch(`${BACKEND_URL}/api/stock-requests/fulfill`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                notificationId: notificationId,
                productId: product._id,
                productName: productName,
                quantity: quantity,
                unit: unit,
                newStock: (product.currentStock || 0) + quantity
            })
        });
        
        const responseData = await response.json();
        console.log(`📡 Backend Response:`, responseData);
        
        if (response.ok && (response.status === 200 || response.status === 201)) {
            // ✅ SUCCESS: Request fulfilled
            console.log(`✅ Stock request fulfilled successfully`);
            
            // Update product stock locally
            product.currentStock = (product.currentStock || 0) + quantity;
            console.log(`✅ Updated ${productName} stock to ${product.currentStock}`);
            
            // Mark notification as fulfilled
            const notification = notifications.find(n => n.id === notificationId);
            if (notification) {
                notification.fulfilled = true;
                notification.read = true;
                console.log(`✅ Marked notification ${notificationId} as fulfilled`);
            }
            
            // Save to localStorage
            localStorage.setItem('allMenuItems', JSON.stringify(allMenuItems));
            saveNotificationsToLocalStorage();
            console.log(`💾 Data saved to localStorage`);
            
            // Update all UI components
            updateAllUIComponents();
            updateNotificationBadge();
            renderNotifications();
            console.log(`✅ UI components updated`);
            
            // Show success notification
            const notification_ui = document.createElement('div');
            notification_ui.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #4CAF50;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                z-index: 11005;
                font-weight: bold;
                box-shadow: 0 4px 6px rgba(0,0,0,0.2);
                animation: slideInRight 0.3s ease-in-out;
            `;
            notification_ui.innerHTML = `✅ Stock request fulfilled! Added ${quantity} ${unit} to ${productName}`;
            document.body.appendChild(notification_ui);
            
            setTimeout(() => {
                if (notification_ui.parentElement) {
                    notification_ui.remove();
                }
            }, 4000);
            
        } else if (response.status === 400) {
            // ❌ BAD REQUEST
            console.error(`❌ Bad Request (400): ${responseData.message}`);
            showToast(`❌ Error: ${responseData.message || 'Invalid request'}`, 'error');
            
        } else if (response.status === 404) {
            // ❌ NOT FOUND
            console.error(`❌ Not Found (404): ${responseData.message}`);
            showToast(`❌ Stock request not found`, 'error');
            
        } else {
            // ❌ OTHER ERRORS
            console.error(`❌ Error (${response.status}): ${responseData.message || 'Unknown error'}`);
            showToast(`❌ Failed to fulfill request: ${responseData.message || 'Unknown error'}`, 'error');
        }
        
    } catch (error) {
        console.error(`❌ Network error:`, error.message);
        showToast(`❌ Network error: ${error.message}`, 'error');
    }
}

function dismissNotification(notificationId) {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.fulfilled = true;
        notification.read = true;
        
        updateNotificationBadge();
        renderNotifications();
        saveNotificationsToLocalStorage();
        
        showToast('Notification dismissed', 'info');
    }
}

function clearAllNotifications() {
    if (notifications.length === 0) return;
    
    if (confirm('Mark all notifications as fulfilled?')) {
        notifications.forEach(notification => {
            notification.fulfilled = true;
            notification.read = true;
        });
        
        notificationCount = 0;
        hasNewNotifications = false;
        
        updateNotificationBadge();
        renderNotifications();
        saveNotificationsToLocalStorage();
        
        showToast('✅ All notifications cleared', 'success');
    }
}

// ==================== 🆕 FIXED: CHECK INGREDIENT AVAILABILITY - NOW USES REAL INGREDIENT INVENTORY ====================
async function checkIngredientAvailability(itemName) {
    try {
        console.log(`🔍 Checking ingredient availability for: ${itemName}`);
        
        // Get product recipe from map
        const recipe = productIngredientMap[itemName];
        
        // ✅ OPTIONAL RECIPE MODE: If no recipe found, allow product (no strict validation)
        // Products CAN be created without recipes - recipes can be added later
        if (!recipe) {
            console.log(`ℹ️ No recipe found for "${itemName}" - Creating product without recipe (optional)`);
            return {
                available: true,  // Allow product creation even without recipe
                missingIngredients: [],
                availableIngredients: [],
                allIngredientsPresent: false,
                requiredIngredients: [],
                reason: 'NO_RECIPE_DEFINED_YET'  // Info only, not blocking
            };
        }
        
        // ✅ OPTIONAL INGREDIENTS MODE: If recipe has no ingredients, allow the product
        if (!recipe.ingredients || Object.keys(recipe.ingredients).length === 0) {
            console.log(`ℹ️ No ingredients defined for "${itemName}" - Creating product without ingredients (optional)`);
            return {
                available: true,  // Allow product creation even without ingredients
                missingIngredients: [`NO INGREDIENTS DEFINED - Add ingredients to recipe first`],
                availableIngredients: [],
                allIngredientsPresent: false,
                requiredIngredients: [],
                reason: 'NO_INGREDIENTS'
            };
        }
        
        console.log(`📋 Recipe for ${itemName}:`, recipe.ingredients);
        
        const missingIngredients = [];
        const availableIngredients = [];
        
        // ✅ Use FALLBACK_INVENTORY_ITEMS as the inventory database
        const inventoryItems = FALLBACK_INVENTORY_ITEMS || [];
        
        // Check each ingredient from recipe
        for (const [ingredientName, requiredAmount] of Object.entries(recipe.ingredients)) {
            console.log(`   Checking ingredient: ${ingredientName} (required: ${requiredAmount})`);
            
            // ✅ FIX: Convert underscore to space for matching (cooking_oil -> cooking oil)
            const normalizedIngredientName = ingredientName.replace(/_/g, ' ');
            
            // ✅ FIX: Check against actual inventory database (FALLBACK_INVENTORY_ITEMS)
            const dbInventoryItem = inventoryItems.find(item => 
                item.itemName.toLowerCase() === normalizedIngredientName.toLowerCase()
            );
            
            if (!dbInventoryItem) {
                console.warn(`   ❌ NOT FOUND in database inventory: ${ingredientName} (looked for: ${normalizedIngredientName})`);
                missingIngredients.push(`${normalizedIngredientName} (NOT IN INVENTORY DATABASE)`);
                continue;
            }
            
            const currentStock = parseFloat(dbInventoryItem.currentStock) || 0;
            const unit = dbInventoryItem.unit || 'unit';
            
            console.log(`   Found in inventory: ${ingredientName} - Current: ${currentStock} ${unit}, Required: ${requiredAmount}`);
            
            if (currentStock <= 0) {
                console.warn(`   ❌ OUT OF STOCK: ${ingredientName}`);
                missingIngredients.push(`${ingredientName} (OUT OF STOCK - ${currentStock.toFixed(1)} ${unit})`);
            } else if (currentStock < requiredAmount) {
                console.warn(`   ⚠️ INSUFFICIENT STOCK: ${ingredientName} need ${requiredAmount}, have ${currentStock}`);
                missingIngredients.push(`${ingredientName} (INSUFFICIENT - need ${requiredAmount} ${unit}, have ${currentStock.toFixed(1)} ${unit})`);
            } else {
                console.log(`   ✅ SUFFICIENT STOCK: ${ingredientName}`);
                availableIngredients.push(ingredientName);
            }
        }
        
        const hasAllIngredients = missingIngredients.length === 0;
        console.log(`\n📊 Availability Result for "${itemName}":
            Available: ${hasAllIngredients ? '✅' : '❌'}
            Missing: ${missingIngredients.length}
            Available: ${availableIngredients.length}\n`);
        
        return {
            available: hasAllIngredients,
            missingIngredients: missingIngredients,
            availableIngredients: availableIngredients,
            allIngredientsPresent: hasAllIngredients,
            requiredIngredients: Object.keys(recipe.ingredients),
            reason: hasAllIngredients ? 'ALL_INGREDIENTS_AVAILABLE' : 'MISSING_INGREDIENTS'
        };
    } catch (error) {
        console.error('❌ Error checking ingredient availability:', error);
        console.error('Stack:', error.stack);
        return {
            available: false, // ✅ Default to false to BLOCK adding
            missingIngredients: ['Error checking inventory - cannot add product'],
            availableIngredients: [],
            allIngredientsPresent: false,
            requiredIngredients: [],
            reason: 'ERROR'
        };
    }
}

// ==================== 🆕 FIXED: CHECK SERVINGWARE AVAILABILITY ====================
function checkServingwareAvailability(itemName) {
    try {
        const recipe = productIngredientMap[itemName];
        
        if (!recipe || !recipe.servingware) {
            return {
                available: true,
                missingServingware: []
            };
        }
        
        const servingwareType = recipe.servingware;
        
        if (!servingwareInventory[servingwareType]) {
            return {
                available: true,
                missingServingware: []
            };
        }
        
        const servingware = servingwareInventory[servingwareType];
        
        if (servingware.current <= 0) {
            return {
                available: false,
                missingServingware: [`${servingware.name} (out of stock)`]
            };
        }
        
        return {
            available: true,
            missingServingware: []
        };
    } catch (error) {
        console.error('Error checking servingware availability:', error);
        return {
            available: true,
            missingServingware: []
        };
    }
}

// ==================== 🆕 FIXED: COMPLETE AVAILABILITY CHECK ====================
async function checkFullProductAvailability(itemName) {
    const ingredientCheck = await checkIngredientAvailability(itemName);
    const servingwareCheck = checkServingwareAvailability(itemName);
    
    const allMissing = [
        ...ingredientCheck.missingIngredients,
        ...servingwareCheck.missingServingware
    ];
    
    return {
        available: ingredientCheck.available && servingwareCheck.available,
        missingItems: allMissing,
        missingIngredients: ingredientCheck.missingIngredients,
        missingServingware: servingwareCheck.missingServingware,
        ingredientCheck: ingredientCheck,
        servingwareCheck: servingwareCheck
    };
}

// ==================== 🆕 FIXED: EMIT REAL-TIME EVENT TO STAFF ====================
async function emitStockTransferToStaff(stock, quantityToSend, unit) {
    console.log('='.repeat(60));
    console.log(`📡 EMITTING REAL-TIME STOCK TRANSFER TO STAFF`);
    console.log(`📦 Item: ${stock.name} | Qty: ${quantityToSend} ${unit}`);
    console.log('='.repeat(60));
    
    const transferData = {
        type: 'stock_transfer',
        action: 'stock_received',
        itemName: stock.name,
        itemId: stock._id,
        quantitySent: quantityToSend,
        unit: unit,
        newStaffStock: quantityToSend,
        timestamp: new Date().toISOString(),
        transferredBy: 'admin'
    };
    
    const results = {
        sse: false,
        websocket: false,
        api: false
    };
    
    // ==================== METHOD 1: BROADCAST VIA SERVER (PRIMARY METHOD) ====================
    try {
        console.log('📤 Calling /api/admin/emit-stock-transfer endpoint...');
        const eventResponse = await fetch(`${BACKEND_URL}/api/admin/emit-stock-transfer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(transferData)
        });
        
        if (eventResponse.ok) {
            results.sse = true;
            const responseData = await eventResponse.json();
            console.log('✅ STOCK TRANSFER BROADCASTED TO ALL STAFF:', responseData);
        } else {
            console.warn('⚠️ SSE emission failed with status:', eventResponse.status);
        }
    } catch (e) {
        console.warn('⚠️ SSE endpoint error:', e.message);
    }
    
    // METHOD 2: WebSocket (Backup)
    try {
        if (adminWebSocket && adminWebSocket.readyState === WebSocket.OPEN) {
            adminWebSocket.send(JSON.stringify({
                type: 'admin:stock_transfer',
                data: transferData
            }));
            results.websocket = true;
            console.log('✅ Real-time event emitted via WebSocket');
        }
    } catch (e) {
        console.warn('⚠️ WebSocket emission failed:', e.message);
    }
    
    // METHOD 3: Direct Staff Inventory API (Backup)
    try {
        const staffUpdateResponse = await fetch(`${BACKEND_URL}/api/staff/inventory/receive`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(transferData)
        });
        
        if (staffUpdateResponse.ok) {
            results.api = true;
            console.log('✅ Staff inventory updated via API');
        }
    } catch (e) {
        console.warn('⚠️ Could not update staff inventory directly:', e.message);
    }
    
    // METHOD 4: LocalStorage + BroadcastChannel (for offline mode)
    try {
        // Save to localStorage for staff to pick up on next load
        const pendingTransfers = JSON.parse(localStorage.getItem('pendingStockTransfers') || '[]');
        pendingTransfers.push({
            ...transferData,
            savedAt: Date.now()
        });
        localStorage.setItem('pendingStockTransfers', JSON.stringify(pendingTransfers));
        console.log('✅ Saved transfer to pending queue in localStorage');
    } catch (e) {
        console.warn('⚠️ Could not save to localStorage:', e.message);
    }
    
    console.log('='.repeat(60));
    console.log(`📡 Transfer emission results:`, results);
    console.log('='.repeat(60));
    
    return results;
}

// ==================== TOAST NOTIFICATION ====================
function showToast(message, type = 'success') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 400px;
        `;
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // ✅ Different duration for different types - errors show longer
    const duration = type === 'error' ? 8000 : 5000;
    
    toast.style.cssText = `
        margin-bottom: 10px;
        padding: 16px 20px;
        border-radius: 6px;
        color: white;
        font-weight: 500;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : type === 'warning' ? '#ffc107' : '#17a2b8'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        display: flex;
        align-items: flex-start;
        gap: 12px;
        word-wrap: break-word;
        word-break: break-word;
        max-width: 100%;
        animation: slideIn 0.3s ease;
    `;
    
    const icon = document.createElement('i');
    icon.className = `fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}`;
    icon.style.cssText = 'flex-shrink: 0; margin-top: 2px;';
    
    const textSpan = document.createElement('span');
    textSpan.textContent = message;
    textSpan.style.cssText = 'flex: 1;';
    
    toast.appendChild(icon);
    toast.appendChild(textSpan);
    
    container.appendChild(toast);
    
    console.log(`📢 Toast [${type}]: ${message}`);
    
    setTimeout(() => { toast.classList.add('show'); }, 10);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
    }, duration);
}

// Add keyframe animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ==================== INITIALIZE EVENT LISTENERS ====================
function initializeEventListeners() {
    console.log('🔌 Initializing event listeners...');
    
    if (elements.addNewItem) {
        elements.addNewItem.addEventListener('click', openAddModal);
    }
    
    const addFirstItemBtn = document.getElementById('addFirstItemBtn');
    if (addFirstItemBtn) addFirstItemBtn.addEventListener('click', openAddModal);
    
    const addFirstMenuBtn = document.getElementById('addFirstMenuBtn');
    if (addFirstMenuBtn) addFirstMenuBtn.addEventListener('click', openAddModal);
    
    if (elements.saveItemBtn) {
        elements.saveItemBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            await handleSaveItem();
        });
    }
    
    if (elements.cancelBtn) elements.cancelBtn.addEventListener('click', closeModal);
    if (elements.closeModal) elements.closeModal.addEventListener('click', closeModal);
    
    if (elements.itemCategory) {
        elements.itemCategory.addEventListener('change', function() {
            updateFromCategory();
            if (elements.itemName) elements.itemName.value = '';
            if (elements.itemUnit) elements.itemUnit.value = '';
            if (elements.itemPrice) elements.itemPrice.value = '';
        });
    }
    
    if (elements.itemName) {
        elements.itemName.addEventListener('change', function() {
            updateFromItemNameSelect();
        });
    }
    
    if (elements.itemModal) {
        elements.itemModal.addEventListener('click', (e) => {
            if (e.target === elements.itemModal) closeModal();
        });
    }
    
    if (elements.itemForm) {
        elements.itemForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleSaveItem();
        });
    }
    
    if (elements.navLinks && elements.navLinks.length > 0) {
        elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                showSection(section);
            });
        });
    }
    
    if (elements.categoryItems && elements.categoryItems.length > 0) {
        elements.categoryItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const category = item.getAttribute('data-category');
                const fullname = item.getAttribute('data-fullname');
                filterByCategory(category, fullname);
            });
        });
    }
    
    // ✅ Missing Ingredients Modal Event Listeners
    if (elements.closeMissingIngredientsModal) {
        elements.closeMissingIngredientsModal.addEventListener('click', closeMissingIngredientsModal);
    }
    
    if (elements.closeMissingIngredientsBtn) {
        elements.closeMissingIngredientsBtn.addEventListener('click', closeMissingIngredientsModal);
    }
    
    if (elements.missingIngredientsModal) {
        elements.missingIngredientsModal.addEventListener('click', (e) => {
            if (e.target === elements.missingIngredientsModal) closeMissingIngredientsModal();
        });
    }
}

// ==================== INITIALIZE CATEGORY DROPDOWN ====================
function initializeCategoryDropdown() {
    if (!elements.itemCategory) return;
    
    elements.itemCategory.innerHTML = '<option value="">Select Category</option>';
    
    Object.keys(categoryDisplayNames).forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = categoryDisplayNames[category];
        elements.itemCategory.appendChild(option);
    });
}

// ==================== CATEGORY DROPDOWN FUNCTIONS ====================
function populateItemNamesByCategory(category = null) {
    const itemNameSelect = elements.itemName;
    if (!itemNameSelect) return;
    
    itemNameSelect.innerHTML = '<option value="">Select Product</option>';
    
    if (!category || category.trim() === '') return;
    
    const categoryItems = menuDatabase[category] || [];
    
    if (categoryItems.length === 0) return;
    
    const sortedItems = [...categoryItems].sort((a, b) => a.name.localeCompare(b.name));
    
    sortedItems.forEach(item => {
        const option = document.createElement('option');
        option.value = item.name;
        option.textContent = item.name;
        option.dataset.unit = item.unit;
        option.dataset.price = item.defaultPrice;
        itemNameSelect.appendChild(option);
    });
}

function updateFromItemNameSelect() {
    const itemName = elements.itemName.value;
    
    if (!itemName || itemName.trim() === '' || itemName === 'Select Product') return;
    
    const selectedOption = elements.itemName.options[elements.itemName.selectedIndex];
    const unit = selectedOption.dataset.unit;
    const price = selectedOption.dataset.price;
    
    if (unit && elements.itemUnit) elements.itemUnit.value = unit;
    if (price && elements.itemPrice) elements.itemPrice.value = price;
}

function updateFromCategory() {
    const category = elements.itemCategory.value;
    
    if (!category || category.trim() === '' || category === 'Select Category') {
        if (elements.itemName) elements.itemName.innerHTML = '<option value="">Select Product</option>';
        if (elements.itemUnit) elements.itemUnit.value = '';
        if (elements.itemPrice) elements.itemPrice.value = '';
        return;
    }
    
    updateUnitOptions(category);
    populateItemNamesByCategory(category);
    
    if (elements.itemName) elements.itemName.value = '';
    if (elements.itemUnit) elements.itemUnit.value = '';
    if (elements.itemPrice) elements.itemPrice.value = '';
}

function updateUnitOptions(category) {
    const unitSelect = elements.itemUnit;
    if (!unitSelect) return;
    
    const availableUnits = categoryUnitsMapping[category] || ['pcs'];
    const currentUnit = unitSelect.value;
    
    unitSelect.innerHTML = '<option value="">Select Unit</option>';
    
    availableUnits.forEach(unit => {
        const option = document.createElement('option');
        option.value = unit;
        option.textContent = unitDisplayLabels[unit] || unit.charAt(0).toUpperCase() + unit.slice(1);
        unitSelect.appendChild(option);
    });
    
    if (currentUnit && availableUnits.includes(currentUnit)) {
        unitSelect.value = currentUnit;
    } else if (availableUnits.length > 0) {
        const defaultUnits = {
            'Rice': 'plate',
            'Sizzling': 'sizzling plate',
            'Party': 'tray',
            'Drink': 'glass',
            'Cafe': 'cup',
            'Milk': 'cup',
            'Frappe': 'cup',
            'Snack & Appetizer': 'serving',
            'Budget Meals Served with Rice': 'meal',
            'Specialties': 'serving',
            'packaging': 'pack'
        };
        unitSelect.value = defaultUnits[category] || availableUnits[0];
    }
}

// ==================== FORMATTING FUNCTIONS ====================
function formatNumber(num) {
    if (num === undefined || num === null || isNaN(num)) return '0';
    return new Intl.NumberFormat('en-US').format(num);
}

function formatCurrency(amount) {
    if (amount === undefined || amount === null || isNaN(amount)) return '₱0.00';
    const numAmount = parseFloat(amount);
    return '₱' + numAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function getCategoryDisplayName(category) {
    return categoryDisplayNames[category] || category;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== FETCH MENU ITEMS ====================
async function fetchMenuItems() {
    try {
        console.log('🔍 Fetching menu items from API...');
        
        const response = await fetch('/api/menu', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        
        if (response.status === 401) {
            console.warn('⚠️ Unauthorized - session expired');
            showToast('Session expired. Please login again.', 'error');
            setTimeout(() => { window.location.href = '/login'; }, 2000);
            return false;
        }
        
        if (!response.ok) {
            console.warn(`⚠️ API error ${response.status} - ${response.statusText}`);
            return false;
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.warn('⚠️ Response is not JSON');
            return false;
        }
        
        const data = await response.json();
        
        if (data && data.success && Array.isArray(data.data)) {
            // Store items
            allMenuItems = data.data || [];
            console.log(`✅ ${allMenuItems.length} items loaded from API`);
            
            // Save to localStorage for offline access
            saveToLocalStorage();
            
            // Update ALL UI components
            updateAllUIComponents();
            
            // Reset retry count
            retryCount = 0;
            
            return true;
        } else {
            console.warn('⚠️ API response data invalid or missing');
            return false;
        }
    } catch (error) {
        console.error('❌ Network error fetching menu items:', error.message);
        return false;
    }
}

function saveToLocalStorage() {
    try {
        localStorage.setItem('menuItems_backup', JSON.stringify(allMenuItems));
        localStorage.setItem('menuItems_lastUpdate', new Date().toISOString());
    } catch (error) {
        console.warn('⚠️ Could not save to localStorage:', error);
    }
}

// ==================== INVENTORY CACHE ====================
async function getInventoryCache() {
    // Return fallback inventory
    return FALLBACK_INVENTORY_ITEMS;
}

// ==================== CHECK IF ANY INGREDIENTS IN STOCK ====================
async function checkIfAnyIngredientsInStock() {
    for (const ingredient in ingredientInventory) {
        if (ingredientInventory[ingredient].current > 0) {
            return true;
        }
    }
    return false;
}

async function updateAddButtonStates() {
    try {
        const hasInStock = await checkIfAnyIngredientsInStock();
        
        const addNewItemBtn = document.getElementById('addNewItem');
        const addFirstItemBtn = document.getElementById('addFirstItemBtn');
        const addFirstMenuBtn = document.getElementById('addFirstMenuBtn');
        
        const buttons = [addNewItemBtn, addFirstItemBtn, addFirstMenuBtn].filter(btn => btn !== null);
        
        if (hasInStock) {
            buttons.forEach(btn => {
                btn.disabled = false;
                btn.title = 'Click to add a new product';
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
            });
        } else {
            buttons.forEach(btn => {
                btn.disabled = true;
                btn.title = '⚠️ Cannot add products - All ingredients are out of stock. Please restock inventory.';
                btn.style.opacity = '0.6';
                btn.style.cursor = 'not-allowed';
            });
        }
    } catch (error) {
        console.error('❌ Error updating button states:', error);
    }
}

async function checkMenuItemAvailability(itemName) {
    return await checkIngredientAvailability(itemName);
}

// ==================== MODAL FUNCTIONS ====================
function openAddModal() {
    if (isModalOpen) return;
    
    console.log(`📦 Opening Add New Product Modal`);
    
    isModalOpen = true;
    const modal = elements.itemModal;
    
    if (elements.modalTitle) elements.modalTitle.textContent = 'Add New Product';
    if (elements.itemForm) elements.itemForm.reset();
    if (elements.itemId) elements.itemId.value = '';
    
    if (elements.currentStock) elements.currentStock.value = '0';
    if (elements.minimumStock) elements.minimumStock.value = '20';
    if (elements.maximumStock) elements.maximumStock.value = '200';
    if (elements.itemPrice) elements.itemPrice.value = '';
    
    if (elements.itemCategory) {
        elements.itemCategory.value = '';
        updateFromCategory();
    }
    
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
        if (elements.itemCategory) elements.itemCategory.focus();
    }, 10);
}


async function openEditModal(itemId) {
    if (isModalOpen) return;
    
    const item = allMenuItems.find(i => i._id === itemId);
    if (!item) {
        showToast('Product not found', 'error');
        return;
    }
    
    isModalOpen = true;
    const modal = elements.itemModal;
    
    if (elements.modalTitle) elements.modalTitle.textContent = 'Edit Product';
    if (elements.itemId) elements.itemId.value = item._id;
    
    if (elements.itemCategory) {
        elements.itemCategory.value = item.category;
        updateUnitOptions(item.category);
        populateItemNamesByCategory(item.category);
        
        setTimeout(() => {
            if (elements.itemName) {
                for (let i = 0; i < elements.itemName.options.length; i++) {
                    if (elements.itemName.options[i].value === item.name || elements.itemName.options[i].value === item.itemName) {
                        elements.itemName.selectedIndex = i;
                        break;
                    }
                }
                
                if (!elements.itemName.value && (item.name || item.itemName)) {
                    const option = document.createElement('option');
                    option.value = item.name || item.itemName;
                    option.textContent = item.name || item.itemName;
                    elements.itemName.appendChild(option);
                    elements.itemName.value = item.name || item.itemName;
                }
            }
            
            if (elements.itemUnit) elements.itemUnit.value = item.unit || '';
            if (elements.itemPrice) elements.itemPrice.value = item.price || '';
            if (elements.currentStock) elements.currentStock.value = item.currentStock || 0;
            if (elements.minimumStock) elements.minimumStock.value = item.minStock || 20;
            if (elements.maximumStock) elements.maximumStock.value = item.maxStock || 200;
            
            if (elements.itemName) elements.itemName.dispatchEvent(new Event('change'));
        }, 150);
    }
    
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
        if (elements.itemName) elements.itemName.focus();
    }, 10);
}

function closeModal() {
    if (elements.itemModal) {
        elements.itemModal.classList.remove('show');
        setTimeout(() => {
            elements.itemModal.style.display = 'none';
            isModalOpen = false;
        }, 150);
    }
}

// ==================== MISSING INGREDIENTS MODAL ====================
function showMissingIngredientsModal(productName, missingIngredients) {
    if (!elements.missingIngredientsModal) {
        console.error('❌ Missing Ingredients Modal not found in DOM');
        return;
    }
    
    console.log(`🍽️ Displaying missing ingredients modal for: ${productName}`);
    console.log(`   Missing: ${missingIngredients.join(', ')}`);
    
    // Set product name
    if (elements.missingProductName) {
        elements.missingProductName.textContent = productName;
    }
    
    // Populate missing ingredients list
    if (elements.missingIngredientsList) {
        elements.missingIngredientsList.innerHTML = '';
        missingIngredients.forEach(ingredient => {
            const listItem = document.createElement('li');
            listItem.style.cssText = `
                padding: 8px 0;
                padding-left: 25px;
                position: relative;
                color: #d32f2f;
                font-weight: 500;
            `;
            listItem.innerHTML = `<span style="position: absolute; left: 0;">❌</span> ${ingredient}`;
            elements.missingIngredientsList.appendChild(listItem);
        });
    }
    
    // Show modal with animation
    elements.missingIngredientsModal.style.display = 'flex';
    setTimeout(() => {
        elements.missingIngredientsModal.classList.add('show');
    }, 10);
}

function closeMissingIngredientsModal() {
    if (elements.missingIngredientsModal) {
        elements.missingIngredientsModal.classList.remove('show');
        setTimeout(() => {
            elements.missingIngredientsModal.style.display = 'none';
        }, 150);
    }
}

// ==================== SAVE MENU ITEM ====================
async function handleSaveItem() {
    const formData = {
        itemId: elements.itemId ? elements.itemId.value : '',
        itemName: elements.itemName ? elements.itemName.value : '',
        category: elements.itemCategory ? elements.itemCategory.value : '',
        unit: elements.itemUnit ? elements.itemUnit.value : '',
        currentStock: elements.currentStock ? elements.currentStock.value : '0',
        minStock: elements.minimumStock ? elements.minimumStock.value : '20',
        maxStock: elements.maximumStock ? elements.maximumStock.value : '200',
        price: elements.itemPrice ? elements.itemPrice.value : '0'
    };
    
    if (!formData.itemName || formData.itemName.trim() === '' || formData.itemName === 'Select Product') {
        showToast('Please select a product from the dropdown list', 'error');
        if (elements.itemName) {
            elements.itemName.focus();
            elements.itemName.style.borderColor = '#dc3545';
        }
        return;
    }
    
    if (!formData.category || formData.category.trim() === '' || formData.category === 'Select Category') {
        showToast('Please select a category from the dropdown', 'error');
        if (elements.itemCategory) {
            elements.itemCategory.focus();
            elements.itemCategory.style.borderColor = '#dc3545';
        }
        return;
    }
    
    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
        showToast('Please enter a valid price (must be a number greater than 0)', 'error');
        if (elements.itemPrice) {
            elements.itemPrice.focus();
            elements.itemPrice.style.borderColor = '#dc3545';
        }
        return;
    }
    
    if (!formData.unit || formData.unit.trim() === '' || formData.unit === 'Select Unit') {
        showToast('Please select a unit from the dropdown', 'error');
        if (elements.itemUnit) {
            elements.itemUnit.focus();
            elements.itemUnit.style.borderColor = '#dc3545';
        }
        return;
    }
    
    const maxStock = parseInt(formData.maxStock);
    const minStock = parseInt(formData.minStock);
    const currentStock = parseInt(formData.currentStock);
    
    if (isNaN(maxStock) || maxStock <= 0) {
        showToast('Maximum stock must be a positive number', 'error');
        if (elements.maximumStock) elements.maximumStock.focus();
        return;
    }
    
    if (isNaN(minStock) || minStock < 0) {
        showToast('Minimum stock must be 0 or greater', 'error');
        if (elements.minimumStock) elements.minimumStock.focus();
        return;
    }
    
    if (maxStock <= minStock) {
        showToast('Maximum stock must be greater than minimum stock', 'error');
        if (elements.maximumStock) elements.maximumStock.focus();
        return;
    }
    
    if (currentStock > maxStock) {
        showToast('Current stock cannot exceed maximum stock', 'error');
        if (elements.currentStock) elements.currentStock.focus();
        return;
    }
    
    if (currentStock < 0) {
        showToast('Current stock cannot be negative', 'error');
        if (elements.currentStock) elements.currentStock.focus();
        return;
    }
    
    if (!formData.itemId || formData.itemId.trim() === '') {
        // ✅ OPTIONAL: Check ingredients but don't block (informational only)
        const inventoryItems = FALLBACK_INVENTORY_ITEMS || [];
        
        console.log(`\n🔍 ========== CHECKING INGREDIENTS FOR: ${formData.itemName} ==========`);
        console.log(`📊 Current Inventory: ${inventoryItems.length} items loaded`);
        if (inventoryItems.length > 0) {
            console.log(`Items in inventory: ${inventoryItems.map(i => i.itemName).join(', ')}\n`);
        } else {
            console.log(`⚠️ No inventory items available yet\n`);
        }
        
        const availabilityCheck = await checkMenuItemAvailability(formData.itemName);
        
        console.log(`\n📋 Availability Check Result:`);
        console.log(`   Available: ${availabilityCheck.available ? '✅' : '⚠️'}`);
        console.log(`   Required Ingredients: ${availabilityCheck.requiredIngredients.length > 0 ? availabilityCheck.requiredIngredients.join(', ') : 'None'}`);
        console.log(`   Available: ${availabilityCheck.availableIngredients.length > 0 ? availabilityCheck.availableIngredients.join(', ') : 'None'}`);
        console.log(`   Missing: ${availabilityCheck.missingIngredients.length > 0 ? availabilityCheck.missingIngredients.join(', ') : 'None'}\n`);
        
        // ✅ FIX: Don't BLOCK the save - only WARN
        if (!availabilityCheck.available && availabilityCheck.missingIngredients.length > 0) {
            const warningMsg = `Creating "${formData.itemName}" with missing ingredients: ${availabilityCheck.missingIngredients.join(', ')}. You can restock ingredients later.`;
            
            console.warn(`⚠️ ${warningMsg}`);
            showToast(`ℹ️ ${warningMsg}`, 'info', 4000);
            
            console.log(`✅ Proceeding with save (ingredients optional)...`);
        } else {
            console.log(`✅ All ingredients available! Proceeding to save...`);
        }
    }
    
    await saveMenuItem(formData);
}

// ==================== 🔴 DEDUCT INGREDIENT STOCKS FROM INVENTORY ====================
async function deductIngredientStocksFromInventory(productName) {
    try {
        const recipe = productIngredientMap[productName];
        
        if (!recipe || !recipe.ingredients || Object.keys(recipe.ingredients).length === 0) {
            console.log(`ℹ️ Product "${productName}" has no ingredients to deduct`);
            return { success: true, deductions: [] };
        }
        
        console.log(`\n🔴 ========== DEDUCTING INGREDIENT STOCKS FOR: ${productName} ==========`);
        
        const deductions = [];
        const createdIngredients = [];
        
        // Deduct each ingredient
        for (const [ingredientKey, quantity] of Object.entries(recipe.ingredients)) {
            if (quantity <= 0) continue;
            
            // Normalize ingredient name
            const normalizedName = ingredientKey.replace(/_/g, ' ');
            
            // Find inventory item with exact match first
            let inventoryItem = FALLBACK_INVENTORY_ITEMS.find(item => 
                item.itemName && item.itemName.toLowerCase() === normalizedName.toLowerCase()
            );
            
            // If not found, try fuzzy match (contains partial match)
            if (!inventoryItem) {
                inventoryItem = FALLBACK_INVENTORY_ITEMS.find(item => 
                    item.itemName && 
                    (item.itemName.toLowerCase().includes(normalizedName.toLowerCase()) ||
                     normalizedName.toLowerCase().includes(item.itemName.toLowerCase()))
                );
            }
            
            // If still not found, skip (don't auto-create)
            if (!inventoryItem) {
                console.warn(`   ⚠️ Ingredient not found in inventory: ${normalizedName}`);
                continue;
            }
            
            // ✅ DEDUCT: Reduce stock by quantity
            const oldStock = parseFloat(inventoryItem.currentStock) || 0;
            const newStock = Math.max(0, oldStock - quantity);
            
            // Update the stock (this modifies the array in-memory)
            inventoryItem.currentStock = newStock;
            
            const isOutOfStock = newStock === 0;
            const statusEmoji = isOutOfStock ? '🔴 OUT OF STOCK' : '✅ DEDUCTED';
            
            console.log(`  ${normalizedName}: ${oldStock} → ${newStock} (deducted: ${quantity} ${inventoryItem.unit}) ${statusEmoji}`);
            
            deductions.push({
                ingredient: normalizedName,
                oldStock: oldStock,
                newStock: newStock,
                quantityDeducted: quantity,
                unit: inventoryItem.unit || 'unit',
                isOutOfStock: isOutOfStock
            });
        }
        
        if (deductions.length > 0) {
            console.log(`\n✅ PERSISTING DEDUCTIONS:`);
            
            // ✅ FIX 1: Save to localStorage IMMEDIATELY using InventoryManager
            if (typeof inventoryManager !== 'undefined' && inventoryManager) {
                // Use InventoryManager for primary storage
                inventoryManager.updateFallbackFromStorage(FALLBACK_INVENTORY_ITEMS);
                console.log(`   ✅ Applied deductions to FALLBACK_INVENTORY_ITEMS`);
                inventoryManager.saveToStorage();
                console.log(`   ✅ Saved to localStorage via InventoryManager`);
            } else {
                saveInventoryStockValues();
                console.log(`   ✅ Saved to localStorage (fallback method)`);
            }
            
            // ✅ FIX 2: Try to save to database
            try {
                const response = await fetch('/api/inventory/batch-update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        updates: deductions.map(d => ({
                            itemName: d.ingredient,
                            currentStock: d.newStock,
                            unit: d.unit
                        })),
                        productName: productName,
                        reason: 'Ingredient deduction from menu product'
                    })
                });
                
                if (response.ok) {
                    console.log(`   ✅ Saved to database`);
                } else {
                    console.warn(`   ⚠️ Database save failed (using localStorage backup)`);
                }
            } catch (error) {
                console.warn(`   ⚠️ Cannot reach database (using localStorage backup):`, error.message);
            }
            
            console.log(`\n📊 Deduction Summary:`);
            console.log(`   Total ingredients deducted: ${deductions.length}`);
            console.log(`   Out of stock items: ${deductions.filter(d => d.isOutOfStock).length}`);
            
            return { success: true, deductions: deductions };
        }
        
        return { success: true, deductions: [] };
        
    } catch (error) {
        console.error(`❌ Error deducting ingredient stocks:`, error);
        return { success: false, error: error.message };
    }
}

// ==================== VALIDATE INGREDIENTS BEFORE SAVING ====================
async function validateIngredientsBeforeSave(productName) {
    try {
        const recipe = productIngredientMap[productName];
        
        if (!recipe || !recipe.ingredients || Object.keys(recipe.ingredients).length === 0) {
            console.log(`ℹ️ Product "${productName}" has no ingredients to validate`);
            return { valid: true, missingIngredients: [] };
        }
        
        console.log(`\n🔍 VALIDATING INGREDIENTS FOR: ${productName}`);
        
        const missingIngredients = [];
        const availableIngredients = [];
        
        // Check each ingredient
        for (const [ingredientKey, quantity] of Object.entries(recipe.ingredients)) {
            if (quantity <= 0) continue;
            
            // Normalize ingredient name
            const normalizedName = ingredientKey.replace(/_/g, ' ');
            
            // Check if ingredient exists in inventory
            let inventoryItem = FALLBACK_INVENTORY_ITEMS.find(item => 
                item.itemName && item.itemName.toLowerCase() === normalizedName.toLowerCase()
            );
            
            // Try fuzzy match if exact match not found
            if (!inventoryItem) {
                inventoryItem = FALLBACK_INVENTORY_ITEMS.find(item => 
                    item.itemName && 
                    (item.itemName.toLowerCase().includes(normalizedName.toLowerCase()) ||
                     normalizedName.toLowerCase().includes(item.itemName.toLowerCase()))
                );
            }
            
            if (inventoryItem) {
                console.log(`  ✅ ${normalizedName}: Available (Stock: ${inventoryItem.currentStock} ${inventoryItem.unit})`);
                availableIngredients.push({
                    name: normalizedName,
                    stock: inventoryItem.currentStock,
                    unit: inventoryItem.unit,
                    required: quantity
                });
            } else {
                console.log(`  ❌ ${normalizedName}: NOT FOUND in inventory`);
                missingIngredients.push({
                    name: normalizedName,
                    required: quantity,
                    unit: ingredientKey.includes('oil') || ingredientKey.includes('sauce') ? 'liters' : 'kg'
                });
            }
        }
        
        if (missingIngredients.length > 0) {
            console.warn(`\n⚠️ VALIDATION FAILED: Missing ${missingIngredients.length} ingredients:`);
            missingIngredients.forEach(ing => {
                console.warn(`   - ${ing.name} (need: ${ing.required} ${ing.unit})`);
            });
            return { valid: false, missingIngredients: missingIngredients };
        }
        
        console.log(`\n✅ VALIDATION PASSED: All ingredients are available`);
        return { valid: true, missingIngredients: [] };
        
    } catch (error) {
        console.error(`❌ Error validating ingredients:`, error);
        return { valid: false, error: error.message };
    }
}

// ==================== SHOW MISSING INGREDIENTS POPUP ====================
function showMissingIngredientsModal(productName, missingIngredients) {
    const modalHTML = `
        <div class="modal-overlay" id="missingIngredientsModal">
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header" style="background-color: #ff6b6b; color: white;">
                    <h2>⚠️ Missing Ingredients</h2>
                    <button class="modal-close" onclick="closeMissingIngredientsModal()">&times;</button>
                </div>
                <div class="modal-body" style="padding: 20px;">
                    <p style="margin-bottom: 15px;">
                        <strong>Cannot add "${productName}"</strong><br>
                        The following ingredients are missing from inventory:
                    </p>
                    <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 5px; padding: 15px; margin-bottom: 15px;">
                        <ul style="margin: 0; padding-left: 20px;">
                            ${missingIngredients.map(ing => `
                                <li style="margin: 8px 0;">
                                    <strong>${ing.name}</strong> (need: ${ing.required} ${ing.unit})
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 5px; padding: 15px; margin-bottom: 15px;">
                        <p style="margin: 0; color: #666;">
                            <strong>💡 Action Required:</strong><br>
                            Please restock the missing ingredients in Inventory first, then try adding this product again.
                        </p>
                    </div>
                </div>
                <div class="modal-footer" style="background-color: #f8f9fa; padding: 15px; border-top: 1px solid #dee2e6;">
                    <button class="btn btn-secondary" onclick="closeMissingIngredientsModal()">Close</button>
                    <a href="#" onclick="navigateToInventory(); closeMissingIngredientsModal();" class="btn btn-primary">
                        Go to Inventory
                    </a>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add styles for the modal if not already present
    if (!document.getElementById('missingIngredientsStyles')) {
        const style = document.createElement('style');
        style.id = 'missingIngredientsStyles';
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            }
            
            .modal-content {
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                max-width: 500px;
                width: 90%;
            }
            
            .modal-header {
                padding: 20px;
                border-radius: 8px 8px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-header h2 {
                margin: 0;
                font-size: 18px;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: white;
            }
            
            .modal-body {
                padding: 20px;
            }
            
            .modal-footer {
                padding: 15px 20px;
                border-top: 1px solid #dee2e6;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                border-radius: 0 0 8px 8px;
            }
            
            .btn {
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                text-decoration: none;
                display: inline-block;
            }
            
            .btn-primary {
                background-color: #007bff;
                color: white;
            }
            
            .btn-primary:hover {
                background-color: #0056b3;
            }
            
            .btn-secondary {
                background-color: #6c757d;
                color: white;
            }
            
            .btn-secondary:hover {
                background-color: #545b62;
            }
        `;
        document.head.appendChild(style);
    }
}

function closeMissingIngredientsModal() {
    const modal = document.getElementById('missingIngredientsModal');
    if (modal) {
        modal.remove();
    }
}

function navigateToInventory() {
    // Navigate to inventory section
    if (window.currentSection !== 'inventory') {
        const inventoryLink = document.querySelector('[onclick*="openSection(\'inventory\')"]');
        if (inventoryLink) inventoryLink.click();
    }
}

// ==================== FIXED: SAVE MENU ITEM WITH AUTO ADD TO SEND STOCK ====================
async function saveMenuItem(itemData) {
    const isEdit = itemData.itemId && itemData.itemId.trim() !== '';
    
    const saveBtn = elements.saveItemBtn;
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Validating...';
    saveBtn.disabled = true;
    
    try {
        // ✅ OPTIONAL: Validate ingredients for NEW products (informational, not blocking)
        if (!isEdit) {
            console.log(`\n📋 Checking ingredients for new product: ${itemData.itemName}`);
            const validation = await validateIngredientsBeforeSave(itemData.itemName);
            
            // ✅ FIX: Only WARN about missing ingredients, don't BLOCK the save
            // User can create product without ingredients and add them later
            if (!validation.valid && validation.missingIngredients && validation.missingIngredients.length > 0) {
                console.warn(`⚠️ Missing ingredients detected (non-blocking):`);
                validation.missingIngredients.forEach(ing => {
                    console.warn(`   - ${ing.name || ing}`);
                });
                
                // Show informational toast - not an error, just info
                showToast(
                    `ℹ️ Creating "${itemData.itemName}" with missing ingredients. You can add them later.`,
                    'info',
                    3000
                );
                
                console.log(`✅ Proceeding with product creation (ingredients optional)`);
            } else {
                console.log(`✅ All required ingredients available or no recipe defined yet`);
            }
        }
        
        saveBtn.textContent = 'Saving...';
        
        const payload = {
            name: itemData.itemName,
            itemName: itemData.itemName,
            category: itemData.category,
            unit: itemData.unit,
            currentStock: isEdit ? Number(itemData.currentStock) : 0,  // ✅ NEW products ALWAYS start at 0
            minStock: Number(itemData.minStock),
            maxStock: Number(itemData.maxStock),
            price: Number(itemData.price),
            itemType: 'finished',
            isActive: true
        };
        
        let url, method;
        
        if (isEdit) {
            url = `/api/menu/${itemData.itemId}`;
            method = 'PUT';
        } else {
            url = '/api/menu';
            method = 'POST';
        }
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload),
            credentials: 'include'
        });
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Invalid server response format');
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(`Server error ${response.status}: ${data.message || 'Unknown error'}`);
        }
        
        if (data.success) {
            const action = isEdit ? 'updated' : 'added';
            showToast(`Product ${action} successfully!`, 'success');
            closeModal();
            await fetchMenuItems();
            updateCategoryCounts();
            
            // ✅ FIX: Deduct ingredient stocks when adding NEW product (not on edit)
            if (!isEdit) {
                const deductionResult = await deductIngredientStocksFromInventory(itemData.itemName);
                if (deductionResult.deductions && deductionResult.deductions.length > 0) {
                    console.log(`✅ Successfully deducted ingredients for "${itemData.itemName}"`);
                }
                
                console.log(`✅ Product "${itemData.itemName}" created successfully - NOT added to Send Stock yet (quantity = 0)`);
                console.log(`📝 Admin must manually add stock before it appears in Send Stock table`);
                
                showToast(`✅ Product created. Go to Send Stock section to add stock.`, 'success');
            }
            
            // ✅ FIX: Save inventory stock values to prevent reset
            saveInventoryStockValues();
            
        } else {
            throw new Error(data.message || 'Failed to save product');
        }
    } catch (error) {
        console.error('❌ Error saving product:', error);
        showToast(`Error: ${error.message}`, 'error');
    } finally {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
    }
}

// ==================== DELETE MENU ITEM ====================
async function deleteMenuItem(itemId) {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        return;
    }
    
    // ✅ FIX: Skip deletion for fallback items (not real MongoDB items)
    if (itemId && itemId.startsWith('fallback_')) {
        console.log(`ℹ️ Item "${itemId}" is a local fallback item, removing from UI only`);
        
        showToast('Local product removed (not saved in database)', 'info');
        
        // Remove from UI only
        const product = allMenuItems.find(item => item._id === itemId);
        const productName = product ? (product.name || product.itemName) : null;
        
        allMenuItems = allMenuItems.filter(item => item._id !== itemId);
        
        if (productName) {
            stocksData = stocksData.filter(item => item.name !== productName);
            saveUniqueItemsToLocalStorage();
        }
        
        updateAllUIComponents();
        updateCategoryCounts();
        saveInventoryStockValues();
        return;  // ✅ Don't try to delete from server
    }
    
    const deleteBtn = event.target;
    const originalText = deleteBtn.textContent;
    deleteBtn.textContent = 'Deleting...';
    deleteBtn.disabled = true;
    
    try {
        const response = await fetch(`/api/menu/${itemId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Invalid server response format');
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(`Server error ${response.status}: ${data.message || 'Unknown error'}`);
        }
        
        if (data.success) {
            showToast('Product deleted successfully!', 'success');
            
            // Find the product name before deleting
            const product = allMenuItems.find(item => item._id === itemId);
            const productName = product ? (product.name || product.itemName) : null;
            
            // Remove from allMenuItems
            allMenuItems = allMenuItems.filter(item => item._id !== itemId);
            
            // Also remove from stocksData if it exists
            if (productName) {
                stocksData = stocksData.filter(item => item.name !== productName);
                saveUniqueItemsToLocalStorage();
            }
            
            updateAllUIComponents();
            updateCategoryCounts();
            
            // ✅ FIX: Save inventory stock values to prevent reset
            saveInventoryStockValues();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('❌ Error deleting product:', error);
        showToast('Failed to delete product', 'error');
    } finally {
        deleteBtn.textContent = originalText;
        deleteBtn.disabled = false;
    }
}

// ==================== UPDATE UI COMPONENTS ====================
function updateAllUIComponents() {
    if (currentSection === 'dashboard') {
        updateDashboardStats();
        renderDashboardGrid();
    } else if (currentSection === 'menu') {
        renderMenuGrid();
    } else if (currentSection === 'sendstock') {
        initializeSendStockUI();
    }
    updateCategoryCounts();
}

function updateDashboardStats() {
    if (!allMenuItems || !Array.isArray(allMenuItems)) {
        const totalEl = document.getElementById('totalProducts');
        const lowEl = document.getElementById('lowStock');
        const outEl = document.getElementById('outOfStock');
        const inEl = document.getElementById('inStock');
        const valueEl = document.getElementById('menuValue');
        
        if (totalEl) totalEl.textContent = '0';
        if (lowEl) lowEl.textContent = '0';
        if (outEl) outEl.textContent = '0';
        if (inEl) inEl.textContent = '0';
        if (valueEl) valueEl.textContent = '₱0';
        return;
    }
    
    const totalMenuItems = allMenuItems.length;
    
    const lowStockItems = allMenuItems.filter(item => {
        const currentStock = item.currentStock || 0;
        const minStock = item.minStock || 0;
        return currentStock > 0 && currentStock <= minStock;
    }).length;
    
    const outOfStockItems = allMenuItems.filter(item => (item.currentStock || 0) === 0).length;
    const inStockItems = allMenuItems.filter(item => (item.currentStock || 0) > (item.minStock || 0)).length;
    
    const menuValueTotal = allMenuItems.reduce((total, item) => {
        const price = item.price || 0;
        const stock = item.currentStock || 0;
        return total + (price * stock);
    }, 0);
    
    const totalEl = document.getElementById('totalProducts');
    const lowEl = document.getElementById('lowStock');
    const outEl = document.getElementById('outOfStock');
    const inEl = document.getElementById('inStock');
    const valueEl = document.getElementById('menuValue');
    
    if (totalEl) totalEl.textContent = formatNumber(totalMenuItems);
    if (lowEl) lowEl.textContent = formatNumber(lowStockItems);
    if (outEl) outEl.textContent = formatNumber(outOfStockItems);
    if (inEl) inEl.textContent = formatNumber(inStockItems);
    if (valueEl) valueEl.textContent = formatCurrency(menuValueTotal);
}

function updateCategoryCounts() {
    if (!allMenuItems || !Array.isArray(allMenuItems)) return;
    
    const categories = {
        'all': allMenuItems.length,
        'Rice': allMenuItems.filter(item => item.category === 'Rice').length,
        'Sizzling': allMenuItems.filter(item => item.category === 'Sizzling').length,
        'Party': allMenuItems.filter(item => item.category === 'Party').length,
        'Drink': allMenuItems.filter(item => item.category === 'Drink').length,
        'Cafe': allMenuItems.filter(item => item.category === 'Cafe').length,
        'Milk': allMenuItems.filter(item => item.category === 'Milk').length,
        'Frappe': allMenuItems.filter(item => item.category === 'Frappe').length,
        'Snack & Appetizer': allMenuItems.filter(item => item.category === 'Snack & Appetizer').length,
        'Budget Meals Served with Rice': allMenuItems.filter(item => item.category === 'Budget Meals Served with Rice').length,
        'Specialties': allMenuItems.filter(item => item.category === 'Specialties').length,
        'packaging': allMenuItems.filter(item => item.category === 'packaging').length
    };
    
    if (elements.categoryItems && elements.categoryItems.length > 0) {
        elements.categoryItems.forEach(item => {
            const category = item.getAttribute('data-category');
            const countElement = item.querySelector('.category-count');
            if (countElement) {
                countElement.textContent = categories[category] || 0;
            }
        });
    }
}

function showSection(section) {
    document.querySelectorAll('.section-content').forEach(sec => {
        sec.classList.remove('active-section');
    });
    
    const targetSection = document.getElementById(section);
    if (targetSection) targetSection.classList.add('active-section');
    
    if (elements.navLinks && elements.navLinks.length > 0) {
        elements.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === section) {
                link.classList.add('active');
            }
        });
    }
    
    currentSection = section;
    
    if (section === 'dashboard') {
        updateDashboardStats();
        renderDashboardGrid();
    } else if (section === 'menu') {
        renderMenuGrid();
    } else if (section === 'sendstock') {
        initializeSendStockUI();
    }
}

function filterByCategory(category, fullname) {
    currentCategory = category;
    
    if (elements.categoryItems && elements.categoryItems.length > 0) {
        elements.categoryItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-category') === category) {
                item.classList.add('active');
            }
        });
    }
    
    if (elements.currentCategoryTitle) {
        elements.currentCategoryTitle.textContent = fullname || 'Product Menu';
    }
    
    if (currentSection === 'menu') {
        renderMenuGrid();
    }
}

// ==================== RENDER MENU GRID ====================
async function canMenuItemBeMade(itemName) {
    const availability = await checkIngredientAvailability(itemName);
    return availability.available;
}

function renderMenuGrid() {
    if (!elements.menuGrid) return;
    
    if (!allMenuItems || !Array.isArray(allMenuItems) || allMenuItems.length === 0) {
        elements.menuGrid.innerHTML = `
            <div class="empty-state">
                <h3>No products found</h3>
                <p>Add products using the "Add New Product" button</p>
            </div>
        `;
        return;
    }
    
    let filteredItems = [...allMenuItems];
    
    if (currentCategory !== 'all') {
        filteredItems = allMenuItems.filter(item => item.category === currentCategory);
    }
    
    if (filteredItems.length === 0) {
        elements.menuGrid.innerHTML = `
            <div class="empty-state">
                <h3>No products in this category</h3>
                <p>Add products to this category using the "Add New Product" button</p>
            </div>
        `;
        return;
    }
    
    const gridHTML = filteredItems.map(item => {
        const itemName = item.name || item.itemName || 'Unnamed Product';
        const itemPrice = item.price || 0;
        const currentStock = item.currentStock || 0;
        const maxStock = item.maxStock || 0;
        const minStock = item.minStock || 0;
        const unit = item.unit || '';
        const displayUnit = unitDisplayLabels[unit] || unit;
        const itemValue = itemPrice * currentStock;
        const stockPercentage = maxStock > 0 ? ((currentStock / maxStock) * 100) : 0;
        
        let stockClass = '';
        if (currentStock === 0) stockClass = 'out-of-stock';
        else if (currentStock <= minStock) stockClass = 'low-stock';
        
        return `
        <div class="menu-card ${stockClass}">
            <div class="card-header">
                <h4>${escapeHtml(itemName)}</h4>
                <div class="card-actions">
                    <button class="btn-icon" onclick="openEditModal('${item._id}')">Edit</button>
                    <button class="btn-icon delete" onclick="deleteMenuItem('${item._id}')">Delete</button>
                </div>
            </div>
            <div class="card-body">
                <div class="card-info"><span class="label">Category:</span> ${getCategoryDisplayName(item.category)}</div>
                <div class="card-info"><span class="label">Current Stock:</span> ${currentStock} ${displayUnit}</div>
                <div class="card-info"><span class="label">Selling Price:</span> ₱${itemPrice.toFixed(2)}</div>
                <div class="card-info"><span class="label">Stock Value:</span> ₱${itemValue.toFixed(2)}</div>
                <div class="card-info"><span class="label">Min Stock:</span> ${minStock} ${displayUnit}</div>
                <div class="card-info"><span class="label">Max Stock:</span> ${maxStock} ${displayUnit}</div>
                <div class="card-info">
                    <span class="label">Stock Level:</span>
                    <div class="stock-progress">
                        <div class="progress-bar" style="width: ${Math.min(stockPercentage, 100)}%"></div>
                    </div>
                </div>
                <div class="card-info">
                    <span class="label">Status:</span>
                    <span class="status ${currentStock === 0 ? 'out-of-stock' : currentStock <= minStock ? 'low-stock' : 'in-stock'}">
                        ${currentStock === 0 ? 'Out of Stock' : currentStock <= minStock ? 'Low Stock' : 'In Stock'}
                    </span>
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    elements.menuGrid.innerHTML = gridHTML;
}

function renderDashboardGrid() {
    if (!elements.dashboardGrid) return;
    
    if (!allMenuItems || !Array.isArray(allMenuItems) || allMenuItems.length === 0) {
        elements.dashboardGrid.innerHTML = `
            <div class="empty-state">
                <h3>No products available</h3>
                <p>Add products to see dashboard data</p>
            </div>
        `;
        return;
    }
    
    const lowStockItems = allMenuItems.filter(item => {
        const currentStock = item.currentStock || 0;
        const minStock = item.minStock || 0;
        return currentStock <= minStock;
    });
    
    const recentItems = lowStockItems.slice(0, 8);
    
    if (recentItems.length === 0) {
        elements.dashboardGrid.innerHTML = `
            <div class="empty-state">
                <h3>All products are well stocked!</h3>
                <p>No low stock items to display</p>
            </div>
        `;
        return;
    }
    
    const gridHTML = recentItems.map(item => {
        const itemName = item.name || item.itemName || 'Unnamed Product';
        const itemPrice = item.price || 0;
        const currentStock = item.currentStock || 0;
        const maxStock = item.maxStock || 0;
        const minStock = item.minStock || 0;
        const unit = item.unit || '';
        const displayUnit = unitDisplayLabels[unit] || unit;
        const itemValue = itemPrice * currentStock;
        
        return `
        <div class="menu-card ${currentStock === 0 ? 'out-of-stock' : 'low-stock'}">
            <div class="card-header">
                <h4>${escapeHtml(itemName)}</h4>
            </div>
            <div class="card-body">
                <div class="card-info"><span class="label">Stock:</span> ${currentStock}/${maxStock} ${displayUnit}</div>
                <div class="card-info"><span class="label">Value:</span> ₱${itemValue.toFixed(2)}</div>
                <div class="card-info"><span class="label">Min:</span> ${minStock} ${displayUnit}</div>
                <div class="card-info">
                    <span class="label">Status:</span>
                    <span class="status ${currentStock === 0 ? 'out-of-stock' : 'low-stock'}">
                        ${currentStock === 0 ? 'Out of Stock' : 'Low Stock'}
                    </span>
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    elements.dashboardGrid.innerHTML = gridHTML;
}

// ==================== LOGOUT ====================
function handleLogout() {
    if (!confirm('Are you sure you want to logout?')) return;
    
    fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    })
    .then(() => { window.location.href = '/login'; })
    .catch(error => {
        console.error('Logout error:', error);
        window.location.href = '/login';
    });
}

// ==================== 🆕 FIXED: SEND STOCK TO STAFF - WITH REAL INGREDIENT CHECKING ====================

// ==================== INITIALIZE SEND STOCK UI ====================
async function initializeSendStockUI() {
    console.log('📦 Initializing Send Stock UI - WITH REAL INGREDIENT CHECKING...');
    
    // Reset pagination
    currentPage = 1;
    
    // Always rebuild stocksData from current allMenuItems to reflect any stock changes
    if (allMenuItems && allMenuItems.length > 0) {
        console.log('📋 Rebuilding from allMenuItems to get latest stock values...');
        await buildUniqueStocksData(allMenuItems);
    } else {
        // Use fallback
        await buildUniqueStocksData(FALLBACK_MENU_ITEMS);
    }
    
    // Load permanent stock values
    const permanentStockValues = loadPermanentStockValues();
    stocksData.forEach(item => {
        if (permanentStockValues[item.name] !== undefined) {
            item.quantity = permanentStockValues[item.name];
        }
    });
    
    // Save unique items
    saveUniqueItemsToLocalStorage();
    savePermanentStockValues();
    
    console.log('✅ Final stocksData ready with', stocksData.length, 'UNIQUE items');
    
    renderSendStockTable();
    attachSendStockEventListeners();
    checkSendStockEmptyState();
    
    sendStockUIInitialized = true;
}

// ==================== BUILD UNIQUE STOCKS DATA ====================
async function buildUniqueStocksData(items) {
    console.log('🔨 Building unique stocks data from', items.length, 'items...');
    
    const itemMap = new Map();
    const permanentStockValues = loadPermanentStockValues();
    
    items.forEach((item, index) => {
        const itemName = item.name || item.itemName;
        if (!itemName) return;
        
        if (itemMap.has(itemName)) return;
        
        let quantity = parseInt(item.currentStock) || 0;
        
        if (permanentStockValues[itemName] !== undefined) {
            quantity = permanentStockValues[itemName];
        }
        
        // 🆕 FIXED: ONLY add to Send Stock table if:
        // 1. Product has stock > 0 in admin inventory, OR
        // 2. Staff has pending request for this product
        const hasPendingRequest = notifications && notifications.some(n => 
            n.type === 'stock_request' && 
            !n.fulfilled &&
            n.productName === itemName
        );
        
        if (quantity > 0 || hasPendingRequest) {
            itemMap.set(itemName, {
                id: itemMap.size + 1,
                _id: item._id || `item_${Date.now()}_${itemMap.size}`,
                name: itemName,
                category: categoryDisplayNames[item.category] || item.category || 'Uncategorized',
                description: itemName,
                quantity: quantity,
                price: parseFloat(item.price) || 0,
                unit: item.unit || 'piece',
                minStock: parseInt(item.minStock) || 10,
                maxStock: parseInt(item.maxStock) || 200
            });
        }
    });
    
    stocksData = Array.from(itemMap.values());
    console.log('✅ Built', stocksData.length, 'items for Send Stock table (quantity > 0 or pending requests)');
}

// ==================== CHECK EMPTY STATE ====================
function checkSendStockEmptyState() {
    const section = document.getElementById('sendstock');
    if (!section) return;
    
    const existingEmptyState = document.getElementById('sendStockEmptyState');
    const tableContainer = section.querySelector('.table-responsive');
    const paginationContainer = document.getElementById('paginationContainer');
    
    if (!stocksData || stocksData.length === 0) {
        if (existingEmptyState) {
            existingEmptyState.style.display = 'block';
            if (tableContainer) tableContainer.style.display = 'none';
            if (paginationContainer) paginationContainer.style.display = 'none';
            return;
        }
        
        const emptyStateDiv = document.createElement('div');
        emptyStateDiv.id = 'sendStockEmptyState';
        emptyStateDiv.className = 'empty-state';
        emptyStateDiv.style.cssText = `
            text-align: center;
            padding: 60px 20px;
            background: white;
            border-radius: 8px;
            margin: 20px;
            border: 1px solid #eee;
        `;
        emptyStateDiv.innerHTML = `
            <div style="font-size: 64px; margin-bottom: 20px;">📦</div>
            <h3 style="margin-bottom: 10px; color: #333;">No Products Available</h3>
            <p style="color: #666; margin-bottom: 20px;">Add products to the menu first before sending stock to staff.</p>
            <button onclick="openAddModal()" class="btn-primary" style="padding: 12px 24px;">
                <i class="fas fa-plus"></i> Add New Product
            </button>
        `;
        
        if (tableContainer) {
            tableContainer.parentNode.insertBefore(emptyStateDiv, tableContainer);
            tableContainer.style.display = 'none';
        } else {
            section.appendChild(emptyStateDiv);
        }
        if (paginationContainer) paginationContainer.style.display = 'none';
    } else {
        if (existingEmptyState) {
            existingEmptyState.style.display = 'none';
        }
        if (tableContainer) {
            tableContainer.style.display = 'block';
        }
        if (paginationContainer) {
            paginationContainer.style.display = 'block';
        }
    }
}

// ==================== CHECK PENDING REQUESTS FOR ITEM ====================
async function hasPendingRequestForItem(itemName) {
    // In offline mode, always return true to allow sending
    return true;
}

// ==================== 🆕 FIXED: RENDER SEND STOCK TABLE - WITH REAL INGREDIENT CHECKING ====================
async function renderSendStockTable() {
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) {
        console.warn('⚠️ tableBody element not found');
        return;
    }
    
    // Save quantity values
    const quantityInputs = tableBody.querySelectorAll('.quantity-input');
    quantityInputs.forEach(input => {
        const stockId = input.getAttribute('data-stock-id');
        lastQuantityValues.set(stockId, input.value);
    });
    
    // Get filter values
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    const activeFilter = document.querySelector('.filter-btn.active');
    let filterValue = 'all';
    if (activeFilter) {
        const onclickAttr = activeFilter.getAttribute('onclick');
        if (onclickAttr) {
            const match = onclickAttr.match(/'([^']+)'/);
            if (match) filterValue = match[1];
        }
    }
    
    // Filter data
    filteredStocksData = [...stocksData];
    
    if (searchTerm) {
        filteredStocksData = filteredStocksData.filter(item => 
            item.name.toLowerCase().includes(searchTerm) || 
            item.category.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm)
        );
    }
    
    if (filterValue !== 'all') {
        filteredStocksData = filteredStocksData.filter(item => {
            const itemCategory = item.category.toLowerCase();
            const filterCategory = filterValue.toLowerCase();
            return itemCategory.includes(filterCategory) || 
                   filterCategory.includes(itemCategory) ||
                   itemCategory === filterCategory;
        });
    }
    
    // Update pagination
    totalPages = Math.ceil(filteredStocksData.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredStocksData.length);
    const paginatedData = filteredStocksData.slice(startIndex, endIndex);
    
    // Update counts
    const totalItemsEl = document.getElementById('totalItems');
    if (totalItemsEl) totalItemsEl.textContent = filteredStocksData.length;
    
    const lastUpdatedEl = document.getElementById('lastUpdated');
    if (lastUpdatedEl) lastUpdatedEl.textContent = new Date().toLocaleTimeString();
    
    // Render rows
    if (filteredStocksData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px;">
                    <div style="font-size: 48px; margin-bottom: 20px;">🔍</div>
                    <h3 style="margin-bottom: 10px; color: #333;">No items found</h3>
                    <p style="color: #666;">Try adjusting your search or filter</p>
                </td>
            </tr>
        `;
    } else {
        tableBody.innerHTML = '';
        
        for (const stock of paginatedData) {
            const row = document.createElement('tr');
            
            // 🆕 FIXED: Check FULL product availability with REAL ingredient inventory
            const fullAvailability = await checkFullProductAvailability(stock.name);
            const hasAllIngredients = fullAvailability.available;
            const missingItems = fullAvailability.missingItems;
            
            // Determine status
            let statusClass = 'status-available';
            let statusText = 'In Stock';
            
            if (stock.quantity <= 0) {
                statusClass = 'status-out';
                statusText = 'Out of Stock';
            } else if (stock.quantity <= stock.minStock) {
                statusClass = 'status-low';
                statusText = 'Low Stock';
            } else if (stock.quantity <= stock.minStock * 2) {
                statusClass = 'status-medium';
                statusText = 'Medium Stock';
            }
            
            const formattedPrice = `₱${parseFloat(stock.price).toFixed(2)}`;
            const savedQuantity = lastQuantityValues.get(stock.id.toString()) || '0';
            
            // Check if there are pending requests for this item
            const hasPendingRequest = notifications.some(n => 
                n.type === 'stock_request' && 
                !n.fulfilled &&
                n.productName === stock.name
            );
            
            // 🆕 FIXED: Determine if send button should be enabled
            let sendBtnDisabled = true;
            let sendBtnTitle = '';
            let sendBtnClass = 'send-stock-btn';
            let sendBtnIcon = 'fa-paper-plane';
            let showSendBtn = false;
            
            // Only show "Send to Staff" button if there's a pending request
            if (hasPendingRequest) {
                showSendBtn = true;
                if (stock.quantity <= 0) {
                    sendBtnTitle = '❌ Out of stock in admin inventory - Cannot fulfill';
                    sendBtnClass += ' btn-danger';
                    sendBtnDisabled = true;
                } else if (!hasAllIngredients) {
                    sendBtnTitle = `❌ Missing: ${missingItems.slice(0, 3).join(', ')}${missingItems.length > 3 ? ` +${missingItems.length - 3} more` : ''} - Cannot fulfill`;
                    sendBtnClass += ' btn-danger';
                    sendBtnIcon = 'fa-exclamation-triangle';
                    sendBtnDisabled = true;
                } else {
                    sendBtnDisabled = false;
                    sendBtnTitle = '✅ All ingredients & stock available! Ready to send';
                    sendBtnClass += ' btn-success';
                    sendBtnIcon = 'fa-check-circle';
                }
            } else {
                showSendBtn = false;
                sendBtnTitle = 'No pending request from staff';
                sendBtnClass += ' btn-secondary';
                sendBtnDisabled = true;
            }
            
            // 🆕 FIXED: Get recipe for display
            const recipe = productIngredientMap[stock.name];
            let requiredIngredients = [];
            if (recipe && recipe.ingredients) {
                requiredIngredients = Object.keys(recipe.ingredients);
            }
            
            // 🆕 FIXED: Ingredient status HTML
            let ingredientStatusHtml = '';
            if (requiredIngredients.length > 0) {
                if (hasAllIngredients) {
                    ingredientStatusHtml = `
                        <div style="font-size: 11px; color: #28a745; margin-top: 4px; background: #d4edda; padding: 6px; border-radius: 4px; display: flex; align-items: center; gap: 6px;">
                            <i class="fas fa-check-circle"></i> 
                            <span><strong>All ingredients available</strong> (${requiredIngredients.length} items)</span>
                        </div>
                    `;
                } else {
                    ingredientStatusHtml = `
                        <div style="font-size: 11px; color: #dc3545; margin-top: 4px; background: #f8d7da; padding: 6px; border-radius: 4px;">
                            <i class="fas fa-exclamation-circle"></i> 
                            <strong>Missing:</strong> ${missingItems.slice(0, 3).join(', ')}${missingItems.length > 3 ? ` +${missingItems.length - 3} more` : ''}
                        </div>
                    `;
                }
            }
            
            // Servingware status if needed
            let servingwareStatusHtml = '';
            if (recipe && recipe.servingware && servingwareInventory[recipe.servingware]) {
                const servingware = servingwareInventory[recipe.servingware];
                if (servingware.current <= 0) {
                    servingwareStatusHtml = `
                        <div style="font-size: 11px; color: #dc3545; margin-top: 4px; background: #f8d7da; padding: 6px; border-radius: 4px;">
                            <i class="fas fa-exclamation-circle"></i> 
                            <strong>Missing servingware:</strong> ${servingware.name} (out of stock)
                        </div>
                    `;
                }
            }
            
            // Pending request badge
            const pendingRequestBadge = hasPendingRequest ? 
                '<span style="display: inline-block; background: #ff9800; color: white; font-size: 10px; padding: 2px 8px; border-radius: 12px; margin-left: 8px;">📋 Has Request</span>' : '';
            
            row.innerHTML = `
                <td>${stock.id}</td>
                <td>
                    <strong>${escapeHtml(stock.name)}</strong>
                    <span class="permanent-stock-badge">Permanent</span>
                    ${pendingRequestBadge}
                </td>
                <td>${escapeHtml(stock.category)}</td>
                <td>${escapeHtml(stock.description)}</td>
                <td>
                    <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #ddd;">
                        <div style="font-size: 12px; font-weight: bold; color: #333; margin-bottom: 8px;">
                            📦 Add Stock to Menu:
                        </div>
                        <div class="quantity-controls" style="margin-bottom: 8px;">
                            <input type="number" 
                                   class="quantity-input" 
                                   id="addStock-${stock.id}" 
                                   placeholder="Amount"
                                   min="1"
                                   max="${stock.maxStock}"
                                   step="1"
                                   style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px;"
                            />
       
                        </div>
                        <div style="font-size: 11px; color: #666;">Current: ${stock.quantity}/${stock.maxStock} ${stock.unit}</div>
                    </div>
                    <div style="font-size: 12px; color: #666; margin-top: 4px;">
                        <strong style="color: #28a745;">Available: ${stock.quantity} ${stock.unit}</strong>
                        <span style="margin-left: 8px; font-size: 11px; color: #6c757d;">
                            (Permanent)
                        </span>
                    </div>
                    ${ingredientStatusHtml}
                    ${servingwareStatusHtml}
                </td>
                <td>${formattedPrice}</td>
                <td>
                    <span class="status ${statusClass}">${statusText}</span>
                    ${stock.quantity <= stock.minStock ? 
                        `<span style="display: block; font-size: 11px; color: #dc3545; margin-top: 4px;">
                            Min: ${stock.minStock} ${stock.unit}
                        </span>` : ''}
                </td>
                <td>
                    <div class="staff-stock-info">
                        <span style="color: #28a745;">✓ Staff needs stock</span>
                        ${hasPendingRequest ? 
                            '<span style="display: block; color: #28a745; margin-top: 2px;">📋 Has pending request</span>' : 
                            '<span style="display: block; color: #6c757d; margin-top: 2px;">⏳ No pending request</span>'}
                    </div>
                </td>
                <td>
                    <div style="display: flex; flex-direction: column; gap: 8px;">         
                        <!-- Send to Staff Button -->
                        ${showSendBtn ? `
                                              <button class="btn-primary" 
                                    onclick="quickAddStock('${stock._id}', '${escapeHtml(stock.name)}')"
                                    style="padding: 8px 12px; white-space: nowrap; margin-left: 8px; font-size: 13px;"
                            >Add ${stock.unit}</button>
                        ` : `
                            <span style="color: #6c757d; font-size: 12px;">Waiting for request...</span>
                        `}
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        }
    }
    
    // Update pagination
    updatePagination();
}

// ==================== ATTACH EVENT LISTENERS ====================
function attachSendStockEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        const newSearchInput = searchInput.cloneNode(true);
        searchInput.parentNode.replaceChild(newSearchInput, searchInput);
        
        newSearchInput.addEventListener('input', function() {
            currentPage = 1;
            renderSendStockTable();
        });
    }
}

// ==================== VALIDATE QUANTITY ====================
function validateQuantity(id, value) {
    const stock = stocksData.find(item => item.id === id);
    if (!stock) return;
    
    let quantity = parseInt(value) || 0;
    
    if (quantity < 0) quantity = 0;
    if (quantity > stock.quantity) quantity = stock.quantity;
    
    const input = document.getElementById(`quantity-${id}`);
    if (input) {
        input.value = quantity;
    }
    
    lastQuantityValues.set(id.toString(), quantity.toString());
    savePersistedQuantities();
}

// ==================== INCREASE QUANTITY ====================
function increaseQuantity(id) {
    const stock = stocksData.find(item => item.id === id);
    if (!stock) return;
    
    const input = document.getElementById(`quantity-${id}`);
    if (input) {
        let currentValue = parseInt(input.value) || 0;
        if (currentValue < stock.quantity) {
            input.value = currentValue + 1;
            lastQuantityValues.set(id.toString(), input.value);
            savePersistedQuantities();
        }
    }
}

// ==================== DECREASE QUANTITY ====================
function decreaseQuantity(id) {
    const stock = stocksData.find(item => item.id === id);
    if (!stock) return;
    
    const input = document.getElementById(`quantity-${id}`);
    if (input) {
        let currentValue = parseInt(input.value) || 0;
        if (currentValue > 0) {
            input.value = currentValue - 1;
            lastQuantityValues.set(id.toString(), input.value);
            savePersistedQuantities();
        }
    }
}

// ==================== 🆕 FIXED: MAIN SEND STOCK FUNCTION - WITH REAL INGREDIENT CHECKING ====================
async function sendStockToStaff(id) {
    const stock = stocksData.find(item => item.id === id);
    if (!stock) {
        alert('Item not found');
        return;
    }
    
    // 🆕 FIXED: Get the MongoDB _id from allMenuItems
    const menuItem = allMenuItems.find(m => m.name === stock.name || m.itemName === stock.name);
    if (!menuItem || !menuItem._id) {
        console.error(`❌ Menu item not found in database for: ${stock.name}`);
        showToast(`❌ Product not found in database. Please refresh and try again.`, 'error');
        return;
    }
    
    // 🆕 FIXED: Check FULL product availability before sending
    const fullAvailability = await checkFullProductAvailability(stock.name);
    if (!fullAvailability.available) {
        const errorMsg = `❌ Cannot send stock! Missing items:\n\n  • ${fullAvailability.missingItems.join('\n  • ')}\n\nPlease restock these items first.`;
        alert(errorMsg);
        showToast('❌ Missing required items', 'error');
        return;
    }
    
    const quantityInput = document.getElementById(`quantity-${id}`);
    const quantityToSend = quantityInput ? parseInt(quantityInput.value) || 0 : 0;
    
    if (quantityToSend <= 0) {
        alert('Please enter a valid quantity greater than 0');
        return;
    }
    
    if (quantityToSend > stock.quantity) {
        alert(`Not enough stock! Available: ${stock.quantity} ${stock.unit}, Requested: ${quantityToSend} ${stock.unit}`);
        return;
    }
    
    const confirmSend = confirm(`Send ${quantityToSend} ${stock.unit} of "${stock.name}" to staff?\n\nThis will PERMANENTLY DEDUCT ${quantityToSend} ${stock.unit} from ADMIN inventory.\n\n✅ All ingredients are available!\n\nThis change will NEVER reset, even after refreshing the page.`);
    if (!confirmSend) {
        return;
    }
    
    const sendBtn = document.getElementById(`sendBtn-${id}`);
    const originalBtnText = sendBtn.innerHTML;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    sendBtn.disabled = true;
    
    try {
        console.log('='.repeat(60));
        console.log(`📦 SENDING STOCK TO STAFF: ${quantityToSend} ${stock.unit} of "${stock.name}"`);
        console.log(`   MongoDB ID: ${menuItem._id}`);
        console.log('='.repeat(60));
        
        const oldStock = stock.quantity;
        const newAdminStock = Math.max(0, stock.quantity - quantityToSend);
        
        // 🆕 CRITICAL: UPDATE MENU ITEM STOCK IN MONGODB FIRST
        const mongoUpdateSuccess = await updateMenuItemStockInMongoDB(menuItem._id, newAdminStock);
        if (!mongoUpdateSuccess) {
            console.error(`❌ CRITICAL: Failed to update stock in MongoDB`);
            showToast('❌ Failed to update stock. Please try again.', 'error');
            sendBtn.innerHTML = originalBtnText;
            sendBtn.disabled = false;
            return;
        }
        
        console.log(`✅ MONGODB UPDATED: Menu item "${stock.name}" stock is now ${newAdminStock}`);
        
        // Update local stock
        stock.quantity = newAdminStock;
        menuItem.currentStock = newAdminStock;
        console.log(`📊 Stock changed: ${oldStock} → ${newAdminStock} ${stock.unit}`);
        
        // Save to permanent storage
        updatePermanentStockValue(stock.name, newAdminStock);
        console.log(`✅ PERMANENT stock saved for "${stock.name}": ${newAdminStock}`);
        
        if (quantityInput) {
            quantityInput.value = 0;
        }
        
        lastQuantityValues.delete(id.toString());
        savePersistedQuantities();
        savePermanentStockValues();
        saveUniqueItemsToLocalStorage();
        
        // 🆕 FIXED: Emit real-time event to staff
        await emitStockTransferToStaff(stock, quantityToSend, stock.unit);
        
        // Mark any pending requests as fulfilled
        notifications.forEach(notification => {
            if (notification.type === 'stock_request' && 
                notification.productName === stock.name && 
                !notification.fulfilled) {
                notification.fulfilled = true;
                notification.read = true;
            }
        });
        
        updateNotificationBadge();
        renderNotifications();
        saveNotificationsToLocalStorage();
        
        console.log('✅ Stock sent successfully! New permanent stock:', newAdminStock);
        console.log('='.repeat(60));
        
        showToast(`✅ Sent ${quantityToSend} ${stock.unit} of "${stock.name}" to staff!`, 'success');
        
        addNotification(
            stock.name,
            `Sent ${quantityToSend} ${stock.unit} to staff inventory`,
            'success',
            'normal',
            'Admin'
        );
        
        renderSendStockTable();
        await fetchMenuItems();
        
        const verifyStock = loadPermanentStockValues();
        console.log(`✅ VERIFICATION - ${stock.name} permanent stock is: ${verifyStock[stock.name]}`);
        
    } catch (error) {
        console.error('❌ Error sending stock to staff:', error);
        showToast(`❌ Error: ${error.message}`, 'error');
    } finally {
        sendBtn.innerHTML = originalBtnText;
        sendBtn.disabled = false;
    }
}

// ==================== FILTER TABLE ====================
function filterTable(filter) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    currentPage = 1;
    renderSendStockTable();
}

// ==================== SAVE ALL CHANGES ====================
function saveAllChanges() {
    showToast('Use the "Send to Staff" button for each item', 'info');
}

// ==================== SEND STOCK BATCH ====================
async function sendStockBatch() {
    showToast('Please send stock individually using the Send button for each item', 'info');
}

// ==================== RESET ALL QUANTITIES ====================
function resetAllQuantities() {
    console.log('🔄 Resetting all quantities...');
    
    lastQuantityValues.clear();
    
    const quantityInputs = document.querySelectorAll('.quantity-input');
    quantityInputs.forEach(input => {
        input.value = '0';
    });
    
    showToast('✅ All quantities have been reset to 0', 'success');
    console.log('🎉 Reset operation completed successfully');
}

// ==================== RESET ALL STOCK TO ZERO (DANGER) ====================
function resetAllStockToZero() {
    if (!confirm('⚠️ WARNING: This will reset ALL PERMANENT stock values to 0. This cannot be undone. Continue?')) {
        return;
    }
    
    console.log('🔄 Resetting ALL permanent stock values to 0...');
    
    localStorage.removeItem('sendStock_permanentValues');
    console.log('✅ Cleared permanent stock values from localStorage');
    
    stocksData.forEach(item => {
        item.quantity = 0;
    });
    
    savePermanentStockValues();
    renderSendStockTable();
    
    showToast('✅ All permanent stock values have been reset to 0', 'success');
    console.log('🎉 Reset operation completed successfully');
}

// ==================== 🆕 FIXED: MANUAL RESTOCK FUNCTION ====================
function restockIngredient(ingredientKey, amount) {
    if (!ingredientInventory[ingredientKey]) {
        alert(`Ingredient ${ingredientKey} not found`);
        return;
    }
    
    const ingredient = ingredientInventory[ingredientKey];
    const oldStock = ingredient.current;
    const newStock = Math.min(ingredient.max, oldStock + amount);
    
    ingredient.current = newStock;
    
    console.log(`✅ Restocked ${ingredient.name}: ${oldStock} → ${newStock} ${ingredient.unit}`);
    showToast(`✅ Restocked ${ingredient.name}: +${amount} ${ingredient.unit}`, 'success');
    
    // Save to localStorage
    localStorage.setItem('ingredientInventory', JSON.stringify(ingredientInventory));
    
    // Re-render send stock table to update button states
    if (currentSection === 'sendstock') {
        renderSendStockTable();
    }
}

function restockServingware(servingwareKey, amount) {
    if (!servingwareInventory[servingwareKey]) {
        alert(`Servingware ${servingwareKey} not found`);
        return;
    }
    
    const servingware = servingwareInventory[servingwareKey];
    const oldStock = servingware.current;
    const newStock = Math.min(servingware.max, oldStock + amount);
    
    servingware.current = newStock;
    
    console.log(`✅ Restocked ${servingware.name}: ${oldStock} → ${newStock} ${servingware.unit}`);
    showToast(`✅ Restocked ${servingware.name}: +${amount} ${servingware.unit}`, 'success');
    
    // Save to localStorage
    localStorage.setItem('servingwareInventory', JSON.stringify(servingwareInventory));
    
    // Re-render send stock table to update button states
    if (currentSection === 'sendstock') {
        renderSendStockTable();
    }
}

// ==================== 📦 STOCK REQUEST MODAL FUNCTIONS ====================
function showRequestStockModal(product) {
    if (!product) {
        console.error('Cannot show stock request modal: product is null');
        return;
    }
    
    if (activeStockRequestModals.has(product.name)) {
        const existingModal = document.getElementById('stockRequestModal');
        if (existingModal && existingModal.dataset.productName === product.name) {
            existingModal.style.zIndex = '10001';
            setTimeout(() => { existingModal.style.zIndex = '10000'; }, 100);
        }
        return;
    }
    
    const maxRequestable = (product.maxStock || MAX_STOCK_PER_ITEM) - (product.stock || 0);
    
    const modalHTML = `
        <div id="stockRequestModal" data-product-name="${product.name}" style="display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10000; align-items: center; justify-content: center;">
            <div style="background: white; padding: 30px; border-radius: 10px; max-width: 500px; width: 90%; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="margin-top: 0; color: #333;">Request Stock</h2>
                <p style="color: #666; font-size: 16px;">Product: <strong>${product.name}</strong></p>
                <p style="color: #666; font-size: 14px;">Category: ${product.category}</p>
                <p style="color: ${product.stock > 0 ? '#28a745' : '#dc3545'}; font-size: 14px;">
                    Current Stock: ${product.stock || 0}/${product.maxStock || MAX_STOCK_PER_ITEM}
                </p>
                <p style="color: #ff9800; font-size: 14px;">
                    Available Capacity: ${maxRequestable} ${product.unit || ''}
                </p>
                
                <div style="margin: 20px 0;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold;">Quantity Requested:</label>
                    <input type="number" id="requestQty" min="1" max="${maxRequestable}" value="${Math.min(10, maxRequestable)}" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px;">
                </div>
                
                <div style="margin: 20px 0;">
                    <label style="display: block; margin-bottom: 8px; font-weight: bold;">Priority Level:</label>
                    <select id="requestPriority" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px;">
                        <option value="low">Low</option>
                        <option value="medium" selected>Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button onclick="closeStockRequestModal()" style="padding: 10px 20px; border: 1px solid #ddd; border-radius: 5px; cursor: pointer; background: #f0f0f0; color: #333;">Cancel</button>
                    <button onclick="submitStockRequest('${product._id || product.name}', '${product.name}', '${product.unit || 'pcs'}')" style="padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; background: #4CAF50; color: white;" ${maxRequestable <= 0 ? 'disabled' : ''}>Request Stock</button>
                </div>
            </div>
        </div>
    `;
    
    const existingModal = document.getElementById('stockRequestModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    activeStockRequestModals.add(product.name);
    
    const modal = document.getElementById('stockRequestModal');
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeStockRequestModal();
        }
    });
}

function closeStockRequestModal() {
    const modal = document.getElementById('stockRequestModal');
    if (modal) {
        const productName = modal.dataset.productName;
        if (productName) {
            activeStockRequestModals.delete(productName);
        }
        modal.remove();
    }
}

async function submitStockRequest(productId, productName, unit) {
    const modal = document.getElementById('stockRequestModal');
    
    const quantity = parseInt(document.getElementById('requestQty').value);
    const priority = document.getElementById('requestPriority').value;
    
    if (!quantity || quantity <= 0) {
        alert('Please enter a valid quantity');
        return;
    }
    
    // Find the product from allMenuItems
    const product = allMenuItems.find(p => p.name === productName);
    const maxRequestable = (product?.maxStock || MAX_STOCK_PER_ITEM) - (product?.stock || 0);
    
    if (quantity > maxRequestable) {
        alert(`Cannot request ${quantity} units. Maximum available capacity is ${maxRequestable} units.`);
        return;
    }
    
    // Show confirmation dialog
    const confirmationHTML = `
        <div id="confirmationDialog" style="display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10002; align-items: center; justify-content: center;">
            <div style="background: white; padding: 30px; border-radius: 10px; max-width: 500px; width: 90%; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="margin-top: 0; color: #333;">Confirm Stock Request</h2>
                <p style="color: #666; font-size: 16px; margin: 15px 0;">
                    Are you sure you want to request <strong>${quantity} ${unit}</strong> of <strong>${productName}</strong>?
                </p>
                <p style="color: #666; font-size: 14px; margin: 10px 0;">
                    Priority: <strong>${priority.charAt(0).toUpperCase() + priority.slice(1)}</strong>
                </p>
                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 25px;">
                    <button onclick="cancelConfirmation()" style="padding: 10px 20px; border: 1px solid #ddd; border-radius: 5px; cursor: pointer; background: #f0f0f0; color: #333;">Cancel</button>
                    <button onclick="confirmStockRequest('${productId}', '${productName}', '${unit}', ${quantity}, '${priority}')" style="padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; background: #4CAF50; color: white;">Confirm Request</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', confirmationHTML);
}

function cancelConfirmation() {
    const dialog = document.getElementById('confirmationDialog');
    if (dialog) dialog.remove();
}

async function confirmStockRequest(productId, productName, unit, quantity, priority) {
    const dialog = document.getElementById('confirmationDialog');
    if (dialog) dialog.remove();
    
    const confirmBtn = event?.target;
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.style.opacity = '0.6';
        confirmBtn.style.cursor = 'not-allowed';
    }
    
    try {
        console.log(`📤 Submitting stock request for ${productName}: ${quantity} ${unit} (${priority} priority)`);
        
        const product = allMenuItems.find(p => p.name === productName);
        const response = await fetch(`${BACKEND_URL}/api/stock-requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                productId: productId,
                productName: productName,
                requestedQuantity: quantity,
                unit: unit,
                priority: priority,
                requestedBy: 'admin',
                status: 'pending',
                maxStockLimit: MAX_STOCK_PER_ITEM,
                currentStock: product ? product.stock : 0
            })
        });
        
        const responseData = await response.json();
        
        if (response.ok) {
            // ✅ SUCCESS: Add to pending stock requests
            if (!pendingStockRequests.includes(productName)) {
                pendingStockRequests.push(productName);
                localStorage.setItem('pendingStockRequests', JSON.stringify(pendingStockRequests));
                localStorage.setItem(`requestTime_${productName}`, Date.now().toString());
                console.log(`✅ Added ${productName} to pending stock requests`);
            }
            
            stockRequestTimestamps[productName] = Date.now();
            localStorage.setItem('stockRequestTimestamps', JSON.stringify(stockRequestTimestamps));
            
            closeStockRequestModal();
            
            // Show success notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #4CAF50;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                z-index: 10005;
                font-weight: bold;
                box-shadow: 0 4px 6px rgba(0,0,0,0.2);
            `;
            notification.innerHTML = `✅ Stock request submitted for ${productName}!`;
            document.body.appendChild(notification);
            
            setTimeout(() => notification.remove(), 3000);
            
        } else if (response.status === 409) {
            // ❌ CONFLICT: Already pending
            const hoursOld = responseData.hoursOld ? Math.ceil(responseData.hoursOld) : 'unknown';
            console.warn(`⚠️ ${productName} has a pending request (${hoursOld} hours old)`);
            
            alert(`Stock request for "${productName}" is already pending.\n\nPlease wait for the admin to fulfill the previous request.`);
            closeStockRequestModal();
            
        } else if (response.status === 400) {
            // ❌ BAD REQUEST
            console.error(`❌ Invalid request data:`, responseData);
            alert(`Failed to submit request: ${responseData.message || 'Invalid request data'}`);
            closeStockRequestModal();
            
        } else {
            // ❌ OTHER ERROR
            console.error(`❌ Error submitting stock request:`, responseData);
            alert(`Failed to submit stock request: ${responseData.message || 'Unknown error'}`);
            closeStockRequestModal();
        }
        
    } catch (error) {
        console.error('❌ Network error submitting stock request:', error);
        
        // ✅ OFFLINE MODE: Add to pending to retry later
        if (!pendingStockRequests.includes(productName)) {
            pendingStockRequests.push(productName);
            localStorage.setItem('pendingStockRequests', JSON.stringify(pendingStockRequests));
            localStorage.setItem(`requestTime_${productName}`, Date.now().toString());
            console.log(`⚠️ Offline: Added ${productName} to pending stock requests (will retry)`);
        }
        
        stockRequestTimestamps[productName] = Date.now();
        localStorage.setItem('stockRequestTimestamps', JSON.stringify(stockRequestTimestamps));
        
        closeStockRequestModal();
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff9800;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10005;
            font-weight: bold;
            box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        `;
        notification.innerHTML = `⚠️ Request saved offline. Will retry when connected.`;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 5000);
    }
}

// ==================== EXPORT PAGINATION FUNCTIONS ====================
window.changePage = changePage;
window.changeItemsPerPage = changeItemsPerPage;

// ==================== 🆕 QUICK ADD STOCK FUNCTION ====================
async function quickAddStock(itemId, itemName) {
    // Try both possible input IDs (for MongoDB _id and fallback id)
    let inputElement = document.getElementById(`addStock-${itemId}`);
    if (!inputElement) {
        // Try with fallback ID format
        const product = allMenuItems.find(p => p._id === itemId);
        if (product && product.id) {
            inputElement = document.getElementById(`addStock-${product.id}`);
        }
    }
    
    if (!inputElement) {
        showToast('❌ Input element not found', 'error');
        return;
    }
    
    const quantityToAdd = parseInt(inputElement.value) || 0;
    
    if (quantityToAdd <= 0) {
        showToast('❌ Please enter a quantity greater than 0', 'error');
        return;
    }
    
    const product = allMenuItems.find(p => p._id === itemId);
    if (!product) {
        showToast(`❌ Product "${itemName}" not found`, 'error');
        return;
    }
    
    const currentStock = product.currentStock || 0;
    const maxStock = product.maxStock || 100;
    const newStock = currentStock + quantityToAdd;
    
    if (newStock > maxStock) {
        showToast(`❌ Would exceed max stock (${maxStock}). Current: ${currentStock}, Can add: ${maxStock - currentStock}`, 'warning');
        return;
    }
    
    const unit = product.unit || 'unit';
    const confirmMsg = `Add ${quantityToAdd} ${unit} to "${itemName}"?\n\nCurrent: ${currentStock} ${unit}\nAfter add: ${newStock} ${unit}`;
    
    if (!confirm(confirmMsg)) {
        return;
    }
    
    try {
        console.log(`📦 ADDING STOCK: ${quantityToAdd} ${unit} to "${itemName}"`);
        console.log(`   Current stock: ${currentStock}, New stock: ${newStock}`);
        
        // Update MongoDB
        const response = await fetch(`/api/menu/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                name: product.name || product.itemName,
                itemName: product.name || product.itemName,
                category: product.category,
                price: product.price,
                unit: product.unit,
                currentStock: newStock,
                minStock: product.minStock,
                maxStock: product.maxStock,
                image: product.image || 'default_food.jpg'
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Server error ${response.status}`);
        }
        
        const responseData = await response.json();
        console.log(`✅ MongoDB UPDATED: ${itemName} stock is now ${newStock}`);
        
        // Update local object
        product.currentStock = newStock;
        
        // Clear input
        inputElement.value = '';
        
        // Show success message
        showToast(`✅ Added ${quantityToAdd} ${unit} to "${itemName}" (New: ${newStock} ${unit})`, 'success');
        
        // Add to notifications
        addNotification(
            itemName,
            `Added ${quantityToAdd} ${unit} to inventory (Now: ${newStock} ${unit})`,
            'success',
            'normal',
            'Admin'
        );
        
        // Refresh menu grid and send stock table
        renderMenuGrid();
        if (currentSection === 'sendstock') {
            await initializeSendStockUI();
        }
        
        // Fetch updated data from MongoDB
        await fetchMenuItems();
        
        console.log(`✅ Stock added and saved to MongoDB`);
        
    } catch (error) {
        console.error('❌ Error adding stock:', error);
        showToast(`❌ Error: ${error.message}`, 'error');
    }
}

// ==================== EXPORT NOTIFICATION FUNCTIONS ====================
window.fulfillStockRequest = fulfillStockRequest;
window.closeFulfillConfirm = closeFulfillConfirm;
window.submitFulfillRequest = submitFulfillRequest;
window.dismissNotification = dismissNotification;

// ==================== EXPORT INGREDIENT FUNCTIONS ====================
window.restockIngredient = restockIngredient;
window.restockServingware = restockServingware;

// ==================== EXPORT QUICK STOCK FUNCTION ====================
window.quickAddStock = quickAddStock;

// ==================== GLOBAL EXPORTS ====================
window.handleLogout = handleLogout;
window.openAddModal = openAddModal;
window.openEditModal = openEditModal;
window.deleteMenuItem = deleteMenuItem;
window.toggleNotificationModal = toggleNotificationModal;
window.clearAllNotifications = clearAllNotifications;
window.initializeSendStockUI = initializeSendStockUI;
window.sendStockToStaff = sendStockToStaff;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.validateQuantity = validateQuantity;
window.filterTable = filterTable;
window.saveAllChanges = saveAllChanges;
window.sendStockBatch = sendStockBatch;
window.resetAllQuantities = resetAllQuantities;
window.resetAllStockToZero = resetAllStockToZero;
window.ingredientInventory = ingredientInventory;
window.servingwareInventory = servingwareInventory;

// ==================== EXPORT STOCK REQUEST MODAL FUNCTIONS ====================
window.showRequestStockModal = showRequestStockModal;
window.closeStockRequestModal = closeStockRequestModal;
window.submitStockRequest = submitStockRequest;
window.confirmStockRequest = confirmStockRequest;
window.cancelConfirmation = cancelConfirmation;

console.log('✅ Menu Management System loaded with REAL INGREDIENT INVENTORY!');
console.log('📦 Send Stock now checks actual ingredient inventory!');
console.log('🚀 Real-time stock transfer events are enabled!');