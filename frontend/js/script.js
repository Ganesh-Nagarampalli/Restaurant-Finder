document.addEventListener('DOMContentLoaded', () => {
    let offset = 0;
    const limit = 10;
    let isLoading = false; //used to prevent multiple requests while waiting for the response

    const restaurantList = document.querySelector('.restaurant-list');
    const modal = document.getElementById('restaurantModal');
    const modalContent = document.getElementById('modalContent');
    const searchBar = document.getElementById('searchBar');
    const searchBtn = document.getElementById('searchBtn');
    const selectCountry = document.getElementById('selectCountry');
    const random = document.getElementById('random');
    let countries = {};

    random.addEventListener('click', () => {
        fetch(`http://localhost:3000/api/random`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                restaurantList.innerHTML = '';
                const country = countries[data.CountryCode] || 'Unknown';
                const restaurantBox = document.createElement('div');
                restaurantBox.className = 'restaurant-box';
                restaurantBox.innerHTML = `
                    <div class="restaurant-info">
                        <h2>${data.RestaurantName}</h2>
                        <p>Cuisine: ${data.Cuisines}</p>
                        <p>Average Cost for Two: $${data.AverageCostForTwo}</p>
                        <p>Country: ${country}</p>
                        <button class="view-details" data-id="${data.RestaurantID}">View Details</button>
                    </div>
                `;
                restaurantList.appendChild(restaurantBox);
            })
            .catch(error => {
                console.error('Error fetching restaurant data:', error);
            }
            );
    }
    );
    selectCountry.addEventListener('change', () => {
        const countryCode = selectCountry.value;
        console.log('Country code:', countryCode);
        if(countryCode == '0') {
            fetchRestaurants();
            return;
        }
        else fetchRestaurantsByCountry(countryCode);
    });

    function fetchRestaurantsByCountry(countryCode) {
        if (isLoading) return;
        isLoading = true;
        fetch(`http://localhost:3000/api/country/${countryCode}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                restaurantList.innerHTML = '';
                data.forEach(results => {
                    const country = countries[results.CountryCode] || 'Unknown';
                    const restaurantBox = document.createElement('div');
                    restaurantBox.className = 'restaurant-box';
                    restaurantBox.innerHTML = `
                        <div class="restaurant-info">
                            <h2>${results.RestaurantName}</h2>
                            <p>Cuisine: ${results.Cuisines}</p>
                            <p>Average Cost for Two: $${results.AverageCostForTwo}</p>
                            <p>Country: ${country}</p>
                            <button class="view-details" data-id="${results.RestaurantID}">View Details</button>
                        </div>
                    `;
                    restaurantList.appendChild(restaurantBox);
                }
                );
                isLoading = false;
            }
            )
            .catch(error => {
                console.error('Error fetching restaurant data:', error);
                isLoading = false;
            }
            );
    }

    function fetchCountries() {
        return fetch('http://localhost:3000/api/countries')
            .then(response => response.json())
            .then(data => {
                data.forEach(country => {
                    countries[country.CountryCode] = country.Country;
                });
            })
            .catch(error => {
                console.error('Error fetching countries data:', error);
            });
    }
    function fetchRestaurants() {
        if (isLoading) return;
        isLoading = true;
        
        
        console.log(`Fetching restaurants with limit ${limit} and offset ${offset}`);

        fetch(`http://localhost:3000/api/restaurants?limit=${limit}&offset=${offset}`)
            .then(response => {
                console.log(response);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                
                data.forEach(results => {
                    const country = countries[results.CountryCode] || 'Unknown';
                    const restaurantBox = document.createElement('div');
                    restaurantBox.className = 'restaurant-box';
                    restaurantBox.innerHTML = `
                        
                        <div class="restaurant-info">
                            <h2>${results.RestaurantName}</h2>
                            
                            <p>Cuisine: ${results.Cuisines}</p>
                            <p>Average Cost for Two: $${results.AverageCostForTwo}</p>
                            <p>Country: ${country}</p>
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
        const country = countries[details.CountryCode] || 'Unknown';
        modalContent.innerHTML = `
            <span class="close-btn">&times;</span>
            <h2>${details.RestaurantName}</h2>
            <p><strong>Cuisine:</strong> ${details.Cuisines}</p>
            <p><strong>Average Cost for Two:</strong> $${details.AverageCostForTwo}</p>
            <p><strong>Has Table Booking:</strong> ${details.HasTableBooking}</p>
            <p><strong>Rating:</strong> ${details.AggregateRating}</p>
            <p><strong>Online Delivery:</strong> ${details.HasOnlineDelivery}</p>
            <p><strong>City:</strong> ${details.City}</p>
            <p><strong>Address:</strong> ${details.Address}</p>
            <p><strong>Country:</strong> ${country}</p>
        `;
        modal.style.display = 'flex';
    }
    searchBtn.addEventListener('click', () => {
        const searchValue = searchBar.value;
        if (searchValue) {
            fetch(`http://localhost:3000/api/search?q=${searchValue}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    
                    restaurantList.innerHTML = '';
                    
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
                    
                })
                .catch(error => {
                    console.error('Error fetching restaurant data:', error);
                });
        }
    });

    searchBar.addEventListener('input', () => {
        const searchValue = searchBar.value.trim();

    fetch(`http://localhost:3000/api/search?q=${searchValue}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            restaurantList.innerHTML = '';

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
        })
        .catch(error => {
            console.error('Error fetching restaurant data:', error);
        });
    });
    
    modal.addEventListener('click', (event) => {
        if (event.target.classList.contains('close-btn')) {
            modal.style.display = 'none'; // Hide the modal on close button click
        }
    });
    restaurantList.addEventListener('click', handleViewDetailsClick);
    window.addEventListener('scroll', handleScroll);

    // Initial fetch
    fetchCountries().then(fetchRestaurants);
});
