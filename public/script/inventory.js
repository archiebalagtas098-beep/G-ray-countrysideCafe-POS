// ==================== UI ELEMENTS ====================
let elements = {}; // Will be initialized after DOM loads

function initializeElements() {
    elements = {
        // Modal elements
        itemModal: document.getElementById('itemModal'),
        modalTitle: document.getElementById('modalTitle'),
        itemForm: document.getElementById('itemForm'),
        closeModal: document.getElementById('closeModal'),
        duplicateNotification: document.getElementById('duplicateNotification'),
        duplicateIngredientName: document.getElementById('duplicateIngredientName'),
        
        // Form fields
        itemId: document.getElementById('itemId'),
        itemName: document.getElementById('itemName'),
        itemType: document.getElementById('itemTypes'),
        itemCategory: document.getElementById('itemCategories'),
        itemUnit: document.getElementById('itemUnit'),
        currentStock: document.getElementById('currentStock'),
        minStock: document.getElementById('minStock'),
        maxStock: document.getElementById('maxStock'),
        description: document.getElementById('description'),
        
        // Buttons
        addNewItem: document.getElementById('addNewItem'),
        saveItemBtn: document.getElementById('saveItemBtn'),
        cancelBtn: document.getElementById('cancelBtn'),
        refreshDashboard: document.getElementById('refreshDashboard'),
        
        // Grid containers
        inventoryGrid: document.getElementById('inventoryGrid'),
        dashboardGrid: document.getElementById('dashboardGrid'),
        
        // Dashboard stats
        totalItems: document.getElementById('allInventoryItems'),
        lowStock: document.getElementById('lowStock'),
        outOfStock: document.getElementById('outOfStock'),
        inStock: document.getElementById('inStock'),
        
        // Navigation
        navLinks: document.querySelectorAll('.nav-link[data-section]'),
        categoryItems: document.querySelectorAll('.category-item[data-category]'),
        
        // Info displays
        recipeInfo: document.getElementById('recipeInfo'),
        
        // Search
        searchInput: document.getElementById('searchInventory')
    };
    
    console.log('✅ Elements initialized');
}

// ==================== GLOBAL VARIABLES ====================
let allInventoryItems = [];
let currentSection = 'dashboard';
let currentCategory = '';
let isModalOpen = false;

const categoryUnitsMapping = {
    'meat': ['kg', 'g', 'pieces'],
    'seafood': ['kg', 'g', 'pieces'],
    'produce': ['kg', 'g', 'pieces'],
    'dairy': ['liters', 'ml', 'pieces'],
    'dry': ['kg', 'g', 'liters', 'ml', 'pieces'],
    'beverage': ['liters', 'ml', 'pieces'],
    'packaging': ['pieces', 'packs']
};

const validRawIngredients = {
    // ==================== MEAT & POULTRY ====================
    'Pork': 'meat',
    'Pork belly': 'meat',
    'Pork chop': 'meat',
    'Ground pork': 'meat',
    'Chicken': 'meat',
    'Fried chicken': 'meat',
    'Shrimp': 'meat',
    'Fish fillet': 'meat',
    'Cream dory': 'meat',
    'Beef shank': 'meat',
    'Bagnet': 'meat',
    'Tinapa': 'meat',
    'Tuyo': 'meat',
    'Ham': 'meat',
    'Hotdog': 'meat',
    
    // ==================== SEAFOOD ====================
    'Fish': 'seafood',
    
    // ==================== FRESH PRODUCE ====================
    'Garlic': 'produce',
    'Onion': 'produce',
    'Carrot': 'produce',
    'Cabbage': 'produce',
    'Tomato': 'produce',
    'Lettuce': 'produce',
    'Cucumber': 'produce',
    'Lemon': 'produce',
    'Bell pepper': 'produce',
    'Calamansi': 'produce',
    'Chili': 'produce',
    'Radish': 'produce',
    'Kangkong': 'produce',
    'Eggplant': 'produce',
    'Squash': 'produce',
    'Okra': 'produce',
    'Ampalaya': 'produce',
    'Corn': 'produce',
    'Potato': 'produce',
    'Bread': 'produce',
    
    // ==================== DAIRY & EGGS ====================
    'Butter': 'dairy',
    'Egg': 'dairy',
    'Milk': 'dairy',
    'Cheese': 'dairy',
    'Cream': 'dairy',
    'Mayonnaise': 'dairy',
    
    // ==================== PANTRY STAPLES ====================
    'Soy sauce': 'dry',
    'Vinegar': 'dry',
    'Salt': 'dry',
    'Sugar': 'dry',
    'Black pepper': 'dry',
    'Cooking oil': 'dry',
    'Sesame oil': 'dry',
    'Flour': 'dry',
    'Cornstarch': 'dry',
    'Breadcrumbs': 'dry',
    'Gochujang': 'dry',
    'Oyster sauce': 'dry',
    'Shrimp paste': 'dry',
    'Tamarind mix': 'dry',
    'Peppercorn': 'dry',
    'Chili flakes': 'dry',
    'Honey': 'dry',
    'Bay leaves': 'dry',
    'Herbs': 'dry',
    'Vegetables': 'dry',
    'Sweet tomato sauce': 'dry',
    'Gravy': 'dry',
    'Batter': 'dry',
    'Cheese sauce': 'dry',
    'Ground meat': 'dry',
    'Water': 'dry',
    'Ice': 'dry',
    
    // ==================== NOODLES & PASTA ====================
    'Pancit canton': 'dry',
    'Rice noodles': 'dry',
    'Spaghetti pasta': 'dry',
    'Pasta': 'dry',
    'Pancit bihon': 'dry',
    
    // ==================== RICE & GRAINS ====================
    'Rice': 'dry',
    
    // ==================== BEVERAGES ====================
    'Lemon juice': 'beverage',
    'Blue syrup': 'beverage',
    'Tea': 'beverage',
    'Black tea': 'beverage',
    'Espresso': 'beverage',
    'Hot water': 'beverage',
    'Steamed milk': 'beverage',
    'Carbonated soft drink': 'beverage',
    'Chicken broth': 'beverage',
    'Milk tea base': 'beverage',
    
    // ==================== COFFEE & TEA INGREDIENTS ====================
    'Coffee beans': 'dry',
    'Matcha powder': 'dry',
    'Caramel syrup': 'dry',
    'Vanilla syrup': 'dry',
    'Strawberry syrup': 'dry',
    'Mango flavor': 'dry',
    'Cream cheese flavor': 'dry',
    'Tapioca pearls': 'dry',
    'Cookie crumbs': 'dry',
    
    // ==================== SNACKS & SIDES ====================
    'Nacho chips': 'dry',
    'Lumpia wrapper': 'dry',
    'French fries': 'dry',
    
    // ==================== PACKAGING ====================
    'Paper cups': 'packaging',
    'Straws': 'packaging',
    'Napkins': 'packaging',
    'Food containers': 'packaging',
    'Plastic utensils': 'packaging'
};

// ==================== COMPLETE RECIPE MAPPING ====================
// Maps each RAW INGREDIENT to all MENU ITEMS that use it
// When ingredient stock = 0, ALL listed menu items become UNAVAILABLE

