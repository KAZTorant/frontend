<template>
    <div class="menu">  
        <div class="menu-category-item-menu sticky">
            <div class="menu-category-items-header">
                <template v-if="!showAllMeals || !selectedGroup">
                    <span 
                        v-for="group in mealGroups" 
                        :key="group.id"
                        @click="selectGroup(group)"
                        :class="{ active: selectedGroup?.id === group.id }"
                    >
                        {{ group.name }}
                    </span>
                </template>

                <template v-else>
                    <button class="back-btn" @click="goBackToGroups">
                        <font-awesome-icon icon="arrow-left" />
                        Qruplar
                    </button>
                    <span 
                        v-for="category in selectedGroup.categories" 
                        :key="category.id"
                        @click="fetchMenuItems(category.id)"
                        :class="{ active: selectedCategory === category.id }"
                    >
                        {{ category.name }}
                    </span>
                </template>
            </div>
            <input 
                v-if="showAllMeals && selectedCategory" 
                type="text" 
                v-model="searchQuery" 
                placeholder="Axtarış..." 
                class="search-input"
            />
        </div>
        <div class="menu-items-container">
            <div class="menu-item" 
                 v-for="item in filteredMenuItems" 
                 :key="item.id" 
                 @click="addOrderItem(tableId, item.id, 1)"
                 :class="{ 'disabled': loading }">
                <div class="menu-item-name">{{ item.name }}</div>
                <div class="menu-item-price">{{ item.price }} azn</div>
            </div>
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
            mealGroups: [],
            selectedGroup: null,
            menuItems: [],
            selectedCategory: null,
            loading: false,
            orderCreatedAlready: false,
            searchQuery: '',
            orderId: null,
            showAllMeals: false
        };
    },
    async created() {
        this.fetchMealGroups();
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
        async fetchMealGroups() {
            try {
                const groups = await backendServices.fetchMealGroups();
                this.mealGroups = groups;
            } catch (error) {
                console.error('Error fetching meal groups:', error);
            }
        },
        selectGroup(group) {
            this.selectedGroup = group;
            this.showAllMeals = true;
            this.selectedCategory = null;
            this.menuItems = [];
        },
        async fetchMenuItems(categoryId = null) {
            if (!categoryId) return;
            this.selectedCategory = categoryId;
            try {
                const items = await backendServices.fetchMealsByCategoryId(categoryId);
                this.menuItems = items;
            } catch (error) {
                console.error('Error fetching menu items:', error);
            }
        },
        goBackToGroups() {
            this.showAllMeals = false;
            this.selectedCategory = null;
            this.menuItems = [];
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
.menu {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(245, 245, 245, 0.98));
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    overflow: hidden;
}

.menu-category-item-menu {
    background: linear-gradient(135deg, #ffffff, #f8f9fa);
    padding: 15px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    border: 1px solid #e9ecef;
    position: sticky;
    top: 0;
    z-index: 1000;
    flex-shrink: 0;
}

.menu-category-items-header {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 15px;
    justify-content: flex-start;
    align-items: center;
}

.menu-category-items-header span {
    padding: 10px 20px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    color: #2c3e50;
    font-weight: 500;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    min-width: 100px;
    text-align: center;
    touch-action: manipulation;
    font-size: 0.95em;
}

.menu-category-items-header span.active {
    background: linear-gradient(135deg, #2ecc71, #27ae60);
    color: white;
    box-shadow: 0 4px 12px rgba(46, 204, 113, 0.2);
}

.menu-items-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 15px;
    padding: 15px;
    flex: 1;
    overflow: hidden;
}

.menu-item {
    background: linear-gradient(135deg, #ffffff, #f8f9fa);
    padding: 15px;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 100px;
    transition: all 0.3s ease;
    border: 1px solid #e9ecef;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    touch-action: manipulation;
}

.menu-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #2ecc71;
}

.menu-item-name {
    font-size: 1.1em;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 10px;
    line-height: 1.3;
}

.menu-item-price {
    font-size: 1.2em;
    font-weight: 700;
    color: #2ecc71;
}

.search-input {
    width: 100%;
    padding: 12px 15px;
    border-radius: 12px;
    border: 2px solid #e9ecef;
    font-size: 1em;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    margin-bottom: 15px;
    touch-action: manipulation;
}

.back-btn {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 10px 20px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    color: #2c3e50;
    font-weight: 500;
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    touch-action: manipulation;
    min-width: 160px;
}

.back-btn:hover {
    background: linear-gradient(135deg, #e9ecef, #dee2e6);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@media (max-width: 1024px) {
    .menu-items-container {
        overflow-y: auto;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    }
}

@media (max-width: 768px) {
    .menu-category-item-menu {
        padding: 12px;
    }

    .menu-category-items-header {
        gap: 8px;
        margin-bottom: 12px;
        justify-content: center;
    }

    .menu-category-items-header span {
        padding: 8px 15px;
        min-width: 90px;
        font-size: 0.9em;
    }

    .menu-items-container {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 12px;
        padding: 12px;
    }

    .menu-item {
        padding: 12px;
        min-height: 90px;
    }
}

@media (max-width: 480px) {
    .menu-category-item-menu {
        padding: 10px;
    }

    .menu-category-items-header {
        gap: 6px;
        margin-bottom: 10px;
    }

    .menu-category-items-header span {
        padding: 6px 12px;
        min-width: 80px;
        font-size: 0.85em;
        border-radius: 10px;
    }

    .menu-items-container {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 10px;
        padding: 10px;
    }

    .menu-item {
        padding: 10px;
        min-height: 80px;
        border-radius: 10px;
    }
}

/* Add support for landscape mode */
@media (max-width: 900px) and (orientation: landscape) {
    .menu-items-container {
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        overflow-y: auto;
    }
}
</style>