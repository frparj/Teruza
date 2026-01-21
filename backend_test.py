import requests
import sys
import json
from datetime import datetime

class TeruzoAPITester:
    def __init__(self, base_url="https://br-dashboard.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                details = f"Expected {expected_status}, got {response.status_code}. Response: {response.text[:200]}"
                self.log_test(name, False, details)
                return False, {}

        except Exception as e:
            details = f"Request failed: {str(e)}"
            self.log_test(name, False, details)
            return False, {}

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@teruza.com", "password": "password123"}
        )
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_get_me(self):
        """Test get current user"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_get_products(self):
        """Test get all products"""
        success, response = self.run_test(
            "Get All Products",
            "GET",
            "products",
            200
        )
        if success:
            print(f"   Found {len(response)} products")
        return success, response

    def test_get_categories(self):
        """Test get categories"""
        success, response = self.run_test(
            "Get Categories",
            "GET",
            "categories",
            200
        )
        if success:
            categories = response.get('categories', [])
            print(f"   Found categories: {categories}")
        return success

    def test_create_product(self):
        """Test create product"""
        product_data = {
            "active": True,
            "featured": False,
            "type": "product",
            "category": "Test Category",
            "price": 15.99,
            "currency": "BRL",
            "name_pt": "Produto Teste",
            "name_en": "Test Product",
            "name_es": "Producto Prueba",
            "desc_pt": "Descrição do produto teste",
            "desc_en": "Test product description",
            "desc_es": "Descripción del producto de prueba"
        }
        
        success, response = self.run_test(
            "Create Product",
            "POST",
            "products",
            200,
            data=product_data
        )
        
        if success and 'id' in response:
            self.test_product_id = response['id']
            print(f"   Created product with ID: {self.test_product_id}")
            return True
        return False

    def test_get_single_product(self):
        """Test get single product"""
        if not hasattr(self, 'test_product_id'):
            self.log_test("Get Single Product", False, "No test product ID available")
            return False
            
        success, response = self.run_test(
            "Get Single Product",
            "GET",
            f"products/{self.test_product_id}",
            200
        )
        return success

    def test_update_product(self):
        """Test update product"""
        if not hasattr(self, 'test_product_id'):
            self.log_test("Update Product", False, "No test product ID available")
            return False
            
        update_data = {
            "price": 19.99,
            "featured": True
        }
        
        success, response = self.run_test(
            "Update Product",
            "PUT",
            f"products/{self.test_product_id}",
            200,
            data=update_data
        )
        return success

    def test_delete_product(self):
        """Test delete product"""
        if not hasattr(self, 'test_product_id'):
            self.log_test("Delete Product", False, "No test product ID available")
            return False
            
        success, response = self.run_test(
            "Delete Product",
            "DELETE",
            f"products/{self.test_product_id}",
            200
        )
        return success

    def test_products_with_filters(self):
        """Test products with various filters"""
        # Test category filter
        success1, _ = self.run_test(
            "Get Products by Category",
            "GET",
            "products?category=Bebidas",
            200
        )
        
        # Test type filter
        success2, _ = self.run_test(
            "Get Products by Type",
            "GET",
            "products?type=product",
            200
        )
        
        # Test featured filter
        success3, _ = self.run_test(
            "Get Featured Products",
            "GET",
            "products?featured=true",
            200
        )
        
        return success1 and success2 and success3

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Teruza Hostel Mini Mercado API Tests")
        print("=" * 60)
        
        # Test authentication
        if not self.test_admin_login():
            print("❌ Authentication failed, stopping tests")
            return False
            
        self.test_get_me()
        
        # Test product endpoints
        self.test_get_products()
        self.test_get_categories()
        self.test_products_with_filters()
        
        # Test CRUD operations
        if self.test_create_product():
            self.test_get_single_product()
            self.test_update_product()
            self.test_delete_product()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed. Check details above.")
            return False

def main():
    tester = TeruzoAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    results = {
        "timestamp": datetime.now().isoformat(),
        "total_tests": tester.tests_run,
        "passed_tests": tester.tests_passed,
        "success_rate": f"{(tester.tests_passed/tester.tests_run)*100:.1f}%" if tester.tests_run > 0 else "0%",
        "test_details": tester.test_results
    }
    
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())