const recipeMapping = {
    // ================ MEAT & POULTRY ================
    'Pork': [
        'Korean Spicy Bulgogi (Pork)',
        'Korean Salt and Pepper (Pork)',
        'Crispy Pork Lechon Kawali',
        'Pork Shanghai',
        'Sinigang (Pork)',
        'Sizzling Pork Sisig',
        'Sizzling Liempo',
        'Sizzling Porkchop'
    ],
    'Pork belly': [
        'Crispy Pork Lechon Kawali',
        'Sizzling Liempo'
    ],
    'Chicken': [
        'Buttered Honey Chicken',
        'Buttered Spicy Chicken',
        'Chicken Adobo',
        'Fried Chicken',
        'Sizzling Fried Chicken',
        'Clubhouse Sandwich'
    ],
    'Fried chicken': [
        'Fried Chicken',
        'Budget Fried Chicken',
        'Fish and Fries'
    ],
    'Cream dory': [
        'Cream Dory Fish Fillet',
        'Fish and Fries'
    ],
    'Shrimp': [
        'Sinigang (Shrimp)',
        'Buttered Shrimp',
        'Special Bulalo'
    ],
    'Bagnet': [
        'Paknet (Pakbet w/ Bagnet)'
    ],
    'Tinapa': [
        'Tinapa Rice'
    ],
    'Tuyo': [
        'Tuyo Pesto'
    ],
    
    // ================ FRESH PRODUCE ================
    'Garlic': [
        'Korean Spicy Bulgogi (Pork)',
        'Korean Salt and Pepper (Pork)',
        'Crispy Pork Lechon Kawali',
        'Sizzling Pork Sisig',
        'Sizzling Liempo',
        'Sizzling Porkchop',
        'Sizzling Fried Chicken',
        'Pork Shanghai',
        'Chicken Adobo',
        'Sinigang (Pork)',
        'Sinigang (Shrimp)',
        'Paknet (Pakbet w/ Bagnet)',
        'Special Bulalo',
        'Pancit Bihon',
        'Pancit Canton + Bihon (Mixed)',
        'Spaghetti (Filipino Style)',
        'Fried Rice'
    ],
    'Onion': [
        'Korean Spicy Bulgogi (Pork)',
        'Korean Salt and Pepper (Pork)',
        'Crispy Pork Lechon Kawali',
        'Sizzling Pork Sisig',
        'Chicken Adobo',
        'Sinigang (Pork)',
        'Sinigang (Shrimp)',
        'Paknet (Pakbet w/ Bagnet)',
        'Special Bulalo',
        'Pancit Bihon',
        'Pancit Canton + Bihon (Mixed)',
        'Spaghetti (Filipino Style)',
        'Fried Rice',
        'Cheesy Nachos',
        'Nachos Supreme'
    ],
    'Chili': [
        'Korean Spicy Bulgogi (Pork)',
        'Korean Salt and Pepper (Pork)',
        'Sizzling Pork Sisig',
        'Sinigang (Pork)',
        'Sinigang (Shrimp)'
    ],
    'Calamansi': [
        'Sizzling Pork Sisig',
        'Sinigang (Pork)',
        'Sinigang (Shrimp)',
        'Buttered Shrimp',
        'Cucumber Lemonade',
        'Blue Lemonade'
    ],
    'Tomato': [
        'Chicken Adobo',
        'Sinigang (Pork)',
        'Sinigang (Shrimp)',
        'Paknet (Pakbet w/ Bagnet)',
        'Spaghetti (Filipino Style)'
    ],
    'Cucumber': [
        'Cucumber Lemonade',
        'Paknet (Pakbet w/ Bagnet)'
    ],
    'Corn': [
        'Special Bulalo',
        'Paknet (Pakbet w/ Bagnet)'
    ],
    'Potato': [
        'Special Bulalo',
        'Paknet (Pakbet w/ Bagnet)'
    ],
    'Carrots': [
        'Special Bulalo',
        'Paknet (Pakbet w/ Bagnet)',
        'Pancit Bihon',
        'Pancit Canton + Bihon (Mixed)'
    ],
    
    // ================ DAIRY & EGGS ================
    'Egg': [
        'Sizzling Pork Sisig',
        'Fried Rice'
    ],
    'Butter': [
        'Buttered Honey Chicken',
        'Buttered Spicy Chicken',
        'Buttered Shrimp'
    ],
    'Mayonnaise': [
        'Sizzling Pork Sisig',
        'Clubhouse Sandwich'
    ],
    'Cream': [
        'Caramel Macchiato',
        'Cookies & Cream',
        'Strawberry & Cream',
        'Mango Cheesecake'
    ],
    'Cream cheese flavor': [
        'Mango Cheesecake'
    ],
    'Milk': [
        'Cafe Latte',
        'Caramel Macchiato',
        'Milk Tea',
        'Cookies & Cream',
        'Strawberry & Cream',
        'Mango Cheesecake',
        'Steamed milk'
    ],
    'Cheese': [
        'Cheesy Nachos',
        'Nachos Supreme',
        'Cheesy Dynamite Lumpia'
    ],
    
    // ================ PANTRY STAPLES ================
    'Gochujang': [
        'Korean Spicy Bulgogi (Pork)',
        'Korean Salt and Pepper (Pork)'
    ],
    'Sesame oil': [
        'Korean Spicy Bulgogi (Pork)',
        'Korean Salt and Pepper (Pork)',
        'Fried Rice'
    ],
    'Soy sauce': [
        'Korean Spicy Bulgogi (Pork)',
        'Korean Salt and Pepper (Pork)',
        'Chicken Adobo',
        'Sizzling Pork Sisig',
        'Pancit Bihon',
        'Pancit Canton + Bihon (Mixed)',
        'Spaghetti (Filipino Style)',
        'Fried Rice'
    ],
    'Oyster sauce': [
        'Sizzling Pork Sisig',
        'Pancit Bihon',
        'Pancit Canton + Bihon (Mixed)'
    ],
    'Shrimp paste': [
        'Sinigang (Pork)',
        'Sinigang (Shrimp)',
        'Tuyo Pesto'
    ],
    'Tamarind mix': [
        'Sinigang (Pork)',
        'Sinigang (Shrimp)'
    ],
    'Cooking oil': [
        'Korean Spicy Bulgogi (Pork)',
        'Korean Salt and Pepper (Pork)',
        'Crispy Pork Lechon Kawali',
        'Pork Shanghai',
        'Sizzling Pork Sisig',
        'Sizzling Liempo',
        'Sizzling Porkchop',
        'Sizzling Fried Chicken',
        'Fried Chicken',
        'Budget Fried Chicken',
        'Cream Dory Fish Fillet',
        'Fish and Fries',
        'French Fries',
        'Cheesy Dynamite Lumpia',
        'Lumpiang Shanghai',
        'Fried Rice',
        'Cheesy Nachos',
        'Nachos Supreme'
    ],
    'Salt': [
        'Korean Spicy Bulgogi (Pork)',
        'Korean Salt and Pepper (Pork)',
        'Crispy Pork Lechon Kawali',
        'Sizzling Pork Sisig',
        'Sizzling Liempo',
        'Sizzling Porkchop',
        'Sizzling Fried Chicken',
        'Fried Chicken',
        'Budget Fried Chicken',
        'Cream Dory Fish Fillet',
        'Fish and Fries',
        'French Fries',
        'Chicken Adobo',
        'Sinigang (Pork)',
        'Sinigang (Shrimp)',
        'Paknet (Pakbet w/ Bagnet)',
        'Buttered Shrimp',
        'Special Bulalo',
        'Fried Rice',
        'Plain Rice'
    ],
    'Black pepper': [
        'Korean Spicy Bulgogi (Pork)',
        'Korean Salt and Pepper (Pork)',
        'Sizzling Pork Sisig',
        'Sinigang (Pork)',
        'Sinigang (Shrimp)',
        'Paknet (Pakbet w/ Bagnet)',
        'Buttered Shrimp'
    ],
    'Peppercorn': [
        'Korean Salt and Pepper (Pork)'
    ],
    'Cornstarch': [
        'Crispy Pork Lechon Kawali',
        'Pork Shanghai',
        'Lumpiang Shanghai',
        'Cheesy Dynamite Lumpia'
    ],
    'Bay leaves': [
        'Chicken Adobo',
        'Sinigang (Pork)',
        'Sinigang (Shrimp)',
        'Special Bulalo'
    ],
    'Honey': [
        'Buttered Honey Chicken',
        'Cucumber Lemonade',
        'Blue Lemonade',
        'Red Tea'
    ],
    'Sugar': [
        'Cucumber Lemonade',
        'Blue Lemonade',
        'Red Tea',
        'Cafe Latte',
        'Cafe Americano',
        'Caramel Macchiato',
        'Milk Tea',
        'Matcha Green Tea',
        'Cookies & Cream',
        'Strawberry & Cream',
        'Mango Cheesecake',
        'Fried Rice'
    ],
    'Breadcrumbs': [
        'Pork Shanghai',
        'Lumpiang Shanghai',
        'Fried Chicken',
        'Budget Fried Chicken',
        'Cream Dory Fish Fillet'
    ],
    'Flour': [
        'Pork Shanghai',
        'Lumpiang Shanghai',
        'Fried Chicken',
        'Budget Fried Chicken',
        'Cream Dory Fish Fillet',
        'French Fries',
        'Fish and Fries'
    ],
    'Gravy': [
        'Clubhouse Sandwich'
    ],
    'Cheese sauce': [
        'Cheesy Nachos',
        'Nachos Supreme',
        'Cheesy Dynamite Lumpia'
    ],
    'Sweet tomato sauce': [
        'Spaghetti (Filipino Style)'
    ],
    'Vegetables': [
        'Special Bulalo',
        'Paknet (Pakbet w/ Bagnet)'
    ],
    'Water': [
        'Special Bulalo',
        'Sinigang (Pork)',
        'Sinigang (Shrimp)',
        'Fried Rice'
    ],
    
    // ================ NOODLES & PASTA ================
    'Pancit canton': [
        'Pancit Canton + Bihon (Mixed)'
    ],
    'Rice noodles': [
        'Pancit Bihon',
        'Pancit Canton + Bihon (Mixed)'
    ],
    'Spaghetti pasta': [
        'Spaghetti (Filipino Style)'
    ],
    
    // ================ RICE ================
    'Rice': [
        'Korean Spicy Bulgogi (Pork)',
        'Korean Salt and Pepper (Pork)',
        'Crispy Pork Lechon Kawali',
        'Cream Dory Fish Fillet',
        'Buttered Honey Chicken',
        'Buttered Spicy Chicken',
        'Chicken Adobo',
        'Pork Shanghai',
        'Sizzling Pork Sisig',
        'Sizzling Liempo',
        'Sizzling Porkchop',
        'Sizzling Fried Chicken',
        'Fried Chicken',
        'Budget Fried Chicken',
        'Tinapa Rice',
        'Tuyo Pesto',
        'Fried Rice',
        'Plain Rice',
        'Sinigang (Pork)',
        'Sinigang (Shrimp)',
        'Paknet (Pakbet w/ Bagnet)',
        'Buttered Shrimp',
        'Special Bulalo'
    ],
    
    // ================ BEVERAGES ================
    'Lemon juice': [
        'Cucumber Lemonade',
        'Blue Lemonade'
    ],
    'Blue syrup': [
        'Blue Lemonade'
    ],
    'Tea': [
        'Red Tea',
        'Milk Tea',
        'Matcha Green Tea'
    ],
    'Black tea': [
        'Red Tea'
    ],
    'Espresso': [
        'Cafe Americano',
        'Cafe Latte',
        'Caramel Macchiato'
    ],
    'Hot water': [
        'Cafe Americano',
        'Red Tea'
    ],
    'Steamed milk': [
        'Cafe Latte',
        'Caramel Macchiato'
    ],
    'Carbonated soft drink': [
        'Soda'
    ],
    'Chicken broth': [
        'Special Bulalo'
    ],
    
    // ================ COFFEE & TEA INGREDIENTS ================
    'Coffee beans': [
        'Cafe Americano',
        'Cafe Latte',
        'Caramel Macchiato'
    ],
    'Matcha powder': [
        'Matcha Green Tea'
    ],
    'Caramel syrup': [
        'Caramel Macchiato'
    ],
    'Vanilla syrup': [
        'Cafe Latte'
    ],
    'Strawberry syrup': [
        'Strawberry & Cream'
    ],
    'Mango flavor': [
        'Mango Cheesecake'
    ],
    'Tapioca pearls': [
        'Milk Tea',
        'Matcha Green Tea',
        'Cookies & Cream',
        'Strawberry & Cream',
        'Mango Cheesecake'
    ],
    'Cookie crumbs': [
        'Cookies & Cream'
    ],
    
    // ================ SNACKS & SIDES ================
    'Nacho chips': [
        'Cheesy Nachos',
        'Nachos Supreme'
    ],
    'Lumpia wrapper': [
        'Lumpiang Shanghai',
        'Cheesy Dynamite Lumpia'
    ],
    'French fries': [
        'French Fries',
        'Fish and Fries'
    ],
    'Bread': [
        'Clubhouse Sandwich'
    ],
    
    // ================ PACKAGING (prevent menu items if out of stock) ================
    'Paper cups': [
        'Cucumber Lemonade',
        'Blue Lemonade',
        'Red Tea',
        'Cafe Americano',
        'Cafe Latte',
        'Caramel Macchiato',
        'Milk Tea',
        'Matcha Green Tea',
        'Cookies & Cream',
        'Strawberry & Cream',
        'Mango Cheesecake',
        'Soda'
    ],
    'Straws': [
        'Cucumber Lemonade',
        'Blue Lemonade',
        'Red Tea',
        'Milk Tea',
        'Matcha Green Tea',
        'Cookies & Cream',
        'Strawberry & Cream',
        'Mango Cheesecake',
        'Soda'
    ],
    'Napkins': [
        'Korean Spicy Bulgogi (Pork)',
        'Korean Salt and Pepper (Pork)',
        'Crispy Pork Lechon Kawali',
        'Cream Dory Fish Fillet',
        'Buttered Honey Chicken',
        'Buttered Spicy Chicken',
        'Chicken Adobo',
        'Pork Shanghai',
        'Sizzling Pork Sisig',
        'Sizzling Liempo',
        'Sizzling Porkchop',
        'Sizzling Fried Chicken',
        'Fried Chicken',
        'Budget Fried Chicken',
        'Cheesy Nachos',
        'Nachos Supreme',
        'French Fries',
        'Clubhouse Sandwich',
        'Fish and Fries',
        'Cheesy Dynamite Lumpia',
        'Lumpiang Shanghai',
        'Tinapa Rice',
        'Tuyo Pesto',
        'Sinigang (Pork)',
        'Sinigang (Shrimp)',
        'Paknet (Pakbet w/ Bagnet)',
        'Buttered Shrimp',
        'Special Bulalo'
    ],
    'Food containers': [
        'Korean Spicy Bulgogi (Pork)',
        'Korean Salt and Pepper (Pork)',
        'Crispy Pork Lechon Kawali',
        'Cream Dory Fish Fillet',
        'Buttered Honey Chicken',
        'Buttered Spicy Chicken',
        'Chicken Adobo',
        'Pork Shanghai',
        'Sizzling Pork Sisig',
        'Sizzling Liempo',
        'Sizzling Porkchop',
        'Sizzling Fried Chicken',
        'Fried Chicken',
        'Budget Fried Chicken',
        'Pancit Bihon',
        'Pancit Canton + Bihon (Mixed)',
        'Spaghetti (Filipino Style)',
        'Cheesy Nachos',
        'Nachos Supreme',
        'French Fries',
        'Clubhouse Sandwich',
        'Fish and Fries',
        'Cheesy Dynamite Lumpia',
        'Lumpiang Shanghai',
        'Fried Rice',
        'Plain Rice',
        'Tinapa Rice',
        'Tuyo Pesto',
        'Sinigang (Pork)',
        'Sinigang (Shrimp)',
        'Paknet (Pakbet w/ Bagnet)',
        'Buttered Shrimp',
        'Special Bulalo'
    ]
};

