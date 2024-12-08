document.addEventListener('DOMContentLoaded', () => {
    const wishlistForm = document.getElementById('wishlistForm');
    const wishlistsContainer = document.getElementById('wishlists');

    // Load existing wishlists on page load
    loadWishlists();

    wishlistForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('name');
        const itemsInput = document.getElementById('items');

        // Create wishlist object
        const wishlist = {
            name: nameInput.value,
            items: itemsInput.value.split('\n').filter(item => item.trim() !== '')
        };

        try {
            // Send POST request to API
            const response = await fetch(`/api/wishlists`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(wishlist)
            });

            if (!response.ok) {
                throw new Error('Failed to save wishlist');
            }

            // Clear form
            nameInput.value = '';
            itemsInput.value = '';

            // Reload wishlists
            await loadWishlists();

        } catch (error) {
            console.error('Error saving wishlist:', error);
            alert('Failed to save wishlist. Please try again.');
        }
    });

    async function loadWishlists() {
        try {
            const response = await fetch('/api/wishlists');
            if (!response.ok) {
                throw new Error('Failed to load wishlists');
            }

            const data = await response.json();
            // displayWishlists(data.wishlists);

        } catch (error) {
            console.error('Error loading wishlists:', error);
            // wishlistsContainer.innerHTML = '<p class="error">Failed to load wishlists</p>';
        }
    }

    function displayWishlists(wishlists) {
        if (!wishlists || wishlists.length === 0) {
            wishlistsContainer.innerHTML = '<p>No wishlists yet</p>';
            return;
        }

        const html = wishlists.map(wishlist => `
            <div class="wishlist">
                <h3>${escapeHtml(wishlist.name)}'s Wishlist</h3>
                <ul>
                    ${wishlist.items.map(item => `
                        <li>${escapeHtml(item)}</li>
                    `).join('')}
                </ul>
            </div>
        `).join('');

        wishlistsContainer.innerHTML = html;
    }

    // Helper function to escape HTML and prevent XSS
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});