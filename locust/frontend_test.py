from locust import HttpUser, task, between
import random
import logging

class FrontendUser(HttpUser):
    # Wait between 1 and 5 seconds between tasks
    wait_time = between(1, 5)
    
    def on_start(self):
        """Initialize user session - runs when user starts"""
        logging.info("New user started browsing the website")
    
    @task(10)  # Weight of 10 - this is the main task
    def browse_homepage(self):
        """Simulate a user loading and interacting with the homepage"""
        # Load the homepage
        with self.client.get("/", 
                             name="Homepage",
                             catch_response=True) as response:
            if response.status_code != 200:
                response.failure(f"Homepage failed to load: {response.status_code}")
                return
                
            # Log success
            logging.info(f"Homepage loaded successfully in {response.elapsed.total_seconds():.2f}s")
            
            # Simulate loading homepage resources
            self.load_static_resources()
    
    @task(8)  # Shop page is frequently visited
    def browse_shop(self):
        """Simulate a user visiting the shop page"""
        with self.client.get("/shop", 
                            name="Shop Page",
                            catch_response=True) as response:
            if response.status_code != 200:
                response.failure(f"Shop page failed to load: {response.status_code}")
                return
                
            logging.info(f"Shop page loaded successfully in {response.elapsed.total_seconds():.2f}s")
            self.load_static_resources()
    
    @task(6)  # Category pages are also popular
    def browse_bracelet_category(self):
        """Simulate a user browsing the bracelets category"""
        with self.client.get("/category/bracelets", 
                            name="Bracelets Category",
                            catch_response=True) as response:
            if response.status_code != 200:
                response.failure(f"Bracelets category failed to load: {response.status_code}")
                return
                
            logging.info(f"Bracelets category loaded successfully in {response.elapsed.total_seconds():.2f}s")
            
            # Category page might load additional resources
            self.load_category_resources()
    
    @task(3)  # Weight of 3 - happens less often
    def refresh_page(self):
        """Simulate a user refreshing the current page"""
        # Randomly select a page to refresh
        page = random.choice([
            ("/", "Homepage Refresh"),
            ("/shop", "Shop Page Refresh"),
            ("/category/bracelets", "Bracelets Category Refresh")
        ])
        
        self.client.get(page[0], name=page[1])
    
    def load_static_resources(self):
        """Load common static resources found on all pages"""
        # These are typical resources found on many pages
        resources = [
            "/static/css/main.css",
            "/static/js/bundle.js", 
            "/static/images/logo.png",
            "/static/fonts/font.woff2",
            "/api/initial-data"  # Simulating an API call that might happen on page load
        ]
        
        # Load resources in parallel using client.get
        for resource in resources:
            self.client.get(resource, name=f"Resource: {resource}")
    
    def load_category_resources(self):
        """Load resources specific to category pages"""
        # These might include category-specific API calls or resources
        resources = [
            "/api/categories/bracelets/products?page=1",
            "/api/filters/bracelets",
            "/static/images/category-banners/bracelets.jpg"
        ]
        
        for resource in resources:
            self.client.get(resource, name=f"Category Resource: {resource}")


class MobileUser(FrontendUser):
    """Represents mobile users with different behavior patterns"""
    
    @task(8)  # Mobile users visit homepage
    def browse_homepage(self):
        # Add mobile user agent
        headers = self.get_mobile_headers()
        
        with self.client.get("/", headers=headers, name="Mobile Homepage") as response:
            if response.status_code == 200:
                self.load_static_resources()
    
    @task(10)  # Mobile users actually browse shop more frequently
    def browse_shop(self):
        headers = self.get_mobile_headers()
        
        with self.client.get("/shop", headers=headers, name="Mobile Shop Page") as response:
            if response.status_code == 200:
                self.load_static_resources()
    
    @task(7)
    def browse_bracelet_category(self):
        headers = self.get_mobile_headers()
        
        with self.client.get("/category/bracelets", headers=headers, name="Mobile Bracelets Category") as response:
            if response.status_code == 200:
                self.load_category_resources()
    
    def get_mobile_headers(self):
        """Return mobile specific headers"""
        return {
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
            "X-Device-Type": "mobile"
        }
                
    def load_static_resources(self):
        """Mobile users load fewer resources"""
        resources = [
            "/static/css/mobile.css",
            "/static/js/mobile-bundle.js",
            "/api/initial-data"
        ]
        
        for resource in resources:
            self.client.get(resource, name=f"Mobile Resource: {resource}")
    
    def load_category_resources(self):
        """Mobile-specific category resources"""
        resources = [
            "/api/categories/bracelets/products?page=1&mobile=true",
            "/api/filters/bracelets?simplified=true"
        ]
        
        for resource in resources:
            self.client.get(resource, name=f"Mobile Category Resource: {resource}")