// ==================== IN STOCK FUNCTIONS ====================

function getInStockCount() {
    return allInventoryItems.filter(item => {
        const currentStock = parseFloat(item.currentStock) || 0;
        const minStock = parseFloat(item.minStock) || 10;
        return currentStock > minStock;
    }).length;
}

function getInStockItems() {
    return allInventoryItems.filter(item => {
        const currentStock = parseFloat(item.currentStock) || 0;
        const minStock = parseFloat(item.minStock) || 10;
        return currentStock > minStock;
    });
}

function updateInStockIndicator(inStockCount, totalCount) {
    const inStockEl = document.getElementById('inStock');
    const statCard = inStockEl ? inStockEl.closest('.stat-card') : null;
    
    if (!statCard) return;
    
    const percentage = totalCount > 0 ? Math.round((inStockCount / totalCount) * 100) : 0;
    
    const statChangeEl = statCard.querySelector('.stat-change');
    if (statChangeEl) {
        statChangeEl.textContent = `${percentage}% stocked`;
        statChangeEl.className = `stat-change ${
            percentage >= 70 ? 'positive' : 
            percentage >= 50 ? 'warning' : 
            'negative'
        }`;
    }
    
    statCard.classList.remove('in-stock-stat', 'warning', 'critical');
    if (percentage >= 70) {
        statCard.classList.add('in-stock-stat');
    } else if (percentage >= 50) {
        statCard.classList.add('warning');
    } else {
        statCard.classList.add('critical');
    }
}

// ==================== DASHBOARD STATS FUNCTION ====================

function updateDashboardStats() {
    console.log('📊 Updating dashboard stats...');
    
    const totalItemsEl = document.getElementById('allInventoryItems');
    const lowStockEl = document.getElementById('lowStock');
    const outOfStockEl = document.getElementById('outOfStock');
    const inStockEl = document.getElementById('inStock');
    
    if (!totalItemsEl || !lowStockEl || !outOfStockEl || !inStockEl) {
        console.warn('⚠️ Some dashboard stat elements not found');
        return;
    }
    
    const totalItems = allInventoryItems.length;
    const lowStockItems = allInventoryItems.filter(item => isLowStock(item)).length;
    const outOfStockItems = allInventoryItems.filter(item => isOutOfStock(item)).length;
    const inStockItems = getInStockCount();
    
    totalItemsEl.textContent = totalItems;
    lowStockEl.textContent = lowStockItems;
    outOfStockEl.textContent = outOfStockItems;
    inStockEl.textContent = inStockItems;
    
    updateInStockIndicator(inStockItems, totalItems);
    updateCategoryCounts();
    
    console.log('✅ Dashboard stats updated:', { totalItems, inStockItems, lowStockItems, outOfStockItems });
}

// ==================== CATEGORY FILTERING FUNCTION ====================

