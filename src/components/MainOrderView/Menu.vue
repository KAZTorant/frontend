<template>
    <div class="menu">
        <div class="menu-category-item-menu sticky">
            <div class="menu-category-items-header">
                <span :class="{ active: selectedCategory === undefind }" @click="fetchMenuItems()">
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
            <div class="menu-item-price">{{ item.price }} azn</div>
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
                if (!categoryId) {
                    document.querySelector('.active-green').classList.remove('active-green');
                }
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
.menu-category-item-menu {
    max-height: 300px;
}

/* Add styling for disabled menu items */
.disabled {
    pointer-events: none;
    /* Disable click events */
    opacity: 0.5;
    /* Optionally reduce opacity to visually indicate it's disabled */
}

.active {
    font-weight: bold;
    background-color: greenyellow;
    transition: all 0.3ms ease-in-out;
}

.active:hover{
    background-color: rgb(145, 223, 27);
}

.menu {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(15, 1fr);
    /* Creates three columns */
    gap: 10px;
    padding: 0 5px;
    overflow-y: auto;
    /* Enable vertical scrolling */
    

}

.menu-item {
    /* Styling for each menu item, adjust as needed */
    border: 2px solid black;
    padding: 5px;
    cursor: pointer;
    display: flex;
    align-items:center;
    /* This centers the item name vertically */
    justify-content: space-between;
    /* This centers the item name horizontally */
    height: 60px;
    max-width: 200px;
    background-color: cadetblue;
    color: white;
    overflow-wrap: break-word;
}
.menu-item-name,
.menu-item-price{
    font-size: 14px
}

.menu-category-item-menu.sticky {
    grid-column: 1 / -1;
    /* This makes it span all columns */
    position: sticky;
    bottom: 0;
    background: white;
    /* Optional: Background color for visibility */
    z-index: 1000;
}

.menu-category-items-header {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
    white-space: nowrap;
    cursor:pointer;
    background-color: cadetblue;
    border-left: 4px solid cadetblue;
    border-right: 4px solid cadetblue;
}
.menu-category-items-header span:not(.active) {
  background-color: #fff; 
}

.menu-category-items-header::-webkit-scrollbar {
    display: none;
} 
.menu-category-items-header span {
    border-left: 2px solid cadetblue;
    border-right: 2px solid cadetblue;
    border-top: 6px solid cadetblue;   
    border-bottom: 6px solid cadetblue;
    padding: 4px 10px;
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
@media (max-width: 1034px) {
  .menu {
    grid-template-columns: repeat(2, 1fr);
  }
 
}

@media (max-width: 768px) {
  .menu {
    grid-template-columns: repeat(3, 1fr); 
    }
  .menu-category-items-header{
    overflow-x: auto;
    flex-wrap: nowrap;
  }
}
@media (max-width: 530px) {
  .menu {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
