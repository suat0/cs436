from locust import HttpUser, task, between
import random
import logging

class FrontendUser(HttpUser):
    # Wait between 1 and 5 seconds between tasks
    wait_time = between(1, 5)
    
    def on_start(self):
        """Initialize user session - runs when user starts"""
        logging.info("New user started browsing the homepage")
    
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
    
    @task(3)  # Weight of 3 - happens less often
    def refresh_homepage(self):
        """Simulate a user refreshing the homepage"""
        self.client.get("/", name="Homepage Refresh")
    
    def load_static_resources(self):
        """Load common static resources found on the homepage"""
        # These are typical resources found on many homepages
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


class MobileUser(FrontendUser):
    """Represents mobile users with different behavior patterns"""
    
    @task(15)  # Mobile users tend to just visit homepage more
    def browse_homepage(self):
        # Add mobile user agent
        headers = {
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
        }
        
        with self.client.get("/", headers=headers, name="Mobile Homepage") as response:
            if response.status_code == 200:
                self.load_static_resources()
                
    def load_static_resources(self):
        """Mobile users load fewer resources"""
        resources = [
            "/static/css/mobile.css",
            "/static/js/mobile-bundle.js",
            "/api/initial-data"
        ]
        
        for resource in resources:
            self.client.get(resource, name=f"Mobile Resource: {resource}")


# To run this test:
# locust -f locust_script.py --host=http://34.32.72.13/