function filterIngredientsByCategory(selectedCategory) {
    const ingredientSelect = document.getElementById('itemName');
    if (!ingredientSelect) return;
    
    ingredientSelect.value = '';
    
    // Keep only the first option (Select Ingredient)
    while (ingredientSelect.options.length > 1) {
        ingredientSelect.remove(1);
    }
    
    if (selectedCategory) {
        Object.entries(validRawIngredients).forEach(([itemName, category]) => {
            if (category === selectedCategory) {
                const option = document.createElement('option');
                option.value = itemName;
                option.textContent = itemName;
                option.dataset.category = category;
                ingredientSelect.appendChild(option);
            }
        });
    }
}

// ==================== CATEGORY OPTIONS FUNCTIONS ====================

function updateCategoryOptions() {
    if (!elements.itemCategory) return;
    
    elements.itemCategory.innerHTML = '<option value="">Select Category</option>';
    
    const categories = {
        'meat': 'Meat & Poultry',
        'seafood': 'Seafood',
        'produce': 'Vegetables & Fruits',
        'dairy': 'Dairy & Eggs',
        'dry': 'Dry Goods',
        'beverage': 'Beverages',
        'packaging': 'Packaging'
    };
    
    Object.entries(categories).forEach(([value, label]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        elements.itemCategory.appendChild(option);
    });
}

function updateItemNameOptions() {
    if (!elements.itemName) return;
    
    const currentValue = elements.itemName.value;
    
    elements.itemName.innerHTML = '<option value="">Select Ingredient</option>';
    
    Object.keys(validRawIngredients).forEach(itemName => {
        const option = document.createElement('option');
        option.value = itemName;
        option.textContent = itemName;
        option.dataset.category = validRawIngredients[itemName];
        elements.itemName.appendChild(option);
    });
    
    elements.itemName.value = currentValue;
}

function updateUnitOptions(category) {
    if (!elements.itemUnit) return;
    
    elements.itemUnit.innerHTML = '<option value="">Select Unit</option>';
    
    const units = categoryUnitsMapping[category] || ['pieces', 'kg', 'g', 'liters', 'ml'];
    
    units.forEach(unit => {
        const option = document.createElement('option');
        option.value = unit;
        option.textContent = unit.charAt(0).toUpperCase() + unit.slice(1);
        elements.itemUnit.appendChild(option);
    });
}

// ==================== AUTO-FILL FROM CATEGORY ====================

function autoFillItemFromCategory(category) {
    if (!elements.itemName || !elements.itemCategory) return;
    
    console.log(`🔄 Auto-filling from category: ${category}`);
    
    elements.itemCategory.value = category;
    updateUnitOptions(category);
    
    const categoryItems = Object.entries(validRawIngredients)
        .filter(([itemName, itemCategory]) => itemCategory === category)
        .map(([itemName]) => itemName);
    
    if (categoryItems.length > 0) {
        // Clear and add category-specific items
        elements.itemName.innerHTML = '<option value="">Select Ingredient</option>';
        
        categoryItems.forEach(itemName => {
            const option = document.createElement('option');
            option.value = itemName;
            option.textContent = itemName;
            option.dataset.category = category;
            elements.itemName.appendChild(option);
        });
        
        // Auto-select the first item
        const firstItem = categoryItems[0];
        elements.itemName.value = firstItem;
        
        // Auto-fill unit
        const unit = getUnitFromItem(firstItem, category);
        if (elements.itemUnit) {
            elements.itemUnit.value = unit;
        }
        
        // Set item type to raw
        if (elements.itemType) {
            elements.itemType.value = 'raw';
        }
        
        // Set default stock values
        if (elements.currentStock) elements.currentStock.value = 0;
        if (elements.minStock) elements.minStock.value = 10;
        if (elements.maxStock) elements.maxStock.value = 50;
        
        // Show recipe info
        showRecipeInfo(firstItem);
        
        console.log(`✅ Auto-filled: ${firstItem}`);
        showToast(`Auto-filled with "${firstItem}"`, 'info');
    }
}

// ==================== DUPLICATE DETECTION ====================

function checkAndShowDuplicateNotification() {
    const itemName = elements.itemName?.value;
    const itemId = elements.itemId?.value;
    const isEdit = itemId && itemId.trim() !== '';
    
    if (!itemName || !elements.duplicateNotification) {
        hideDuplicateNotification();
        return;
    }
    
    // Check if this ingredient already exists
    const isDuplicate = allInventoryItems.some(item => {
        const isSameName = item.itemName.toLowerCase() === itemName.toLowerCase();
        
        // When adding new, any match is a duplicate
        if (!isEdit) {
            return isSameName;
        }
        
        // When editing, exclude the current item from comparison
        return isSameName && (item._id !== itemId && item.id !== itemId);
    });
    
    if (isDuplicate) {
        showDuplicateNotification(itemName);
    } else {
        hideDuplicateNotification();
    }
}

function showDuplicateNotification(ingredientName) {
    if (!elements.duplicateNotification || !elements.duplicateIngredientName) return;
    
    elements.duplicateIngredientName.textContent = ingredientName;
    elements.duplicateNotification.classList.add('show');
    elements.duplicateNotification.style.display = 'flex';
}

function hideDuplicateNotification() {
    if (!elements.duplicateNotification) return;
    
    elements.duplicateNotification.classList.remove('show');
    elements.duplicateNotification.style.display = 'none';
}

// ==================== MODAL FUNCTIONS ====================

function openAddModal() {
    if (elements.modalTitle) elements.modalTitle.textContent = 'Add New Raw Ingredient';
    if (elements.itemId) elements.itemId.value = '';
    if (elements.itemForm) elements.itemForm.reset();
    
    // Hide duplicate notification when opening add modal
    hideDuplicateNotification();
    
    updateCategoryOptions();
    updateItemNameOptions();
    updateUnitOptions('dry');
    
    // Reset ingredient filter
    filterIngredientsByCategory('');
    
    if (elements.itemModal) {
        elements.itemModal.style.display = 'flex';
        isModalOpen = true;
    }
}

// FIXED EDIT MODAL FUNCTION
function openEditModal(itemId) {
    const item = allInventoryItems.find(item => item._id === itemId || item.id === itemId);
    if (!item) {
        showToast('Item not found', 'error');
        return;
    }
    
    console.log('Editing item:', item);
    
    if (elements.modalTitle) elements.modalTitle.textContent = 'Edit Raw Ingredient';
    if (elements.itemId) elements.itemId.value = item._id || item.id || '';
    
    // Get category from item or derive from name
    const category = item.category || getCategoryFromName(item.itemName);
    
    // Update form fields
    if (elements.itemName) {
        // First filter ingredients by category
        filterIngredientsByCategory(category);
        // Then set the value
        setTimeout(() => {
            elements.itemName.value = item.itemName;
        }, 10);
    }
    
    if (elements.itemType) elements.itemType.value = item.itemType || 'raw';
    if (elements.itemCategory) {
        elements.itemCategory.value = category;
        // Update unit options based on category
        updateUnitOptions(category);
    }
    
    if (elements.itemUnit) {
        setTimeout(() => {
            elements.itemUnit.value = item.unit || getUnitFromItem(item.itemName, category);
        }, 10);
    }
    
    if (elements.currentStock) elements.currentStock.value = item.currentStock || 0;
    if (elements.minStock) elements.minStock.value = item.minStock || 10;
    if (elements.maxStock) elements.maxStock.value = item.maxStock || 50;
    if (elements.description) elements.description.value = item.description || '';
    
    // Show recipe info
    showRecipeInfo(item.itemName);
    
    // Check for duplicate notification (in case name was changed to match another)
    checkAndShowDuplicateNotification();
    
    // Open modal
    elements.itemModal.style.display = 'flex';
    isModalOpen = true;
}

function closeModal() {
    if (elements.itemModal) {
        elements.itemModal.style.display = 'none';
        isModalOpen = false;
    }
    if (elements.itemForm) elements.itemForm.reset();
    hideDuplicateNotification();
}

// ==================== GRID RENDERING FUNCTIONS ====================

