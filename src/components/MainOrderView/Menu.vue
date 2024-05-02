<template>
    <div class="menu">
        <div class="menu-category-item-menu sticky">
            <div class="menu-category-items-header">
                <span :key="0" @click="fetchMenuItems()" class="active-green">
                    Əsas yeməklər
                </span>
                <span v-for="category in mealCategories" :key="category.id" @click="fetchMenuItems(category.id)"
                    :class="{ active: selectedCategory === category.id }">
                    {{ category.name }}
                </span>
            </div>
        </div>
        <div class="menu-item" v-for="item in menuItems" :key="item.id" @click="addOrderItem(tableId, item.id, 1)"
            :class="{ 'disabled': loading }">
            <!-- Display the menu item name here -->
            <div class="menu-item-name">{{ item.name }}</div>
            <div class="menu-item-price">{{ item.price }}</div>azn
        </div>
    </div>
</template>

<script>
import backendServices from '../../backend-services/backend-services';
import { EventBus } from '../../EventBus';

export default {
    name: 'Menu',
    props: {
        tableId: {
            type: Number,
            required: true
        }
    },
    data() {
        return {
            mealCategories: [],
            menuItems: [],
            selectedCategory: null,
            loading: false, // Add loading state,
            orderCreatedAlready: false,
        };
    },
    async created() {
        this.fetchMealCategories();
        this.fetchMenuItems();
    },
    methods: {
        async checkOrderIfCreated() {
            if (!this.orderCreatedAlready) {
                await this.createOrder();
                this.orderCreatedAlready = true;
            }
        }
        ,
        async createOrder() {
            // Call the API to create an order
            try {
                await backendServices.createOrder(this.tableId);
                console.log('Order created successfully for table ID:', this.tableId);
            } catch (error) {
                if (error.response && error.response.status === 400) {
                    console.log(error.response);
                    console.error(`Bad Request: ${error.response.data.error}`);
                    // Handle 400 Bad Request error
                } else {
                    console.error('Error creating order:', error);
                    // Handle other errors
                }
            }
        },

        async fetchMealCategories() {
            try {
                const categories = await backendServices.fetchMealCategories();
                this.mealCategories = categories;
            } catch (error) {
                console.error('Error fetching meal categories:', error);
            }
        },
        async fetchMenuItems(categoryId) {
            try {
                this.loading = true; // Set loading to true
                const items = await backendServices.fetchMealsByCategoryId(categoryId);
                this.menuItems = items;
                this.selectedCategory = categoryId;
            } catch (error) {
                console.error('Error fetching menu items:', error);
            } finally {
                this.loading = false; // Set loading back to false regardless of success or failure
            }
        },
        async addOrderItem(categoryId, mealId, quantity) {
            try {
                await this.checkOrderIfCreated();

                this.loading = true; // Set loading to true
                await backendServices.addOrderItem(categoryId, mealId, quantity);
                EventBus.emit('orderItemAdded');
            } catch (error) {
                console.error('Error while adding meal to order:', error);
            } finally {
                this.loading = false; // Set loading back to false regardless of success or failure
            }
        }
    }
}
</script>

<style scoped>
/* Add styling for disabled menu items */
.disabled {
    pointer-events: none;
    /* Disable click events */
    opacity: 0.5;
    /* Optionally reduce opacity to visually indicate it's disabled */
}

.active {
    font-weight: bold;
}

.active-green {
    font-weight: bold;
    background-color: greenyellow;
}

.menu {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    /* Creates three columns */
    grid-gap: 10px;
    /* Space between items */
    max-height: 100vh;
    /* Maximum height */
    overflow-y: auto;
    /* Enable vertical scrolling */
}

.menu-item {
    /* Styling for each menu item, adjust as needed */
    border: 1px solid #ccc;
    padding: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    /* This centers the item name vertically */
    justify-content: center;
    /* This centers the item name horizontally */
}

.menu-category-item-menu.sticky {
    grid-column: 1 / -1;
    /* This makes it span all columns */
    position: sticky;
    bottom: 0;
    background: white;
    /* Optional: Background color for visibility */
    z-index: 1000;
    /* Ensures it stays on top */
    border-top: 1px solid #ccc;
    /* Stylistic choice to separate from items */
}

.menu-item-name {
    /* Additional styling for the menu item name */
}

.menu-category-items-header {
    display: flex;
    /* Aligns children horizontally */
    overflow-x: auto;
    /* Enables horizontal scrolling */
    white-space: nowrap;
    /* Prevents wrapping of items to ensure horizontal scrolling */
    padding: 10px 0;
    /* Optional padding for aesthetic spacing */
    border-bottom: 1px solid #ccc;
    /* Optional stylistic choice */
}

.menu-category-item-menu.sticky {
    grid-column: 1 / -1;
    /* Makes it span all columns */
    position: sticky;
    top: 0;
    /* Changed from bottom to top for better visibility */
    background: white;
    z-index: 1000;
}

span {
    padding: 0 15px;
    /* Spacing between category items */
    cursor: pointer;
    /* Suggests interactivity */
}
</style>
