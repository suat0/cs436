from locust import HttpUser, task, between, constant
import random
import logging
import json
import time

class ProductAPIUser(HttpUser):
    """
    User that fetches products from category 3 sorted by name
    Tests the specific API endpoint: /api/categories/3/products?sort_by=name
    """
    # Wait 2-5 seconds between requests to simulate realistic user behavior
    wait_time = between(2, 5)
    
    # Track successful and failed requests for reporting
    successful_requests = 0
    failed_requests = 0
    
    def on_start(self):
        """Initialize user session"""
        logging.info("New API user started testing product listing endpoint")
        
        # Optional: You could add authentication here if the API requires it
        # self.client.post("/api/login", json={"username": "test", "password": "test"})
        
    @task(1)
    def fetch_category_products(self):
        """
        Main task: Fetch products from category 3 sorted by name
        This directly tests the endpoint: http://34.22.229.178/api/categories/3/products?sort_by=name
        """
        start_time = time.time()
        
        # Make the API request
        with self.client.get(
            "/api/categories/3/products?sort_by=name",
            name="Fetch Products - Category 3 (Sorted by Name)",
            catch_response=True
        ) as response:
            # Calculate response time
            response_time = time.time() - start_time
            
            # Check if request was successful
            if response.status_code == 200:
                # Try to parse JSON response
                try:
                    products = response.json()
                    product_count = len(products) if isinstance(products, list) else 0
                    if "items" in products:  # Handle pagination case
                        product_count = len(products["items"])
                    
                    # Verify the response contains products
                    if product_count > 0:
                        logging.info(f"Successfully fetched {product_count} products in {response_time:.2f}s")
                        self.successful_requests += 1
                        response.success()
                    else:
                        logging.warning("API returned 200 but no products were found")
                        response.failure("No products returned")
                        self.failed_requests += 1
                except json.JSONDecodeError:
                    logging.error("Failed to parse response as JSON")
                    response.failure("Invalid JSON response")
                    self.failed_requests += 1
            else:
                # Log failed requests with status code
                logging.error(f"API request failed with status {response.status_code}")
                response.failure(f"HTTP Error {response.status_code}")
                self.failed_requests += 1

    @task(5)  # Higher weight to test main endpoint more frequently
    def fetch_with_pagination(self):
        """Test pagination by requesting different page sizes and page numbers"""
        # Randomly select page size and number
        page_size = random.choice([5, 10, 20, 50])
        page_number = random.randint(1, 3)
        
        # Construct the paginated URL
        url = f"/api/categories/3/products?sort_by=name&page={page_number}&per_page={page_size}"
        
        with self.client.get(url, name=f"Pagination - Page {page_number}, Size {page_size}") as response:
            if response.status_code == 200:
                self.successful_requests += 1
            else:
                self.failed_requests += 1
                logging.error(f"Pagination request failed: {url} with status {response.status_code}")
    
    @task(2)
    def fetch_with_filters(self):
        """Test API with different filter combinations"""
        # Sample filters that might be applicable (adjust based on your actual API)
        filters = [
            "min_price=10&max_price=50",
            "in_stock=true",
            "min_rating=4",
            "brand=popular"
        ]
        
        # Select a random filter
        random_filter = random.choice(filters)
        url = f"/api/categories/3/products?sort_by=name&{random_filter}"
        
        with self.client.get(url, name=f"Filter - {random_filter}") as response:
            if response.status_code == 200:
                self.successful_requests += 1
            else:
                self.failed_requests += 1
                logging.error(f"Filter request failed: {url}")

    def on_stop(self):
        """Log statistics when user session ends"""
        total = self.successful_requests + self.failed_requests
        if total > 0:
            success_rate = (self.successful_requests / total) * 100
            logging.info(f"User session ended. Success rate: {success_rate:.2f}%")


class MobileAPIUser(ProductAPIUser):
    """
    Simulates mobile users accessing the same API endpoint
    but with different headers and more aggressive request patterns
    """
    # Mobile users might refresh more frequently
    wait_time = between(1, 3)
    
    def fetch_category_products(self):
        # Add mobile user agent and other mobile-specific headers
        headers = {
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
            "Accept": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-Device-Type": "mobile"
        }
        
        # Call the parent method with mobile headers
        with self.client.get(
            "/api/categories/3/products?sort_by=name",
            headers=headers,
            name="Mobile - Fetch Products",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                self.successful_requests += 1
            else:
                self.failed_requests += 1


# Run with: locust -f locust_api_test.py --host=http://34.22.229.178