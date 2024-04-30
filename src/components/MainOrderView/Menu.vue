<template>
    <div class="menu">
        <div class="menu-category-item-menu sticky">
            <div class="menu-category-items-header">
                <span>isti yemek</span>
                <span>shorba</span>
                <span>duyuler</span>
                <span>kabablar</span>
                <span>isti yemek</span>
                <span>shorba</span>
                <span>duyuler</span>
                <span>kabablar</span>   <span>isti yemek</span>
                <span>shorba</span>
                <span>duyuler</span>
                <span>kabablar</span>   <span>isti yemek</span>
                <span>shorba</span>
                <span>duyuler</span>
                <span>kabablar</span>   <span>isti yemek</span>
                <span>shorba</span>
                <span>duyuler</span>
                <span>kabablar</span>
            </div>
        </div>
        <div class="menu-item" v-for="item in menuItems" :key="item.id">
            <!-- Display the menu item name here -->
            <div class="menu-item-name">{{ item.name }}</div>
        </div>
      
    </div>
</template>

<script>
export default {
    name: 'Menu',
    data() {
        return {
            // Sample data structure, you will need to fill this with actual data
            menuItems: [
                { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' },
                { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }, { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' },
                // ... more items
            ]
        };
    }
}
</script>

<style scoped>
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
    grid-column: 1 / -1; /* This makes it span all columns */
    position: sticky;
    bottom: 0;
    background: white; /* Optional: Background color for visibility */
    z-index: 1000; /* Ensures it stays on top */
    border-top: 1px solid #ccc; /* Stylistic choice to separate from items */
}

.menu-item-name {
    /* Additional styling for the menu item name */
}

.menu-category-items-header {
    display: flex; /* Aligns children horizontally */
    overflow-x: auto; /* Enables horizontal scrolling */
    white-space: nowrap; /* Prevents wrapping of items to ensure horizontal scrolling */
    padding: 10px 0; /* Optional padding for aesthetic spacing */
    border-bottom: 1px solid #ccc; /* Optional stylistic choice */
}

.menu-category-item-menu.sticky {
    grid-column: 1 / -1; /* Makes it span all columns */
    position: sticky;
    top: 0; /* Changed from bottom to top for better visibility */
    background: white;
    z-index: 1000;
}

span {
    padding: 0 15px; /* Spacing between category items */
    cursor: pointer; /* Suggests interactivity */
}

</style>
