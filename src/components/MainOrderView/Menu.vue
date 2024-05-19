<template>
    <div class="menu">
        <div class="menu-category-item-menu sticky">
            <div class="menu-category-items-header">
                <span :class="{ active: selectedCategory === undefined }" @click="fetchMenuItems()">
                    Əsas yeməklər
                </span> 
                <span v-for="category in mealCategories" :key="category.id" @click="fetchMenuItems(category.id)"
                    :class="{ active: selectedCategory === category.id }">
                    {{ category.name }}
                </span>
            </div>
            <input type="text" v-model="searchQuery" placeholder="Axtarış..." class="search-input">
        </div>
        <div class="menu-item" v-for="item in filteredMenuItems" :key="item.id" @click="addOrderItem(tableId, item.id, 1)"
            :class="{ 'disabled': loading }">
            <div class="menu-item-name">{{ item.name }}</div>
            <div class="menu-item-price">{{ item.price }} azn</div>
        </div>
    </div>
</template>


<script>import backendServices from '../../backend-services/backend-services';
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
            loading: false,
            orderCreatedAlready: false,
            searchQuery: '', // Add search query state
        };
    },
    async created() {
        this.fetchMealCategories();
        this.fetchMenuItems();
    },
    computed: {
        filteredMenuItems() {
            if (!this.searchQuery) {
                return this.menuItems;
            }
            const query = this.searchQuery.toLowerCase();
            return this.menuItems.filter(item => item.name.toLowerCase().includes(query));
        }
    },
    methods: {
        async checkOrderIfCreated() {
            if (!this.orderCreatedAlready) {
                await this.createOrder();
                this.orderCreatedAlready = true;
            }
        },
        async createOrder() {
            try {
                await backendServices.createOrder(this.tableId);
                console.log('Order created successfully for table ID:', this.tableId);
            } catch (error) {
                if (error.response && error.response.status === 400) {
                    console.log(error.response);
                    console.error(`Bad Request: ${error.response.data.error}`);
                } else {
                    console.error('Error creating order:', error);
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
                this.loading = true;
                const items = await backendServices.fetchMealsByCategoryId(categoryId);
                this.menuItems = items;
                this.selectedCategory = categoryId;
            } catch (error) {
                console.error('Error fetching menu items:', error);
            } finally {
                this.loading = false;
                if (!categoryId) {
                    document.querySelector('.active-green').classList.remove('active-green');
                }
            }
        },
        async addOrderItem(categoryId, mealId, quantity) {
            try {
                await this.checkOrderIfCreated();
                this.loading = true;
                await backendServices.addOrderItem(categoryId, mealId, quantity);
                EventBus.emit('orderItemAdded');
            } catch (error) {
                console.error('Error while adding meal to order:', error);
            } finally {
                this.loading = false;
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.querySelector('.search-input');

    if (searchInput) {
        searchInput.addEventListener('focus', function (event) {
            event.preventDefault();
            event.target.blur();
            setTimeout(() => {
                event.target.focus();
            }, 10);
        });
    }
});

</script>


<style scoped>
.menu-category-item-menu {
    max-height: 300px;
}

.disabled {
    pointer-events: none;
    opacity: 0.5;
}

.active {
    font-weight: bold;
    background-color: greenyellow;
    transition: all 0.3ms ease-in-out;
}

.active:hover {
    background-color: rgb(145, 223, 27);
}

.menu {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(15, 1fr);
    gap: 10px;
    padding: 0 5px;
    overflow-y: auto;
}

.menu-item {
    border: 2px solid black;
    padding: 5px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
    max-width: 200px;
    background-color: cadetblue;
    color: white;
    overflow-wrap: break-word;
}
.menu-item-name,
.menu-item-price {
    font-size: 18px;
    font-weight: bold;
}

.menu-category-item-menu.sticky {
    grid-column: 1 / -1;
    position: sticky;
    top: 0;
    background: white;
    z-index: 1000;
}

.menu-category-items-header {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
    white-space: nowrap;
    cursor: pointer;
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
    font-size: 18px;
    font-weight: bold;
    border-left: 2px solid cadetblue;
    border-right: 2px solid cadetblue;
    border-top: 6px solid cadetblue;   
    border-bottom: 6px solid cadetblue;
    padding: 4px 10px;
}

.search-input {
    margin-top: 10px;
    margin-bottom: 10px;
    padding: 5px;
    width: 100%;
    min-width: 40px;
    min-height: 40px;
    box-sizing: border-box;
    font-size: 16px; /* Set font size to 16px */
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
    flex-wrap: nowrap;}
}

@media (max-width: 530px) {
  .menu {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
