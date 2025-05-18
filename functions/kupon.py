import functions_framework
import random
import string
import time

@functions_framework.http
def generate_voucher_code(request):
    """HTTP Cloud Function that generates random voucher codes.
    
    Args:
        request (flask.Request): The request object.
        
    Returns:
        A dictionary containing the generated voucher code.
    """
    # Set CORS headers for the preflight request
    if request.method == 'OPTIONS':
        # Allows GET requests from any origin with the Content-Type
        # header and caches preflight response for 3600s
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)
    
    # Set CORS headers for the main request
    headers = {
        'Access-Control-Allow-Origin': '*'
    }
    # Parse request parameters (if any)
    request_json = request.get_json(silent=True)
    request_args = request.args
    
    # Get parameters with defaults if not specified
    length = 12  # Default length
    prefix = "GCP-"  # Default prefix
    
    # Check if length was provided in request
    if request_json and 'length' in request_json:
        length = int(request_json['length'])
    elif request_args and 'length' in request_args:
        length = int(request_args['length'])
        
    # Check if prefix was provided in request
    if request_json and 'prefix' in request_json:
        prefix = request_json['prefix']
    elif request_args and 'prefix' in request_args:
        prefix = request_args['prefix']
    
    # Generate a random code
    characters = string.ascii_uppercase + string.digits
    random_part = ''.join(random.choice(characters) for _ in range(length))
    
    # Add timestamp component for uniqueness (last 4 digits of current timestamp)
    timestamp_part = str(int(time.time()))[-4:]
    
    # Combine parts into final voucher code
    voucher_code = f"{prefix}{random_part}-{timestamp_part}"
    
    # Return the generated code
    return ({
        "code": voucher_code,
        "created": time.time(),
        "length": length,
        "prefix": prefix
    },headers)