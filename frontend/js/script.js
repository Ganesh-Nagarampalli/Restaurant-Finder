document.addEventListener('DOMContentLoaded', () => {
    let offset = 0;
    const limit = 10;
    let isLoading = false;

    const restaurantList = document.querySelector('.restaurant-list');

    function fetchRestaurants() {
        if (isLoading) return;
        isLoading = true;
        
        
        console.log(`Fetching restaurants with limit ${limit} and offset ${offset}`);

        fetch(`http://localhost:3000/api/restaurants?limit=${limit}&offset=${offset}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Received data:', data);
                data.forEach(results => {
                    const restaurantBox = document.createElement('div');
                    restaurantBox.className = 'restaurant-box';
                    restaurantBox.innerHTML = `
                        
                        <div class="restaurant-info">
                            <h2>${results.RestaurantName}</h2>
                            
                            <p>Cuisine: ${results.Cuisines}</p>
                            <p>Average Cost for Two: $${results.AverageCostForTwo}</p>
                            <button class="view-details">View Details</button>
                        </div>
                    `;
                    restaurantList.appendChild(restaurantBox);
                });

                offset += limit;
                isLoading = false;
                document.getElementById('loading').style.display = 'none';
            })
            .catch(error => {
                console.error('Error fetching restaurant data:', error);
                isLoading = false;
                
            });
    }

    function handleScroll() {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 5) {
            fetchRestaurants();
        }
    }

    window.addEventListener('scroll', handleScroll);

    // Initial fetch
    fetchRestaurants();
});
