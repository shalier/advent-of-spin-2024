from spin_sdk import http, key_value
from dataclasses import dataclass, field
from typing import List, Optional, Tuple
import json

@dataclass
class Wishlist:
    name: str
    items: List[str]

@dataclass
class WishlistCollection:
    wishlists: List[Wishlist] = field(default_factory=list)

def handle_request(req: http.Request) -> http.Response:
    try:
        # Open the default key-value store
        store = key_value.Store.open_default()
        
        method = req.method
        status = 200
        body = None

        if method == http.Method.POST:
            try:
                # Parse the new wishlist from request body
                new_wishlist = Wishlist(**json.loads(req.body))
                
                # Get existing wishlists or create new collection
                collection = WishlistCollection()
                existing_data = store.get(req.path)
                if existing_data:
                    collection = WishlistCollection(**json.loads(existing_data))
                
                # Add new wishlist to collection
                collection.wishlists.append(new_wishlist)
                
                # Convert back to JSON and store
                json_string = json.dumps(collection.__dict__)
                store.set(req.path, json_string.encode())
                
                print(f"Added new wishlist to collection at key {req.path}")
                status = 201
                
            except json.JSONDecodeError:
                status = 400

        elif method == http.Method.GET:
            # Get the value associated with the request URI
            value = store.get(req.path)
            if value:
                print(f"Found value for the key {req.path}")
                status = 200
                body = value
            else:
                print(f"No value found for the key {req.path}")
                status = 404

        elif method == http.Method.DELETE:
            # Delete the value associated with the request URI
            store.delete(req.path)
            print(f"Delete key {req.path}")
            status = 200

        elif method == http.Method.HEAD:
            # Like GET, except do not return the value
            if store.exists(req.path):
                print(f"{req.path} key found")
                status = 200
            else:
                print(f"{req.path} key not found")
                status = 404

        else:
            # No other methods are currently supported
            status = 405

        return http.Response(status, body)

    except Exception as e:
        print(f"Error handling request: {str(e)}")
        return http.Response(500, None)