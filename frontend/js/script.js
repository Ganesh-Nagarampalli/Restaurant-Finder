document.addEventListener('DOMContentLoaded', () => {
    let offset = 0;
    const limit = 10;
    let isLoading = false;

    const restaurantList = document.querySelector('.restaurant-list');
    const modal = document.getElementById('restaurantModal');
    const modalContent = document.getElementById('modalContent');
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
                            <button class="view-details" data-id="${results.RestaurantID}">View Details</button>
                        </div>
                    `;
                    restaurantList.appendChild(restaurantBox);
                });

                offset += limit;
                isLoading = false;
                
            })
            .catch(error => {
                console.error('Error fetching restaurant data:', error);
                isLoading = false;
                
            });
    }

    function handleViewDetailsClick(event) {
        if (event.target.classList.contains('view-details')) {
            const restaurantID = event.target.getAttribute('data-id');
            fetchRestaurantDetails(restaurantID);
        }
    }

    function handleScroll() {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 5) {
            fetchRestaurants();
        }
    }

    function fetchRestaurantDetails(restaurantID) {
        fetch(`http://localhost:3000/api/restaurants/${restaurantID}`)
            .then(response => response.json())
            .then(data => {
                displayRestaurantDetails(data);
            })
            .catch(error => {
                console.error('Error fetching restaurant details:', error);
            });
    }
    function displayRestaurantDetails(details) {
        modalContent.innerHTML = `
            <span class="close-btn">&times;</span>
            <h2>${details.RestaurantName}</h2>
            <p>Cuisine: ${details.Cuisines}</p>
            <p>Average Cost for Two: $${details.AverageCostForTwo}</p>
            <p>Address: ${details.Address}</p>
            <p>City: ${details.City}</p>

        `;
        modal.style.display = 'flex'; // Ensure modal is displayed using flex
    }

    modal.addEventListener('click', (event) => {
        if (event.target.classList.contains('close-btn')) {
            modal.style.display = 'none'; // Hide the modal on close button click
        }
    });
    restaurantList.addEventListener('click', handleViewDetailsClick);
    window.addEventListener('scroll', handleScroll);

    // Initial fetch
    fetchRestaurants();
});