function renderDashboardGrid() {
    if (!elements.dashboardGrid) return;
    
    // Sort items by stock status (out of stock first, then low stock)
    const sortedItems = [...allInventoryItems].sort((a, b) => {
        const aStock = parseFloat(a.currentStock) || 0;
        const bStock = parseFloat(b.currentStock) || 0;
        const aMin = parseFloat(a.minStock) || 10;
        const bMin = parseFloat(b.minStock) || 10;
        
        if (aStock === 0 && bStock > 0) return -1;
        if (aStock > 0 && bStock === 0) return 1;
        if (aStock <= aMin && bStock > bMin) return -1;
        if (aStock > aMin && bStock <= bMin) return 1;
        return 0;
    });
    
    // Take only top 12 items for dashboard
    const displayItems = sortedItems.slice(0, 12);
    
    if (displayItems.length === 0) {
        elements.dashboardGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📊</div>
                <h3>No inventory data</h3>
                <p>Click "Add New Ingredient" to add items</p>
                <button onclick="openAddModal()" class="btn btn-primary mt-3">➕ Add Items</button>
            </div>
        `;
        return;
    }
    
    elements.dashboardGrid.innerHTML = displayItems.map(item => {
        const currentStock = parseFloat(item.currentStock) || 0;
        const maxStock = parseFloat(item.maxStock) || 50;
        const minStock = parseFloat(item.minStock) || 10;
        const unit = item.unit || 'pieces';
        const isOutOfStock = currentStock === 0;
        const isLowStock = currentStock > 0 && currentStock <= minStock;
        const percentage = maxStock > 0 ? Math.min(100, (currentStock / maxStock) * 100) : 0;
        
        // Get recipe usage info - show 0 if out of stock
        const recipeInfo = isOutOfStock ? { usedInCount: 0, notUsedInCount: 0 } : getRecipeUsageInfo(item.itemName);
        
        return `
            <div class="dashboard-card ${isOutOfStock ? 'out-of-stock' : isLowStock ? 'low-stock' : 'in-stock'}">
                <div class="card-header">
                    <h4>${item.itemName}</h4>
                    <span class="card-badge ${isOutOfStock ? 'badge-danger' : isLowStock ? 'badge-warning' : 'badge-success'}">
                        ${isOutOfStock ? 'Out' : isLowStock ? 'Low' : 'Good'}
                    </span>
                </div>
                <div class="card-body">
                    <div class="card-details">
                        <div class="detail">
                            <span class="label">Min:</span>
                            <span class="value">${minStock}${unit}</span>
                        </div>
                        <div class="detail">
                            <span class="label">Status:</span>
                            <span class="value ${isOutOfStock ? 'text-danger' : isLowStock ? 'text-warning' : 'text-success'}">
                                ${isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                            </span>
                        </div>
                        <div class="detail">
                            <span class="label">Can Be Made:</span>
                            <span class="value ${isOutOfStock ? 'text-danger' : '#333'}">${recipeInfo.usedInCount} dish${recipeInfo.usedInCount !== 1 ? 'es' : ''}</span>
                        </div>
                        ${isOutOfStock ? `
                        <div class="detail">
                            <span class="label">Cannot Be Made:</span>
                            <span class="value">${recipeInfo.notUsedInCount} dish${recipeInfo.notUsedInCount !== 1 ? 'es' : ''}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                <div class="card-footer">
                    <button class="btn btn-sm btn-primary" onclick="openEditModal('${item._id || item.id}')">
                        ✏️ Edit Item
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function renderInventoryGrid() {
    if (!elements.inventoryGrid) return;
    
    if (allInventoryItems.length === 0) {
        elements.inventoryGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📦</div>
                <h3>No inventory items</h3>
                <p>Click "Add New Ingredient" to get started</p>
                <button onclick="openAddModal()" class="btn btn-primary mt-3">➕ Add Items</button>
            </div>
        `;
        return;
    }
    
    elements.inventoryGrid.innerHTML = allInventoryItems.map(item => {
        const currentStock = parseFloat(item.currentStock) || 0;
        const minStock = parseFloat(item.minStock) || 10;
        const maxStock = parseFloat(item.maxStock) || 50;
        const unit = item.unit || 'pieces';
        const isOutOfStock = currentStock === 0;
        const isLowStock = currentStock > 0 && currentStock <= minStock;
        const categoryLabel = getCategoryLabel(item.category || getCategoryFromName(item.itemName));
        
        // Get recipe usage info - show 0 if out of stock
        const recipeInfo = isOutOfStock ? { usedInCount: 0, notUsedInCount: 0 } : getRecipeUsageInfo(item.itemName);
        
        return `
            <div class="inventory-card ${isOutOfStock ? 'out-of-stock' : isLowStock ? 'low-stock' : 'in-stock'}">
                <div class="card-header">
                    <div>
                        <h4>${item.itemName}</h4>
                        <span class="category-badge">${categoryLabel}</span>
                    </div>
                    <div class="card-actions">
                        <button class="btn-icon" onclick="openEditModal('${item._id || item.id}')" title="Edit">✏️</button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="stock-levels">
                        <div class="stock-item">
                            <span class="label">Current:</span>
                            <span class="value ${isOutOfStock ? 'text-danger' : isLowStock ? 'text-warning' : 'text-success'}" style="margin-top: 5px; display: block;">
                                ${currentStock} ${unit}
                            </span>
                        </div>
                        <div class="stock-item">
                            <span class="label">Min:</span>
                            <span class="value">${minStock} ${unit}</span>
                        </div>
                        <div class="stock-item">
                            <span class="label">Max:</span>
                            <span class="value">${maxStock} ${unit}</span>
                        </div>
                    </div>
                    <div class="status-badge ${isOutOfStock ? 'status-out' : isLowStock ? 'status-low' : 'status-good'}">
                        ${isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                    </div>
                    ${item.description ? `<div class="description">📝 ${item.description}</div>` : ''}
                    
                    <!-- Recipe Usage Display -->
                    <div class="recipe-usage-info" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e0e0e0;">
                        <div style="display: flex; gap: 15px; font-size: 13px;">
                            <div style="flex: 1;">
                                <span style="color: ${isOutOfStock ? '#dc3545' : '#666'}; font-weight: 500;">Can Be Made:</span>
                                <strong style="color: ${isOutOfStock ? '#dc3545' : '#333'};">${recipeInfo.usedInCount} dish${recipeInfo.usedInCount !== 1 ? 'es' : ''}</strong>
                            </div>
                            ${isOutOfStock ? `
                            <div style="flex: 1;">
                                <span style="color: #666; font-weight: 500;">Cannot Be Made:</span>
                                <strong style="color: #333;">${recipeInfo.notUsedInCount} dish${recipeInfo.notUsedInCount !== 1 ? 'es' : ''}</strong>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ==================== FILTERED RENDERING ====================

function renderFilteredInventoryGrid(filteredItems) {
    if (!elements.inventoryGrid) return;
    
    if (filteredItems.length === 0) {
        elements.inventoryGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <h3>No items found</h3>
                <p>Try searching with different keywords</p>
            </div>
        `;
        return;
    }
    
    elements.inventoryGrid.innerHTML = filteredItems.map(item => {
        const currentStock = parseFloat(item.currentStock) || 0;
        const minStock = parseFloat(item.minStock) || 10;
        const isOutOfStock = currentStock === 0;
        const isLowStock = currentStock > 0 && currentStock <= minStock;
        
        // Get recipe usage info - show 0 if out of stock
        const recipeInfo = isOutOfStock ? { usedInCount: 0, notUsedInCount: 0 } : getRecipeUsageInfo(item.itemName);
        
        return `
            <div class="inventory-card ${isOutOfStock ? 'out-of-stock' : isLowStock ? 'low-stock' : 'in-stock'}">
                <div class="card-header">
                    <h4>${item.itemName}</h4>
                    <div class="card-actions">
                        <button class="btn-icon" onclick="openEditModal('${item._id || item.id}')">✏️</button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="card-info">
                        <span class="label">Category:</span> ${getCategoryLabel(item.category || getCategoryFromName(item.itemName))}
                    </div>
                    <div class="card-info">
                        <span class="label">Stock:</span> ${currentStock} ${item.unit || 'pieces'}
                    </div>
                    <div class="card-info">
                        <span class="label">Status:</span> 
                        <span class="status ${isOutOfStock ? 'out-of-stock' : isLowStock ? 'low-stock' : 'in-stock'}">
                            ${isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                        </span>
                    </div>
                    <div class="card-info" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e0e0e0;">
                        <div style="display: flex; gap: 10px; font-size: 12px;">
                            <span style="color: ${isOutOfStock ? '#dc3545' : '#666'};">Can Be Made: <strong>${recipeInfo.usedInCount} dish${recipeInfo.usedInCount !== 1 ? 'es' : ''}</strong></span>
                            ${isOutOfStock ? `<span style="color: #666;">Cannot Be Made: <strong>${recipeInfo.notUsedInCount} dish${recipeInfo.notUsedInCount !== 1 ? 'es' : ''}</strong></span>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `; 
    }).join('');
}

function renderFilteredDashboardGrid(filteredItems) {
    if (!elements.dashboardGrid) return;
    
    if (filteredItems.length === 0) {
        elements.dashboardGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <h3>No matching items</h3>
                <p>Try a different search term</p>
            </div>
        `;
        return;
    }
    
    const displayItems = filteredItems.slice(0, 12);
    
    elements.dashboardGrid.innerHTML = displayItems.map(item => {
        const currentStock = parseFloat(item.currentStock) || 0;
        const maxStock = parseFloat(item.maxStock) || 50;
        const minStock = parseFloat(item.minStock) || 10;
        const unit = item.unit || 'pieces';
        const isOutOfStock = currentStock === 0;
        const isLowStock = currentStock > 0 && currentStock <= minStock;
        const percentage = maxStock > 0 ? Math.min(100, (currentStock / maxStock) * 100) : 0;
        
        // Get recipe usage info - show 0 if out of stock
        const recipeInfo = isOutOfStock ? { usedInCount: 0, notUsedInCount: 0 } : getRecipeUsageInfo(item.itemName);
        
        return `
            <div class="dashboard-card ${isOutOfStock ? 'out-of-stock' : isLowStock ? 'low-stock' : 'in-stock'}">
                <div class="card-header">
                    <h4>${item.itemName}</h4>
                    <span class="card-badge ${isOutOfStock ? 'badge-danger' : isLowStock ? 'badge-warning' : 'badge-success'}">
                        ${isOutOfStock ? 'Out' : isLowStock ? 'Low' : 'Good'}
                    </span>
                </div>
                <div class="card-body">
                    <div class="stock-info">
                        <div class="stock-bar">
                            <div class="stock-bar-fill" style="width: ${percentage}%; background-color: ${isOutOfStock ? '#dc3545' : isLowStock ? '#ffc107' : '#28a745'};"></div>
                        </div>
                        <div class="stock-numbers" style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 8px; font-weight: 600;">
                            <span style="min-width: 80px; text-align: center;">${currentStock} ${unit}</span>
                        </div>
                    </div>
                    <div class="card-details">
                        <div class="detail">
                            <span class="label">Can Be Made:</span>
                            <span class="value">${recipeInfo.usedInCount} dish${recipeInfo.usedInCount !== 1 ? 'es' : ''}</span>
                        </div>
                        ${isOutOfStock ? `<div class="detail">
                            <span class="label">Cannot Be Made:</span>
                            <span class="value">${recipeInfo.notUsedInCount} dish${recipeInfo.notUsedInCount !== 1 ? 'es' : ''}</span>
                        </div>` : ''}
                    </div>
                </div>
                <div class="card-footer">
                    <button class="btn btn-sm btn-primary" onclick="openEditModal('${item._id || item.id}')">
                        ✏️ Edit
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ==================== SEARCH FUNCTION ====================

function debounceSearch(searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
        if (currentSection === 'inventory') {
            renderInventoryGrid();
        } else if (currentSection === 'dashboard') {
            renderDashboardGrid();
        }
        return;
    }
    
    const filteredItems = allInventoryItems.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        return item.itemName.toLowerCase().includes(searchLower) ||
               (item.category && item.category.toLowerCase().includes(searchLower)) ||
               (item.description && item.description.toLowerCase().includes(searchLower));
    });
    
    if (currentSection === 'inventory') {
        renderFilteredInventoryGrid(filteredItems);
    } else if (currentSection === 'dashboard') {
        renderFilteredDashboardGrid(filteredItems);
    }
}

// ==================== HELPER FUNCTIONS ====================

function getCategoryFromName(itemName) {
    return validRawIngredients[itemName] || 'dry';
}

function getUnitFromItem(itemName, category) {
    const defaultUnits = {
        'meat': 'kg',
        'seafood': 'kg',
        'produce': 'kg',
        'dairy': 'liters',
        'dry': 'kg',
        'beverage': 'liters',
        'packaging': 'pieces'
    };
    return defaultUnits[category] || 'pieces';
}

function getItemTypeFromName(itemName) {
    return validRawIngredients[itemName] ? 'raw' : 'finished';
}

function getCategoryLabel(category) {
    const labels = {
        'meat': 'Meat & Poultry',
        'seafood': 'Seafood',
        'produce': 'Vegetables & Fruits',
        'dairy': 'Dairy & Eggs',
        'dry': 'Dry Goods',
        'beverage': 'Beverages',
        'packaging': 'Packaging',
        'all': 'All Raw Ingredients'
    };
    return labels[category] || category || 'Uncategorized';
}

function showRecipeInfo(itemName) {
    if (!elements.recipeInfo) return;
    
    const recipes = recipeMapping[itemName] || [];
    if (recipes.length > 0) {
        elements.recipeInfo.innerHTML = `
            <div class="recipe-info">
                <strong>🍳 Used in:</strong>
                <span>${recipes.join(', ')}</span>
            </div>
        `;
        elements.recipeInfo.style.display = 'block';
    } else {
        elements.recipeInfo.style.display = 'none';
    }
}

// ==================== RECIPE USAGE HELPER FUNCTION ====================
// Optimized: Compute how many dishes can be made based on recipeMapping and allInventoryItems.
// A dish can be made ONLY if all required ingredients have currentStock > 0.
function getRecipeUsageInfo(itemName) {
    // Check if THIS ingredient is in stock
    const thisIngredient = allInventoryItems.find(inv => inv.itemName === itemName);
    const thisStock = thisIngredient ? parseFloat(thisIngredient.currentStock || 0) : 0;
    
    // If THIS ingredient is out of stock, show 0 for both
    if (thisStock <= 0) {
        return {
            usedInCount: 0,
            notUsedInCount: 0,
            totalDishes: 0
        };
    }
    
    // Get all menu items that use this ingredient
    const usedInDishes = recipeMapping[itemName] || [];
    
    // OPTIMIZATION 1: Build a stock lookup map to avoid repeated .find() calls
    const stockMap = new Map();
    allInventoryItems.forEach(item => {
        stockMap.set(item.itemName, parseFloat(item.currentStock || 0));
    });
    
    // OPTIMIZATION 2: Build reverse mapping (dish → ingredients) once
    const dishToIngredients = new Map();
    for (const ingredient in recipeMapping) {
        recipeMapping[ingredient].forEach(dish => {
            if (!dishToIngredients.has(dish)) {
                dishToIngredients.set(dish, []);
            }
            dishToIngredients.get(dish).push(ingredient);
        });
    }
    
    // OPTIMIZATION 3: Count dishes that CAN be made (without nested loops)
    let canBeMadeCount = 0;
    
    usedInDishes.forEach(dish => {
        // Get required ingredients for this dish (from pre-built map)
        const requiredIngredients = dishToIngredients.get(dish) || [];
        
        // Check if ALL required ingredients are in stock (stock > 0)
        const canBeMade = requiredIngredients.every(ingredient => {
            const stock = stockMap.get(ingredient) || 0;
            return stock > 0;
        });
        
        if (canBeMade) {
            canBeMadeCount++;
        }
    });
    
    // Calculate how many dishes that use this ingredient CANNOT be made
    const cannotBeMadeCount = usedInDishes.length - canBeMadeCount;
    
    return {
        usedInCount: canBeMadeCount,           // Dishes that USE THIS INGREDIENT and CAN be made
        notUsedInCount: cannotBeMadeCount,     // Dishes that USE THIS INGREDIENT but CANNOT be made
        totalDishes: usedInDishes.length
    };
}

function isLowStock(item) {
    if (!item) return false;
    const currentStock = parseFloat(item.currentStock) || 0;
    const minStock = parseFloat(item.minStock) || 10;
    return currentStock > 0 && currentStock <= minStock;
}

function isOutOfStock(item) {
    if (!item) return false;
    const currentStock = parseFloat(item.currentStock) || 0;
    return currentStock === 0;
}

// ==================== SAVE ITEM FUNCTION (WITH MONGODB) ====================

async function handleSaveItem() {
    const itemId = elements.itemId ? elements.itemId.value : '';
    const isEdit = itemId && itemId.trim() !== '';
    
    const itemData = {
        itemName: elements.itemName ? elements.itemName.value : '',
        itemType: elements.itemType ? elements.itemType.value : 'raw',
        category: elements.itemCategory ? elements.itemCategory.value : '',
        unit: elements.itemUnit ? elements.itemUnit.value : '',
        currentStock: elements.currentStock ? parseFloat(elements.currentStock.value) || 0 : 0,
        minStock: elements.minStock ? parseFloat(elements.minStock.value) || 10 : 10,
        maxStock: elements.maxStock ? parseFloat(elements.maxStock.value) || 50 : 50,
        description: elements.description ? elements.description.value : '',
        isActive: true
    };
    
    // Validation
    if (!itemData.itemName) {
        showToast('Please select an ingredient name', 'error');
        return;
    }
    
    if (!itemData.category) {
        showToast('Please select a category', 'error');
        return;
    }
    
    if (!itemData.unit) {
        showToast('Please select a unit', 'error');
        return;
    }
    
    // ✅ CHECK FOR DUPLICATE INGREDIENTS (when adding new)
    if (!isEdit) {
        const isDuplicate = allInventoryItems.some(item => 
            item.itemName.toLowerCase().trim() === itemData.itemName.toLowerCase().trim()
        );
        
        if (isDuplicate) {
            showToast(`❌ ERROR: "${itemData.itemName}" already exists in inventory!`, 'error');
            console.warn(`❌ Duplicate detected: ${itemData.itemName}`);
            return;
        }
    } else {
        // When editing, check if another ingredient with same name exists (excluding current one)
        const isDuplicate = allInventoryItems.some(item => {
            const sameNameCheck = item.itemName.toLowerCase().trim() === itemData.itemName.toLowerCase().trim();
            const differentItemCheck = item._id !== itemId && item.id !== itemId;
            return sameNameCheck && differentItemCheck;
        });
        
        if (isDuplicate) {
            showToast(`❌ ERROR: Another ingredient already has this name`, 'error');
            console.warn(`❌ Duplicate detected during edit: ${itemData.itemName}`);
            return;
        }
    }
    
    try {
        showLoading(isEdit ? 'Updating item...' : 'Adding item...');
        
        let apiUrl = '/api/inventory';
        let method = 'POST';
        
        if (isEdit) {
            apiUrl = `/api/inventory/${itemId}`;
            method = 'PUT';
        }
        
        // Save to MongoDB via API
        const response = await fetch(apiUrl, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(itemData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            
            // Handle duplicate error specifically
            if (response.status === 409 || errorData.duplicate) {
                console.error(`❌ Duplicate conflict: ${errorData.message}`);
                showToast(`❌ ${errorData.message}`, 'error');
                hideLoading();
                return;
            }
            
            throw new Error(errorData.message || 'Failed to save item');
        }
        
        const result = await response.json();
        
        if (result.success) {
            showToast(isEdit ? '✅ Item updated successfully!' : '✅ Item added successfully!', 'success');
            
            // Refresh inventory from MongoDB
            await fetchInventoryItems();
            
            // ✅ FIX: Load persisted inventory stock values AFTER fetching from DB
            loadInventoryWithPersistedValues();
            
            // Update UI
            renderInventoryGrid();
            renderDashboardGrid();
            updateDashboardStats();
            updateCategoryCounts();
            
            // ✅ FIX: Save inventory stock values to prevent reset
            saveInventoryStockValues();
            
            // Refresh dashboard stats to sync with backend
            await refreshDashboardInventoryCount();
            
            // Close modal
            closeModal();
        } else {
            throw new Error(result.message || 'Failed to save item');
        }
        
    } catch (error) {
        console.error('Error saving item:', error);
        showToast(`❌ Failed to save item: ${error.message}`, 'error');
    } finally {
        hideLoading();
    }
}

function updateFromItemName() {
    const itemName = elements.itemName?.value;
    if (!itemName) return;
    
    const category = getCategoryFromName(itemName);
    const unit = getUnitFromItem(itemName, category);
    
    if (elements.itemType) elements.itemType.value = 'raw';
    if (elements.itemCategory) {
        elements.itemCategory.value = category;
        updateUnitOptions(category);
    }
    if (elements.itemUnit) {
        elements.itemUnit.value = unit;
    }
    
    showRecipeInfo(itemName);
    
    // Check for duplicate ingredients and show notification
    checkAndShowDuplicateNotification();
}

// ==================== FETCH INVENTORY ITEMS FROM MONGODB ====================

async function fetchInventoryItems() {
    try {
        console.log('📦 Fetching inventory items from MongoDB...');
        
        const response = await fetch('/api/inventory', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
            console.warn(`⚠️ API returned status ${response.status}`);
            return { success: false, data: [] };
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
            // Update the global array with MongoDB data
            allInventoryItems = result.data;
            console.log('✅ Inventory items loaded from MongoDB:', allInventoryItems.length);
            return { success: true, data: allInventoryItems };
        } else if (result.data && Array.isArray(result.data)) {
            // Handle cases where API just returns array
            allInventoryItems = result.data;
            console.log('✅ Inventory items loaded from MongoDB:', allInventoryItems.length);
            return { success: true, data: allInventoryItems };
        } else {
            console.warn('⚠️ Unexpected API response format:', result);
            return { success: false, data: [] };
        }
        
    } catch (error) {
        console.error('❌ Error fetching inventory from MongoDB:', error);
        showToast(`Failed to load inventory: ${error.message}`, 'error');
        return { success: false, data: [] };
    }
}

// ==================== ✅ LOAD PERSISTED INVENTORY STOCK ====================
function loadInventoryWithPersistedValues() {
    const persistedInventory = localStorage.getItem('inventory_stock_currentValues');
    if (persistedInventory) {
        try {
            const persistedValues = JSON.parse(persistedInventory);
            console.log('📦 Loading persisted inventory stock values...');
            
            // Update allInventoryItems with persisted values
            allInventoryItems.forEach(item => {
                const itemKey = item._id || item.id || item.itemName;
                if (persistedValues[itemKey] !== undefined) {
                    const oldStock = item.currentStock;
                    item.currentStock = persistedValues[itemKey];
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
    return false;
}

// ==================== 💾 SAVE PERSISTED INVENTORY STOCK ====================
function saveInventoryStockValues() {
    try {
        const stockValues = {};
        
        // Save all current inventory stock values
        allInventoryItems.forEach(item => {
            const itemKey = item._id || item.id || item.itemName;
            stockValues[itemKey] = item.currentStock;
        });
        
        localStorage.setItem('inventory_stock_currentValues', JSON.stringify(stockValues));
        console.log('💾 Saved inventory stock values (prevents reset)');
    } catch (error) {
        console.error('❌ Error saving inventory stock values:', error);
    }
}

// ==================== REFRESH DASHBOARD INVENTORY COUNT ====================

async function refreshDashboardInventoryCount() {
    try {
        // Only refresh if we're on the inventory page or if dashboard exists
        const totalInventoryElement = document.getElementById('totalInventory');
        if (!totalInventoryElement) {
            console.log('ℹ️ Dashboard not visible, skipping inventory count refresh');
            return;
        }
        
        console.log('🔄 Refreshing dashboard inventory count...');
        
        // Fetch fresh stats from backend
        const response = await fetch('/api/dashboard/stats', {
            headers: {
                'Accept': 'application/json'
            },
            credentials: 'include'
        });
        
        if (!response.ok) {
            console.warn('⚠️ Failed to fetch updated stats');
            return;
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
            const newCount = result.data.totalInventoryItems || 0;
            const currentCount = parseInt(totalInventoryElement.textContent) || 0;
            
            console.log(`📊 Dashboard inventory count updated: ${currentCount} → ${newCount}`);
            
            // Update the dashboard display with animation
            if (newCount !== currentCount) {
                animateCountUpdate(totalInventoryElement, currentCount, newCount);
            }
        }
    } catch (error) {
        console.error('❌ Error refreshing dashboard inventory count:', error);
        // Don't show error toast as this is a background refresh
    }
}

// Animate count update
function animateCountUpdate(element, oldValue, newValue) {
    element.classList.add('count-updating');
    
    const step = (newValue - oldValue) / 10;
    let current = oldValue;
    let steps = 0;
    
    const interval = setInterval(() => {
        steps++;
        current += step;
        
        if (steps >= 10) {
            current = newValue;
            clearInterval(interval);
            element.classList.remove('count-updating');
        }
        
        element.textContent = Math.round(current);
    }, 50);
}

// ==================== CATEGORY COUNT UPDATES ====================

function updateCategoryCounts() {
    console.log('📊 Updating category counts...');
    
    if (!elements.categoryItems || elements.categoryItems.length === 0) {
        console.warn('⚠️ Category items not found');
        return;
    }
    
    elements.categoryItems.forEach(categoryItem => {
        const category = categoryItem.getAttribute('data-category');
        
        let count = 0;
        if (category === 'all') {
            count = allInventoryItems.length;
        } else if (category === 'in-stock') {
            count = getInStockCount();
        } else if (category === 'low-stock') {
            count = allInventoryItems.filter(item => isLowStock(item)).length;
        } else if (category === 'out-of-stock') {
            count = allInventoryItems.filter(item => isOutOfStock(item)).length;
        } else {
            count = allInventoryItems.filter(item => {
                const itemCategory = item.category || getCategoryFromName(item.itemName);
                return itemCategory === category;
            }).length;
        }
        
        const countElement = categoryItem.querySelector('.category-count');
        if (countElement) {
            countElement.textContent = count;
        }
    });
}

// ==================== SECTION NAVIGATION ====================

function showSection(section) {
    currentSection = section;
    
    // Hide all sections
    document.querySelectorAll('.section-content').forEach(sec => {
        sec.classList.remove('active-section');
        sec.style.display = 'none';
    });
    
    // Show selected section
    const targetSection = document.getElementById(section);
    if (targetSection) {
        targetSection.classList.add('active-section');
        targetSection.style.display = 'block';
    }
    
    // Update active nav
    if (elements.navLinks && elements.navLinks.length > 0) {
        elements.navLinks.forEach(link => {
            if (link.getAttribute('data-section') === section) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    // Render appropriate grid
    if (section === 'dashboard') {
        renderDashboardGrid();
        updateDashboardStats();
    } else if (section === 'inventory') {
        renderInventoryGrid();
    }
}

function filterByCategory(category) {
    currentCategory = category;
    
    // Update active category in UI
    if (elements.categoryItems) {
        elements.categoryItems.forEach(item => {
            if (item.getAttribute('data-category') === category) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    // Filter items based on category
    let filteredItems = [];
    
    if (category === 'all') {
        filteredItems = allInventoryItems;
    } else if (category === 'in-stock') {
        filteredItems = getInStockItems();
    } else if (category === 'low-stock') {
        filteredItems = allInventoryItems.filter(item => isLowStock(item));
    } else if (category === 'out-of-stock') {
        filteredItems = allInventoryItems.filter(item => isOutOfStock(item));
    } else {
        filteredItems = allInventoryItems.filter(item => {
            const itemCategory = item.category || getCategoryFromName(item.itemName);
            return itemCategory === category;
        });
    }
    
    // Update UI based on current section
    if (currentSection === 'inventory') {
        renderFilteredInventoryGrid(filteredItems);
    } else if (currentSection === 'dashboard') {
        renderFilteredDashboardGrid(filteredItems);
    }
}

// ==================== LOADING & NOTIFICATION FUNCTIONS ====================

function showLoading(message = 'Loading...') {
    hideLoading();
    
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loadingOverlay';
    loadingOverlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.7); display: flex; flex-direction: column;
        justify-content: center; align-items: center; z-index: 9999;
        color: white; font-size: 18px;
    `;
    
    const spinner = document.createElement('div');
    spinner.style.cssText = `
        width: 50px; height: 50px; border: 5px solid rgba(255,255,255,0.3);
        border-radius: 50%; border-top-color: white;
        animation: spin 1s ease-in-out infinite; margin-bottom: 20px;
    `;
    
    const loadingText = document.createElement('div');
    loadingText.textContent = message;
    
    loadingOverlay.appendChild(spinner);
    loadingOverlay.appendChild(loadingText);
    document.body.appendChild(loadingOverlay);
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}

function showToast(message, type = 'success') {
    let container = document.getElementById('toastContainer');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10000;
            display: flex; flex-direction: column; gap: 10px;
        `;
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.style.cssText = `
        padding: 15px 25px; border-radius: 8px; color: white;
        margin-bottom: 10px; animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        background-color: ${type === 'success' ? '#28a745' : 
                         type === 'error' ? '#dc3545' : 
                         type === 'warning' ? '#ffc107' : '#17a2b8'};
    `;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==================== EVENT LISTENER INITIALIZATION ====================

function initializeEventListeners() {
    console.log('Initializing event listeners...');
    
    // Button event listeners
    if (elements.addNewItem) {
        elements.addNewItem.addEventListener('click', openAddModal);
    }
    
    if (elements.saveItemBtn) {
        elements.saveItemBtn.addEventListener('click', handleSaveItem);
    }
    
    if (elements.cancelBtn) {
        elements.cancelBtn.addEventListener('click', closeModal);
    }
    
    if (elements.closeModal) {
        elements.closeModal.addEventListener('click', closeModal);
    }
    
    if (elements.refreshDashboard) {
        elements.refreshDashboard.addEventListener('click', () => {
            updateDashboardStats();
            renderDashboardGrid();
            renderInventoryGrid();
            updateCategoryCounts();
        });
    }
    
    // Navigation
    if (elements.navLinks && elements.navLinks.length > 0) {
        elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                showSection(section);
            });
        });
    }
    
    // Form field changes
    if (elements.itemName) {
        elements.itemName.addEventListener('change', updateFromItemName);
    }
    
    if (elements.itemCategory) {
        elements.itemCategory.addEventListener('change', function() {
            const category = this.value;
            if (category) {
                filterIngredientsByCategory(category);
                updateUnitOptions(category);
            }
        });
    }
    
    // Category items click listeners - open modal and auto-fill
    if (elements.categoryItems && elements.categoryItems.length > 0) {
        elements.categoryItems.forEach(categoryItem => {
            categoryItem.addEventListener('click', (e) => {
                const category = categoryItem.getAttribute('data-category');
                
                if (category !== 'all' && 
                    category !== 'in-stock' && 
                    category !== 'low-stock' && 
                    category !== 'out-of-stock') {
                    // Open the modal and auto-fill
                    openAddModal();
                    setTimeout(() => {
                        autoFillItemFromCategory(category);
                    }, 100);
                } else {
                    // Just filter
                    filterByCategory(category);
                }
            });
        });
    }
    
    // Search input
    if (elements.searchInput) {
        let searchTimeout;
        elements.searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                debounceSearch(e.target.value);
            }, 300);
        });
    }
    
    // Close modal when clicking outside
    if (elements.itemModal) {
        elements.itemModal.addEventListener('click', (e) => {
            if (e.target === elements.itemModal) {
                closeModal();
            }
        });
    }
    
    console.log('✅ Event listeners initialized');
}

// ==================== INITIALIZE THE SYSTEM ====================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inventory Management System initializing...');
    
    // Initialize DOM elements
    initializeElements();
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Update form options
    updateCategoryOptions();
    updateItemNameOptions();
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Load initial data - no sample data, just initialize empty
    fetchInventoryItems().then(() => {
        console.log('📦 Inventory items loaded:', allInventoryItems.length);
        
        // ✅ FIX: Load persisted inventory stock values BEFORE rendering
        loadInventoryWithPersistedValues();
        
        // Update UI
        updateCategoryCounts();
        updateDashboardStats();
        
        // Show default section
        showSection('dashboard');
        renderDashboardGrid();
        renderInventoryGrid();
        
        console.log('✅ Inventory system initialized successfully');
    }).catch(error => {
        console.error('❌ Error during initialization:', error);
        showToast('Failed to load inventory', 'error');
    });
});

// ==================== EXPORT FUNCTIONS TO GLOBAL SCOPE ====================

// ==================== INCREASE/DECREASE STOCK ====================

async function increaseStock(itemId, itemName) {
    const item = allInventoryItems.find(i => i._id === itemId || i.id === itemId);
    if (!item) {
        showToast('Item not found', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/inventory/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                currentStock: parseFloat(item.currentStock) + 1
            })
        });
        
        if (response.ok) {
            // Update locally and re-render
            item.currentStock = parseFloat(item.currentStock) + 1;
            showToast(`✅ Stock increased for ${itemName}`, 'success');
            renderInventoryGrid();
            renderDashboardGrid();
            updateDashboardStats();
            
            // ✅ FIX: Save inventory stock values to prevent reset
            saveInventoryStockValues();
        } else {
            showToast('Failed to update stock', 'error');
        }
    } catch (error) {
        console.error('Error increasing stock:', error);
        showToast('Error updating stock', 'error');
    }
}

async function decreaseStock(itemId, itemName) {
    const item = allInventoryItems.find(i => i._id === itemId || i.id === itemId);
    if (!item) {
        showToast('Item not found', 'error');
        return;
    }
    
    const currentStock = parseFloat(item.currentStock) || 0;
    if (currentStock <= 0) {
        showToast('Cannot reduce below 0', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/inventory/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                currentStock: currentStock - 1
            })
        });
        
        if (response.ok) {
            // Update locally and re-render
            item.currentStock = currentStock - 1;
            showToast(`✅ Stock reduced for ${itemName}`, 'success');
            renderInventoryGrid();
            renderDashboardGrid();
            updateDashboardStats();
            
            // ✅ FIX: Save inventory stock values to prevent reset
            saveInventoryStockValues();
        } else {
            showToast('Failed to update stock', 'error');
        }
    } catch (error) {
        console.error('Error decreasing stock:', error);
        showToast('Error updating stock', 'error');
    }
}

window.updateDashboardStats = updateDashboardStats;
window.openEditModal = openEditModal;
window.filterByCategory = filterByCategory;
window.showSection = showSection;
window.debounceSearch = debounceSearch;
window.closeModal = closeModal;
window.handleSaveItem = handleSaveItem;
window.updateFromItemName = updateFromItemName;
window.openAddModal = openAddModal;
window.fetchInventoryItems = fetchInventoryItems;
window.renderInventoryGrid = renderInventoryGrid;
window.updateCategoryCounts = updateCategoryCounts;
window.showToast = showToast;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.getInStockCount = getInStockCount;
window.getInStockItems = getInStockItems;
window.autoFillItemFromCategory = autoFillItemFromCategory;
window.increaseStock = increaseStock;
window.decreaseStock = decreaseStock;