<template>
    <div class="menu">  
        <div class="menu-category-item-menu sticky">
            <div class="menu-category-items-header">
                <template v-if="!showAllMeals">
                    <span 
                        :class="{ active: showAllMeals && selectedCategory === null }"
                        @click="fetchMenuItems(null)"
                    >
                        Əsas yeməklər
                    </span>

                    <span 
                        v-for="category in mealCategories" 
                        :key="category.id"
                        @click="fetchMenuItems(category.id)"
                        :class="{ active: selectedCategory === category.id }"
                    >
                        {{ category.name }}
                    </span>
                </template>

                <template v-else>
                    <button class="back-btn" @click="goBackToCategories">Geri</button>
                    <span class="active">
                        {{ selectedCategory === null ? "Əsas yeməklər" : currentCategoryName }}
                    </span>
                </template>
            </div>
            <input 
                v-if="showAllMeals" 
                type="text" 
                v-model="searchQuery" 
                placeholder="Axtarış..." 
                class="search-input"
            />

        </div>
        <div class="menu-item" 
             v-for="item in filteredMenuItems" 
             :key="item.id" 
             @click="addOrderItem(tableId, item.id, 1)"
             :class="{ 'disabled': loading }">
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
            loading: false,
            orderCreatedAlready: false,
            searchQuery: '',
            orderId: null
        };
    },
    async created() {
        this.fetchMealCategories();
        this.fetchMenuItems();
        EventBus.on('selectedOrderId', (orderId) => {
            this.orderId = orderId;
        });
    },
    beforeUnmount() {
        EventBus.off('selectedOrderId');
    },
    computed: {
        filteredMenuItems() {
            if (!this.searchQuery) {
                return this.menuItems;
            }
            const query = this.searchQuery.toLowerCase();
            return this.menuItems.filter(item => item.name.toLowerCase().includes(query));
        },

        currentCategoryName() {
            const category = this.mealCategories.find(cat => cat.id === this.selectedCategory);
            return category ? category.name : '';
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
                this.fetchMenuItems(null);
            } catch (error) {
                console.error('Error fetching meal categories:', error);
            }
        },
        async fetchMenuItems(categoryId = null) {
            this.selectedCategory = categoryId;

            if (categoryId === null) {
                this.currentCategoryName = "Əsas yeməklər";
                this.showAllMeals = true;

                let allMeals = [];
                for (const category of this.mealCategories) {
                const meals = await backendServices.fetchMealsByCategoryId(category.id);
                allMeals = allMeals.concat(meals);
                }
                this.menuItems = allMeals;
            } else {
                this.showAllMeals = true;
                const category = this.mealCategories.find(cat => cat.id === categoryId);
                this.currentCategoryName = category ? category.name : "";

                const items = await backendServices.fetchMealsByCategoryId(categoryId);
                this.menuItems = items;
            }
        },

        goBackToCategories() {
            this.showAllMeals = false;
            this.selectedCategory = null;
            this.menuItems = [];
            this.currentCategoryName = "";
        },
        async addOrderItem(categoryId, mealId, quantity, orderId) {
            try {
                await this.checkOrderIfCreated();
                this.loading = true;
                await backendServices.addOrderItem(categoryId, mealId, quantity, this.orderId || orderId);
                EventBus.emit('orderItemAdded');
            } catch (error) {
                console.error('Sifarişi əlavə edərkən xəta baş verdi:', error);
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
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 10px;
    white-space: nowrap;
    cursor: pointer;
    background-color: cadetblue;
    border-left: 4px solid cadetblue;
    border-right: 4px solid cadetblue;
    padding: 10px 6px;
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
    border: 2px solid cadetblue;
    padding: 8px 10px;
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

.back-btn {
    padding: 8px 10px;
    font-size: 16px;
    font-weight: bold;
    border: 2px solid cadetblue;
    background-color: #fff;
    cursor: pointer;
    margin-right: 10px;
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